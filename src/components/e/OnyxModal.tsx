"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { ModalKey } from "@/lib/types";
import { modalData } from "@/lib/modal-data";
import { X, ArrowRight, Hash } from "lucide-react";

interface OnyxModalProps {
  open: boolean;
  modalKey: ModalKey | null;
  onClose: () => void;
}

const refMap: Record<ModalKey, string> = {
  prospection: "DOM-01",
  portefeuille: "DOM-02",
  sinistres: "DOM-03",
  finance: "DOM-04",
  vue360: "DOM-05",
  agents: "DOM-06",
  rapport: "AGT-03",
};

function stripLeadingEmoji(s: string) {
  return s.replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\s·—•]+/u, "").trim();
}

export default function OnyxModal({ open, modalKey, onClose }: OnyxModalProps) {
  const data = modalKey ? modalData[modalKey] : null;
  if (!data || !modalKey) return null;

  const cleanTitle = stripLeadingEmoji(data.title);
  const cleanData = data.data.replace(/[🔴🟡🟢⊕✓✗⚠]+/g, "").trim();

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent
        showCloseButton={false}
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border-strong)",
          borderRadius: "12px",
          padding: 0,
          maxWidth: "580px",
          width: "92vw",
          fontFamily: "var(--font-sans)",
          color: "var(--text)",
          boxShadow:
            "0 32px 80px -16px rgba(0,0,0,0.6), 0 0 0 1px var(--inset-highlight) inset, 0 8px 24px -10px rgba(129,140,248,0.12)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.85rem 1.1rem",
            borderBottom: "1px solid var(--border)",
            background: "var(--surface)",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              fontFamily: "var(--font-mono)",
              fontSize: "0.74rem",
              color: "var(--text-2)",
              letterSpacing: "0.02em",
            }}
          >
            <Hash size={12} strokeWidth={2} />
            {refMap[modalKey]}
          </span>
          <button
            onClick={onClose}
            aria-label="Fermer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 26,
              height: 26,
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              color: "var(--text-2)",
              cursor: "pointer",
            }}
          >
            <X size={13} strokeWidth={2.25} />
          </button>
        </div>

        <div style={{ padding: "1.25rem 1.4rem 0.6rem" }}>
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
              lineHeight: 1.6,
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
            padding: "0.95rem 1.05rem",
            fontFamily: "var(--font-mono), monospace",
            fontSize: "0.78rem",
            lineHeight: 1.8,
            color: "var(--text-2)",
            background: "var(--surface)",
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
            background: "var(--surface)",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "0.5rem 0.95rem",
              background: "var(--surface-2)",
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
              background: "var(--accent)",
              border: "1px solid var(--accent)",
              color: "#0B0C0F",
              fontFamily: "inherit",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
              borderRadius: "8px",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              transition: "background 0.15s",
              boxShadow: "0 0 0 0 var(--accent-tint), 0 4px 16px -6px var(--accent-tint-2)",
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
