// Typed row shapes for the seven demo tables in Supabase (seeded from the
// CSV fixtures in /data). Column names mirror the table columns exactly
// (French) so the LLM-facing schema doc and the runtime objects stay in
// lockstep.

export type Branche =
  | "RC_pro"
  | "accident"
  | "cyber"
  | "incendie"
  | "maladie"
  | "protection_juridique"
  | "transport"
  | "vehicule"
  | "vie";

export type Segment = "bronze" | "silver" | "gold";
export type Periodicite = "annuel" | "semestriel" | "trimestriel";
export type ContratStatut = "actif" | "résilié" | "suspendu";
export type PrimeStatut = "encaissée" | "annulée";
export type SinistreStatut = "ouvert" | "en_cours" | "clôturé" | "refusé";
export type RenouvellementStatut =
  | "à_traiter"
  | "en_cours"
  | "en_attente_client"
  | "renouvelé";
export type ProspectStatut =
  | "nouveau"
  | "contacté"
  | "rendez_vous"
  | "offre_envoyée"
  | "gagné"
  | "perdu";

export interface Client {
  id: string;
  raison_sociale: string;
  type: string;
  numero_client: string;
  ville: string;
  code_postal: string;
  secteur: string;
  courtier_id: string;
  segment: Segment;
  date_entree: string;
  actif: boolean;
  nb_employes: number;
  chiffre_affaires_annuel: number;
}

export interface Compagnie {
  id: string;
  nom: string;
  contact_email: string;
  commission_base: number;
}

export interface Contrat {
  id: string;
  client_id: string;
  courtier_id: string;
  compagnie_id: string;
  compagnie_nom: string;
  numero_police: string;
  branche: Branche;
  statut: ContratStatut;
  date_debut: string;
  date_echeance: string;
  periodicite: Periodicite;
  prime_annuelle: number;
  commission_taux: number;
  commission_annuelle: number;
  source: string;
}

export interface Prime {
  id: string;
  contrat_id: string;
  client_id: string;
  date_emission: string;
  date_echeance: string;
  montant_brut: number;
  montant_net: number;
  statut: PrimeStatut;
  date_encaissement: string | null;
}

export interface Prospect {
  id: string;
  courtier_id: string;
  raison_sociale: string;
  ville: string;
  secteur: string;
  potentiel_prime_annuelle: number;
  statut: ProspectStatut;
  date_premier_contact: string;
  date_relance: string | null;
  motif_perte: string | null;
  source: string;
  nb_employes: number;
}

export interface Renouvellement {
  id: string;
  contrat_id: string;
  client_id: string;
  courtier_id: string;
  branche: Branche;
  prime_actuelle: number;
  date_echeance: string;
  jours_restants: number;
  date_relance_1: string | null;
  date_relance_2: string | null;
  date_relance_3: string | null;
  statut: RenouvellementStatut;
  motif_resiliation: string | null;
}

export interface Sinistre {
  id: string;
  contrat_id: string;
  client_id: string;
  courtier_id: string;
  numero_sinistre: string;
  branche: Branche;
  date_survenance: string;
  date_declaration: string;
  nature: string;
  montant_estime: number;
  montant_indemnise: number;
  statut: SinistreStatut;
  date_cloture: string | null;
  gestionnaire_id: string;
}

export interface Dataset {
  clients: Client[];
  compagnies: Compagnie[];
  contrats: Contrat[];
  primes: Prime[];
  prospects: Prospect[];
  renouvellements: Renouvellement[];
  sinistres: Sinistre[];
}
