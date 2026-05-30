"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown, ArrowUp, ArrowRight, Circle, Minus, Mail, AlertCircle, FileText,
  ShieldAlert, RefreshCw, Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { ModalKey, ModalData } from "@/lib/types";
import { Sidebar } from "@/components/dashboard/Sidebar";
import DashboardModal from "@/components/dashboard/DashboardModal";
import { FloatingDock } from "@/components/dashboard/FloatingDock";
import { CommandPalette } from "@/components/shared/CommandPalette";
import { HeroPanel } from "@/components/dashboard/HeroPanel";
import { SatelliteKPI, type Satellite } from "@/components/dashboard/SatelliteKPI";
import { TroisChoses, type TroisItem } from "@/components/dashboard/TroisChoses";
import { TileCard, type TileEntry } from "@/components/dashboard/TileCard";
import {
  satellites as mockSatellites,
  troisItems as mockTroisItems,
  tiles,
  type Period,
  type HeroDataset,
} from "@/lib/dashboard-mock";
import type { SatelliteValues, AgentTaskRow, TileMetrics } from "@/lib/dashboard-data";
import { Percent, Wallet, Users } from "lucide-react";
import { useWorkspace } from "@/lib/workspaces";
import { WorkspaceTabs } from "@/components/dashboard/WorkspaceTabs";

const SIDEBAR_KEY = "orkestra.sidebar.collapsed";

// ── Icon/color maps for task types ───────────────────────────────────────────

const TASK_ICON_MAP: Record<string, LucideIcon> = {
  renouvellement: Mail,
  impayé:         AlertCircle,
  rapport:        FileText,
  prospection:    Mail,
  sinistre:       AlertCircle,
  alerte:         AlertCircle,
};
const TASK_COLOR_MAP: Record<string, string> = {
  renouvellement: "var(--info)",
  impayé:         "var(--warn)",
  rapport:        "var(--accent)",
  prospection:    "var(--info)",
  sinistre:       "var(--danger)",
  alerte:         "var(--warn)",
};
const TASK_BG_MAP: Record<string, string> = {
  renouvellement: "var(--info-tint)",
  impayé:         "var(--warn-tint)",
  rapport:        "var(--accent-tint)",
  prospection:    "var(--info-tint)",
  sinistre:       "var(--danger-tint)",
  alerte:         "var(--warn-tint)",
};
const TASK_CTA_MAP: Record<string, string> = {
  renouvellement: "Valider",
  impayé:         "Ouvrir",
  rapport:        "Signer",
  prospection:    "Voir",
  sinistre:       "Ouvrir",
  alerte:         "Voir",
};

function taskRowToTroisItem(row: AgentTaskRow): TroisItem {
  return {
    Icon:     TASK_ICON_MAP[row.type]    ?? FileText,
    color:    TASK_COLOR_MAP[row.type]   ?? "var(--text-3)",
    bg:       TASK_BG_MAP[row.type]      ?? "var(--surface-2)",
    sentence: row.titre,
    cta:      TASK_CTA_MAP[row.type]     ?? "Voir",
    modalKey: (row.modal_key as ModalKey) ?? undefined,
  };
}

// ── Satellite merge: overlay DB values onto mock structure ───────────────────

function mergeSatellites(vals: SatelliteValues | null): Satellite[] {
  if (!vals) return mockSatellites;
  const margeVal   = vals.marge;
  const cashVal    = vals.cashflow;
  const retentVal  = vals.retention;
  const impayesVal = vals.impayes;

  return [
    {
      ...mockSatellites[0],
      value: String(Math.round(margeVal)),
      trend: "commission",
      spark: mockSatellites[0].spark,
      breakdown: [
        { src: "Primes BS",    val: "—" },
        { src: "Charges Odoo", val: "—" },
        { src: "⊕ Marge",      val: `${Math.round(margeVal)} %` },
      ],
      Icon: Percent,
    },
    {
      ...mockSatellites[1],
      value: cashVal >= 0 ? `+${cashVal}` : String(cashVal),
      trend: "stable",
      spark: mockSatellites[1].spark,
      breakdown: [
        { src: "Encaissé", val: "—" },
        { src: "Sortant",  val: "—" },
        { src: "⊕ Net",    val: `${cashVal >= 0 ? "+" : ""}${cashVal} K` },
      ],
      Icon: Wallet,
    },
    {
      ...mockSatellites[2],
      value: String(Math.round(retentVal)),
      trend: `${(retentVal - 84).toFixed(0)} pt`,
      spark: mockSatellites[2].spark,
      breakdown: [
        { src: "Renouvelés", val: "—" },
        { src: "Pertes 12m", val: "—" },
        { src: "⊕ Net",      val: `${impayesVal > 0 ? `${impayesVal} CHF impayés` : "—"}` },
      ],
      Icon: Users,
    },
  ];
}

// ── Live tile builder ─────────────────────────────────────────────────────────

function buildLiveTiles(metrics: TileMetrics): TileEntry[] {
  const live = [...tiles];
  const { prospection: p, portefeuille: po, sinistres: s, finance: f } = metrics;

  if (p) {
    live[0] = {
      ...tiles[0],
      metric: String(Math.round(p.taux_conversion_pct)),
      unit: "%",
      caption: `${p.total_prospects} prospects actifs`,
      alert: p.relances_dues > 0 ? `${p.relances_dues} relances dues` : "",
      alertTone: p.relances_dues > 0 ? "warn" : "neutral",
    };
  }
  if (po) {
    const primesK = Math.round(po.primes_totales / 1000);
    live[1] = {
      ...tiles[1],
      metric: String(po.contrats_actifs),
      unit: "",
      caption: `${primesK} K CHF de primes`,
      alert: `${po.renouvellements_j30} renouv. J-30`,
      alertTone: "neutral",
    };
  }
  if (s) {
    live[2] = {
      ...tiles[2],
      metric: String(s.dossiers_ouverts),
      unit: "",
      caption: `ratio ${Math.round(s.ratio_sinistralite_pct)}% CA`,
      alert: s.sinistre_urgent_ref ? `${s.sinistre_urgent_ref} · ${s.plus_ancien_jours} j` : "",
      alertTone: "danger",
    };
  }
  if (f) {
    const encaisseK = Math.round(f.encaisse_mois / 1000);
    const commissionsK = Math.round(f.commissions_actives / 1000);
    live[3] = {
      ...tiles[3],
      metric: encaisseK >= 0 ? `+${encaisseK}` : String(encaisseK),
      unit: "K",
      caption: `commissions ${commissionsK} K`,
      alert: f.nb_impayes > 0 ? `${f.nb_impayes} impayés` : "",
      alertTone: f.nb_impayes > 0 ? "warn" : "neutral",
    };
  }
  return live;
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface DashboardClientProps {
  initialHero: Record<Period, HeroDataset>;
  satelliteValues: SatelliteValues | null;
  agentTaskRows: AgentTaskRow[];
  tileMetrics: TileMetrics | null;
  modalData: Record<ModalKey, ModalData>;
  unreadCount: number;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DashboardClient({
  initialHero,
  satelliteValues,
  agentTaskRows,
  tileMetrics,
  modalData,
  unreadCount,
}: DashboardClientProps) {
  const router = useRouter();
  const { workspace, shape: workspaceShape } = useWorkspace();
  const [modalKey, setModalKey] = useState<ModalKey | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [period, setPeriod] = useState<Period>("M");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_KEY);
      if (stored === "true") setCollapsed(true);
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

  const onOpen  = (k: ModalKey) => setModalKey(k);
  const onClose = () => setModalKey(null);
  const handleModalAction = (k: ModalKey) => {
    if (k === "rapport" || k === "vue360" || k === "commodity:vue360") router.push("/rapports");
  };
  const onLogout = async () => {
    const { supabase } = await import("@/lib/supabase");
    await supabase.auth.signOut();
    router.replace("/login");
  };

  /* Broker uses live Supabase values overlaid on mocks; commodity is pure
   * mock for now (no upstream data yet). The chrome (Sidebar, FloatingDock,
   * CommandPalette, modal) stays identical so switching the workspace tab
   * is a clean in-place data swap. */
  const isCommodity = workspace === "commodity";
  const hero = isCommodity ? workspaceShape.heroByPeriod[period] : initialHero[period];

  const satellites = useMemo(
    () => isCommodity ? workspaceShape.satellites : mergeSatellites(satelliteValues),
    [isCommodity, workspaceShape, satelliteValues],
  );
  const troisItems = useMemo(
    () => {
      if (isCommodity) return workspaceShape.troisItems;
      return agentTaskRows.length > 0 ? agentTaskRows.map(taskRowToTroisItem) : mockTroisItems;
    },
    [isCommodity, workspaceShape, agentTaskRows],
  );
  const liveTiles = useMemo(
    () => {
      if (isCommodity) return workspaceShape.tiles;
      return tileMetrics ? buildLiveTiles(tileMetrics) : tiles;
    },
    [isCommodity, workspaceShape, tileMetrics],
  );
  const sourceBadges = workspaceShape.sourceBadges;

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
        onLogout={onLogout}
        onOpenPalette={() => setPaletteOpen(true)}
        onOpenModal={onOpen}
        serverUnreadCount={unreadCount}
      />

      <main
        className="app-main"
        style={{
          flex: 1,
          minWidth: 0,
          padding: "clamp(1.25rem, 3vw, 2.5rem) clamp(1rem, 3vw, 2.5rem) 3rem",
          maxWidth: "1240px",
          marginInline: "auto",
          width: "100%",
        }}
      >
        <WorkspaceTabs />
        <header className="dash-section" style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "clamp(0.6rem, 2vw, 1rem)",
          flexWrap: "wrap",
          rowGap: "0.6rem",
          marginBottom: "clamp(1rem, 2.5vw, 1.4rem)",
          paddingBottom: "clamp(0.85rem, 2vw, 1rem)",
          borderBottom: "1px solid var(--border)",
        }}>
          <div style={{
            display: "flex",
            alignItems: "baseline",
            gap: "0.5rem",
            flexWrap: "wrap",
            rowGap: "0.15rem",
            minWidth: 0,
          }}>
            <h1 style={{
              fontSize: "clamp(1.1rem, 3.6vw, 1.45rem)",
              fontWeight: 700,
              letterSpacing: "-0.025em",
              color: "var(--text)",
              margin: 0,
              lineHeight: 1.15,
            }}>Bonjour Mirko</h1>
            <span style={{
              fontSize: "clamp(0.7rem, 1.8vw, 0.78rem)",
              color: "var(--text-3)",
            }}>· 12 mai 2026 · semaine 19</span>
          </div>
          <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
            {sourceBadges.map((b) => (
              <span key={b.label} style={{
                display: "inline-flex", alignItems: "center",
                gap: "0.3rem",
                fontSize: "clamp(0.68rem, 1.7vw, 0.72rem)",
                color: "var(--text-2)",
                background: "var(--surface-2)",
                padding: "0.28rem 0.55rem",
                borderRadius: "100px",
                whiteSpace: "nowrap",
              }}>
                <Circle size={5} strokeWidth={0} fill={b.dot} />
                {b.label}
              </span>
            ))}
          </div>
        </header>

        <div className="dashboard-action-banner" style={{
          position: "relative",
          background: "var(--accent)",
          borderRadius: 14,
          padding: "clamp(0.95rem, 2.5vw, 1.35rem) clamp(1rem, 3vw, 1.5rem)",
          color: "#FFFFFF",
          marginBottom: "clamp(0.6rem, 1.5vw, 0.85rem)",
          boxShadow: "0 12px 30px -14px rgba(0,122,255,0.55)",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "clamp(0.75rem, 2vw, 1.25rem)",
          flexWrap: "wrap",
          rowGap: "0.85rem",
        }}>
          <div className="dashboard-action-banner__text" style={{
            minWidth: 0,
            flex: "1 1 16rem",
          }}>
            <div className="dashboard-action-banner__eyebrow" style={{
              fontFamily: "var(--font-mono)",
              fontSize: "clamp(0.6rem, 1.7vw, 0.66rem)",
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              opacity: 0.85,
              marginBottom: "0.4rem",
            }}>3 choses · aujourd&apos;hui</div>
            <h2 className="dashboard-action-banner__title" style={{
              fontSize: "clamp(1.05rem, 3vw, 1.4rem)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              margin: 0,
              lineHeight: 1.25,
            }}>{isCommodity ? "Roll. Couvrez. Validez." : "Validez. Relancez. Signez."}</h2>
          </div>
          <ActionCarousel
            actions={isCommodity ? [
              { label: "Roll des futures Brent",  Icon: RefreshCw,   run: () => onOpen("commodity:positions") },
              { label: "Ajuster la couverture",   Icon: ShieldAlert, run: () => onOpen("commodity:risk") },
              { label: "Approuver hedge WTI Q3",  Icon: FileText,    run: () => onOpen("commodity:agents") },
              { label: "Revoir Trafigura",        Icon: AlertCircle, run: () => onOpen("commodity:counterparties") },
            ] : [
              { label: "Signer le rapport direction", Icon: FileText,      run: () => router.push("/rapports") },
              { label: "Valider les renouvellements", Icon: RefreshCw,     run: () => onOpen("portefeuille") },
              { label: "Relancer les impayés",        Icon: AlertCircle,   run: () => onOpen("finance") },
              { label: "Traiter SIN-0047",            Icon: ShieldAlert,   run: () => onOpen("sinistres") },
            ]}
          />
        </div>

        <div className="dash-section" style={{ marginBottom: "clamp(1.5rem, 3.5vw, 2.25rem)" }}>
          <TroisChoses items={troisItems} onOpen={onOpen} />
        </div>

        <div className="dashboard-hero dash-section" style={{ marginBottom: "clamp(1.5rem, 3.5vw, 2.25rem)" }}>
          <HeroPanel
            title={hero.title}
            combinedBadge={hero.combinedBadge}
            value={hero.value}
            unit={hero.unit}
            yoyLabel={hero.yoyLabel}
            data={hero.data}
            months={hero.months}
            events={hero.events}
            period={period}
            onPeriodChange={setPeriod}
          />
          <div className="dashboard-kpis-stack chart-desktop-only">
            {satellites.map((s) => (
              <KpiWithAsk key={s.label} label={s.label}>
                <SatelliteKPI kpi={s} onOpen={onOpen} />
              </KpiWithAsk>
            ))}
          </div>
          <div className="kpi-strip-compact">
            {satellites.map((s) => (
              <KpiWithAsk key={s.label} label={s.label}>
                <CompactStat kpi={s} onOpen={onOpen} />
              </KpiWithAsk>
            ))}
          </div>
        </div>

        <div style={{
          fontSize: "clamp(0.7rem, 1.8vw, 0.78rem)",
          fontWeight: 700,
          color: "var(--text-3)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          marginBottom: "clamp(0.6rem, 1.5vw, 0.85rem)",
        }}>Domaines</div>
        <div className="dashboard-tiles dashboard-tiles-desktop">
          {liveTiles.map((t) => (
            <TileCard key={t.title} tile={t} onOpen={onOpen} />
          ))}
        </div>
        <div className="dashboard-tiles-mobile" aria-hidden={false}>
          {liveTiles.map((t) => (
            <CubeTile key={t.title} tile={t} onOpen={onOpen} />
          ))}
        </div>

        <Footer
          syncLine={
            isCommodity
              ? "Sync Trayport 1 min · Murex 4 min"
              : "Sync BrokerStar 3 min · Odoo 5 min"
          }
          complianceLine={
            isCommodity ? "MiFID II Art.17 · Infomaniak CH" : "LPD Art.16 · Infomaniak CH"
          }
        />
      </main>

      <DashboardModal
        open={modalKey !== null}
        modalKey={modalKey}
        onClose={onClose}
        onAction={handleModalAction}
        modalData={modalData}
      />

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onOpenModal={onOpen}
        onLogout={onLogout}
      />

      <FloatingDock />
    </div>
  );
}

function CompactStat({ kpi, onOpen }: { kpi: Satellite; onOpen: (k: ModalKey) => void }) {
  const t = kpi.trend.trim();
  const dir = t.startsWith("+")
    ? "up"
    : (t.startsWith("-") || t.startsWith("−"))
      ? "down"
      : "flat";
  const Icon = dir === "up" ? ArrowUp : dir === "down" ? ArrowDown : Minus;
  const color =
    dir === "up"     ? "var(--success)"
    : dir === "down" ? "var(--danger)"
    : "var(--text-3)";
  return (
    <button
      type="button"
      onClick={() => onOpen(kpi.modalKey)}
      className="kpi-compact"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem",
        padding: "0.6rem 0.6rem",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        boxShadow: "var(--tier-1)",
        cursor: "pointer",
        fontFamily: "inherit",
        color: "inherit",
        textAlign: "left",
        minHeight: 76,
        minWidth: 0,
      }}
    >
      <span style={{
        fontSize: "0.6rem",
        fontWeight: 500,
        color: "var(--text-3)",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        maxWidth: "100%",
      }}>{kpi.label}</span>
      <span style={{
        fontFamily: "var(--font-mono)",
        fontSize: "1.05rem",
        fontWeight: 700,
        color: "var(--text)",
        lineHeight: 1,
        fontVariantNumeric: "tabular-nums",
        letterSpacing: "-0.02em",
      }}>
        {kpi.value}
        {kpi.unit && (
          <span style={{
            fontSize: "0.58em",
            color: "var(--text-3)",
            marginLeft: 1,
            fontWeight: 500,
          }}>{kpi.unit}</span>
        )}
      </span>
      <span style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.15rem",
        fontSize: "0.62rem",
        fontWeight: 700,
        color,
        whiteSpace: "nowrap",
        maxWidth: "100%",
        minWidth: 0,
        overflow: "hidden",
      }}>
        <Icon size={10} strokeWidth={2.5} style={{ flexShrink: 0 }} />
        <span style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          minWidth: 0,
        }}>{kpi.trend}</span>
      </span>
    </button>
  );
}

function CubeTile({ tile, onOpen }: { tile: TileEntry; onOpen: (k: ModalKey) => void }) {
  const Icon = tile.Icon;
  return (
    <button
      onClick={() => onOpen(tile.modalKey)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "0.4rem",
        padding: "0.7rem 0.8rem 0.75rem",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        boxShadow: "var(--tier-1)",
        cursor: "pointer",
        fontFamily: "inherit",
        color: "inherit",
        textAlign: "left",
        minHeight: 96,
        width: "100%",
      }}
    >
      <span style={{
        width: 26, height: 26,
        background: tile.iconBg,
        color: tile.iconColor,
        borderRadius: 7,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon size={13} strokeWidth={2} />
      </span>
      <span style={{
        fontSize: "0.72rem",
        color: "var(--text-3)",
        fontWeight: 500,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        width: "100%",
      }}>{tile.title}</span>
      <span style={{
        fontFamily: "var(--font-mono)",
        fontSize: "1.2rem",
        fontWeight: 700,
        color: "var(--text)",
        fontVariantNumeric: "tabular-nums",
        letterSpacing: "-0.02em",
        lineHeight: 1,
      }}>
        {tile.metric}
        {tile.unit && (
          <span style={{
            fontSize: "0.55em",
            color: "var(--text-3)",
            marginLeft: 2,
            fontWeight: 500,
          }}>{tile.unit}</span>
        )}
      </span>
    </button>
  );
}

/** Per-KPI seed prompts. Matches the original "ask-chat" copy so the
 *  agent answers the same focused question for each metric. */
function kpiSeed(label: string): string {
  switch (label) {
    case "CA mensuel":
      return "Pourquoi le CA mensuel est-il à ce niveau ce mois ? Détaille la composition par compagnie partenaire.";
    case "Marge nette":
      return "D'où vient la marge nette ? Quels postes contribuent le plus ?";
    case "Cash-flow":
      return "Décompose le cash-flow net : encaissements vs sorties principales.";
    case "Rétention":
      return "Pourquoi la rétention est à ce niveau ? Quels contrats ont été résiliés récemment et chez quelles compagnies ?";
    default:
      return `Donne-moi une analyse rapide du KPI « ${label} ».`;
  }
}

/** Overlays a small "Ask AI" button on a KPI card. Clicking it opens the
 *  FloatingDock chat preview and auto-submits a KPI-specific seed prompt so
 *  the agent starts answering immediately. The KPI itself stays interactive —
 *  the ask button stops propagation so taps don't bubble to the card.
 *
 *  The wrapper is tagged with `.kpi-with-ask` so CSS can hide SatelliteKPI's
 *  decorative top-right arrow (which would otherwise sit under our button). */
function KpiWithAsk({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="kpi-with-ask" style={{ position: "relative" }}>
      {children}
      <button
        type="button"
        className="kpi-ask-btn"
        aria-label={`Demander à l'IA · ${label}`}
        title={`Demander à l'IA · ${label}`}
        onClick={(e) => {
          e.stopPropagation();
          window.dispatchEvent(
            new CustomEvent("orkestra:open-floating-dock", {
              detail: { seed: kpiSeed(label) },
            }),
          );
        }}
        onPointerDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          width: 28,
          height: 28,
          padding: 0,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--accent-tint)",
          color: "var(--accent)",
          border: "none",
          borderRadius: 8,
          boxShadow: "inset 0 0 0 1px var(--accent-tint-2)",
          cursor: "pointer",
          fontFamily: "inherit",
          transition: "transform 0.18s ease, background 0.18s ease",
          zIndex: 2,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--accent-tint-2)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "var(--accent-tint)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <Sparkles size={13} strokeWidth={2.25} aria-hidden="true" />
      </button>
    </div>
  );
}

/** Auto-cycling action button on the action-first banner.
 *  - Cycles through quick actions every 4.2s while idle.
 *  - Pauses while pointer is over the carousel or focus is inside.
 *  - Tapping the active button runs the current action.
 *  - Dots beneath the button show position and allow manual jumping. */
type CarouselAction = {
  label: string;
  Icon: LucideIcon;
  run: () => void;
};

const CAROUSEL_INTERVAL_MS = 4200;

function ActionCarousel({ actions }: { actions: CarouselAction[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [swipeDir, setSwipeDir] = useState<1 | -1>(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useRef(false);

  // Gesture state — held in refs so we don't re-render on every move.
  const touchRef = useRef<{ x: number; t: number } | null>(null);
  const wheelAccumRef = useRef(0);
  const wheelCooldownRef = useRef(false);

  const advance = (dir: 1 | -1) => {
    setSwipeDir(dir);
    setIndex((i) => (i + dir + actions.length) % actions.length);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    prefersReducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  useEffect(() => {
    if (paused || actions.length <= 1) return;
    const id = window.setInterval(() => {
      setSwipeDir(1);
      setIndex((i) => (i + 1) % actions.length);
    }, CAROUSEL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [paused, actions.length]);

  /* Trackpad / mouse-wheel horizontal scroll. Attached via native
   * addEventListener so we can use passive:false and preventDefault on
   * horizontal gestures only — vertical scroll keeps bubbling to the page. */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; // vertical → pass through
      e.preventDefault();
      if (wheelCooldownRef.current) return;
      wheelAccumRef.current += e.deltaX;
      if (Math.abs(wheelAccumRef.current) < 30) return;
      advance(wheelAccumRef.current > 0 ? 1 : -1);
      wheelAccumRef.current = 0;
      wheelCooldownRef.current = true;
      window.setTimeout(() => { wheelCooldownRef.current = false; }, 280);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
    // advance is stable enough — actions.length is captured via closure
    // each render; cooldown ref keeps single-fire behavior.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions.length]);

  /* Touch swipe — distinguishes tap (≤8px movement) from swipe (≥40px). */
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    touchRef.current = { x: e.touches[0].clientX, t: Date.now() };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchRef.current;
    touchRef.current = null;
    if (!start) return;
    const end = e.changedTouches[0];
    if (!end) return;
    const dx = end.clientX - start.x;
    const dt = Date.now() - start.t;
    if (dt > 600 || Math.abs(dx) < 40) return;
    advance(dx < 0 ? 1 : -1);
  };

  const current = actions[index];
  const Icon = current.Icon;
  const useMotion = !prefersReducedMotion.current;
  /* Slide in from the swipe direction so the label motion reads as
   * "the next card slid in from the right" / "previous slid in from left". */
  const enterX = useMotion ? swipeDir * 14 : 0;
  const exitX  = useMotion ? -swipeDir * 14 : 0;

  return (
    <div
      ref={containerRef}
      className="action-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        const next = e.relatedTarget as Node | null;
        if (!containerRef.current?.contains(next)) setPaused(false);
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: "0.55rem",
        flexShrink: 0,
        minWidth: 0,
        touchAction: "pan-y",
      }}
    >
      <button
        type="button"
        onClick={() => current.run()}
        aria-label={current.label}
        className="action-carousel__btn"
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          padding: "0 1.05rem",
          /* Fixed responsive size — width scales with viewport but stays
           * constant across action changes, so the button never reflows
           * its surroundings when the cycling label has a different length. */
          width: "clamp(240px, 26vw, 280px)",
          height: 44,
          background: "#FFFFFF",
          color: "var(--accent)",
          border: "none",
          borderRadius: 999,
          fontFamily: "inherit",
          fontSize: "0.86rem",
          fontWeight: 600,
          letterSpacing: "-0.005em",
          cursor: "pointer",
          /* Stronger, more deliberate elevation: subtle inset highlight,
           * 1px ring for separation against the blue field, soft ambient
           * shadow and a deeper key shadow for floatiness. */
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.9), inset 0 0 0 1px rgba(0,0,0,0.04), 0 2px 4px rgba(0,40,90,0.18), 0 12px 24px -10px rgba(0,40,90,0.38)",
          transition: "transform 0.22s ease, box-shadow 0.22s ease",
          overflow: "hidden",
          flexShrink: 0,
          userSelect: "none",
          WebkitTapHighlightColor: "transparent",
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = "translateY(0) scale(0.98)";
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = "translateY(-1px) scale(1)";
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow =
            "inset 0 1px 0 rgba(255,255,255,1), inset 0 0 0 1px rgba(0,0,0,0.05), 0 4px 6px rgba(0,40,90,0.20), 0 18px 36px -14px rgba(0,40,90,0.50)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0) scale(1)";
          e.currentTarget.style.boxShadow =
            "inset 0 1px 0 rgba(255,255,255,0.9), inset 0 0 0 1px rgba(0,0,0,0.04), 0 2px 4px rgba(0,40,90,0.18), 0 12px 24px -10px rgba(0,40,90,0.38)";
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={index}
            initial={useMotion ? { opacity: 0, x: enterX } : false}
            animate={useMotion ? { opacity: 1, x: 0 } : { opacity: 1 }}
            exit={useMotion ? { opacity: 0, x: exitX } : { opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            style={{
              /* 3-column grid: icon left, label centered in the middle
               * track, arrow right. Each column has a stable position so
               * the structure doesn't drift as the label changes length. */
              display: "grid",
              gridTemplateColumns: "auto minmax(0, 1fr) auto",
              alignItems: "center",
              gap: "0.6rem",
              width: "100%",
              minWidth: 0,
            }}
          >
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 24,
              height: 24,
              borderRadius: 7,
              background: "var(--accent-tint)",
              color: "var(--accent)",
              flexShrink: 0,
            }}>
              <Icon size={13} strokeWidth={2.25} aria-hidden="true" />
            </span>
            <span style={{
              textAlign: "center",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              minWidth: 0,
              letterSpacing: "-0.005em",
            }}>{current.label}</span>
            <ArrowRight
              size={14}
              strokeWidth={2.5}
              aria-hidden="true"
              style={{ flexShrink: 0, opacity: 0.55 }}
            />
          </motion.span>
        </AnimatePresence>
      </button>

      <div
        className="action-carousel__dots"
        role="tablist"
        aria-label="Sélection de l'action rapide"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.4rem",
          minHeight: 14,
        }}
      >
        {actions.map((a, i) => {
          const isActive = i === index;
          return (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`Action ${i + 1} sur ${actions.length} : ${a.label}`}
              onClick={() => setIndex(i)}
              className={`action-carousel__dot${isActive ? " is-active" : ""}`}
              style={{
                position: "relative",
                width: isActive ? 22 : 6,
                height: 6,
                padding: 0,
                background:
                  isActive ? "rgba(255,255,255,0.32)" : "rgba(255,255,255,0.42)",
                border: "none",
                borderRadius: 999,
                cursor: "pointer",
                transition: "width 0.28s cubic-bezier(0.22, 1, 0.36, 1), background 0.2s ease",
                overflow: "hidden",
              }}
            >
              {isActive && (
                <span
                  aria-hidden="true"
                  key={`progress-${index}-${paused ? "p" : "r"}`}
                  className="action-carousel__progress"
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "#FFFFFF",
                    transformOrigin: "left center",
                    transform: "scaleX(0)",
                    animation: paused
                      ? "none"
                      : `action-carousel-fill ${CAROUSEL_INTERVAL_MS}ms linear forwards`,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Footer({
  syncLine,
  complianceLine,
}: {
  syncLine: string;
  complianceLine: string;
}) {
  return (
    <footer style={{
      marginTop: "2.5rem",
      paddingTop: "1.25rem",
      borderTop: "1px solid var(--border)",
      display: "flex",
      justifyContent: "space-between",
      gap: "0.85rem",
      rowGap: "0.5rem",
      fontSize: "clamp(0.68rem, 1.6vw, 0.74rem)",
      color: "var(--text-3)",
      flexWrap: "wrap",
    }}>
      <span>© 2026 Helvebroker · Zürich</span>
      <span>{syncLine}</span>
      <span>{complianceLine}</span>
    </footer>
  );
}
