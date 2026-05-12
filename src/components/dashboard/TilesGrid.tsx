"use client";

import Tile from "./Tile";
import type { ModalKey } from "@/lib/types";

const PillBS = () => (
  <span
    style={{
      background: "#EFF6FF",
      color: "#2563EB",
      border: "1px solid #BFDBFE",
      borderRadius: "6px",
      padding: "0.2rem 0.5rem",
      fontSize: "0.6rem",
      fontWeight: 600,
    }}
  >
    BrokerStar
  </span>
);

const PillOD = () => (
  <span
    style={{
      background: "#F5F3FF",
      color: "#7C3AED",
      border: "1px solid #DDD6FE",
      borderRadius: "6px",
      padding: "0.2rem 0.5rem",
      fontSize: "0.6rem",
      fontWeight: 600,
    }}
  >
    Odoo
  </span>
);

const PillCMB = () => (
  <span
    style={{
      background: "#ECFDF5",
      color: "#10B981",
      border: "1px solid #A7F3D0",
      borderRadius: "6px",
      padding: "0.2rem 0.5rem",
      fontSize: "0.6rem",
      fontWeight: 600,
    }}
  >
    ⊕ Combiné
  </span>
);

interface TilesGridProps {
  onOpenModal: (key: ModalKey) => void;
}

export default function TilesGrid({ onOpenModal }: TilesGridProps) {
  const tiles = [
    {
      icon: "🎯",
      title: "Prospection",
      metric: "18%",
      sub: "Taux conversion — 12 prospects actifs",
      alert: "📞 3 relances dues aujourd'hui",
      color: "teal" as const,
      headerPill: <PillBS />,
      sourcePills: <PillBS />,
      modalKey: "prospection" as ModalKey,
    },
    {
      icon: "📋",
      title: "Portefeuille",
      metric: "189",
      sub: "Contrats actifs — 85K CHF primes",
      alert: "🔄 4 renouvellements J-30",
      color: "green" as const,
      headerPill: <PillBS />,
      sourcePills: <PillBS />,
      modalKey: "portefeuille" as ModalKey,
    },
    {
      icon: "🔥",
      title: "Sinistres",
      metric: "3",
      sub: "Dossiers ouverts — ratio 12% CA",
      alert: "⚡ 1 dossier urgent — 68 jours",
      color: "red" as const,
      headerPill: <PillBS />,
      sourcePills: <PillBS />,
      modalKey: "sinistres" as ModalKey,
    },
    {
      icon: "💰",
      title: "Finance",
      metric: "+18K",
      sub: "Cash-flow net — Commissions 11.2K",
      alert: "⚠️ 2 impayés — 3 200 CHF",
      color: "orange" as const,
      headerPill: <PillCMB />,
      sourcePills: (
        <>
          <PillBS />
          <PillOD />
        </>
      ),
      sourceLabel: "Sources :",
      modalKey: "finance" as ModalKey,
    },
    {
      icon: "🌐",
      title: "Vue 360°",
      metric: "68%",
      sub: "Marge nette — Vision globale cabinet",
      alert: "💡 +4% vs marché CH",
      color: "malyz" as const,
      headerPill: <PillCMB />,
      sourcePills: (
        <>
          <PillBS />
          <PillOD />
        </>
      ),
      sourceLabel: "Sources :",
      modalKey: "vue360" as ModalKey,
    },
    {
      icon: "🤖",
      title: "Agents IA",
      metric: "3",
      sub: "Actions en attente de validation",
      alert: "✋ Validation requise",
      color: "purple" as const,
      headerPill: undefined,
      sourcePills: (
        <>
          <PillBS />
          <PillOD />
        </>
      ),
      sourceLabel: "Sources :",
      modalKey: "agents" as ModalKey,
    },
  ];

  return (
    <div className="tiles-grid-responsive">
      {tiles.map((tile, i) => (
        <Tile key={tile.title} {...tile} index={i} onOpenModal={onOpenModal} />
      ))}
    </div>
  );
}
