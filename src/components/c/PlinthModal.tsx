"use client";

import { Dialog as BasePrimitive } from "@base-ui/react/dialog";
import { Dialog, DialogPortal } from "@/components/ui/dialog";
import type { ModalKey } from "@/lib/types";
import { modalData } from "@/lib/modal-data";
import { X, ArrowRight } from "lucide-react";

/* ─── Design tokens (literal — no CSS vars; modal renders in a portal) ──── */
const C = {
  white:       "#FFFFFF",
  surface2:    "#FAFAFA",
  surface3:    "#F2F2F4",
  dataFill:    "#F5F5F7",
  border:      "rgba(0,0,0,0.07)",
  borderMid:   "rgba(0,0,0,0.11)",
  text:        "#1D1D1F",
  text2:       "#3A3A3C",
  text3:       "#6E6E73",
  text4:       "#8E8E93",
  accent:      "#5856D6",
  accent2:     "#4441C8",
  accentTint:  "rgba(88,86,214,0.09)",
  shadow: [
    "0 0 0 1px rgba(0,0,0,0.07)",
    "0 4px 8px rgba(0,0,0,0.06)",
    "0 20px 40px -8px rgba(0,0,0,0.20)",
    "0 40px 80px -16px rgba(0,0,0,0.12)",
  ].join(", "),
} as const;

/* ─── Per-section accent tint ─────────────────────────────────────────── */
const sectionMeta: Record<ModalKey, { label: string; color: string; tint: string }> = {
  finance:      { label: "Finance",        color: "#E07B00", tint: "rgba(224,123,0,0.09)" },
  vue360:       { label: "Vue d'ensemble", color: C.accent,  tint: C.accentTint },
  sinistres:    { label: "Sinistres",      color: "#D92B2B", tint: "rgba(217,43,43,0.08)" },
  prospection:  { label: "Prospection",    color: C.accent,  tint: C.accentTint },
  portefeuille: { label: "Portefeuille",   color: "#0071E3", tint: "rgba(0,113,227,0.09)" },
  agents:       { label: "Agents IA",      color: C.accent,  tint: C.accentTint },
  rapport:      { label: "Rapport",        color: "#1D8348", tint: "rgba(29,131,72,0.09)" },
};

function stripEmoji(s: string) {
  return s.replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\s·—•]+/u, "").trim();
}

function stripDataEmoji(s: string) {
  return s.replace(/[🔴🟡🟢⊕✓✗⚠]+/g, "").trim();
}

interface PlinthModalProps {
  open: boolean;
  modalKey: ModalKey | null;
  onClose: () => void;
}

export default function PlinthModal({ open, modalKey, onClose }: PlinthModalProps) {
  const data   = modalKey ? modalData[modalKey] : null;
  const meta   = modalKey ? sectionMeta[modalKey] : null;
  if (!data || !meta || !modalKey) return null;

  const title    = stripEmoji(data.title);
  const cleanData = stripDataEmoji(data.data);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogPortal>

        {/* ── Backdrop ───────────────────────────────────────────────── */}
        <BasePrimitive.Backdrop
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            backgroundColor: "rgba(10,10,16,0.48)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        />

        {/* ── Popup ──────────────────────────────────────────────────── */}
        <BasePrimitive.Popup
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 51,
            width: "min(580px, 92vw)",
            maxHeight: "90dvh",
            display: "flex",
            flexDirection: "column",
            borderRadius: 18,
            background: C.white,
            boxShadow: C.shadow,
            outline: "none",
            overflow: "hidden",
            fontFamily: "'Albert Sans', system-ui, sans-serif",
          }}
        >

          {/* Accent top stripe */}
          <div
            aria-hidden
            style={{
              height: 3,
              background: `linear-gradient(to right, ${meta.color}, ${C.accent2})`,
              flexShrink: 0,
            }}
          />

          {/* ── Header ───────────────────────────────────────────────── */}
          <div
            style={{
              padding: "0.9rem 1.25rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.75rem",
              background: C.surface2,
              borderBottom: `1px solid ${C.border}`,
              flexShrink: 0,
            }}
          >
            {/* Section pill */}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.2rem 0.6rem",
                borderRadius: 100,
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.03em",
                textTransform: "uppercase",
                color: meta.color,
                background: meta.tint,
              }}
            >
              {meta.label}
            </span>

            {/* Close */}
            <button
              onClick={onClose}
              aria-label="Fermer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 28,
                height: 28,
                borderRadius: 8,
                border: "none",
                background: C.white,
                color: C.text3,
                cursor: "pointer",
                boxShadow: `0 0 0 1px ${C.border}, 0 1px 3px rgba(0,0,0,0.08)`,
                transition: "background 0.15s, color 0.15s",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = C.surface3;
                e.currentTarget.style.color = C.text;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = C.white;
                e.currentTarget.style.color = C.text3;
              }}
            >
              <X size={13} strokeWidth={2.3} />
            </button>
          </div>

          {/* ── Body ─────────────────────────────────────────────────── */}
          <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem 1.5rem 0" }}>

            {/* Title */}
            <h2
              style={{
                fontSize: "1.55rem",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                color: C.text,
                margin: 0,
                lineHeight: 1.15,
                marginBottom: "0.6rem",
              }}
            >
              {title}
            </h2>

            {/* Description */}
            <p
              style={{
                fontSize: "0.9rem",
                lineHeight: 1.65,
                color: C.text2,
                margin: 0,
                marginBottom: "1.25rem",
              }}
            >
              {data.body}
            </p>

            {/* Data card */}
            <div
              style={{
                borderRadius: 12,
                background: C.dataFill,
                border: `1px solid ${C.border}`,
                overflow: "hidden",
                marginBottom: "1.5rem",
              }}
            >
              {/* Card header bar */}
              <div
                style={{
                  padding: "0.5rem 1rem",
                  background: C.surface3,
                  borderBottom: `1px solid ${C.borderMid}`,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                {[C.text4, C.text4, meta.color].map((col, i) => (
                  <span
                    key={i}
                    aria-hidden
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: col,
                      opacity: i === 2 ? 0.6 : 0.35,
                    }}
                  />
                ))}
                <span
                  style={{
                    marginLeft: "0.35rem",
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: C.text4,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  données en direct
                </span>
              </div>

              {/* Mono data block */}
              <pre
                style={{
                  margin: 0,
                  padding: "0.95rem 1.1rem",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.78rem",
                  lineHeight: 1.85,
                  color: C.text2,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {cleanData}
              </pre>
            </div>
          </div>

          {/* ── Footer ───────────────────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.5rem",
              padding: "1rem 1.25rem",
              borderTop: `1px solid ${C.border}`,
              background: C.surface2,
              flexShrink: 0,
            }}
          >
            {/* Ghost close */}
            <button
              onClick={onClose}
              style={{
                padding: "0.52rem 1rem",
                background: C.white,
                border: "none",
                color: C.text2,
                fontFamily: "inherit",
                fontSize: "0.84rem",
                fontWeight: 500,
                cursor: "pointer",
                borderRadius: 10,
                boxShadow: `0 0 0 1px ${C.border}, 0 1px 3px rgba(0,0,0,0.07)`,
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = C.surface3)}
              onMouseLeave={(e) => (e.currentTarget.style.background = C.white)}
            >
              Fermer
            </button>

            {/* Accent CTA */}
            <button
              style={{
                padding: "0.52rem 1.1rem",
                background: `linear-gradient(160deg, ${C.accent} 0%, ${C.accent2} 100%)`,
                border: "none",
                color: "#FFFFFF",
                fontFamily: "inherit",
                fontSize: "0.84rem",
                fontWeight: 600,
                cursor: "pointer",
                borderRadius: 10,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                boxShadow: [
                  "inset 0 1px 0 rgba(255,255,255,0.20)",
                  `0 0 0 1px ${C.accent2}`,
                  "0 2px 4px rgba(88,86,214,0.30)",
                  "0 8px 20px -4px rgba(88,86,214,0.38)",
                ].join(", "),
                transition: "transform 0.18s ease, box-shadow 0.18s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = [
                  "inset 0 1px 0 rgba(255,255,255,0.20)",
                  `0 0 0 1px ${C.accent2}`,
                  "0 2px 4px rgba(88,86,214,0.30)",
                  "0 12px 28px -4px rgba(88,86,214,0.50)",
                ].join(", ");
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = [
                  "inset 0 1px 0 rgba(255,255,255,0.20)",
                  `0 0 0 1px ${C.accent2}`,
                  "0 2px 4px rgba(88,86,214,0.30)",
                  "0 8px 20px -4px rgba(88,86,214,0.38)",
                ].join(", ");
              }}
            >
              {data.cta}
              <ArrowRight size={13} strokeWidth={2.25} />
            </button>
          </div>

        </BasePrimitive.Popup>
      </DialogPortal>
    </Dialog>
  );
}
