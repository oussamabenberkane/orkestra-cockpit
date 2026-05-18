# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Stack

- **Next.js 16.2** (App Router) on **React 19**, TypeScript strict mode, path alias `@/* → ./src/*`.
- **Tailwind CSS v4** via `@tailwindcss/postcss`. There is no `tailwind.config.{js,ts}` — design tokens live in [src/app/globals.css](src/app/globals.css) using `@theme inline { ... }` and CSS variables on `:root`. Do not create a Tailwind config file; extend tokens by editing `globals.css`.
- **shadcn/ui** with the `base-nova` style on top of **`@base-ui/react`** primitives (not Radix). See [components.json](components.json). When adding UI components from shadcn, they will be wired to `@base-ui/react` — do not import from `@radix-ui/*`.
- **Fonts:** Manrope (`--font-sans`) and JetBrains Mono (`--font-mono`), loaded once in [src/app/layout.tsx](src/app/layout.tsx) via `next/font/google`. The app `lang` is `fr`.
- **Icons:** `lucide-react`. **Animation:** `framer-motion`. **Class merging:** `cn()` in [src/lib/utils.ts](src/lib/utils.ts).
- **AI SDK:** Vercel AI SDK v4 with `@ai-sdk/mistral` (default model `mistral-large-latest`). `@ai-sdk/google` is kept as a commented alternative in [src/agent/runtime.ts](src/agent/runtime.ts). `MISTRAL_API_KEY` env required for `/api/agent` and `/chat`.
- **Data:** demo CSVs in [data/](data/) loaded with `papaparse` and cached in memory by [src/agent/data/loader.ts](src/agent/data/loader.ts). `sql.js` is wired in [src/agent/data/sqljs-adapter.ts](src/agent/data/sqljs-adapter.ts) but the dataset loader uses CSVs.
- Package manager: **pnpm** (lockfile + `pnpm-workspace.yaml` present, though this is a single-package repo).

## Commands

```bash
pnpm dev      # next dev — http://localhost:3000
pnpm build    # next build
pnpm start    # next start (after build)
```

There is no lint, test, or typecheck script configured. For typechecking run `pnpm exec tsc --noEmit`.

## Architecture

This is a single-page BFSI cockpit demo for "Cabinet Müller & Associés SA" (French/Swiss insurance brokerage). The dashboard surface is a static prototype — figures are hardcoded inline or in [src/lib/modal-data.ts](src/lib/modal-data.ts). The AI agent surface (`/chat` and the `/api/agent` route) is real: it streams responses from Mistral and answers questions over the demo CSVs.

**Routes** ([src/app/](src/app/)):
- `/` → [page.tsx](src/app/page.tsx) — minimal landing (Malyz brand mark + tagline + "Accéder au cockpit →" → `/login`). Temporary placeholder; intended to be replaced by a marketing page later.
- `/login` → [login/page.tsx](src/app/login/page.tsx) — split layout: dark navy `BrandPanel` on the left (42% on `md+`, hidden below), `LoginCard` on the right. Form simulates auth and routes to `/dashboard`.
- `/dashboard` → [dashboard/page.tsx](src/app/dashboard/page.tsx) — **client component** that owns the unified shell: `<Sidebar>` + scroll `<main>` with Hero panel + 3 satellite KPIs + "Trois choses aujourd'hui" + 6 domain tiles + footer. Modal state (`ModalKey | null`), sidebar collapse, command palette, and period toggle all live here.
- `/rapports` → [rapports/page.tsx](src/app/rapports/page.tsx) — Vue d'ensemble reports index with filter chips and per-report cards. Uses the same `<Sidebar>` shell. `/rapports/[id]` for detail view.
- `/chat` → [chat/page.tsx](src/app/chat/page.tsx) — **full-screen** LLM chat harness (no sidebar/shell). Talks to `/api/agent` via the `?stream=text` mode. Includes conversation history, memory store, tool-call inspection, voice input.
- `/api/agent` → [api/agent/route.ts](src/app/api/agent/route.ts) — POST streaming + `?mode=once` + `?stream=text` variants. GET is a health/dataset smoke-check. `export const runtime = "nodejs"` because the CSV loader uses `node:fs`.

**Shell composition** — `/dashboard` and `/rapports` share the same shell:

```
<Sidebar />  | <main>
              |   greeting row + source badges
              |   HeroPanel + 3 SatelliteKPI            (dashboard only)
              |   TroisChoses                            (dashboard only)
              |   filter strip + report cards           (rapports only)
              |   6 TileCards (3-col grid)              (dashboard only)
              |   footer
```

`<Sidebar>` in [src/components/dashboard/Sidebar.tsx](src/components/dashboard/Sidebar.tsx) collapses to 64px with hover-to-peek + click-to-pin. Each nav item has a **category-coloured icon** (Prospection → accent indigo, Portefeuille → info blue, Sinistres → danger red, Finance → warn orange, etc., mirroring the dashboard tile palette). Active items pop into a white pill with `var(--tier-1)` shadow. Métier items (`prospection`, `portefeuille`, `sinistres`, `finance`, `agents`) open dashboard modals via the `onOpenModal` prop; route items (`/dashboard`, `/rapports`, `/chat`) use `<Link>`. Items without `href` or `modalKey` (Rapports, Alertes, Paramètres, Support) are inert placeholders to be promoted later.

**Modal content** for the seven tiles/agents is centralized in [src/lib/modal-data.ts](src/lib/modal-data.ts), keyed by `ModalKey` (`finance | vue360 | sinistres | prospection | portefeuille | agents | rapport`). The single `<DashboardModal>` in [src/components/dashboard/DashboardModal.tsx](src/components/dashboard/DashboardModal.tsx) (promoted from the former `ApertureModal`) renders content based on the active key. To add a new modal: extend `ModalKey` in [src/lib/types.ts](src/lib/types.ts), add an entry to `modalData`, then reference the key from a `<TileCard>`, a sidebar `modalKey`, or the command palette.

**`<ChatDock>`** ([src/components/dashboard/ChatDock.tsx](src/components/dashboard/ChatDock.tsx)) is a floating chat pill currently used only by `/rapports`. The dashboard does **not** render it — the global chat surface is `/chat`. `<ChatDockProvider>` wraps any page that uses `<ChatDock>`; the dock auto-sends seeded prompts via `openDock(seed)`.

**Agent boundary** — `src/agent/` is self-contained and must not import from `src/app/`, `src/components/`, or `src/lib/`. The dashboard UI must not import from `src/agent/` either. Both sides talk only through `/api/agent`. See [src/agent/README.md](src/agent/README.md).

**Design tokens** live in [src/app/globals.css](src/app/globals.css):
- `:root` declares `--bg`, `--surface`, `--surface-2/3`, `--text` thru `--text-4`, `--accent` (`#5856D6`) + `--accent-2/-tint/-tint-2`, the semantic colors (`--success`, `--warn`, `--danger`, `--info`, `--purple`) with `*-tint` variants, the per-category nav colors (`--nav-prospection`, `--nav-portefeuille`, …), and the elevation tokens (`--tier-1`, `--tier-2`, `--tier-press`).
- `@theme inline { ... }` mirrors selected tokens as `--color-*` for Tailwind utility access.
- Components heavily use **inline `style={{ ... }}`** with these CSS variables, not Tailwind utility classes. Match this style when editing existing components rather than refactoring to Tailwind. Use Tailwind only where the surrounding code already does (mostly `cn()`-based UI primitives in [src/components/ui/](src/components/ui/)).
- Responsive helpers: `.dashboard-hero`, `.dashboard-tiles`, `.dashboard-kpis`, `.app-sidebar` (collapsed below 720px) — defined in `globals.css`. Prefer these to introducing new media queries.

**Dialogs** wrap `@base-ui/react`'s `Dialog` primitive in [src/components/ui/dialog.tsx](src/components/ui/dialog.tsx). `DashboardModal` is the only application dialog driven by `modalKey` — opening a tile or sidebar item sets the key, closing sets it to `null`.

## Commit Convention

This project follows a **strict, concise commit message format**.

### Format

```
<type>: <short imperative description>
```

- Single line only — no body unless the change is genuinely complex or the decision needs context
- Imperative mood, capitalised: "Add", "Fix", "Update" — not "Added" or "Fixes"
- One logical change per commit

❗ **Never add:**
- `Co-Authored-By` or any trailer/footer
- AI / bot attribution (Claude, ChatGPT, etc.)
- Sign-offs or explanatory paragraphs

> Commits must reflect **human ownership**.

### Allowed Types

| Type       | When to use                                       |
| ---------- | ------------------------------------------------- |
| `feat`     | New features or user-facing functionality         |
| `fix`      | Bug fixes                                         |
| `refactor` | Code changes that don't add features or fix bugs  |
| `chore`    | Maintenance tasks (deps, configs, tooling)        |
| `docs`     | Documentation-only changes                        |
| `test`     | Adding or updating tests                          |

### Valid Examples

```
feat: Add KPI sparkline to dashboard header
fix: Correct modal close behaviour on Escape key
refactor: Extract brand tokens to globals.css
chore: Move demo CSV files to data/
docs: Update CLAUDE.md with commit conventions
```

### Invalid Examples

❌ Too verbose
```
feat: Add KPI sparkline component with animated SVG path to dashboard header
```

❌ Past tense
```
fix: Fixed modal close behaviour on Escape key
```

❌ Missing type
```
Add KPI sparkline to dashboard header
```

❌ AI attribution trailer
```
feat: Add KPI sparkline to dashboard header

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

## Conventions worth knowing

- Components that own state or use hooks must start with `"use client"`. The `/dashboard` page is a client component because it owns modal/sidebar/period state — keep new stateful additions inside child client components when you can, rather than promoting the page.
- Copy is in **French**. Keep French strings when editing user-facing labels.
- Sidebar collapse state is persisted in `localStorage` under the key `orkestra.sidebar.collapsed`. The same key is used by `/dashboard` and `/rapports/[id]` so the user's choice carries across routes.
- The icon color for a sidebar nav item is set per-item via the `iconColor` field on the `NavItemData` entry in [src/components/dashboard/Sidebar.tsx](src/components/dashboard/Sidebar.tsx). To add a new item, point its `iconColor` at one of the `--nav-*` tokens in `globals.css`.
- The hex-grid background animation (`hex-grid-bg`) on the login `BrandPanel` is driven by the `hexFloat` keyframes in `globals.css`. Don't recreate them inline.
- Logout always routes to `/login` (not `/`). Use `router.push("/login")` rather than `router.push("/")`.
