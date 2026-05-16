// Database adapter boundary for the agent's SQL tool.
//
// The tool depends on `DatabaseAdapter`, not on any concrete engine. To swap
// the in-memory sql.js mirror for real Postgres (Odoo-backed views), implement
// a new adapter with the same interface and change the factory below — every
// caller above this file keeps working.

import { SqlJsAdapter } from "./sqljs-adapter";

export interface QueryResult {
  columns: string[];
  rows: Array<Record<string, unknown>>;
  row_count: number;
  truncated: boolean;
}

/**
 * Per-call execution limits. Every adapter must honour `maxRows`; adapters
 * that target a real database must also honour `statementTimeoutMs`. The
 * in-memory sql.js adapter ignores the timeout (queries complete
 * synchronously against the demo dataset); the future Postgres adapter will
 * enforce it via `SET LOCAL statement_timeout`. Keeping these on the
 * interface means the contract is locked in before the implementation swap.
 */
export interface QueryOptions {
  /** Maximum rows to return before truncating. */
  maxRows?: number;
  /** Hard ceiling on a single statement's wall-clock time, in milliseconds. */
  statementTimeoutMs?: number;
}

export interface DatabaseAdapter {
  query(sql: string, opts?: QueryOptions): Promise<QueryResult>;
}

let adapter: DatabaseAdapter | null = null;

export function getDatabaseAdapter(): DatabaseAdapter {
  if (!adapter) adapter = new SqlJsAdapter();
  return adapter;
}
