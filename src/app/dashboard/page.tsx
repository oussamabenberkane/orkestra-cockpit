"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, Circle } from "lucide-react";
import type { ModalKey } from "@/lib/types";
import { Sidebar } from "@/components/dashboard/Sidebar";
import DashboardModal from "@/components/dashboard/DashboardModal";
import { HeroPanel } from "@/components/dashboard/HeroPanel";
import { SatelliteKPI } from "@/components/dashboard/SatelliteKPI";
import { TroisChoses } from "@/components/dashboard/TroisChoses";
import { TileCard } from "@/components/dashboard/TileCard";
import { FloatingDock } from "@/components/dashboard/FloatingDock";
import { CommandPalette } from "@/components/shared/CommandPalette";
import {
  heroByPeriod,
  satellites,
  troisItems,
  tiles,
  sourceBadges,
  type Period,
} from "@/lib/dashboard-mock";

const SIDEBAR_KEY = "orkestra.sidebar.collapsed";

export default function DashboardPage() {
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

  const onOpen   = (k: ModalKey) => setModalKey(k);
  const onClose  = () => setModalKey(null);
  /** Smart CTA defaults — modals with a related route navigate; others just close. */
  const handleModalAction = (k: ModalKey) => {
    if (k === "rapport" || k === "vue360") router.push("/rapports");
  };
  // Use replace so the back button cannot return to the (now logged-out) dashboard.
  const onLogout = () => router.replace("/login");

  const hero = heroByPeriod[period];

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
          padding: "clamp(1.75rem, 3vw, 2.5rem) clamp(1.25rem, 3vw, 2.5rem) 3rem",
          maxWidth: "1240px",
          marginInline: "auto",
          width: "100%",
        }}
      >
        {/* Greeting row */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "0.75rem",
            rowGap: "0.4rem",
            flexWrap: "wrap",
            marginBottom: "0.85rem",
          }}>
            <h1 style={{
              fontSize: "clamp(1.15rem, 2.6vw, 1.7rem)",
              fontWeight: 700,
              letterSpacing: "-0.025em",
              color: "var(--text)",
              margin: 0,
              whiteSpace: "nowrap",
            }}>Bonjour Thomas</h1>
            <span style={{
              display: "inline-flex", alignItems: "center",
              gap: "0.35rem",
              fontSize: "clamp(0.66rem, 1.6vw, 0.72rem)",
              fontWeight: 600,
              color: "var(--text-3)",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}>
              <Calendar size={11} strokeWidth={2.25} />
              Mardi 12 mai 2026 · semaine 19
            </span>
          </div>
          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.4rem",
            flexWrap: "wrap",
            marginBottom: "1.25rem",
          }}>
            {sourceBadges.map((b) => (
              <SourceBadge key={b.label} dot={b.dot} label={b.label} />
            ))}
          </div>

          {/* Hero + 3 satellites */}
          <div className="dashboard-hero">
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
            <div style={{
              display: "grid",
              gridTemplateRows: "repeat(3, 1fr)",
              gap: "0.85rem",
            }}>
              {satellites.map((s) => (
                <SatelliteKPI key={s.label} kpi={s} onOpen={onOpen} />
              ))}
            </div>
          </div>
        </motion.section>

        {/* Trois choses */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.5 }}
          style={{ marginTop: "clamp(1.5rem, 3vw, 2.25rem)" }}
        >
          <TroisChoses items={troisItems} onOpen={onOpen} />
        </motion.section>

        {/* Domain tiles */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.5 }}
          style={{ marginTop: "clamp(1.5rem, 3vw, 2.25rem)" }}
        >
          <SectionHeader
            title="Domaines"
            subtitle="Six tableaux opérationnels — cliquez pour ouvrir."
          />
          <div className="dashboard-tiles" style={{ marginTop: "0.85rem" }}>
            {tiles.map((t) => (
              <TileCard key={t.title} tile={t} onOpen={onOpen} />
            ))}
          </div>
        </motion.section>

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

function SourceBadge({ dot, label }: { dot: string; label: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      gap: "0.3rem",
      fontSize: "clamp(0.68rem, 1.7vw, 0.74rem)",
      fontWeight: 500,
      color: "var(--text-2)",
      background: "var(--surface)",
      padding: "0.3rem 0.55rem",
      borderRadius: "100px",
      boxShadow: "var(--tier-1)",
      whiteSpace: "nowrap",
    }}>
      <Circle size={5} strokeWidth={0} fill={dot} />
      {label}
    </span>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: "0.85rem" }}>
      <h2 style={{
        fontSize: "clamp(0.95rem, 2.2vw, 1.1rem)",
        fontWeight: 700,
        color: "var(--text)",
        letterSpacing: "-0.02em",
        margin: 0,
      }}>{title}</h2>
      {subtitle && (
        <p style={{
          fontSize: "clamp(0.76rem, 1.9vw, 0.84rem)",
          color: "var(--text-3)",
          margin: 0,
          marginTop: "0.15rem",
          lineHeight: 1.45,
        }}>{subtitle}</p>
      )}
    </div>
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
