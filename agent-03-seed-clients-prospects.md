# Agent 03 — Seed Clients & Prospects

**Supabase project:** `jadehnrmhmsvznsiyquo`
**Wave:** 3 (parallel with agent-06)
**Prerequisite:** agent-02 completed (courtier row exists)
**Tools:** `execute_sql`, Read (to read CSV files)
**CSV sources:**
  - `data/DEMO clients.csv` (49 rows)
  - `data/DEMO prospects crm.csv` (29 rows)

---

## Goal

Parse both CSV files and insert all rows into `clients` and `prospects`.
All rows belong to the single demo courtier — ignore the original `courtier_id` column from the CSV (it contained C001-C005 multi-broker demo values, all mapped to our one courtier).

Do not touch `contrats`, `compagnies`, or any other table.

---

## Step 1 — Read the CSVs

Read these two files from the repo:
- `/data/DEMO clients.csv`
- `/data/DEMO prospects crm.csv`

Parse headers and all rows. Both files use comma delimiters, UTF-8 encoding.

---

## Step 2 — Get courtier UUID

```sql
SELECT id FROM courtiers LIMIT 1;
```

Store this UUID. Use it as `courtier_id` for every inserted row.

---

## Step 3 — Insert clients

Build a single `INSERT` statement with all 49 client rows.
Map CSV columns → table columns:

| CSV column | Table column | Notes |
|---|---|---|
| `id` | `legacy_id` | Stored as reference, NOT as the PK |
| `raison_sociale` | `raison_sociale` | |
| `type` | `type` | |
| `numero_client` | `numero_client` | |
| `ville` | `ville` | |
| `code_postal` | `code_postal` | |
| `secteur` | `secteur` | |
| `courtier_id` | *(ignored)* | Use the UUID from Step 2 instead |
| `segment` | `segment` | |
| `date_entree` | `date_entree` | Cast to DATE |
| `actif` | `actif` | `'true'` → TRUE, `'false'` → FALSE |
| `nb_employes` | `nb_employes` | Cast to INTEGER |
| `chiffre_affaires_annuel` | `chiffre_affaires_annuel` | Cast to NUMERIC |

Use `ON CONFLICT (legacy_id) DO NOTHING` so the insert is idempotent.

Example shape:
```sql
INSERT INTO clients (courtier_id, legacy_id, raison_sociale, type, numero_client, ville, code_postal, secteur, segment, date_entree, actif, nb_employes, chiffre_affaires_annuel)
VALUES
  ('<courtier_uuid>', 'CLT001', 'GmbH Group H.',  'PME', 'CH81984', 'Morges',   '6479', 'Agriculture', 'bronze', '2022-09-14', TRUE,  146, 4799907),
  ('<courtier_uuid>', 'CLT002', 'SA Commerce M.', 'PME', 'CH20663', 'Sion',     '4063', 'Immobilier',  'bronze', '2023-11-28', TRUE,   99, 2995028),
  -- … all 49 rows
ON CONFLICT (legacy_id) DO NOTHING;
```

---

## Step 4 — Insert prospects

Map CSV columns → table columns:

| CSV column | Table column | Notes |
|---|---|---|
| `id` | `legacy_id` | |
| `courtier_id` | *(ignored)* | Use UUID from Step 2 |
| `raison_sociale` | `raison_sociale` | |
| `ville` | `ville` | |
| `secteur` | `secteur` | |
| `potentiel_prime_annuelle` | `potentiel_prime_annuelle` | Cast to NUMERIC |
| `statut` | `statut` | |
| `date_premier_contact` | `date_premier_contact` | Cast to DATE |
| `date_relance` | `date_relance` | Cast to DATE, empty string → NULL |
| `motif_perte` | `motif_perte` | Empty string → NULL |
| `source` | `source` | |
| `nb_employes` | `nb_employes` | Cast to INTEGER |

Use `ON CONFLICT (legacy_id) DO NOTHING`.

---

## Step 5 — Verify

```sql
SELECT
  (SELECT COUNT(*) FROM clients)   AS clients,
  (SELECT COUNT(*) FROM prospects) AS prospects;
```

Expected: clients=49, prospects=29.

If counts are lower, query for any errors and re-run the missing rows.

---

## Done

Report the final counts. Do not insert contrats — that is agent-04's job (it depends on both clients and compagnies existing).
