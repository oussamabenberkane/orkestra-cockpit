"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowRight, Check, X, Circle,
  Target, FolderArchive, Flame, Wallet, Globe, Sparkles,
  Mail, AlertCircle, FileText, Calendar, CheckCircle2,
  Percent, Users,
  type LucideIcon,
} from "lucide-react";
import type { ModalKey } from "@/lib/types";
import ApertureModal from "@/components/b/ApertureModal";
import { BrandCluster } from "@/components/b/BrandCluster";
import { QuietRail } from "@/components/b/QuietRail";
import { FloatingDock } from "@/components/b/FloatingDock";
import { Sparkline } from "@/components/shared/Sparkline";
import { CommandPalette } from "@/components/shared/CommandPalette";

const heroData = [62, 64, 70, 68, 72, 78, 80, 82, 86, 88, 92, 92];
const heroMonths = ["juin", "juil.", "août", "sept.", "oct.", "nov.", "déc.", "janv.", "févr.", "mars", "avril", "mai"];

const heroEvents: { i: number; label: string; sub: string }[] = [
  { i: 6, label: "+9 200 CHF", sub: "Commission Dubois SA · décembre" },
  { i: 9, label: "−1 800 CHF", sub: "Impayé Rossi SA détecté · mars" },
];

type Satellite = {
  label: string;
  value: string;
  unit: string;
  trend: string;
  spark: number[];
  combined: boolean;
  breakdown: { src: string; val: string }[];
  Icon: LucideIcon;
  target: string;
  sparkTarget: number;
  modalKey: ModalKey;
};

const satellites: Satellite[] = [
  {
    label: "Marge nette",
    value: "68",
    unit: "%",
    trend: "+4 pt",
    spark: [55, 58, 60, 62, 63, 64, 64, 66, 67, 67, 68, 68],
    combined: true,
    breakdown: [
      { src: "Primes BS", val: "85.0 K" },
      { src: "Charges Odoo", val: "27.2 K" },
      { src: "⊕ Marge", val: "68 %" },
    ],
    Icon: Percent,
    target: "Obj. 70 %",
    sparkTarget: 70,
    modalKey: "finance",
  },
  {
    label: "Cash-flow",
    value: "+18",
    unit: "K",
    trend: "stable",
    spark: [4, 6, 8, 7, 10, 12, 11, 14, 15, 16, 17, 18],
    combined: true,
    breakdown: [
      { src: "Encaissé", val: "+45.6 K" },
      { src: "Sortant", val: "−27.2 K" },
      { src: "⊕ Net", val: "+18.4 K" },
    ],
    Icon: Wallet,
    target: "Obj. +20 K",
    sparkTarget: 20,
    modalKey: "finance",
  },
  {
    label: "Rétention",
    value: "87",
    unit: "%",
    trend: "+3 pt",
    spark: [81, 82, 83, 83, 84, 85, 85, 86, 86, 87, 87, 87],
    combined: false,
    breakdown: [
      { src: "Renouvelés", val: "12" },
      { src: "Pertes 12m", val: "−4" },
      { src: "Solde", val: "+8" },
    ],
    Icon: Users,
    target: "Obj. 90 %",
    sparkTarget: 90,
    modalKey: "portefeuille",
  },
];

function trendDirection(trend: string): "up" | "down" | "flat" {
  const t = trend.trim();
  if (t.startsWith("+")) return "up";
  if (t.startsWith("-") || t.startsWith("−")) return "down";
  return "flat";
}

const trendIconByDir: Record<"up" | "down" | "flat", LucideIcon> = {
  up: TrendingUp,
  down: TrendingDown,
  flat: Minus,
};
const trendColorByDir: Record<"up" | "down" | "flat", string> = {
  up: "var(--success)",
  down: "var(--danger)",
  flat: "var(--text-3)",
};

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

export default function DashboardPageB() {
  const router = useRouter();
  const [modalKey, setModalKey] = useState<ModalKey | null>(null);
  const [period, setPeriod] = useState<"M" | "T" | "A">("M");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const open = (k: ModalKey) => setModalKey(k);
  const close = () => setModalKey(null);
  const onLogout = () => router.push("/");

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <TopBar onOpenPalette={() => setPaletteOpen(true)} />

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
              <SourceBadge dot="var(--info)" label="BrokerStar · 3 min" />
              <SourceBadge dot="var(--purple)" label="Odoo · 5 min" />
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
                <SatelliteKPI key={s.label} kpi={s} onOpen={open} />
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
          <TroisChoses onOpen={open} />
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

      <FloatingDock onLogout={onLogout} />

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onOpenModal={open}
        onLogout={onLogout}
      />

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

function TopBar({
  onOpenPalette,
}: {
  onOpenPalette: () => void;
}) {
  return (
    <header
      style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 30,
        height: 56,
      }}
    >
      <div
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          padding: "0 clamp(1.25rem, 3vw, 2.5rem)",
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          alignItems: "center",
          gap: "2rem",
          height: "100%",
        }}
      >
        <BrandCluster />

        <QuietRail />

        <button
          onClick={onOpenPalette}
          className="aperture-search"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "0.42rem 0.8rem",
            color: "var(--text-3)",
            fontSize: "0.82rem",
            cursor: "pointer",
            width: "300px",
            fontFamily: "inherit",
            flexShrink: 0,
            transition: "background 0.18s, border-color 0.18s, color 0.18s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--surface)";
            e.currentTarget.style.borderColor = "var(--border-strong)";
            e.currentTarget.style.color = "var(--text-2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--surface-2)";
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.color = "var(--text-3)";
          }}
        >
          <Search size={13} strokeWidth={2} />
          <span style={{ flex: 1, textAlign: "left" }}>Rechercher…</span>
        </button>
      </div>
    </header>
  );
}

function SourceBadge({ dot, label }: { dot: string; label: string }) {
  return (
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
      <Circle size={5} strokeWidth={0} fill={dot} />
      {label}
    </span>
  );
}

function monotoneCubicPath(pts: ReadonlyArray<readonly [number, number]>): string {
  const n = pts.length;
  if (n === 0) return "";
  if (n === 1) return `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  if (n === 2)
    return `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)} L ${pts[1][0].toFixed(2)} ${pts[1][1].toFixed(2)}`;

  // Fritsch-Carlson monotone cubic interpolation
  const dx: number[] = [];
  const dy: number[] = [];
  const slope: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    const dxi = pts[i + 1][0] - pts[i][0];
    const dyi = pts[i + 1][1] - pts[i][1];
    dx.push(dxi);
    dy.push(dyi);
    slope.push(dyi / dxi);
  }
  const m: number[] = new Array(n);
  m[0] = slope[0];
  m[n - 1] = slope[n - 2];
  for (let i = 1; i < n - 1; i++) {
    m[i] = slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2;
  }
  for (let i = 0; i < n - 1; i++) {
    if (slope[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
    } else {
      const a = m[i] / slope[i];
      const b = m[i + 1] / slope[i];
      const h = Math.hypot(a, b);
      if (h > 3) {
        const t = 3 / h;
        m[i] = t * a * slope[i];
        m[i + 1] = t * b * slope[i];
      }
    }
  }
  let d = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < n - 1; i++) {
    const c1x = pts[i][0] + dx[i] / 3;
    const c1y = pts[i][1] + (m[i] * dx[i]) / 3;
    const c2x = pts[i + 1][0] - dx[i] / 3;
    const c2y = pts[i + 1][1] - (m[i + 1] * dx[i]) / 3;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${pts[i + 1][0].toFixed(2)} ${pts[i + 1][1].toFixed(2)}`;
  }
  return d;
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
  const line = monotoneCubicPath(pts);
  const baselineY = h - padY / 2;
  const area = `${line} L ${pts[pts.length - 1][0].toFixed(2)} ${baselineY} L ${pts[0][0].toFixed(2)} ${baselineY} Z`;

  const [nowX, nowY] = pts[pts.length - 1];

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
        <div
          style={{
            fontSize: "0.78rem",
            fontWeight: 500,
            color: "var(--text-3)",
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

      <div style={{ position: "relative", flex: 1, minHeight: 180 }}>
        <svg
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="none"
          style={{ width: "100%", height: "100%", display: "block" }}
        >
          <defs>
            <linearGradient id="aperture-grad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#1E40AF" stopOpacity="0.26" />
              <stop offset="38%" stopColor="#1E40AF" stopOpacity="0.12" />
              <stop offset="75%" stopColor="#1E40AF" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#1E40AF" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((p) => (
            <line
              key={p}
              x1={padX}
              x2={w - padX}
              y1={padY + p * (h - padY * 2)}
              y2={padY + p * (h - padY * 2)}
              stroke="#E2E8F0"
              strokeWidth="1"
              strokeDasharray="1 5"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              opacity="0.9"
            />
          ))}
          <path d={area} fill="url(#aperture-grad)" />
          {/* Now indicator (vertical dashed line) */}
          <line
            x1={nowX}
            x2={nowX}
            y1={padY}
            y2={baselineY}
            stroke="#1E40AF"
            strokeWidth="1"
            strokeDasharray="2 5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            opacity="0.32"
          />
          <motion.path
            d={line}
            fill="none"
            stroke="#1E40AF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>

        {/* Markers — rendered as HTML overlays so they stay perfectly circular
            regardless of SVG preserveAspectRatio="none" stretching. */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {heroEvents.map((ev) => {
            const [x, y] = pts[ev.i];
            const isHovered = hoveredEvent === ev.i;
            return (
              <div
                key={ev.i}
                style={{
                  position: "absolute",
                  left: `${(x / w) * 100}%`,
                  top: `${(y / h) * 100}%`,
                  transform: "translate(-50%, -50%)",
                  pointerEvents: "auto",
                }}
              >
                <button
                  type="button"
                  onMouseEnter={() => setHoveredEvent(ev.i)}
                  onMouseLeave={() => setHoveredEvent(null)}
                  onFocus={() => setHoveredEvent(ev.i)}
                  onBlur={() => setHoveredEvent(null)}
                  aria-label={ev.label}
                  style={{
                    position: "relative",
                    display: "block",
                    width: 12,
                    height: 12,
                    padding: 0,
                    borderRadius: "50%",
                    background: "#FFFFFF",
                    border: "1.75px solid #1E40AF",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition:
                      "transform 0.18s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.18s ease",
                    transform: isHovered ? "scale(1.18)" : "scale(1)",
                    boxShadow: isHovered
                      ? "0 0 0 5px rgba(30, 64, 175, 0.12), 0 2px 6px rgba(30, 64, 175, 0.18)"
                      : "0 1px 2px rgba(15, 23, 42, 0.08)",
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      inset: "32%",
                      borderRadius: "50%",
                      background: "#1E40AF",
                    }}
                  />
                </button>
              </div>
            );
          })}

          {/* "Now" marker on the latest point */}
          <div
            style={{
              position: "absolute",
              left: `${(nowX / w) * 100}%`,
              top: `${(nowY / h) * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#FFFFFF",
                border: "1.75px solid #1E40AF",
                boxShadow:
                  "0 0 0 4px rgba(30, 64, 175, 0.08), 0 1px 2px rgba(15, 23, 42, 0.08)",
              }}
            />
          </div>
        </div>

        {/* "Aujourd'hui" label anchored above the dashed line */}
        <div
          style={{
            position: "absolute",
            left: `${(nowX / w) * 100}%`,
            top: `${(padY / h) * 100}%`,
            transform: "translate(-50%, calc(-100% - 0.35rem))",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              fontFamily: "var(--font-mono)",
              fontSize: "0.58rem",
              fontWeight: 600,
              color: "var(--accent)",
              background: "var(--accent-tint)",
              padding: "0.15rem 0.45rem",
              borderRadius: "100px",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              border: "1px solid rgba(30, 64, 175, 0.12)",
            }}
          >
            <span
              aria-hidden
              style={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: "var(--accent)",
              }}
            />
            Aujourd&apos;hui
          </span>
        </div>

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
  const idx = options.findIndex((o) => o.v === value);
  return (
    <div
      style={{
        display: "flex",
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        padding: "2px",
        gap: 0,
        position: "relative",
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: 2,
          bottom: 2,
          left: `calc(2px + ${idx} * (100% - 4px) / 3)`,
          width: "calc((100% - 4px) / 3)",
          background: "var(--surface)",
          borderRadius: "6px",
          boxShadow: "0 1px 2px rgba(15,23,42,0.08)",
          transition: "left 0.22s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />
      {options.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          style={{
            position: "relative",
            zIndex: 1,
            background: "transparent",
            color: value === o.v ? "var(--text)" : "var(--text-3)",
            border: "none",
            borderRadius: "6px",
            padding: "0.3rem 0.7rem",
            fontFamily: "inherit",
            fontSize: "0.72rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "color 0.18s",
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function SatelliteSparkline({
  data,
  target,
  width = 280,
  height = 44,
  idSeed,
}: {
  data: number[];
  target?: number;
  width?: number;
  height?: number;
  idSeed: string;
}) {
  if (data.length === 0) return null;

  const lo = Math.min(...data, target ?? Infinity);
  const hi = Math.max(...data, target ?? -Infinity);
  const range = hi - lo || 1;
  const stepX = width / Math.max(1, data.length - 1);
  const y = (v: number) => height - ((v - lo) / range) * height;

  const pts = data.map((v, i) => [i * stepX, y(v)] as const);
  const linePath = pts
    .map(([x, py], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${py.toFixed(2)}`)
    .join(" ");
  const areaPath = `${linePath} L ${width.toFixed(2)} ${height} L 0 ${height} Z`;
  const last = pts[pts.length - 1];
  const targetY = target !== undefined ? y(target) : null;
  const gradId = `sat-grad-${idSeed}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      style={{ display: "block", width: "100%", height: `${height}px`, overflow: "visible" }}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} stroke="none" />
      {targetY !== null && (
        <line
          x1={0}
          x2={width}
          y1={targetY}
          y2={targetY}
          stroke="var(--accent)"
          strokeOpacity="0.35"
          strokeWidth="1"
          strokeDasharray="3 3"
          vectorEffect="non-scaling-stroke"
        />
      )}
      <path
        d={linePath}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx={last[0]}
        cy={last[1]}
        r="3"
        fill="var(--accent)"
        stroke="var(--surface)"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function SatelliteKPI({
  kpi,
  onOpen,
}: {
  kpi: Satellite;
  onOpen: (k: ModalKey) => void;
}) {
  const dir = trendDirection(kpi.trend);
  const TrendIcon = trendIconByDir[dir];
  const trendColor = trendColorByDir[dir];
  const MetricIcon = kpi.Icon;

  return (
    <button
      type="button"
      onClick={() => onOpen(kpi.modalKey)}
      className="aperture-sat"
      aria-label={`${kpi.label} — ouvrir le détail`}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "0.9rem 1rem",
        boxShadow:
          "0 1px 2px rgba(15,23,42,0.04), 0 2px 8px -4px rgba(15,23,42,0.05)",
        display: "flex",
        flexDirection: "column",
        gap: "0.35rem",
        position: "relative",
        overflow: "hidden",
        transition: "border-color 0.2s, box-shadow 0.2s",
        cursor: "pointer",
        textAlign: "left",
        fontFamily: "inherit",
        color: "inherit",
        width: "100%",
      }}
    >
      <span
        className="aperture-sat-arrow"
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "0.7rem",
          right: "0.8rem",
          display: "inline-flex",
          color: "var(--text-4)",
          transition: "color 0.2s ease, transform 0.2s ease",
        }}
      >
        <ArrowUpRight size={14} strokeWidth={2.25} />
      </span>

      <div
        style={{
          fontSize: "0.74rem",
          fontWeight: 500,
          color: "var(--text-3)",
          display: "flex",
          alignItems: "center",
          gap: "0.35rem",
          paddingRight: "1.4rem",
        }}
      >
        <MetricIcon size={13} strokeWidth={2.25} color="var(--text-3)" />
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
          <span style={{ fontSize: "0.78rem", color: "var(--text-3)" }}>
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
            color: trendColor,
          }}
        >
          <TrendIcon size={10} strokeWidth={2.5} />
          {kpi.trend}
        </span>
      </div>

      <div
        style={{
          fontSize: "0.66rem",
          color: "var(--text-3)",
          letterSpacing: "0.005em",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {kpi.target}
      </div>

      <div
        style={{
          marginTop: "auto",
          position: "relative",
          height: 52,
        }}
      >
        <div
          className="aperture-sat-spark"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            transition: "opacity 0.2s ease",
          }}
        >
          <SatelliteSparkline
            data={kpi.spark}
            target={kpi.sparkTarget}
            idSeed={kpi.label.replace(/\s+/g, "-")}
          />
        </div>
        <div
          className="aperture-sat-break"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            transition: "opacity 0.2s ease",
          }}
          aria-hidden="true"
        >
          {kpi.breakdown.map((b, idx) => (
            <div
              key={b.src}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "0.68rem",
                color: "var(--text-3)",
                padding: "0.14rem 0",
                borderTop: idx === 0 ? "none" : "1px solid var(--border)",
              }}
            >
              <span>{b.src}</span>
              <span
                style={{
                  color: "var(--text-2)",
                  fontVariantNumeric: "tabular-nums",
                  fontFamily: "var(--font-mono)",
                  fontWeight: 600,
                }}
              >
                {b.val}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .aperture-sat:hover,
        .aperture-sat:focus-within {
          border-color: var(--border-strong);
          box-shadow: 0 1px 2px rgba(15,23,42,0.04), 0 8px 24px -10px rgba(15,23,42,0.10);
        }
        .aperture-sat:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
        }
        .aperture-sat:hover .aperture-sat-arrow,
        .aperture-sat:focus-within .aperture-sat-arrow {
          color: var(--accent);
          transform: translate(2px, -2px);
        }
        .aperture-sat-break { opacity: 0; }
        .aperture-sat:hover .aperture-sat-spark,
        .aperture-sat:focus-within .aperture-sat-spark { opacity: 0; }
        .aperture-sat:hover .aperture-sat-break,
        .aperture-sat:focus-within .aperture-sat-break { opacity: 1; }
      `}</style>
    </button>
  );
}

function TroisChoses({ onOpen }: { onOpen: (k: ModalKey) => void }) {
  const [done, setDone] = useState<boolean[]>([false, false, false]);
  const allDone = done.every(Boolean);

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "14px",
        padding: "1.2rem 1.4rem",
        boxShadow:
          "0 1px 2px rgba(15,23,42,0.04), 0 4px 12px -8px rgba(15,23,42,0.06)",
        position: "relative",
        overflow: "hidden",
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
          display: "flex",
          alignItems: "center",
          gap: "0.45rem",
        }}
      >
        Trois choses aujourd&apos;hui
        {!allDone && (
          <span
            style={{
              fontSize: "0.62rem",
              fontWeight: 700,
              color: "var(--text-3)",
              background: "var(--surface-2)",
              padding: "0.1rem 0.4rem",
              borderRadius: "100px",
              letterSpacing: "0.04em",
            }}
          >
            {done.filter(Boolean).length}/{trois.length}
          </span>
        )}
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

      <AnimatePresence mode="wait">
        {allDone ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.96, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "2rem 1rem",
              textAlign: "center",
              gap: "0.45rem",
            }}
          >
            <span
              style={{
                width: 48,
                height: 48,
                background: "var(--success-tint)",
                color: "var(--success)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "0.35rem",
              }}
            >
              <CheckCircle2 size={22} strokeWidth={2} />
            </span>
            <div
              style={{
                fontSize: "1.05rem",
                fontWeight: 600,
                color: "var(--text)",
                letterSpacing: "-0.015em",
              }}
            >
              Tout est fait.
            </div>
            <div
              style={{
                fontSize: "0.86rem",
                color: "var(--text-3)",
                maxWidth: "36ch",
                lineHeight: 1.5,
              }}
            >
              Bonne journée, Thomas. Vos agents IA continuent de surveiller en arrière-plan.
            </div>
            <button
              onClick={() => setDone([false, false, false])}
              style={{
                marginTop: "0.6rem",
                padding: "0.4rem 0.85rem",
                background: "transparent",
                border: "1px solid var(--border)",
                color: "var(--text-2)",
                fontFamily: "inherit",
                fontSize: "0.78rem",
                fontWeight: 500,
                cursor: "pointer",
                borderRadius: "8px",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-strong)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            >
              Réinitialiser
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}
          >
            {trois.map((t, i) =>
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
                  onOpen={t.modalKey ? () => onOpen(t.modalKey!) : undefined}
                />
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TroisRow({
  item,
  onDone,
  onOpen,
}: {
  item: typeof trois[number];
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
            onOpen?.();
            setTimeout(onDone, 100);
          }}
          className="aperture-cta"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
            padding: "0.45rem 0.85rem",
            background: "var(--accent)",
            color: "#FFFFFF",
            border: "1px solid var(--accent)",
            borderRadius: "8px",
            fontFamily: "inherit",
            fontSize: "0.78rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "background 0.15s, transform 0.12s",
            boxShadow: "0 1px 2px rgba(30,64,175,0.18)",
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
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            background: "var(--surface)",
            color: "var(--text-3)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "border-color 0.15s, color 0.15s",
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

  // Extract base color for glow (strip CSS var indirection by using direct hex when iconColor maps)
  // Since iconColor is "var(--accent)", we'll use the var directly in box-shadow.
  return (
    <motion.button
      onClick={() => onOpen(tile.modalKey)}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.985 }}
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
        transition: "border-color 0.2s, box-shadow 0.25s",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--border-strong)";
        e.currentTarget.style.boxShadow = `0 1px 2px rgba(15,23,42,0.04), 0 12px 28px -14px rgba(15,23,42,0.18), 0 0 0 4px ${tile.iconBg}`;
        const icon = e.currentTarget.querySelector("[data-tile-icon]") as HTMLElement | null;
        if (icon) icon.style.transform = "rotate(4deg) scale(1.06)";
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
              transition: "transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
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
