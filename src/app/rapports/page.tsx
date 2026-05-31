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
import { WorkspaceTabs } from "@/components/dashboard/WorkspaceTabs";

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
    color: "var(--accent)", bg: "var(--accent-tint)", glow: "rgba(0,122,255,0.18)",
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
  // ── Prospection ──────────────────────────────────────────────────────────────
  {
    id: "pros-pipeline-courtier",
    title: "Pipeline des Opportunités par Courtier",
    metier: "prospection", branche: "all", statut: "actif", periode: "trimestriel",
    kpi: { value: "12", label: "Opportunités actives", trend: "up" },
    sources: ["Helvebroker SA"], updatedAt: "15 mai 2026",
    spark: [7, 8, 9, 9, 10, 11, 11, 12, 12, 12, 12, 12],
    description: "Suivi des opportunités commerciales par courtier dans le CRM Helvebroker SA.",
  },
  {
    id: "pros-taux-transformation",
    title: "Suivi des Prospects – Taux de Transformation",
    metier: "prospection", branche: "RC_pro", statut: "actif", periode: "mensuel",
    kpi: { value: "18 %", label: "Taux de transformation", trend: "up" },
    sources: ["Helvebroker SA"], updatedAt: "14 mai 2026",
    spark: [10, 12, 11, 14, 14, 15, 16, 17, 17, 18, 18, 18],
    description: "Analyse du taux de transformation des prospects en contrats signés.",
  },
  {
    id: "pros-nouvelles-affaires",
    title: "Nouvelles Affaires par Branche et Période",
    metier: "prospection", branche: "all", statut: "actif", periode: "trimestriel",
    kpi: { value: "7", label: "Nouvelles affaires", trend: "up" },
    sources: ["Helvebroker SA"], updatedAt: "13 mai 2026",
    spark: [3, 4, 4, 5, 5, 6, 6, 6, 7, 7, 7, 7],
    description: "Répartition des nouvelles affaires signées par branche et par période.",
  },
  {
    id: "pros-apporteurs",
    title: "Activité Commerciale par Apporteur d'Affaires",
    metier: "prospection", branche: "all", statut: "en_attente", periode: "mensuel",
    kpi: { value: "4", label: "Apporteurs actifs", trend: "stable" },
    sources: ["Helvebroker SA"], updatedAt: "12 mai 2026",
    description: "Tableau de bord de l'activité commerciale par réseau d'apporteurs d'affaires.",
  },
  {
    id: "pros-leads-contrats",
    title: "Leads Entrants vs Contrats Émis",
    metier: "prospection", branche: "all", statut: "actif", periode: "mensuel",
    kpi: { value: "3:1", label: "Ratio leads / contrats", trend: "stable" },
    sources: ["Helvebroker SA"], updatedAt: "10 mai 2026",
    description: "Comparatif entre les leads entrants et les contrats émis sur la période.",
  },
  // ── Portefeuille ─────────────────────────────────────────────────────────────
  {
    id: "port-contrats-branche",
    title: "Portefeuille Contrats Actifs par Branche",
    metier: "portefeuille", branche: "all", statut: "actif", periode: "mensuel",
    kpi: { value: "189", label: "Contrats actifs", trend: "up" },
    sources: ["Helvebroker SA"], updatedAt: "15 mai 2026",
    spark: [182, 183, 184, 184, 185, 186, 186, 187, 188, 188, 189, 189],
    description: "Vue complète des contrats actifs segmentés par branche (Auto, MRH, Santé…).",
  },
  {
    id: "port-primes-compagnie",
    title: "Encours de Primes par Compagnie d'Assurance",
    metier: "portefeuille", branche: "all", statut: "actif", periode: "trimestriel",
    kpi: { value: "85 K", label: "Encours primes CHF", trend: "up" },
    sources: ["Helvebroker SA"], updatedAt: "14 mai 2026",
    spark: [72, 74, 76, 78, 78, 80, 81, 82, 83, 84, 85, 85],
    description: "Répartition des encours de primes par compagnie partenaire.",
  },
  {
    id: "port-renouvellements",
    title: "Renouvellements à Échéance – Tableau de Bord",
    metier: "portefeuille", branche: "vehicule", statut: "en_attente", periode: "mensuel",
    kpi: { value: "4", label: "Échéances J-30", trend: "stable" },
    sources: ["Helvebroker SA"], updatedAt: "13 mai 2026",
    description: "Tableau de bord des contrats arrivant à renouvellement dans les 30 jours.",
  },
  {
    id: "port-attrition",
    title: "Taux d'Attrition et Résiliation du Portefeuille",
    metier: "portefeuille", branche: "all", statut: "actif", periode: "trimestriel",
    kpi: { value: "13 %", label: "Taux d'attrition", trend: "down" },
    sources: ["Helvebroker SA"], updatedAt: "10 mai 2026",
    spark: [17, 16, 16, 15, 15, 14, 14, 14, 13, 13, 13, 13],
    description: "Analyse du taux de résiliation et attrition par segment de portefeuille.",
  },
  {
    id: "port-risques",
    title: "Répartition des Contrats par Catégorie de Risque",
    metier: "portefeuille", branche: "all", statut: "actif", periode: "trimestriel",
    kpi: { value: "5", label: "Catégories de risque", trend: "stable" },
    sources: ["Helvebroker SA"], updatedAt: "8 mai 2026",
    description: "Distribution des contrats par niveau et catégorie de risque assuré.",
  },
  // ── Sinistres ────────────────────────────────────────────────────────────────
  {
    id: "sin-declarations-branche",
    title: "Déclarations de Sinistres en Cours par Branche",
    metier: "sinistres", branche: "all", statut: "actif", periode: "mensuel",
    kpi: { value: "3", label: "Dossiers ouverts", trend: "down" },
    sources: ["Helvebroker SA"], updatedAt: "15 mai 2026",
    description: "Tableau de bord des sinistres en cours classés par branche d'assurance.",
  },
  {
    id: "sin-ratio-sp",
    title: "Ratio Sinistres / Primes (S/P) par Compagnie",
    metier: "sinistres", branche: "all", statut: "actif", periode: "trimestriel",
    kpi: { value: "12 %", label: "Ratio S/P moyen", trend: "stable" },
    sources: ["Helvebroker SA"], updatedAt: "30 avr. 2026",
    spark: [14, 13, 13, 12, 12, 12, 12, 12, 12, 12, 12, 12],
    description: "Analyse du ratio sinistres sur primes par compagnie d'assurance partenaire.",
  },
  {
    id: "sin-delai-reglement",
    title: "Délai Moyen de Règlement par Type de Sinistre",
    metier: "sinistres", branche: "RC_pro", statut: "archivé", periode: "trimestriel",
    kpi: { value: "34 j", label: "Délai moyen règlement", trend: "down" },
    sources: ["Helvebroker SA"], updatedAt: "30 avr. 2026",
    spark: [42, 40, 39, 38, 37, 36, 36, 35, 35, 34, 34, 34],
    description: "Suivi des délais de règlement des sinistres par type et compagnie.",
  },
  {
    id: "sin-reserves-reglements",
    title: "Réserves vs Règlements Effectués",
    metier: "sinistres", branche: "all", statut: "en_attente", periode: "mensuel",
    kpi: { value: "24 K", label: "CHF en réserve", trend: "stable" },
    sources: ["Helvebroker SA"], updatedAt: "15 mai 2026",
    description: "Comparatif entre les réserves provisionnées et les règlements effectués.",
  },
  {
    id: "sin-graves",
    title: "Sinistres Graves – Suivi et Historique",
    metier: "sinistres", branche: "cyber", statut: "en_attente", periode: "mensuel",
    kpi: { value: "68 j", label: "Durée traitement", trend: "down" },
    sources: ["Helvebroker SA"], updatedAt: "15 mai 2026",
    description: "Suivi détaillé des sinistres graves et historique des dossiers complexes.",
  },
  // ── Finance ──────────────────────────────────────────────────────────────────
  {
    id: "fin-marge-nette",
    title: "Marge Nette Cabinet ⊕ Helvebroker SA + Odoo",
    metier: "finance", branche: "all", statut: "actif", periode: "mensuel",
    kpi: { value: "68 %", label: "Marge nette", trend: "up" },
    sources: ["Helvebroker SA", "Odoo"], updatedAt: "15 mai 2026",
    spark: [58, 60, 61, 62, 63, 64, 64, 65, 66, 67, 68, 68],
    description: "Calcul de la marge nette du cabinet, combinant commissions Helvebroker SA et charges Odoo.",
  },
  {
    id: "fin-cashflow",
    title: "Cash-Flow Prévisionnel ⊕ Helvebroker SA + Odoo",
    metier: "finance", branche: "all", statut: "actif", periode: "mensuel",
    kpi: { value: "+18 K", label: "Cash-flow net CHF", trend: "up" },
    sources: ["Helvebroker SA", "Odoo"], updatedAt: "15 mai 2026",
    spark: [4, 6, 8, 7, 10, 12, 11, 14, 15, 16, 17, 18],
    description: "Projection des flux de trésorerie prévisionnels sur la base des données combinées.",
  },
  {
    id: "fin-rentabilite-branche",
    title: "Rentabilité par Branche ⊕ Helvebroker SA + Odoo",
    metier: "finance", branche: "all", statut: "actif", periode: "trimestriel",
    kpi: { value: "11.2 K", label: "Commissions CHF", trend: "up" },
    sources: ["Helvebroker SA", "Odoo"], updatedAt: "14 mai 2026",
    spark: [8, 9, 9, 10, 10, 10, 11, 11, 11, 11, 11, 11],
    description: "Analyse de la rentabilité par branche d'assurance, croisée avec les charges Odoo.",
  },
  {
    id: "fin-ratio-sinistralite",
    title: "Ratio Sinistralité / CA ⊕ Helvebroker SA + Odoo",
    metier: "finance", branche: "all", statut: "actif", periode: "trimestriel",
    kpi: { value: "12 %", label: "Ratio sinistralité / CA", trend: "stable" },
    sources: ["Helvebroker SA", "Odoo"], updatedAt: "13 mai 2026",
    spark: [14, 13, 13, 12, 12, 12, 12, 12, 12, 12, 12, 12],
    description: "Ratio sinistralité rapporté au chiffre d'affaires, calculé sur données croisées.",
  },
  {
    id: "fin-cac",
    title: "Coût d'Acquisition Client ⊕ Helvebroker SA + Odoo",
    metier: "finance", branche: "all", statut: "en_attente", periode: "trimestriel",
    kpi: { value: "3 200", label: "CHF / nouveau client", trend: "stable" },
    sources: ["Helvebroker SA", "Odoo"], updatedAt: "13 mai 2026",
    description: "Calcul du coût d'acquisition par nouveau client intégrant charges commerciales Odoo.",
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
      style={{ minWidth: 0 }}
    >
      <Link
        href={`/rapports/${report.id}`}
        className="rapport-card"
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
          minWidth: 0,
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
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                className="rapport-card__title"
                style={{
                  fontSize: "0.88rem", fontWeight: 600, color: "var(--text)",
                  letterSpacing: "-0.01em", lineHeight: 1.3,
                  overflow: "hidden", textOverflow: "ellipsis",
                  display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                  wordBreak: "break-word",
                }}
              >
                {report.title}
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-4)", marginTop: "2px" }}>
                {meta.label} · {PERIODE_LABELS[report.periode]}
              </div>
            </div>
          </div>
          <ArrowUpRight size={14} strokeWidth={2.25} color="var(--text-4)" style={{ flexShrink: 0, marginTop: "2px" }} />
        </div>

        {/* KPI */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: "0.65rem", minWidth: 0 }}>
          <div style={{ minWidth: 0 }}>
            <div
              className="rapport-card__kpi"
              style={{
                fontFamily: "var(--font-mono)", fontWeight: 600,
                letterSpacing: "-0.035em", color: "var(--text)", lineHeight: 0.95,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {report.kpi.value}
            </div>
            <div style={{
              fontSize: "0.72rem", color: "var(--text-3)", marginTop: "0.3rem",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {report.kpi.label}
            </div>
          </div>
          {report.spark && (
            <div style={{
              flex: 1, minWidth: 0, marginBottom: "0.55rem",
              color: meta.color, opacity: 0.85, overflow: "hidden",
            }}>
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
          display: "flex", alignItems: "center", flexWrap: "wrap",
          gap: "0.35rem 0.5rem",
          paddingTop: "0.55rem", minWidth: 0,
          background: "linear-gradient(to right, transparent, var(--border) 12%, var(--border) 88%, transparent) top / 100% 1px no-repeat",
        }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "0.25rem",
            fontSize: "0.66rem", fontWeight: 700,
            color: statut.color, background: statut.bg,
            padding: "0.1rem 0.45rem", borderRadius: "5px",
            whiteSpace: "nowrap",
          }}>
            <Circle size={4} strokeWidth={0} fill="currentColor" />
            {statut.label}
          </span>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "0.25rem",
            fontSize: "0.66rem", fontWeight: 600,
            color: trendColor, background: trendBg,
            padding: "0.1rem 0.4rem", borderRadius: "5px",
            whiteSpace: "nowrap",
          }}>
            <TrendIcon trend={report.kpi.trend} />
            {report.kpi.trend === "up" ? "Hausse" : report.kpi.trend === "down" ? "Baisse" : "Stable"}
          </span>
          <span style={{ flex: 1, minWidth: 0 }} />
          <span style={{
            fontSize: "0.64rem", color: "var(--text-4)", fontWeight: 500,
            minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            maxWidth: "100%",
          }}>
            {report.sources.join(" · ")}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

function DropdownFilter<T extends string>({
  label, value, options, onChange, align = "left",
}: {
  label: string;
  value: T | "all";
  options: { value: T | "all"; label: string }[];
  onChange: (v: T | "all") => void;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const active = value !== "all";
  const selectedLabel = options.find((o) => o.value === value)?.label ?? label;

  return (
    <div style={{ position: "relative" }} className="rapport-dropdown">
      <button
        onClick={() => setOpen((o) => !o)}
        className="rapport-filter-btn"
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
              position: "absolute", top: "calc(100% + 6px)",
              ...(align === "right" ? { right: 0 } : { left: 0 }),
              zIndex: 100,
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: "12px", boxShadow: "var(--tier-2)",
              minWidth: "180px",
              maxWidth: "min(260px, calc(100vw - 32px))",
              maxHeight: "min(60vh, 320px)",
              overflowY: "auto", padding: "0.3rem",
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
        onLogout={async () => { const { supabase } = await import("@/lib/supabase"); await supabase.auth.signOut(); router.replace("/login"); }}
        onOpenPalette={() => setPaletteOpen(true)}
      />

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {/* Top strip — 58px to align with the sidebar header height so the
         * workspace switcher sits on the same horizontal line as the Malyz
         * brand mark in the rail. */}
        <div
          className="app-topbar"
          style={{
            height: 58,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 clamp(1rem, 3vw, 2.5rem)",
            flexShrink: 0,
          }}
        >
          <WorkspaceTabs />
        </div>

      <main className="app-main rapports-main" style={{
        minWidth: 0,
        padding: "0 clamp(1rem, 3vw, 2.5rem) 4rem",
        maxWidth: "1240px", marginInline: "auto", width: "100%",
      }}>
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: "2rem" }}
        >
          <div className="rapports-header-row">
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", marginBottom: "0.3rem" }}>
                <span style={{
                  width: 32, height: 32, flexShrink: 0,
                  background: "var(--accent-tint)", color: "var(--accent)",
                  borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
                }}>
                  <BarChart3 size={16} strokeWidth={2} />
                </span>
                <h1 style={{
                  fontSize: "clamp(1.35rem, 4.5vw, 2rem)", fontWeight: 600,
                  letterSpacing: "-0.025em", color: "var(--text)", margin: 0,
                  minWidth: 0,
                }}>
                  Tous les rapports
                </h1>
              </div>
              <p style={{
                fontSize: "clamp(0.82rem, 2.4vw, 0.9rem)", color: "var(--text-3)", margin: 0,
              }}>
                {REPORTS.length}{" "}rapports disponibles · Helvebroker
              </p>
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={clearAll}
                className="rapport-reset-btn"
                aria-label={`Réinitialiser ${activeFilterCount} filtre${activeFilterCount > 1 ? "s" : ""}`}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "0.35rem",
                  padding: "0.5rem 0.85rem",
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: "9px", cursor: "pointer", fontFamily: "inherit",
                  fontSize: "0.8rem", fontWeight: 500, color: "var(--text-3)",
                  boxShadow: "var(--tier-1)", transition: "color 0.18s",
                  whiteSpace: "nowrap", flexShrink: 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--danger)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-3)")}
              >
                <X size={12} strokeWidth={2.5} />
                <span className="rapport-reset-btn__full">Réinitialiser les filtres</span>
                <span className="rapport-reset-btn__short">Réinitialiser</span>
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
              className="rapport-search-input"
              aria-label="Rechercher un rapport"
              style={{
                width: "100%", padding: "0.65rem 2.5rem 0.65rem 2.4rem",
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
                aria-label="Effacer la recherche"
                style={{
                  position: "absolute", right: "0.4rem", top: "50%",
                  transform: "translateY(-50%)", background: "none", border: "none",
                  color: "var(--text-4)", cursor: "pointer",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 28, height: 28, borderRadius: 6,
                }}
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            )}
          </div>

          {/* Filter bar */}
          <div className="rapports-filterbar">
            <div className="rapports-filterbar__label">
              <SlidersHorizontal size={12} strokeWidth={2} />
              <span>Filtrer</span>
            </div>

            {/* Métier pills — horizontal scroll on narrow viewports */}
            <div className="rapports-metiers" role="tablist" aria-label="Métier">
              {METIERS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMetierFilter(m.value as Metier | "all")}
                  className="rapport-filter-btn rapport-metier-pill"
                  role="tab"
                  aria-selected={metierFilter === m.value}
                  style={{
                    padding: "0.38rem 0.7rem",
                    background: metierFilter === m.value ? "var(--accent)" : "var(--surface)",
                    border: metierFilter === m.value ? "1px solid var(--accent)" : "1px solid var(--border)",
                    borderRadius: "8px", cursor: "pointer", fontFamily: "inherit",
                    fontSize: "0.78rem", fontWeight: metierFilter === m.value ? 600 : 500,
                    color: metierFilter === m.value ? "#fff" : "var(--text-2)",
                    boxShadow: metierFilter === m.value ? "none" : "var(--tier-1)",
                    transition: "all 0.18s",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {m.value === "all" ? "Tous" : m.label}
                </button>
              ))}
            </div>

            <div className="rapports-filterbar__divider" aria-hidden />

            <div className="rapports-dropdowns">
              <DropdownFilter label="Branche" value={brancheFilter} options={BRANCHES} onChange={setBrancheFilter} />
              <DropdownFilter label="Période" value={periodeFilter} options={PERIODES} onChange={setPeriodeFilter} />
              <DropdownFilter label="Statut" value={statutFilter} options={STATUTS} onChange={setstatutFilter} align="right" />
            </div>
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
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
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
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25), 0 0 0 1px rgba(0,98,204,0.30), 0 4px 14px -4px rgba(0,122,255,0.40)",
                }}
              >
                Réinitialiser
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <style>{`
          /* ── Rapports — page header row ────────────────────────────────────── */
          .rapports-header-row {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: 0.75rem 1rem;
            flex-wrap: wrap;
          }
          .rapport-reset-btn__short { display: none; }
          @media (max-width: 480px) {
            .rapports-header-row { align-items: flex-start; }
            .rapport-reset-btn__full { display: none; }
            .rapport-reset-btn__short { display: inline; }
          }

          /* ── Rapports — KPI value (responsive font-size) ───────────────────── */
          .rapport-card__kpi {
            font-size: clamp(1.4rem, 4.5vw, 1.75rem);
          }
          /* The title block — clamp to two lines, allow long words to break */
          .rapport-card__title {
            word-break: break-word;
            overflow-wrap: anywhere;
          }

          /* ── Rapports — card grid breakpoints ──────────────────────────────── */
          @media (max-width: 1100px) {
            .rapports-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          }
          @media (max-width: 600px) {
            .rapports-grid { grid-template-columns: minmax(0, 1fr) !important; gap: 0.7rem !important; }
          }

          /* ── Rapports — filter bar layout ─────────────────────────────────── */
          .rapports-filterbar {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            align-items: center;
            min-width: 0;
          }
          .rapports-filterbar__label {
            display: inline-flex;
            align-items: center;
            gap: 0.3rem;
            font-size: 0.76rem;
            color: var(--text-4);
            font-weight: 500;
            padding-right: 0.25rem;
            flex-shrink: 0;
          }
          .rapports-filterbar__divider {
            width: 1px;
            height: 24px;
            background: var(--border);
            flex-shrink: 0;
          }
          .rapports-metiers {
            display: flex;
            gap: 0.3rem;
            flex-wrap: wrap;
            min-width: 0;
          }
          .rapports-dropdowns {
            display: flex;
            gap: 0.4rem;
            flex-wrap: wrap;
            min-width: 0;
          }

          /* Tablet (≤900px) — Métier pills become a horizontal scroll strip so
             they always stay on one row and can't squeeze the dropdowns. */
          @media (max-width: 900px) {
            .rapports-filterbar { gap: 0.55rem; }
            .rapports-metiers {
              flex-wrap: nowrap;
              overflow-x: auto;
              overflow-y: hidden;
              scrollbar-width: none;
              -ms-overflow-style: none;
              padding-bottom: 2px;
              width: 100%;
              order: 2;
              mask-image: linear-gradient(90deg, #000 calc(100% - 14px), transparent);
              -webkit-mask-image: linear-gradient(90deg, #000 calc(100% - 14px), transparent);
            }
            .rapports-metiers::-webkit-scrollbar { display: none; }
            .rapports-filterbar__label { order: 1; }
            .rapports-filterbar__divider { display: none; }
            .rapports-dropdowns { order: 3; width: 100%; }
          }

          /* Mobile (≤600px) — drop the "Filtrer" eyebrow, stretch dropdowns so
             three side-by-side don't overflow at 320px (≈98px each + gap). */
          @media (max-width: 600px) {
            .rapports-filterbar__label { display: none; }
            .rapports-dropdowns { gap: 0.35rem; }
            .rapport-dropdown { flex: 1 1 30%; min-width: 0; }
            .rapport-filter-btn { width: 100%; justify-content: space-between; }
            .rapport-metier-pill { width: auto; justify-content: center; }
          }

          /* Touch target floor (≥44px) on mobile per Apple HIG / WCAG. */
          @media (max-width: 720px) {
            .rapport-filter-btn,
            .rapport-search-input {
              min-height: 44px;
            }
            .rapport-search-input {
              font-size: 16px;
            }
          }
          @media (hover: none) {
            .rapport-filter-btn { min-height: 44px; }
          }
        `}</style>
      </main>
      </div>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onOpenModal={() => {}}
        onLogout={async () => { const { supabase } = await import("@/lib/supabase"); await supabase.auth.signOut(); router.replace("/login"); }}
      />

      <FloatingDock />
    </div>
  );
}
