"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search, Bell, ChevronDown, LogOut, Plus, Settings,
  TrendingUp, TrendingDown, ArrowUpRight, MoreHorizontal,
  Target, FolderArchive, Flame, Wallet, Globe, Sparkles,
  Mail, AlertCircle, FileText, Check, X, Circle,
} from "lucide-react";
import type { ModalKey } from "@/lib/types";
import MercuryModal from "@/components/b/MercuryModal";
import { Sparkline } from "@/components/shared/Sparkline";

const kpis = [
  {
    label: "CA Mensuel",
    value: "92 400",
    unit: "CHF",
    trend: "+12.0%",
    trendDir: "up" as const,
    spark: [62, 64, 70, 68, 72, 78, 80, 82, 86, 88, 92, 92],
    combined: true,
  },
  {
    label: "Marge nette",
    value: "68",
    unit: "%",
    trend: "+4 pt",
    trendDir: "up" as const,
    spark: [55, 58, 60, 62, 63, 64, 64, 66, 67, 67, 68, 68],
    combined: true,
  },
  {
    label: "Cash-flow prévisionnel",
    value: "+18 K",
    unit: "CHF",
    trend: "+K vs M-1",
    trendDir: "up" as const,
    spark: [4, 6, 8, 7, 10, 12, 11, 14, 15, 16, 17, 18],
    combined: true,
  },
  {
    label: "Rétention",
    value: "87",
    unit: "%",
    trend: "+3 pt",
    trendDir: "up" as const,
    spark: [81, 82, 83, 83, 84, 85, 85, 86, 86, 87, 87, 87],
    combined: false,
  },
];

type TileEntry = {
  Icon: typeof Target;
  iconColor: string;
  iconBg: string;
  title: string;
  metric: string;
  unit: string;
  caption: string;
  alert: string;
  alertTone: "warn" | "good" | "neutral" | "danger";
  sources: string[];
  modalKey: ModalKey;
  spark?: number[];
  sparkColor?: string;
};

const tiles: TileEntry[] = [
  {
    Icon: Target,
    iconColor: "var(--accent)",
    iconBg: "var(--accent-tint)",
    title: "Prospection",
    metric: "18",
    unit: "%",
    caption: "Taux de conversion · 12 prospects actifs",
    alert: "3 relances dues",
    alertTone: "warn",
    sources: ["BrokerStar"],
    modalKey: "prospection",
    spark: [10, 12, 11, 14, 14, 15, 16, 17, 17, 18, 18, 18],
    sparkColor: "var(--accent)",
  },
  {
    Icon: FolderArchive,
    iconColor: "var(--info)",
    iconBg: "var(--info-tint)",
    title: "Portefeuille",
    metric: "189",
    unit: "",
    caption: "Contrats actifs · 85 K CHF de primes",
    alert: "4 renouvellements J-30",
    alertTone: "neutral",
    sources: ["BrokerStar"],
    modalKey: "portefeuille",
    spark: [182, 183, 184, 184, 185, 186, 186, 187, 188, 188, 189, 189],
    sparkColor: "var(--info)",
  },
  {
    Icon: Flame,
    iconColor: "var(--danger)",
    iconBg: "var(--danger-tint)",
    title: "Sinistres",
    metric: "3",
    unit: "",
    caption: "Dossiers ouverts · ratio 12 % CA",
    alert: "SIN-0047 — 68 jours",
    alertTone: "danger",
    sources: ["BrokerStar"],
    modalKey: "sinistres",
  },
  {
    Icon: Wallet,
    iconColor: "var(--warn)",
    iconBg: "var(--warn-tint)",
    title: "Finance",
    metric: "+18",
    unit: "K",
    caption: "Cash-flow net · commissions 11.2 K",
    alert: "2 impayés — 3 200 CHF",
    alertTone: "warn",
    sources: ["BrokerStar", "Odoo"],
    modalKey: "finance",
    spark: [4, 6, 8, 7, 10, 12, 11, 14, 15, 16, 17, 18],
    sparkColor: "var(--warn)",
  },
  {
    Icon: Globe,
    iconColor: "var(--accent)",
    iconBg: "var(--accent-tint)",
    title: "Vue d'ensemble",
    metric: "68",
    unit: "%",
    caption: "Marge consolidée · vision combinée",
    alert: "+4 pt vs marché CH",
    alertTone: "good",
    sources: ["BrokerStar", "Odoo"],
    modalKey: "vue360",
    spark: [55, 58, 60, 62, 63, 64, 64, 66, 67, 67, 68, 68],
    sparkColor: "var(--accent)",
  },
  {
    Icon: Sparkles,
    iconColor: "#7C3AED",
    iconBg: "#F1ECFE",
    title: "Agents IA",
    metric: "3",
    unit: "",
    caption: "Actions préparées · prêtes à valider",
    alert: "Validation requise",
    alertTone: "neutral",
    sources: ["BrokerStar", "Odoo"],
    modalKey: "agents",
  },
];

const agents = [
  {
    Icon: Mail,
    iconColor: "var(--info)",
    iconBg: "var(--info-tint)",
    name: "Renouvellement",
    desc: "4 courriers rédigés — échéances J-28",
    meta: "BrokerStar · il y a 12 min",
    primary: "Valider",
  },
  {
    Icon: AlertCircle,
    iconColor: "var(--warn)",
    iconBg: "var(--warn-tint)",
    name: "Impayé Rossi SA",
    desc: "Relance préparée — 1 800 CHF, 67 jours",
    meta: "Odoo · il y a 28 min",
    primary: "Valider",
  },
  {
    Icon: FileText,
    iconColor: "var(--accent)",
    iconBg: "var(--accent-tint)",
    name: "Rapport direction",
    desc: "Synthèse mensuelle BrokerStar + Odoo prête",
    meta: "Combiné · il y a 1 h",
    primary: "Ouvrir",
    modalKey: "rapport" as ModalKey,
  },
];

const navLinks = [
  { label: "Vue d'ensemble", active: true },
  { label: "Domaines" },
  { label: "Agents" },
  { label: "Rapports" },
  { label: "Paramètres" },
];

export default function DashboardPageB() {
  const router = useRouter();
  const [modalKey, setModalKey] = useState<ModalKey | null>(null);
  const [filter, setFilter] = useState<"tous" | "brokerstar" | "odoo" | "combiné">("tous");
  const open = (k: ModalKey) => setModalKey(k);
  const close = () => setModalKey(null);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <TopBar onLogout={() => router.push("/")} />

      <div
        style={{
          maxWidth: "1320px",
          margin: "0 auto",
          padding: "clamp(1.5rem, 3vw, 2.5rem) clamp(1.25rem, 3vw, 2.5rem) 3rem",
        }}
      >
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: "1rem",
              flexWrap: "wrap",
              marginBottom: "1.5rem",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 500,
                  color: "var(--text-3)",
                  marginBottom: "0.35rem",
                }}
              >
                Mardi 12 mai 2026 · semaine 19
              </div>
              <h1
                style={{
                  fontSize: "clamp(1.6rem, 3vw, 2rem)",
                  fontWeight: 600,
                  letterSpacing: "-0.025em",
                  color: "var(--text)",
                  margin: 0,
                  marginBottom: "0.25rem",
                }}
              >
                Bonjour Thomas
              </h1>
              <p
                style={{
                  fontSize: "0.95rem",
                  color: "var(--text-2)",
                  margin: 0,
                }}
              >
                Voici votre cabinet aujourd&apos;hui — sources synchronisées il y a quelques minutes.
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <FilterButton label="Tous" active={filter === "tous"} onClick={() => setFilter("tous")} />
              <FilterButton
                label="BrokerStar"
                dot="var(--info)"
                active={filter === "brokerstar"}
                onClick={() => setFilter("brokerstar")}
              />
              <FilterButton
                label="Odoo"
                dot="#7C3AED"
                active={filter === "odoo"}
                onClick={() => setFilter("odoo")}
              />
              <FilterButton
                label="Combiné"
                dot="var(--accent)"
                active={filter === "combiné"}
                onClick={() => setFilter("combiné")}
              />
            </div>
          </div>

          <div
            className="mercury-kpis"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "0.85rem",
              marginBottom: "1.5rem",
            }}
          >
            {kpis.map((k) => (
              <KPICard key={k.label} kpi={k} />
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.5 }}
          style={{ marginBottom: "1.5rem" }}
        >
          <SectionHeader
            kicker="Domaines"
            title="Six tableaux à un coup d'œil"
            action="Tout voir →"
          />
          <div
            className="mercury-tiles"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "0.85rem",
            }}
          >
            {tiles.map((t) => (
              <TileCard key={t.title} tile={t} onOpen={open} />
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.5 }}
        >
          <AgentsInbox onOpen={open} />
        </motion.section>

        <Footer />
      </div>

      <MercuryModal open={modalKey !== null} modalKey={modalKey} onClose={close} />

      <style>{`
        @media (max-width: 1024px) {
          .mercury-kpis { grid-template-columns: repeat(2, 1fr) !important; }
          .mercury-tiles { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .mercury-kpis { grid-template-columns: 1fr !important; }
          .mercury-tiles { grid-template-columns: 1fr !important; }
          .mercury-topbar-nav { display: none !important; }
          .mercury-topbar-search { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function TopBar({ onLogout }: { onLogout: () => void }) {
  return (
    <header
      style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 30,
      }}
    >
      <div
        style={{
          maxWidth: "1320px",
          margin: "0 auto",
          padding: "0.7rem clamp(1.25rem, 3vw, 2.5rem)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          {/* Workspace switcher */}
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "0.3rem 0.55rem 0.3rem 0.35rem",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "background 0.15s, border-color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--surface)")}
          >
            <span
              style={{
                width: 24,
                height: 24,
                background: "var(--accent)",
                borderRadius: "5px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                fontSize: "0.62rem",
                fontWeight: 700,
              }}
            >
              CMA
            </span>
            <span
              style={{
                fontSize: "0.86rem",
                fontWeight: 600,
                color: "var(--text)",
                letterSpacing: "-0.01em",
              }}
            >
              Cabinet Müller
            </span>
            <ChevronDown size={14} strokeWidth={2.25} color="var(--text-3)" />
          </button>

          {/* Nav */}
          <nav className="mercury-topbar-nav" style={{ display: "flex", gap: "0.15rem" }}>
            {navLinks.map((l) => (
              <button
                key={l.label}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: "0.4rem 0.65rem",
                  fontFamily: "inherit",
                  fontSize: "0.86rem",
                  fontWeight: 500,
                  color: l.active ? "var(--text)" : "var(--text-3)",
                  cursor: "pointer",
                  borderRadius: "6px",
                  position: "relative",
                  transition: "color 0.15s, background 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!l.active) {
                    e.currentTarget.style.color = "var(--text)";
                    e.currentTarget.style.background = "var(--surface-2)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!l.active) {
                    e.currentTarget.style.color = "var(--text-3)";
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                {l.label}
                {l.active && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: -12,
                      left: 8,
                      right: 8,
                      height: 2,
                      background: "var(--accent)",
                      borderRadius: "2px 2px 0 0",
                    }}
                  />
                )}
              </button>
            ))}
          </nav>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            className="mercury-topbar-search"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "0.35rem 0.7rem",
              minWidth: "240px",
              color: "var(--text-3)",
              fontSize: "0.82rem",
              cursor: "text",
            }}
          >
            <Search size={14} strokeWidth={2.25} />
            <span style={{ flex: 1 }}>Rechercher…</span>
            <kbd
              style={{
                fontFamily: "var(--font-jbmono)",
                fontSize: "0.7rem",
                padding: "0.1rem 0.35rem",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                color: "var(--text-3)",
              }}
            >
              ⌘K
            </kbd>
          </div>

          <IconBtn label="Notifications" badge="5">
            <Bell size={16} strokeWidth={2} />
          </IconBtn>
          <IconBtn label="Paramètres">
            <Settings size={16} strokeWidth={2} />
          </IconBtn>

          <div
            style={{
              width: 1,
              height: 22,
              background: "var(--border)",
              margin: "0 0.3rem",
            }}
          />

          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
              background: "transparent",
              border: "none",
              padding: "0.2rem 0.4rem",
              cursor: "pointer",
              fontFamily: "inherit",
              borderRadius: "6px",
            }}
            title="Thomas Müller"
          >
            <span
              style={{
                width: 28,
                height: 28,
                background: "var(--text)",
                color: "#FFFFFF",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.68rem",
                fontWeight: 700,
              }}
            >
              TM
            </span>
          </button>

          <button
            onClick={onLogout}
            aria-label="Déconnexion"
            title="Déconnexion"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              background: "transparent",
              border: "1px solid transparent",
              borderRadius: "8px",
              color: "var(--text-3)",
              cursor: "pointer",
              transition: "color 0.15s, border-color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--danger)";
              e.currentTarget.style.borderColor = "var(--border)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-3)";
              e.currentTarget.style.borderColor = "transparent";
            }}
          >
            <LogOut size={15} strokeWidth={2} />
          </button>
        </div>
      </div>
    </header>
  );
}

function IconBtn({
  label,
  badge,
  children,
}: {
  label: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-label={label}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        width: 32,
        height: 32,
        background: "transparent",
        border: "1px solid transparent",
        borderRadius: "8px",
        color: "var(--text-2)",
        cursor: "pointer",
        transition: "background 0.15s, border-color 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--surface-2)";
        e.currentTarget.style.borderColor = "var(--border)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.borderColor = "transparent";
      }}
    >
      {children}
      {badge && (
        <span
          style={{
            position: "absolute",
            top: 3,
            right: 3,
            minWidth: 14,
            height: 14,
            padding: "0 3px",
            borderRadius: "7px",
            background: "var(--danger)",
            color: "#FFFFFF",
            fontSize: "0.58rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1.5px solid var(--surface)",
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function FilterButton({
  label,
  dot,
  active,
  onClick,
}: {
  label: string;
  dot?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        padding: "0.35rem 0.7rem",
        background: active ? "var(--surface)" : "transparent",
        border: `1px solid ${active ? "var(--border-strong)" : "var(--border)"}`,
        borderRadius: "100px",
        fontFamily: "inherit",
        fontSize: "0.78rem",
        fontWeight: active ? 600 : 500,
        color: active ? "var(--text)" : "var(--text-2)",
        cursor: "pointer",
        boxShadow: active ? "0 1px 2px rgba(15,20,25,0.05)" : "none",
        transition: "border-color 0.15s, background 0.15s",
      }}
    >
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: dot,
          }}
        />
      )}
      {label}
    </button>
  );
}

function KPICard({
  kpi,
}: {
  kpi: {
    label: string;
    value: string;
    unit: string;
    trend: string;
    trendDir: "up" | "down";
    spark: number[];
    combined: boolean;
  };
}) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "0.95rem 1rem 0.85rem",
        boxShadow:
          "0 1px 2px rgba(15,20,25,0.04), 0 4px 12px -8px rgba(15,20,25,0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.45rem",
        }}
      >
        <div
          style={{
            fontSize: "0.78rem",
            fontWeight: 500,
            color: "var(--text-3)",
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
          }}
        >
          {kpi.label}
          {kpi.combined && (
            <span
              style={{
                fontSize: "0.58rem",
                fontWeight: 700,
                color: "var(--accent)",
                background: "var(--accent-tint)",
                padding: "0.05rem 0.3rem",
                borderRadius: "4px",
                letterSpacing: "0.02em",
              }}
            >
              ⊕ COMBINÉ
            </span>
          )}
        </div>
        <button
          aria-label="Plus d'options"
          style={{
            display: "flex",
            background: "transparent",
            border: "none",
            color: "var(--text-4)",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <MoreHorizontal size={14} strokeWidth={2} />
        </button>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "0.35rem",
          marginBottom: "0.65rem",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-jbmono)",
            fontSize: "1.75rem",
            fontWeight: 500,
            letterSpacing: "-0.02em",
            color: "var(--text)",
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {kpi.value}
        </div>
        {kpi.unit && (
          <div
            style={{
              fontSize: "0.82rem",
              fontWeight: 500,
              color: "var(--text-3)",
            }}
          >
            {kpi.unit}
          </div>
        )}
        <div
          style={{
            marginLeft: "auto",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.2rem",
            fontSize: "0.72rem",
            fontWeight: 600,
            color: kpi.trendDir === "up" ? "var(--success)" : "var(--danger)",
            background: kpi.trendDir === "up" ? "var(--success-tint)" : "var(--danger-tint)",
            padding: "0.15rem 0.4rem",
            borderRadius: "4px",
          }}
        >
          {kpi.trendDir === "up" ? (
            <TrendingUp size={11} strokeWidth={2.5} />
          ) : (
            <TrendingDown size={11} strokeWidth={2.5} />
          )}
          {kpi.trend}
        </div>
      </div>

      <Sparkline
        data={kpi.spark}
        width={260}
        height={28}
        stroke="var(--accent)"
        fill="var(--accent-tint)"
        strokeWidth={1.5}
      />
    </div>
  );
}

function SectionHeader({
  kicker,
  title,
  action,
}: {
  kicker: string;
  title: string;
  action?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: "1rem",
        marginBottom: "0.85rem",
        flexWrap: "wrap",
      }}
    >
      <div>
        <div
          style={{
            fontSize: "0.7rem",
            fontWeight: 600,
            color: "var(--accent)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: "0.2rem",
          }}
        >
          {kicker}
        </div>
        <h2
          style={{
            fontSize: "1.05rem",
            fontWeight: 600,
            color: "var(--text)",
            letterSpacing: "-0.015em",
            margin: 0,
          }}
        >
          {title}
        </h2>
      </div>
      {action && (
        <button
          style={{
            fontFamily: "inherit",
            background: "transparent",
            border: "none",
            color: "var(--accent)",
            fontSize: "0.82rem",
            fontWeight: 600,
            cursor: "pointer",
            padding: 0,
          }}
        >
          {action}
        </button>
      )}
    </div>
  );
}

function TileCard({
  tile,
  onOpen,
}: {
  tile: TileEntry;
  onOpen: (k: ModalKey) => void;
}) {
  const alertColor =
    tile.alertTone === "warn"
      ? "var(--warn)"
      : tile.alertTone === "good"
      ? "var(--success)"
      : tile.alertTone === "danger"
      ? "var(--danger)"
      : "var(--text-3)";
  const alertBg =
    tile.alertTone === "warn"
      ? "var(--warn-tint)"
      : tile.alertTone === "good"
      ? "var(--success-tint)"
      : tile.alertTone === "danger"
      ? "var(--danger-tint)"
      : "var(--surface-2)";

  const { Icon } = tile;

  return (
    <motion.button
      onClick={() => onOpen(tile.modalKey)}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18 }}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "1rem 1.05rem 0.95rem",
        textAlign: "left",
        fontFamily: "inherit",
        color: "inherit",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: "0.85rem",
        boxShadow:
          "0 1px 2px rgba(15,20,25,0.04), 0 4px 12px -8px rgba(15,20,25,0.06)",
        transition: "border-color 0.18s, box-shadow 0.18s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--border-strong)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.55rem",
            color: "var(--text)",
          }}
        >
          <span
            style={{
              width: 30,
              height: 30,
              background: tile.iconBg,
              color: tile.iconColor,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon size={15} strokeWidth={2} />
          </span>
          <span
            style={{
              fontSize: "0.92rem",
              fontWeight: 600,
              letterSpacing: "-0.01em",
            }}
          >
            {tile.title}
          </span>
        </div>
        <ArrowUpRight size={14} strokeWidth={2.25} color="var(--text-4)" />
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: "0.75rem" }}>
        <div
          style={{
            fontFamily: "var(--font-jbmono)",
            fontSize: "2rem",
            fontWeight: 500,
            letterSpacing: "-0.03em",
            color: "var(--text)",
            lineHeight: 0.95,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {tile.metric}
          {tile.unit && (
            <span
              style={{
                fontSize: "0.55em",
                fontWeight: 500,
                color: "var(--text-3)",
                marginLeft: "0.15rem",
                letterSpacing: 0,
              }}
            >
              {tile.unit}
            </span>
          )}
        </div>
        {tile.spark && (
          <div style={{ flex: 1, marginBottom: "0.2rem", opacity: 0.85 }}>
            <Sparkline
              data={tile.spark}
              width={140}
              height={20}
              stroke={tile.sparkColor ?? "var(--accent)"}
              strokeWidth={1.4}
            />
          </div>
        )}
      </div>

      <div
        style={{
          fontSize: "0.78rem",
          color: "var(--text-3)",
          lineHeight: 1.4,
        }}
      >
        {tile.caption}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          paddingTop: "0.6rem",
          borderTop: "1px solid var(--border)",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
            fontSize: "0.72rem",
            fontWeight: 600,
            color: alertColor,
            background: alertBg,
            padding: "0.2rem 0.5rem",
            borderRadius: "6px",
          }}
        >
          <Circle size={6} strokeWidth={0} fill="currentColor" />
          {tile.alert}
        </span>
        <span style={{ flex: 1 }} />
        <span
          style={{
            display: "inline-flex",
            gap: "0.3rem",
            fontSize: "0.68rem",
            color: "var(--text-4)",
            fontWeight: 500,
          }}
        >
          {tile.sources.join(" · ")}
        </span>
      </div>
    </motion.button>
  );
}

function AgentsInbox({ onOpen }: { onOpen: (k: ModalKey) => void }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        boxShadow:
          "0 1px 2px rgba(15,20,25,0.04), 0 4px 12px -8px rgba(15,20,25,0.06)",
      }}
    >
      <div
        style={{
          padding: "0.95rem 1.1rem",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          <span
            style={{
              width: 28,
              height: 28,
              background: "var(--accent-tint)",
              color: "var(--accent)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkles size={14} strokeWidth={2} />
          </span>
          <div style={{ lineHeight: 1.2 }}>
            <div
              style={{
                fontSize: "0.92rem",
                fontWeight: 600,
                color: "var(--text)",
                letterSpacing: "-0.01em",
              }}
            >
              Agents IA · Boîte de réception
            </div>
            <div style={{ fontSize: "0.74rem", color: "var(--text-3)", marginTop: "0.1rem" }}>
              3 actions préparées cette nuit — prêtes à valider
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span
            style={{
              fontSize: "0.66rem",
              fontWeight: 600,
              color: "var(--success)",
              background: "var(--success-tint)",
              padding: "0.2rem 0.5rem",
              borderRadius: "100px",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--success)",
              }}
            />
            LPD conforme · Infomaniak
          </span>
          <button
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              padding: "0.35rem 0.6rem",
              fontSize: "0.74rem",
              fontWeight: 600,
              color: "var(--text-2)",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <Plus size={13} strokeWidth={2.25} />
            Nouvel agent
          </button>
        </div>
      </div>

      {agents.map((a, i) => (
        <AgentRow
          key={a.name}
          agent={a}
          isLast={i === agents.length - 1}
          onOpen={a.modalKey ? () => onOpen(a.modalKey!) : undefined}
        />
      ))}
    </div>
  );
}

function AgentRow({
  agent,
  isLast,
  onOpen,
}: {
  agent: {
    Icon: typeof Mail;
    iconColor: string;
    iconBg: string;
    name: string;
    desc: string;
    meta: string;
    primary: string;
  };
  isLast: boolean;
  onOpen?: () => void;
}) {
  const [done, setDone] = useState<"none" | "validated" | "dismissed">("none");
  const { Icon } = agent;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        gap: "1rem",
        alignItems: "center",
        padding: "0.85rem 1.1rem",
        borderBottom: isLast ? "none" : "1px solid var(--border)",
        opacity: done !== "none" ? 0.4 : 1,
        transition: "opacity 0.25s, background 0.15s",
      }}
    >
      <span
        style={{
          width: 32,
          height: 32,
          background: agent.iconBg,
          color: agent.iconColor,
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={15} strokeWidth={2} />
      </span>
      <div>
        <div
          style={{
            fontSize: "0.9rem",
            fontWeight: 600,
            color: "var(--text)",
            letterSpacing: "-0.01em",
            marginBottom: "0.15rem",
          }}
        >
          {agent.name}
        </div>
        <div
          style={{
            fontSize: "0.8rem",
            color: "var(--text-2)",
            lineHeight: 1.4,
          }}
        >
          {agent.desc}
        </div>
        <div
          style={{
            fontSize: "0.7rem",
            color: "var(--text-4)",
            marginTop: "0.2rem",
          }}
        >
          {agent.meta}
        </div>
      </div>
      <div style={{ display: "flex", gap: "0.4rem" }}>
        <button
          onClick={() => {
            setDone("validated");
            onOpen?.();
          }}
          disabled={done !== "none"}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
            padding: "0.4rem 0.7rem",
            background: done === "none" ? "var(--accent)" : "transparent",
            color: done === "none" ? "#FFFFFF" : "var(--text-3)",
            border: `1px solid ${done === "none" ? "var(--accent)" : "var(--border)"}`,
            borderRadius: "8px",
            fontFamily: "inherit",
            fontSize: "0.78rem",
            fontWeight: 600,
            cursor: done === "none" ? "pointer" : "default",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => {
            if (done === "none") e.currentTarget.style.background = "var(--accent-2)";
          }}
          onMouseLeave={(e) => {
            if (done === "none") e.currentTarget.style.background = "var(--accent)";
          }}
        >
          {done === "validated" ? <Check size={13} strokeWidth={2.25} /> : null}
          {done === "validated" ? "Fait" : agent.primary}
        </button>
        <button
          onClick={() => setDone("dismissed")}
          disabled={done !== "none"}
          aria-label="Ignorer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            padding: "0.4rem",
            background: "var(--surface)",
            color: "var(--text-3)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            cursor: done === "none" ? "pointer" : "default",
          }}
        >
          <X size={13} strokeWidth={2.25} />
        </button>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer
      style={{
        marginTop: "2.5rem",
        paddingTop: "1.25rem",
        borderTop: "1px solid var(--border)",
        display: "flex",
        justifyContent: "space-between",
        gap: "1rem",
        fontSize: "0.74rem",
        color: "var(--text-3)",
        flexWrap: "wrap",
      }}
    >
      <span>Cabinet Müller &amp; Associés SA · Zürich, CH</span>
      <span>Sync BrokerStar il y a 3 min · Odoo il y a 5 min</span>
      <span>LPD Art.16 · Infomaniak CH</span>
    </footer>
  );
}
