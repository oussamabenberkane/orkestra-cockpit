// In-memory SQLite mirror of the demo dataset, served via sql.js (pure WASM,
// no native build). Replaces nothing — it sits beside the existing in-memory
// JS arrays so the 13 dedicated tools keep working unchanged. Only the new
// `query_database` tool reads through this adapter.
//
// On migration: swap this file for a Postgres adapter implementing the same
// DatabaseAdapter interface; the tool stays identical.

import fs from "node:fs";
import path from "node:path";
import initSqlJs, { type Database } from "sql.js";
import { loadDataset } from "./loader";
import type { DatabaseAdapter, QueryOptions, QueryResult } from "./db";

const DEFAULT_MAX_ROWS = 1000;

// Reject any SQL that isn't read-only. The DB has no separate read-only mode
// in sql.js, so the regex guard is the only enforcement layer.
const MUTATION_KEYWORDS =
  /\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|ATTACH|DETACH|REPLACE|PRAGMA|VACUUM|BEGIN|COMMIT|ROLLBACK|SAVEPOINT|RELEASE)\b/i;

const DDL = `
CREATE TABLE clients (
  id TEXT PRIMARY KEY,
  raison_sociale TEXT NOT NULL,
  type TEXT NOT NULL,
  numero_client TEXT NOT NULL,
  ville TEXT NOT NULL,
  code_postal TEXT NOT NULL,
  secteur TEXT NOT NULL,
  courtier_id TEXT NOT NULL,
  segment TEXT NOT NULL,
  date_entree TEXT NOT NULL,
  actif INTEGER NOT NULL,
  nb_employes INTEGER NOT NULL,
  chiffre_affaires_annuel INTEGER NOT NULL
);

CREATE TABLE compagnies (
  id TEXT PRIMARY KEY,
  nom TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  commission_base REAL NOT NULL
);

CREATE TABLE contrats (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  courtier_id TEXT NOT NULL,
  compagnie_id TEXT NOT NULL,
  compagnie_nom TEXT NOT NULL,
  numero_police TEXT NOT NULL,
  branche TEXT NOT NULL,
  statut TEXT NOT NULL,
  date_debut TEXT NOT NULL,
  date_echeance TEXT NOT NULL,
  periodicite TEXT NOT NULL,
  prime_annuelle INTEGER NOT NULL,
  commission_taux REAL NOT NULL,
  commission_annuelle INTEGER NOT NULL,
  source TEXT NOT NULL
);

CREATE TABLE primes (
  id TEXT PRIMARY KEY,
  contrat_id TEXT NOT NULL,
  client_id TEXT NOT NULL,
  date_emission TEXT NOT NULL,
  date_echeance TEXT NOT NULL,
  montant_brut INTEGER NOT NULL,
  montant_net INTEGER NOT NULL,
  statut TEXT NOT NULL,
  date_encaissement TEXT
);

CREATE TABLE sinistres (
  id TEXT PRIMARY KEY,
  contrat_id TEXT NOT NULL,
  client_id TEXT NOT NULL,
  courtier_id TEXT NOT NULL,
  numero_sinistre TEXT NOT NULL,
  branche TEXT NOT NULL,
  date_survenance TEXT NOT NULL,
  date_declaration TEXT NOT NULL,
  nature TEXT NOT NULL,
  montant_estime INTEGER NOT NULL,
  montant_indemnise INTEGER NOT NULL,
  statut TEXT NOT NULL,
  date_cloture TEXT,
  gestionnaire_id TEXT NOT NULL
);

CREATE TABLE renouvellements (
  id TEXT PRIMARY KEY,
  contrat_id TEXT NOT NULL,
  client_id TEXT NOT NULL,
  courtier_id TEXT NOT NULL,
  branche TEXT NOT NULL,
  prime_actuelle INTEGER NOT NULL,
  date_echeance TEXT NOT NULL,
  jours_restants INTEGER NOT NULL,
  date_relance_1 TEXT,
  date_relance_2 TEXT,
  date_relance_3 TEXT,
  statut TEXT NOT NULL,
  motif_resiliation TEXT
);

CREATE TABLE prospects (
  id TEXT PRIMARY KEY,
  courtier_id TEXT NOT NULL,
  raison_sociale TEXT NOT NULL,
  ville TEXT NOT NULL,
  secteur TEXT NOT NULL,
  potentiel_prime_annuelle INTEGER NOT NULL,
  statut TEXT NOT NULL,
  date_premier_contact TEXT NOT NULL,
  date_relance TEXT,
  motif_perte TEXT,
  source TEXT NOT NULL,
  nb_employes INTEGER NOT NULL
);
`;

export class SqlJsAdapter implements DatabaseAdapter {
  private dbPromise: Promise<Database> | null = null;

  private async getDb(): Promise<Database> {
    if (!this.dbPromise) this.dbPromise = this.init();
    return this.dbPromise;
  }

  private async init(): Promise<Database> {
    const wasmPath = path.join(
      process.cwd(),
      "node_modules",
      "sql.js",
      "dist",
      "sql-wasm.wasm",
    );
    const buf = fs.readFileSync(wasmPath);
    const wasmBinary = buf.buffer.slice(
      buf.byteOffset,
      buf.byteOffset + buf.byteLength,
    ) as ArrayBuffer;
    const SQL = await initSqlJs({ wasmBinary });
    const db = new SQL.Database();
    db.exec(DDL);

    const ds = loadDataset();

    const insert = (table: string, columns: string[], rows: unknown[][]) => {
      const placeholders = columns.map(() => "?").join(",");
      const stmt = db.prepare(
        `INSERT INTO ${table} (${columns.join(",")}) VALUES (${placeholders})`,
      );
      for (const row of rows) {
        stmt.run(row as never);
      }
      stmt.free();
    };

    insert(
      "clients",
      [
        "id",
        "raison_sociale",
        "type",
        "numero_client",
        "ville",
        "code_postal",
        "secteur",
        "courtier_id",
        "segment",
        "date_entree",
        "actif",
        "nb_employes",
        "chiffre_affaires_annuel",
      ],
      ds.clients.map((c) => [
        c.id,
        c.raison_sociale,
        c.type,
        c.numero_client,
        c.ville,
        c.code_postal,
        c.secteur,
        c.courtier_id,
        c.segment,
        c.date_entree,
        c.actif ? 1 : 0,
        c.nb_employes,
        c.chiffre_affaires_annuel,
      ]),
    );

    insert(
      "compagnies",
      ["id", "nom", "contact_email", "commission_base"],
      ds.compagnies.map((c) => [c.id, c.nom, c.contact_email, c.commission_base]),
    );

    insert(
      "contrats",
      [
        "id",
        "client_id",
        "courtier_id",
        "compagnie_id",
        "compagnie_nom",
        "numero_police",
        "branche",
        "statut",
        "date_debut",
        "date_echeance",
        "periodicite",
        "prime_annuelle",
        "commission_taux",
        "commission_annuelle",
        "source",
      ],
      ds.contrats.map((c) => [
        c.id,
        c.client_id,
        c.courtier_id,
        c.compagnie_id,
        c.compagnie_nom,
        c.numero_police,
        c.branche,
        c.statut,
        c.date_debut,
        c.date_echeance,
        c.periodicite,
        c.prime_annuelle,
        c.commission_taux,
        c.commission_annuelle,
        c.source,
      ]),
    );

    insert(
      "primes",
      [
        "id",
        "contrat_id",
        "client_id",
        "date_emission",
        "date_echeance",
        "montant_brut",
        "montant_net",
        "statut",
        "date_encaissement",
      ],
      ds.primes.map((p) => [
        p.id,
        p.contrat_id,
        p.client_id,
        p.date_emission,
        p.date_echeance,
        p.montant_brut,
        p.montant_net,
        p.statut,
        p.date_encaissement,
      ]),
    );

    insert(
      "sinistres",
      [
        "id",
        "contrat_id",
        "client_id",
        "courtier_id",
        "numero_sinistre",
        "branche",
        "date_survenance",
        "date_declaration",
        "nature",
        "montant_estime",
        "montant_indemnise",
        "statut",
        "date_cloture",
        "gestionnaire_id",
      ],
      ds.sinistres.map((s) => [
        s.id,
        s.contrat_id,
        s.client_id,
        s.courtier_id,
        s.numero_sinistre,
        s.branche,
        s.date_survenance,
        s.date_declaration,
        s.nature,
        s.montant_estime,
        s.montant_indemnise,
        s.statut,
        s.date_cloture,
        s.gestionnaire_id,
      ]),
    );

    insert(
      "renouvellements",
      [
        "id",
        "contrat_id",
        "client_id",
        "courtier_id",
        "branche",
        "prime_actuelle",
        "date_echeance",
        "jours_restants",
        "date_relance_1",
        "date_relance_2",
        "date_relance_3",
        "statut",
        "motif_resiliation",
      ],
      ds.renouvellements.map((r) => [
        r.id,
        r.contrat_id,
        r.client_id,
        r.courtier_id,
        r.branche,
        r.prime_actuelle,
        r.date_echeance,
        r.jours_restants,
        r.date_relance_1,
        r.date_relance_2,
        r.date_relance_3,
        r.statut,
        r.motif_resiliation,
      ]),
    );

    insert(
      "prospects",
      [
        "id",
        "courtier_id",
        "raison_sociale",
        "ville",
        "secteur",
        "potentiel_prime_annuelle",
        "statut",
        "date_premier_contact",
        "date_relance",
        "motif_perte",
        "source",
        "nb_employes",
      ],
      ds.prospects.map((p) => [
        p.id,
        p.courtier_id,
        p.raison_sociale,
        p.ville,
        p.secteur,
        p.potentiel_prime_annuelle,
        p.statut,
        p.date_premier_contact,
        p.date_relance,
        p.motif_perte,
        p.source,
        p.nb_employes,
      ]),
    );

    return db;
  }

  async query(sql: string, opts: QueryOptions = {}): Promise<QueryResult> {
    // `statementTimeoutMs` is part of the interface contract for the future
    // Postgres adapter; sql.js runs in-process against the demo dataset and
    // ignores it — every query is effectively synchronous.
    const maxRows = opts.maxRows ?? DEFAULT_MAX_ROWS;

    const trimmed = sql.trim().replace(/;\s*$/, "");
    if (!/^(SELECT|WITH)\b/i.test(trimmed)) {
      throw new Error(
        "Requête refusée : seules les requêtes SELECT ou WITH sont autorisées.",
      );
    }
    if (MUTATION_KEYWORDS.test(trimmed)) {
      throw new Error(
        "Requête refusée : mots-clés de mutation détectés (INSERT/UPDATE/DELETE/DROP/etc.).",
      );
    }
    if (trimmed.includes(";")) {
      throw new Error(
        "Requête refusée : une seule instruction par appel (pas de `;` interne).",
      );
    }

    const db = await this.getDb();
    const stmt = db.prepare(trimmed);
    const rows: Record<string, unknown>[] = [];
    let truncated = false;
    try {
      while (stmt.step()) {
        if (rows.length >= maxRows) {
          truncated = true;
          break;
        }
        rows.push(stmt.getAsObject());
      }
      const columns = stmt.getColumnNames();
      return { columns, rows, row_count: rows.length, truncated };
    } finally {
      stmt.free();
    }
  }
}
