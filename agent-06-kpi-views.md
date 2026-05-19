# Agent 06 — KPI Views

**Supabase project:** `jadehnrmhmsvznsiyquo`
**Wave:** 3 (parallel with agent-03)
**Prerequisite:** agent-01 completed (tables exist — views only need table structure, not data)
**Tools:** `execute_sql` (or `apply_migration`)

---

## Goal

Create 8 SQL views that power the dashboard KPIs.
These replace the hardcoded figures in `src/lib/dashboard-mock.ts`.

Do NOT touch any Next.js source files. Do NOT seed data. Views only.

---

## Views to create

Apply all 8 views in a single migration named `create_kpi_views`.

```sql
-- ─── 1. v_hero_mensuel — monthly CA (last 13 months, for 12-bar chart) ───────
CREATE OR REPLACE VIEW v_hero_mensuel AS
SELECT
  p.courtier_id,
  DATE_TRUNC('month', p.date_encaissement)::DATE                          AS mois,
  TO_CHAR(DATE_TRUNC('month', p.date_encaissement), 'Mon YYYY')           AS mois_label,
  SUM(p.montant_net)                                                       AS ca_mensuel,
  SUM(SUM(p.montant_net)) OVER (
    PARTITION BY p.courtier_id
    ORDER BY DATE_TRUNC('month', p.date_encaissement)
  )                                                                         AS ca_cumul
FROM primes p
WHERE
  p.statut = 'encaissée'
  AND p.date_encaissement >= DATE_TRUNC('month', NOW()) - INTERVAL '12 months'
GROUP BY p.courtier_id, DATE_TRUNC('month', p.date_encaissement)
ORDER BY mois;

-- ─── 2. v_hero_trimestriel — quarterly CA (last 4 quarters) ──────────────────
CREATE OR REPLACE VIEW v_hero_trimestriel AS
SELECT
  p.courtier_id,
  DATE_TRUNC('quarter', p.date_encaissement)::DATE                        AS trimestre,
  'T' || EXTRACT(QUARTER FROM p.date_encaissement)::TEXT
    || '''' || TO_CHAR(p.date_encaissement, 'YY')                         AS trimestre_label,
  SUM(p.montant_net)                                                       AS ca_trimestriel
FROM primes p
WHERE
  p.statut = 'encaissée'
  AND p.date_encaissement >= DATE_TRUNC('quarter', NOW()) - INTERVAL '9 months'
GROUP BY p.courtier_id, DATE_TRUNC('quarter', p.date_encaissement),
         EXTRACT(QUARTER FROM p.date_encaissement), TO_CHAR(p.date_encaissement, 'YY')
ORDER BY trimestre;

-- ─── 3. v_hero_annuel — annual CA (last 3 years) ─────────────────────────────
CREATE OR REPLACE VIEW v_hero_annuel AS
SELECT
  p.courtier_id,
  EXTRACT(YEAR FROM p.date_encaissement)::INT                             AS annee,
  TO_CHAR(p.date_encaissement, 'YYYY')                                    AS annee_label,
  SUM(p.montant_net)                                                       AS ca_annuel
FROM primes p
WHERE
  p.statut = 'encaissée'
  AND p.date_encaissement >= DATE_TRUNC('year', NOW()) - INTERVAL '2 years'
GROUP BY p.courtier_id, EXTRACT(YEAR FROM p.date_encaissement),
         TO_CHAR(p.date_encaissement, 'YYYY')
ORDER BY annee;

-- ─── 4. v_satellites — three KPI cards (marge, cash-flow, rétention) ─────────
-- Note: Odoo charges data is not in the CSV dataset. Marge is approximated as
-- commission_annuelle / prime_annuelle ratio until Odoo integration lands.
CREATE OR REPLACE VIEW v_satellites AS
WITH
  -- rolling 12-month primes
  primes_12m AS (
    SELECT
      courtier_id,
      SUM(montant_net)                                                      AS encaisse_12m,
      SUM(CASE WHEN statut = 'impayée' THEN montant_net ELSE 0 END)        AS impayes_12m
    FROM primes
    WHERE date_emission >= NOW() - INTERVAL '12 months'
    GROUP BY courtier_id
  ),
  -- commission revenue (proxy for marge until Odoo lands)
  commission AS (
    SELECT
      courtier_id,
      SUM(commission_annuelle) AS commissions_totales,
      SUM(prime_annuelle)      AS primes_totales
    FROM contrats
    WHERE statut = 'actif'
    GROUP BY courtier_id
  ),
  -- retention: active contracts vs contracts that lapsed in last 12 months
  retention AS (
    SELECT
      courtier_id,
      COUNT(*) FILTER (WHERE statut = 'actif')                             AS actifs,
      COUNT(*) FILTER (WHERE statut = 'résilié'
        AND date_echeance >= NOW() - INTERVAL '12 months')                 AS resilies_12m
    FROM contrats
    GROUP BY courtier_id
  )
SELECT
  p.courtier_id,
  ROUND(c.commissions_totales / NULLIF(c.primes_totales, 0) * 100, 1)    AS marge_pct,
  ROUND(p.encaisse_12m - p.impayes_12m, 0)                               AS cashflow_net,
  ROUND(
    r.actifs::NUMERIC / NULLIF(r.actifs + r.resilies_12m, 0) * 100, 1
  )                                                                         AS retention_pct,
  r.actifs                                                                  AS contrats_actifs,
  r.resilies_12m                                                            AS resilies_12m,
  p.impayes_12m                                                             AS impayes_montant
FROM primes_12m p
JOIN commission  c ON c.courtier_id = p.courtier_id
JOIN retention   r ON r.courtier_id = p.courtier_id;

-- ─── 5. v_tile_prospection ────────────────────────────────────────────────────
CREATE OR REPLACE VIEW v_tile_prospection AS
SELECT
  courtier_id,
  COUNT(*)                                                                  AS total_prospects,
  COUNT(*) FILTER (WHERE statut = 'nouveau')                               AS nouveau,
  COUNT(*) FILTER (WHERE statut = 'contacté')                              AS contacte,
  COUNT(*) FILTER (WHERE statut = 'offre_envoyée')                         AS offre_envoyee,
  COUNT(*) FILTER (WHERE statut = 'gagné')                                  AS gagne,
  COUNT(*) FILTER (WHERE statut = 'perdu')                                  AS perdu,
  ROUND(
    COUNT(*) FILTER (WHERE statut = 'gagné')::NUMERIC
    / NULLIF(COUNT(*) FILTER (WHERE statut IN ('gagné', 'perdu')), 0) * 100,
    1
  )                                                                         AS taux_conversion_pct,
  COUNT(*) FILTER (
    WHERE statut NOT IN ('gagné', 'perdu')
    AND date_relance <= NOW()
  )                                                                         AS relances_dues
FROM prospects
GROUP BY courtier_id;

-- ─── 6. v_tile_portefeuille ───────────────────────────────────────────────────
CREATE OR REPLACE VIEW v_tile_portefeuille AS
SELECT
  courtier_id,
  COUNT(*)       FILTER (WHERE statut = 'actif')                           AS contrats_actifs,
  SUM(prime_annuelle) FILTER (WHERE statut = 'actif')                      AS primes_totales,
  COUNT(*)       FILTER (WHERE branche = 'RC_pro' AND statut = 'actif')    AS rc_pro,
  COUNT(*)       FILTER (WHERE branche = 'incendie' AND statut = 'actif')  AS incendie,
  COUNT(*)       FILTER (WHERE branche = 'vehicule' AND statut = 'actif')  AS vehicule,
  COUNT(*)       FILTER (WHERE branche = 'vie' AND statut = 'actif')       AS vie,
  COUNT(*)       FILTER (WHERE branche = 'maladie' AND statut = 'actif')   AS maladie,
  (
    SELECT COUNT(*) FROM renouvellements r
    WHERE r.courtier_id = c.courtier_id
      AND r.date_echeance <= NOW() + INTERVAL '30 days'
      AND r.statut NOT IN ('renouvelé', 'résilié')
  )                                                                         AS renouvellements_j30,
  (
    SELECT COALESCE(SUM(prime_actuelle), 0) FROM renouvellements r
    WHERE r.courtier_id = c.courtier_id
      AND r.date_echeance <= NOW() + INTERVAL '30 days'
      AND r.statut NOT IN ('renouvelé', 'résilié')
  )                                                                         AS primes_renouvellements_j30
FROM contrats c
GROUP BY courtier_id;

-- ─── 7. v_tile_sinistres ──────────────────────────────────────────────────────
CREATE OR REPLACE VIEW v_tile_sinistres AS
WITH active_ca AS (
  SELECT courtier_id, SUM(prime_annuelle) AS ca_primes
  FROM contrats
  WHERE statut = 'actif'
  GROUP BY courtier_id
)
SELECT
  s.courtier_id,
  COUNT(*)  FILTER (WHERE s.statut IN ('ouvert', 'en_cours'))              AS dossiers_ouverts,
  SUM(s.montant_estime) FILTER (WHERE s.statut IN ('ouvert', 'en_cours'))  AS montant_estime_total,
  ROUND(
    SUM(s.montant_estime) FILTER (WHERE s.statut IN ('ouvert', 'en_cours'))
    / NULLIF(a.ca_primes, 0) * 100,
    1
  )                                                                         AS ratio_sinistralite_pct,
  -- Oldest open claim in days
  MAX(NOW()::DATE - s.date_declaration) FILTER (
    WHERE s.statut IN ('ouvert', 'en_cours')
  )                                                                         AS plus_ancien_jours,
  -- Most urgent claim reference
  (
    SELECT s2.numero_sinistre FROM sinistres s2
    WHERE s2.courtier_id = s.courtier_id
      AND s2.statut IN ('ouvert', 'en_cours')
    ORDER BY s2.date_declaration ASC
    LIMIT 1
  )                                                                         AS sinistre_urgent_ref
FROM sinistres s
JOIN active_ca a ON a.courtier_id = s.courtier_id
GROUP BY s.courtier_id, a.ca_primes;

-- ─── 8. v_tile_finance ────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW v_tile_finance AS
SELECT
  p.courtier_id,
  -- Commissions (BrokerStar proxy)
  SUM(c.commission_annuelle) FILTER (WHERE c.statut = 'actif')             AS commissions_actives,
  -- Cash collected this month
  SUM(p.montant_net)         FILTER (
    WHERE p.statut = 'encaissée'
    AND p.date_encaissement >= DATE_TRUNC('month', NOW())
  )                                                                         AS encaisse_mois,
  -- Unpaid premiums
  COUNT(*)                   FILTER (WHERE p.statut = 'impayée')           AS nb_impayes,
  SUM(p.montant_net)         FILTER (WHERE p.statut = 'impayée')           AS montant_impayes,
  -- Pending (issued, not yet due)
  SUM(p.montant_net)         FILTER (WHERE p.statut = 'en_attente')        AS en_attente
FROM primes p
JOIN contrats c ON c.id = p.contrat_id
GROUP BY p.courtier_id;
```

---

## Verification

After applying, run a smoke-check on each view (requires at least partial data to be seeded, but views themselves are valid as soon as tables exist):

```sql
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name LIKE 'v_%'
ORDER BY table_name;
```

Expected: 8 rows — `v_hero_annuel`, `v_hero_mensuel`, `v_hero_trimestriel`, `v_satellites`, `v_tile_finance`, `v_tile_portefeuille`, `v_tile_prospection`, `v_tile_sinistres`.

If data is already seeded (agent-03 to 05 finished), also run:
```sql
SELECT * FROM v_satellites;
SELECT * FROM v_tile_sinistres;
```
and confirm non-null rows are returned.

---

## Done

Report which views were created. Do not touch any Next.js source files — that is agent-07's job.
