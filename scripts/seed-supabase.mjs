// Seed the Supabase demo dataset from the CSV fixtures in data/.
//
// Idempotent: wipes the seven tables (children first), then re-inserts every
// CSV row with the same coercions the runtime used when it still read CSVs
// directly (empty numeric → 0, "true"/"1" → boolean, empty optional → null).
//
// Usage:  pnpm db:seed
// Needs:  NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local
//         (service role bypasses RLS — the tables are read-only for anon).

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import Papa from "papaparse";

const ROOT = path.resolve(import.meta.dirname, "..");
const DATA_DIR = path.join(ROOT, "data");
const CHUNK_SIZE = 500;

// --- env (.env.local, no dotenv dependency) ---------------------------------

function loadEnvLocal() {
  const file = path.join(ROOT, ".env.local");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m || line.trim().startsWith("#")) continue;
    const value = m[2].replace(/^["']|["']$/g, "");
    if (!(m[1] in process.env)) process.env[m[1]] = value;
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — fill .env.local (see .env.example).",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// --- CSV parsing + coercions (mirror of src/agent/data/types.ts) -------------

const num = (v) => {
  if (v == null || v === "") return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const bool = (v) => v === "true" || v === "1";
const nullable = (v) => (v == null || v === "" ? null : v);

// file + per-column coercion (default: keep the string as-is)
const TABLES = [
  {
    name: "compagnies",
    file: "DEMO compagnies.csv",
    coerce: { commission_base: num },
  },
  {
    name: "clients",
    file: "DEMO clients.csv",
    coerce: { actif: bool, nb_employes: num, chiffre_affaires_annuel: num },
  },
  {
    name: "contrats",
    file: "DEMO contrats.csv",
    coerce: { prime_annuelle: num, commission_taux: num, commission_annuelle: num },
  },
  {
    name: "primes",
    file: "DEMO primes.csv",
    coerce: { montant_brut: num, montant_net: num, date_encaissement: nullable },
  },
  {
    name: "sinistres",
    file: "DEMO sinistres.csv",
    coerce: { montant_estime: num, montant_indemnise: num, date_cloture: nullable },
  },
  {
    name: "renouvellements",
    file: "DEMO renouvellements.csv",
    coerce: {
      prime_actuelle: num,
      jours_restants: num,
      date_relance_1: nullable,
      date_relance_2: nullable,
      date_relance_3: nullable,
      motif_resiliation: nullable,
    },
  },
  {
    name: "prospects",
    file: "DEMO prospects crm.csv",
    coerce: {
      potentiel_prime_annuelle: num,
      nb_employes: num,
      date_relance: nullable,
      motif_perte: nullable,
    },
  },
];

function readRows({ file, coerce }) {
  const raw = fs.readFileSync(path.join(DATA_DIR, file), "utf8");
  const result = Papa.parse(raw, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });
  if (result.errors.length > 0) {
    console.warn(`[seed] parse warnings in ${file}:`, result.errors.slice(0, 3));
  }
  return result.data.map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([col, value]) => [col, coerce[col] ? coerce[col](value) : value]),
    ),
  );
}

// --- seed ---------------------------------------------------------------------

async function wipe() {
  // Children before parents (FKs).
  for (const name of ["primes", "sinistres", "renouvellements", "contrats", "prospects", "clients", "compagnies"]) {
    const { error } = await supabase.from(name).delete().neq("id", "");
    if (error) throw new Error(`wipe ${name}: ${error.message}`);
  }
}

async function insertAll(name, rows) {
  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    const chunk = rows.slice(i, i + CHUNK_SIZE);
    const { error } = await supabase.from(name).insert(chunk);
    if (error) throw new Error(`insert ${name} (rows ${i}–${i + chunk.length - 1}): ${error.message}`);
  }
}

async function main() {
  console.log(`Seeding ${url} ...`);
  await wipe();
  let failed = false;
  for (const table of TABLES) {
    const rows = readRows(table);
    await insertAll(table.name, rows);
    const { count, error } = await supabase
      .from(table.name)
      .select("*", { count: "exact", head: true });
    if (error) throw new Error(`count ${table.name}: ${error.message}`);
    const ok = count === rows.length;
    if (!ok) failed = true;
    console.log(`  ${ok ? "✓" : "✗"} ${table.name}: ${count}/${rows.length} rows`);
  }
  if (failed) {
    console.error("Row-count mismatch — see above.");
    process.exit(1);
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
