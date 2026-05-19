# Agent 04 — Seed Contrats

**Supabase project:** `jadehnrmhmsvznsiyquo`
**Wave:** 4 (parallel with agent-07)
**Prerequisites:** agent-02 (compagnies exist) + agent-03 (clients exist)
**Tools:** `execute_sql`, Read
**CSV source:** `data/DEMO contrats.csv` (188 rows)

---

## Goal

Parse `DEMO contrats.csv` and insert all 188 rows into the `contrats` table.
Foreign keys `client_id` and `compagnie_id` must be resolved from `legacy_id` columns — do NOT hardcode UUIDs.

---

## Step 1 — Verify prerequisites

```sql
SELECT
  (SELECT COUNT(*) FROM clients)    AS clients,
  (SELECT COUNT(*) FROM compagnies) AS compagnies;
```

Both must be non-zero before continuing.

---

## Step 2 — Read the CSV

Read `data/DEMO contrats.csv`. Headers:
```
id, client_id, courtier_id, compagnie_id, compagnie_nom, numero_police,
branche, statut, date_debut, date_echeance, periodicite, prime_annuelle,
commission_taux, commission_annuelle, source
```

---

## Step 3 — Build the seed query

Use a `WITH` clause to resolve all FKs in one query. Do not resolve FKs row-by-row.

Pattern to follow:
```sql
WITH
  courtier AS (SELECT id FROM courtiers LIMIT 1),
  client_map AS (SELECT legacy_id, id FROM clients),
  compagnie_map AS (SELECT legacy_id, id FROM compagnies)
INSERT INTO contrats (
  courtier_id, client_id, compagnie_id, legacy_id, compagnie_nom,
  numero_police, branche, statut, date_debut, date_echeance, periodicite,
  prime_annuelle, commission_taux, commission_annuelle, source
)
SELECT
  courtier.id,
  cm.id,
  comp.id,
  v.legacy_id,
  v.compagnie_nom,
  v.numero_police,
  v.branche,
  v.statut,
  v.date_debut::DATE,
  v.date_echeance::DATE,
  v.periodicite,
  v.prime_annuelle::NUMERIC,
  v.commission_taux::NUMERIC,
  v.commission_annuelle::NUMERIC,
  v.source
FROM courtier,
(VALUES
  ('POL0001', 'CLT001', 'CMP005', 'Generali',    'GEN-819030', 'cyber',                  'résilié', '2025-05-04', '2028-03-26', 'annuel',       6329,  14, 886,  'reseau'),
  ('POL0002', 'CLT001', 'CMP003', 'Helvetia',     'HEL-216628', 'accident',               'résilié', '2026-02-16', '2027-09-15', 'trimestriel', 17467,  18, 3144, 'recommandation'),
  -- … all 188 rows from the CSV
) AS v(legacy_id, client_legacy, compagnie_legacy, compagnie_nom, numero_police,
       branche, statut, date_debut, date_echeance, periodicite,
       prime_annuelle, commission_taux, commission_annuelle, source)
JOIN client_map    cm   ON cm.legacy_id   = v.client_legacy
JOIN compagnie_map comp ON comp.legacy_id = v.compagnie_legacy
ON CONFLICT (legacy_id) DO NOTHING;
```

Generate this full VALUES list from all 188 rows of the CSV.

Column mapping:

| CSV column | Values alias | Notes |
|---|---|---|
| `id` | `legacy_id` | stored as `legacy_id` in the table |
| `client_id` | `client_legacy` | used to JOIN → `clients.legacy_id` |
| `compagnie_id` | `compagnie_legacy` | used to JOIN → `compagnies.legacy_id` |
| `compagnie_nom` | `compagnie_nom` | denormalized display name |
| `courtier_id` | *(ignored)* | use courtier from `WITH` clause |
| `branche` | `branche` | as-is |
| `statut` | `statut` | as-is |
| `periodicite` | `periodicite` | as-is |
| `prime_annuelle` | `prime_annuelle` | NUMERIC |
| `commission_taux` | `commission_taux` | NUMERIC |
| `commission_annuelle` | `commission_annuelle` | NUMERIC |
| `date_debut` | `date_debut` | cast to DATE |
| `date_echeance` | `date_echeance` | cast to DATE |
| `source` | `source` | as-is |

---

## Step 4 — Verify

```sql
SELECT COUNT(*) FROM contrats;
```

Expected: 188.

Also spot-check a FK join:
```sql
SELECT co.legacy_id, cl.raison_sociale, comp.nom
FROM contrats co
JOIN clients cl ON cl.id = co.client_id
JOIN compagnies comp ON comp.id = co.compagnie_id
LIMIT 5;
```

All rows should have non-null client and compagnie names.

---

## Done

Report the count and whether the FK spot-check returned valid rows.
Do not seed primes/sinistres/renouvellements — that is agent-05's job.
