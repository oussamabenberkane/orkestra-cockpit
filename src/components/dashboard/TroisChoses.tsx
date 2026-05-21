"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Check, CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import type { ModalKey } from "@/lib/types";

export type TroisItem = {
  Icon: LucideIcon;
  color: string;
  bg: string;
  sentence: string;
  cta: string;
  modalKey?: ModalKey;
};

interface TroisChosesProps {
  items: TroisItem[];
  onOpen?: (k: ModalKey) => void;
}

export function TroisChoses({ items, onOpen }: TroisChosesProps) {
  const [done, setDone] = useState<boolean[]>(() => items.map(() => false));
  const allDone = done.every(Boolean);

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
        className="trois-card__eyebrow"
        style={{
          fontSize: "0.7rem", fontWeight: 700,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--accent)",
          marginBottom: "0.4rem",
          display: "flex", alignItems: "center", gap: "0.45rem",
        }}>
        Trois choses aujourd&apos;hui
        {!allDone && (
          <span style={{
            fontSize: "0.62rem", fontWeight: 700,
            color: "var(--text-3)",
            background: "var(--surface-2)",
            padding: "0.1rem 0.4rem",
            borderRadius: "100px",
            letterSpacing: "0.04em",
          }}>
            {done.filter(Boolean).length}/{items.length}
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
        Vos priorités du matin, mises au premier plan.
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
            }}>Tout est fait.</div>
            <div style={{
              fontSize: "0.86rem",
              color: "var(--text-3)",
              maxWidth: "36ch", lineHeight: 1.5,
            }}>
              Bonne journée, Mirko. Vos agents IA continuent de surveiller en arrière-plan.
            </div>
            <button
              onClick={() => setDone(items.map(() => false))}
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
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}
          >
            {items.map((t, i) =>
              done[i] ? null : (
                <TroisRow
                  key={i}
                  item={t}
                  onDone={() => {
                    setDone((prev) => {
                      const next = [...prev];
                      next[i] = true;
                      return next;
                    });
                  }}
                  onOpen={t.modalKey && onOpen ? () => onOpen(t.modalKey!) : undefined}
                />
              ),
            )}
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
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
      transition={{ duration: 0.22 }}
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
