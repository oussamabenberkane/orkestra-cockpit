import {
  fetchHeroData,
  fetchSatelliteValues,
  fetchAgentTaskRows,
  fetchTileMetrics,
  fetchModalValues,
  fetchUnreadAlertesCount,
} from "@/lib/dashboard-data";
import { heroByPeriod } from "@/lib/dashboard-mock";
import { getModalData } from "@/lib/modal-data";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const [heroM, heroT, heroA, satelliteValues, agentTaskRows, tileMetrics, modalValues, unreadCount] =
    await Promise.all([
      fetchHeroData("M"),
      fetchHeroData("T"),
      fetchHeroData("A"),
      fetchSatelliteValues(),
      fetchAgentTaskRows(),
      fetchTileMetrics(),
      fetchModalValues(),
      fetchUnreadAlertesCount(),
    ]);

  // Fall back to mock data when DB views return empty (seed agents not yet run)
  const initialHero = {
    M: heroM.data.length > 0 ? heroM : heroByPeriod.M,
    T: heroT.data.length > 0 ? heroT : heroByPeriod.T,
    A: heroA.data.length > 0 ? heroA : heroByPeriod.A,
  };

  const liveModalData = getModalData(modalValues);

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
        {/* ─── Greeting strip ──────────────────────────────────────────
         * Single-line on desktop. Wraps cleanly on narrow widths so the
         * date suffix drops below the name, and source badges flow onto
         * their own row rather than being pushed off-screen. */}
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

        {/* ─── Action-first banner ──────────────────────────────────── */}
        <div className="dashboard-action-banner" style={{
          position: "relative",
          background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)",
          borderRadius: 14,
          padding: "clamp(0.95rem, 2.5vw, 1.35rem) clamp(1rem, 3vw, 1.5rem)",
          color: "#FFFFFF",
          marginBottom: "clamp(0.6rem, 1.5vw, 0.85rem)",
          boxShadow: "0 12px 30px -14px rgba(0,122,255,0.55)",
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

        {/* ─── Priorities (Action-first: above the hero) ───────────── */}
        <div className="dash-section" style={{ marginBottom: "clamp(1.5rem, 3.5vw, 2.25rem)" }}>
          <TroisChoses items={troisItems} onOpen={onOpen} />
        </div>

        {/* ─── Hero + satellite KPIs ───────────────────────────────────
         * Desktop (>1024px): hero side-by-side with the 3-up KPI column.
         * Mobile / tablet (≤1024px): hero on top, compact 3-up stat strip
         * below — small label, mono value, delta arrow. The KPI column
         * is hidden via CSS at this width; the strip is hidden above it. */}
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

        {/* ─── Domain tiles ─────────────────────────────────────────
         * Desktop / tablet: full-detail <TileCard> in a 3- → 2-col grid.
         * Mobile (≤640px): compact cube tiles only — icon + title + metric.
         * Both lists are rendered; CSS toggles visibility per viewport. */}
        <div style={{
          fontSize: "clamp(0.7rem, 1.8vw, 0.78rem)",
          fontWeight: 700,
          color: "var(--text-3)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          marginBottom: "clamp(0.6rem, 1.5vw, 0.85rem)",
        }}>Domaines</div>
        <div className="dashboard-tiles dashboard-tiles-desktop">
          {tiles.map((t) => (
            <TileCard key={t.title} tile={t} onOpen={onOpen} />
          ))}
        </div>
        <div className="dashboard-tiles-mobile" aria-hidden={false}>
          {tiles.map((t) => (
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
