// CSV loader for the demo dataset.
//
// Reads the seven `data/*.csv` files once per server process, parses them with
// papaparse, and exposes them as typed arrays. Module-scope cache makes every
// downstream tool call O(1).
//
// When we switch to Postgres, replace `loadDataset()` with a query layer that
// returns the same `Dataset` shape — every tool above this file keeps working.

import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";
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

const DATA_DIR = path.join(process.cwd(), "data");

const FILES = {
  clients: "DEMO clients.csv",
  compagnies: "DEMO compagnies.csv",
  contrats: "DEMO contrats.csv",
  primes: "DEMO primes.csv",
  prospects: "DEMO prospects crm.csv",
  renouvellements: "DEMO renouvellements.csv",
  sinistres: "DEMO sinistres.csv",
} as const;

type RawRow = Record<string, string>;

function parseCsv(file: string): RawRow[] {
  const fullPath = path.join(DATA_DIR, file);
  const raw = fs.readFileSync(fullPath, "utf8");
  const result = Papa.parse<RawRow>(raw, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });
  if (result.errors.length > 0) {
    // Soft-fail: parse errors are typically minor and we still get usable rows.
    // Log for visibility but don't crash the server.
    console.warn(`[agent/data] parse warnings in ${file}:`, result.errors.slice(0, 3));
  }
  return result.data;
}

const num = (v: string | undefined): number => {
  if (v == null || v === "") return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const bool = (v: string | undefined): boolean => v === "true" || v === "1";

const nullable = (v: string | undefined): string | null =>
  v == null || v === "" ? null : v;

function mapClients(rows: RawRow[]): Client[] {
  return rows.map((r) => ({
    id: r.id,
    raison_sociale: r.raison_sociale,
    type: r.type,
    numero_client: r.numero_client,
    ville: r.ville,
    code_postal: r.code_postal,
    secteur: r.secteur,
    courtier_id: r.courtier_id,
    segment: r.segment as Client["segment"],
    date_entree: r.date_entree,
    actif: bool(r.actif),
    nb_employes: num(r.nb_employes),
    chiffre_affaires_annuel: num(r.chiffre_affaires_annuel),
  }));
}

function mapCompagnies(rows: RawRow[]): Compagnie[] {
  return rows.map((r) => ({
    id: r.id,
    nom: r.nom,
    contact_email: r.contact_email,
    commission_base: num(r.commission_base),
  }));
}

function mapContrats(rows: RawRow[]): Contrat[] {
  return rows.map((r) => ({
    id: r.id,
    client_id: r.client_id,
    courtier_id: r.courtier_id,
    compagnie_id: r.compagnie_id,
    compagnie_nom: r.compagnie_nom,
    numero_police: r.numero_police,
    branche: r.branche as Contrat["branche"],
    statut: r.statut as Contrat["statut"],
    date_debut: r.date_debut,
    date_echeance: r.date_echeance,
    periodicite: r.periodicite as Contrat["periodicite"],
    prime_annuelle: num(r.prime_annuelle),
    commission_taux: num(r.commission_taux),
    commission_annuelle: num(r.commission_annuelle),
    source: r.source,
  }));
}

function mapPrimes(rows: RawRow[]): Prime[] {
  return rows.map((r) => ({
    id: r.id,
    contrat_id: r.contrat_id,
    client_id: r.client_id,
    date_emission: r.date_emission,
    date_echeance: r.date_echeance,
    montant_brut: num(r.montant_brut),
    montant_net: num(r.montant_net),
    statut: r.statut as Prime["statut"],
    date_encaissement: nullable(r.date_encaissement),
  }));
}

function mapProspects(rows: RawRow[]): Prospect[] {
  return rows.map((r) => ({
    id: r.id,
    courtier_id: r.courtier_id,
    raison_sociale: r.raison_sociale,
    ville: r.ville,
    secteur: r.secteur,
    potentiel_prime_annuelle: num(r.potentiel_prime_annuelle),
    statut: r.statut as Prospect["statut"],
    date_premier_contact: r.date_premier_contact,
    date_relance: nullable(r.date_relance),
    motif_perte: nullable(r.motif_perte),
    source: r.source,
    nb_employes: num(r.nb_employes),
  }));
}

function mapRenouvellements(rows: RawRow[]): Renouvellement[] {
  return rows.map((r) => ({
    id: r.id,
    contrat_id: r.contrat_id,
    client_id: r.client_id,
    courtier_id: r.courtier_id,
    branche: r.branche as Renouvellement["branche"],
    prime_actuelle: num(r.prime_actuelle),
    date_echeance: r.date_echeance,
    jours_restants: num(r.jours_restants),
    date_relance_1: nullable(r.date_relance_1),
    date_relance_2: nullable(r.date_relance_2),
    date_relance_3: nullable(r.date_relance_3),
    statut: r.statut as Renouvellement["statut"],
    motif_resiliation: nullable(r.motif_resiliation),
  }));
}

function mapSinistres(rows: RawRow[]): Sinistre[] {
  return rows.map((r) => ({
    id: r.id,
    contrat_id: r.contrat_id,
    client_id: r.client_id,
    courtier_id: r.courtier_id,
    numero_sinistre: r.numero_sinistre,
    branche: r.branche as Sinistre["branche"],
    date_survenance: r.date_survenance,
    date_declaration: r.date_declaration,
    nature: r.nature,
    montant_estime: num(r.montant_estime),
    montant_indemnise: num(r.montant_indemnise),
    statut: r.statut as Sinistre["statut"],
    date_cloture: nullable(r.date_cloture),
    gestionnaire_id: r.gestionnaire_id,
  }));
}

let cached: Dataset | null = null;

export function loadDataset(): Dataset {
  if (cached) return cached;
  cached = {
    clients: mapClients(parseCsv(FILES.clients)),
    compagnies: mapCompagnies(parseCsv(FILES.compagnies)),
    contrats: mapContrats(parseCsv(FILES.contrats)),
    primes: mapPrimes(parseCsv(FILES.primes)),
    prospects: mapProspects(parseCsv(FILES.prospects)),
    renouvellements: mapRenouvellements(parseCsv(FILES.renouvellements)),
    sinistres: mapSinistres(parseCsv(FILES.sinistres)),
  };
  return cached;
}

// Test/dev helper — forces a re-parse on the next loadDataset() call.
export function resetDatasetCache(): void {
  cached = null;
}
