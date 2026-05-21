# Implementation brief: Auth completion + Memory migration

## Tooling

Use the **Supabase MCP server** for all database operations — creating tables, enabling RLS, writing policies, and running SQL. Do not use the Supabase dashboard manually or write raw migration files. The MCP server gives you direct access to the live project; prefer it over guessing SQL syntax.

---

## Context

This is a Next.js 15 App Router project (React 19, TypeScript strict, Tailwind v4, shadcn/ui on `@base-ui/react`). It is a BFSI cockpit demo for "Helvebroker". Read `CLAUDE.md` fully before touching any file — it documents stack choices, routing conventions, design token usage, and commit format rules.

## What is already done — do not redo it

- **Supabase project** is live. `NEXT_PUBLIC_SUPABASE_URL` and keys are in `.env.local`.
- **Browser client** — `src/lib/supabase.ts` exports `supabase` via `createBrowserClient` from `@supabase/ssr`.
- **Server client** — `src/lib/supabase-server.ts` exports `supabaseServer` using the service role key (bypasses RLS, server-only).
- **Middleware** — `src/middleware.ts` already uses `createServerClient` to check `supabase.auth.getUser()` and redirects unauthenticated users to `/login`. Public paths: `/`, `/login`, `/api/*`.
- **Login form** — `src/components/login/LoginCard.tsx` already calls `supabase.auth.signInWithPassword({ email, password })` and redirects to `/dashboard` on success. Demo button fills `mirko@helvebroker.ch` / `Cockpit2026`.
- **Memory interface** — `src/agent/memory/store.ts` defines a `MemoryStore` interface (`list`, `save`, `update`, `remove`) and a `LocalStorageMemoryStore` implementation. The `getMemoryStore()` factory returns a singleton. The comment in the file explicitly anticipates swapping to Postgres.
- **Memory types** — `src/agent/memory/types.ts` defines `Memory`, `MemoryInput`, `MemoryKind` (`preference | watch | saved-view | note`).

---

## What needs to be implemented

### 1. Auth context provider

Create `src/components/dashboard/AuthProvider.tsx` — a client component that:
- Subscribes to `supabase.auth.onAuthStateChange` to keep the session in React state.
- Exposes `useAuth()` returning `{ user, session, loading }`.
- On `SIGNED_OUT` event, calls `router.replace("/login")` so any in-app logout propagates immediately.

Mount it in `src/app/layout.tsx` wrapping `AgentConversationProvider` (it needs to be available to all children).

### 2. Wire signOut properly

Currently logout calls `router.replace("/login")` directly without signing out of Supabase, so the session cookie persists and middleware re-admits the user. Fix every logout handler:

- `src/components/dashboard/AppShell.tsx` — `onLogout` prop passed down from the page
- `src/components/dashboard/Sidebar.tsx` — the bottom user avatar / logout button
- `src/app/chat/page.tsx` — `onLogout` callback

Replace the `router.replace("/login")` with:
```ts
await supabase.auth.signOut();
router.replace("/login");
```

### 3. Supabase memory table

Create this table in Supabase (run via the Supabase dashboard SQL editor or a migration file):

```sql
create table public.memories (
  id          text primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  kind        text not null check (kind in ('preference', 'watch', 'saved-view', 'note')),
  name        text not null,
  body        text not null,
  target      text,
  created_at  bigint not null,
  updated_at  bigint not null
);

alter table public.memories enable row level security;

create policy "Users can manage their own memories"
  on public.memories
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

Columns use `bigint` for `created_at` / `updated_at` to match the existing `Memory` type (millisecond timestamps, not ISO strings).

### 4. SupabaseMemoryStore implementation

Add a `SupabaseMemoryStore` class to `src/agent/memory/store.ts` implementing the existing `MemoryStore` interface. It should:
- Use the browser `supabase` client (imported from `@/lib/supabase`).
- On every mutating call (`save`, `update`, `remove`), pass the current session's `user_id` as the `user_id` column value — obtain it via `supabase.auth.getUser()`.
- Map Supabase column names (snake_case) back to the `Memory` type fields (`createdAt`, `updatedAt`).
- Throw a descriptive error if called without an active session.

Update the `getMemoryStore()` factory:
- If the user is authenticated (check `supabase.auth.getSession()`), return a `SupabaseMemoryStore`.
- If not (e.g. during server-side or unauthenticated access), fall back to `LocalStorageMemoryStore`.
- Cache the result per session to avoid re-instantiation on every call.

### 5. Memory migration on first login

When the user signs in and there are existing memories in `localStorage` (key: `orkestra.agent.memories.v1`), migrate them to Supabase once. Do this in `AuthProvider` on the `SIGNED_IN` event:
- Read from localStorage.
- If any records exist, bulk-insert them into Supabase with the current `user_id`.
- Clear the localStorage key after a successful insert.
- Do nothing if localStorage is empty or if Supabase already has rows for this user (check `count` first to avoid duplicates).

### 6. Persist the memory-enabled toggle

Add a `user_settings` table:

```sql
create table public.user_settings (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  memory_enabled boolean not null default true
);

alter table public.user_settings enable row level security;

create policy "Users can manage their own settings"
  on public.user_settings
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

Create `src/lib/agent-settings.ts`:
- `loadAgentSettings(userId: string): Promise<{ memoryEnabled: boolean }>` — reads from `user_settings`, returns defaults if no row exists (upsert on first save).
- `saveAgentSettings(userId: string, settings: { memoryEnabled: boolean }): Promise<void>` — upserts the row.

In `src/app/parametres/page.tsx`, the `AgentsSection` component:
- On mount, call `loadAgentSettings(user.id)` to initialize the `memoire` toggle state.
- On form submit (`onSave`), call `saveAgentSettings(user.id, { memoryEnabled: memoire })`.
- Read the current user from `useAuth()`.

In `src/app/chat/page.tsx`, the local `send` wrapper (around line 491):
- Before calling `providerSend`, call `loadAgentSettings(user.id)` (or read it from a cached state initialized on mount).
- Pass `memories: memoryEnabled ? memories : []`.
- Do not add a new loading state for this — read on mount, cache in a `useRef` or `useState`, refresh after settings save.

---

## Constraints — do not touch these

- `src/agent/runtime.ts` — agent model, temperature, tool list. Out of scope.
- `src/agent/tools/` — no changes.
- `/api/agent` route — no changes.
- The AI model dropdown, temperature slider, and tool checkboxes in `AgentsSection` — leave them as non-functional UI for now. Only the memory toggle gets wired.
- Do not add new modal types, new routes, or new sidebar items.
- Do not touch `globals.css` design tokens.
- Keep all user-facing copy in French.
- Follow the commit format in `CLAUDE.md`: `type: Short imperative description` — single line, no AI attribution trailers.

---

## Key files to read before starting

| File | Why |
|---|---|
| `src/middleware.ts` | Already protects routes — understand what's covered |
| `src/lib/supabase.ts` | Browser client — use this in client components |
| `src/lib/supabase-server.ts` | Server client — do not use in client components |
| `src/agent/memory/store.ts` | Interface + LocalStorage impl to extend |
| `src/agent/memory/types.ts` | `Memory`, `MemoryInput`, `MemoryKind` shapes |
| `src/components/dashboard/AgentConversationProvider.tsx` | Owns `send()` — memory is passed via `opts.memories` |
| `src/app/chat/page.tsx` | Where `send` is wrapped and memories are loaded from the store |
| `src/app/parametres/page.tsx` | Settings page — `AgentsSection` owns the memory toggle |
| `src/components/dashboard/AppShell.tsx` | Logout wiring |
| `src/components/dashboard/Sidebar.tsx` | Logout wiring |

---

## Acceptance criteria

1. Visiting `/dashboard` without a session redirects to `/login` (already works via middleware — verify it still works after changes).
2. Logging in with `mirko@helvebroker.ch` / `Cockpit2026` sets a Supabase session cookie and lands on `/dashboard`.
3. Clicking logout clears the Supabase session — the back button cannot return to `/dashboard`.
4. Memories created in `/chat` appear in the `memories` Supabase table scoped to the user's `user_id`.
5. Memories survive a full browser refresh and re-login (they are in Supabase, not localStorage).
6. Turning off the "Mémoire persistante" toggle in `/parametres` → Agents IA → saving → then sending a message in `/chat` results in `memories: []` being sent to the agent (verifiable in the Network tab of DevTools on the `/api/agent` POST body).
7. Turning the toggle back on restores memory injection.
8. Existing localStorage memories are migrated to Supabase on first login and the localStorage key is cleared.
