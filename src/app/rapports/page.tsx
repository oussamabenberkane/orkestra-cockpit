"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, Target, FolderArchive, Flame, Wallet,
  Circle, ArrowUpRight, TrendingUp, TrendingDown, Minus,
  ChevronDown, BarChart3, SlidersHorizontal,
} from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { CommandPalette } from "@/components/shared/CommandPalette";
import { Sparkline } from "@/components/shared/Sparkline";
import { FloatingDock } from "@/components/dashboard/FloatingDock";

const SIDEBAR_KEY = "orkestra.sidebar.collapsed";

// ── Types ─────────────────────────────────────────────────────────────────────

type Metier = "prospection" | "portefeuille" | "sinistres" | "finance";
type Branche =
  | "all" | "RC_pro" | "accident" | "cyber" | "incendie"
  | "maladie" | "protection_juridique" | "transport" | "vehicule" | "vie";
type Statut = "actif" | "archivé" | "en_attente";
type Periode = "mensuel" | "trimestriel" | "semestriel" | "annuel";

type Report = {
  id: string;
  title: string;
  metier: Metier;
  branche: Branche;
  statut: Statut;
  periode: Periode;
  kpi: { value: string; label: string; trend: "up" | "down" | "stable" };
  sources: string[];
  updatedAt: string;
  spark?: number[];
  description: string;
};

// ── Metadata ──────────────────────────────────────────────────────────────────

const METIER_META: Record<Metier, {
  label: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  color: string;
  bg: string;
  glow: string;
}> = {
  prospection: {
    label: "Prospection", Icon: Target,
    color: "var(--accent)", bg: "var(--accent-tint)", glow: "rgba(88,86,214,0.18)",
  },
  portefeuille: {
    label: "Portefeuille", Icon: FolderArchive,
    color: "var(--info)", bg: "var(--info-tint)", glow: "rgba(0,122,255,0.18)",
  },
  sinistres: {
    label: "Sinistres", Icon: Flame,
    color: "var(--danger)", bg: "var(--danger-tint)", glow: "rgba(255,59,48,0.22)",
  },
  finance: {
    label: "Finance", Icon: Wallet,
    color: "var(--warn)", bg: "var(--warn-tint)", glow: "rgba(255,159,10,0.22)",
  },
};

const BRANCHE_LABELS: Record<Branche, string> = {
  all: "Toutes branches",
  RC_pro: "RC Professionnelle",
  accident: "Accidents",
  cyber: "Cyber",
  incendie: "Incendie & bâtiment",
  maladie: "Maladie",
  protection_juridique: "Protection juridique",
  transport: "Transport",
  vehicule: "Véhicules",
  vie: "Vie",
};

const STATUT_META: Record<Statut, { label: string; color: string; bg: string }> = {
  actif: { label: "Actif", color: "var(--success)", bg: "var(--success-tint)" },
  archivé: { label: "Archivé", color: "var(--text-4)", bg: "var(--surface-3)" },
  en_attente: { label: "En attente", color: "var(--warn)", bg: "var(--warn-tint)" },
};

const PERIODE_LABELS: Record<Periode, string> = {
  mensuel: "Mensuel",
  trimestriel: "Trimestriel",
  semestriel: "Semestriel",
  annuel: "Annuel",
};

// ── Report data ───────────────────────────────────────────────────────────────

const REPORTS: Report[] = [
  {
    id: "pros-conv-mai",
    title: "Rapport de conversion — Mai 2026",
    metier: "prospection", branche: "RC_pro", statut: "actif", periode: "mensuel",
    kpi: { value: "18 %", label: "Taux de conversion", trend: "up" },
    sources: ["BrokerStar"], updatedAt: "15 mai 2026",
    spark: [10, 12, 11, 14, 14, 15, 16, 17, 17, 18, 18, 18],
    description: "Analyse du taux de conversion des prospects en contrats sur le mois de mai.",
  },
  {
    id: "pros-pipeline-q2",
    title: "Pipeline de prospection Q2",
    metier: "prospection", branche: "cyber", statut: "actif", periode: "trimestriel",
    kpi: { value: "12", label: "Prospects actifs", trend: "up" },
    sources: ["BrokerStar"], updatedAt: "14 mai 2026",
    spark: [7, 8, 9, 9, 10, 11, 11, 12, 12, 12, 12, 12],
    description: "Suivi du pipeline commercial pour le deuxième trimestre 2026.",
  },
  {
    id: "pros-relances-s20",
    title: "Analyse des relances — Semaine 20",
    metier: "prospection", branche: "maladie", statut: "en_attente", periode: "mensuel",
    kpi: { value: "3", label: "Relances dues", trend: "stable" },
    sources: ["BrokerStar"], updatedAt: "12 mai 2026",
    description: "Récapitulatif des relances à effectuer auprès des prospects en attente.",
  },
  {
    id: "port-contrats",
    title: "Bilan des contrats actifs",
    metier: "portefeuille", branche: "all", statut: "actif", periode: "mensuel",
    kpi: { value: "189", label: "Contrats actifs", trend: "up" },
    sources: ["BrokerStar"], updatedAt: "15 mai 2026",
    spark: [182, 183, 184, 184, 185, 186, 186, 187, 188, 188, 189, 189],
    description: "Vue complète de l'ensemble des contrats actifs par branche et segment.",
  },
  {
    id: "port-renouvellements",
    title: "Renouvellements J-30",
    metier: "portefeuille", branche: "vehicule", statut: "en_attente", periode: "mensuel",
    kpi: { value: "4", label: "Échéances à venir", trend: "stable" },
    sources: ["BrokerStar"], updatedAt: "13 mai 2026",
    description: "Liste des contrats arrivant à échéance dans les 30 prochains jours.",
  },
  {
    id: "port-concentration",
    title: "Concentration du portefeuille",
    metier: "portefeuille", branche: "incendie", statut: "actif", periode: "trimestriel",
    kpi: { value: "85 K", label: "Primes CHF", trend: "up" },
    sources: ["BrokerStar"], updatedAt: "10 mai 2026",
    spark: [72, 74, 76, 78, 78, 80, 81, 82, 83, 84, 85, 85],
    description: "Analyse de la répartition des primes par branche d'assurance.",
  },
  {
    id: "sin-ouverts",
    title: "Dossiers ouverts — Mai 2026",
    metier: "sinistres", branche: "RC_pro", statut: "actif", periode: "mensuel",
    kpi: { value: "3", label: "Dossiers ouverts", trend: "down" },
    sources: ["BrokerStar"], updatedAt: "15 mai 2026",
    description: "Tableau de bord des sinistres en cours de traitement.",
  },
  {
    id: "sin-sinistralite-t2",
    title: "Analyse de la sinistralité T2",
    metier: "sinistres", branche: "accident", statut: "archivé", periode: "trimestriel",
    kpi: { value: "12 %", label: "Ratio sinistres / CA", trend: "stable" },
    sources: ["BrokerStar"], updatedAt: "30 avr. 2026",
    spark: [14, 13, 13, 12, 12, 12, 12, 12, 12, 12, 12, 12],
    description: "Rapport trimestriel sur le ratio de sinistralité par rapport au chiffre d'affaires.",
  },
  {
    id: "sin-litige-0047",
    title: "SIN-0047 — Suivi litige Cyber",
    metier: "sinistres", branche: "cyber", statut: "en_attente", periode: "mensuel",
    kpi: { value: "68 j", label: "Durée traitement", trend: "down" },
    sources: ["BrokerStar"], updatedAt: "15 mai 2026",
    description: "Suivi détaillé du dossier sinistre cyber SIN-0047 en cours d'arbitrage.",
  },
  {
    id: "fin-dashboard-mai",
    title: "Tableau de bord financier — Mai",
    metier: "finance", branche: "all", statut: "actif", periode: "mensuel",
    kpi: { value: "+18 K", label: "Cash-flow net CHF", trend: "up" },
    sources: ["BrokerStar", "Odoo"], updatedAt: "15 mai 2026",
    spark: [4, 6, 8, 7, 10, 12, 11, 14, 15, 16, 17, 18],
    description: "Vue consolidée des flux de trésorerie et indicateurs financiers du mois.",
  },
  {
    id: "fin-commissions-q2",
    title: "Analyse des commissions Q2",
    metier: "finance", branche: "all", statut: "actif", periode: "trimestriel",
    kpi: { value: "11.2 K", label: "Commissions CHF", trend: "up" },
    sources: ["BrokerStar", "Odoo"], updatedAt: "14 mai 2026",
    spark: [8, 9, 9, 10, 10, 10, 11, 11, 11, 11, 11, 11],
    description: "Détail des commissions perçues par type de contrat et compagnie.",
  },
  {
    id: "fin-impayes",
    title: "Rapport de trésorerie — Impayés",
    metier: "finance", branche: "all", statut: "en_attente", periode: "mensuel",
    kpi: { value: "3 200", label: "CHF en attente", trend: "stable" },
    sources: ["Odoo"], updatedAt: "13 mai 2026",
    description: "Liste et suivi des factures impayées affectant la trésorerie.",
  },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function TrendIcon({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up") return <TrendingUp size={10} strokeWidth={2.5} />;
  if (trend === "down") return <TrendingDown size={10} strokeWidth={2.5} />;
  return <Minus size={10} strokeWidth={2.5} />;
}

function ReportCard({ report, index }: { report: Report; index: number }) {
  const meta = METIER_META[report.metier];
  const { Icon } = meta;
  const statut = STATUT_META[report.statut];
  const trendColor =
    report.kpi.trend === "up" ? "var(--success)"
    : report.kpi.trend === "down" ? "var(--danger)"
    : "var(--text-3)";
  const trendBg =
    report.kpi.trend === "up" ? "var(--success-tint)"
    : report.kpi.trend === "down" ? "var(--danger-tint)"
    : "var(--surface-3)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.38, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      layout
    >
      <Link
        href={`/rapports/${report.id}`}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          background: "var(--surface)",
          borderRadius: "14px",
          padding: "1.05rem 1.1rem 0.95rem",
          textDecoration: "none",
          color: "inherit",
          boxShadow: "var(--tier-1)",
          transition: "transform 0.22s ease, box-shadow 0.22s ease",
          position: "relative",
          overflow: "hidden",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
          (e.currentTarget as HTMLElement).style.boxShadow =
            `inset 0 1px 0 rgba(255,255,255,1), 0 0 0 1px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.06), 0 16px 32px -12px rgba(0,0,0,0.18), 0 0 0 4px ${meta.glow}`;
          const icon = (e.currentTarget as HTMLElement).querySelector("[data-icon]") as HTMLElement | null;
          if (icon) icon.style.transform = "rotate(4deg) scale(1.06)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLElement).style.boxShadow = "var(--tier-1)";
          const icon = (e.currentTarget as HTMLElement).querySelector("[data-icon]") as HTMLElement | null;
          if (icon) icon.style.transform = "rotate(0) scale(1)";
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", minWidth: 0 }}>
            <span
              data-icon
              style={{
                width: 30, height: 30, flexShrink: 0,
                background: meta.bg, color: meta.color,
                borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
                transition: "transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              <Icon size={14} strokeWidth={2} />
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: "0.88rem", fontWeight: 600, color: "var(--text)",
                letterSpacing: "-0.01em", lineHeight: 1.3,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {report.title}
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-4)", marginTop: "1px" }}>
                {meta.label} · {PERIODE_LABELS[report.periode]}
              </div>
            </div>
          </div>
          <ArrowUpRight size={14} strokeWidth={2.25} color="var(--text-4)" style={{ flexShrink: 0, marginTop: "2px" }} />
        </div>

        {/* KPI */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: "0.65rem" }}>
          <div>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: "1.75rem", fontWeight: 600,
              letterSpacing: "-0.035em", color: "var(--text)", lineHeight: 0.95,
              fontVariantNumeric: "tabular-nums",
            }}>
              {report.kpi.value}
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-3)", marginTop: "0.3rem" }}>
              {report.kpi.label}
            </div>
          </div>
          {report.spark && (
            <div style={{ flex: 1, marginBottom: "0.55rem", color: meta.color, opacity: 0.85 }}>
              <Sparkline data={report.spark} width={120} height={18} stroke="currentColor" strokeWidth={1.4} />
            </div>
          )}
        </div>

        {/* Description */}
        <p style={{
          fontSize: "0.78rem", color: "var(--text-3)", lineHeight: 1.5,
          margin: 0, display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {report.description}
        </p>

        {/* Footer */}
        <div style={{
          display: "flex", alignItems: "center", gap: "0.5rem",
          paddingTop: "0.55rem",
          background: "linear-gradient(to right, transparent, var(--border) 12%, var(--border) 88%, transparent) top / 100% 1px no-repeat",
        }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "0.25rem",
            fontSize: "0.66rem", fontWeight: 700,
            color: statut.color, background: statut.bg,
            padding: "0.1rem 0.45rem", borderRadius: "5px",
          }}>
            <Circle size={4} strokeWidth={0} fill="currentColor" />
            {statut.label}
          </span>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "0.25rem",
            fontSize: "0.66rem", fontWeight: 600,
            color: trendColor, background: trendBg,
            padding: "0.1rem 0.4rem", borderRadius: "5px",
          }}>
            <TrendIcon trend={report.kpi.trend} />
            {report.kpi.trend === "up" ? "Hausse" : report.kpi.trend === "down" ? "Baisse" : "Stable"}
          </span>
          <span style={{ flex: 1 }} />
          <span style={{ fontSize: "0.64rem", color: "var(--text-4)", fontWeight: 500 }}>
            {report.sources.join(" · ")}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

function DropdownFilter<T extends string>({
  label, value, options, onChange,
}: {
  label: string;
  value: T | "all";
  options: { value: T | "all"; label: string }[];
  onChange: (v: T | "all") => void;
}) {
  const [open, setOpen] = useState(false);
  const active = value !== "all";
  const selectedLabel = options.find((o) => o.value === value)?.label ?? label;

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "inline-flex", alignItems: "center", gap: "0.4rem",
          padding: "0.45rem 0.75rem",
          background: active ? "var(--accent-tint)" : "var(--surface)",
          border: active ? "1px solid var(--accent-tint-2)" : "1px solid var(--border)",
          borderRadius: "9px", cursor: "pointer", fontFamily: "inherit",
          fontSize: "0.8rem", fontWeight: active ? 600 : 500,
          color: active ? "var(--accent)" : "var(--text-2)",
          boxShadow: active ? "none" : "var(--tier-1)",
          transition: "background 0.18s, color 0.18s, border-color 0.18s",
          whiteSpace: "nowrap",
        }}
      >
        {active ? selectedLabel : label}
        <ChevronDown size={12} strokeWidth={2.5} style={{ opacity: 0.6, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.18s" }} />
        {active && (
          <span
            onClick={(e) => { e.stopPropagation(); onChange("all"); }}
            style={{ display: "flex", alignItems: "center", marginLeft: "0.1rem", opacity: 0.7, cursor: "pointer" }}
          >
            <X size={11} strokeWidth={2.5} />
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 100,
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: "12px", boxShadow: "var(--tier-2)",
              minWidth: "180px", overflow: "hidden", padding: "0.3rem",
            }}
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                style={{
                  width: "100%", textAlign: "left", padding: "0.45rem 0.65rem",
                  background: value === opt.value ? "var(--accent-tint)" : "transparent",
                  border: "none", borderRadius: "8px", cursor: "pointer",
                  fontFamily: "inherit", fontSize: "0.82rem", fontWeight: value === opt.value ? 600 : 400,
                  color: value === opt.value ? "var(--accent)" : "var(--text-2)",
                  transition: "background 0.14s",
                }}
                onMouseEnter={(e) => { if (value !== opt.value) (e.currentTarget as HTMLElement).style.background = "var(--surface-3)"; }}
                onMouseLeave={(e) => { if (value !== opt.value) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {open && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RapportsPage() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [metierFilter, setMetierFilter] = useState<Metier | "all">("all");
  const [brancheFilter, setBrancheFilter] = useState<Branche | "all">("all");
  const [periodeFilter, setPeriodeFilter] = useState<Periode | "all">("all");
  const [statutFilter, setstatutFilter] = useState<Statut | "all">("all");

  useEffect(() => {
    try {
      const s = localStorage.getItem(SIDEBAR_KEY);
      if (s === "true") setCollapsed(true);
    } catch {}
    setHydrated(true);
  }, []);

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem(SIDEBAR_KEY, String(next)); } catch {}
      return next;
    });
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return REPORTS.filter((r) => {
      if (metierFilter !== "all" && r.metier !== metierFilter) return false;
      if (brancheFilter !== "all" && r.branche !== "all" && r.branche !== brancheFilter) return false;
      if (periodeFilter !== "all" && r.periode !== periodeFilter) return false;
      if (statutFilter !== "all" && r.statut !== statutFilter) return false;
      if (q && !r.title.toLowerCase().includes(q) && !r.description.toLowerCase().includes(q) && !r.kpi.label.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, metierFilter, brancheFilter, periodeFilter, statutFilter]);

  const activeFilterCount = [metierFilter, brancheFilter, periodeFilter, statutFilter].filter((f) => f !== "all").length + (search ? 1 : 0);

  const clearAll = () => {
    setSearch("");
    setMetierFilter("all");
    setBrancheFilter("all");
    setPeriodeFilter("all");
    setstatutFilter("all");
  };

  const METIERS: { value: Metier | "all"; label: string }[] = [
    { value: "all", label: "Tous" },
    ...Object.entries(METIER_META).map(([k, v]) => ({ value: k as Metier, label: v.label })),
  ];

  const BRANCHES: { value: Branche | "all"; label: string }[] = Object.entries(BRANCHE_LABELS).map(
    ([k, v]) => ({ value: k as Branche, label: v })
  );

  const PERIODES: { value: Periode | "all"; label: string }[] = [
    { value: "all", label: "Toutes périodes" },
    ...Object.entries(PERIODE_LABELS).map(([k, v]) => ({ value: k as Periode, label: v })),
  ];

  const STATUTS: { value: Statut | "all"; label: string }[] = [
    { value: "all", label: "Tous statuts" },
    { value: "actif", label: "Actif" },
    { value: "archivé", label: "Archivé" },
    { value: "en_attente", label: "En attente" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
        display: "flex",
        visibility: hydrated ? "visible" : "hidden",
      }}
    >
      <Sidebar
        collapsed={collapsed}
        onToggle={toggleSidebar}
        onLogout={() => router.replace("/login")}
        onOpenPalette={() => setPaletteOpen(true)}
      />

      <main style={{
        flex: 1, minWidth: 0,
        padding: "clamp(2rem, 4vw, 3rem) clamp(1.5rem, 3vw, 2.5rem) 4rem",
        maxWidth: "1240px", marginInline: "auto", width: "100%",
      }}>
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: "2rem" }}
        >
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", marginBottom: "0.3rem" }}>
                <span style={{
                  width: 32, height: 32,
                  background: "var(--accent-tint)", color: "var(--accent)",
                  borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
                }}>
                  <BarChart3 size={16} strokeWidth={2} />
                </span>
                <h1 style={{
                  fontSize: "clamp(1.6rem, 2.8vw, 2rem)", fontWeight: 600,
                  letterSpacing: "-0.025em", color: "var(--text)", margin: 0,
                }}>
                  Tous les rapports
                </h1>
              </div>
              <p style={{ fontSize: "0.9rem", color: "var(--text-3)", margin: 0 }}>
                {REPORTS.length} rapports disponibles · Cabinet Müller &amp; Associés
              </p>
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={clearAll}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "0.35rem",
                  padding: "0.45rem 0.85rem",
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: "9px", cursor: "pointer", fontFamily: "inherit",
                  fontSize: "0.8rem", fontWeight: 500, color: "var(--text-3)",
                  boxShadow: "var(--tier-1)", transition: "color 0.18s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--danger)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-3)")}
              >
                <X size={12} strokeWidth={2.5} />
                Réinitialiser les filtres
                <span style={{
                  minWidth: 18, height: 18, padding: "0 4px",
                  background: "var(--accent)", color: "#fff",
                  borderRadius: "100px", fontSize: "0.62rem", fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {activeFilterCount}
                </span>
              </button>
            )}
          </div>
        </motion.div>

        {/* Search + filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.45 }}
          style={{ marginBottom: "1.75rem" }}
        >
          {/* Search */}
          <div style={{
            position: "relative", marginBottom: "0.75rem",
            maxWidth: "480px",
          }}>
            <Search
              size={15} strokeWidth={2}
              style={{
                position: "absolute", left: "0.85rem", top: "50%",
                transform: "translateY(-50%)", color: "var(--text-4)", pointerEvents: "none",
              }}
            />
            <input
              type="text"
              placeholder="Rechercher un rapport…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "0.6rem 2.5rem 0.6rem 2.4rem",
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: "11px", fontFamily: "inherit", fontSize: "0.88rem",
                color: "var(--text)", outline: "none", boxShadow: "var(--tier-1)",
                transition: "border-color 0.18s, box-shadow 0.18s",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-tint), var(--tier-1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.boxShadow = "var(--tier-1)";
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  position: "absolute", right: "0.7rem", top: "50%",
                  transform: "translateY(-50%)", background: "none", border: "none",
                  color: "var(--text-4)", cursor: "pointer", display: "flex", padding: "2px",
                }}
              >
                <X size={13} strokeWidth={2.5} />
              </button>
            )}
          </div>

          {/* Filter bar */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "0.3rem",
              fontSize: "0.76rem", color: "var(--text-4)", fontWeight: 500, paddingRight: "0.25rem",
            }}>
              <SlidersHorizontal size={12} strokeWidth={2} />
              Filtrer
            </span>

            {/* Métier pills */}
            <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
              {METIERS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMetierFilter(m.value as Metier | "all")}
                  style={{
                    padding: "0.38rem 0.7rem",
                    background: metierFilter === m.value ? "var(--accent)" : "var(--surface)",
                    border: metierFilter === m.value ? "1px solid var(--accent)" : "1px solid var(--border)",
                    borderRadius: "8px", cursor: "pointer", fontFamily: "inherit",
                    fontSize: "0.78rem", fontWeight: metierFilter === m.value ? 600 : 500,
                    color: metierFilter === m.value ? "#fff" : "var(--text-2)",
                    boxShadow: metierFilter === m.value ? "none" : "var(--tier-1)",
                    transition: "all 0.18s",
                  }}
                >
                  {m.value === "all" ? "Tous" : m.label}
                </button>
              ))}
            </div>

            <div style={{ width: "1px", height: "24px", background: "var(--border)" }} />

            <DropdownFilter label="Branche" value={brancheFilter} options={BRANCHES} onChange={setBrancheFilter} />
            <DropdownFilter label="Période" value={periodeFilter} options={PERIODES} onChange={setPeriodeFilter} />
            <DropdownFilter label="Statut" value={statutFilter} options={STATUTS} onChange={setstatutFilter} />
          </div>
        </motion.div>

        {/* Results count */}
        <div style={{
          fontSize: "0.8rem", color: "var(--text-4)", fontWeight: 500,
          marginBottom: "1rem",
          fontFamily: "var(--font-mono)",
        }}>
          {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
          {activeFilterCount > 0 ? ` — ${activeFilterCount} filtre${activeFilterCount > 1 ? "s" : ""} actif${activeFilterCount > 1 ? "s" : ""}` : ""}
        </div>

        {/* Card grid */}
        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            <motion.div
              key="grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "0.85rem",
              }}
              className="rapports-grid"
            >
              {filtered.map((report, i) => (
                <ReportCard key={report.id} report={report} index={i} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", padding: "4rem 1rem", textAlign: "center", gap: "0.5rem",
              }}
            >
              <span style={{
                width: 48, height: 48, background: "var(--surface-3)", color: "var(--text-4)",
                borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "0.3rem",
              }}>
                <BarChart3 size={22} strokeWidth={1.5} />
              </span>
              <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text)", letterSpacing: "-0.015em" }}>
                Aucun rapport trouvé
              </div>
              <div style={{ fontSize: "0.86rem", color: "var(--text-3)", maxWidth: "32ch", lineHeight: 1.5 }}>
                Essayez de modifier vos filtres ou votre recherche.
              </div>
              <button
                onClick={clearAll}
                style={{
                  marginTop: "0.75rem", padding: "0.5rem 1.1rem",
                  background: "var(--accent)", color: "#fff", border: "none",
                  borderRadius: "9px", cursor: "pointer", fontFamily: "inherit",
                  fontSize: "0.82rem", fontWeight: 600,
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25), 0 0 0 1px rgba(68,65,200,0.30), 0 4px 14px -4px rgba(88,86,214,0.40)",
                }}
              >
                Réinitialiser
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <style>{`
          @media (max-width: 1100px) { .rapports-grid { grid-template-columns: repeat(2, 1fr) !important; } }
          @media (max-width: 600px)  { .rapports-grid { grid-template-columns: 1fr !important; } }
        `}</style>
      </main>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onOpenModal={() => {}}
        onLogout={() => router.replace("/login")}
      />

      <FloatingDock />
    </div>
  );
}
