"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search, Bell, ChevronDown, LogOut, Settings,
  TrendingUp, ArrowUpRight, ArrowRight, Check, X, Circle,
  Target, FolderArchive, Flame, Wallet, Globe, Sparkles,
  Mail, AlertCircle, FileText,
} from "lucide-react";
import type { ModalKey } from "@/lib/types";
import PlinthModal from "@/components/f/PlinthModal";
import { Sparkline } from "@/components/shared/Sparkline";
import { CountUp, formatThousands } from "@/components/shared/CountUp";

const kpis = [
  {
    label: "CA mensuel",
    target: 92400,
    format: (n: number) => formatThousands(n),
    unit: "CHF",
    trend: "+12.0%",
    spark: [62, 64, 70, 68, 72, 78, 80, 82, 86, 88, 92, 92],
    combined: true,
  },
  {
    label: "Marge nette",
    target: 68,
    format: (n: number) => String(Math.round(n)),
    unit: "%",
    trend: "+4 pt",
    spark: [55, 58, 60, 62, 63, 64, 64, 66, 67, 67, 68, 68],
    combined: true,
  },
  {
    label: "Cash-flow",
    target: 18,
    format: (n: number) => "+" + Math.round(n),
    unit: "K",
    trend: "stable",
    spark: [4, 6, 8, 7, 10, 12, 11, 14, 15, 16, 17, 18],
    combined: true,
  },
  {
    label: "Rétention",
    target: 87,
    format: (n: number) => String(Math.round(n)),
    unit: "%",
    trend: "+3 pt",
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
};

const tiles: TileEntry[] = [
  {
    Icon: Target, iconColor: "var(--accent)", iconBg: "var(--accent-tint)",
    title: "Prospection", metric: "18", unit: "%",
    caption: "Taux de conversion · 12 prospects actifs.",
    alert: "3 relances dues", alertTone: "warn",
    sources: ["BrokerStar"], modalKey: "prospection",
    spark: [10, 12, 11, 14, 14, 15, 16, 17, 17, 18, 18, 18],
  },
  {
    Icon: FolderArchive, iconColor: "var(--info)", iconBg: "var(--info-tint)",
    title: "Portefeuille", metric: "189", unit: "",
    caption: "Contrats actifs · 85 K CHF de primes.",
    alert: "4 renouvellements J-30", alertTone: "neutral",
    sources: ["BrokerStar"], modalKey: "portefeuille",
    spark: [182, 183, 184, 184, 185, 186, 186, 187, 188, 188, 189, 189],
  },
  {
    Icon: Flame, iconColor: "var(--danger)", iconBg: "var(--danger-tint)",
    title: "Sinistres", metric: "3", unit: "",
    caption: "Dossiers ouverts · ratio 12 % CA.",
    alert: "SIN-0047 — 68 jours", alertTone: "danger",
    sources: ["BrokerStar"], modalKey: "sinistres",
  },
  {
    Icon: Wallet, iconColor: "var(--warn)", iconBg: "var(--warn-tint)",
    title: "Finance", metric: "+18", unit: "K",
    caption: "Cash-flow net · commissions 11.2 K.",
    alert: "2 impayés — 3 200 CHF", alertTone: "warn",
    sources: ["BrokerStar", "Odoo"], modalKey: "finance",
    spark: [4, 6, 8, 7, 10, 12, 11, 14, 15, 16, 17, 18],
  },
  {
    Icon: Globe, iconColor: "var(--accent)", iconBg: "var(--accent-tint)",
    title: "Vue d'ensemble", metric: "68", unit: "%",
    caption: "Marge consolidée · vision combinée.",
    alert: "+4 pt vs marché CH", alertTone: "good",
    sources: ["BrokerStar", "Odoo"], modalKey: "vue360",
    spark: [55, 58, 60, 62, 63, 64, 64, 66, 67, 67, 68, 68],
  },
  {
    Icon: Sparkles, iconColor: "var(--accent)", iconBg: "var(--accent-tint)",
    title: "Agents IA", metric: "3", unit: "",
    caption: "Actions préparées · prêtes à valider.",
    alert: "Validation requise", alertTone: "neutral",
    sources: ["BrokerStar", "Odoo"], modalKey: "agents",
  },
];

const agents = [
  {
    Icon: Mail, iconColor: "var(--info)", iconBg: "var(--info-tint)",
    name: "Renouvellement",
    desc: "4 courriers rédigés — échéances J-28",
    source: "BrokerStar", time: "il y a 12 min",
  },
  {
    Icon: AlertCircle, iconColor: "var(--warn)", iconBg: "var(--warn-tint)",
    name: "Impayé Rossi SA",
    desc: "Relance préparée — 1 800 CHF · 67 jours",
    source: "Odoo", time: "il y a 28 min",
  },
  {
    Icon: FileText, iconColor: "var(--accent)", iconBg: "var(--accent-tint)",
    name: "Rapport direction",
    desc: "Synthèse mensuelle BrokerStar + Odoo prête",
    source: "Combiné", time: "il y a 1 h",
    modalKey: "rapport" as ModalKey,
  },
];

const navLinks = [
  { label: "Vue d'ensemble", active: true },
  { label: "Domaines" },
  { label: "Agents" },
  { label: "Rapports" },
];

export default function DashboardPageF() {
  const router = useRouter();
  const [modalKey, setModalKey] = useState<ModalKey | null>(null);
  const open = (k: ModalKey) => setModalKey(k);
  const close = () => setModalKey(null);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <TopBar onLogout={() => router.push("/")} />

      <main
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          padding: "clamp(2rem, 4vw, 3rem) clamp(1.5rem, 3vw, 2.5rem) 4rem",
        }}
      >
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
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
              <h1
                style={{
                  fontSize: "clamp(1.75rem, 3vw, 2.15rem)",
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
                  fontSize: "0.92rem",
                  color: "var(--text-3)",
                  margin: 0,
                }}
              >
                Mardi 12 mai 2026 · Cabinet Müller &amp; Associés
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.45rem" }}>
              <SoftBadge dot="var(--info)" label="BrokerStar · 3 min" />
              <SoftBadge dot="var(--accent)" label="Odoo · 5 min" />
            </div>
          </div>

          <div
            className="plinth-kpis"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "0.85rem",
              marginBottom: "clamp(1.5rem, 3vw, 2.5rem)",
            }}
          >
            {kpis.map((k, i) => (
              <KPICard key={k.label} kpi={k} delay={i * 70} />
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.55 }}
        >
          <SectionHeader title="Domaines" subtitle="Six tableaux opérationnels." />
          <div
            className="plinth-tiles"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "0.85rem",
              marginTop: "1rem",
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
          transition={{ delay: 0.14, duration: 0.55 }}
          style={{ marginTop: "clamp(1.5rem, 3vw, 2.5rem)" }}
        >
          <SectionHeader title="Agents IA" subtitle="Trois actions préparées cette nuit." />
          <div
            style={{
              marginTop: "1rem",
              background: "var(--surface)",
              borderRadius: "14px",
              overflow: "hidden",
              boxShadow: "var(--tier-1)",
            }}
          >
            {agents.map((a, i) => (
              <AgentRow
                key={a.name}
                agent={a}
                isLast={i === agents.length - 1}
                onOpen={a.modalKey ? () => open(a.modalKey!) : undefined}
              />
            ))}
          </div>
        </motion.section>

        <Footer />
      </main>

      <PlinthModal open={modalKey !== null} modalKey={modalKey} onClose={close} />

      <style>{`
        @media (max-width: 1100px) {
          .plinth-kpis { grid-template-columns: repeat(2, 1fr) !important; }
          .plinth-tiles { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 720px) {
          .plinth-nav { display: none !important; }
        }
        @media (max-width: 600px) {
          .plinth-kpis { grid-template-columns: 1fr !important; }
          .plinth-tiles { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function TopBar({ onLogout }: { onLogout: () => void }) {
  return (
    <header
      style={{
        background: "rgba(245,245,247,0.8)",
        backdropFilter: "saturate(180%) blur(20px)",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <div
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          padding: "0.75rem clamp(1.5rem, 3vw, 2.5rem)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.55rem",
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <span
              style={{
                width: 28,
                height: 28,
                background: "linear-gradient(to bottom, var(--accent), var(--accent-2))",
                color: "#FFFFFF",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.66rem",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.3), 0 0 0 1px rgba(68,65,200,0.2), 0 2px 6px -2px rgba(88,86,214,0.35)",
              }}
            >
              CMA
            </span>
            <span
              style={{
                fontSize: "0.92rem",
                fontWeight: 600,
                color: "var(--text)",
                letterSpacing: "-0.015em",
              }}
            >
              Cabinet Müller
            </span>
            <ChevronDown size={13} strokeWidth={2.25} color="var(--text-3)" />
          </button>
          <nav className="plinth-nav" style={{ display: "flex", gap: "0.2rem" }}>
            {navLinks.map((l) => (
              <button
                key={l.label}
                style={{
                  background: l.active ? "var(--surface)" : "transparent",
                  border: "none",
                  padding: "0.42rem 0.75rem",
                  fontFamily: "inherit",
                  fontSize: "0.84rem",
                  fontWeight: l.active ? 600 : 500,
                  color: l.active ? "var(--text)" : "var(--text-3)",
                  cursor: "pointer",
                  borderRadius: "9px",
                  boxShadow: l.active ? "var(--tier-1)" : "none",
                  transition: "all 0.22s ease",
                }}
                onMouseEnter={(e) => {
                  if (!l.active) {
                    e.currentTarget.style.color = "var(--text)";
                    e.currentTarget.style.background = "var(--surface)";
                    e.currentTarget.style.boxShadow = "var(--tier-1)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!l.active) {
                    e.currentTarget.style.color = "var(--text-3)";
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.boxShadow = "none";
                  }
                }}
              >
                {l.label}
              </button>
            ))}
          </nav>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
              background: "var(--surface)",
              borderRadius: "9px",
              padding: "0.35rem 0.6rem",
              color: "var(--text-3)",
              fontSize: "0.8rem",
              cursor: "text",
              boxShadow: "var(--tier-1)",
            }}
          >
            <Search size={13} strokeWidth={2} />
            <kbd
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.66rem",
                color: "var(--text-3)",
              }}
            >
              ⌘K
            </kbd>
          </div>
          <IconBtn label="Notifications" badge="5">
            <Bell size={14} strokeWidth={2} />
          </IconBtn>
          <IconBtn label="Paramètres">
            <Settings size={14} strokeWidth={2} />
          </IconBtn>
          <span
            style={{
              width: 30,
              height: 30,
              background: "linear-gradient(to bottom, var(--text-2), var(--text))",
              color: "#FFFFFF",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.66rem",
              fontWeight: 700,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), 0 1px 2px rgba(0,0,0,0.12)",
            }}
            title="Thomas Müller"
          >
            TM
          </span>
          <button
            onClick={onLogout}
            aria-label="Déconnexion"
            title="Déconnexion"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 30,
              height: 30,
              background: "transparent",
              border: "none",
              borderRadius: "8px",
              color: "var(--text-3)",
              cursor: "pointer",
              transition: "color 0.22s, background 0.22s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--danger)";
              e.currentTarget.style.background = "var(--danger-tint)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-3)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <LogOut size={13} strokeWidth={2} />
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
        background: "var(--surface)",
        border: "none",
        borderRadius: "9px",
        color: "var(--text-2)",
        cursor: "pointer",
        boxShadow: "var(--tier-1)",
        transition: "transform 0.22s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
    >
      {children}
      {badge && (
        <span
          style={{
            position: "absolute",
            top: 1,
            right: 1,
            minWidth: 14,
            height: 14,
            padding: "0 3px",
            borderRadius: "7px",
            background: "var(--danger)",
            color: "#FFFFFF",
            fontSize: "0.56rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid var(--bg)",
            boxShadow: "0 1px 2px rgba(0,0,0,0.18)",
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function SoftBadge({ dot, label }: { dot: string; label: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        fontSize: "0.74rem",
        fontWeight: 500,
        color: "var(--text-2)",
        background: "var(--surface)",
        padding: "0.35rem 0.65rem",
        borderRadius: "100px",
        boxShadow: "var(--tier-1)",
      }}
    >
      <Circle size={6} strokeWidth={0} fill={dot} />
      {label}
    </span>
  );
}

function KPICard({
  kpi,
  delay,
}: {
  kpi: typeof kpis[number];
  delay: number;
}) {
  return (
    <div
      className="plinth-kpi"
      style={{
        background: "var(--surface)",
        borderRadius: "14px",
        padding: "1.1rem 1.15rem 1rem",
        boxShadow: "var(--tier-1)",
        display: "flex",
        flexDirection: "column",
        gap: "0.6rem",
        transition: "transform 0.22s ease, box-shadow 0.22s ease",
        cursor: "default",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: "0.78rem",
            fontWeight: 500,
            color: "var(--text-3)",
          }}
        >
          {kpi.label}
        </span>
        {kpi.combined && (
          <span
            style={{
              fontSize: "0.58rem",
              fontWeight: 700,
              color: "var(--accent)",
              background: "var(--accent-tint)",
              padding: "0.1rem 0.4rem",
              borderRadius: "4px",
              letterSpacing: "0.06em",
            }}
          >
            ⊕ COMBINÉ
          </span>
        )}
      </div>

      {/* Mixed-weight number */}
      <div style={{ display: "flex", alignItems: "baseline", gap: "0.3rem" }}>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "2rem",
            fontWeight: 600,
            letterSpacing: "-0.04em",
            color: "var(--text)",
            lineHeight: 0.95,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <CountUp value={kpi.target} format={kpi.format} duration={900} delay={delay} />
        </span>
        {kpi.unit && (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.84rem",
              fontWeight: 500,
              color: "var(--text-3)",
              letterSpacing: "-0.01em",
            }}
          >
            {kpi.unit}
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.25rem",
            fontSize: "0.72rem",
            fontWeight: 600,
            color: "var(--success)",
            background: "var(--success-tint)",
            padding: "0.15rem 0.45rem",
            borderRadius: "5px",
          }}
        >
          <TrendingUp size={10} strokeWidth={2.5} />
          {kpi.trend}
        </span>
        <span style={{ flex: 1, marginLeft: "0.3rem" }}>
          <Sparkline
            data={kpi.spark}
            width={130}
            height={22}
            stroke="var(--accent)"
            strokeWidth={1.5}
          />
        </span>
      </div>

      <style>{`
        .plinth-kpi:hover {
          transform: translateY(-2px);
          box-shadow: var(--tier-2);
        }
      `}</style>
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div>
      <h2
        style={{
          fontSize: "1.15rem",
          fontWeight: 600,
          color: "var(--text)",
          letterSpacing: "-0.02em",
          margin: 0,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          style={{
            fontSize: "0.84rem",
            color: "var(--text-3)",
            margin: 0,
            marginTop: "0.15rem",
          }}
        >
          {subtitle}
        </p>
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
  const { Icon } = tile;
  const alertColor =
    tile.alertTone === "warn"
      ? "var(--warn)"
      : tile.alertTone === "good"
      ? "var(--success)"
      : tile.alertTone === "danger"
      ? "var(--danger)"
      : "var(--text-3)";
  return (
    <button
      onClick={() => onOpen(tile.modalKey)}
      style={{
        background: "var(--surface)",
        border: "none",
        borderRadius: "14px",
        padding: "1.05rem 1.1rem 0.95rem",
        textAlign: "left",
        fontFamily: "inherit",
        color: "inherit",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: "0.7rem",
        boxShadow: "var(--tier-1)",
        transition: "transform 0.22s ease, box-shadow 0.22s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "var(--tier-2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "var(--tier-1)";
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
          <span
            style={{
              width: 30,
              height: 30,
              background: tile.iconBg,
              color: tile.iconColor,
              borderRadius: "9px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
            }}
          >
            <Icon size={14} strokeWidth={2} />
          </span>
          <span
            style={{
              fontSize: "0.92rem",
              fontWeight: 600,
              color: "var(--text)",
              letterSpacing: "-0.01em",
            }}
          >
            {tile.title}
          </span>
        </div>
        <ArrowUpRight size={14} strokeWidth={2.25} color="var(--text-4)" />
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: "0.7rem" }}>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "1.9rem",
            fontWeight: 600,
            letterSpacing: "-0.035em",
            color: "var(--text)",
            lineHeight: 0.95,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {tile.metric}
          {tile.unit && (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.55em",
                fontWeight: 500,
                color: "var(--text-3)",
                marginLeft: "0.12rem",
                letterSpacing: 0,
              }}
            >
              {tile.unit}
            </span>
          )}
        </span>
        {tile.spark && (
          <div
            style={{ flex: 1, marginBottom: "0.2rem", color: tile.iconColor, opacity: 0.85 }}
          >
            <Sparkline
              data={tile.spark}
              width={130}
              height={20}
              stroke="currentColor"
              strokeWidth={1.4}
            />
          </div>
        )}
      </div>

      <p
        style={{
          fontSize: "0.8rem",
          color: "var(--text-3)",
          lineHeight: 1.45,
          margin: 0,
          minHeight: "1.15rem",
        }}
      >
        {tile.caption}
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          paddingTop: "0.55rem",
          background:
            "linear-gradient(to right, transparent, var(--border) 12%, var(--border) 88%, transparent) top / 100% 1px no-repeat",
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
          }}
        >
          <Circle size={5} strokeWidth={0} fill="currentColor" />
          {tile.alert}
        </span>
        <span style={{ flex: 1 }} />
        <span
          style={{
            fontSize: "0.66rem",
            color: "var(--text-4)",
            fontWeight: 500,
          }}
        >
          {tile.sources.join(" · ")}
        </span>
      </div>
    </button>
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
    source: string;
    time: string;
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
        gap: "0.95rem",
        alignItems: "center",
        padding: "0.95rem 1.15rem",
        borderBottom: isLast ? "none" : "1px solid var(--border)",
        opacity: done !== "none" ? 0.4 : 1,
        transition: "opacity 0.25s",
      }}
    >
      <span
        style={{
          width: 32,
          height: 32,
          background: agent.iconBg,
          color: agent.iconColor,
          borderRadius: "9px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
        }}
      >
        <Icon size={15} strokeWidth={2} />
      </span>
      <div>
        <div
          style={{
            fontSize: "0.92rem",
            fontWeight: 600,
            color: "var(--text)",
            letterSpacing: "-0.005em",
            marginBottom: "0.1rem",
          }}
        >
          Agent · {agent.name}
        </div>
        <div style={{ fontSize: "0.8rem", color: "var(--text-3)", lineHeight: 1.45 }}>
          {agent.desc}{" "}
          <span style={{ color: "var(--text-4)" }}>
            · {agent.source} · {agent.time}
          </span>
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
            padding: "0.45rem 0.85rem",
            background:
              done === "none"
                ? "linear-gradient(to bottom, var(--accent), var(--accent-2))"
                : "var(--surface)",
            color: done === "none" ? "#FFFFFF" : "var(--text-3)",
            border: "none",
            borderRadius: "9px",
            fontFamily: "inherit",
            fontSize: "0.78rem",
            fontWeight: 600,
            cursor: done === "none" ? "pointer" : "default",
            boxShadow:
              done === "none"
                ? "inset 0 1px 0 rgba(255,255,255,0.25), 0 0 0 1px rgba(68,65,200,0.30), 0 4px 14px -4px rgba(88,86,214,0.40)"
                : "var(--tier-1)",
            transition: "transform 0.22s ease",
          }}
          onMouseEnter={(e) => {
            if (done === "none") e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            if (done === "none") e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          {done === "validated" && <Check size={12} strokeWidth={2.5} />}
          {done === "validated" ? "Fait" : onOpen ? "Ouvrir" : "Valider"}
        </button>
        <button
          onClick={() => setDone("dismissed")}
          disabled={done !== "none"}
          aria-label="Ignorer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 30,
            padding: "0.45rem",
            background: "var(--surface)",
            color: "var(--text-3)",
            border: "none",
            borderRadius: "9px",
            boxShadow: "var(--tier-1)",
            cursor: done === "none" ? "pointer" : "default",
            transition: "transform 0.22s ease",
          }}
        >
          <X size={12} strokeWidth={2.25} />
        </button>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer
      style={{
        marginTop: "clamp(3rem, 5vw, 4rem)",
        paddingTop: "1.25rem",
        background:
          "linear-gradient(to right, transparent, var(--border) 8%, var(--border) 92%, transparent) top / 100% 1px no-repeat",
        display: "flex",
        justifyContent: "space-between",
        gap: "1rem",
        fontSize: "0.74rem",
        color: "var(--text-3)",
        flexWrap: "wrap",
      }}
    >
      <span>© 2026 Cabinet Müller &amp; Associés SA · Zürich</span>
      <span>Sync BrokerStar 3 min · Odoo 5 min</span>
      <span>LPD Art.16 · Infomaniak CH</span>
    </footer>
  );
}
