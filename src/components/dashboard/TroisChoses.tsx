"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Check, CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import type { ModalKey } from "@/lib/types";

export type TroisItem = {
  /** Stable key for AnimatePresence — should remain identical across
   *  re-renders for a given alert so the row animates rather than remounts. */
  id?: string;
  Icon: LucideIcon;
  color: string;
  bg: string;
  sentence: string;
  cta: string;
  modalKey?: ModalKey;
};

interface TroisChosesProps {
  /** Outstanding items (parent has already filtered out resolved ones). The
   *  component shows the first VISIBLE_COUNT of these; the rest sit in queue. */
  items: TroisItem[];
  /** Numerator of the top-right counter ("X / N alertes traitées"). */
  treatedCount: number;
  /** Denominator of the top-right counter — total in the system. */
  totalCount: number;
  /** Called when the user marks the item at `visibleIndex` as done. The
   *  index refers to the visible slice (0..VISIBLE_COUNT-1), so the parent
   *  should look it up against the same `items` array it passed in. */
  onItemDone: (visibleIndex: number) => void;
  /** Optional reset hook for the "Tout est traité" empty state. If omitted,
   *  the reset button is hidden — appropriate when the underlying state lives
   *  outside this component and isn't trivially resettable from here. */
  onReset?: () => void;
  onOpen?: (k: ModalKey) => void;
}

/** How many alerts stay visible at once. Items past this point sit in the
 *  queue and slide up automatically as earlier ones get resolved, so the
 *  on-screen list keeps a stable depth until the pool runs out. */
const VISIBLE_COUNT = 3;

export function TroisChoses({
  items,
  treatedCount,
  totalCount,
  onItemDone,
  onReset,
  onOpen,
}: TroisChosesProps) {
  const allDone = totalCount > 0 && items.length === 0;
  const visible = items.slice(0, VISIBLE_COUNT);

  return (
    <div
      className="trois-card"
      style={{
        background: "var(--surface)",
        borderRadius: "14px",
        padding: "clamp(0.95rem, 2.4vw, 1.2rem) clamp(1rem, 2.8vw, 1.4rem)",
        boxShadow: "var(--tier-1)",
        position: "relative",
        overflow: "hidden",
      }}>
      <div
        className="trois-card__header"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.6rem",
          marginBottom: "0.4rem",
        }}>
        <div
          className="trois-card__eyebrow"
          style={{
            fontSize: "0.7rem", fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--accent)",
            display: "flex", alignItems: "center", gap: "0.45rem",
            minWidth: 0,
          }}>
          Alertes à traiter
        </div>
        {totalCount > 0 && (
          <span
            className="trois-card__counter"
            aria-live="polite"
            style={{
              fontSize: "0.66rem", fontWeight: 700,
              color: allDone ? "var(--success)" : "var(--text-3)",
              background: allDone ? "var(--success-tint)" : "var(--surface-2)",
              padding: "0.22rem 0.6rem",
              borderRadius: "100px",
              letterSpacing: "0.02em",
              whiteSpace: "nowrap",
              fontVariantNumeric: "tabular-nums",
              border: `1px solid ${allDone ? "var(--success-tint-2, var(--success-tint))" : "var(--border)"}`,
              flexShrink: 0,
            }}>
            {treatedCount}/{totalCount} alertes traitées
          </span>
        )}
      </div>
      <h2
        className="trois-card__subtitle"
        style={{
          fontSize: "clamp(0.92rem, 2.2vw, 1.05rem)",
          fontWeight: 600,
          color: "var(--text)",
          margin: 0, marginBottom: "1rem",
          letterSpacing: "-0.015em",
          lineHeight: 1.35,
        }}>
        Vos alertes en attente, triées par priorité.
      </h2>

      <AnimatePresence mode="wait">
        {allDone ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.96, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              padding: "2rem 1rem",
              textAlign: "center", gap: "0.45rem",
            }}
          >
            <span style={{
              width: 48, height: 48,
              background: "var(--success-tint)",
              color: "var(--success)",
              borderRadius: "12px",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: "0.35rem",
            }}>
              <CheckCircle2 size={22} strokeWidth={2} />
            </span>
            <div style={{
              fontSize: "1.05rem", fontWeight: 600,
              color: "var(--text)",
              letterSpacing: "-0.015em",
            }}>Tout est traité.</div>
            <div style={{
              fontSize: "0.86rem",
              color: "var(--text-3)",
              maxWidth: "36ch", lineHeight: 1.5,
            }}>
              Bonne journée, Mirko. Vos agents IA continuent de surveiller en arrière-plan.
            </div>
            {onReset && (
              <button
                onClick={onReset}
                style={{
                  marginTop: "0.6rem",
                  padding: "0.4rem 0.85rem",
                  background: "transparent",
                  border: "1px solid var(--border)",
                  color: "var(--text-2)",
                  fontFamily: "inherit",
                  fontSize: "0.78rem", fontWeight: 500,
                  cursor: "pointer",
                  borderRadius: "8px",
                  transition: "border-color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-strong)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              >Réinitialiser</button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}
          >
            {/* Inner AnimatePresence so removed rows fade/collapse and the
             *  next queued item slides up into the visible slot. */}
            <AnimatePresence initial={false}>
              {visible.map((t, visibleIdx) => (
                <TroisRow
                  key={t.id ?? `${t.sentence}-${visibleIdx}`}
                  item={t}
                  onDone={() => onItemDone(visibleIdx)}
                  onOpen={t.modalKey && onOpen ? () => onOpen(t.modalKey!) : undefined}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TroisRow({
  item, onDone, onOpen,
}: {
  item: TroisItem;
  onDone: () => void;
  onOpen?: () => void;
}) {
  const { Icon } = item;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="trois-row"
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        gap: "0.85rem",
        alignItems: "center",
        padding: "0.75rem 0.5rem",
        borderRadius: "8px",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <span style={{
        width: 28, height: 28,
        background: item.bg,
        color: item.color,
        borderRadius: "7px",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon size={14} strokeWidth={2.25} />
      </span>
      <span style={{
        fontSize: "clamp(0.82rem, 2vw, 0.9rem)",
        color: "var(--text)",
        lineHeight: 1.45, fontWeight: 500,
        letterSpacing: "-0.005em",
        minWidth: 0,
      }}>{item.sentence}</span>
      <div className="trois-row-actions" style={{ display: "flex", gap: "0.35rem" }}>
        <button
          onClick={() => {
            onOpen?.();
            setTimeout(onDone, 100);
          }}
          style={{
            display: "inline-flex", alignItems: "center",
            gap: "0.3rem",
            padding: "0.5rem 0.9rem",
            minHeight: 38,
            background: "var(--accent)",
            color: "#FFFFFF",
            border: "1px solid var(--accent)",
            borderRadius: "8px",
            fontFamily: "inherit",
            fontSize: "0.78rem", fontWeight: 600,
            cursor: "pointer",
            transition: "background 0.15s, transform 0.12s",
            boxShadow: "0 1px 2px rgba(0,122,255,0.22)",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-2)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          {item.cta}
          <ArrowRight size={11} strokeWidth={2.5} />
        </button>
        <button
          onClick={onDone}
          aria-label="Marquer comme fait"
          style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 38,
            minHeight: 38,
            background: "var(--surface)",
            color: "var(--text-3)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "border-color 0.15s, color 0.15s",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--success)";
            e.currentTarget.style.color = "var(--success)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.color = "var(--text-3)";
          }}
        >
          <Check size={12} strokeWidth={2.25} />
        </button>
      </div>
    </motion.div>
  );
}
