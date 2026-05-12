"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { ModalKey } from "@/lib/types";
import { modalData } from "@/lib/modal-data";
import { X, ArrowRight } from "lucide-react";

interface HaloModalProps {
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

export default function HaloModal({ open, modalKey, onClose }: HaloModalProps) {
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
          borderRadius: "14px",
          padding: 0,
          maxWidth: "580px",
          width: "92vw",
          fontFamily: "var(--font-sans)",
          color: "var(--text)",
          boxShadow:
            "0 28px 70px -20px rgba(31,30,27,0.18), 0 8px 24px -12px rgba(31,30,27,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "1.1rem 1.4rem 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <span
            style={{
              fontSize: "0.66rem",
              fontWeight: 600,
              color: "var(--accent)",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            {sectionTag[modalKey]}
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
              color: "var(--text-3)",
              cursor: "pointer",
            }}
          >
            <X size={14} strokeWidth={2.25} />
          </button>
        </div>

        <div style={{ padding: "1rem 1.5rem 0.75rem" }}>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 600,
              letterSpacing: "-0.025em",
              color: "var(--text)",
              margin: 0,
              marginBottom: "0.6rem",
              lineHeight: 1.15,
            }}
          >
            {cleanTitle}
          </h2>
          <p
            style={{
              fontSize: "0.96rem",
              lineHeight: 1.6,
              color: "var(--text-2)",
              margin: 0,
              marginBottom: "1.25rem",
              maxWidth: "52ch",
            }}
          >
            {data.body}
          </p>
        </div>

        <pre
          style={{
            margin: "0 1.5rem 1.5rem",
            padding: "1rem 1.1rem",
            fontFamily: "var(--font-mono), monospace",
            fontSize: "0.78rem",
            lineHeight: 1.85,
            color: "var(--text-2)",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
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
            gap: "0.6rem",
            padding: "1rem 1.5rem 1.25rem",
            borderTop: "1px solid var(--border)",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "0.55rem 1rem",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--text-2)",
              fontFamily: "var(--font-sans)",
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
              fontFamily: "var(--font-sans)",
              fontSize: "0.84rem",
              fontWeight: 600,
              cursor: "pointer",
              borderRadius: "9px",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              transition: "background 0.15s",
              boxShadow: "0 1px 2px rgba(31,111,91,0.18)",
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
