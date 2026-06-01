"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown, ArrowUp, Circle, Minus, Mail, AlertCircle, FileText,
  Sparkles,
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
import {
  satellites as mockSatellites,
  troisItems as mockTroisItems,
  type Period,
  type HeroDataset,
} from "@/lib/dashboard-mock";
import type { SatelliteValues, AgentTaskRow } from "@/lib/dashboard-data";
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

// ── Props ─────────────────────────────────────────────────────────────────────

export interface DashboardClientProps {
  initialHero: Record<Period, HeroDataset>;
  satelliteValues: SatelliteValues | null;
  agentTaskRows: AgentTaskRow[];
  modalData: Record<ModalKey, ModalData>;
  unreadCount: number;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DashboardClient({
  initialHero,
  satelliteValues,
  agentTaskRows,
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

      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
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

        <main
          className="app-main"
          style={{
            minWidth: 0,
            padding: "0 clamp(1rem, 3vw, 2.5rem) 3rem",
            maxWidth: "1240px",
            marginInline: "auto",
            width: "100%",
          }}
        >
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

        <h2
          className="dash-section-heading"
          style={{
            fontSize: "clamp(1.05rem, 3vw, 1.4rem)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "var(--text)",
            margin: "0 0 clamp(0.85rem, 2vw, 1.1rem) 0",
            lineHeight: 1.2,
            textAlign: "left",
          }}
        >
          Tous vos indicateurs clés sur un seul écran
        </h2>

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

        <div className="dash-section" style={{ marginBottom: "clamp(1.5rem, 3.5vw, 2.25rem)" }}>
          <TroisChoses items={troisItems} onOpen={onOpen} />
        </div>

        <Footer
          syncLine={
            isCommodity
              ? "Sync Trayport 1 min · Murex 4 min"
              : "Sync Helvebroker SA 3 min · Odoo 5 min"
          }
          complianceLine={
            isCommodity ? "MiFID II Art.17 · Infomaniak CH" : "LPD Art.16 · Infomaniak CH"
          }
        />
        </main>
      </div>

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
