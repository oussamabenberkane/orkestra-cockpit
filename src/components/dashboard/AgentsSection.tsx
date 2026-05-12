"use client";

import AgentCard from "./AgentCard";
import type { ModalKey } from "@/lib/types";

interface AgentsSectionProps {
  onOpenModal: (key: ModalKey) => void;
}

export default function AgentsSection({ onOpenModal }: AgentsSectionProps) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #E4E7F0",
        borderRadius: "14px",
        padding: "1.1rem 1.25rem",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <div
          style={{
            fontSize: "0.88rem",
            fontWeight: 700,
            color: "#1E2761",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <div
            className="animate-blink"
            style={{
              width: 8,
              height: 8,
              background: "#10B981",
              borderRadius: "50%",
            }}
          />
          Agents IA — Actions en attente
        </div>
        <span className="agents-lpd-text" style={{ fontSize: "0.72rem", color: "#6B7280" }}>
          🇨🇭 LLM souverain Infomaniak — LPD conforme
        </span>
      </div>

      {/* Grid */}
      <div className="agents-grid-responsive">
        <AgentCard
          icon="📧"
          name="Agent Renouvellement"
          desc="4 emails rédigés — Échéances J-28"
          sourceLabel="Source : BrokerStar"
          sourceColor="#2B3AE8"
          primaryLabel="Valider"
          onPrimary={() => {}}
        />
        <AgentCard
          icon="⚡"
          name="Agent Impayé"
          desc="Relance Rossi SA — 1 800 CHF — 67j"
          sourceLabel="Source : Odoo"
          sourceColor="#8B5CF6"
          primaryLabel="Valider"
          onPrimary={() => {}}
        />
        <AgentCard
          icon="📄"
          name="Agent Rapport"
          desc="Rapport direction — BrokerStar + Odoo"
          sourceLabel="⊕ Source combinée"
          sourceColor="#10B981"
          primaryLabel="Voir"
          onPrimary={() => onOpenModal("rapport")}
        />
      </div>
    </div>
  );
}
