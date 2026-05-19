# Agent 05 — Seed Transactions (Primes, Sinistres, Renouvellements)

**Supabase project:** `jadehnrmhmsvznsiyquo`
**Wave:** 5 (run alone, last seed wave)
**Prerequisite:** agent-04 completed (contrats exist)
**Tools:** `execute_sql`, Read
**CSV sources:**
  - `data/DEMO primes.csv` (2 517 rows)
  - `data/DEMO sinistres.csv` (44 rows)
  - `data/DEMO renouvellements.csv` (18 rows)

---

## Goal

Seed the three transactional tables. All three depend on `contrats` (and `clients`) existing.
Use `legacy_id` joins for FK resolution — never hardcode UUIDs.

Run the three inserts in this order: primes → sinistres → renouvellements.

---

## Step 1 — Verify prerequisites

```sql
SELECT COUNT(*) FROM contrats;
```
Must be 188. Abort if zero.

---

## Step 2 — Seed primes (2 517 rows)

Read `data/DEMO primes.csv`. Headers:
```
id, contrat_id, client_id, date_emission, date_echeance,
montant_brut, montant_net, statut, date_encaissement
```

Column mapping:

| CSV column | Handling |
|---|---|
| `id` | → `legacy_id` |
| `contrat_id` | → JOIN `contrats.legacy_id` to resolve `contrat_id` UUID |
| `client_id` | → JOIN `clients.legacy_id` to resolve `client_id` UUID |
| `date_emission` | → DATE |
| `date_echeance` | → DATE |
| `montant_brut` | → NUMERIC |
| `montant_net` | → NUMERIC |
| `statut` | → as-is (`encaissée`, `en_attente`, `impayée`) |
| `date_encaissement` | → DATE, empty string → NULL |

Because 2 517 rows is large, split the insert into batches of ~500 rows to avoid hitting query size limits. Use the same `WITH`-join pattern for each batch:

```sql
WITH
  courtier     AS (SELECT id FROM courtiers LIMIT 1),
  contrat_map  AS (SELECT legacy_id, id FROM contrats),
  client_map   AS (SELECT legacy_id, id FROM clients)
INSERT INTO primes (
  courtier_id, contrat_id, client_id, legacy_id,
  date_emission, date_echeance, montant_brut, montant_net,
  statut, date_encaissement
)
SELECT
  courtier.id,
  cm.id,
  cl.id,
  v.legacy_id,
  v.date_emission::DATE,
  v.date_echeance::DATE,
  v.montant_brut::NUMERIC,
  v.montant_net::NUMERIC,
  v.statut,
  NULLIF(v.date_encaissement, '')::DATE
FROM courtier,
(VALUES
  ('PRM00001', 'POL0001', 'CLT001', '2025-05-04', '2025-06-04', 527, 501, 'encaissée', '2025-05-19'),
  -- … batch of ~500 rows
) AS v(legacy_id, contrat_legacy, client_legacy, date_emission, date_echeance,
       montant_brut, montant_net, statut, date_encaissement)
JOIN contrat_map cm ON cm.legacy_id = v.contrat_legacy
JOIN client_map  cl ON cl.legacy_id = v.client_legacy
ON CONFLICT (legacy_id) DO NOTHING;
```

Run as many batches as needed (5-6 for 2 517 rows at 500 per batch).

Verify after all batches: `SELECT COUNT(*) FROM primes;` → expect 2517.

---

## Step 3 — Seed sinistres (44 rows)

Read `data/DEMO sinistres.csv`. Headers:
```
id, contrat_id, client_id, courtier_id, numero_sinistre, branche,
date_survenance, date_declaration, nature, montant_estime, montant_indemnise,
statut, date_cloture, gestionnaire_id
```

Column mapping:

| CSV column | Handling |
|---|---|
| `id` | → `legacy_id` |
| `contrat_id` | → JOIN `contrats.legacy_id` |
| `client_id` | → JOIN `clients.legacy_id` |
| `courtier_id` | *(ignored)* — use courtier from WITH clause |
| `numero_sinistre` | → as-is |
| `branche` | → as-is |
| `date_survenance` | → DATE |
| `date_declaration` | → DATE |
| `nature` | → as-is |
| `montant_estime` | → NUMERIC |
| `montant_indemnise` | → NUMERIC |
| `statut` | → as-is (`ouvert`, `en_cours`, `clos`) |
| `date_cloture` | → DATE, empty string → NULL |
| `gestionnaire_id` | → as-is text (not a FK) |

Verify: `SELECT COUNT(*) FROM sinistres;` → expect 44.

---

## Step 4 — Seed renouvellements (18 rows)

Read `data/DEMO renouvellements.csv`. Headers:
```
id, contrat_id, client_id, courtier_id, branche, prime_actuelle,
date_echeance, jours_restants, date_relance_1, date_relance_2,
date_relance_3, statut, motif_resiliation
```

Column mapping:

| CSV column | Handling |
|---|---|
| `id` | → `legacy_id` |
| `contrat_id` | → JOIN `contrats.legacy_id` |
| `client_id` | → JOIN `clients.legacy_id` |
| `courtier_id` | *(ignored)* |
| `jours_restants` | *(ignored)* — this is computed live by the view `v_tile_portefeuille` |
| `branche` | → as-is |
| `prime_actuelle` | → NUMERIC |
| `date_echeance` | → DATE |
| `date_relance_1/2/3` | → DATE, empty string → NULL |
| `statut` | → as-is |
| `motif_resiliation` | → NULL if empty |

Verify: `SELECT COUNT(*) FROM renouvellements;` → expect 18.

---

## Step 5 — Final verification

```sql
SELECT
  (SELECT COUNT(*) FROM primes)          AS primes,
  (SELECT COUNT(*) FROM sinistres)       AS sinistres,
  (SELECT COUNT(*) FROM renouvellements) AS renouvellements;
```

Expected: primes=2517, sinistres=44, renouvellements=18.

Also spot-check FK integrity:
```sql
-- Any primes with broken contrat FK? Should be 0.
SELECT COUNT(*) FROM primes p
LEFT JOIN contrats c ON c.id = p.contrat_id
WHERE c.id IS NULL;
```

---

## Done

Report all counts and FK check result. The database is now fully seeded.
