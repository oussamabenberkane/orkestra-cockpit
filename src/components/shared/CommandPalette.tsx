"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Home, BarChart3, MessageSquare, AlertTriangle,
  Target, FolderArchive, Flame, Wallet, Globe, Sparkles,
  Mail, AlertCircle, FileText, Settings, HelpCircle, LogOut,
  Search, CornerDownLeft, X,
} from "lucide-react";
import type { ModalKey } from "@/lib/types";

type Action =
  | { type: "modal"; key: ModalKey }
  | { type: "navigate"; href: string }
  | { type: "callback"; cb: () => void };

type Command = {
  group: "Navigation" | "Domaines" | "Agents" | "Système";
  label: string;
  desc?: string;
  Icon: typeof Target;
  iconColor: string;
  iconBg: string;
  action: Action;
};

function buildCommands(opts: { onLogout: () => void }): Command[] {
  return [
    {
      group: "Navigation",
      label: "Vue 360",
      desc: "Accueil cockpit — KPI consolidés",
      Icon: Home,
      iconColor: "var(--accent)",
      iconBg: "var(--accent-tint)",
      action: { type: "navigate", href: "/dashboard" },
    },
    {
      group: "Navigation",
      label: "Tous les rapports",
      desc: "Index des rapports Helvebroker SA + Odoo",
      Icon: BarChart3,
      iconColor: "var(--accent)",
      iconBg: "var(--accent-tint)",
      action: { type: "navigate", href: "/rapports" },
    },
    {
      group: "Navigation",
      label: "Chat IA",
      desc: "Assistant Orkestra plein écran",
      Icon: MessageSquare,
      iconColor: "var(--accent)",
      iconBg: "var(--accent-tint)",
      action: { type: "navigate", href: "/chat" },
    },
    {
      group: "Navigation",
      label: "Alertes",
      desc: "Centre d'alertes opérationnelles",
      Icon: AlertTriangle,
      iconColor: "var(--danger)",
      iconBg: "var(--danger-tint)",
      action: { type: "navigate", href: "/alertes" },
    },
    {
      group: "Domaines",
      label: "Prospection",
      desc: "Pipeline · 12 prospects · 3 relances dues",
      Icon: Target,
      iconColor: "var(--accent)",
      iconBg: "var(--accent-tint)",
      action: { type: "modal", key: "prospection" },
    },
    {
      group: "Domaines",
      label: "Portefeuille",
      desc: "189 contrats · 4 renouvellements J-30",
      Icon: FolderArchive,
      iconColor: "var(--info)",
      iconBg: "var(--info-tint)",
      action: { type: "modal", key: "portefeuille" },
    },
    {
      group: "Domaines",
      label: "Sinistres",
      desc: "3 ouverts · SIN-0047 urgent",
      Icon: Flame,
      iconColor: "var(--danger)",
      iconBg: "var(--danger-tint)",
      action: { type: "modal", key: "sinistres" },
    },
    {
      group: "Domaines",
      label: "Finance",
      desc: "+18K cash-flow · 2 impayés",
      Icon: Wallet,
      iconColor: "var(--warn)",
      iconBg: "var(--warn-tint)",
      action: { type: "modal", key: "finance" },
    },
    {
      group: "Domaines",
      label: "Vue d'ensemble",
      desc: "68% marge consolidée",
      Icon: Globe,
      iconColor: "var(--accent)",
      iconBg: "var(--accent-tint)",
      action: { type: "modal", key: "vue360" },
    },
    {
      group: "Agents",
      label: "Agent · Renouvellement",
      desc: "4 courriers prêts — échéances J-28",
      Icon: Mail,
      iconColor: "var(--info)",
      iconBg: "var(--info-tint)",
      action: { type: "modal", key: "agents" },
    },
    {
      group: "Agents",
      label: "Agent · Impayé Rossi SA",
      desc: "Relance 1 800 CHF — 67 jours",
      Icon: AlertCircle,
      iconColor: "var(--warn)",
      iconBg: "var(--warn-tint)",
      action: { type: "modal", key: "finance" },
    },
    {
      group: "Agents",
      label: "Agent · Rapport direction",
      desc: "Synthèse mensuelle BS + Odoo",
      Icon: FileText,
      iconColor: "var(--accent)",
      iconBg: "var(--accent-tint)",
      action: { type: "modal", key: "rapport" },
    },
    {
      group: "Système",
      label: "Paramètres",
      desc: "Workspace, sources, agents",
      Icon: Settings,
      iconColor: "var(--text-3)",
      iconBg: "var(--surface-2)",
      action: { type: "navigate", href: "/parametres" },
    },
    {
      group: "Système",
      label: "Aide & support",
      desc: "Documentation, contact",
      Icon: HelpCircle,
      iconColor: "var(--text-3)",
      iconBg: "var(--surface-2)",
      action: { type: "navigate", href: "/support" },
    },
    {
      group: "Système",
      label: "Déconnexion",
      desc: "Quitter le cockpit",
      Icon: LogOut,
      iconColor: "var(--danger)",
      iconBg: "var(--danger-tint)",
      action: { type: "callback", cb: opts.onLogout },
    },
  ];
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

  const commands = useMemo(() => buildCommands({ onLogout }), [onLogout]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        (c.desc?.toLowerCase().includes(q) ?? false) ||
        c.group.toLowerCase().includes(q)
    );
  }, [query, commands]);

  const groups = useMemo(() => {
    const out: Record<string, Command[]> = {};
    for (const c of filtered) {
      if (!out[c.group]) out[c.group] = [];
      out[c.group].push(c);
    }
    return out;
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
            background: "rgba(15,23,42,0.32)",
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
              boxShadow:
                "0 32px 80px -20px rgba(15,23,42,0.32), 0 12px 32px -12px rgba(15,23,42,0.18)",
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
              <Search size={15} strokeWidth={2} color="var(--text-3)" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher dans le cockpit…"
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
              {Object.keys(groups).length === 0 ? (
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
                Object.entries(groups).map(([group, cmds]) => (
                  <div key={group}>
                    <div
                      style={{
                        padding: "0.5rem 1.1rem 0.3rem",
                        fontSize: "0.64rem",
                        fontWeight: 700,
                        color: "var(--text-4)",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                      }}
                    >
                      {group}
                    </div>
                    {cmds.map((cmd) => {
                      const I = cmd.Icon;
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
                              width: 28,
                              height: 28,
                              background: cmd.iconBg,
                              color: cmd.iconColor,
                              borderRadius: "7px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <I size={13} strokeWidth={2} />
                          </span>
                          <div style={{ minWidth: 0, lineHeight: 1.3 }}>
                            <div
                              style={{
                                fontSize: "0.86rem",
                                fontWeight: 500,
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
                                }}
                              >
                                {cmd.desc}
                              </div>
                            )}
                          </div>
                          <span
                            className="cmdp-arrow"
                            style={{
                              color: "var(--text-4)",
                              opacity: 0,
                              transform: "translateX(-4px)",
                              transition: "opacity 0.15s, transform 0.15s",
                            }}
                          >
                            <CornerDownLeft size={12} strokeWidth={2.25} />
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
              <span>{filtered.length} résultats</span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                Cliquez pour ouvrir
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
