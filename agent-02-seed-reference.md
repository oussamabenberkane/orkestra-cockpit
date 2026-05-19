# Agent 02 — Seed Reference Data

**Supabase project:** `jadehnrmhmsvznsiyquo`
**Wave:** 2 (run after agent-01, alone)
**Prerequisite:** All 10 tables exist (agent-01 completed)
**Tools:** `execute_sql`

---

## Goal

1. Create the demo Supabase Auth user.
2. Insert the `courtiers` row for that user.
3. Seed all 9 rows from `DEMO compagnies.csv`.
4. Seed 3 `agent_tasks` rows (the "Trois Choses" morning checklist).
5. Seed 8 `alertes` rows (notification inbox demo data).

Do not touch any other table. Do not modify any Next.js source file.

---

## Step 1 — Create demo auth user

Run via `execute_sql`:

```sql
-- Insert directly into auth.users (admin-level, works on Supabase)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  role,
  aud,
  created_at,
  updated_at
) VALUES (
  'a1b2c3d4-0000-0000-0000-ef1234567890',
  '00000000-0000-0000-0000-000000000000',
  'demo@cabinet-muller.ch',
  crypt('OrkestroDemo2026!', gen_salt('bf')),
  NOW(),
  '{"raison_sociale": "Cabinet Müller & Associés SA"}'::jsonb,
  'authenticated',
  'authenticated',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;
```

Then verify the courtier was auto-created by the trigger:

```sql
SELECT id, raison_sociale, email FROM courtiers;
```

If the row is missing (trigger may not have fired on direct insert), insert manually:

```sql
INSERT INTO courtiers (id, raison_sociale, email)
VALUES (
  'a1b2c3d4-0000-0000-0000-ef1234567890',
  'Cabinet Müller & Associés SA',
  'demo@cabinet-muller.ch'
) ON CONFLICT (id) DO NOTHING;
```

The demo courtier UUID is: `a1b2c3d4-0000-0000-0000-ef1234567890`.
All subsequent seed agents use `SELECT id FROM courtiers LIMIT 1` to retrieve it dynamically.

---

## Step 2 — Seed compagnies

```sql
INSERT INTO compagnies (courtier_id, legacy_id, nom, contact_email, commission_base)
SELECT
  c.id,
  v.legacy_id,
  v.nom,
  v.contact_email,
  v.commission_base
FROM courtiers c,
(VALUES
  ('CMP001', 'AXA',        'contact@axa.ch',        9.23),
  ('CMP002', 'Zurich',     'contact@zurich.ch',     17.88),
  ('CMP003', 'Helvetia',   'contact@helvetia.ch',   13.74),
  ('CMP004', 'Allianz',    'contact@allianz.ch',    16.56),
  ('CMP005', 'Generali',   'contact@generali.ch',   11.26),
  ('CMP006', 'Mobilière',  'contact@mobiliere.ch',  17.81),
  ('CMP007', 'Bâloise',    'contact@baloise.ch',     8.59),
  ('CMP008', 'Swiss Life', 'contact@swisslife.ch',  11.04),
  ('CMP009', 'Vaudoise',   'contact@vaudoise.ch',   10.90),
  ('CMP010', 'Winterthur', 'contact@winterthur.ch', 14.71)
) AS v(legacy_id, nom, contact_email, commission_base)
LIMIT 1
ON CONFLICT (legacy_id) DO NOTHING;
```

Wait — the cross-join `FROM courtiers c, (VALUES …)` will multiply rows. Use this instead:

```sql
DO $$
DECLARE v_courtier_id UUID;
BEGIN
  SELECT id INTO v_courtier_id FROM courtiers LIMIT 1;
  INSERT INTO compagnies (courtier_id, legacy_id, nom, contact_email, commission_base)
  VALUES
    (v_courtier_id, 'CMP001', 'AXA',        'contact@axa.ch',        9.23),
    (v_courtier_id, 'CMP002', 'Zurich',     'contact@zurich.ch',     17.88),
    (v_courtier_id, 'CMP003', 'Helvetia',   'contact@helvetia.ch',   13.74),
    (v_courtier_id, 'CMP004', 'Allianz',    'contact@allianz.ch',    16.56),
    (v_courtier_id, 'CMP005', 'Generali',   'contact@generali.ch',   11.26),
    (v_courtier_id, 'CMP006', 'Mobilière',  'contact@mobiliere.ch',  17.81),
    (v_courtier_id, 'CMP007', 'Bâloise',    'contact@baloise.ch',     8.59),
    (v_courtier_id, 'CMP008', 'Swiss Life', 'contact@swisslife.ch',  11.04),
    (v_courtier_id, 'CMP009', 'Vaudoise',   'contact@vaudoise.ch',   10.90),
    (v_courtier_id, 'CMP010', 'Winterthur', 'contact@winterthur.ch', 14.71)
  ON CONFLICT (legacy_id) DO NOTHING;
END $$;
```

Verify: `SELECT COUNT(*) FROM compagnies;` → expect 10.

---

## Step 3 — Seed agent_tasks (Trois Choses)

These are the 3 morning priority items shown on the dashboard.

```sql
DO $$
DECLARE v_courtier_id UUID;
BEGIN
  SELECT id INTO v_courtier_id FROM courtiers LIMIT 1;
  INSERT INTO agent_tasks (courtier_id, type, titre, description, statut, priority, source, modal_key)
  VALUES
    (
      v_courtier_id,
      'renouvellement',
      'Valider 4 renouvellements',
      'Valider 4 renouvellements préparés par l''agent BrokerStar.',
      'pending', 1, 'BrokerStar', 'portefeuille'
    ),
    (
      v_courtier_id,
      'impayé',
      'Relancer Rossi SA',
      'Relancer Rossi SA pour son impayé de 1 800 CHF (67 jours).',
      'pending', 2, 'Odoo', 'finance'
    ),
    (
      v_courtier_id,
      'rapport',
      'Signer le rapport mensuel',
      'Signer le rapport mensuel combiné BrokerStar + Odoo.',
      'pending', 3, 'Combiné', 'rapport'
    );
END $$;
```

---

## Step 4 — Seed alertes

```sql
DO $$
DECLARE v_courtier_id UUID;
BEGIN
  SELECT id INTO v_courtier_id FROM courtiers LIMIT 1;
  INSERT INTO alertes (courtier_id, titre, corps, type, source, lu, created_at)
  VALUES
    (v_courtier_id, 'Impayé Rossi SA — 67 jours',         'La prime de 1 800 CHF est impayée depuis 67 jours. Relance recommandée.', 'danger', 'Odoo',       false, NOW() - INTERVAL '1 day'),
    (v_courtier_id, '4 renouvellements à valider',         '4 contrats arrivent à échéance dans moins de 30 jours.', 'warn', 'BrokerStar', false, NOW() - INTERVAL '2 hours'),
    (v_courtier_id, 'SIN-0047 · Dubois SA — 68 jours',    'Dossier RC Pro ouvert depuis 68 jours. Estimé 24 000 CHF.', 'danger', 'BrokerStar', false, NOW() - INTERVAL '3 hours'),
    (v_courtier_id, 'Rapport mensuel prêt',                'Le rapport combiné BrokerStar + Odoo de mai 2026 est disponible.', 'info', 'Combiné',    false, NOW() - INTERVAL '5 hours'),
    (v_courtier_id, 'Nouveau prospect qualifié',           'Prospect Sàrl A. (Fribourg) — potentiel 36 304 CHF/an.', 'good', 'BrokerStar', false, NOW() - INTERVAL '1 day'),
    (v_courtier_id, 'Sync BrokerStar réussie',             'Synchronisation complète — 188 contrats, 44 sinistres.', 'info', 'BrokerStar', true,  NOW() - INTERVAL '2 days'),
    (v_courtier_id, 'Marge nette +4 pt vs marché CH',      'Votre marge nette de 68 % dépasse la moyenne marché de 4 points.', 'good', 'Combiné',    true,  NOW() - INTERVAL '3 days'),
    (v_courtier_id, 'Impayé Martin & Cie — 27 jours',     'Prime de 2 400 CHF en attente depuis 27 jours.', 'warn', 'Odoo',       true,  NOW() - INTERVAL '4 days');
END $$;
```

---

## Step 5 — Verify all counts

```sql
SELECT
  (SELECT COUNT(*) FROM courtiers)   AS courtiers,
  (SELECT COUNT(*) FROM compagnies)  AS compagnies,
  (SELECT COUNT(*) FROM agent_tasks) AS agent_tasks,
  (SELECT COUNT(*) FROM alertes)     AS alertes;
```

Expected: courtiers=1, compagnies=10, agent_tasks=3, alertes=8.

---

## Done

Report the counts. Do not proceed to seed clients or contrats — that is agent-03 and agent-04's job.
