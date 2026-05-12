"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { SettingRow } from "@/lib/types";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

const settingRows: SettingRow[] = [
  { label: "Alertes automatiques", desc: "Recevoir les alertes en temps réel" },
  { label: "Agents IA actifs", desc: "Activer les automations IA" },
  { label: "Sync BrokerStar", desc: "Synchronisation toutes les 5 minutes" },
  { label: "Sync Odoo", desc: "Synchronisation toutes les 5 minutes" },
  { label: "Audit trail LPD", desc: "Journalisation de toutes les actions" },
];

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const [toggles, setToggles] = useState<boolean[]>(settingRows.map(() => true));

  const toggle = (i: number) => {
    setToggles((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent
        style={{
          borderRadius: "16px",
          padding: "1.75rem",
          maxWidth: "480px",
          width: "92vw",
          border: "1px solid #E4E7F0",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif",
        }}
      >
        <DialogHeader>
          <DialogTitle
            style={{
              fontSize: "1rem",
              fontWeight: 800,
              color: "#1E2761",
              marginBottom: "0.25rem",
            }}
          >
            ⚙️ Paramètres Orkestra
          </DialogTitle>
          <DialogDescription
            style={{ fontSize: "0.82rem", color: "#6B7280", lineHeight: 1.6 }}
          >
            Configurez votre cockpit et vos préférences.
          </DialogDescription>
        </DialogHeader>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.75rem" }}>
          {settingRows.map((row, i) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.75rem 1rem",
                background: "#F4F6FB",
                borderRadius: "10px",
                border: "1px solid #E4E7F0",
              }}
            >
              <div>
                <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1A1F36" }}>
                  {row.label}
                </div>
                <div style={{ fontSize: "0.7rem", color: "#6B7280", marginTop: "2px" }}>
                  {row.desc}
                </div>
              </div>

              {/* Toggle */}
              <div
                onClick={() => toggle(i)}
                style={{
                  width: "40px",
                  height: "22px",
                  background: toggles[i] ? "#10B981" : "#E4E7F0",
                  borderRadius: "11px",
                  position: "relative",
                  cursor: "pointer",
                  transition: "background 0.2s",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    width: "18px",
                    height: "18px",
                    background: "white",
                    borderRadius: "50%",
                    top: "2px",
                    left: toggles[i] ? "20px" : "2px",
                    transition: "left 0.2s",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <DialogFooter style={{ gap: "0.75rem", marginTop: "1.25rem" }}>
          <button
            onClick={onClose}
            style={{
              padding: "0.45rem 1.1rem",
              borderRadius: "8px",
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer",
              background: "#F4F6FB",
              color: "#6B7280",
              border: "1px solid #E4E7F0",
              fontFamily: "inherit",
              transition: "all 0.15s",
            }}
          >
            Fermer
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "0.45rem 1.1rem",
              borderRadius: "8px",
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer",
              background: "#2B3AE8",
              color: "white",
              border: "none",
              fontFamily: "inherit",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#1E2BD4")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#2B3AE8")}
          >
            Sauvegarder
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
