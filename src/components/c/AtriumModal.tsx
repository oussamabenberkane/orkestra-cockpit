"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { ModalKey } from "@/lib/types";
import { modalData } from "@/lib/modal-data";
import { X, ArrowRight, Hash } from "lucide-react";

interface AtriumModalProps {
  open: boolean;
  modalKey: ModalKey | null;
  onClose: () => void;
}

const idMap: Record<ModalKey, string> = {
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

export default function AtriumModal({ open, modalKey, onClose }: AtriumModalProps) {
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
          borderRadius: "10px",
          padding: 0,
          maxWidth: "560px",
          width: "92vw",
          fontFamily: "var(--font-geist)",
          color: "var(--text)",
          boxShadow: "0 16px 40px -12px rgba(10,10,10,0.18)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.75rem 1rem",
            borderBottom: "1px solid var(--border)",
            background: "var(--surface-2)",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              fontFamily: "var(--font-geist-mono)",
              fontSize: "0.72rem",
              color: "var(--text-3)",
              letterSpacing: "0.02em",
            }}
          >
            <Hash size={11} strokeWidth={2} />
            {idMap[modalKey]}
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
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              color: "var(--text-3)",
              cursor: "pointer",
            }}
          >
            <X size={13} strokeWidth={2.25} />
          </button>
        </div>

        <div style={{ padding: "1.1rem 1.25rem 0.5rem" }}>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "var(--text)",
              margin: 0,
              marginBottom: "0.5rem",
              lineHeight: 1.25,
            }}
          >
            {cleanTitle}
          </h2>
          <p
            style={{
              fontSize: "0.88rem",
              lineHeight: 1.6,
              color: "var(--text-2)",
              margin: 0,
              marginBottom: "0.85rem",
            }}
          >
            {data.body}
          </p>
        </div>

        <pre
          style={{
            margin: "0 1.25rem 1rem",
            padding: "0.85rem 1rem",
            fontFamily: "var(--font-geist-mono), monospace",
            fontSize: "0.76rem",
            lineHeight: 1.75,
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
            justifyContent: "space-between",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.75rem 1.25rem",
            borderTop: "1px solid var(--border)",
            background: "var(--surface-2)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: "0.7rem",
              color: "var(--text-3)",
            }}
          >
            Échap pour fermer
          </span>
          <div style={{ display: "flex", gap: "0.4rem" }}>
            <button
              onClick={onClose}
              style={{
                padding: "0.4rem 0.85rem",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text-2)",
                fontFamily: "inherit",
                fontSize: "0.8rem",
                fontWeight: 500,
                cursor: "pointer",
                borderRadius: "6px",
              }}
            >
              Fermer
            </button>
            <button
              style={{
                padding: "0.4rem 0.85rem",
                background: "var(--accent)",
                border: "1px solid var(--accent)",
                color: "#FFFFFF",
                fontFamily: "inherit",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
                borderRadius: "6px",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
            >
              {data.cta}
              <ArrowRight size={12} strokeWidth={2.25} />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
