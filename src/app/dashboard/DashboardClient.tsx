"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Circle, Minus, Mail, AlertCircle, FileText, type LucideIcon } from "lucide-react";
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
  sourceBadges,
  type Period,
  type HeroDataset,
} from "@/lib/dashboard-mock";
import type { SatelliteValues, AgentTaskRow, TileMetrics } from "@/lib/dashboard-data";
import { Percent, Wallet, Users } from "lucide-react";

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
    if (k === "rapport" || k === "vue360") router.push("/rapports");
  };
  const onLogout = () => router.replace("/login");

  const hero = initialHero[period];

  const satellites = useMemo(() => mergeSatellites(satelliteValues), [satelliteValues]);
  const troisItems = useMemo(
    () => agentTaskRows.length > 0 ? agentTaskRows.map(taskRowToTroisItem) : mockTroisItems,
    [agentTaskRows],
  );
  const liveTiles = useMemo(
    () => tileMetrics ? buildLiveTiles(tileMetrics) : tiles,
    [tileMetrics],
  );

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
            }}>Bonjour Thomas</h1>
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
          background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)",
          borderRadius: 14,
          padding: "clamp(0.95rem, 2.5vw, 1.35rem) clamp(1rem, 3vw, 1.5rem)",
          color: "#FFFFFF",
          marginBottom: "clamp(0.6rem, 1.5vw, 0.85rem)",
          boxShadow: "0 12px 30px -14px rgba(88,86,214,0.55)",
          overflow: "hidden",
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
          }}>Validez. Relancez. Signez.</h2>
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
              <SatelliteKPI key={s.label} kpi={s} onOpen={onOpen} />
            ))}
          </div>
          <div className="kpi-strip-compact">
            {satellites.map((s) => (
              <CompactStat key={s.label} kpi={s} onOpen={onOpen} />
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

        <Footer />
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
      }}>
        <Icon size={10} strokeWidth={2.5} />
        {kpi.trend}
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

function Footer() {
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
      <span>© 2026 Cabinet Müller &amp; Associés SA · Zürich</span>
      <span>Sync BrokerStar 3 min · Odoo 5 min</span>
      <span>LPD Art.16 · Infomaniak CH</span>
    </footer>
  );
}
