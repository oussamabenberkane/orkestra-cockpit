"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { ModalKey } from "@/lib/types";
import { modalData } from "@/lib/modal-data";
import { X, ArrowRight } from "lucide-react";

interface MercuryModalProps {
  open: boolean;
  modalKey: ModalKey | null;
  onClose: () => void;
}

const sectionTag: Record<ModalKey, string> = {
  finance: "Finance",
  vue360: "Vue d'ensemble",
  sinistres: "Sinistres",
  prospection: "Prospection",
  portefeuille: "Portefeuille",
  agents: "Agents IA",
  rapport: "Rapport",
};

function stripLeadingEmoji(s: string) {
  return s.replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\s·—•]+/u, "").trim();
}

export default function MercuryModal({ open, modalKey, onClose }: MercuryModalProps) {
  const data = modalKey ? modalData[modalKey] : null;
  if (!data || !modalKey) return null;

  const cleanTitle = stripLeadingEmoji(data.title);
  const cleanData = data.data.replace(/[🔴🟡🟢⊕✓✗⚠]+/g, "").trim();

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent
        showCloseButton={false}
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          padding: 0,
          maxWidth: "560px",
          width: "92vw",
          fontFamily: "var(--font-inter-tight)",
          color: "var(--text)",
          boxShadow:
            "0 24px 60px -16px rgba(15,20,25,0.18), 0 8px 20px -8px rgba(15,20,25,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "1.25rem 1.4rem 0.75rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--accent)",
              }}
            />
            <span
              style={{
                fontSize: "0.74rem",
                fontWeight: 600,
                color: "var(--text-2)",
                letterSpacing: "-0.005em",
              }}
            >
              {sectionTag[modalKey]}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              color: "var(--text-2)",
              cursor: "pointer",
            }}
          >
            <X size={14} strokeWidth={2.25} />
          </button>
        </div>

        <div style={{ padding: "1.25rem 1.4rem 0.5rem" }}>
          <h2
            style={{
              fontSize: "1.35rem",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "var(--text)",
              margin: 0,
              marginBottom: "0.5rem",
              lineHeight: 1.2,
            }}
          >
            {cleanTitle}
          </h2>
          <p
            style={{
              fontSize: "0.9rem",
              lineHeight: 1.55,
              color: "var(--text-2)",
              margin: 0,
              marginBottom: "1rem",
            }}
          >
            {data.body}
          </p>
        </div>

        <pre
          style={{
            margin: "0 1.4rem 1.25rem",
            padding: "0.9rem 1rem",
            fontFamily: "var(--font-jbmono), monospace",
            fontSize: "0.78rem",
            lineHeight: 1.7,
            color: "var(--text-2)",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {cleanData}
        </pre>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.5rem",
            padding: "0.85rem 1.4rem",
            borderTop: "1px solid var(--border)",
            background: "var(--bg)",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "0.5rem 0.95rem",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--text-2)",
              fontFamily: "var(--font-inter-tight)",
              fontSize: "0.82rem",
              fontWeight: 500,
              cursor: "pointer",
              borderRadius: "8px",
            }}
          >
            Fermer
          </button>
          <button
            style={{
              padding: "0.5rem 0.95rem",
              background: "var(--accent)",
              border: "1px solid var(--accent)",
              color: "#FFFFFF",
              fontFamily: "var(--font-inter-tight)",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
              borderRadius: "8px",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-2)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
          >
            {data.cta}
            <ArrowRight size={14} strokeWidth={2.25} />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
