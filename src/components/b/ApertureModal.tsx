"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { ModalKey } from "@/lib/types";
import { modalData } from "@/lib/modal-data";
import { X, ArrowRight } from "lucide-react";

interface ApertureModalProps {
  open: boolean;
  modalKey: ModalKey | null;
  onClose: () => void;
}

const sectionTag: Record<ModalKey, { label: string; tone: string; bg: string }> = {
  finance: { label: "Finance", tone: "var(--warn)", bg: "var(--warn-tint)" },
  vue360: { label: "Vue d'ensemble", tone: "var(--accent)", bg: "var(--accent-tint)" },
  sinistres: { label: "Sinistres", tone: "var(--danger)", bg: "var(--danger-tint)" },
  prospection: { label: "Prospection", tone: "var(--accent)", bg: "var(--accent-tint)" },
  portefeuille: { label: "Portefeuille", tone: "var(--info)", bg: "var(--info-tint)" },
  agents: { label: "Agents IA", tone: "var(--purple)", bg: "var(--purple-tint)" },
  rapport: { label: "Rapport", tone: "var(--accent)", bg: "var(--accent-tint)" },
};

function stripLeadingEmoji(s: string) {
  return s.replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\s·—•]+/u, "").trim();
}

export default function ApertureModal({ open, modalKey, onClose }: ApertureModalProps) {
  const data = modalKey ? modalData[modalKey] : null;
  if (!data || !modalKey) return null;

  const tag = sectionTag[modalKey];
  const cleanTitle = stripLeadingEmoji(data.title);
  const cleanData = data.data.replace(/[🔴🟡🟢⊕✓✗⚠]+/g, "").trim();

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent
        showCloseButton={false}
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "14px",
          padding: 0,
          maxWidth: "600px",
          width: "92vw",
          fontFamily: "var(--font-sans)",
          color: "var(--text)",
          boxShadow:
            "0 32px 80px -24px rgba(15,23,42,0.22), 0 8px 20px -12px rgba(15,23,42,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "1rem 1.4rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.72rem",
              fontWeight: 600,
              color: tag.tone,
              background: tag.bg,
              padding: "0.25rem 0.55rem",
              borderRadius: "100px",
              letterSpacing: "-0.005em",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: tag.tone,
              }}
            />
            {tag.label}
          </span>
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
              borderRadius: "8px",
              color: "var(--text-2)",
              cursor: "pointer",
            }}
          >
            <X size={14} strokeWidth={2.25} />
          </button>
        </div>

        <div style={{ padding: "1.4rem 1.5rem 0.75rem" }}>
          <h2
            style={{
              fontSize: "1.4rem",
              fontWeight: 700,
              letterSpacing: "-0.025em",
              color: "var(--text)",
              margin: 0,
              marginBottom: "0.55rem",
              lineHeight: 1.2,
            }}
          >
            {cleanTitle}
          </h2>
          <p
            style={{
              fontSize: "0.92rem",
              lineHeight: 1.6,
              color: "var(--text-2)",
              margin: 0,
              marginBottom: "1.1rem",
            }}
          >
            {data.body}
          </p>
        </div>

        <div
          style={{
            margin: "0 1.5rem 1.25rem",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "0.55rem 0.95rem",
              background: "var(--surface-3)",
              borderBottom: "1px solid var(--border)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.66rem",
              color: "var(--text-3)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Données combinées
          </div>
          <pre
            style={{
              margin: 0,
              padding: "0.95rem 1.1rem",
              fontFamily: "var(--font-mono), monospace",
              fontSize: "0.78rem",
              lineHeight: 1.8,
              color: "var(--text-2)",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {cleanData}
          </pre>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.5rem",
            padding: "0.95rem 1.5rem",
            borderTop: "1px solid var(--border)",
            background: "var(--surface-2)",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "0.55rem 1rem",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--text-2)",
              fontFamily: "inherit",
              fontSize: "0.84rem",
              fontWeight: 500,
              cursor: "pointer",
              borderRadius: "9px",
            }}
          >
            Fermer
          </button>
          <button
            style={{
              padding: "0.55rem 1.1rem",
              background: "var(--accent)",
              border: "1px solid var(--accent)",
              color: "#FFFFFF",
              fontFamily: "inherit",
              fontSize: "0.84rem",
              fontWeight: 600,
              cursor: "pointer",
              borderRadius: "9px",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              transition: "background 0.15s",
              boxShadow: "0 1px 2px rgba(30,64,175,0.22)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-2)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
          >
            {data.cta}
            <ArrowRight size={13} strokeWidth={2.25} />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
