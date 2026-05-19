# Agent 07 — UI Wiring (Supabase → Next.js)

**Supabase project:** `jadehnrmhmsvznsiyquo`
**Wave:** 4 (parallel with agent-04)
**Prerequisite:** agent-06 completed (views exist)
**Tools:** Read, Edit, Write, Bash

---

## Goal

Wire the Next.js frontend to Supabase. Replace mock data with live Supabase queries.
Do NOT alter table structure or seed data. Do NOT change any component's props shape — the
dashboard components already accept the exact same types that the views return.

---

## Step 1 — Install supabase-js

```bash
pnpm add @supabase/supabase-js
```

---

## Step 2 — Create Supabase client

Create `src/lib/supabase.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, key);
```

---

## Step 3 — Add env vars

Check if `.env.local` already has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
If not, add them. The values are:

- `NEXT_PUBLIC_SUPABASE_URL=https://jadehnrmhmsvznsiyquo.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=` ← retrieve this by running:
  ```sql
  -- In Supabase dashboard → Settings → API → anon key
  ```
  Or call `mcp__plugin_supabase_supabase__get_publishable_keys` with project_id `jadehnrmhmsvznsiyquo`
  to get the anon key programmatically, then write it to `.env.local`.

---

## Step 4 — Create data fetchers

Create `src/lib/dashboard-data.ts` alongside the existing `dashboard-mock.ts`.
This file exports async functions with the same return shapes as the mock exports.
`dashboard-mock.ts` stays untouched for now — the page will switch which file it imports.

```typescript
// src/lib/dashboard-data.ts
"use server";
import { supabase } from "./supabase";
import type { Period } from "./dashboard-mock";

// ── Hero (period-aware) ──────────────────────────────────────────────────────

export async function fetchHeroData(period: Period) {
  if (period === "M") {
    const { data } = await supabase
      .from("v_hero_mensuel")
      .select("mois_label, ca_mensuel")
      .order("mois");
    const months = (data ?? []).map((r) => r.mois_label);
    const values = (data ?? []).map((r) => Number(r.ca_mensuel));
    const latest = values.at(-1) ?? 0;
    return {
      title: "Chiffre d'affaires",
      combinedBadge: true,
      value: latest >= 1000 ? `${(latest / 1000).toFixed(0)} K` : String(latest),
      unit: "CHF",
      yoyLabel: null,   // compute yoy from the data if needed later
      data: values,
      months,
      events: [],       // events can be derived from primes outliers later
    };
  }
  if (period === "T") {
    const { data } = await supabase
      .from("v_hero_trimestriel")
      .select("trimestre_label, ca_trimestriel")
      .order("trimestre");
    const months = (data ?? []).map((r) => r.trimestre_label);
    const values = (data ?? []).map((r) => Number(r.ca_trimestriel));
    const latest = values.at(-1) ?? 0;
    return {
      title: "Chiffre d'affaires",
      combinedBadge: true,
      value: latest >= 1000 ? `${(latest / 1000).toFixed(0)} K` : String(latest),
      unit: "CHF",
      yoyLabel: null,
      data: values,
      months,
      events: [],
    };
  }
  // period === "A"
  const { data } = await supabase
    .from("v_hero_annuel")
    .select("annee_label, ca_annuel")
    .order("annee");
  const months = (data ?? []).map((r) => r.annee_label);
  const values = (data ?? []).map((r) => Number(r.ca_annuel));
  const latest = values.at(-1) ?? 0;
  return {
    title: "Chiffre d'affaires",
    combinedBadge: true,
    value: latest >= 1_000_000
      ? `${(latest / 1_000_000).toFixed(2)} M`
      : latest >= 1000
      ? `${(latest / 1000).toFixed(0)} K`
      : String(latest),
    unit: "CHF",
    yoyLabel: null,
    data: values,
    months,
    events: [],
  };
}

// ── Satellites ───────────────────────────────────────────────────────────────

export async function fetchSatellites() {
  const { data } = await supabase.from("v_satellites").select("*").single();
  if (!data) return null;
  return {
    marge:     Number(data.marge_pct),
    cashflow:  Number(data.cashflow_net),
    retention: Number(data.retention_pct),
    impayes:   Number(data.impayes_montant),
  };
}

// ── Tiles ────────────────────────────────────────────────────────────────────

export async function fetchTileProspection() {
  const { data } = await supabase.from("v_tile_prospection").select("*").single();
  return data;
}

export async function fetchTilePortefeuille() {
  const { data } = await supabase.from("v_tile_portefeuille").select("*").single();
  return data;
}

export async function fetchTileSinistres() {
  const { data } = await supabase.from("v_tile_sinistres").select("*").single();
  return data;
}

export async function fetchTileFinance() {
  const { data } = await supabase.from("v_tile_finance").select("*").single();
  return data;
}

// ── Agent tasks (Trois Choses) ────────────────────────────────────────────────

export async function fetchAgentTasks() {
  const { data } = await supabase
    .from("agent_tasks")
    .select("*")
    .eq("statut", "pending")
    .order("priority")
    .limit(3);
  return data ?? [];
}

// ── Alertes ───────────────────────────────────────────────────────────────────

export async function fetchAlertes() {
  const { data } = await supabase
    .from("alertes")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function fetchUnreadAlertesCount() {
  const { count } = await supabase
    .from("alertes")
    .select("*", { count: "exact", head: true })
    .eq("lu", false);
  return count ?? 0;
}
```

---

## Step 5 — Update dashboard/page.tsx to use live data

Read `src/app/dashboard/page.tsx`.

At the top of the file, replace the import of `heroByPeriod` / `satellites` / `troisItems` with a fetch inside the component. Because the dashboard page is already a client component (`"use client"`), call the fetchers via `useEffect` + `useState`, or convert the page to a Server Component wrapper that passes data down as props.

**Recommended approach (least disruption):** Create a thin server wrapper.

1. Rename `src/app/dashboard/page.tsx` → `src/app/dashboard/DashboardClient.tsx`, keep `"use client"` directive and all existing state/logic. Change it to accept a `initialData` prop:
   ```typescript
   interface DashboardClientProps {
     initialHero: Record<Period, HeroDataset>;
     initialSatellites: Satellite[];
     initialTroisItems: TroisItem[];
   }
   ```
   Replace the static imports of `heroByPeriod`, `satellites`, `troisItems` with the prop values.

2. Create the new `src/app/dashboard/page.tsx` as a Server Component:
   ```typescript
   import { fetchHeroData, fetchSatellites, fetchAgentTasks } from "@/lib/dashboard-data";
   import DashboardClient from "./DashboardClient";
   import { tiles, sourceBadges } from "@/lib/dashboard-mock"; // non-KPI data stays in mock

   export default async function DashboardPage() {
     const [heroM, heroT, heroA, satelliteData, tasks] = await Promise.all([
       fetchHeroData("M"),
       fetchHeroData("T"),
       fetchHeroData("A"),
       fetchSatellites(),
       fetchAgentTasks(),
     ]);
     // Map DB tasks to TroisItem shape
     // Map satellite data to Satellite[] shape
     return (
       <DashboardClient
         initialHero={{ M: heroM, T: heroT, A: heroA }}
         initialSatellites={/* mapped */}
         initialTroisItems={/* mapped from tasks */}
       />
     );
   }
   ```

Do NOT refactor the tile cards or modal data in this agent — that is follow-on work.

---

## Step 6 — Verify the app still builds

```bash
pnpm exec tsc --noEmit
```

Fix any TypeScript errors. The component prop shapes in `HeroDataset`, `Satellite`, and `TroisItem` must not change — adapt the mapping layer in the server page if needed.

---

## Step 7 — Test in browser

```bash
pnpm dev
```

Open `http://localhost:3000/dashboard`. Confirm:
- Hero panel loads with real month labels and bars.
- Satellite KPIs show numbers (not "—" or undefined).
- "Trois Choses" shows 3 task rows.
- No console errors from Supabase.

---

## Done

Report: whether the build passes, what data appears in the dashboard, and any mapping issues encountered.
Note any mock data that is still in place and needs a follow-on ticket to replace.
