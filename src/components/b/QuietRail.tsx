"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  BarChart3,
  Target,
  FolderArchive,
  Flame,
  Wallet,
  Globe,
  MessageSquare,
  AlertTriangle,
  Sparkles,
  Settings,
  HelpCircle,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

type Tone = "neutral" | "warn" | "danger";

type NavItem = {
  Icon: LucideIcon;
  label: string;
  badge?: string;
  badgeTone?: Tone;
  subs?: string[];
};

type NavSection = { title: string; items: NavItem[] };

const sections: NavSection[] = [
  {
    title: "Espace",
    items: [
      {
        Icon: Home,
        label: "Accueil",
        subs: ["Aujourd'hui", "Cette semaine", "Mois", "Trimestre"],
      },
      {
        Icon: BarChart3,
        label: "Rapports",
        subs: ["Mensuel", "Direction", "Personnalisé"],
      },
    ],
  },
  {
    title: "Métier",
    items: [
      { Icon: Target, label: "Prospection", badge: "12", badgeTone: "neutral" },
      { Icon: FolderArchive, label: "Portefeuille" },
      { Icon: Flame, label: "Sinistres", badge: "3", badgeTone: "danger" },
      { Icon: Wallet, label: "Finance", badge: "2", badgeTone: "warn" },
      { Icon: Globe, label: "Vue d'ensemble" },
    ],
  },
  {
    title: "Intelligence",
    items: [
      { Icon: MessageSquare, label: "Chat IA", badge: "3", badgeTone: "warn" },
      { Icon: AlertTriangle, label: "Alertes", badge: "5", badgeTone: "danger" },
      {
        Icon: Sparkles,
        label: "Agents",
        badge: "3",
        badgeTone: "neutral",
        subs: ["Inbox", "Historique", "Configuration"],
      },
    ],
  },
  {
    title: "Administration",
    items: [
      { Icon: Settings, label: "Paramètres" },
      { Icon: HelpCircle, label: "Support" },
    ],
  },
];

const ACTIVE_SECTION = "Métier";
const ACTIVE_ITEM = "Prospection";

function badgeTones(tone?: Tone) {
  if (tone === "danger")
    return {
      color: "var(--danger)",
      bg: "var(--danger-tint)",
      border: "var(--danger-tint)",
    };
  if (tone === "warn")
    return {
      color: "var(--warn)",
      bg: "var(--warn-tint)",
      border: "var(--warn-tint)",
    };
  return {
    color: "var(--text-3)",
    bg: "var(--surface-2)",
    border: "var(--border)",
  };
}

function itemPalette(label: string) {
  if (
    label === "Prospection" ||
    label === "Vue d'ensemble" ||
    label === "Accueil" ||
    label === "Rapports"
  )
    return { c: "var(--accent)", bg: "var(--accent-tint)" };
  if (label === "Portefeuille") return { c: "var(--info)", bg: "var(--info-tint)" };
  if (label === "Sinistres" || label === "Alertes")
    return { c: "var(--danger)", bg: "var(--danger-tint)" };
  if (label === "Finance" || label === "Chat IA")
    return { c: "var(--warn)", bg: "var(--warn-tint)" };
  if (label === "Agents") return { c: "var(--purple)", bg: "var(--purple-tint)" };
  return { c: "var(--text-3)", bg: "var(--surface-2)" };
}

function Badge({ value, tone }: { value: string; tone?: Tone }) {
  const t = badgeTones(tone);
  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.62rem",
        fontWeight: 700,
        letterSpacing: "0.02em",
        color: t.color,
        background: t.bg,
        border: `1px solid ${t.border}`,
        padding: "0.05rem 0.35rem",
        borderRadius: "5px",
        fontVariantNumeric: "tabular-nums",
        flexShrink: 0,
      }}
    >
      {value}
    </span>
  );
}

export function QuietRail() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div
      className="qr-root"
      onMouseLeave={() => setHovered(null)}
      style={{
        minWidth: 0,
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.2rem",
      }}
    >
      {sections.map((sec) => {
        const isActive = sec.title === ACTIVE_SECTION;
        const isOpen = hovered === sec.title;
        return (
          <div
            key={sec.title}
            onMouseEnter={() => setHovered(sec.title)}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              height: "100%",
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              className="qr-tab"
              data-active={isActive ? "true" : undefined}
              onFocus={() => setHovered(sec.title)}
              style={{
                background: isActive ? "var(--surface-2)" : "transparent",
                border: "none",
                padding: "0.45rem 0.75rem",
                fontFamily: "inherit",
                fontSize: "0.86rem",
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "var(--text)" : "var(--text-3)",
                cursor: "pointer",
                borderRadius: "8px",
                whiteSpace: "nowrap",
                transition: "color 0.18s, background 0.18s",
              }}
            >
              {sec.title}
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 2 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    paddingTop: 6,
                    width: 296,
                    zIndex: 31,
                  }}
                >
                  <PanelCard section={sec} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      <style>{`
        .qr-tab:hover:not([data-active="true"]) {
          color: var(--text);
          background: var(--surface-2);
        }
        .qr-tab:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}

function PanelCard({ section }: { section: NavSection }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        boxShadow:
          "0 1px 2px rgba(15,23,42,0.04), 0 16px 36px -16px rgba(15,23,42,0.22)",
        padding: "0.5rem",
      }}
    >
      <div
        style={{
          padding: "0.4rem 0.6rem 0.3rem",
          fontFamily: "var(--font-mono)",
          fontSize: "0.6rem",
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--text-4)",
        }}
      >
        {section.title}
      </div>
      {section.items.map((item) => (
        <PanelItem
          key={item.label}
          item={item}
          active={section.title === ACTIVE_SECTION && item.label === ACTIVE_ITEM}
        />
      ))}
    </div>
  );
}

function PanelItem({ item, active }: { item: NavItem; active: boolean }) {
  const pal = itemPalette(item.label);
  return (
    <div>
      <div
        role="link"
        tabIndex={0}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          padding: "0.45rem 0.6rem",
          borderRadius: "8px",
          cursor: "pointer",
          background: active ? "var(--surface-2)" : "transparent",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => {
          if (!active) e.currentTarget.style.background = "var(--surface-2)";
        }}
        onMouseLeave={(e) => {
          if (!active) e.currentTarget.style.background = "transparent";
        }}
      >
        <span
          style={{
            width: 26,
            height: 26,
            background: pal.bg,
            color: pal.c,
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <item.Icon size={14} strokeWidth={2.25} />
        </span>
        <span
          style={{
            fontSize: "0.84rem",
            fontWeight: active ? 600 : 500,
            color: active ? "var(--text)" : "var(--text-2)",
            flex: 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {item.label}
        </span>
        {item.badge && <Badge value={item.badge} tone={item.badgeTone} />}
      </div>
      {item.subs && <SubsRegion subs={item.subs} />}
    </div>
  );
}

function SubsRegion({ subs }: { subs: string[] }) {
  return (
    <div
      style={{
        margin: "0.2rem 0.3rem 0.45rem 1.55rem",
        padding: "0.35rem 0.4rem 0.4rem",
        background: "var(--surface-2)",
        borderRadius: "8px",
        border: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          padding: "0.15rem 0.45rem 0.3rem",
          fontFamily: "var(--font-mono)",
          fontSize: "0.55rem",
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--text-4)",
        }}
      >
        Sous-sections
      </div>
      {subs.map((s) => (
        <div
          key={s}
          role="link"
          tabIndex={0}
          style={{
            fontSize: "0.78rem",
            fontWeight: 500,
            color: "var(--text-3)",
            padding: "0.3rem 0.45rem",
            borderRadius: "5px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            transition: "background 0.15s, color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--surface-3)";
            e.currentTarget.style.color = "var(--text-2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--text-3)";
          }}
        >
          <ChevronRight size={10} strokeWidth={2.25} color="var(--text-4)" />
          {s}
        </div>
      ))}
    </div>
  );
}
