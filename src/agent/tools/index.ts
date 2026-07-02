// Agent tools — typed function-call surface the LLM is allowed to invoke.
//
// Slim surface: 4 pre-computed KPI aggregators, 2 entity lookups by id, and
// `query_database` for everything compositional (listings with filters,
// joins, aggregates, rankings, comparisons).

import { tool } from "ai";
import { z } from "zod";
import { loadDataset } from "../data/loader";
import { queryDatabase } from "./sql";
import { saveMemory } from "./memory";

const branche = z.enum([
  "RC_pro",
  "accident",
  "cyber",
  "incendie",
  "maladie",
  "protection_juridique",
  "transport",
  "vehicule",
  "vie",
]);

// ---------- KPIs ----------

export const getDashboardKpis = tool({
  description:
    "Snapshot global du cabinet en un seul appel : CA primes annualisé, commissions, contrats actifs, ratio sinistralité, taux de rétention, taux de conversion prospects, sinistres ouverts, renouvellements urgents <30j, prospects actifs.\n\nQuand l'utiliser : questions générales (« comment va le cabinet ? », « résumé », « tableau de bord », « chiffres-clés »).\nQuand ne PAS l'utiliser : questions ciblées sur une branche, une compagnie, un client, ou un classement — préfère alors le bon agrégateur ou query_database.\nRetour : objet avec 11 indicateurs numériques (CHF ou ratios décimaux 0–1).",
  parameters: z.object({}),
  execute: async () => {
    const { clients, contrats, sinistres, prospects, renouvellements } = await loadDataset();

    const contratsActifs = contrats.filter((c) => c.statut === "actif");
    const caPrimes = contratsActifs.reduce((s, c) => s + c.prime_annuelle, 0);
    const commissions = contratsActifs.reduce((s, c) => s + c.commission_annuelle, 0);

    const sinistresExposes = sinistres.filter((s) => s.statut !== "refusé");
    const expositionSinistres = sinistresExposes.reduce(
      (s, x) => s + (x.montant_indemnise || x.montant_estime),
      0,
    );
    const ratioSinistralite = caPrimes > 0 ? expositionSinistres / caPrimes : 0;

    const gagnes = prospects.filter((p) => p.statut === "gagné").length;
    const perdus = prospects.filter((p) => p.statut === "perdu").length;
    const tauxConversion = gagnes + perdus > 0 ? gagnes / (gagnes + perdus) : 0;

    const resilies = contrats.filter((c) => c.statut === "résilié").length;
    const tauxRetention = contrats.length > 0 ? 1 - resilies / contrats.length : 0;

    const renouvellementsEnRetard = renouvellements.filter(
      (r) => r.jours_restants <= 30 && r.statut !== "renouvelé",
    ).length;

    return {
      ca_primes_annuelles_chf: caPrimes,
      commissions_annuelles_chf: commissions,
      contrats_actifs: contratsActifs.length,
      clients_total: clients.length,
      clients_actifs: clients.filter((c) => c.actif).length,
      ratio_sinistralite: Number(ratioSinistralite.toFixed(3)),
      taux_conversion_prospects: Number(tauxConversion.toFixed(3)),
      taux_retention: Number(tauxRetention.toFixed(3)),
      sinistres_ouverts: sinistres.filter((s) => s.statut === "ouvert" || s.statut === "en_cours")
        .length,
      renouvellements_urgents_30j: renouvellementsEnRetard,
      prospects_actifs: prospects.filter(
        (p) => p.statut !== "gagné" && p.statut !== "perdu",
      ).length,
    };
  },
});

export const getRevenueSummary = tool({
  description:
    "Ventilation du CA primes + commissions par branche, compagnie, ou courtier — tous les buckets retournés triés par CA décroissant.\n\nQuand l'utiliser : « d'où vient le CA ? », « répartition par compagnie », « commissions par courtier ».\nQuand ne PAS l'utiliser : si la question croise plusieurs dimensions (ex. « CA par branche ET par compagnie »), filtre dans le temps, ou demande un top-N déjà limité — préfère query_database.\nRetour : { group_by, buckets: [{ <dim>, ca_primes_chf, commissions_chf, nb_contrats }] }.",
  parameters: z.object({
    group_by: z.enum(["branche", "compagnie", "courtier"]).default("branche"),
    only_active: z.boolean().default(true),
  }),
  execute: async ({ group_by, only_active }) => {
    const { contrats } = await loadDataset();
    const rows = only_active ? contrats.filter((c) => c.statut === "actif") : contrats;
    const buckets = new Map<string, { ca: number; commissions: number; count: number }>();
    for (const c of rows) {
      const key = group_by === "branche" ? c.branche : group_by === "compagnie" ? c.compagnie_nom : c.courtier_id;
      const b = buckets.get(key) ?? { ca: 0, commissions: 0, count: 0 };
      b.ca += c.prime_annuelle;
      b.commissions += c.commission_annuelle;
      b.count += 1;
      buckets.set(key, b);
    }
    return {
      group_by,
      buckets: [...buckets.entries()]
        .map(([key, v]) => ({
          [group_by]: key,
          ca_primes_chf: v.ca,
          commissions_chf: v.commissions,
          nb_contrats: v.count,
        }))
        .sort((a, b) => (b.ca_primes_chf as number) - (a.ca_primes_chf as number)),
    };
  },
});

export const getSinistraliteRatio = tool({
  description:
    "Ratio sinistralité (exposition / CA primes) — global ou pour UNE branche, avec décompte de sinistres.\n\nQuand l'utiliser : « ratio cyber ? », « sinistralité globale ? ».\nQuand ne PAS l'utiliser : pour comparer toutes les branches entre elles dans un même tableau classé — préfère query_database (un seul GROUP BY branche).\nRetour : { branche, ca_primes_chf, exposition_sinistres_chf, ratio, nb_sinistres }. Par défaut, les sinistres « refusé » sont exclus.",
  parameters: z.object({
    branche: branche.optional(),
    include_refused: z.boolean().default(false),
  }),
  execute: async ({ branche: filtreBranche, include_refused }) => {
    const { contrats, sinistres } = await loadDataset();
    const contratsFiltres = contrats.filter(
      (c) => c.statut === "actif" && (!filtreBranche || c.branche === filtreBranche),
    );
    const ca = contratsFiltres.reduce((s, c) => s + c.prime_annuelle, 0);
    const sinFiltres = sinistres.filter(
      (s) =>
        (!filtreBranche || s.branche === filtreBranche) &&
        (include_refused || s.statut !== "refusé"),
    );
    const exposition = sinFiltres.reduce(
      (s, x) => s + (x.montant_indemnise || x.montant_estime),
      0,
    );
    return {
      branche: filtreBranche ?? "toutes",
      ca_primes_chf: ca,
      exposition_sinistres_chf: exposition,
      ratio: ca > 0 ? Number((exposition / ca).toFixed(3)) : null,
      nb_sinistres: sinFiltres.length,
    };
  },
});

export const getPipelineSummary = tool({
  description:
    "Pipeline prospects CRM en un appel : total, taux de conversion (gagné / (gagné+perdu)), valeur potentielle des prospects encore ouverts, décompte + valeur par statut.\n\nQuand l'utiliser : « état du pipeline », « combien de prospects », « valeur du pipeline ».\nQuand ne PAS l'utiliser : pour filtrer par secteur, courtier, ville, ou potentiel — préfère query_database.\nRetour : { total, taux_conversion, valeur_pipeline_potentielle_chf, par_statut: [{ statut, nb, valeur_potentielle_chf }] }.",
  parameters: z.object({}),
  execute: async () => {
    const { prospects } = await loadDataset();
    const byStatut = new Map<string, { count: number; valeur: number }>();
    for (const p of prospects) {
      const b = byStatut.get(p.statut) ?? { count: 0, valeur: 0 };
      b.count += 1;
      b.valeur += p.potentiel_prime_annuelle;
      byStatut.set(p.statut, b);
    }
    const gagnes = byStatut.get("gagné")?.count ?? 0;
    const perdus = byStatut.get("perdu")?.count ?? 0;
    return {
      total: prospects.length,
      taux_conversion: gagnes + perdus > 0 ? Number((gagnes / (gagnes + perdus)).toFixed(3)) : null,
      valeur_pipeline_potentielle_chf: prospects
        .filter((p) => p.statut !== "perdu" && p.statut !== "gagné")
        .reduce((s, p) => s + p.potentiel_prime_annuelle, 0),
      par_statut: [...byStatut.entries()].map(([statut, v]) => ({
        statut,
        nb: v.count,
        valeur_potentielle_chf: v.valeur,
      })),
    };
  },
});

// ---------- Entity lookups ----------

const CLIENT_CHILD_PREVIEW = 10;

export const getClient = tool({
  description:
    "Profil d'UN client identifié par son id `CLT###` ou par un fragment de raison sociale : infos client, ses 10 contrats les plus récents, ses 10 sinistres les plus récents, et un résumé de ses primes.\n\nQuand l'utiliser : « parle-moi de CLT042 », « le dossier Acme SA », « combien de sinistres pour ce client ».\nQuand ne PAS l'utiliser : pour TROUVER un client par critère (« le client avec le plus gros portefeuille », « clients de Genève », « clients du courtier C003 ») → query_database. Pour la liste exhaustive de contrats/sinistres d'un client identifié, query_database avec WHERE client_id = '...'.\nRetour : { found: bool, client?, contrats?, contrats_truncated?, sinistres?, sinistres_truncated?, primes_resume?, hint? }.",
  parameters: z.object({
    query: z.string().describe("CLT### ou fragment du nom"),
  }),
  execute: async ({ query }) => {
    const { clients, contrats, sinistres, primes } = await loadDataset();
    const q = query.toLowerCase();
    const client =
      clients.find((c) => c.id.toLowerCase() === q) ??
      clients.find((c) => c.raison_sociale.toLowerCase().includes(q));
    if (!client) return { found: false, query };

    const sesContrats = contrats.filter((c) => c.client_id === client.id);
    const sesSinistres = sinistres.filter((s) => s.client_id === client.id);
    const sesPrimes = primes.filter((p) => p.client_id === client.id);

    const contratsPreview = sesContrats.slice(0, CLIENT_CHILD_PREVIEW).map((c) => ({
      id: c.id,
      branche: c.branche,
      statut: c.statut,
      compagnie_nom: c.compagnie_nom,
      prime_annuelle: c.prime_annuelle,
      date_echeance: c.date_echeance,
    }));
    const sinistresPreview = sesSinistres.slice(0, CLIENT_CHILD_PREVIEW).map((s) => ({
      id: s.id,
      branche: s.branche,
      statut: s.statut,
      date_survenance: s.date_survenance,
      montant_indemnise: s.montant_indemnise,
    }));

    const contratsTruncated = sesContrats.length > CLIENT_CHILD_PREVIEW;
    const sinistresTruncated = sesSinistres.length > CLIENT_CHILD_PREVIEW;

    return {
      found: true,
      client: {
        id: client.id,
        raison_sociale: client.raison_sociale,
        segment: client.segment,
        ville: client.ville,
        secteur: client.secteur,
        courtier_id: client.courtier_id,
        actif: client.actif,
        nb_employes: client.nb_employes,
      },
      contrats: contratsPreview,
      contrats_truncated: contratsTruncated,
      sinistres: sinistresPreview,
      sinistres_truncated: sinistresTruncated,
      primes_resume: {
        total: sesPrimes.length,
        encaissees: sesPrimes.filter((p) => p.statut === "encaissée").length,
        annulees: sesPrimes.filter((p) => p.statut === "annulée").length,
        montant_total_encaisse_chf: sesPrimes
          .filter((p) => p.statut === "encaissée")
          .reduce((s, p) => s + p.montant_net, 0),
      },
      hint:
        contratsTruncated || sinistresTruncated
          ? `Plus de ${CLIENT_CHILD_PREVIEW} contrats ou sinistres : utilise query_database avec WHERE client_id = '${client.id}' pour la liste complète.`
          : undefined,
    };
  },
});

export const getContrat = tool({
  description:
    "Détail d'UN contrat identifié par son id `POL####` : objet contrat complet + sinistres rattachés + primes liées.\n\nQuand l'utiliser : « détails de POL1234 », « sinistres sur ce contrat ».\nQuand ne PAS l'utiliser : pour LISTER des contrats par critère (« contrats résiliés en 2025 », « contrats AXA branche cyber », « top 10 contrats par prime ») → query_database.\nRetour : { found: bool, contrat?, sinistres?, primes? }.",
  parameters: z.object({ id: z.string().describe("Identifiant exact de contrat (`POL####`).") }),
  execute: async ({ id }) => {
    const { contrats, sinistres, primes } = await loadDataset();
    const contrat = contrats.find((c) => c.id === id);
    if (!contrat) return { found: false, id };
    return {
      found: true,
      contrat,
      sinistres: sinistres.filter((s) => s.contrat_id === id),
      primes: primes.filter((p) => p.contrat_id === id),
    };
  },
});

// Single export the runtime hands to `generateText` / `streamText`.
export const agentTools = {
  get_dashboard_kpis: getDashboardKpis,
  get_revenue_summary: getRevenueSummary,
  get_sinistralite_ratio: getSinistraliteRatio,
  get_pipeline_summary: getPipelineSummary,
  get_client: getClient,
  get_contrat: getContrat,
  query_database: queryDatabase,
  save_memory: saveMemory,
};
