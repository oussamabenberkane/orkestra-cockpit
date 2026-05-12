"use client";

import { useState } from "react";
import type { AgentCardProps } from "@/lib/types";

export default function AgentCard({
  icon,
  name,
  desc,
  sourceLabel,
  sourceColor,
  primaryLabel,
  onPrimary,
}: AgentCardProps) {
  const [validated, setValidated] = useState(false);

  const handlePrimary = () => {
    setValidated(true);
    onPrimary();
  };

  return (
    <div
      style={{
        background: "#F4F6FB",
        border: "1px solid #E4E7F0",
        borderRadius: "10px",
        padding: "0.85rem",
        opacity: validated ? 0.4 : 1,
        pointerEvents: validated ? "none" : "auto",
        transition: "opacity 0.3s",
      }}
    >
      <div
        style={{
          fontSize: "0.8rem",
          fontWeight: 700,
          color: "#1A1F36",
          marginBottom: "0.35rem",
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
        }}
      >
        {icon} {name}
      </div>
      <div
        style={{
          fontSize: "0.7rem",
          color: "#6B7280",
          lineHeight: 1.4,
          marginBottom: "0.65rem",
        }}
      >
        {desc}
        <br />
        <span style={{ color: sourceColor, fontSize: "0.65rem" }}>{sourceLabel}</span>
      </div>
      <div style={{ display: "flex", gap: "0.4rem" }}>
        <button
          onClick={handlePrimary}
          style={{
            flex: 1,
            padding: "0.35rem",
            borderRadius: "6px",
            fontSize: "0.72rem",
            fontWeight: 600,
            cursor: "pointer",
            background: "#ECFDF5",
            color: "#10B981",
            border: "1px solid #A7F3D0",
            fontFamily: "inherit",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#D1FAE5")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#ECFDF5")}
        >
          {validated ? "✓ Validé" : `✓ ${primaryLabel}`}
        </button>
        <button
          style={{
            flex: 1,
            padding: "0.35rem",
            borderRadius: "6px",
            fontSize: "0.72rem",
            fontWeight: 600,
            cursor: "pointer",
            border: "1px solid #E4E7F0",
            background: "white",
            color: "#6B7280",
            fontFamily: "inherit",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#F4F6FB")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
        >
          ✗ Ignorer
        </button>
      </div>
    </div>
  );
}
