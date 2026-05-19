# Supabase Migration — Succession Plan

**Project:** `jadehnrmhmsvznsiyquo` (orkestra-cockpit, eu-west-1)
**Total agents:** 7
**Estimated waves:** 5

---

## Succession diagram

```
Wave 1 ──── agent-01-schema          (alone — everything depends on this)
                    │
Wave 2 ──── agent-02-seed-reference  (alone — subsequent seeds need the courtier UUID)
               ┌────┴────┐
Wave 3 ────  A03        A06          (parallel — A03 seeds clients/prospects, A06 creates views)
           clients    kpi-views
           prospects
               ┌────┴────┐
Wave 4 ────  A04        A07          (parallel — A04 seeds contrats, A07 wires the UI)
           contrats   ui-wiring
               │
Wave 5 ──── agent-05-seed-transactions  (alone — needs contrats to exist for FKs)
```

---

## Wave-by-wave instructions

### Wave 1 — Run alone
```
agent-01-schema
```
Creates every table, RLS policy, and the auth trigger. Nothing else can start until this succeeds.

### Wave 2 — Run alone
```
agent-02-seed-reference
```
Creates the demo auth user + courtier row, then seeds `compagnies`, `agent_tasks`, and `alertes`.
All subsequent seed agents resolve the courtier UUID by querying `SELECT id FROM courtiers LIMIT 1`.

### Wave 3 — Run in parallel
```
agent-03-seed-clients-prospects   &   agent-06-kpi-views
```
- A03: inserts clients + prospects from CSV (both only require the courtier FK).
- A06: creates the 8 SQL views (only requires table structures, not data).
No dependency between A03 and A06 — launch simultaneously.

### Wave 4 — Run in parallel
```
agent-04-seed-contrats   &   agent-07-ui-wiring
```
- A04: inserts contrats — requires clients and compagnies to exist (Wave 3 A03 + Wave 2 A02).
- A07: wires the Next.js UI to Supabase — requires views (Wave 3 A06). Does not need seeded data.
No dependency between A04 and A07 — launch simultaneously.

### Wave 5 — Run alone
```
agent-05-seed-transactions
```
Inserts primes (2 517 rows), sinistres (44 rows), renouvellements (18 rows).
All three tables require contrats to exist (Wave 4 A04).

---

## Key conventions used across all agents

| Convention | Value |
|---|---|
| Supabase project ID | `jadehnrmhmsvznsiyquo` |
| Demo user email | `demo@cabinet-muller.ch` |
| Demo user password | `OrkestroDemo2026!` |
| All CSV files | `data/` directory at repo root |
| FK resolution pattern | Every seed agent stores `legacy_id TEXT UNIQUE` on imported tables, resolves FKs via `JOIN … ON legacy_id = '<CSV_ref>'` |
| Courtier UUID lookup | `SELECT id FROM courtiers LIMIT 1` — all seed agents use this, never hardcode |
| Migration tool | `apply_migration` for DDL; `execute_sql` for DML/seeding |

---

## What each agent does NOT touch

| Agent | Leave alone |
|---|---|
| A01 | Does not seed any data |
| A02–A05 | Do not create or alter table structure |
| A06 | Does not touch UI code |
| A07 | Does not touch Supabase schema or seed data |
