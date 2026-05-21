"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  FileText,
  X,
  Mail,
  CheckCheck,
  Clock,
  ChevronRight,
  Inbox,
  Check,
  Archive,
  Flame,
  DollarSign,
  RefreshCw,
  Edit3,
  User,
} from "lucide-react";
import { AppShell } from "@/components/dashboard/AppShell";
import { useAlerts } from "@/components/dashboard/AlertsProvider";
import { SEV_CONFIG, type AlertItem } from "@/lib/alerts-data";

type TabKey = "nonlu" | "lu";

const CATEGORY_ICONS = {
  contrat: FileText,
  sinistre: Flame,
  finance: DollarSign,
  renouvellement: RefreshCw,
};

/** Single source of truth for "are we below the master/detail breakpoint". */
function useIsCompact(maxWidth = 899) {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(`(max-width: ${maxWidth}px)`);
    const sync = () => setCompact(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [maxWidth]);
  return compact;
}

export default function AlertesPage() {
  const router = useRouter();
  const { alerts, unreadCount, markAsRead, markAllAsRead, dismiss } = useAlerts();
  const [tab, setTab] = useState<TabKey>("nonlu");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const isCompact = useIsCompact();

  const unread = alerts.filter((a) => !a.read);
  const read = alerts.filter((a) => a.read);
  const list = tab === "nonlu" ? unread : read;

  /** Desktop master/detail: auto-pick the first row so the preview is never empty.
   *  Mobile (compact): never auto-select — the row is a nav target, not a selector. */
  const selected = isCompact
    ? null
    : (list.find((a) => a.id === selectedId) ?? (list.length > 0 ? list[0] : null));

  const handleRowSelect = useCallback(
    (alertId: string) => {
      if (isCompact) {
        router.push(`/alertes/${alertId}`);
      } else {
        setSelectedId(alertId);
      }
    },
    [isCompact, router]
  );

  /** Desktop keyboard nav — ↑ / ↓ moves the selection, Enter opens the editor. */
  useEffect(() => {
    if (isCompact) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if (list.length === 0) return;
      const currentId = selected?.id;
      const idx = currentId ? list.findIndex((a) => a.id === currentId) : -1;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = list[Math.min(idx + 1, list.length - 1)] ?? list[0];
        setSelectedId(next.id);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = list[Math.max(idx - 1, 0)] ?? list[0];
        setSelectedId(prev.id);
      } else if (e.key === "Enter" && selected) {
        router.push(`/alertes/${selected.id}`);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isCompact, list, selected, router]);

  return (
    <AppShell mainStyle={{ maxWidth: "1400px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.375rem" }}>

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", minWidth: 0 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 42,
                height: 42,
                borderRadius: "11px",
                background: "var(--danger-tint)",
                color: "var(--danger)",
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={20} strokeWidth={2.5} />
            </span>
            <div style={{ minWidth: 0 }}>
              <h1
                style={{
                  fontSize: "clamp(1.1rem, 1.05rem + 0.4vw, 1.3rem)",
                  fontWeight: 700,
                  letterSpacing: "-0.022em",
                  color: "var(--text)",
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                Centre d&apos;alertes
              </h1>
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "var(--text-3)",
                  margin: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {unreadCount > 0
                  ? `${unreadCount} alerte${unreadCount > 1 ? "s" : ""} non lue${unreadCount > 1 ? "s" : ""} · Action requise`
                  : "Aucune alerte active"}
              </p>
            </div>
          </div>

          <AnimatePresence>
            {unreadCount > 0 && tab === "nonlu" && (
              <motion.button
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                onClick={markAllAsRead}
                aria-label="Tout marquer comme lu"
                title="Tout marquer comme lu"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "var(--text-3)",
                  background: "var(--surface-2)",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0.45rem 0.875rem",
                  cursor: "pointer",
                  boxShadow: "var(--tier-1)",
                  transition: "background 0.15s, color 0.15s",
                  fontFamily: "inherit",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--success-tint)";
                  e.currentTarget.style.color = "var(--success)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--surface-2)";
                  e.currentTarget.style.color = "var(--text-3)";
                }}
              >
                <CheckCheck size={14} />
                <span className="alert-cta-label">Tout marquer lu</span>
                <span className="alert-cta-label-short">Tout lu</span>
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Tabs ── */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          style={{
            display: "inline-flex",
            background: "var(--surface-2)",
            borderRadius: "10px",
            padding: "3px",
            gap: "2px",
            boxShadow: "var(--tier-1)",
            width: "fit-content",
          }}
        >
          {(
            [
              { key: "nonlu" as TabKey, label: "Non lus", count: unread.length },
              { key: "lu" as TabKey, label: "Traités", count: read.length },
            ] as { key: TabKey; label: string; count: number }[]
          ).map(({ key, label, count }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setTab(key);
                  setSelectedId(null);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontSize: "0.82rem",
                  fontWeight: active ? 700 : 500,
                  color: active ? "var(--text)" : "var(--text-3)",
                  background: active ? "var(--surface)" : "transparent",
                  border: "none",
                  borderRadius: "7px",
                  padding: "0.4rem 0.875rem",
                  cursor: "pointer",
                  boxShadow: active ? "var(--tier-1)" : "none",
                  transition: "all 0.18s ease",
                  fontFamily: "inherit",
                }}
              >
                {label}
                {count > 0 && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      color:
                        key === "nonlu" && count > 0
                          ? "var(--danger)"
                          : "var(--text-4)",
                      background:
                        key === "nonlu" && count > 0
                          ? "var(--danger-tint)"
                          : "var(--surface-3)",
                      padding: "0.1rem 0.4rem",
                      borderRadius: "100px",
                      lineHeight: 1.4,
                      minWidth: 18,
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </motion.div>

        {/* ── Two-panel layout ── */}
        <div className="alerts-layout">
          {/* Left: alert list */}
          <div className="alerts-layout-list">
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <AnimatePresence mode="popLayout">
                {list.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.875rem",
                      padding: "3.5rem 2rem",
                      borderRadius: "14px",
                      background: "var(--surface-2)",
                      color: "var(--text-4)",
                      textAlign: "center",
                    }}
                  >
                    {tab === "nonlu" ? (
                      <Inbox size={30} strokeWidth={1.5} />
                    ) : (
                      <Archive size={30} strokeWidth={1.5} />
                    )}
                    <div>
                      <p
                        style={{
                          fontSize: "0.88rem",
                          fontWeight: 600,
                          color: "var(--text-3)",
                          margin: "0 0 0.2rem",
                        }}
                      >
                        {tab === "nonlu" ? "Tout est à jour" : "Aucun historique"}
                      </p>
                      <p style={{ fontSize: "0.78rem", color: "var(--text-4)", margin: 0 }}>
                        {tab === "nonlu"
                          ? "Aucune alerte non lue"
                          : "Les alertes traitées apparaîtront ici"}
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  list.map((alert, i) => (
                    <AlertRow
                      key={alert.id}
                      alert={alert}
                      index={i}
                      isRead={tab === "lu"}
                      isSelected={selected?.id === alert.id}
                      onSelect={() => handleRowSelect(alert.id)}
                      onMarkAsRead={markAsRead}
                      onDismiss={dismiss}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right: email preview panel */}
          <div className="alerts-layout-preview">
            <AnimatePresence mode="wait">
              {selected ? (
                <EmailPreviewPanel
                  key={selected.id}
                  alert={selected}
                  isRead={tab === "lu"}
                />
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.875rem",
                    padding: "5rem 2rem",
                    borderRadius: "16px",
                    background: "var(--surface-2)",
                    color: "var(--text-4)",
                    textAlign: "center",
                    minHeight: 340,
                  }}
                >
                  <Mail size={32} strokeWidth={1.5} />
                  <p style={{ fontSize: "0.84rem", fontWeight: 500, margin: 0 }}>
                    Sélectionnez une alerte pour prévisualiser l&apos;e-mail
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

/* ── Alert row (left panel) ─────────────────────────────────── */
function AlertRow({
  alert,
  index,
  isRead,
  isSelected,
  onSelect,
  onMarkAsRead,
  onDismiss,
}: {
  alert: AlertItem;
  index: number;
  isRead: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const cfg = SEV_CONFIG[alert.severity];
  const CategoryIcon = CATEGORY_ICONS[alert.category];

  return (
    <motion.div
      layout
      role="button"
      tabIndex={0}
      aria-label={`${cfg.label} — ${alert.title}`}
      aria-pressed={isSelected}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16, scale: 0.97 }}
      transition={{
        layout: { duration: 0.2 },
        delay: index * 0.04,
        duration: 0.28,
        ease: [0.22, 1, 0.36, 1],
      }}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className="alert-row"
      style={{
        background: isSelected ? "var(--surface)" : "var(--surface-2)",
        boxShadow: isSelected ? "var(--tier-2)" : "none",
        border: `1.5px solid ${isSelected ? cfg.color + "33" : "transparent"}`,
        opacity: isRead && !isSelected ? 0.72 : 1,
      }}
    >
      {/* Severity stripe — thicker on selection for clearer left-edge signal */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: isSelected ? 4 : 3,
          background: cfg.color,
          opacity: isRead ? 0.5 : 1,
          transition: "width 0.18s",
        }}
      />

      <div style={{ padding: "0.75rem 0.875rem 0.75rem 1.125rem" }}>
        {/* Top: severity pill + ref + actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.5rem",
            marginBottom: "0.4rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              minWidth: 0,
              flex: 1,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.22rem",
                fontSize: "0.56rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: cfg.color,
                background: cfg.tint,
                padding: "0.16rem 0.45rem",
                borderRadius: "100px",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: cfg.color,
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              {cfg.label}
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.2rem",
                fontSize: "0.65rem",
                fontWeight: 600,
                color: "var(--text-4)",
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.04em",
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              <CategoryIcon size={10} strokeWidth={2} style={{ flexShrink: 0 }} />
              {alert.id}
            </span>
          </div>

          <div
            className="alert-row-actions-mobile-hide"
            style={{ display: "flex", alignItems: "center", gap: "0.15rem", flexShrink: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {!isRead && (
              <button
                onClick={() => onMarkAsRead(alert.id)}
                title="Marquer comme lu"
                aria-label="Marquer comme lu"
                className="alert-row-action"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--success-tint)";
                  e.currentTarget.style.color = "var(--success)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--text-4)";
                }}
              >
                <Check size={13} />
              </button>
            )}
            <button
              onClick={() => onDismiss(alert.id)}
              title="Supprimer"
              aria-label="Supprimer cette alerte"
              className="alert-row-action"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--danger-tint)";
                e.currentTarget.style.color = "var(--danger)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--text-4)";
              }}
            >
              <X size={13} />
            </button>
          </div>

          {/* Mobile-only navigation chevron — signals "tap to open" */}
          <ChevronRight size={16} className="alert-row-chevron" strokeWidth={2.25} />
        </div>

        {/* Title */}
        <p
          style={{
            fontSize: "0.875rem",
            fontWeight: 700,
            color: "var(--text)",
            margin: "0 0 0.2rem",
            lineHeight: 1.3,
          }}
        >
          {alert.title}
        </p>

        {/* Description */}
        <p
          style={{
            fontSize: "0.775rem",
            color: "var(--text-3)",
            margin: "0 0 0.6rem",
            lineHeight: 1.45,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {alert.description}
        </p>

        {/* Footer: client + timestamp */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.5rem",
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              minWidth: 0,
              flex: 1,
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: cfg.tint,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: "0.5rem",
                  fontWeight: 700,
                  color: cfg.color,
                  lineHeight: 1,
                }}
              >
                {alert.client.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
            </div>
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 600,
                color: "var(--text-3)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                minWidth: 0,
              }}
            >
              {alert.client.name}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              flexShrink: 0,
            }}
          >
            {alert.emailSent && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.18rem",
                  fontSize: "0.57rem",
                  fontWeight: 700,
                  color: "var(--success)",
                  background: "var(--success-tint)",
                  padding: "0.12rem 0.38rem",
                  borderRadius: "100px",
                }}
              >
                <CheckCheck size={8} strokeWidth={2.5} />
                Envoyé
              </span>
            )}
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.2rem",
                fontSize: "0.65rem",
                color: "var(--text-4)",
                whiteSpace: "nowrap",
              }}
            >
              <Clock size={10} />
              {alert.sentAt ?? alert.timestamp}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Email preview panel (right) ────────────────────────────── */
function EmailPreviewPanel({
  alert,
  isRead,
}: {
  alert: AlertItem;
  isRead: boolean;
}) {
  const cfg = SEV_CONFIG[alert.severity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      style={{
        borderRadius: "16px",
        background: "var(--surface)",
        boxShadow: "var(--tier-2)",
        border: "1px solid var(--border)",
        overflow: "hidden",
        position: "sticky",
        top: "2rem",
      }}
    >
      {/* Panel header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.875rem 1.25rem",
          background: "var(--surface-2)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 26,
              height: 26,
              borderRadius: "7px",
              background: "var(--accent-tint)",
              color: "var(--accent)",
              flexShrink: 0,
            }}
          >
            <Mail size={12} strokeWidth={2.5} />
          </span>
          <span
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              color: "var(--text-2)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Prévisualisation — e-mail automatique
          </span>
        </div>

        {alert.emailSent ? (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              fontSize: "0.65rem",
              fontWeight: 700,
              color: "var(--success)",
              background: "var(--success-tint)",
              padding: "0.22rem 0.65rem",
              borderRadius: "100px",
            }}
          >
            <CheckCheck size={11} strokeWidth={2.5} />
            Envoyé {alert.sentAt}
          </span>
        ) : (
          <span
            style={{
              fontSize: "0.65rem",
              fontWeight: 600,
              color: "var(--text-4)",
              background: "var(--surface-3)",
              padding: "0.2rem 0.55rem",
              borderRadius: "100px",
            }}
          >
            Brouillon
          </span>
        )}
      </div>

      {/* Email meta: De / À / Objet */}
      <div style={{ borderBottom: "1px solid var(--border)" }}>
        {[
          {
            label: "De",
            value: "Helvebroker",
            sub: "system@helvebroker.ch",
          },
          {
            label: "À",
            value: alert.client.name,
            sub: alert.client.email,
          },
          { label: "Objet", value: alert.email.subject },
        ].map(({ label, value, sub }, i, arr) => (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "0.75rem",
              padding: "0.55rem 1.25rem",
              borderBottom:
                i < arr.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none",
            }}
          >
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 600,
                color: "var(--text-4)",
                minWidth: 40,
                flexShrink: 0,
              }}
            >
              {label}
            </span>
            <span style={{ minWidth: 0 }}>
              <span
                style={{
                  fontSize: "0.82rem",
                  fontWeight: label === "Objet" ? 600 : 500,
                  color: "var(--text-2)",
                }}
              >
                {value}
              </span>
              {sub && (
                <span
                  style={{
                    marginLeft: "0.4rem",
                    fontSize: "0.72rem",
                    color: "var(--text-4)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  &lt;{sub}&gt;
                </span>
              )}
            </span>
          </div>
        ))}
      </div>

      {/* Email body — height adapts to viewport; see .alert-email-body in globals.css */}
      <div
        className="email-body alert-email-body"
        style={{
          padding: "1.375rem 1.5rem",
          fontSize: "0.855rem",
          color: "var(--text-2)",
          lineHeight: 1.75,
        }}
        dangerouslySetInnerHTML={{ __html: alert.email.body }}
      />

      {/* Actions footer */}
      <div
        style={{
          padding: "0.875rem 1.25rem",
          borderTop: "1px solid var(--border)",
          background: "var(--surface-2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.625rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            fontSize: "0.72rem",
            color: "var(--text-4)",
          }}
        >
          <User size={11} />
          {alert.client.name}
          <span style={{ color: "var(--border-strong)" }}>·</span>
          <Clock size={11} />
          {alert.sentAt ?? alert.timestamp}
        </div>

        <Link
          href={`/alertes/${alert.id}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
            fontSize: "0.8rem",
            fontWeight: 700,
            color: alert.emailSent ? "var(--text-3)" : "#fff",
            background: alert.emailSent ? "var(--surface-3)" : "var(--accent)",
            padding: "0.5rem 1.125rem",
            borderRadius: "9px",
            textDecoration: "none",
            boxShadow: alert.emailSent ? "none" : "var(--tier-1)",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.opacity = "0.8";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.opacity = "1";
          }}
        >
          {alert.emailSent ? (
            <>
              <Mail size={12} />
              Voir l&apos;e-mail
            </>
          ) : (
            <>
              <Edit3 size={12} />
              Modifier &amp; envoyer
              <ChevronRight size={11} />
            </>
          )}
        </Link>
      </div>
    </motion.div>
  );
}
