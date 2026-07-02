// Supabase query layer for the demo dataset.
//
// Fetches the seven demo tables from Supabase Postgres once per server
// process (in parallel, paginated past PostgREST's row cap) and caches them
// in memory. Module-scope cache makes every downstream tool call O(1) — the
// exact same `Dataset` shape this file exposed when it still read CSVs, so
// nothing above it changed.
//
// The CSV fixtures live on in data/*.csv; `pnpm db:seed`
// (scripts/seed-supabase.mjs) replays them into Supabase.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  Client,
  Compagnie,
  Contrat,
  Dataset,
  Prime,
  Prospect,
  Renouvellement,
  Sinistre,
} from "./types";

// PostgREST caps a single request at 1000 rows by default (`primes` has ~2.5k).
const PAGE_SIZE = 1000;

let supabase: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (supabase) return supabase;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Server-side we prefer the service role key (RLS bypass); the anon key
  // also works because the demo tables carry a read-only RLS policy.
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "[agent/data] Missing Supabase env — set NEXT_PUBLIC_SUPABASE_URL and " +
        "SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) in .env.local.",
    );
  }
  supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return supabase;
}

// PostgREST already serializes `numeric` as JSON number, `date` as
// "YYYY-MM-DD", `boolean` as boolean and NULL as null, so rows come back
// structurally identical to the interfaces in ./types.ts — no per-column
// mapping layer needed.
async function fetchAll<T>(table: string): Promise<T[]> {
  const db = getClient();
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await db
      .from(table)
      .select("*")
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) {
      throw new Error(`[agent/data] fetch ${table} failed: ${error.message}`);
    }
    const page = (data ?? []) as T[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) return rows;
  }
}

let cached: Dataset | null = null;
let inflight: Promise<Dataset> | null = null;

export async function loadDataset(): Promise<Dataset> {
  if (cached) return cached;
  if (!inflight) {
    inflight = fetchDataset().then(
      (ds) => {
        cached = ds;
        inflight = null;
        return ds;
      },
      (err) => {
        // Clear so the next call retries instead of replaying the failure.
        inflight = null;
        throw err;
      },
    );
  }
  return inflight;
}

async function fetchDataset(): Promise<Dataset> {
  const [clients, compagnies, contrats, primes, prospects, renouvellements, sinistres] =
    await Promise.all([
      fetchAll<Client>("clients"),
      fetchAll<Compagnie>("compagnies"),
      fetchAll<Contrat>("contrats"),
      fetchAll<Prime>("primes"),
      fetchAll<Prospect>("prospects"),
      fetchAll<Renouvellement>("renouvellements"),
      fetchAll<Sinistre>("sinistres"),
    ]);
  return { clients, compagnies, contrats, primes, prospects, renouvellements, sinistres };
}

// Test/dev helper — forces a refetch on the next loadDataset() call.
export function resetDatasetCache(): void {
  cached = null;
  inflight = null;
}
