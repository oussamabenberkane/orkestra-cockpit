/**
 * Dashboard mock data — typed, backend-ready, period-aware.
 *
 * Why this file exists:
 *   - Until /api/dashboard (or an equivalent server adapter) lands, all
 *     dashboard figures live here. Components stay pure-UI; the page just
 *     composes them with this data.
 *   - When the real API arrives, replace the `*` exports below with a thin
 *     fetcher (or a server-component data loader) that returns the same
 *     shapes. No component needs to change.
 *
 * Conventions:
 *   - Anything component-specific (Icon, modalKey, alert tone, sources)
 *     stays in the shape so the page is the only place that picks defaults.
 *   - Hero data is keyed by period so the M/T/A toggle is a pure data swap.
 */

import {
  Target, FolderArchive, Flame, Wallet, Globe, Sparkles,
  Percent, Users, Mail, AlertCircle, FileText,
} from "lucide-react";
import type { HeroEvent } from "@/components/dashboard/HeroPanel";
import type { Satellite } from "@/components/dashboard/SatelliteKPI";
import type { TroisItem } from "@/components/dashboard/TroisChoses";
import type { TileEntry } from "@/components/dashboard/TileCard";

export type Period = "M" | "T" | "A";

/** Top-line hero block. Shape mirrors HeroPanelProps minus the controlled period+onChange. */
export interface HeroDataset {
  title: string;
  combinedBadge: boolean;
  value: string;
  unit: string;
  yoyLabel?: string;
  data: number[];
  months: string[];
  events: HeroEvent[];
}

/**
 * One dataset per period toggle. The chart resolution + headline both shift:
 *   - M (mois)        — 12 monthly points
 *   - T (trimestres)  — 4 quarterly points
 *   - A (années)      — 3 yearly points
 *
 * Numbers are illustrative — the demo's narrative is "CA growing +12% YoY".
 */
export const heroByPeriod: Record<Period, HeroDataset> = {
  M: {
    title: "Chiffre d'affaires",
    combinedBadge: true,
    value: "92 400",
    unit: "CHF",
    yoyLabel: "+12.0% YoY",
    data:    [62, 64, 70, 68, 72, 78, 80, 82, 86, 88, 92, 92],
    months:  ["juin", "juil.", "août", "sept.", "oct.", "nov.", "déc.", "janv.", "févr.", "mars", "avril", "mai"],
    events: [
      { i: 6, label: "+9 200 CHF", sub: "Commission Dubois SA · décembre" },
      { i: 9, label: "−1 800 CHF", sub: "Impayé Rossi SA détecté · mars"  },
    ],
  },
  T: {
    title: "Chiffre d'affaires",
    combinedBadge: true,
    value: "272 K",
    unit: "CHF",
    yoyLabel: "+14.3% YoY",
    data:    [196, 220, 248, 272],
    months:  ["T2'25", "T3'25", "T4'25", "T1'26"],
    events: [
      { i: 2, label: "T4 record",      sub: "Renouvellements automne 2025"   },
      { i: 3, label: "Pipeline + 18%", sub: "12 prospects actifs en T1'26"   },
    ],
  },
  A: {
    title: "Chiffre d'affaires",
    combinedBadge: true,
    value: "1.08 M",
    unit: "CHF",
    yoyLabel: "+17.4% sur 3 ans",
    data:    [800, 920, 1080],
    months:  ["2024", "2025", "2026 (en cours)"],
    events: [
      { i: 1, label: "Acquisition Audemars", sub: "Portefeuille +28 contrats · 2025" },
    ],
  },
};

/** Three satellite KPIs (Marge / Cash-flow / Rétention). Stable across periods for now. */
export const satellites: Satellite[] = [
  {
    label: "Marge nette", value: "68", unit: "%", trend: "+4 pt",
    spark: [55, 58, 60, 62, 63, 64, 64, 66, 67, 67, 68, 68],
    combined: true,
    breakdown: [
      { src: "Primes BS",    val: "85.0 K" },
      { src: "Charges Odoo", val: "27.2 K" },
      { src: "⊕ Marge",      val: "68 %" },
    ],
    Icon: Percent, target: "Obj. 70 %", sparkTarget: 70, modalKey: "finance",
  },
  {
    label: "Cash-flow", value: "+18", unit: "K", trend: "stable",
    spark: [4, 6, 8, 7, 10, 12, 11, 14, 15, 16, 17, 18],
    combined: true,
    breakdown: [
      { src: "Encaissé", val: "+45.6 K" },
      { src: "Sortant",  val: "−27.2 K" },
      { src: "⊕ Net",    val: "+18.4 K" },
    ],
    Icon: Wallet, target: "Obj. +20 K", sparkTarget: 20, modalKey: "finance",
  },
  {
    label: "Rétention", value: "87", unit: "%", trend: "+3 pt",
    spark: [81, 82, 83, 83, 84, 85, 85, 86, 86, 87, 87, 87],
    combined: false,
    breakdown: [
      { src: "Renouvelés", val: "12" },
      { src: "Pertes 12m", val: "−4" },
      { src: "Solde",      val: "+8" },
    ],
    Icon: Users, target: "Obj. 90 %", sparkTarget: 90, modalKey: "portefeuille",
  },
];

/** Morning checklist — three priority actions for the operator. */
export const troisItems: TroisItem[] = [
  {
    Icon: Mail,
    color: "var(--info)", bg: "var(--info-tint)",
    sentence: "Valider 4 renouvellements préparés par l'agent BrokerStar.",
    cta: "Valider",
  },
  {
    Icon: AlertCircle,
    color: "var(--warn)", bg: "var(--warn-tint)",
    sentence: "Relancer Rossi SA pour son impayé de 1 800 CHF (67 jours).",
    cta: "Ouvrir",
    modalKey: "finance",
  },
  {
    Icon: FileText,
    color: "var(--accent)", bg: "var(--accent-tint)",
    sentence: "Signer le rapport mensuel combiné BrokerStar + Odoo.",
    cta: "Signer",
    modalKey: "rapport",
  },
];

/** Six domain tiles. Each tile opens its corresponding DashboardModal. */
export const tiles: TileEntry[] = [
  {
    Icon: Target, iconColor: "var(--accent)", iconBg: "var(--accent-tint)",
    glowColor: "rgba(0,122,255,0.18)",
    title: "Prospection", metric: "18", unit: "%",
    caption: "Taux de conversion · 12 prospects actifs",
    alert: "3 relances dues", alertTone: "warn",
    sources: ["BrokerStar"], modalKey: "prospection",
    spark: [10, 12, 11, 14, 14, 15, 16, 17, 17, 18, 18, 18],
  },
  {
    Icon: FolderArchive, iconColor: "var(--info)", iconBg: "var(--info-tint)",
    glowColor: "rgba(0,122,255,0.18)",
    title: "Portefeuille", metric: "189", unit: "",
    caption: "Contrats actifs · 85 K CHF de primes",
    alert: "4 renouv. J-30", alertTone: "neutral",
    sources: ["BrokerStar"], modalKey: "portefeuille",
    spark: [182, 183, 184, 184, 185, 186, 186, 187, 188, 188, 189, 189],
  },
  {
    Icon: Flame, iconColor: "var(--danger)", iconBg: "var(--danger-tint)",
    glowColor: "rgba(255,59,48,0.22)",
    title: "Sinistres", metric: "3", unit: "",
    caption: "Dossiers ouverts · ratio 12 % CA",
    alert: "SIN-0047 · 68 j", alertTone: "danger",
    sources: ["BrokerStar"], modalKey: "sinistres",
  },
  {
    Icon: Wallet, iconColor: "var(--warn)", iconBg: "var(--warn-tint)",
    glowColor: "rgba(255,159,10,0.22)",
    title: "Finance", metric: "+18", unit: "K",
    caption: "Cash-flow net · commissions 11.2 K",
    alert: "2 impayés", alertTone: "warn",
    sources: ["BrokerStar", "Odoo"], modalKey: "finance",
    spark: [4, 6, 8, 7, 10, 12, 11, 14, 15, 16, 17, 18],
  },
  {
    Icon: Globe, iconColor: "var(--accent)", iconBg: "var(--accent-tint)",
    glowColor: "rgba(0,122,255,0.18)",
    title: "Vue d'ensemble", metric: "68", unit: "%",
    caption: "Marge consolidée · vision combinée",
    alert: "+4 pt vs marché CH", alertTone: "good",
    sources: ["BrokerStar", "Odoo"], modalKey: "vue360",
    spark: [55, 58, 60, 62, 63, 64, 64, 66, 67, 67, 68, 68],
  },
  {
    Icon: Sparkles, iconColor: "var(--accent)", iconBg: "var(--accent-tint)",
    glowColor: "rgba(0,122,255,0.18)",
    title: "Agents IA", metric: "3", unit: "",
    caption: "Actions préparées · prêtes à valider",
    alert: "Validation requise", alertTone: "neutral",
    sources: ["BrokerStar", "Odoo"], modalKey: "agents",
  },
];

/** Source badges shown next to the greeting row. */
export const sourceBadges: Array<{ dot: string; label: string }> = [
  { dot: "var(--info)",   label: "BrokerStar · 3 min" },
  { dot: "var(--accent)", label: "Odoo · 5 min" },
];
