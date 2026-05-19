import type { ModalData, ModalKey } from "./types";
import type { ModalValues } from "./dashboard-data";

/* Modal content. Each entry is a flat array of typed sections — the
 * DashboardModal renderer picks a dedicated, responsive component per
 * section kind. No string parsing, no implicit layout choices. */
export const modalData: Record<ModalKey, ModalData> = {
  finance: {
    title: "Finance & Trésorerie — Vue combinée",
    body: "Ce rapport combine les données de commissions BrokerStar avec la comptabilité Odoo. C'est un KPI impossible à obtenir depuis un seul système.",
    sections: [
      {
        kind: "kv-list",
        subtitle: "Sources combinées — BrokerStar + Odoo",
        rows: [
          { source: "BrokerStar", label: "Commissions encaissées", value: "11 200 CHF" },
          { source: "BrokerStar", label: "Primes en attente",       value: "4 800 CHF" },
          { source: "Odoo",       label: "Charges fixes juin",      value: "8 400 CHF" },
          { source: "Odoo",       label: "Impayés clients",         value: "3 200 CHF" },
          { combined: true,       label: "Marge nette réelle",      value: "68 %" },
          { combined: true,       label: "Cash-flow net",           value: "+18 400 CHF" },
        ],
      },
    ],
    cta: "Exporter rapport",
  },

  vue360: {
    title: "Vue 360° — Vision globale cabinet",
    body: "La Vue 360° combine toutes vos sources pour donner une vision complète et consolidée de votre cabinet en temps réel.",
    sections: [
      {
        kind: "kv-list",
        subtitle: "BrokerStar + Odoo — Vue globale",
        rows: [
          { label: "CA mensuel consolidé",     value: "92 400 CHF" },
          { label: "Marge nette réelle",       value: "68 %" },
          { label: "Taux de rétention",        value: "87 %" },
          { label: "Cash-flow prévisionnel",   value: "+18 K CHF" },
        ],
      },
      {
        kind: "kv-list",
        subtitle: "Synchronisations",
        rows: [
          { source: "BrokerStar", label: "Dernière sync", value: "il y a 3 min" },
          { source: "Odoo",       label: "Dernière sync", value: "il y a 5 min" },
        ],
      },
      {
        kind: "footnote",
        text: "Ces KPIs combinent les deux sources — impossible dans un seul ERP.",
      },
    ],
    cta: "Voir les détails",
  },

  sinistres: {
    title: "Sinistres — Dossiers actifs",
    body: "Suivi des dossiers sinistres avec calcul du ratio sinistralité.",
    sections: [
      {
        kind: "status-list",
        subtitle: "BrokerStar — Dossiers ouverts",
        rows: [
          {
            tone: "danger",
            title: "SIN-0047 · Dubois SA — RC Pro",
            detail: "Ouvert 26/03/2026 (68 jours) · estimé 24 000 CHF",
          },
          {
            tone: "warn",
            title: "SIN-0051 · Martin & Cie — Incendie",
            detail: "Ouvert depuis 27 jours",
          },
          {
            tone: "good",
            title: "SIN-0053 · Rossi SA — Véhicule",
            detail: "Ouvert depuis 8 jours",
          },
        ],
      },
      {
        kind: "kv-list",
        rows: [
          { combined: true, label: "Ratio sinistralité / CA", value: "12 %" },
        ],
      },
    ],
    cta: "Traiter SIN-0047",
  },

  prospection: {
    title: "Prospection — Pipeline BrokerStar",
    body: "Suivi du pipeline commercial depuis le CRM BrokerStar.",
    sections: [
      {
        kind: "kv-list",
        subtitle: "BrokerStar CRM — Pipeline actif",
        rows: [
          { label: "Nouveaux contacts",  value: "3" },
          { label: "En qualification",   value: "4" },
          { label: "Offres envoyées",    value: "3" },
          { label: "RDV planifiés",      value: "2" },
        ],
      },
      {
        kind: "kv-list",
        rows: [
          { label: "Taux de conversion",  value: "18 %" },
          { label: "Moyenne marché",      value: "24 %" },
        ],
      },
      {
        kind: "footnote",
        text: "Agent IA : 3 prospects à relancer.",
      },
    ],
    cta: "Voir les prospects",
  },

  portefeuille: {
    title: "Portefeuille — BrokerStar",
    body: "Vue complète du portefeuille de contrats actifs.",
    sections: [
      {
        kind: "kv-list",
        subtitle: "BrokerStar — Par branche",
        rows: [
          { label: "RC Professionnelle",   value: "42 contrats" },
          { label: "Incendie & bâtiment",  value: "38 contrats" },
          { label: "Véhicules",            value: "51 contrats" },
          { label: "Vie & prévoyance",     value: "28 contrats" },
          { label: "Maladie & accident",   value: "30 contrats" },
        ],
      },
      {
        kind: "kv-list",
        subtitle: "Renouvellements J-30",
        rows: [
          { label: "Contrats concernés",   value: "4" },
          { label: "Primes concernées",    value: "18 400 CHF" },
        ],
      },
    ],
    cta: "Valider les relances",
  },

  agents: {
    title: "Agents IA — 3 actions en attente",
    body: "Vos agents ont travaillé pendant la nuit sur les données combinées.",
    sections: [
      {
        kind: "action-list",
        subtitle: "Actions en attente",
        items: [
          {
            source: "BrokerStar",
            title: "Agent Renouvellement",
            detail: "4 emails — primes 18 400 CHF",
          },
          {
            source: "Odoo",
            title: "Agent Impayé",
            detail: "Relance Rossi SA — 1 800 CHF",
          },
          {
            source: "Combiné",
            title: "Agent Rapport direction",
            detail: "BrokerStar + Odoo combinés",
          },
        ],
      },
      {
        kind: "footnote",
        text: "Toutes actions loguées — conforme LPD Art.16.",
      },
    ],
    cta: "Tout valider",
  },

  rapport: {
    title: "Rapport direction — Combiné",
    body: "Rapport généré automatiquement — BrokerStar + Odoo.",
    sections: [
      {
        kind: "kv-list",
        subtitle: "Rapport direction — Juin 2026",
        rows: [
          { source: "BrokerStar", label: "CA primes",        value: "85 000 CHF/an" },
          { source: "Odoo",       label: "Charges",          value: "27 200 CHF/mois" },
          { combined: true,       label: "Marge nette",      value: "68 %" },
          { combined: true,       label: "Cash-flow 3 mois", value: "+54 K CHF" },
        ],
      },
      {
        kind: "action-list",
        subtitle: "Actions agents IA cette semaine",
        items: [
          { title: "4 relances renouvellement" },
          { title: "2 relances impayés" },
          { title: "Rapport financier combiné" },
        ],
      },
    ],
    cta: "Envoyer aux associés",
  },
};

/**
 * Returns modal data with KV-row values replaced by live Supabase values.
 * Falls back to the static `modalData` when `vals` is null or a view returns no data.
 * Only `value` strings in kv-list rows are replaced; titles, bodies, CTAs are static.
 */
export function getModalData(vals: ModalValues | null): Record<ModalKey, ModalData> {
  if (!vals) return modalData;

  const { satellites: sat, finance: fin, prospection: pros, portefeuille: port } = vals;

  const fmtCHF = (n: number) =>
    `${Math.round(n).toLocaleString("fr-CH")} CHF`;
  const fmtPct = (n: number) => `${Math.round(n)} %`;
  const fmtCashflowCHF = (n: number) =>
    `${n >= 0 ? "+" : ""}${Math.round(n).toLocaleString("fr-CH")} CHF`;
  const fmtCashflowK = (n: number) =>
    `${n >= 0 ? "+" : ""}${Math.round(n / 1000)} K CHF`;

  const financeModal: ModalData = !fin && !sat ? modalData.finance : {
    ...modalData.finance,
    sections: [
      {
        kind: "kv-list" as const,
        subtitle: "Sources combinées — BrokerStar + Odoo",
        rows: [
          { source: "BrokerStar", label: "Commissions encaissées", value: fin ? fmtCHF(fin.commissions_actives) : "11 200 CHF" },
          { source: "BrokerStar", label: "Primes en attente",       value: "4 800 CHF" },
          { source: "Odoo",       label: "Charges fixes juin",      value: "8 400 CHF" },
          { source: "Odoo",       label: "Impayés clients",         value: sat ? fmtCHF(sat.impayes_montant) : "3 200 CHF" },
          { combined: true,       label: "Marge nette réelle",      value: sat ? fmtPct(sat.marge_pct) : "68 %" },
          { combined: true,       label: "Cash-flow net",           value: sat ? fmtCashflowCHF(sat.cashflow_net) : "+18 400 CHF" },
        ],
      },
    ],
  };

  const vue360Modal: ModalData = !sat ? modalData.vue360 : {
    ...modalData.vue360,
    sections: [
      {
        kind: "kv-list" as const,
        subtitle: "BrokerStar + Odoo — Vue globale",
        rows: [
          { label: "CA mensuel consolidé",     value: "92 400 CHF" },
          { label: "Marge nette réelle",       value: fmtPct(sat.marge_pct) },
          { label: "Taux de rétention",        value: fmtPct(sat.retention_pct) },
          { label: "Cash-flow prévisionnel",   value: fmtCashflowK(sat.cashflow_net) },
        ],
      },
      ...modalData.vue360.sections.slice(1),
    ],
  };

  const prospectionModal: ModalData = !pros ? modalData.prospection : {
    ...modalData.prospection,
    sections: [
      modalData.prospection.sections[0],
      {
        kind: "kv-list" as const,
        rows: [
          { label: "Taux de conversion", value: fmtPct(pros.taux_conversion_pct) },
          { label: "Moyenne marché",     value: "24 %" },
        ],
      },
      ...modalData.prospection.sections.slice(2),
    ],
  };

  const portefeuilleModal: ModalData = !port ? modalData.portefeuille : {
    ...modalData.portefeuille,
    sections: [
      modalData.portefeuille.sections[0],
      {
        kind: "kv-list" as const,
        subtitle: "Renouvellements J-30",
        rows: [
          { label: "Contrats concernés", value: String(port.renouvellements_j30) },
          { label: "Primes concernées",  value: "18 400 CHF" },
        ],
      },
    ],
  };

  return {
    ...modalData,
    finance:      financeModal,
    vue360:       vue360Modal,
    prospection:  prospectionModal,
    portefeuille: portefeuilleModal,
  };
}
