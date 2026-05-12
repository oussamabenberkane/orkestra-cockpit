"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { ModalKey } from "@/lib/types";
import { modalData } from "@/lib/modal-data";
import { X, ArrowRight } from "lucide-react";

interface BureauModalProps {
  open: boolean;
  modalKey: ModalKey | null;
  onClose: () => void;
}

const sectionTag: Record<ModalKey, { label: string; tone: string; bg: string }> = {
  finance: { label: "Finance", tone: "var(--warn)", bg: "var(--warn-tint)" },
  vue360: { label: "Vue d'ensemble", tone: "var(--brand)", bg: "var(--brand-tint)" },
  sinistres: { label: "Sinistres", tone: "var(--danger)", bg: "var(--danger-tint)" },
  prospection: { label: "Prospection", tone: "var(--brand)", bg: "var(--brand-tint)" },
  portefeuille: { label: "Portefeuille", tone: "var(--info)", bg: "var(--info-tint)" },
  agents: { label: "Agents IA", tone: "var(--accent)", bg: "var(--accent-tint)" },
  rapport: { label: "Rapport", tone: "var(--brand)", bg: "var(--brand-tint)" },
};

function stripLeadingEmoji(s: string) {
  return s.replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\s·—•]+/u, "").trim();
}

export default function BureauModal({ open, modalKey, onClose }: BureauModalProps) {
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
          borderRadius: "12px",
          padding: 0,
          maxWidth: "580px",
          width: "92vw",
          fontFamily: "var(--font-manrope)",
          color: "var(--text)",
          boxShadow:
            "0 24px 60px -16px rgba(15,23,42,0.18), 0 8px 20px -10px rgba(15,23,42,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "1rem 1.25rem",
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
              borderRadius: "6px",
              letterSpacing: "0.01em",
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
              borderRadius: "6px",
              color: "var(--text-2)",
              cursor: "pointer",
            }}
          >
            <X size={14} strokeWidth={2.25} />
          </button>
        </div>

        <div style={{ padding: "1.25rem 1.4rem 0.65rem" }}>
          <h2
            style={{
              fontSize: "1.35rem",
              fontWeight: 700,
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
              lineHeight: 1.6,
              color: "var(--text-2)",
              margin: 0,
              marginBottom: "1rem",
            }}
          >
            {data.body}
          </p>
        </div>

        <div
          style={{
            margin: "0 1.4rem 1.25rem",
            padding: 0,
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "0.5rem 0.85rem",
              background: "var(--surface-3)",
              borderBottom: "1px solid var(--border)",
              fontFamily: "var(--font-jbmono)",
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
              padding: "0.85rem 1rem",
              fontFamily: "var(--font-jbmono), monospace",
              fontSize: "0.78rem",
              lineHeight: 1.75,
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
            padding: "0.85rem 1.4rem",
            borderTop: "1px solid var(--border)",
            background: "var(--surface-2)",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "0.5rem 0.95rem",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--text-2)",
              fontFamily: "inherit",
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
              background: "var(--brand)",
              border: "1px solid var(--brand)",
              color: "#FFFFFF",
              fontFamily: "inherit",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
              borderRadius: "8px",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--brand-2)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--brand)")}
          >
            {data.cta}
            <ArrowRight size={13} strokeWidth={2.25} />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
