"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar, Circle,
  Target, FolderArchive, Flame, Wallet, Globe, Sparkles,
  Percent, Users, Mail, AlertCircle, FileText,
  type LucideIcon,
} from "lucide-react";
import type { ModalKey } from "@/lib/types";
import { Sidebar } from "@/components/dashboard/Sidebar";
import DashboardModal from "@/components/dashboard/DashboardModal";
import { HeroPanel, type HeroEvent } from "@/components/dashboard/HeroPanel";
import { SatelliteKPI, type Satellite } from "@/components/dashboard/SatelliteKPI";
import { TroisChoses, type TroisItem } from "@/components/dashboard/TroisChoses";
import { TileCard, type TileEntry } from "@/components/dashboard/TileCard";
import { CommandPalette } from "@/components/shared/CommandPalette";

const SIDEBAR_KEY = "orkestra.sidebar.collapsed";

// ── Data (hardcoded demo) ────────────────────────────────────────────────────
const heroData = [62, 64, 70, 68, 72, 78, 80, 82, 86, 88, 92, 92];
const heroMonths = ["juin", "juil.", "août", "sept.", "oct.", "nov.", "déc.", "janv.", "févr.", "mars", "avril", "mai"];
const heroEvents: HeroEvent[] = [
  { i: 6, label: "+9 200 CHF", sub: "Commission Dubois SA · décembre" },
  { i: 9, label: "−1 800 CHF", sub: "Impayé Rossi SA détecté · mars" },
];

const satellites: Satellite[] = [
  {
    label: "Marge nette", value: "68", unit: "%", trend: "+4 pt",
    spark: [55, 58, 60, 62, 63, 64, 64, 66, 67, 67, 68, 68],
    combined: true,
    breakdown: [
      { src: "Primes BS",     val: "85.0 K" },
      { src: "Charges Odoo",  val: "27.2 K" },
      { src: "⊕ Marge",       val: "68 %" },
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

const troisItems: TroisItem[] = [
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

const tiles: TileEntry[] = [
  {
    Icon: Target, iconColor: "var(--accent)", iconBg: "var(--accent-tint)",
    glowColor: "rgba(88,86,214,0.18)",
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
    glowColor: "rgba(88,86,214,0.18)",
    title: "Vue d'ensemble", metric: "68", unit: "%",
    caption: "Marge consolidée · vision combinée",
    alert: "+4 pt vs marché CH", alertTone: "good",
    sources: ["BrokerStar", "Odoo"], modalKey: "vue360",
    spark: [55, 58, 60, 62, 63, 64, 64, 66, 67, 67, 68, 68],
  },
  {
    Icon: Sparkles, iconColor: "var(--accent)", iconBg: "var(--accent-tint)",
    glowColor: "rgba(88,86,214,0.18)",
    title: "Agents IA", metric: "3", unit: "",
    caption: "Actions préparées · prêtes à valider",
    alert: "Validation requise", alertTone: "neutral",
    sources: ["BrokerStar", "Odoo"], modalKey: "agents",
  },
];

// ── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [modalKey, setModalKey] = useState<ModalKey | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [period, setPeriod] = useState<"M" | "T" | "A">("M");
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
  // Use replace so the back button cannot return to the (now logged-out) dashboard.
  const onLogout = () => router.replace("/login");

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
            alignItems: "flex-end",
            gap: "1rem",
            flexWrap: "wrap",
            marginBottom: "1.25rem",
          }}>
            <div>
              <span style={{
                display: "inline-flex", alignItems: "center",
                gap: "0.35rem",
                fontSize: "0.72rem", fontWeight: 600,
                color: "var(--text-3)",
                marginBottom: "0.3rem",
              }}>
                <Calendar size={11} strokeWidth={2.25} />
                Mardi 12 mai 2026 · semaine 19
              </span>
              <h1 style={{
                fontSize: "clamp(1.6rem, 3vw, 1.95rem)",
                fontWeight: 700,
                letterSpacing: "-0.025em",
                color: "var(--text)",
                margin: 0,
              }}>Bonjour Thomas</h1>
            </div>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              <SourceBadge dot="var(--info)"   label="BrokerStar · 3 min" />
              <SourceBadge dot="var(--accent)" label="Odoo · 5 min" />
            </div>
          </div>

          {/* Hero + 3 satellites */}
          <div className="dashboard-hero">
            <HeroPanel
              title="Chiffre d'affaires"
              combinedBadge
              value="92 400"
              unit="CHF"
              yoyLabel="+12.0% YoY"
              data={heroData}
              months={heroMonths}
              events={heroEvents}
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

      <DashboardModal open={modalKey !== null} modalKey={modalKey} onClose={onClose} />

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onOpenModal={onOpen}
        onLogout={onLogout}
      />
    </div>
  );
}

function SourceBadge({ dot, label }: { dot: string; label: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      gap: "0.3rem",
      fontSize: "0.74rem", fontWeight: 500,
      color: "var(--text-2)",
      background: "var(--surface)",
      padding: "0.3rem 0.55rem",
      borderRadius: "100px",
      boxShadow: "var(--tier-1)",
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
        fontSize: "1.1rem",
        fontWeight: 700,
        color: "var(--text)",
        letterSpacing: "-0.02em",
        margin: 0,
      }}>{title}</h2>
      {subtitle && (
        <p style={{
          fontSize: "0.84rem",
          color: "var(--text-3)",
          margin: 0,
          marginTop: "0.15rem",
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
      gap: "1rem",
      fontSize: "0.74rem",
      color: "var(--text-3)",
      flexWrap: "wrap",
    }}>
      <span>© 2026 Cabinet Müller &amp; Associés SA · Zürich</span>
      <span>Sync BrokerStar 3 min · Odoo 5 min</span>
      <span>LPD Art.16 · Infomaniak CH</span>
    </footer>
  );
}
