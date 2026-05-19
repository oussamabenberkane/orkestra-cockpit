# Agent 01 — Schema & RLS

**Supabase project:** `jadehnrmhmsvznsiyquo`
**Wave:** 1 (run first, alone)
**Tools:** `apply_migration`, `list_tables` (to verify)

---

## Goal

Create the complete Supabase schema for the Orkestra cockpit:
10 tables, RLS policies on all of them, and an auth trigger that auto-creates a `courtiers` row whenever a new user signs up.

Do not seed any data. Do not touch any files in the Next.js project.

---

## Step 1 — Apply the schema migration

Call `apply_migration` on project `jadehnrmhmsvznsiyquo` with the SQL below in a single call.
Name the migration `create_orkestra_schema`.

```sql
-- ─── Extensions ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── courtiers (tenant root, id = auth.users.id) ─────────────────────────────
CREATE TABLE courtiers (
  id            UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  raison_sociale TEXT       NOT NULL DEFAULT 'Cabinet',
  email         TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE courtiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "courtiers: own row" ON courtiers
  FOR ALL USING (id = auth.uid());

-- ─── Auto-create courtier on signup ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.courtiers (id, raison_sociale, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'raison_sociale', 'Cabinet'),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── compagnies ───────────────────────────────────────────────────────────────
CREATE TABLE compagnies (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  courtier_id     UUID        NOT NULL REFERENCES courtiers(id) ON DELETE CASCADE,
  legacy_id       TEXT        UNIQUE,                          -- original CSV id (CMP001…)
  nom             TEXT        NOT NULL,
  contact_email   TEXT,
  commission_base NUMERIC(5,2),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE compagnies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "compagnies: own rows" ON compagnies
  FOR ALL USING (courtier_id = auth.uid());

-- ─── clients ──────────────────────────────────────────────────────────────────
CREATE TABLE clients (
  id                       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  courtier_id              UUID        NOT NULL REFERENCES courtiers(id) ON DELETE CASCADE,
  legacy_id                TEXT        UNIQUE,                 -- original CSV id (CLT001…)
  raison_sociale           TEXT        NOT NULL,
  type                     TEXT,
  numero_client            TEXT,
  ville                    TEXT,
  code_postal              TEXT,
  secteur                  TEXT,
  segment                  TEXT        CHECK (segment IN ('bronze','silver','gold')),
  date_entree              DATE,
  actif                    BOOLEAN     NOT NULL DEFAULT TRUE,
  nb_employes              INTEGER,
  chiffre_affaires_annuel  NUMERIC(15,2),
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clients: own rows" ON clients
  FOR ALL USING (courtier_id = auth.uid());

-- ─── contrats (polices) ───────────────────────────────────────────────────────
CREATE TABLE contrats (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  courtier_id         UUID        NOT NULL REFERENCES courtiers(id) ON DELETE CASCADE,
  client_id           UUID        NOT NULL REFERENCES clients(id),
  compagnie_id        UUID        NOT NULL REFERENCES compagnies(id),
  legacy_id           TEXT        UNIQUE,                      -- original CSV id (POL0001…)
  compagnie_nom       TEXT,
  numero_police       TEXT,
  branche             TEXT,
  statut              TEXT        CHECK (statut IN ('actif','résilié','suspendu')),
  date_debut          DATE,
  date_echeance       DATE,
  periodicite         TEXT        CHECK (periodicite IN ('annuel','trimestriel','mensuel','semestriel')),
  prime_annuelle      NUMERIC(10,2),
  commission_taux     NUMERIC(5,2),
  commission_annuelle NUMERIC(10,2),
  source              TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE contrats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contrats: own rows" ON contrats
  FOR ALL USING (courtier_id = auth.uid());

-- ─── primes ───────────────────────────────────────────────────────────────────
CREATE TABLE primes (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  courtier_id       UUID        NOT NULL REFERENCES courtiers(id) ON DELETE CASCADE,
  contrat_id        UUID        NOT NULL REFERENCES contrats(id),
  client_id         UUID        NOT NULL REFERENCES clients(id),
  legacy_id         TEXT        UNIQUE,                        -- original CSV id (PRM00001…)
  date_emission     DATE,
  date_echeance     DATE,
  montant_brut      NUMERIC(10,2),
  montant_net       NUMERIC(10,2),
  statut            TEXT        CHECK (statut IN ('encaissée','en_attente','impayée')),
  date_encaissement DATE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE primes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "primes: own rows" ON primes
  FOR ALL USING (courtier_id = auth.uid());

-- ─── sinistres ────────────────────────────────────────────────────────────────
CREATE TABLE sinistres (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  courtier_id       UUID        NOT NULL REFERENCES courtiers(id) ON DELETE CASCADE,
  contrat_id        UUID        NOT NULL REFERENCES contrats(id),
  client_id         UUID        NOT NULL REFERENCES clients(id),
  legacy_id         TEXT        UNIQUE,                        -- original CSV id (SIN001…)
  numero_sinistre   TEXT,
  branche           TEXT,
  date_survenance   DATE,
  date_declaration  DATE,
  nature            TEXT,
  montant_estime    NUMERIC(10,2),
  montant_indemnise NUMERIC(10,2),
  statut            TEXT        CHECK (statut IN ('ouvert','en_cours','clos')),
  date_cloture      DATE,
  gestionnaire_id   TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE sinistres ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sinistres: own rows" ON sinistres
  FOR ALL USING (courtier_id = auth.uid());

-- ─── prospects ────────────────────────────────────────────────────────────────
CREATE TABLE prospects (
  id                       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  courtier_id              UUID        NOT NULL REFERENCES courtiers(id) ON DELETE CASCADE,
  legacy_id                TEXT        UNIQUE,                 -- original CSV id (PROS001…)
  raison_sociale           TEXT        NOT NULL,
  ville                    TEXT,
  secteur                  TEXT,
  potentiel_prime_annuelle NUMERIC(10,2),
  statut                   TEXT        CHECK (statut IN ('nouveau','contacté','offre_envoyée','gagné','perdu')),
  date_premier_contact     DATE,
  date_relance             DATE,
  motif_perte              TEXT,
  source                   TEXT,
  nb_employes              INTEGER,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prospects: own rows" ON prospects
  FOR ALL USING (courtier_id = auth.uid());

-- ─── renouvellements ──────────────────────────────────────────────────────────
CREATE TABLE renouvellements (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  courtier_id      UUID        NOT NULL REFERENCES courtiers(id) ON DELETE CASCADE,
  contrat_id       UUID        NOT NULL REFERENCES contrats(id),
  client_id        UUID        NOT NULL REFERENCES clients(id),
  legacy_id        TEXT        UNIQUE,                         -- original CSV id (REN007…)
  branche          TEXT,
  prime_actuelle   NUMERIC(10,2),
  date_echeance    DATE,
  date_relance_1   DATE,
  date_relance_2   DATE,
  date_relance_3   DATE,
  statut           TEXT        CHECK (statut IN ('à_traiter','en_cours','renouvelé','résilié')),
  motif_resiliation TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE renouvellements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "renouvellements: own rows" ON renouvellements
  FOR ALL USING (courtier_id = auth.uid());

-- ─── agent_tasks (Trois Choses + agents modal) ────────────────────────────────
CREATE TABLE agent_tasks (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  courtier_id  UUID        NOT NULL REFERENCES courtiers(id) ON DELETE CASCADE,
  type         TEXT        CHECK (type IN ('renouvellement','impayé','rapport','prospection','sinistre','alerte')),
  titre        TEXT        NOT NULL,
  description  TEXT,
  statut       TEXT        NOT NULL DEFAULT 'pending' CHECK (statut IN ('pending','completed','dismissed')),
  priority     INTEGER     NOT NULL DEFAULT 2 CHECK (priority BETWEEN 1 AND 3),
  source       TEXT,
  modal_key    TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agent_tasks: own rows" ON agent_tasks
  FOR ALL USING (courtier_id = auth.uid());

-- ─── alertes ──────────────────────────────────────────────────────────────────
CREATE TABLE alertes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  courtier_id UUID        NOT NULL REFERENCES courtiers(id) ON DELETE CASCADE,
  titre       TEXT        NOT NULL,
  corps       TEXT,
  type        TEXT        CHECK (type IN ('warn','danger','info','good')),
  source      TEXT,
  lu          BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  lu_at       TIMESTAMPTZ
);
ALTER TABLE alertes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alertes: own rows" ON alertes
  FOR ALL USING (courtier_id = auth.uid());
```

---

## Step 2 — Verify

Call `list_tables` on project `jadehnrmhmsvznsiyquo` with `schemas: ["public"]`.
Confirm these 10 tables exist: `courtiers`, `compagnies`, `clients`, `contrats`, `primes`, `sinistres`, `prospects`, `renouvellements`, `agent_tasks`, `alertes`.

If any table is missing, re-apply only the missing table's DDL block using `apply_migration`.

---

## Done

Report: how many tables were created, whether RLS is enabled on all, and whether the auth trigger was created.
Do NOT proceed to seed data — that is agent-02's job.
