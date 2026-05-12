"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search, Bell, ChevronDown, LogOut, Settings,
  TrendingUp, ArrowUpRight, ArrowRight, Check, X, Circle,
  Target, FolderArchive, Flame, Wallet, Globe, Sparkles,
  Mail, AlertCircle, FileText, Calendar,
} from "lucide-react";
import type { ModalKey } from "@/lib/types";
import ApertureModal from "@/components/d/ApertureModal";
import { Sparkline } from "@/components/shared/Sparkline";

const heroData = [62, 64, 70, 68, 72, 78, 80, 82, 86, 88, 92, 92];
const heroMonths = ["juin", "juil.", "août", "sept.", "oct.", "nov.", "déc.", "janv.", "févr.", "mars", "avril", "mai"];

// Annotation events — index into heroData (0..11)
const heroEvents: { i: number; label: string; sub: string }[] = [
  { i: 6, label: "+9 200 CHF", sub: "Commission Dubois SA · décembre" },
  { i: 9, label: "−1 800 CHF", sub: "Impayé Rossi SA détecté · mars" },
];

const satellites = [
  {
    label: "Marge nette",
    value: "68",
    unit: "%",
    trend: "+4 pt",
    spark: [55, 58, 60, 62, 63, 64, 64, 66, 67, 67, 68, 68],
    combined: true,
  },
  {
    label: "Cash-flow",
    value: "+18",
    unit: "K",
    trend: "stable",
    spark: [4, 6, 8, 7, 10, 12, 11, 14, 15, 16, 17, 18],
    combined: true,
  },
  {
    label: "Rétention",
    value: "87",
    unit: "%",
    trend: "+3 pt",
    spark: [81, 82, 83, 83, 84, 85, 85, 86, 86, 87, 87, 87],
    combined: false,
  },
];

const trois = [
  {
    Icon: Mail,
    color: "var(--info)",
    bg: "var(--info-tint)",
    sentence: "Valider 4 renouvellements préparés par l'agent BrokerStar.",
    cta: "Valider",
    modalKey: undefined as ModalKey | undefined,
  },
  {
    Icon: AlertCircle,
    color: "var(--warn)",
    bg: "var(--warn-tint)",
    sentence: "Relancer Rossi SA pour son impayé de 1 800 CHF (67 jours).",
    cta: "Ouvrir",
    modalKey: "finance" as ModalKey,
  },
  {
    Icon: FileText,
    color: "var(--accent)",
    bg: "var(--accent-tint)",
    sentence: "Signer le rapport mensuel combiné BrokerStar + Odoo.",
    cta: "Signer",
    modalKey: "rapport" as ModalKey,
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
    caption: "Taux de conversion · 12 prospects actifs",
    alert: "3 relances dues", alertTone: "warn",
    sources: ["BrokerStar"], modalKey: "prospection",
    spark: [10, 12, 11, 14, 14, 15, 16, 17, 17, 18, 18, 18],
  },
  {
    Icon: FolderArchive, iconColor: "var(--info)", iconBg: "var(--info-tint)",
    title: "Portefeuille", metric: "189", unit: "",
    caption: "Contrats actifs · 85 K CHF de primes",
    alert: "4 renouv. J-30", alertTone: "neutral",
    sources: ["BrokerStar"], modalKey: "portefeuille",
    spark: [182, 183, 184, 184, 185, 186, 186, 187, 188, 188, 189, 189],
  },
  {
    Icon: Flame, iconColor: "var(--danger)", iconBg: "var(--danger-tint)",
    title: "Sinistres", metric: "3", unit: "",
    caption: "Dossiers ouverts · ratio 12 % CA",
    alert: "SIN-0047 · 68 j", alertTone: "danger",
    sources: ["BrokerStar"], modalKey: "sinistres",
  },
  {
    Icon: Wallet, iconColor: "var(--warn)", iconBg: "var(--warn-tint)",
    title: "Finance", metric: "+18", unit: "K",
    caption: "Cash-flow net · commissions 11.2 K",
    alert: "2 impayés", alertTone: "warn",
    sources: ["BrokerStar", "Odoo"], modalKey: "finance",
  },
  {
    Icon: Globe, iconColor: "var(--accent)", iconBg: "var(--accent-tint)",
    title: "Vue d'ensemble", metric: "68", unit: "%",
    caption: "Marge consolidée · vision combinée",
    alert: "+4 pt vs marché CH", alertTone: "good",
    sources: ["BrokerStar", "Odoo"], modalKey: "vue360",
  },
  {
    Icon: Sparkles, iconColor: "var(--purple)", iconBg: "var(--purple-tint)",
    title: "Agents IA", metric: "3", unit: "",
    caption: "Actions préparées · prêtes à valider",
    alert: "Validation requise", alertTone: "neutral",
    sources: ["BrokerStar", "Odoo"], modalKey: "agents",
  },
];

const navTabs = [
  { label: "Vue d'ensemble", active: true },
  { label: "Domaines" },
  { label: "Agents" },
  { label: "Rapports" },
];

export default function DashboardPageD() {
  const router = useRouter();
  const [modalKey, setModalKey] = useState<ModalKey | null>(null);
  const [period, setPeriod] = useState<"M" | "T" | "A">("M");
  const open = (k: ModalKey) => setModalKey(k);
  const close = () => setModalKey(null);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <TopBar onLogout={() => router.push("/")} />

      <main
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          padding: "clamp(1.75rem, 3vw, 2.5rem) clamp(1.25rem, 3vw, 2.5rem) 3rem",
        }}
      >
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: "1rem",
              flexWrap: "wrap",
              marginBottom: "1.25rem",
            }}
          >
            <div>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: "var(--text-3)",
                  marginBottom: "0.3rem",
                }}
              >
                <Calendar size={11} strokeWidth={2.25} />
                Mardi 12 mai 2026 · semaine 19
              </span>
              <h1
                style={{
                  fontSize: "clamp(1.6rem, 3vw, 1.95rem)",
                  fontWeight: 700,
                  letterSpacing: "-0.025em",
                  color: "var(--text)",
                  margin: 0,
                }}
              >
                Bonjour Thomas
              </h1>
            </div>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  fontSize: "0.74rem",
                  fontWeight: 500,
                  color: "var(--text-2)",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  padding: "0.3rem 0.55rem",
                  borderRadius: "100px",
                }}
              >
                <Circle size={5} strokeWidth={0} fill="var(--info)" />
                BrokerStar · 3 min
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  fontSize: "0.74rem",
                  fontWeight: 500,
                  color: "var(--text-2)",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  padding: "0.3rem 0.55rem",
                  borderRadius: "100px",
                }}
              >
                <Circle size={5} strokeWidth={0} fill="var(--purple)" />
                Odoo · 5 min
              </span>
            </div>
          </div>

          <div
            className="aperture-hero"
            style={{
              display: "grid",
              gridTemplateColumns: "1.55fr 1fr",
              gap: "0.85rem",
            }}
          >
            <HeroPanel period={period} onPeriodChange={setPeriod} />

            <div
              style={{
                display: "grid",
                gridTemplateRows: "repeat(3, 1fr)",
                gap: "0.85rem",
              }}
            >
              {satellites.map((s) => (
                <SatelliteKPI key={s.label} kpi={s} />
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.5 }}
          style={{ marginTop: "clamp(1.5rem, 3vw, 2.25rem)" }}
        >
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "14px",
              padding: "1.2rem 1.4rem",
              boxShadow:
                "0 1px 2px rgba(15,23,42,0.04), 0 4px 12px -8px rgba(15,23,42,0.06)",
            }}
          >
            <div
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--accent)",
                marginBottom: "0.4rem",
              }}
            >
              Trois choses aujourd&apos;hui
            </div>
            <h2
              style={{
                fontSize: "1.05rem",
                fontWeight: 600,
                color: "var(--text)",
                margin: 0,
                marginBottom: "1rem",
                letterSpacing: "-0.015em",
              }}
            >
              Vos priorités du matin, mises au premier plan.
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
              {trois.map((t, i) => (
                <TroisRow
                  key={i}
                  item={t}
                  onOpen={t.modalKey ? () => open(t.modalKey!) : undefined}
                />
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.5 }}
          style={{ marginTop: "clamp(1.5rem, 3vw, 2.25rem)" }}
        >
          <SectionHeader title="Domaines" subtitle="Six tableaux opérationnels — cliquez pour ouvrir." />
          <div
            className="aperture-tiles"
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

        <Footer />
      </main>

      <ApertureModal open={modalKey !== null} modalKey={modalKey} onClose={close} />

      <style>{`
        @media (max-width: 1024px) {
          .aperture-hero { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 800px) {
          .aperture-tiles { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .aperture-tiles { grid-template-columns: 1fr !important; }
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
        zIndex: 20,
      }}
    >
      <div
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          padding: "0.7rem clamp(1.25rem, 3vw, 2.5rem)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
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
                width: 26,
                height: 26,
                background: "var(--accent)",
                color: "#FFFFFF",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.62rem",
                fontWeight: 800,
              }}
            >
              CMA
            </span>
            <span
              style={{
                fontSize: "0.88rem",
                fontWeight: 700,
                color: "var(--text)",
                letterSpacing: "-0.015em",
              }}
            >
              Cabinet Müller
            </span>
            <ChevronDown size={13} strokeWidth={2.25} color="var(--text-3)" />
          </button>
          <nav className="aperture-nav" style={{ display: "flex", gap: "0.15rem" }}>
            {navTabs.map((t) => (
              <button
                key={t.label}
                style={{
                  background: t.active ? "var(--surface-2)" : "transparent",
                  border: "none",
                  padding: "0.4rem 0.7rem",
                  fontFamily: "inherit",
                  fontSize: "0.84rem",
                  fontWeight: t.active ? 600 : 500,
                  color: t.active ? "var(--text)" : "var(--text-3)",
                  cursor: "pointer",
                  borderRadius: "7px",
                }}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            className="aperture-search"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "0.35rem 0.7rem",
              color: "var(--text-3)",
              fontSize: "0.8rem",
              cursor: "text",
              minWidth: "200px",
            }}
          >
            <Search size={13} strokeWidth={2} />
            <span style={{ flex: 1 }}>Rechercher…</span>
            <kbd
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.66rem",
                padding: "0.05rem 0.3rem",
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
              fontSize: "0.66rem",
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
              width: 30,
              height: 30,
              background: "transparent",
              border: "1px solid transparent",
              borderRadius: "7px",
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
            <LogOut size={13} strokeWidth={2} />
          </button>
        </div>
      </div>
      <style>{`
        @media (max-width: 820px) {
          .aperture-nav { display: none !important; }
          .aperture-search { display: none !important; }
        }
      `}</style>
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
        width: 30,
        height: 30,
        background: "transparent",
        border: "1px solid transparent",
        borderRadius: "7px",
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
            minWidth: 13,
            height: 13,
            padding: "0 3px",
            borderRadius: "7px",
            background: "var(--danger)",
            color: "#FFFFFF",
            fontSize: "0.56rem",
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

function HeroPanel({
  period,
  onPeriodChange,
}: {
  period: "M" | "T" | "A";
  onPeriodChange: (p: "M" | "T" | "A") => void;
}) {
  const [hoveredEvent, setHoveredEvent] = useState<number | null>(null);

  const w = 600;
  const h = 200;
  const padX = 28;
  const padY = 24;
  const stepX = (w - padX * 2) / (heroData.length - 1);
  const max = Math.max(...heroData);
  const min = Math.min(...heroData);
  const range = max - min || 1;
  const pts = heroData.map((v, i) => {
    const x = padX + i * stepX;
    const y = padY + (1 - (v - min) / range) * (h - padY * 2);
    return [x, y] as const;
  });
  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${line} L ${pts[pts.length - 1][0].toFixed(1)} ${h - padY / 2} L ${pts[0][0].toFixed(1)} ${h - padY / 2} Z`;

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "14px",
        padding: "1.1rem 1.25rem 0.85rem",
        boxShadow:
          "0 1px 2px rgba(15,23,42,0.04), 0 4px 14px -8px rgba(15,23,42,0.08)",
        display: "flex",
        flexDirection: "column",
        gap: "0.85rem",
        minHeight: "340px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "0.78rem",
              fontWeight: 500,
              color: "var(--text-3)",
              marginBottom: "0.15rem",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            Chiffre d&apos;affaires
            <span
              style={{
                fontSize: "0.58rem",
                fontWeight: 700,
                color: "var(--accent)",
                background: "var(--accent-tint)",
                padding: "0.1rem 0.35rem",
                borderRadius: "4px",
                letterSpacing: "0.06em",
              }}
            >
              ⊕ COMBINÉ
            </span>
          </div>
        </div>
        <PeriodToggle value={period} onChange={onPeriodChange} />
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: "0.85rem" }}>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "2.7rem",
            fontWeight: 600,
            letterSpacing: "-0.035em",
            color: "var(--text)",
            lineHeight: 0.95,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          92 400
        </span>
        <span style={{ fontSize: "0.84rem", fontWeight: 500, color: "var(--text-3)" }}>
          CHF
        </span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.25rem",
            fontSize: "0.72rem",
            fontWeight: 700,
            color: "var(--success)",
            background: "var(--success-tint)",
            padding: "0.18rem 0.5rem",
            borderRadius: "5px",
            marginLeft: "0.25rem",
          }}
        >
          <TrendingUp size={11} strokeWidth={2.5} />
          +12.0% YoY
        </span>
      </div>

      {/* Chart */}
      <div style={{ position: "relative", flex: 1, minHeight: 180 }}>
        <svg
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="none"
          style={{ width: "100%", height: "100%", display: "block" }}
        >
          <defs>
            <linearGradient id="aperture-grad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#1E40AF" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#1E40AF" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Gridlines */}
          {[0.25, 0.5, 0.75].map((p) => (
            <line
              key={p}
              x1={padX}
              x2={w - padX}
              y1={padY + p * (h - padY * 2)}
              y2={padY + p * (h - padY * 2)}
              stroke="#E2E8F0"
              strokeWidth="1"
              strokeDasharray="2 4"
            />
          ))}
          <path d={area} fill="url(#aperture-grad)" />
          <path d={line} fill="none" stroke="#1E40AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {pts.map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="2.5"
              fill="#FFFFFF"
              stroke="#1E40AF"
              strokeWidth="1.5"
              opacity={i === pts.length - 1 ? 1 : 0}
            />
          ))}
          {heroEvents.map((ev) => {
            const [x, y] = pts[ev.i];
            const isHovered = hoveredEvent === ev.i;
            return (
              <g key={ev.i}>
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 7 : 5}
                  fill="#FFFFFF"
                  stroke="#1E40AF"
                  strokeWidth="2"
                  style={{ cursor: "pointer", transition: "r 0.18s" }}
                  onMouseEnter={() => setHoveredEvent(ev.i)}
                  onMouseLeave={() => setHoveredEvent(null)}
                />
                <circle
                  cx={x}
                  cy={y}
                  r="2"
                  fill="#1E40AF"
                  style={{ pointerEvents: "none" }}
                />
              </g>
            );
          })}
        </svg>

        {/* Annotation tooltip */}
        {hoveredEvent !== null && (() => {
          const ev = heroEvents.find((e) => e.i === hoveredEvent)!;
          const [x, y] = pts[ev.i];
          const xPct = (x / w) * 100;
          const yPct = (y / h) * 100;
          return (
            <div
              style={{
                position: "absolute",
                left: `${xPct}%`,
                top: `${yPct}%`,
                transform: "translate(-50%, calc(-100% - 14px))",
                background: "var(--text)",
                color: "var(--surface)",
                padding: "0.55rem 0.75rem",
                borderRadius: "8px",
                fontSize: "0.74rem",
                fontWeight: 500,
                whiteSpace: "nowrap",
                pointerEvents: "none",
                boxShadow: "0 8px 20px -6px rgba(15,23,42,0.32)",
                zIndex: 5,
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: "0.1rem" }}>{ev.label}</div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.7rem" }}>{ev.sub}</div>
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  left: "50%",
                  bottom: -4,
                  transform: "translateX(-50%) rotate(45deg)",
                  width: 8,
                  height: 8,
                  background: "var(--text)",
                }}
              />
            </div>
          );
        })()}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "var(--font-mono)",
          fontSize: "0.66rem",
          color: "var(--text-4)",
          padding: "0 0.4rem",
        }}
      >
        {heroMonths.map((m, i) => (
          <span key={m} style={{ opacity: i % 2 === 0 ? 1 : 0.55 }}>
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}

function PeriodToggle({
  value,
  onChange,
}: {
  value: "M" | "T" | "A";
  onChange: (v: "M" | "T" | "A") => void;
}) {
  const options: { v: "M" | "T" | "A"; label: string }[] = [
    { v: "M", label: "Mois" },
    { v: "T", label: "Trim." },
    { v: "A", label: "Année" },
  ];
  return (
    <div
      style={{
        display: "flex",
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        padding: "2px",
        gap: "1px",
      }}
    >
      {options.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          style={{
            background: value === o.v ? "var(--surface)" : "transparent",
            color: value === o.v ? "var(--text)" : "var(--text-3)",
            border: "none",
            borderRadius: "6px",
            padding: "0.3rem 0.7rem",
            fontFamily: "inherit",
            fontSize: "0.72rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "background 0.18s, color 0.18s",
            boxShadow: value === o.v ? "0 1px 2px rgba(15,23,42,0.06)" : "none",
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function SatelliteKPI({
  kpi,
}: {
  kpi: typeof satellites[number];
}) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "0.85rem 1rem",
        boxShadow:
          "0 1px 2px rgba(15,23,42,0.04), 0 2px 8px -4px rgba(15,23,42,0.05)",
        display: "flex",
        flexDirection: "column",
        gap: "0.4rem",
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
              color: "var(--accent)",
              background: "var(--accent-tint)",
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
            fontFamily: "var(--font-mono)",
            fontSize: "1.5rem",
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
              color: "var(--text-3)",
            }}
          >
            {kpi.unit}
          </span>
        )}
        <span style={{ flex: 1 }} />
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.2rem",
            fontSize: "0.7rem",
            fontWeight: 600,
            color: "var(--success)",
          }}
        >
          <TrendingUp size={10} strokeWidth={2.5} />
          {kpi.trend}
        </span>
      </div>

      <div style={{ marginTop: "auto" }}>
        <Sparkline
          data={kpi.spark}
          width={180}
          height={18}
          stroke="var(--accent)"
          strokeWidth={1.4}
        />
      </div>
    </div>
  );
}

function TroisRow({
  item,
  onOpen,
}: {
  item: typeof trois[number];
  onOpen?: () => void;
}) {
  const [done, setDone] = useState(false);
  const { Icon } = item;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        gap: "0.85rem",
        alignItems: "center",
        padding: "0.75rem 0.5rem",
        borderRadius: "8px",
        opacity: done ? 0.4 : 1,
        transition: "opacity 0.25s, background 0.15s",
      }}
    >
      <span
        style={{
          width: 28,
          height: 28,
          background: item.bg,
          color: item.color,
          borderRadius: "7px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={14} strokeWidth={2.25} />
      </span>
      <span
        style={{
          fontSize: "0.9rem",
          color: "var(--text)",
          lineHeight: 1.5,
          fontWeight: 500,
          letterSpacing: "-0.005em",
        }}
      >
        {item.sentence}
      </span>
      <div style={{ display: "flex", gap: "0.35rem" }}>
        <button
          onClick={() => {
            setDone(true);
            onOpen?.();
          }}
          disabled={done}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
            padding: "0.45rem 0.85rem",
            background: done ? "transparent" : "var(--accent)",
            color: done ? "var(--text-3)" : "#FFFFFF",
            border: `1px solid ${done ? "var(--border)" : "var(--accent)"}`,
            borderRadius: "8px",
            fontFamily: "inherit",
            fontSize: "0.78rem",
            fontWeight: 600,
            cursor: done ? "default" : "pointer",
            transition: "background 0.15s",
            boxShadow: done ? "none" : "0 1px 2px rgba(30,64,175,0.18)",
          }}
          onMouseEnter={(e) => {
            if (!done) e.currentTarget.style.background = "var(--accent-2)";
          }}
          onMouseLeave={(e) => {
            if (!done) e.currentTarget.style.background = "var(--accent)";
          }}
        >
          {done && <Check size={11} strokeWidth={2.5} />}
          {done ? "Fait" : item.cta}
          {!done && <ArrowRight size={11} strokeWidth={2.5} />}
        </button>
      </div>
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
    <div style={{ marginBottom: "0.85rem" }}>
      <h2
        style={{
          fontSize: "1.1rem",
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
        boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 2px 8px -4px rgba(15,23,42,0.04)",
        transition: "border-color 0.18s, box-shadow 0.18s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--border-strong)";
        e.currentTarget.style.boxShadow =
          "0 1px 2px rgba(15,23,42,0.04), 0 8px 20px -10px rgba(15,23,42,0.12)";
        const icon = e.currentTarget.querySelector("[data-tile-icon]") as HTMLElement | null;
        if (icon) icon.style.transform = "rotate(3deg) scale(1.05)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.boxShadow =
          "0 1px 2px rgba(15,23,42,0.04), 0 2px 8px -4px rgba(15,23,42,0.04)";
        const icon = e.currentTarget.querySelector("[data-tile-icon]") as HTMLElement | null;
        if (icon) icon.style.transform = "rotate(0) scale(1)";
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
            data-tile-icon
            style={{
              width: 30,
              height: 30,
              background: tile.iconBg,
              color: tile.iconColor,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "transform 0.22s ease",
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
        <ArrowUpRight size={13} strokeWidth={2.25} color="var(--text-4)" />
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: "0.65rem" }}>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "1.8rem",
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
        </span>
        {tile.spark && (
          <div
            style={{ flex: 1, marginBottom: "0.2rem", color: tile.iconColor, opacity: 0.85 }}
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
          paddingTop: "0.55rem",
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
          }}
        >
          <Circle size={5} strokeWidth={0} fill="currentColor" />
          {tile.alert}
        </span>
        <span style={{ flex: 1 }} />
        <span
          style={{
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
      <span>© 2026 Cabinet Müller &amp; Associés SA · Zürich</span>
      <span>Sync BrokerStar 3 min · Odoo 5 min</span>
      <span>LPD Art.16 · Infomaniak CH</span>
    </footer>
  );
}
