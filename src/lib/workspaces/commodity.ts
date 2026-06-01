import {
  Home, ArrowLeftRight, Layers, Users, TrendingUp, Activity, Globe, Sparkles,
  MessageSquare, AlertTriangle, Settings, HelpCircle, FileText, AlertCircle,
} from "lucide-react";
import type { HeroDataset, Period } from "@/lib/dashboard-mock";
import type { Satellite } from "@/components/dashboard/SatelliteKPI";
import type { TroisItem } from "@/components/dashboard/TroisChoses";
import type { TileEntry } from "@/components/dashboard/TileCard";
import type { WorkspaceShape, SourceBadge } from "./types";

/** Commodity trading-desk parallel cockpit. Stub figures — the broker side
 *  pulls live Supabase values; commodity will too once the dataset exists. */

const commodityHeroByPeriod: Record<Period, HeroDataset> = {
  M: {
    title: "Exposition nette",
    combinedBadge: true,
    value: "4.2",
    unit: "M CHF",
    yoyLabel: "+8.3% MoM",
    data:    [3.4, 3.6, 3.8, 3.5, 3.7, 4.0, 4.1, 3.9, 4.0, 4.2, 4.1, 4.2],
    months:  ["juin", "juil.", "août", "sept.", "oct.", "nov.", "déc.", "janv.", "févr.", "mars", "avril", "mai"],
    events: [
      { i: 5, label: "+450 K CHF", sub: "Couverture WTI Q4 · novembre" },
      { i: 9, label: "−180 K CHF", sub: "Roll Brent expirant · mars" },
    ],
    distribution: [
      { label: "Brent",     value: 1.3 },
      { label: "WTI",       value: 1.1 },
      { label: "Gaz nat.",  value: 0.8 },
      { label: "Cuivre",    value: 0.6 },
      { label: "Or",        value: 0.4 },
    ],
  },
  T: {
    title: "Exposition nette",
    combinedBadge: true,
    value: "11.8",
    unit: "M CHF",
    yoyLabel: "+12.4% QoQ",
    data:    [8.6, 9.4, 10.7, 11.8],
    months:  ["T2'25", "T3'25", "T4'25", "T1'26"],
    events: [
      { i: 2, label: "T4 record", sub: "Volume notionnel +18%" },
      { i: 3, label: "Hedge +6 pt", sub: "Ratio remonté à 82%" },
    ],
    distribution: [
      { label: "Brent",     value: 3.6 },
      { label: "WTI",       value: 3.2 },
      { label: "Gaz nat.",  value: 2.4 },
      { label: "Cuivre",    value: 1.6 },
      { label: "Or",        value: 1.0 },
    ],
  },
  A: {
    title: "Exposition nette",
    combinedBadge: true,
    value: "42.1",
    unit: "M CHF",
    yoyLabel: "+22% sur 3 ans",
    data:    [28, 34, 42],
    months:  ["2024", "2025", "2026 (en cours)"],
    events: [
      { i: 1, label: "Désk énergie", sub: "Lancement bureau Genève · 2025" },
    ],
    distribution: [
      { label: "Brent",     value: 13.2 },
      { label: "WTI",       value: 11.4 },
      { label: "Gaz nat.",  value: 8.6 },
      { label: "Cuivre",    value: 5.5 },
      { label: "Or",        value: 3.4 },
    ],
  },
};

const commoditySatellites: Satellite[] = [
  {
    label: "P&L ouvert", value: "+312", unit: "K", trend: "+18 K",
    spark: [180, 220, 240, 260, 270, 285, 295, 300, 305, 310, 312, 312],
    combined: true,
    breakdown: [
      { src: "Trayport",    val: "+418 K" },
      { src: "Coûts roll",  val: "−106 K" },
      { src: "⊕ Net",       val: "+312 K" },
    ],
    Icon: TrendingUp, target: "Obj. +350 K", sparkTarget: 350,
    modalKey: "commodity:pnl",
    tone: "success",
  },
  {
    label: "Ratio couverture", value: "82", unit: "%", trend: "+3 pt",
    spark: [70, 72, 74, 75, 76, 78, 78, 80, 80, 81, 82, 82],
    combined: false,
    breakdown: [
      { src: "Positions ouvertes", val: "12" },
      { src: "Couvertes",          val: "10" },
      { src: "Ratio",              val: "82 %" },
    ],
    Icon: Layers, target: "Obj. 85 %", sparkTarget: 85,
    modalKey: "commodity:hedges",
    tone: "info",
  },
  {
    label: "VaR 1j (99%)", value: "184", unit: "K", trend: "stable",
    spark: [200, 195, 192, 188, 186, 184, 184, 185, 184, 185, 184, 184],
    combined: false,
    breakdown: [
      { src: "Énergie", val: "112 K" },
      { src: "Métaux",  val: "48 K" },
      { src: "Agri",    val: "24 K" },
    ],
    Icon: Activity, target: "Limite 250 K", sparkTarget: 250,
    modalKey: "commodity:risk",
    tone: "warn",
  },
];

const commodityTroisItems: TroisItem[] = [
  {
    Icon: AlertCircle,
    color: "var(--warn)", bg: "var(--warn-tint)",
    sentence: "Roll des futures Brent à J-3 — 4 contrats expirent vendredi.",
    cta: "Roll",
    modalKey: "commodity:positions",
  },
  {
    Icon: Activity,
    color: "var(--danger)", bg: "var(--danger-tint)",
    sentence: "Limite VaR énergie à 92% — ajuster la couverture WTI Q3.",
    cta: "Ajuster",
    modalKey: "commodity:risk",
  },
  {
    Icon: FileText,
    color: "var(--accent)", bg: "var(--accent-tint)",
    sentence: "Approuver le hedge proposé par l'agent sur lot WTI Q3.",
    cta: "Approuver",
    modalKey: "commodity:agents",
  },
];

const commodityTiles: TileEntry[] = [
  {
    Icon: ArrowLeftRight, iconColor: "var(--accent)", iconBg: "var(--accent-tint)",
    glowColor: "rgba(0,122,255,0.18)",
    title: "Positions", metric: "12", unit: "",
    caption: "Ouvertes · 8.4 M notionnel",
    alert: "3 livraisons J-15", alertTone: "warn",
    sources: ["Trayport"], modalKey: "commodity:positions",
    spark: [10, 11, 12, 11, 12, 13, 12, 12, 11, 12, 12, 12],
  },
  {
    Icon: Layers, iconColor: "var(--info)", iconBg: "var(--info-tint)",
    glowColor: "rgba(0,122,255,0.18)",
    title: "Couvertures", metric: "82", unit: "%",
    caption: "Ratio de couverture global",
    alert: "2 à renouveler", alertTone: "neutral",
    sources: ["Murex"], modalKey: "commodity:hedges",
    spark: [70, 72, 74, 75, 76, 78, 78, 80, 80, 81, 82, 82],
  },
  {
    Icon: Users, iconColor: "var(--warn)", iconBg: "var(--warn-tint)",
    glowColor: "rgba(255,159,10,0.22)",
    title: "Contreparties", metric: "24", unit: "",
    caption: "Actives · top 3 = 62% exposition",
    alert: "1 limite atteinte", alertTone: "warn",
    sources: ["Murex"], modalKey: "commodity:counterparties",
  },
  {
    Icon: TrendingUp, iconColor: "var(--success)", iconBg: "var(--success-tint)",
    glowColor: "rgba(52,199,89,0.22)",
    title: "P&L", metric: "+312", unit: "K",
    caption: "Mois en cours · YTD +2.1 M",
    alert: "Best week +180 K", alertTone: "good",
    sources: ["Trayport", "Murex"], modalKey: "commodity:pnl",
    spark: [180, 220, 240, 260, 270, 285, 295, 300, 305, 310, 312, 312],
  },
  {
    Icon: Globe, iconColor: "var(--accent)", iconBg: "var(--accent-tint)",
    glowColor: "rgba(0,122,255,0.18)",
    title: "Vue d'ensemble", metric: "82", unit: "%",
    caption: "Couverture · risque maîtrisé",
    alert: "VaR 1j · 184 K", alertTone: "neutral",
    sources: ["Trayport", "Murex"], modalKey: "commodity:vue360",
    spark: [70, 72, 74, 75, 76, 78, 78, 80, 80, 81, 82, 82],
  },
  {
    Icon: Sparkles, iconColor: "var(--accent)", iconBg: "var(--accent-tint)",
    glowColor: "rgba(0,122,255,0.18)",
    title: "Agents IA", metric: "2", unit: "",
    caption: "Hedge advisor · pricing alerts",
    alert: "Validation requise", alertTone: "neutral",
    sources: ["Trayport", "Murex"], modalKey: "commodity:agents",
  },
];

const commoditySourceBadges: SourceBadge[] = [
  { dot: "var(--info)",   label: "Trayport · 1 min" },
  { dot: "var(--accent)", label: "Murex · 4 min" },
];

export const commodityWorkspace: WorkspaceShape = {
  label: "Commodities",
  heroByPeriod: commodityHeroByPeriod,
  satellites: commoditySatellites,
  troisItems: commodityTroisItems,
  tiles: commodityTiles,
  sourceBadges: commoditySourceBadges,
  nav: [
    {
      title: "Espace",
      items: [
        { Icon: Home,          label: "Vue 360",           iconColor: "var(--nav-vue-ensemble)", href: "/dashboard" },
      ],
    },
    {
      title: "Trading",
      items: [
        { Icon: ArrowLeftRight, label: "Positions",         iconColor: "var(--nav-prospection)",  modalKey: "commodity:positions",      badge: "12", badgeTone: "neutral" },
        { Icon: Layers,         label: "Couvertures",       iconColor: "var(--nav-portefeuille)", modalKey: "commodity:hedges" },
        { Icon: Users,          label: "Contreparties",    iconColor: "var(--nav-finance)",      modalKey: "commodity:counterparties", badge: "1",  badgeTone: "warn" },
        { Icon: TrendingUp,     label: "P&L",               iconColor: "var(--nav-vue-ensemble)", modalKey: "commodity:pnl" },
        { Icon: Activity,       label: "Risque",            iconColor: "var(--nav-sinistres)",    modalKey: "commodity:risk",           badge: "92%", badgeTone: "danger" },
        { Icon: Globe,          label: "Tous les rapports", iconColor: "var(--nav-vue-ensemble)", href: "/rapports" },
      ],
    },
    {
      title: "Intelligence",
      items: [
        { Icon: MessageSquare, label: "Chat IA", iconColor: "var(--nav-chat)",    href: "/chat" },
        { Icon: AlertTriangle, label: "Alertes", iconColor: "var(--nav-alertes)", href: "/alertes" },
      ],
    },
    {
      title: "Administration",
      items: [
        { Icon: Settings,   label: "Paramètres", iconColor: "var(--nav-neutral)", href: "/parametres" },
        { Icon: HelpCircle, label: "Support",    iconColor: "var(--nav-neutral)", href: "/support" },
      ],
    },
  ],
};
