"use client";

import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { ModalKey } from "@/lib/types";
import { modalData } from "@/lib/modal-data";
import { motion } from "framer-motion";
import {
  X,
  ArrowRight,
  Layers,
  Wallet,
  ShieldAlert,
  Target,
  Briefcase,
  Sparkles,
  FileText,
  type LucideIcon,
} from "lucide-react";

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

const sectionIcon: Record<ModalKey, LucideIcon> = {
  finance: Wallet,
  vue360: Layers,
  sinistres: ShieldAlert,
  prospection: Target,
  portefeuille: Briefcase,
  agents: Sparkles,
  rapport: FileText,
};

function stripLeadingEmoji(s: string) {
  return s.replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\s·—•]+/u, "").trim();
}

type DataLine =
  | {
      kind: "row";
      source: string | null;
      label: string;
      value: string | null;
      combined: boolean;
    }
  | { kind: "text"; text: string };

function parseDataBlock(raw: string): { subtitle: string | null; items: DataLine[] } {
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  let subtitle: string | null = null;
  const items: DataLine[] = [];

  lines.forEach((line, idx) => {
    const fullRow = line.match(/^\[([^\]]+)\]\s*(.+?)\s*:\s*(.+)$/);
    const bracketHeader = !fullRow ? line.match(/^\[([^\]]+)\]\s*(.+)$/) : null;
    const kvRow = !fullRow && !bracketHeader ? line.match(/^(.+?)\s*:\s*(.+)$/) : null;

    // First line becomes the data card subtitle when it's not clearly a key:value row.
    if (idx === 0 && !fullRow && !kvRow) {
      subtitle = bracketHeader
        ? `${bracketHeader[1].trim()} · ${bracketHeader[2].trim()}`
        : line;
      return;
    }

    if (fullRow) {
      const [, source, label, value] = fullRow;
      const combined = /⊕|Combin/i.test(source);
      items.push({
        kind: "row",
        source: source.replace(/^\s*⊕\s*/, "").trim() || null,
        label: label.trim(),
        value: value.trim(),
        combined,
      });
      return;
    }

    if (bracketHeader) {
      const [, source, label] = bracketHeader;
      const combined = /⊕|Combin/i.test(source);
      items.push({
        kind: "row",
        source: source.replace(/^\s*⊕\s*/, "").trim() || null,
        label: label.trim(),
        value: null,
        combined,
      });
      return;
    }

    if (kvRow) {
      const [, label, value] = kvRow;
      items.push({
        kind: "row",
        source: null,
        label: label.trim(),
        value: value.trim(),
        combined: false,
      });
      return;
    }

    items.push({ kind: "text", text: line });
  });

  return { subtitle, items };
}

export default function ApertureModal({ open, modalKey, onClose }: ApertureModalProps) {
  // Keep last non-null key so closing animation can still render content.
  const [lastKey, setLastKey] = React.useState<ModalKey | null>(modalKey);
  React.useEffect(() => {
    if (modalKey !== null) setLastKey(modalKey);
  }, [modalKey]);

  const effectiveKey = modalKey ?? lastKey;
  const data = effectiveKey ? modalData[effectiveKey] : null;
  if (!data || !effectiveKey) return null;

  const tag = sectionTag[effectiveKey];
  const Icon = sectionIcon[effectiveKey];
  const cleanTitle = stripLeadingEmoji(data.title);
  const cleanData = data.data.replace(/[🔴🟡🟢✓✗⚠]+/g, "").trim();
  const parsed = parseDataBlock(cleanData);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        style={{
          // Re-declare Aperture's design tokens here — the modal portals to
          // document.body, escaping the /b layout div that owns these vars.
          ["--bg" as string]: "#FAFBFB",
          ["--surface" as string]: "#FFFFFF",
          ["--surface-2" as string]: "#F1F5F9",
          ["--surface-3" as string]: "#E2E8F0",
          ["--border" as string]: "#E2E8F0",
          ["--border-strong" as string]: "#CBD5E1",
          ["--text" as string]: "#0F172A",
          ["--text-2" as string]: "#334155",
          ["--text-3" as string]: "#64748B",
          ["--text-4" as string]: "#94A3B8",
          ["--accent" as string]: "#1E40AF",
          ["--accent-2" as string]: "#1E3A8A",
          ["--accent-tint" as string]: "#DBEAFE",
          ["--accent-tint-2" as string]: "#EFF6FF",
          ["--success" as string]: "#059669",
          ["--success-tint" as string]: "#ECFDF5",
          ["--warn" as string]: "#D97706",
          ["--warn-tint" as string]: "#FEF3C7",
          ["--danger" as string]: "#DC2626",
          ["--danger-tint" as string]: "#FEE2E2",
          ["--info" as string]: "#0284C7",
          ["--info-tint" as string]: "#E0F2FE",
          ["--purple" as string]: "#7C3AED",
          ["--purple-tint" as string]: "#F3E8FF",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "14px",
          padding: 0,
          maxWidth: "620px",
          width: "94vw",
          fontFamily: "var(--font-sans)",
          color: "var(--text)",
          boxShadow:
            "0 32px 80px -24px rgba(15,23,42,0.22), 0 8px 20px -12px rgba(15,23,42,0.08)",
          overflow: "hidden",
        }}
      >
        <style>{`
          .ap-modal-primary:focus-visible,
          .ap-modal-secondary:focus-visible,
          .ap-modal-close:focus-visible {
            outline: 2px solid var(--accent);
            outline-offset: 2px;
          }
        `}</style>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Header row — icon + section pill + close */}
          <div
            style={{
              padding: "1rem 1.4rem 0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "0.7rem",
            }}
          >
            <span
              style={{
                width: 32,
                height: 32,
                background: tag.bg,
                color: tag.tone,
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon size={16} strokeWidth={2.25} />
            </span>
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
            <span style={{ flex: 1 }} />
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="ap-modal-close"
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
                transition: "background 0.15s, color 0.15s, border-color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--surface-3)";
                e.currentTarget.style.color = "var(--text)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--surface-2)";
                e.currentTarget.style.color = "var(--text-2)";
              }}
            >
              <X size={14} strokeWidth={2.25} />
            </button>
          </div>

          {/* Title + body */}
          <div style={{ padding: "0 1.5rem 1.1rem" }}>
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                letterSpacing: "-0.025em",
                color: "var(--text)",
                margin: 0,
                marginBottom: "0.45rem",
                lineHeight: 1.18,
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
              }}
            >
              {data.body}
            </p>
          </div>

          {/* Données combinées card */}
          <div
            style={{
              margin: "0 1.5rem 1.25rem",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
            }}
          >
            <div
              style={{
                padding: "0.6rem 1rem",
                background: "var(--surface-2)",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                gap: "0.55rem",
                alignItems: "center",
              }}
            >
              <Layers size={12} strokeWidth={2.25} color="var(--text-3)" />
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.66rem",
                  fontWeight: 600,
                  color: "var(--text-3)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Données combinées
              </span>
              {parsed.subtitle && (
                <>
                  <span
                    style={{
                      width: 1,
                      height: 12,
                      background: "var(--border-strong)",
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.62rem",
                      fontWeight: 500,
                      color: "var(--text-4)",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    {parsed.subtitle}
                  </span>
                </>
              )}
            </div>

            <div style={{ padding: "0.35rem 0" }}>
              {parsed.items.map((item, idx) => {
                if (item.kind === "row") {
                  const showPill = item.source !== null || item.combined;
                  return (
                    <div
                      key={idx}
                      style={{
                        display: "grid",
                        gridTemplateColumns: showPill ? "auto 1fr auto" : "1fr auto",
                        alignItems: "center",
                        gap: "0.85rem",
                        padding: "0.5rem 1rem",
                        borderTop: idx === 0 ? "none" : "1px dashed var(--border)",
                        background: item.combined ? "var(--accent-tint-2)" : "transparent",
                      }}
                    >
                      {showPill && (
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.62rem",
                            fontWeight: 600,
                            letterSpacing: "0.04em",
                            textTransform: "uppercase",
                            color: item.combined ? "var(--accent)" : "var(--text-3)",
                            background: item.combined
                              ? "var(--accent-tint)"
                              : "var(--surface-2)",
                            border: `1px solid ${
                              item.combined ? "var(--accent-tint)" : "var(--border)"
                            }`,
                            padding: "0.18rem 0.5rem",
                            borderRadius: "6px",
                            whiteSpace: "nowrap",
                            textAlign: "center",
                          }}
                        >
                          {item.combined ? "⊕ Combiné" : item.source}
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: "0.85rem",
                          color: "var(--text-2)",
                          lineHeight: 1.4,
                        }}
                      >
                        {item.label}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.86rem",
                          fontWeight: 600,
                          color: item.combined ? "var(--accent)" : "var(--text)",
                          fontVariantNumeric: "tabular-nums",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.value ?? ""}
                      </span>
                    </div>
                  );
                }
                return (
                  <div
                    key={idx}
                    style={{
                      padding: "0.35rem 1rem",
                      borderTop: idx === 0 ? "none" : "1px dashed var(--border)",
                      fontSize: "0.82rem",
                      color: "var(--text-3)",
                      lineHeight: 1.5,
                    }}
                  >
                    {item.text}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
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
              type="button"
              onClick={onClose}
              className="ap-modal-secondary"
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
                transition: "background 0.15s, color 0.15s, border-color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--surface-2)";
                e.currentTarget.style.color = "var(--text)";
                e.currentTarget.style.borderColor = "var(--border-strong)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--surface)";
                e.currentTarget.style.color = "var(--text-2)";
                e.currentTarget.style.borderColor = "var(--border)";
              }}
            >
              Fermer
            </button>
            <button
              type="button"
              className="ap-modal-primary"
              style={{
                padding: "0.55rem 1.1rem",
                background:
                  "linear-gradient(180deg, var(--accent) 0%, var(--accent-2) 100%)",
                border: "1px solid var(--accent-2)",
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
                  "inset 0 1px 0 rgba(255,255,255,0.18), 0 1px 2px rgba(30,64,175,0.22), 0 6px 16px -8px rgba(30,64,175,0.5)",
                transition: "transform 0.15s ease, box-shadow 0.2s ease, filter 0.15s",
                transform: "translateY(0)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "inset 0 1px 0 rgba(255,255,255,0.22), 0 2px 4px rgba(30,64,175,0.22), 0 10px 22px -10px rgba(30,64,175,0.55)";
                e.currentTarget.style.filter = "brightness(1.04)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "inset 0 1px 0 rgba(255,255,255,0.18), 0 1px 2px rgba(30,64,175,0.22), 0 6px 16px -8px rgba(30,64,175,0.5)";
                e.currentTarget.style.filter = "brightness(1)";
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(0.985)";
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
            >
              {data.cta}
              <ArrowRight size={13} strokeWidth={2.25} />
            </button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
