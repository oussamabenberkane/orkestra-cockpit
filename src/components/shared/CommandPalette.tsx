"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  LogOut, Search, CornerDownLeft, X,
  type LucideIcon,
} from "lucide-react";
import type { ModalKey } from "@/lib/types";
import { useWorkspace } from "@/lib/workspaces";
import type { NavItem, WorkspaceShape } from "@/lib/workspaces/types";
import { useAlerts } from "@/components/dashboard/AlertsProvider";

type Action =
  | { type: "modal"; key: ModalKey }
  | { type: "navigate"; href: string }
  | { type: "callback"; cb: () => void };

type Command = {
  group: string;
  label: string;
  desc?: string;
  badge?: string;
  badgeTone?: "danger" | "warn" | "neutral";
  Icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  action: Action;
};

/* Per-label icon styling for the white modal card. Intentionally uses
 * deep semantic tokens (var(--accent)/var(--info)/…) — NOT the rail's
 * bright --nav-* variants — because the palette renders outside the
 * .app-sidebar scope on a white surface, where the rail-bright variants
 * would be unreadable. */
const ICON_STYLE: Record<string, { color: string; bg: string }> = {
  "Vue 360":           { color: "var(--accent)",  bg: "var(--accent-tint)"  },
  "Tous les rapports": { color: "var(--accent)",  bg: "var(--accent-tint)"  },
  /* Broker — Métier */
  "Prospection":       { color: "var(--accent)",  bg: "var(--accent-tint)"  },
  "Portefeuille":      { color: "var(--info)",    bg: "var(--info-tint)"    },
  "Sinistres":         { color: "var(--danger)",  bg: "var(--danger-tint)"  },
  "Finance":           { color: "var(--warn)",    bg: "var(--warn-tint)"    },
  /* Commodity — Trading */
  "Positions":         { color: "var(--accent)",  bg: "var(--accent-tint)"  },
  "Couvertures":       { color: "var(--info)",    bg: "var(--info-tint)"    },
  "Contreparties":     { color: "var(--warn)",    bg: "var(--warn-tint)"    },
  "P&L":               { color: "var(--success)", bg: "var(--success-tint)" },
  "Risque":            { color: "var(--danger)",  bg: "var(--danger-tint)"  },
  /* Intelligence */
  "Chat IA":           { color: "var(--purple)",  bg: "var(--purple-tint)"  },
  "Alertes":           { color: "var(--danger)",  bg: "var(--danger-tint)"  },
  /* Administration */
  "Paramètres":        { color: "var(--text-3)",  bg: "var(--surface-2)"    },
  "Support":           { color: "var(--text-3)",  bg: "var(--surface-2)"    },
};

const FALLBACK_ICON_STYLE = { color: "var(--accent)", bg: "var(--accent-tint)" };

function descFor(
  label: string,
  live: { alertsUnread: number; sinistreUnread: number; financeUnread: number },
): string | undefined {
  const plural = (n: number, s: string, p: string) => (n > 1 ? p : s);
  switch (label) {
    case "Vue 360":           return "KPI consolidés + trois actions du jour";
    case "Tous les rapports": return "Index Helvebroker SA + Odoo";
    case "Prospection":       return "Pipeline · 18 % conv. · 3 relances dues";
    case "Portefeuille":      return "189 contrats actifs · 4 renouvellements J-30";
    case "Sinistres":
      return live.sinistreUnread > 0
        ? `3 dossiers ouverts · ${live.sinistreUnread} alerte${plural(live.sinistreUnread, "", "s")} non lue${plural(live.sinistreUnread, "", "s")}`
        : "3 dossiers ouverts · SIN-0047 urgent";
    case "Finance":
      return live.financeUnread > 0
        ? `+18K cash-flow · ${live.financeUnread} alerte${plural(live.financeUnread, "", "s")} non lue${plural(live.financeUnread, "", "s")}`
        : "+18K cash-flow · 2 impayés";
    /* Commodity descriptions */
    case "Positions":         return "12 positions · Énergie · Métaux · Agri";
    case "Couvertures":       return "Stratégies de hedge en cours";
    case "Contreparties":     return "1 limite atteinte — surveillance requise";
    case "P&L":               return "Profit & Loss par desk";
    case "Risque":            return "VaR 1j 184 K · limite 250 K";
    /* Intelligence */
    case "Chat IA":           return "Assistant Orkestra plein écran";
    case "Alertes":
      return live.alertsUnread > 0
        ? `${live.alertsUnread} alerte${plural(live.alertsUnread, "", "s")} non lue${plural(live.alertsUnread, "", "s")} · action requise`
        : "Centre d'alertes opérationnelles";
    case "Paramètres":        return "Workspace, sources, agents IA";
    case "Support":           return "Documentation et contact";
    default:                  return undefined;
  }
}

function badgeFor(
  label: string,
  live: { alertsUnread: number; sinistreUnread: number; financeUnread: number },
): { value: string; tone: "danger" | "warn" } | undefined {
  if (label === "Alertes" && live.alertsUnread > 0) {
    return { value: String(live.alertsUnread), tone: "danger" };
  }
  if (label === "Sinistres" && live.sinistreUnread > 0) {
    return { value: String(live.sinistreUnread), tone: "danger" };
  }
  if (label === "Finance" && live.financeUnread > 0) {
    return { value: String(live.financeUnread), tone: "warn" };
  }
  return undefined;
}

function buildCommands(opts: {
  shape: WorkspaceShape;
  live: { alertsUnread: number; sinistreUnread: number; financeUnread: number };
  onLogout: () => void;
}): Command[] {
  const out: Command[] = [];

  /* Source-of-truth: the workspace's own nav. The palette stays in lock
   * step with the sidebar — switch workspace tab, palette switches with
   * it, including the Métier↔Trading section title. */
  for (const section of opts.shape.nav) {
    for (const item of section.items as NavItem[]) {
      const action: Action | null =
        item.href ? { type: "navigate", href: item.href }
        : item.modalKey ? { type: "modal", key: item.modalKey }
        : null;
      if (!action) continue;

      const style = ICON_STYLE[item.label] ?? FALLBACK_ICON_STYLE;
      const badge = badgeFor(item.label, opts.live);
      out.push({
        group: section.title,
        label: item.label,
        desc: descFor(item.label, opts.live),
        badge: badge?.value,
        badgeTone: badge?.tone,
        Icon: item.Icon,
        iconColor: style.color,
        iconBg: style.bg,
        action,
      });
    }
  }

  /* Compte — logout pinned to the bottom regardless of workspace. */
  out.push({
    group: "Compte",
    label: "Déconnexion",
    desc: "Quitter le cockpit",
    Icon: LogOut,
    iconColor: "var(--danger)",
    iconBg: "var(--danger-tint)",
    action: { type: "callback", cb: opts.onLogout },
  });

  return out;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onOpenModal: (key: ModalKey) => void;
  onLogout: () => void;
}

export function CommandPalette({
  open,
  onClose,
  onOpenModal,
  onLogout,
}: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  /* Live data sources — same shape + alerts provider the sidebar uses,
   * so badge counts and descriptions stay in sync when the user marks
   * an alert read elsewhere in the app. */
  const { shape } = useWorkspace();
  const { alerts, unreadCount: alertsUnread } = useAlerts();
  const live = useMemo(() => ({
    alertsUnread,
    sinistreUnread: alerts.filter((a) => !a.read && a.category === "sinistre").length,
    financeUnread:  alerts.filter((a) => !a.read && a.category === "finance").length,
  }), [alerts, alertsUnread]);

  const commands = useMemo(
    () => buildCommands({ shape, live, onLogout }),
    [shape, live, onLogout],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        (c.desc?.toLowerCase().includes(q) ?? false) ||
        c.group.toLowerCase().includes(q),
    );
  }, [query, commands]);

  /* Preserve group ordering as encountered in the workspace nav. */
  const groups = useMemo(() => {
    const map = new Map<string, Command[]>();
    for (const c of filtered) {
      if (!map.has(c.group)) map.set(c.group, []);
      map.get(c.group)!.push(c);
    }
    return Array.from(map.entries());
  }, [filtered]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const run = (cmd: Command) => {
    onClose();
    setTimeout(() => {
      if (cmd.action.type === "modal") onOpenModal(cmd.action.key);
      else if (cmd.action.type === "navigate") router.push(cmd.action.href);
      else if (cmd.action.type === "callback") cmd.action.cb();
    }, 80);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onMouseDown={(e) => {
            if (e.target === overlayRef.current) onClose();
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(30,27,75,0.36)",
            backdropFilter: "blur(4px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            paddingTop: "12vh",
            zIndex: 100,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{
              width: "min(580px, calc(100vw - 2rem))",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "14px",
              boxShadow: "var(--tier-2)",
              overflow: "hidden",
              fontFamily: "var(--font-sans), system-ui, sans-serif",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.7rem",
                padding: "0.85rem 1.1rem",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <Search size={15} strokeWidth={2.25} color="var(--text-3)" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Rechercher dans ${shape.label}…`}
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontFamily: "inherit",
                  fontSize: "0.95rem",
                  color: "var(--text)",
                }}
              />
              <button
                onClick={onClose}
                aria-label="Fermer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 24,
                  height: 24,
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  color: "var(--text-3)",
                  cursor: "pointer",
                }}
              >
                <X size={12} strokeWidth={2.25} />
              </button>
            </div>

            <div style={{ maxHeight: "60vh", overflowY: "auto", padding: "0.5rem 0" }}>
              {groups.length === 0 ? (
                <div
                  style={{
                    padding: "2rem 1rem",
                    textAlign: "center",
                    color: "var(--text-3)",
                    fontSize: "0.86rem",
                  }}
                >
                  Aucun résultat pour « {query} »
                </div>
              ) : (
                groups.map(([group, cmds]) => (
                  <div key={group}>
                    <div
                      style={{
                        padding: "0.5rem 1.1rem 0.3rem",
                        fontSize: "0.62rem",
                        fontWeight: 700,
                        color: "var(--text-4)",
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                      }}
                    >
                      {group}
                    </div>
                    {cmds.map((cmd) => {
                      const I = cmd.Icon;
                      const badgeColor =
                        cmd.badgeTone === "danger" ? "var(--danger)"
                        : cmd.badgeTone === "warn" ? "var(--warn)"
                        : "var(--text-3)";
                      const badgeBg =
                        cmd.badgeTone === "danger" ? "var(--danger-tint)"
                        : cmd.badgeTone === "warn" ? "var(--warn-tint)"
                        : "var(--surface-2)";
                      return (
                        <button
                          key={cmd.label}
                          onClick={() => run(cmd)}
                          className="cmdp-row"
                          style={{
                            width: "100%",
                            display: "grid",
                            gridTemplateColumns: "auto 1fr auto",
                            gap: "0.75rem",
                            alignItems: "center",
                            padding: "0.55rem 1.1rem",
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            fontFamily: "inherit",
                            color: "inherit",
                            textAlign: "left",
                          }}
                        >
                          <span
                            style={{
                              width: 30,
                              height: 30,
                              background: cmd.iconBg,
                              color: cmd.iconColor,
                              borderRadius: "8px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
                            }}
                          >
                            <I size={14} strokeWidth={2.25} />
                          </span>
                          <div style={{ minWidth: 0, lineHeight: 1.3 }}>
                            <div
                              style={{
                                fontSize: "0.86rem",
                                fontWeight: 600,
                                color: "var(--text)",
                                letterSpacing: "-0.005em",
                              }}
                            >
                              {cmd.label}
                            </div>
                            {cmd.desc && (
                              <div
                                style={{
                                  fontSize: "0.72rem",
                                  color: "var(--text-3)",
                                  marginTop: "0.1rem",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {cmd.desc}
                              </div>
                            )}
                          </div>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.4rem",
                              flexShrink: 0,
                            }}
                          >
                            {cmd.badge && (
                              <span
                                style={{
                                  fontFamily: "var(--font-mono)",
                                  fontSize: "0.66rem",
                                  fontWeight: 700,
                                  color: badgeColor,
                                  background: badgeBg,
                                  border: `1px solid color-mix(in srgb, ${badgeColor} 24%, transparent)`,
                                  borderRadius: "100px",
                                  padding: "0.1rem 0.45rem",
                                  lineHeight: 1.3,
                                }}
                              >
                                {cmd.badge}
                              </span>
                            )}
                            <span
                              className="cmdp-arrow"
                              style={{
                                color: "var(--text-4)",
                                opacity: 0,
                                transform: "translateX(-4px)",
                                transition: "opacity 0.15s, transform 0.15s",
                                display: "inline-flex",
                              }}
                            >
                              <CornerDownLeft size={12} strokeWidth={2.25} />
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.55rem 1.1rem",
                borderTop: "1px solid var(--border)",
                background: "var(--surface-2)",
                fontSize: "0.7rem",
                color: "var(--text-3)",
              }}
            >
              <span>
                {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
                {live.alertsUnread > 0 && (
                  <>
                    {" · "}
                    <span style={{ color: "var(--danger)", fontWeight: 600 }}>
                      {live.alertsUnread} alerte{live.alertsUnread > 1 ? "s" : ""} non lue{live.alertsUnread > 1 ? "s" : ""}
                    </span>
                  </>
                )}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <kbd
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.62rem",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "4px",
                    padding: "0.05rem 0.35rem",
                    color: "var(--text-3)",
                  }}
                >
                  ↵
                </kbd>
                ouvrir
              </span>
            </div>
          </motion.div>

          <style>{`
            .cmdp-row:hover {
              background: var(--surface-2) !important;
            }
            .cmdp-row:hover .cmdp-arrow {
              opacity: 1 !important;
              transform: translateX(0) !important;
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
