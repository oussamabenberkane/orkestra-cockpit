// ---------------------------------------------------------------------------
// scripts/support-create-bucket.mjs
//
// Creates the private `support-attachments` Storage bucket in Supabase.
// Buckets aren't part of the SQL schema — they're created through the Storage
// API, so this companion script complements scripts/support-schema.sql.
//
// USAGE:
//   node scripts/support-create-bucket.mjs
//
// Idempotent: if the bucket already exists, the script reports it and exits 0.
// Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from
// .env.local (loaded by Node 20+ via --env-file).
// ---------------------------------------------------------------------------

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

// .env.local is loaded by the dev server but not by ad-hoc scripts. Parse it
// here so the script works without --env-file= on the command line.
try {
  const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of env.split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (m && !process.env[m[1]]) {
      const value = m[2].replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
      process.env[m[1]] = value;
    }
  }
} catch {
  // ok — env may already be set
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const BUCKET = "support-attachments";

const { data: existing, error: listErr } = await supabase.storage.listBuckets();
if (listErr) {
  console.error("Failed to list buckets:", listErr.message);
  process.exit(1);
}

if (existing.some((b) => b.name === BUCKET)) {
  console.log(`Bucket "${BUCKET}" already exists — nothing to do.`);
  process.exit(0);
}

const { error } = await supabase.storage.createBucket(BUCKET, {
  public: false,
  fileSizeLimit: 10 * 1024 * 1024, // 10 MB
});

if (error) {
  console.error(`Failed to create bucket "${BUCKET}":`, error.message);
  process.exit(1);
}

console.log(`Created private bucket "${BUCKET}".`);
