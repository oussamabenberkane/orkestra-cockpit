# Agent 08 — Wire Remaining UI to Supabase

**Repo:** `orkestra-cockpit` (Next.js 16, App Router, React 19, TypeScript strict, Tailwind v4)
**Supabase project:** `jadehnrmhmsvznsiyquo`
**Branch:** `main` — commit directly, no PR needed
**Tools:** Read, Edit, Bash (for `pnpm exec tsc --noEmit`)

---

## Context

The Supabase schema, seed data, and KPI views are all live. The dashboard hero panel,
satellite KPIs, and "Trois Choses" are already wired in `src/app/dashboard/page.tsx`
(server component) + `src/app/dashboard/DashboardClient.tsx` (client component).

**What is still hardcoded / not yet wired:**

1. **Tile metrics** — the 6 `TileCard` entries in `src/lib/dashboard-mock.ts` (`tiles` array) still use hardcoded `metric`, `caption`, and `alert` strings. Four of them have live views to pull from.
2. **Modal data** — `src/lib/modal-data.ts` has hardcoded KV-row values (e.g. "11 200 CHF", "68 %"). These should read from the same views the dashboard already queries.
3. **`/alertes` page** — `src/app/alertes/page.tsx` currently renders a `<MockPagePlaceholder>`. It needs to fetch from the `alertes` table and render real rows.
4. **Unread badge on the notification bell** — the bell icon in the sidebar bottom bar shows a hardcoded badge count. Wire it to `fetchUnreadAlertesCount()`.

Do them in this order: tiles → modal data → alertes page → bell badge.

---

## What NOT to touch

- `src/lib/supabase.ts` — anon client, already correct.
- `src/lib/supabase-server.ts` — service role client, already correct.
- `src/app/dashboard/page.tsx` and `DashboardClient.tsx` — hero/satellites/trois already wired; do not refactor them.
- Any component in `src/components/` — only update data sources, never component internals.
- `src/agent/` — the AI agent runtime is a separate boundary; do not touch it.

---

## Available fetchers (already written in `src/lib/dashboard-data.ts`)

```typescript
fetchHeroData(period)       // used by dashboard page
fetchSatelliteValues()      // used by dashboard page
fetchAgentTaskRows()        // used by dashboard page
fetchAlertes()              // ready to use — returns alertes[] ordered by created_at desc
fetchUnreadAlertesCount()   // ready to use — returns number
```

All use `supabaseServer` (service role, bypasses RLS). Add new fetchers to the same file.

---

## Task 1 — Wire tile metrics

Read `src/lib/dashboard-mock.ts` to understand the `TileEntry` shape.
Read `src/app/dashboard/page.tsx` to understand how `initialHero`/`satelliteValues` are passed.

**Add these four fetchers to `src/lib/dashboard-data.ts`:**

```typescript
export async function fetchTileMetrics() {
  const [prospection, portefeuille, sinistres, finance] = await Promise.all([
    supabase.from("v_tile_prospection").select("*").single(),
    supabase.from("v_tile_portefeuille").select("*").single(),
    supabase.from("v_tile_sinistres").select("*").single(),
    supabase.from("v_tile_finance").select("*").single(),
  ]);
  return {
    prospection: prospection.data,
    portefeuille: portefeuille.data,
    sinistres: sinistres.data,
    finance: finance.data,
  };
}
```

**In `src/app/dashboard/page.tsx`**, add `fetchTileMetrics()` to the `Promise.all`, pass the result as a `tileMetrics` prop to `DashboardClient`.

**In `DashboardClient.tsx`**, accept `tileMetrics` and build the live tiles array using this mapping:

| Tile | Source view | metric field | caption | alert |
|---|---|---|---|---|
| Prospection | `v_tile_prospection` | `taux_conversion_pct` + "%" | `total_prospects` + " prospects actifs" | `relances_dues` + " relances dues" if > 0 |
| Portefeuille | `v_tile_portefeuille` | `contrats_actifs` | `primes_totales` formatted as "X K CHF de primes" | `renouvellements_j30` + " renouv. J-30" |
| Sinistres | `v_tile_sinistres` | `dossiers_ouverts` | "ratio " + `ratio_sinistralite_pct` + "% CA" | `sinistre_urgent_ref` + " · " + `plus_ancien_jours` + " j" |
| Finance | `v_tile_finance` | "+" + `encaisse_mois`/1000 rounded + "K" | "commissions " + `commissions_actives`/1000 + " K" | `nb_impayes` + " impayés" if > 0 |

Tiles `Vue d'ensemble` and `Agents IA` have no dedicated view yet — keep their mock values.

If `tileMetrics` is null (DB unavailable), fall back to the mock `tiles` array from `dashboard-mock.ts`.

---

## Task 2 — Wire modal data

Read `src/lib/modal-data.ts` — the KV rows have hardcoded values like `"11 200 CHF"`, `"68 %"`, etc.

**Add a fetcher to `src/lib/dashboard-data.ts`:**

```typescript
export async function fetchModalValues() {
  const [sat, finance, sinistres, prospection, portefeuille] = await Promise.all([
    supabase.from("v_satellites").select("*").single(),
    supabase.from("v_tile_finance").select("*").single(),
    supabase.from("v_tile_sinistres").select("*").single(),
    supabase.from("v_tile_prospection").select("*").single(),
    supabase.from("v_tile_portefeuille").select("*").single(),
  ]);
  return {
    satellites: sat.data,
    finance: finance.data,
    sinistres: sinistres.data,
    prospection: prospection.data,
    portefeuille: portefeuille.data,
  };
}
```

Convert `modal-data.ts` to a function `getModalData(vals)` that accepts these values and returns the same `Record<ModalKey, ModalData>` shape, with the numeric KV-row values replaced by live data. Keep the `title`, `body`, `cta`, and `kind` fields static — only the `value` strings in KV rows change.

Call `getModalData(await fetchModalValues())` in `src/app/dashboard/page.tsx` and pass the result as `modalData` prop to `DashboardClient`. In `DashboardClient`, pass it down to `<DashboardModal modalData={modalData} />`.

Check `src/components/dashboard/DashboardModal.tsx` to confirm the prop name — add `modalData?: Record<ModalKey, ModalData>` if it doesn't exist yet, defaulting to the static import.

---

## Task 3 — Wire the `/alertes` page

Read `src/app/alertes/page.tsx` to see the current placeholder.

Replace the placeholder with a real server component that:
1. Calls `fetchAlertes()` from `@/lib/dashboard-data`
2. Passes the rows to an `AlertesClient` component (create it at `src/app/alertes/AlertesClient.tsx`)

`AlertesClient` should be a `"use client"` component that:
- Has two tabs: **"Non lus"** and **"Tous"** (filter by `lu === false` vs all)
- Renders one card per alert with: coloured left border matching `type` (warn=orange, danger=red, info=blue, good=green), `titre` as heading, `corps` as body, `source` pill, relative time from `created_at`
- Clicking a card marks it as read: call `supabase.from("alertes").update({ lu: true, lu_at: new Date() }).eq("id", row.id)` then refresh with `router.refresh()`
- Tab counts: show unread count as a badge on the "Non lus" tab

Use existing CSS variable tokens (`--warn`, `--danger`, `--info`, `--success`) for the border colours. Match the visual style of the existing sidebar and tile cards — use `var(--surface)` cards with `var(--tier-1)` shadow, `var(--text)` headings, `var(--text-3)` body text.

---

## Task 4 — Wire unread bell badge

Read `src/components/dashboard/Sidebar.tsx`.

Find the bell icon section at the bottom of the sidebar (currently renders a hardcoded badge).
The sidebar receives `onOpenModal` and similar props — check whether it already accepts an `unreadCount` prop. If not, add one: `unreadCount?: number`.

In `src/app/dashboard/page.tsx` (already a server component), add `fetchUnreadAlertesCount()` to the `Promise.all` and pass the result as `unreadCount` to `DashboardClient`, which passes it to `<Sidebar>`.

Do the same in `src/components/dashboard/AppShell.tsx` for the `/alertes`, `/parametres`, `/support` routes — `AppShell` is a client component so it should call `fetchUnreadAlertesCount()` via a `useEffect` + `useState` pattern using the anon `supabase` client (RLS won't block reads here since AppShell runs client-side with no auth session — so either use a Supabase Realtime subscription, or just fetch once on mount).

Actually for AppShell, simpler: add a `unreadCount` prop and have the server pages (`alertes/page.tsx` etc.) pass it down, same pattern as dashboard.

---

## Completion checklist

After all four tasks, run:

```bash
pnpm exec tsc --noEmit
```

Zero errors required. Then commit with:

```
feat: Wire tile metrics, modal values, alertes page, and bell badge to Supabase
```

Report: which tasks completed, any mock values left in place, and anything blocked.
