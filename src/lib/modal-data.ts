import type { ModalData, ModalKey } from "./types";

export const modalData: Record<ModalKey, ModalData> = {
  finance: {
    title: "💰 Finance & Trésorerie — Vue combinée",
    body: "Ce rapport combine les données de commissions BrokerStar avec la comptabilité Odoo. C'est un KPI impossible à obtenir depuis un seul système.",
    data: "SOURCES COMBINÉES — BrokerStar + Odoo\n\n[BrokerStar] Commissions encaissées : 11 200 CHF\n[BrokerStar] Primes en attente : 4 800 CHF\n[Odoo] Charges fixes juin : 8 400 CHF\n[Odoo] Impayés clients : 3 200 CHF\n\n[⊕ Combiné] Marge nette réelle : 68%\n[⊕ Combiné] Cash-flow net : +18 400 CHF",
    cta: "Exporter rapport",
  },
  vue360: {
    title: "🌐 Vue 360° — Vision globale cabinet",
    body: "La Vue 360° combine toutes vos sources pour donner une vision complète et consolidée de votre cabinet en temps réel.",
    data: "[⊕ BrokerStar + Odoo] VUE GLOBALE\n\nCA mensuel consolidé : 92 400 CHF\nMarge nette réelle : 68%\nTaux de rétention : 87%\nCash-flow prévisionnel : +18K CHF\n\n[BS] BrokerStar — sync il y a 3 min\n[Odoo] Odoo — sync il y a 5 min\n\nCes KPIs combinent les deux sources\nImpossible dans un seul ERP",
    cta: "Voir les détails",
  },
  sinistres: {
    title: "🔥 Sinistres — Dossiers actifs",
    body: "Suivi des dossiers sinistres avec calcul du ratio sinistralité.",
    data: "[BrokerStar] DOSSIERS OUVERTS\n\n🔴 URGENT — SIN-0047\nClient : Dubois SA — RC Pro\nOuvert : 26/03/2026 (68 jours)\nMontant estimé : 24 000 CHF\n\n🟡 SIN-0051 — En cours\nMartin & Cie — Incendie (27 jours)\n\n🟢 SIN-0053 — En cours\nRossi SA — Véhicule (8 jours)\n\n[⊕] Ratio sinistralité / CA : 12%",
    cta: "Traiter SIN-0047",
  },
  prospection: {
    title: "🎯 Prospection — Pipeline BrokerStar",
    body: "Suivi du pipeline commercial depuis le CRM BrokerStar.",
    data: "[BrokerStar CRM] PIPELINE ACTIF\n\nNouveaux contacts : 3\nEn qualification : 4\nOffres envoyées : 3\nRDV planifiés : 2\n\nTaux de conversion : 18%\nMoyenne marché : 24%\n\nAgent IA : 3 prospects à relancer",
    cta: "Voir les prospects",
  },
  portefeuille: {
    title: "📋 Portefeuille — BrokerStar",
    body: "Vue complète du portefeuille de contrats actifs.",
    data: "[BrokerStar] PAR BRANCHE\n\nRC Professionnelle : 42 contrats\nIncendie & bâtiment : 38 contrats\nVéhicules : 51 contrats\nVie & prévoyance : 28 contrats\nMaladie & accident : 30 contrats\n\nRenouvellements J-30 : 4 contrats\nPrimes concernées : 18 400 CHF",
    cta: "Valider les relances",
  },
  agents: {
    title: "🤖 Agents IA — 3 actions en attente",
    body: "Vos agents ont travaillé pendant la nuit sur les données combinées.",
    data: "ACTIONS EN ATTENTE\n\n1. [BS] Agent Renouvellement\n   4 emails — primes 18 400 CHF\n\n2. [Odoo] Agent Impayé\n   Relance Rossi SA — 1 800 CHF\n\n3. [⊕] Agent Rapport direction\n   BrokerStar + Odoo combinés\n\nToutes actions loguées — LPD 🇨🇭",
    cta: "Tout valider",
  },
  rapport: {
    title: "📄 Rapport direction — Combiné",
    body: "Rapport généré automatiquement — BrokerStar + Odoo.",
    data: "RAPPORT DIRECTION — Juin 2026\n\n[BS] CA primes : 85 000 CHF/an\n[Odoo] Charges : 27 200 CHF/mois\n[⊕] Marge nette : 68%\n[⊕] Cash-flow 3 mois : +54K CHF\n\nActions agents IA cette semaine :\n✓ 4 relances renouvellement\n✓ 2 relances impayés\n✓ Rapport financier combiné",
    cta: "Envoyer aux associés",
  },
};
