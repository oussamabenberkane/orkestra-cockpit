"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search, Bell, ChevronDown, LogOut, Settings, Plus, Download,
  TrendingUp, TrendingDown, ArrowUpRight, ArrowRight, MoreHorizontal,
  Target, FolderArchive, Flame, Wallet, Globe, Sparkles,
  Mail, AlertCircle, FileText, Check, X, Circle, BarChart3, AlertTriangle,
} from "lucide-react";
import type { ModalKey } from "@/lib/types";
import BureauModal from "@/components/d/BureauModal";
import { Sparkline, MiniBars } from "@/components/shared/Sparkline";

const heroData = [62, 64, 70, 68, 72, 78, 80, 82, 86, 88, 92, 92];

const smallKpis = [
  {
    label: "Marge nette",
    value: "68",
    unit: "%",
    trend: "+4 pt",
    trendDir: "up" as const,
    spark: [55, 58, 60, 62, 63, 64, 64, 66, 67, 67, 68, 68],
    combined: true,
    accent: "var(--brand)",
  },
  {
    label: "Cash-flow",
    value: "+18",
    unit: "K",
    trend: "+K vs M-1",
    trendDir: "up" as const,
    spark: [4, 6, 8, 7, 10, 12, 11, 14, 15, 16, 17, 18],
    combined: true,
    accent: "var(--success)",
  },
];

const midKpis = [
  {
    label: "Rétention",
    value: "87",
    unit: "%",
    trend: "+3 pt marché CH",
    trendDir: "up" as const,
    bars: [80, 81, 82, 82, 83, 84, 85, 86, 87],
    accent: "var(--info)",
  },
  {
    label: "Contrats actifs",
    value: "189",
    unit: "",
    trend: "+4 J-30",
    trendDir: "up" as const,
    bars: [180, 182, 184, 184, 185, 187, 188, 188, 189],
    accent: "var(--brand)",
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
    Icon: Target, iconColor: "var(--brand)", iconBg: "var(--brand-tint)",
    title: "Prospection", metric: "18", unit: "%",
    caption: "Taux de conversion · 12 prospects actifs",
    alert: "3 relances dues", alertTone: "warn",
    sources: ["BrokerStar"], modalKey: "prospection",
    spark: [10, 12, 11, 14, 14, 15, 16, 17, 17, 18],
  },
  {
    Icon: FolderArchive, iconColor: "var(--info)", iconBg: "var(--info-tint)",
    title: "Portefeuille", metric: "189", unit: "",
    caption: "Contrats · 85 K CHF de primes",
    alert: "4 renouvellements J-30", alertTone: "neutral",
    sources: ["BrokerStar"], modalKey: "portefeuille",
    spark: [180, 182, 184, 184, 185, 186, 187, 188, 189],
  },
  {
    Icon: Wallet, iconColor: "var(--warn)", iconBg: "var(--warn-tint)",
    title: "Finance", metric: "+18", unit: "K",
    caption: "Cash-flow net · commissions 11.2 K",
    alert: "2 impayés — 3 200 CHF", alertTone: "warn",
    sources: ["BrokerStar", "Odoo"], modalKey: "finance",
    spark: [4, 6, 8, 7, 10, 12, 11, 14, 15, 18],
  },
  {
    Icon: Globe, iconColor: "var(--brand)", iconBg: "var(--brand-tint)",
    title: "Vue d'ensemble", metric: "68", unit: "%",
    caption: "Marge consolidée · vision combinée",
    alert: "+4 pt vs marché CH", alertTone: "good",
    sources: ["BrokerStar", "Odoo"], modalKey: "vue360",
    spark: [55, 58, 60, 62, 63, 64, 64, 66, 67, 68],
  },
  {
    Icon: Sparkles, iconColor: "var(--accent)", iconBg: "var(--accent-tint)",
    title: "Agents IA", metric: "3", unit: "",
    caption: "Actions préparées · prêtes à valider",
    alert: "Validation requise", alertTone: "neutral",
    sources: ["BrokerStar", "Odoo"], modalKey: "agents",
  },
  {
    Icon: Flame, iconColor: "var(--danger)", iconBg: "var(--danger-tint)",
    title: "Sinistres détaillés", metric: "3", unit: "",
    caption: "Voir les dossiers SIN-0047 · SIN-0051 · SIN-0053",
    alert: "1 urgent — ratio 12 % CA", alertTone: "danger",
    sources: ["BrokerStar"], modalKey: "sinistres",
  },
];

const agents = [
  {
    Icon: Mail, iconColor: "var(--info)", iconBg: "var(--info-tint)",
    name: "Renouvellement", desc: "4 courriers — échéances J-28", source: "BrokerStar",
  },
  {
    Icon: AlertCircle, iconColor: "var(--warn)", iconBg: "var(--warn-tint)",
    name: "Impayé Rossi SA", desc: "Relance préparée — 1 800 CHF · 67 jours", source: "Odoo",
  },
  {
    Icon: FileText, iconColor: "var(--brand)", iconBg: "var(--brand-tint)",
    name: "Rapport direction", desc: "Synthèse mensuelle combinée prête à l'envoi", source: "Combiné",
    modalKey: "rapport" as ModalKey,
  },
];

const navTabs = [
  { label: "Vue d'ensemble", active: true },
  { label: "Domaines" },
  { label: "Agents" },
  { label: "Rapports" },
  { label: "Équipe" },
  { label: "Paramètres" },
];

export default function DashboardPageD() {
  const router = useRouter();
  const [modalKey, setModalKey] = useState<ModalKey | null>(null);
  const open = (k: ModalKey) => setModalKey(k);
  const close = () => setModalKey(null);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <UtilityBar onLogout={() => router.push("/")} />
      <NavBar />

      <main
        style={{
          maxWidth: "1320px",
          margin: "0 auto",
          padding: "clamp(1.5rem, 3vw, 2.5rem) clamp(1.25rem, 3vw, 2.5rem) 3rem",
        }}
      >
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
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
                  fontSize: "clamp(1.5rem, 2.5vw, 1.9rem)",
                  fontWeight: 700,
                  letterSpacing: "-0.025em",
                  color: "var(--text)",
                  margin: 0,
                  marginBottom: "0.25rem",
                }}
              >
                Bonjour Thomas
              </h1>
              <p style={{ fontSize: "0.9rem", color: "var(--text-3)", margin: 0 }}>
                Mardi 12 mai 2026 · semaine 19 · 5 courtiers, Zürich
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.5rem 0.85rem",
                  fontFamily: "inherit",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "var(--text-2)",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                <Download size={13} strokeWidth={2.25} />
                Exporter
              </button>
              <button
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.5rem 0.95rem",
                  fontFamily: "inherit",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "#FFFFFF",
                  background: "var(--brand)",
                  border: "1px solid var(--brand)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--brand-2)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "var(--brand)")}
              >
                <Plus size={14} strokeWidth={2.25} />
                Nouvelle action
              </button>
            </div>
          </div>

          {/* Bento grid */}
          <div
            className="bureau-bento"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(12, 1fr)",
              gridAutoRows: "min-content",
              gap: "0.85rem",
              marginBottom: "1.5rem",
            }}
          >
            <HeroCard />
            <SmallKPI kpi={smallKpis[0]} colSpan={3} />
            <SmallKPI kpi={smallKpis[1]} colSpan={3} />
            <MidKPI kpi={midKpis[0]} colSpan={4} />
            <MidKPI kpi={midKpis[1]} colSpan={4} />
            <AlertCard colSpan={4} />
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.45 }}
          style={{ marginBottom: "1.5rem" }}
        >
          <SectionHeader title="Domaines" subtitle="Six tableaux opérationnels — cliquez pour ouvrir." />
          <div
            className="bureau-tiles"
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
          transition={{ delay: 0.1, duration: 0.45 }}
        >
          <AgentsInbox onOpen={open} />
        </motion.section>

        <Footer />
      </main>

      <BureauModal open={modalKey !== null} modalKey={modalKey} onClose={close} />

      <style>{`
        @media (max-width: 1100px) {
          .bureau-tiles { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 820px) {
          .bureau-bento > .span-hero { grid-column: span 12 !important; }
          .bureau-bento > .span-3 { grid-column: span 6 !important; }
          .bureau-bento > .span-4 { grid-column: span 6 !important; }
        }
        @media (max-width: 600px) {
          .bureau-bento > .span-hero,
          .bureau-bento > .span-3,
          .bureau-bento > .span-4 { grid-column: span 12 !important; }
          .bureau-tiles { grid-template-columns: 1fr !important; }
          .bureau-nav-tabs { overflow-x: auto !important; }
        }
      `}</style>
    </div>
  );
}

function UtilityBar({ onLogout }: { onLogout: () => void }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          maxWidth: "1320px",
          margin: "0 auto",
          padding: "0.6rem clamp(1.25rem, 3vw, 2.5rem)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
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
                background: "var(--brand)",
                color: "#FFFFFF",
                borderRadius: "7px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.66rem",
                fontWeight: 800,
              }}
            >
              CMA
            </span>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
              <span
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "var(--text)",
                  letterSpacing: "-0.015em",
                }}
              >
                Cabinet Müller
              </span>
              <span style={{ fontSize: "0.66rem", color: "var(--text-3)" }}>
                Orkestra Cockpit
              </span>
            </div>
            <ChevronDown size={13} strokeWidth={2.25} color="var(--text-3)" />
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div
            className="bureau-search"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "0.35rem 0.7rem",
              minWidth: "260px",
              color: "var(--text-3)",
              fontSize: "0.82rem",
              cursor: "text",
            }}
          >
            <Search size={14} strokeWidth={2.25} />
            <span style={{ flex: 1 }}>Rechercher dans le cockpit…</span>
            <kbd
              style={{
                fontFamily: "var(--font-jbmono)",
                fontSize: "0.68rem",
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
            <Bell size={14} strokeWidth={2} />
          </IconBtn>
          <IconBtn label="Paramètres">
            <Settings size={14} strokeWidth={2} />
          </IconBtn>

          <div
            style={{
              width: 1,
              height: 22,
              background: "var(--border)",
              margin: "0 0.2rem",
            }}
          />

          <span
            style={{
              width: 30,
              height: 30,
              background: "var(--text)",
              color: "#FFFFFF",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.7rem",
              fontWeight: 700,
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
            <LogOut size={14} strokeWidth={2} />
          </button>
        </div>
      </div>
      <style>{`
        @media (max-width: 720px) {
          .bureau-search { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function NavBar() {
  return (
    <nav
      style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          maxWidth: "1320px",
          margin: "0 auto",
          padding: "0 clamp(1.25rem, 3vw, 2.5rem)",
          display: "flex",
          gap: "0.25rem",
          overflow: "auto",
        }}
        className="bureau-nav-tabs"
      >
        {navTabs.map((t) => (
          <button
            key={t.label}
            style={{
              padding: "0.7rem 0.9rem",
              background: "transparent",
              border: "none",
              fontFamily: "inherit",
              fontSize: "0.86rem",
              fontWeight: t.active ? 700 : 500,
              color: t.active ? "var(--brand)" : "var(--text-2)",
              cursor: "pointer",
              position: "relative",
              whiteSpace: "nowrap",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => {
              if (!t.active) e.currentTarget.style.color = "var(--text)";
            }}
            onMouseLeave={(e) => {
              if (!t.active) e.currentTarget.style.color = "var(--text-2)";
            }}
          >
            {t.label}
            {t.active && (
              <span
                style={{
                  position: "absolute",
                  bottom: -1,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: "var(--brand)",
                  borderRadius: "2px 2px 0 0",
                }}
              />
            )}
          </button>
        ))}
      </div>
    </nav>
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
        width: 30,
        height: 30,
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
            top: 2,
            right: 2,
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

function HeroCard() {
  return (
    <div
      className="span-hero"
      style={{
        gridColumn: "span 6",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "1.1rem 1.25rem 0.5rem",
        boxShadow:
          "0 1px 2px rgba(15,23,42,0.04), 0 4px 12px -8px rgba(15,23,42,0.06)",
        display: "flex",
        flexDirection: "column",
        gap: "0.85rem",
        minHeight: "260px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span
            style={{
              fontSize: "0.78rem",
              fontWeight: 600,
              color: "var(--text-2)",
            }}
          >
            Chiffre d&apos;affaires
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              fontSize: "0.62rem",
              fontWeight: 700,
              color: "var(--brand)",
              background: "var(--brand-tint)",
              padding: "0.15rem 0.4rem",
              borderRadius: "4px",
              letterSpacing: "0.04em",
            }}
          >
            <Circle size={5} strokeWidth={0} fill="currentColor" />
            COMBINÉ BS + ODOO
          </span>
        </div>
        <button
          aria-label="Plus"
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-4)",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <MoreHorizontal size={15} strokeWidth={2} />
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: "0.85rem" }}>
        <div
          style={{
            fontFamily: "var(--font-jbmono)",
            fontSize: "2.6rem",
            fontWeight: 600,
            letterSpacing: "-0.035em",
            color: "var(--text)",
            lineHeight: 0.95,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          92 400
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-3)" }}>
            CHF
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.2rem",
              fontSize: "0.7rem",
              fontWeight: 700,
              color: "var(--success)",
              background: "var(--success-tint)",
              padding: "0.15rem 0.4rem",
              borderRadius: "4px",
            }}
          >
            <TrendingUp size={11} strokeWidth={2.5} />
            +12.0% YoY
          </span>
        </div>
      </div>

      {/* Big area chart */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <svg
          viewBox="0 0 400 100"
          preserveAspectRatio="none"
          style={{ width: "100%", height: "100%", display: "block" }}
        >
          <defs>
            <linearGradient id="hero-grad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#1E40AF" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#1E40AF" stopOpacity="0" />
            </linearGradient>
          </defs>
          {(() => {
            const max = Math.max(...heroData);
            const min = Math.min(...heroData);
            const range = max - min || 1;
            const stepX = 400 / (heroData.length - 1);
            const pts = heroData.map((v, i) => {
              const x = i * stepX;
              const y = 95 - ((v - min) / range) * 80;
              return [x, y] as const;
            });
            const line = pts
              .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`)
              .join(" ");
            const area = `${line} L 400 100 L 0 100 Z`;
            return (
              <>
                <path d={area} fill="url(#hero-grad)" />
                <path d={line} fill="none" stroke="#1E40AF" strokeWidth="1.6" />
                {pts.map(([x, y], i) =>
                  i === pts.length - 1 ? (
                    <circle key={i} cx={x} cy={y} r="3" fill="#1E40AF" />
                  ) : null
                )}
              </>
            );
          })()}
        </svg>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "var(--font-jbmono)",
          fontSize: "0.66rem",
          color: "var(--text-4)",
          letterSpacing: "0.02em",
        }}
      >
        <span>juin</span>
        <span>juil.</span>
        <span>août</span>
        <span>sept.</span>
        <span>oct.</span>
        <span>nov.</span>
        <span>déc.</span>
        <span>janv.</span>
        <span>févr.</span>
        <span>mars</span>
        <span>avril</span>
        <span>mai</span>
      </div>
    </div>
  );
}

function SmallKPI({
  kpi,
  colSpan,
}: {
  kpi: {
    label: string;
    value: string;
    unit: string;
    trend: string;
    trendDir: "up" | "down";
    spark: number[];
    combined: boolean;
    accent: string;
  };
  colSpan: number;
}) {
  return (
    <div
      className={`span-${colSpan}`}
      style={{
        gridColumn: `span ${colSpan}`,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "0.9rem 1rem",
        boxShadow:
          "0 1px 2px rgba(15,23,42,0.04), 0 4px 12px -8px rgba(15,23,42,0.06)",
        display: "flex",
        flexDirection: "column",
        gap: "0.45rem",
        minHeight: "120px",
      }}
    >
      <div
        style={{
          fontSize: "0.74rem",
          fontWeight: 500,
          color: "var(--text-3)",
          display: "flex",
          alignItems: "center",
          gap: "0.3rem",
        }}
      >
        {kpi.label}
        {kpi.combined && (
          <span
            style={{
              fontSize: "0.55rem",
              fontWeight: 700,
              color: "var(--brand)",
              background: "var(--brand-tint)",
              padding: "0.05rem 0.3rem",
              borderRadius: "3px",
              letterSpacing: "0.04em",
            }}
          >
            ⊕
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: "0.3rem" }}>
        <span
          style={{
            fontFamily: "var(--font-jbmono)",
            fontSize: "1.7rem",
            fontWeight: 600,
            letterSpacing: "-0.025em",
            color: "var(--text)",
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {kpi.value}
        </span>
        {kpi.unit && (
          <span
            style={{
              fontSize: "0.78rem",
              fontWeight: 500,
              color: "var(--text-3)",
            }}
          >
            {kpi.unit}
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "auto" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.2rem",
            fontSize: "0.72rem",
            fontWeight: 600,
            color: kpi.trendDir === "up" ? "var(--success)" : "var(--danger)",
          }}
        >
          {kpi.trendDir === "up" ? (
            <TrendingUp size={11} strokeWidth={2.5} />
          ) : (
            <TrendingDown size={11} strokeWidth={2.5} />
          )}
          {kpi.trend}
        </span>
        <span style={{ flex: 1, marginLeft: "0.5rem" }}>
          <Sparkline
            data={kpi.spark}
            width={120}
            height={22}
            stroke={kpi.accent}
            fill="rgba(30,64,175,0.08)"
            strokeWidth={1.5}
          />
        </span>
      </div>
    </div>
  );
}

function MidKPI({
  kpi,
  colSpan,
}: {
  kpi: {
    label: string;
    value: string;
    unit: string;
    trend: string;
    trendDir: "up" | "down";
    bars: number[];
    accent: string;
  };
  colSpan: number;
}) {
  return (
    <div
      className={`span-${colSpan}`}
      style={{
        gridColumn: `span ${colSpan}`,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "0.9rem 1rem",
        boxShadow:
          "0 1px 2px rgba(15,23,42,0.04), 0 4px 12px -8px rgba(15,23,42,0.06)",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        minHeight: "120px",
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
            fontSize: "0.74rem",
            fontWeight: 500,
            color: "var(--text-3)",
          }}
        >
          {kpi.label}
        </span>
        <span
          style={{
            fontSize: "0.7rem",
            fontWeight: 600,
            color: "var(--success)",
          }}
        >
          {kpi.trend}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: "0.3rem" }}>
        <span
          style={{
            fontFamily: "var(--font-jbmono)",
            fontSize: "1.6rem",
            fontWeight: 600,
            letterSpacing: "-0.025em",
            color: "var(--text)",
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {kpi.value}
        </span>
        {kpi.unit && (
          <span
            style={{
              fontSize: "0.78rem",
              fontWeight: 500,
              color: "var(--text-3)",
            }}
          >
            {kpi.unit}
          </span>
        )}
      </div>

      <div style={{ marginTop: "auto", color: kpi.accent }}>
        <MiniBars data={kpi.bars} width={220} height={28} gap={3} fill="currentColor" />
      </div>
    </div>
  );
}

function AlertCard({ colSpan }: { colSpan: number }) {
  return (
    <div
      className={`span-${colSpan}`}
      style={{
        gridColumn: `span ${colSpan}`,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "0.95rem 1rem",
        boxShadow:
          "0 1px 2px rgba(15,23,42,0.04), 0 4px 12px -8px rgba(15,23,42,0.06)",
        display: "flex",
        flexDirection: "column",
        gap: "0.6rem",
        minHeight: "120px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: "var(--danger)",
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <span
          style={{
            width: 26,
            height: 26,
            background: "var(--danger-tint)",
            color: "var(--danger)",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AlertTriangle size={13} strokeWidth={2.25} />
        </span>
        <span
          style={{
            fontSize: "0.86rem",
            fontWeight: 600,
            color: "var(--text)",
            letterSpacing: "-0.01em",
          }}
        >
          Alertes actives
        </span>
        <span style={{ flex: 1 }} />
        <span
          style={{
            fontFamily: "var(--font-jbmono)",
            fontSize: "1.5rem",
            fontWeight: 600,
            color: "var(--danger)",
            letterSpacing: "-0.025em",
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          5
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
        <AlertItem tone="danger" label="SIN-0047 · Dubois SA — 68 jours" />
        <AlertItem tone="warn" label="2 impayés Rossi SA — 3 200 CHF" />
        <AlertItem tone="warn" label="3 relances prospection en retard" />
      </div>
    </div>
  );
}

function AlertItem({ tone, label }: { tone: "danger" | "warn"; label: string }) {
  const color = tone === "danger" ? "var(--danger)" : "var(--warn)";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        fontSize: "0.74rem",
        color: "var(--text-2)",
      }}
    >
      <Circle size={5} strokeWidth={0} fill={color} />
      <span style={{ flex: 1 }}>{label}</span>
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
        <h2
          style={{
            fontSize: "1.05rem",
            fontWeight: 700,
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
              fontSize: "0.8rem",
              color: "var(--text-3)",
              margin: 0,
              marginTop: "0.15rem",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
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
  const alertBg =
    tile.alertTone === "warn"
      ? "var(--warn-tint)"
      : tile.alertTone === "good"
      ? "var(--success-tint)"
      : tile.alertTone === "danger"
      ? "var(--danger-tint)"
      : "var(--surface-3)";

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
        gap: "0.7rem",
        boxShadow:
          "0 1px 2px rgba(15,23,42,0.04), 0 4px 12px -8px rgba(15,23,42,0.06)",
        transition: "border-color 0.18s",
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
        <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
          <span
            style={{
              width: 30,
              height: 30,
              background: tile.iconBg,
              color: tile.iconColor,
              borderRadius: "7px",
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
              color: "var(--text)",
              letterSpacing: "-0.01em",
            }}
          >
            {tile.title}
          </span>
        </div>
        <ArrowUpRight size={14} strokeWidth={2.25} color="var(--text-4)" />
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: "0.65rem" }}>
        <div
          style={{
            fontFamily: "var(--font-jbmono)",
            fontSize: "1.9rem",
            fontWeight: 600,
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
                color: "var(--text-3)",
                marginLeft: "0.1rem",
                letterSpacing: 0,
              }}
            >
              {tile.unit}
            </span>
          )}
        </div>
        {tile.spark && (
          <div
            style={{
              flex: 1,
              marginBottom: "0.2rem",
              color: tile.iconColor,
              opacity: 0.85,
            }}
          >
            <Sparkline
              data={tile.spark}
              width={120}
              height={20}
              stroke="currentColor"
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
          <Circle size={5} strokeWidth={0} fill="currentColor" />
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
          "0 1px 2px rgba(15,23,42,0.04), 0 4px 12px -8px rgba(15,23,42,0.06)",
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
              width: 30,
              height: 30,
              background: "var(--accent-tint)",
              color: "var(--accent)",
              borderRadius: "7px",
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
                fontSize: "0.94rem",
                fontWeight: 700,
                color: "var(--text)",
                letterSpacing: "-0.015em",
              }}
            >
              Agents IA · 3 actions en attente
            </div>
            <div style={{ fontSize: "0.76rem", color: "var(--text-3)", marginTop: "0.1rem" }}>
              Préparées cette nuit — toutes loguées (LPD)
            </div>
          </div>
        </div>
        <button
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
            padding: "0.4rem 0.7rem",
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "var(--text-2)",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <BarChart3 size={13} strokeWidth={2.25} />
          Voir l&apos;historique
        </button>
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
    source: string;
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
        gridTemplateColumns: "auto 1fr auto auto",
        gap: "1rem",
        alignItems: "center",
        padding: "0.85rem 1.1rem",
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
            fontSize: "0.92rem",
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
      </div>
      <span
        style={{
          fontFamily: "var(--font-jbmono)",
          fontSize: "0.68rem",
          color: "var(--text-3)",
          padding: "0.2rem 0.5rem",
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: "5px",
        }}
      >
        {agent.source}
      </span>
      <div style={{ display: "flex", gap: "0.35rem" }}>
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
            background: done === "none" ? "var(--brand)" : "transparent",
            color: done === "none" ? "#FFFFFF" : "var(--text-3)",
            border: `1px solid ${done === "none" ? "var(--brand)" : "var(--border)"}`,
            borderRadius: "7px",
            fontFamily: "inherit",
            fontSize: "0.76rem",
            fontWeight: 600,
            cursor: done === "none" ? "pointer" : "default",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => {
            if (done === "none") e.currentTarget.style.background = "var(--brand-2)";
          }}
          onMouseLeave={(e) => {
            if (done === "none") e.currentTarget.style.background = "var(--brand)";
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
            padding: "0.4rem",
            background: "var(--surface)",
            color: "var(--text-3)",
            border: "1px solid var(--border)",
            borderRadius: "7px",
            cursor: done === "none" ? "pointer" : "default",
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
      <span>© 2026 Cabinet Müller &amp; Associés SA — Zürich</span>
      <span>Sync BrokerStar il y a 3 min · Odoo il y a 5 min</span>
      <span>LPD Art.16 · Infomaniak CH</span>
    </footer>
  );
}
