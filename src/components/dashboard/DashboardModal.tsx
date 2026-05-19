"use client";

import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type {
  ModalKey,
  ModalData,
  ModalSection,
  KvRow,
  ActionItem,
  StatusRow,
} from "@/lib/types";
import { modalData as staticModalData } from "@/lib/modal-data";
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
  Circle,
  type LucideIcon,
} from "lucide-react";

interface DashboardModalProps {
  open: boolean;
  modalKey: ModalKey | null;
  onClose: () => void;
  onAction?: (key: ModalKey) => void;
  modalData?: Record<ModalKey, ModalData>;
}

const sectionTag: Record<ModalKey, { label: string; tone: string; bg: string }> = {
  finance:      { label: "Finance",        tone: "var(--warn)",   bg: "var(--warn-tint)" },
  vue360:       { label: "Vue d'ensemble", tone: "var(--accent)", bg: "var(--accent-tint)" },
  sinistres:    { label: "Sinistres",      tone: "var(--danger)", bg: "var(--danger-tint)" },
  prospection:  { label: "Prospection",    tone: "var(--accent)", bg: "var(--accent-tint)" },
  portefeuille: { label: "Portefeuille",   tone: "var(--info)",   bg: "var(--info-tint)" },
  agents:       { label: "Agents IA",      tone: "var(--purple)", bg: "var(--purple-tint)" },
  rapport:      { label: "Rapport",        tone: "var(--accent)", bg: "var(--accent-tint)" },
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

export default function DashboardModal({
  open,
  modalKey,
  onClose,
  onAction,
  modalData,
}: DashboardModalProps) {
  /* Keep the last key during the close animation so content doesn't flicker. */
  const [lastKey, setLastKey] = React.useState<ModalKey | null>(modalKey);
  React.useEffect(() => {
    if (modalKey !== null) setLastKey(modalKey);
  }, [modalKey]);

  const effectiveKey = modalKey ?? lastKey;
  const source = modalData ?? staticModalData;
  const data: ModalData | null = effectiveKey ? source[effectiveKey] : null;
  if (!data || !effectiveKey) return null;

  const tag = sectionTag[effectiveKey];
  const Icon = sectionIcon[effectiveKey];

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent
        showCloseButton={false}
        className="dashboard-modal"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "14px",
          padding: 0,
          /* Definitive viewport-relative width — bypasses Tailwind's max-w[%]
           * which can resolve to a wider containing block under transforms.
           * Mobile width/height are scaled down via .dashboard-modal CSS. */
          width: "min(620px, calc(100vw - 24px))",
          maxWidth: "none",
          maxHeight: "calc(100dvh - 32px)",
          overflowX: "hidden",
          overflowY: "auto",
          boxSizing: "border-box",
          fontFamily: "var(--font-sans)",
          color: "var(--text)",
          boxShadow:
            "0 32px 80px -24px rgba(0,0,0,0.22), 0 8px 20px -12px rgba(0,0,0,0.08)",
        }}
      >
        <style>{`
          .dm-primary:focus-visible,
          .dm-secondary:focus-visible,
          .dm-close:focus-visible {
            outline: 2px solid var(--accent);
            outline-offset: 2px;
          }
        `}</style>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Header */}
          <ModalHeader
            tag={tag}
            Icon={Icon}
            onClose={onClose}
          />

          {/* Title + body */}
          <div className="dm-intro" style={{ padding: "0 clamp(1rem, 3vw, 1.5rem) 1.1rem" }}>
            <h2 className="dm-title" style={{
              fontSize: "clamp(1.2rem, 3.4vw, 1.5rem)",
              fontWeight: 700,
              letterSpacing: "-0.025em",
              color: "var(--text)",
              margin: 0,
              marginBottom: "0.45rem",
              lineHeight: 1.2,
              overflowWrap: "break-word",
            }}>
              {data.title}
            </h2>
            <p className="dm-body" style={{
              fontSize: "clamp(0.84rem, 2vw, 0.92rem)",
              lineHeight: 1.55,
              color: "var(--text-2)",
              margin: 0,
              overflowWrap: "break-word",
            }}>
              {data.body}
            </p>
          </div>

          {/* Sections */}
          <div className="dm-sections" style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.9rem",
            padding: "0 clamp(1rem, 3vw, 1.5rem) 1.25rem",
          }}>
            {data.sections.map((section, i) => (
              <SectionRenderer key={i} section={section} />
            ))}
          </div>

          {/* Footer */}
          <ModalFooter
            onClose={onClose}
            cta={data.cta}
            onAction={() => {
              if (onAction && effectiveKey) onAction(effectiveKey);
              onClose();
            }}
          />
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Header ─────────────────────────────────────────────────────── */

function ModalHeader({
  tag,
  Icon,
  onClose,
}: {
  tag: { label: string; tone: string; bg: string };
  Icon: LucideIcon;
  onClose: () => void;
}) {
  return (
    <div className="dm-header" style={{
      padding: "clamp(0.85rem, 2.4vw, 1rem) clamp(1rem, 3vw, 1.4rem) 0.85rem",
      display: "flex",
      alignItems: "center",
      gap: "0.6rem",
      minWidth: 0,
    }}>
      <span style={{
        width: 32, height: 32,
        background: tag.bg,
        color: tag.tone,
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon size={16} strokeWidth={2.25} />
      </span>
      <span style={{
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
        minWidth: 0,
        maxWidth: "100%",
        overflow: "hidden",
      }}>
        <span style={{
          width: 6, height: 6,
          borderRadius: "50%",
          background: tag.tone,
          flexShrink: 0,
        }} />
        <span style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}>{tag.label}</span>
      </span>
      <span style={{ flex: 1, minWidth: 0 }} />
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer"
        className="dm-close"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 32, height: 32,
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          color: "var(--text-2)",
          cursor: "pointer",
          flexShrink: 0,
          transition: "background 0.15s, color 0.15s",
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
        <X size={15} strokeWidth={2.25} />
      </button>
    </div>
  );
}

/* ─── Footer ─────────────────────────────────────────────────────── */

function ModalFooter({
  onClose,
  cta,
  onAction,
}: {
  onClose: () => void;
  cta: string;
  onAction: () => void;
}) {
  return (
    <div className="dm-footer" style={{
      display: "flex",
      justifyContent: "flex-end",
      gap: "0.5rem",
      flexWrap: "wrap",
      padding: "0.95rem clamp(1rem, 3vw, 1.5rem)",
      borderTop: "1px solid var(--border)",
      background: "var(--surface-2)",
      position: "sticky",
      bottom: 0,
    }}>
      <button
        type="button"
        onClick={onClose}
        className="dm-secondary"
        style={{
          padding: "0.6rem 1.05rem",
          minHeight: 40,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          color: "var(--text-2)",
          fontFamily: "inherit",
          fontSize: "0.84rem",
          fontWeight: 500,
          cursor: "pointer",
          borderRadius: "9px",
          transition: "background 0.15s, color 0.15s, border-color 0.15s",
          whiteSpace: "nowrap",
        }}
      >
        Fermer
      </button>
      <button
        type="button"
        className="dm-primary"
        onClick={onAction}
        style={{
          padding: "0.6rem 1.15rem",
          minHeight: 40,
          background: "linear-gradient(180deg, var(--accent) 0%, var(--accent-2) 100%)",
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
          whiteSpace: "nowrap",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.2), 0 1px 2px rgba(0,122,255,0.22), 0 6px 16px -8px rgba(0,122,255,0.5)",
          transition: "transform 0.15s ease, filter 0.15s",
        }}
        onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.985)")}
        onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        {cta}
        <ArrowRight size={13} strokeWidth={2.25} />
      </button>
    </div>
  );
}

/* ─── Section dispatcher ─────────────────────────────────────────── */

function SectionRenderer({ section }: { section: ModalSection }) {
  switch (section.kind) {
    case "narrative":
      return <NarrativeSection text={section.text} />;
    case "kv-list":
      return <KvListSection subtitle={section.subtitle} rows={section.rows} />;
    case "action-list":
      return <ActionListSection subtitle={section.subtitle} items={section.items} />;
    case "status-list":
      return <StatusListSection subtitle={section.subtitle} rows={section.rows} />;
    case "footnote":
      return <FootnoteSection text={section.text} />;
  }
}

/* ─── Section subtitle (shared) ──────────────────────────────────── */

function SectionSubtitle({ text }: { text: string }) {
  return (
    <div style={{
      padding: "0.55rem clamp(0.75rem, 2.4vw, 1rem)",
      background: "var(--surface-2)",
      borderBottom: "1px solid var(--border)",
      display: "flex",
      alignItems: "center",
      gap: "0.55rem",
      minWidth: 0,
    }}>
      <Layers size={12} strokeWidth={2.25} color="var(--text-3)" style={{ flexShrink: 0 }} />
      <span style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.66rem",
        fontWeight: 600,
        color: "var(--text-3)",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        minWidth: 0,
      }}>{text}</span>
    </div>
  );
}

function SectionFrame({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    }}>
      {children}
    </div>
  );
}

/* ─── KV list ─────────────────────────────────────────────────────
 * Single column on mobile (pill on its own line above label+value),
 * three-column grid from 480px up. minmax(0, …) on every track so a
 * long value or label can never push the row wider than the container. */

function KvListSection({ subtitle, rows }: { subtitle?: string; rows: KvRow[] }) {
  return (
    <SectionFrame>
      {subtitle && <SectionSubtitle text={subtitle} />}
      <div>
        {rows.map((row, idx) => (
          <KvRowItem key={idx} row={row} isFirst={idx === 0} />
        ))}
      </div>
    </SectionFrame>
  );
}

function KvRowItem({ row, isFirst }: { row: KvRow; isFirst: boolean }) {
  const showPill = !!row.source || !!row.combined;
  return (
    <div
      className={`dm-row${showPill ? " dm-row--with-pill" : ""}`}
      style={{
        display: "grid",
        gridTemplateColumns: showPill
          ? "minmax(0, auto) minmax(0, 1fr) minmax(0, auto)"
          : "minmax(0, 1fr) minmax(0, auto)",
        alignItems: "center",
        columnGap: "0.6rem",
        padding: "0.5rem clamp(0.75rem, 2.4vw, 1rem)",
        borderTop: isFirst ? "none" : "1px dashed var(--border)",
        background: row.combined ? "var(--accent-tint-2)" : "transparent",
      }}
    >
      {showPill && (
        <span
          className="dm-row-pill"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.62rem",
            fontWeight: 600,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: row.combined ? "var(--accent)" : "var(--text-3)",
            background: row.combined ? "var(--accent-tint)" : "var(--surface-2)",
            border: `1px solid ${row.combined ? "var(--accent-tint)" : "var(--border)"}`,
            padding: "0.18rem 0.5rem",
            borderRadius: "6px",
            whiteSpace: "nowrap",
            textAlign: "center",
            justifySelf: "start",
            maxWidth: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {row.combined ? "⊕ Combiné" : row.source}
        </span>
      )}
      <span
        className="dm-row-label"
        style={{
          fontSize: "clamp(0.8rem, 2vw, 0.85rem)",
          color: "var(--text-2)",
          lineHeight: 1.4,
          minWidth: 0,
          overflowWrap: "break-word",
        }}
      >
        {row.label}
      </span>
      <span
        className="dm-row-value"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "clamp(0.8rem, 2vw, 0.86rem)",
          fontWeight: 600,
          color: row.combined ? "var(--accent)" : "var(--text)",
          fontVariantNumeric: "tabular-nums",
          whiteSpace: "nowrap",
          justifySelf: "end",
          minWidth: 0,
        }}
      >
        {row.value ?? ""}
      </span>
    </div>
  );
}

/* ─── Action list ─────────────────────────────────────────────────
 * Numbered items (e.g. "Agents IA"). Source pill is optional and
 * stays inline with the title — wraps naturally on narrow widths. */

function ActionListSection({
  subtitle,
  items,
}: {
  subtitle?: string;
  items: ActionItem[];
}) {
  return (
    <SectionFrame>
      {subtitle && <SectionSubtitle text={subtitle} />}
      <ol style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {items.map((item, idx) => (
          <ActionItemRow key={idx} item={item} index={idx + 1} isFirst={idx === 0} />
        ))}
      </ol>
    </SectionFrame>
  );
}

function ActionItemRow({
  item,
  index,
  isFirst,
}: {
  item: ActionItem;
  index: number;
  isFirst: boolean;
}) {
  return (
    <li
      style={{
        display: "grid",
        gridTemplateColumns: "auto minmax(0, 1fr)",
        columnGap: "0.7rem",
        padding: "0.55rem clamp(0.75rem, 2.4vw, 1rem)",
        borderTop: isFirst ? "none" : "1px dashed var(--border)",
        alignItems: "flex-start",
      }}
    >
      <span style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.72rem",
        fontWeight: 700,
        color: "var(--text-3)",
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        borderRadius: "6px",
        minWidth: 22,
        height: 22,
        padding: "0 6px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        marginTop: 1,
      }}>{index}</span>
      <div style={{ minWidth: 0 }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.45rem",
          rowGap: "0.25rem",
        }}>
          {item.source && (
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.58rem",
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "var(--text-3)",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              padding: "0.12rem 0.45rem",
              borderRadius: "5px",
              flexShrink: 0,
            }}>{item.source}</span>
          )}
          <span style={{
            fontSize: "clamp(0.82rem, 2vw, 0.88rem)",
            fontWeight: 600,
            color: "var(--text)",
            lineHeight: 1.35,
            overflowWrap: "break-word",
            minWidth: 0,
          }}>{item.title}</span>
        </div>
        {item.detail && (
          <div style={{
            fontSize: "clamp(0.72rem, 1.8vw, 0.78rem)",
            color: "var(--text-3)",
            lineHeight: 1.45,
            marginTop: "0.2rem",
            overflowWrap: "break-word",
          }}>{item.detail}</div>
        )}
      </div>
    </li>
  );
}

/* ─── Status list ─────────────────────────────────────────────────
 * Tone-colored dossier rows (sinistres). Single-column stack of
 * dot + title + detail. */

function StatusListSection({
  subtitle,
  rows,
}: {
  subtitle?: string;
  rows: StatusRow[];
}) {
  return (
    <SectionFrame>
      {subtitle && <SectionSubtitle text={subtitle} />}
      <div>
        {rows.map((row, idx) => (
          <StatusRowItem key={idx} row={row} isFirst={idx === 0} />
        ))}
      </div>
    </SectionFrame>
  );
}

function StatusRowItem({ row, isFirst }: { row: StatusRow; isFirst: boolean }) {
  const color =
    row.tone === "danger"  ? "var(--danger)"
    : row.tone === "warn"  ? "var(--warn)"
    : row.tone === "good"  ? "var(--success)"
    : "var(--text-3)";
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "auto minmax(0, 1fr)",
      columnGap: "0.7rem",
      padding: "0.55rem clamp(0.75rem, 2.4vw, 1rem)",
      borderTop: isFirst ? "none" : "1px dashed var(--border)",
      alignItems: "flex-start",
    }}>
      <span style={{
        marginTop: 6,
        flexShrink: 0,
        color,
      }}>
        <Circle size={8} strokeWidth={0} fill="currentColor" />
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: "clamp(0.82rem, 2vw, 0.88rem)",
          fontWeight: 600,
          color: "var(--text)",
          lineHeight: 1.35,
          overflowWrap: "break-word",
        }}>{row.title}</div>
        {row.detail && (
          <div style={{
            fontSize: "clamp(0.72rem, 1.8vw, 0.78rem)",
            color: "var(--text-3)",
            lineHeight: 1.45,
            marginTop: "0.2rem",
            overflowWrap: "break-word",
          }}>{row.detail}</div>
        )}
      </div>
    </div>
  );
}

/* ─── Narrative / Footnote ───────────────────────────────────────── */

function NarrativeSection({ text }: { text: string }) {
  return (
    <p style={{
      margin: 0,
      fontSize: "clamp(0.82rem, 2vw, 0.88rem)",
      color: "var(--text-2)",
      lineHeight: 1.55,
      overflowWrap: "break-word",
    }}>{text}</p>
  );
}

function FootnoteSection({ text }: { text: string }) {
  return (
    <p style={{
      margin: 0,
      fontSize: "clamp(0.72rem, 1.8vw, 0.78rem)",
      color: "var(--text-4)",
      lineHeight: 1.5,
      letterSpacing: "0.005em",
      overflowWrap: "break-word",
      fontStyle: "italic",
    }}>{text}</p>
  );
}
