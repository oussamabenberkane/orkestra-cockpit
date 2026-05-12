"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { ModalKey } from "@/lib/types";
import { modalData } from "@/lib/modal-data";
import { X, ArrowRight } from "lucide-react";

interface PlinthModalProps {
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

export default function PlinthModal({ open, modalKey, onClose }: PlinthModalProps) {
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
          border: "none",
          borderRadius: "14px",
          padding: 0,
          maxWidth: "580px",
          width: "92vw",
          fontFamily: "var(--font-sans)",
          color: "var(--text)",
          boxShadow: "var(--tier-2)",
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
            background:
              "linear-gradient(to bottom, var(--surface-2), var(--surface))",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 600,
              color: "var(--text-3)",
              letterSpacing: "0.04em",
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
              background: "var(--surface)",
              border: "none",
              borderRadius: "8px",
              color: "var(--text-2)",
              cursor: "pointer",
              boxShadow: "var(--tier-1)",
              transition: "transform 0.22s ease, box-shadow 0.22s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <X size={13} strokeWidth={2.25} />
          </button>
        </div>

        <div style={{ padding: "1.4rem 1.5rem 0.65rem" }}>
          <h2
            style={{
              fontSize: "1.4rem",
              fontWeight: 600,
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
            padding: "1rem 1.1rem",
            background: "var(--surface-2)",
            borderRadius: "10px",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,1), inset 0 0 0 1px rgba(0,0,0,0.04)",
          }}
        >
          <pre
            style={{
              margin: 0,
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
              padding: "0.5rem 1rem",
              background: "var(--surface)",
              border: "none",
              color: "var(--text-2)",
              fontFamily: "inherit",
              fontSize: "0.84rem",
              fontWeight: 500,
              cursor: "pointer",
              borderRadius: "9px",
              boxShadow: "var(--tier-1)",
              transition: "transform 0.22s ease",
            }}
          >
            Fermer
          </button>
          <button
            style={{
              padding: "0.5rem 1.1rem",
              background:
                "linear-gradient(to bottom, var(--accent), var(--accent-2))",
              border: "none",
              color: "#FFFFFF",
              fontFamily: "inherit",
              fontSize: "0.84rem",
              fontWeight: 600,
              cursor: "pointer",
              borderRadius: "9px",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.25), 0 0 0 1px rgba(68,65,200,0.30), 0 4px 14px -4px rgba(88,86,214,0.40)",
              transition: "transform 0.22s ease, box-shadow 0.22s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow =
                "inset 0 1px 0 rgba(255,255,255,0.25), 0 0 0 1px rgba(68,65,200,0.30), 0 8px 20px -4px rgba(88,86,214,0.50)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "inset 0 1px 0 rgba(255,255,255,0.25), 0 0 0 1px rgba(68,65,200,0.30), 0 4px 14px -4px rgba(88,86,214,0.40)";
            }}
          >
            {data.cta}
            <ArrowRight size={13} strokeWidth={2.25} />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
