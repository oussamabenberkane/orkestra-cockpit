"use client";

import { useState, useEffect, useReducer } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Sparkles, Globe, ShieldCheck, ShieldAlert,
  Percent, Wallet, Users, Circle, Target, FolderArchive,
  Flame, MessageSquare, Mic, FileText, AlertCircle, Mail,
  Bot, Check, ChevronRight, Cpu, Database, FileSpreadsheet,
  Layers, Send, TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { SatelliteKPI, type Satellite } from "@/components/dashboard/SatelliteKPI";

// useReducedMotion reads a media query unavailable during SSR, so it returns
// false on the server and the real value on the client — a hydration mismatch
// for visitors with "reduce motion" enabled. Gate it behind a mounted flag so
// the first client render matches the server, then update after hydration.
function useReducedMotionSafe() {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? reduce : false;
}

// ── Preview data (mirrors the cockpit so the landing FEELS like the product) ──

const previewData = [62, 64, 70, 68, 72, 78, 80, 82, 86, 88, 92, 92];

const previewSatellites: Satellite[] = [
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
    tone: "success",
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
    tone: "accent",
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
    tone: "info",
  },
];

// Trois choses preview rows
const troisPreview = [
  { Icon: Mail,        color: "var(--info)",   bg: "var(--info-tint)",   text: "Valider 4 renouvellements préparés par l’agent Helvebroker SA.", cta: "Valider" },
  { Icon: AlertCircle, color: "var(--warn)",   bg: "var(--warn-tint)",   text: "Relancer Rossi SA pour son impayé de 1 800 CHF (67 jours).",   cta: "Ouvrir"  },
  { Icon: FileText,    color: "var(--accent)", bg: "var(--accent-tint)", text: "Signer le rapport mensuel combiné Helvebroker SA + Odoo.",         cta: "Signer"  },
];

// Mini-tile data for the mockup (6 cockpit domains)
type MiniTile = {
  Icon: LucideIcon; color: string; bg: string;
  title: string; metric: string; unit: string; caption: string;
  alert: string; alertTone: "warn" | "good" | "neutral" | "danger";
};
const miniTiles: MiniTile[] = [
  { Icon: Target,        color: "var(--accent)", bg: "var(--accent-tint)", title: "Prospection",   metric: "18",  unit: "%", caption: "Taux conv.",         alert: "3 relances",     alertTone: "warn" },
  { Icon: FolderArchive, color: "var(--info)",   bg: "var(--info-tint)",   title: "Portefeuille",  metric: "189", unit: "",  caption: "Contrats actifs",    alert: "4 renouv. J-30", alertTone: "neutral" },
  { Icon: Flame,         color: "var(--danger)", bg: "var(--danger-tint)", title: "Sinistres",     metric: "3",   unit: "",  caption: "Dossiers ouverts",   alert: "SIN-0047 · 68 j", alertTone: "danger" },
  { Icon: Wallet,        color: "var(--warn)",   bg: "var(--warn-tint)",   title: "Finance",       metric: "+18", unit: "K", caption: "Cash-flow net",      alert: "2 impayés",      alertTone: "warn" },
  { Icon: Globe,         color: "var(--accent)", bg: "var(--accent-tint)", title: "Vue 360°",      metric: "68",  unit: "%", caption: "Marge consolidée",   alert: "+4 pt vs marché",alertTone: "good" },
  { Icon: Sparkles,      color: "var(--purple)", bg: "var(--purple-tint)", title: "Agents IA",     metric: "3",   unit: "",  caption: "Actions préparées",  alert: "Prêtes à valider", alertTone: "neutral" },
];

// ─────────────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const router = useRouter();
  const [period, setPeriod] = useState<"M" | "T" | "A">("M");
  const goLogin = () => router.push("/login");

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--bg)",
        color: "var(--text)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <TopNav />
      <main style={{ flex: 1 }}>
        <Hero period={period} onPeriodChange={setPeriod} onCta={goLogin} />
        <AISection />
        <CalmChaosSection />
        <CtaBand />
      </main>
      <Footer />

      {/* Page-level CSS — mobile-first. Defaults target phone; @media (min-width)
       *  rules scale up to tablet and desktop. */}
      <style>{`
        /* ── Motion primitives ───────────────────────────────────────── */
        @keyframes hexDrift {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: var(--hex-op, 0.05); }
          50%      { transform: translateY(-10px) rotate(4deg); opacity: calc(var(--hex-op, 0.05) * 1.7); }
        }
        .hex-drift { animation: hexDrift 7s ease-in-out infinite; }

        @keyframes streamCursor {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0; }
        }
        .stream-cursor::after {
          content: "▍";
          display: inline-block;
          margin-left: 2px;
          color: var(--accent);
          animation: streamCursor 1.05s steps(2) infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .hex-drift { animation: none !important; }
          .stream-cursor::after { animation: none !important; }
        }

        /* ── Hero copy / CTAs (mobile defaults) ──────────────────────── */
        .landing-hero-inner { grid-template-columns: 1fr; text-align: center; }
        .landing-hero-cta   { flex-direction: column; align-items: stretch; gap: 0.5rem; justify-content: center; }
        .landing-hero-cta > * { width: 100%; justify-content: center; }
        .landing-hero-chips { justify-content: center; }
        @media (min-width: 520px) {
          .landing-hero-cta { flex-direction: row; align-items: center; }
          .landing-hero-cta > * { width: auto; }
        }

        /* CTA sizing — thinner on phone, slightly taller on tablet+ */
        .hero-cta-primary, .hero-cta-secondary {
          height: 40px; padding: 0 1rem;
          font-size: 0.88rem;
        }
        @media (min-width: 520px) {
          .hero-cta-primary, .hero-cta-secondary { height: 44px; padding: 0 1.15rem; font-size: 0.92rem; }
        }
        @media (min-width: 980px) {
          .hero-cta-primary, .hero-cta-secondary { height: 46px; padding: 0 1.25rem; font-size: 0.95rem; }
        }

        /* Compliance row — short on phone, full on tablet+ */
        .hero-compliance-full  { display: none; }
        .hero-compliance-short { display: inline; }
        @media (min-width: 640px) {
          .hero-compliance-full  { display: inline; }
          .hero-compliance-short { display: none; }
        }

        /* Section padding — mobile-first floors */
        .landing-section {
          padding-block: clamp(2.5rem, 6vw, 5.5rem);
          padding-inline: clamp(1rem, 3vw, 2.5rem);
          max-width: 1240px;
          margin-inline: auto;
        }

        /* ── Top nav anchor links ───────────────────────────────────── */
        .nav-anchor { display: none; }
        @media (min-width: 760px) { .nav-anchor { display: inline-flex; } }

        .ai-grid { display: grid; grid-template-columns: 1fr; gap: 1.25rem; align-items: stretch; }
        @media (min-width: 960px) { .ai-grid { grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr); gap: clamp(1.5rem, 3vw, 3rem); align-items: center; } }

        /* ── AI section copy + carousel ─────────────────────────────── */
        .ai-eyebrow {
          display: inline-flex; align-items: center; gap: 0.4rem;
          padding: 0.24rem 0.6rem;
          border-radius: 100px;
          background: var(--purple-tint);
          color: var(--purple);
          border: 1px solid color-mix(in srgb, var(--purple) 20%, transparent);
          font-family: var(--font-mono);
          font-size: 0.62rem; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          margin-bottom: 0.85rem;
        }
        .ai-title {
          font-size: clamp(1.4rem, 5.5vw, 2.3rem);
          font-weight: 700;
          letter-spacing: -0.028em;
          color: var(--text);
          margin: 0; line-height: 1.1;
          max-width: 20ch;
        }
        .ai-lede {
          margin: 0.75rem 0 0;
          font-size: clamp(0.92rem, 1.6vw, 1rem);
          line-height: 1.5;
          color: var(--text-2);
          max-width: 48ch;
        }

        .ai-carousel { margin-top: 1.1rem; }
        .ai-carousel-stage {
          position: relative;
          min-height: 78px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 0.7rem 0.85rem;
          box-shadow: var(--tier-1);
          overflow: hidden;
        }
        .ai-carousel-dots {
          display: flex; align-items: center; justify-content: center;
          gap: 0.4rem;
          margin-top: 0.7rem;
        }
        .ai-carousel-dot {
          appearance: none;
          width: 24px; height: 16px;
          padding: 6px 0;
          background: transparent;
          border: none;
          cursor: pointer;
          display: inline-flex; align-items: center; justify-content: center;
        }
        .ai-carousel-dot::before {
          content: "";
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--border-strong);
          transition: width 0.25s, background 0.25s, transform 0.25s;
        }
        .ai-carousel-dot.is-on::before {
          width: 18px;
          border-radius: 100px;
          background: var(--accent);
        }

        .ai-features-static {
          list-style: none; padding: 0; margin: 1.1rem 0 0;
          display: flex; flex-direction: column; gap: 0.6rem;
        }

        .ai-feature {
          display: flex; align-items: flex-start; gap: 0.7rem;
        }
        .ai-feature-icon {
          width: 30px; height: 30px; border-radius: 8px;
          background: var(--accent-tint);
          color: var(--accent);
          display: inline-flex; align-items: center; justify-content: center;
          border: 1px solid color-mix(in srgb, var(--accent) 18%, transparent);
          flex-shrink: 0;
          margin-top: 1px;
        }
        .ai-feature-text { min-width: 0; }
        .ai-feature-title {
          font-size: 0.88rem; font-weight: 600;
          color: var(--text);
          letter-spacing: -0.01em;
        }
        .ai-feature-body {
          font-size: 0.82rem;
          color: var(--text-3);
          line-height: 1.45;
        }

        .ai-cta-row {
          margin-top: 1.1rem;
          display: flex; gap: 0.55rem;
          flex-wrap: wrap; align-items: center;
        }
        .ai-cta-primary {
          display: inline-flex; align-items: center; gap: 0.4rem;
          height: 40px; padding: 0 1rem;
          background: var(--text);
          color: var(--surface);
          font-family: inherit;
          font-size: 0.86rem; font-weight: 600;
          border-radius: 10px;
          text-decoration: none;
          transition: transform 0.22s ease, opacity 0.22s ease;
        }
        .ai-cta-primary:hover { transform: translateY(-1px); opacity: 0.92; }
        .ai-cta-note {
          display: inline-flex; align-items: center; gap: 0.35rem;
          font-family: var(--font-mono);
          font-size: 0.66rem; font-weight: 600;
          color: var(--text-3);
          letter-spacing: 0.04em;
        }

        /* ── Chat mockup mobile/desktop swap ─────────────────────────── */
        /* Tool chip + result cards: desktop only */
        .chat-tool-chip { display: none; }
        .chat-results { display: none; }
        @media (min-width: 640px) {
          .chat-tool-chip {
            align-self: flex-start;
            display: inline-flex; align-items: center; gap: 0.45rem;
            padding: 0.4rem 0.6rem;
            background: var(--surface-2);
            border: 1px solid var(--border);
            border-radius: 10px;
            font-family: var(--font-mono);
            font-size: 0.7rem;
            color: var(--text-2);
          }
          .chat-results {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.5rem;
            margin-top: 0.3rem;
          }
        }

        /* Assistant reply — compact summary stats on mobile, prose on desktop */
        .chat-reply-mobile {
          display: flex; flex-direction: column;
          gap: 0.35rem;
        }
        .chat-reply-desktop { display: none; }
        @media (min-width: 640px) {
          .chat-reply-mobile  { display: none; }
          .chat-reply-desktop { display: inline; }
        }
        .chat-reply-stat {
          display: inline-flex; align-items: center; gap: 0.45rem;
          padding: 0.36rem 0.6rem;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 0.78rem;
          line-height: 1.25;
          color: var(--text);
        }
        .chat-reply-stat strong { font-weight: 700; }
        .chat-reply-stat em {
          font-style: normal;
          font-family: var(--font-mono);
          font-size: 0.64rem;
          color: var(--text-3);
          margin-left: 0.25rem;
        }
        .chat-reply-stat[data-tone="info"] > svg     { color: var(--info); }
        .chat-reply-stat[data-tone="info"] strong    { color: var(--info); }
        .chat-reply-stat[data-tone="info"]           { border-color: color-mix(in srgb, var(--info) 28%, var(--border)); }
        .chat-reply-stat[data-tone="warn"] > svg     { color: var(--warn); }
        .chat-reply-stat[data-tone="warn"] strong    { color: var(--warn); }
        .chat-reply-stat[data-tone="warn"]           { border-color: color-mix(in srgb, var(--warn) 28%, var(--border)); }

        /* ── Before/After flip card ─────────────────────────────────── */
        .ba-shell { max-width: 720px; margin-inline: auto; }
        .ba-card {
          position: relative;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 18px;
          box-shadow: var(--tier-1);
          overflow: hidden;
        }
        .ba-tabs {
          display: flex; gap: 4px;
          padding: 6px;
          background: var(--surface-2);
          border-bottom: 1px solid var(--border);
        }
        .ba-tab {
          appearance: none;
          flex: 1;
          display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem;
          padding: 0.45rem 0.7rem;
          background: transparent;
          border: none;
          border-radius: 7px;
          font-family: var(--font-mono);
          font-size: 0.66rem; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--text-3);
          cursor: pointer;
          transition: background 0.22s, color 0.22s, box-shadow 0.22s;
        }
        .ba-tab.is-on {
          background: var(--surface);
          color: var(--text);
          box-shadow: 0 1px 2px rgba(0,0,0,0.06);
        }
        .ba-tab-led {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--border-strong);
          transition: background 0.22s;
        }
        .ba-tab[data-tone="danger"].is-on .ba-tab-led { background: var(--danger); }
        .ba-tab[data-tone="accent"].is-on .ba-tab-led { background: var(--accent); }

        .ba-stage {
          position: relative;
          min-height: clamp(290px, 60vw, 360px);
          padding: clamp(1rem, 3vw, 1.4rem);
        }
        .ba-state {
          position: absolute;
          inset: clamp(1rem, 3vw, 1.4rem);
          display: flex; flex-direction: column;
        }

        .ba-headline {
          font-size: clamp(1.05rem, 3.6vw, 1.25rem);
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--text);
          margin: 0 0 0.35rem;
          line-height: 1.18;
        }
        .ba-body {
          font-size: 0.86rem;
          color: var(--text-3);
          margin: 0;
          line-height: 1.5;
          max-width: 44ch;
        }

        /* Before — chaotic file stack */
        .ba-files {
          position: relative;
          flex: 1; min-height: 0;
          margin-top: clamp(0.9rem, 2.5vw, 1.2rem);
        }
        .ba-file {
          position: absolute;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 0.45rem 0.6rem;
          display: flex; align-items: center; gap: 0.5rem;
          box-shadow: var(--tier-1);
        }
        .ba-file-icon {
          width: 20px; height: 20px; border-radius: 6px;
          background: var(--surface-2);
          color: var(--text-3);
          display: inline-flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .ba-file-meta { min-width: 0; }
        .ba-file-name {
          font-size: 0.74rem; font-weight: 600;
          color: var(--text);
          letter-spacing: -0.01em;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .ba-file-sub {
          font-family: var(--font-mono);
          font-size: 0.58rem;
          color: var(--text-4);
        }

        /* After — mini cockpit */
        .ba-cockpit {
          margin-top: clamp(0.9rem, 2.5vw, 1.2rem);
          padding: 0.75rem 0.85rem 0.65rem;
          background: linear-gradient(180deg, var(--surface) 0%, color-mix(in srgb, var(--accent-tint) 50%, var(--surface)) 100%);
          border: 1px solid color-mix(in srgb, var(--accent) 22%, var(--border));
          border-radius: 12px;
          display: flex; flex-direction: column; gap: 0.5rem;
          box-shadow: var(--tier-1);
        }
        .ba-cockpit-head {
          display: flex; align-items: center; justify-content: space-between;
        }
        .ba-cockpit-label {
          font-size: 0.72rem; font-weight: 600;
          color: var(--text-2);
        }
        .ba-cockpit-toggle { display: inline-flex; gap: 2px; }
        .ba-cockpit-toggle-pill {
          font-family: var(--font-mono);
          font-size: 0.58rem; font-weight: 600;
          padding: 0.12rem 0.36rem;
          border-radius: 5px;
          color: var(--text-4);
          background: transparent;
        }
        .ba-cockpit-toggle-pill.is-on { background: var(--accent-tint); color: var(--accent); }
        .ba-cockpit-value {
          display: flex; align-items: baseline; gap: 0.5rem;
        }
        .ba-cockpit-num {
          font-family: var(--font-mono);
          font-size: 1.45rem; font-weight: 600;
          letter-spacing: -0.03em;
          color: var(--text);
          line-height: 1;
          font-variant-numeric: tabular-nums;
        }
        .ba-cockpit-num small { font-size: 0.55em; color: var(--text-3); margin-left: 0.18rem; font-weight: 500; }
        .ba-cockpit-yoy {
          font-size: 0.66rem; font-weight: 700;
          color: var(--success);
          background: var(--success-tint);
          padding: 0.14rem 0.4rem;
          border-radius: 5px;
        }
        .ba-cockpit-spark { width: 100%; height: 38px; display: block; }
        .ba-cockpit-kpis {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 0.4rem;
        }
        .ba-cockpit-kpi {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 0.4rem 0.5rem;
          display: flex; flex-direction: column;
        }
        .ba-cockpit-kpi-label {
          font-size: 0.6rem; font-weight: 600;
          color: var(--text-3);
        }
        .ba-cockpit-kpi-value {
          font-family: var(--font-mono);
          font-size: 0.88rem; font-weight: 600;
          letter-spacing: -0.018em;
          color: var(--accent);
          line-height: 1.15;
          font-variant-numeric: tabular-nums;
        }
        .ba-cockpit-kpi[data-tone="success"] .ba-cockpit-kpi-value { color: var(--success); }
        .ba-cockpit-kpi[data-tone="info"]    .ba-cockpit-kpi-value { color: var(--info); }

        /* ── CTA band (compact) ─────────────────────────────────────────
         * .cta-band is the centered, padded gutter wrapper — it holds the
         * left/right breathing room on narrow viewports. The rounded gradient
         * card lives on .cta-band-inner, which already owns border-radius +
         * overflow:hidden (so the HexGridBg stays clipped). Putting margin +
         * border-radius on both layers caused a sub-400px bug where the
         * margin-left/right:auto centering wiped out the margin-inline gutter
         * and the card hit both screen edges. */
        .cta-band {
          position: relative;
          margin-block: clamp(1rem, 3vw, 2.5rem) clamp(1.25rem, 3.5vw, 3rem);
          padding-inline: clamp(0.85rem, 3vw, 2.5rem);
          max-width: 1240px;
          margin-inline: auto;
        }
        .cta-band-inner {
          position: relative;
          background:
            linear-gradient(135deg,
              color-mix(in srgb, var(--accent) 96%, black) 0%,
              color-mix(in srgb, var(--accent-2) 92%, black) 100%);
          color: #FFFFFF;
          padding: clamp(1.6rem, 5vw, 3.5rem) clamp(1.1rem, 4vw, 3rem);
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid color-mix(in srgb, var(--accent) 60%, black);
        }
        .cta-band-sheen {
          position: absolute; inset: 0;
          background:
            radial-gradient(60% 50% at 50% 0%, rgba(255,255,255,0.16), transparent 60%),
            radial-gradient(70% 60% at 90% 100%, rgba(0,0,0,0.30), transparent 60%);
          pointer-events: none;
        }
        .cta-band-body {
          position: relative;
          max-width: 640px;
          margin-inline: auto;
          text-align: center;
        }
        .cta-band-eyebrow {
          display: inline-flex; align-items: center; gap: 0.35rem;
          padding: 0.22rem 0.55rem;
          border-radius: 100px;
          background: rgba(255,255,255,0.14);
          border: 1px solid rgba(255,255,255,0.24);
          font-family: var(--font-mono);
          font-size: 0.6rem; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          margin-bottom: 0.85rem;
        }
        .cta-band-title {
          font-size: clamp(1.4rem, 4.5vw, 2.4rem);
          font-weight: 800;
          letter-spacing: -0.028em;
          line-height: 1.1;
          margin: 0;
        }
        .cta-band-title-soft { opacity: 0.78; }
        .cta-band-actions {
          margin-top: 1.2rem;
          display: flex; justify-content: center; gap: 0.5rem;
          flex-direction: column;
        }
        .cta-band-actions > * { width: 100%; justify-content: center; }
        @media (min-width: 520px) {
          .cta-band-actions { flex-direction: row; flex-wrap: wrap; gap: 0.6rem; }
          .cta-band-actions > * { width: auto; }
        }
        .cta-band-primary {
          display: inline-flex; align-items: center; gap: 0.4rem;
          height: 42px; padding: 0 1.2rem;
          background: #FFFFFF;
          color: var(--accent);
          font-family: inherit;
          font-size: 0.92rem; font-weight: 700;
          border-radius: 10px;
          text-decoration: none;
          box-shadow: 0 10px 24px -10px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.6);
          transition: transform 0.22s, box-shadow 0.22s;
        }
        .cta-band-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 28px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.6);
        }
        .cta-band-secondary {
          display: inline-flex; align-items: center; justify-content: center;
          height: 42px; padding: 0 1rem;
          color: #FFFFFF;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.34);
          font-family: inherit;
          font-size: 0.88rem; font-weight: 600;
          border-radius: 10px;
          text-decoration: none;
          transition: background 0.18s;
        }
        .cta-band-secondary:hover { background: rgba(255,255,255,0.10); }
        @media (min-width: 720px) {
          .cta-band-primary, .cta-band-secondary { height: 46px; font-size: 0.95rem; padding: 0 1.35rem; }
        }

        /* ── Footer (compact, single row on desktop, stacked on phone) ── */
        .footer {
          background: #0B0F1E;
          color: rgba(255,255,255,0.6);
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .footer-inner {
          max-width: 1240px;
          margin-inline: auto;
          padding: 1rem clamp(1rem, 3vw, 2.5rem);
          display: flex; flex-direction: column;
          gap: 0.7rem;
          align-items: center; text-align: center;
        }
        @media (min-width: 720px) {
          .footer-inner {
            flex-direction: row;
            justify-content: space-between;
            text-align: left;
            gap: 1.25rem;
          }
        }
        .footer-brand {
          display: inline-flex; align-items: center; gap: 0.5rem;
          color: #FFFFFF;
        }
        .footer-malyz {
          font-size: 0.7rem; font-weight: 800;
          letter-spacing: 1.6px; text-transform: uppercase;
        }
        .footer-dot { color: rgba(255,255,255,0.3); }
        .footer-ork {
          font-size: 0.88rem; font-weight: 700;
          letter-spacing: -0.015em;
        }
        .footer-links {
          display: flex; flex-wrap: wrap; justify-content: center;
          gap: 0.15rem 0.85rem;
        }
        .footer-links a {
          font-size: 0.78rem;
          color: rgba(255,255,255,0.66);
          text-decoration: none;
          padding: 0.25rem 0;
          transition: color 0.18s;
        }
        .footer-links a:hover { color: #FFFFFF; }
        .footer-legal {
          display: flex; flex-direction: column; align-items: center;
          gap: 0.15rem;
          font-size: 0.7rem;
          color: rgba(255,255,255,0.48);
        }
        @media (min-width: 720px) {
          .footer-legal { align-items: flex-end; }
        }
        .footer-legal-meta {
          font-family: var(--font-mono);
          font-size: 0.62rem;
          letter-spacing: 0.06em;
        }

        /* ── CockpitMockup — phone first ─────────────────────────────── */
        .mock {
          position: relative;
          background: var(--surface);
          border-radius: 16px;
          border: 1px solid var(--border);
          box-shadow: var(--tier-1);
          overflow: hidden;
        }
        @media (min-width: 640px) {
          .mock {
            border-radius: 20px;
            box-shadow:
              var(--tier-2),
              0 50px 100px -40px color-mix(in srgb, var(--accent) 30%, transparent);
          }
        }

        .mock-body {
          padding: 0.6rem;
          background: var(--bg);
          display: flex; flex-direction: column;
          gap: 0.5rem;
        }
        @media (min-width: 640px) { .mock-body { padding: 0.85rem; gap: 0.75rem; } }
        @media (min-width: 980px) { .mock-body { padding: 1rem; } }

        /* Satellites strip: hidden on phone, 3-col row on tablet+ */
        .mock-satellite-row { display: none; gap: 0.55rem; }
        @media (min-width: 640px) {
          .mock-satellite-row { display: grid; grid-template-columns: repeat(3, 1fr); }
        }

        /* Mini-tiles: desktop only */
        .mock-tile-grid { display: none; gap: 0.55rem; }
        @media (min-width: 980px) {
          .mock-tile-grid { display: grid; grid-template-columns: repeat(3, 1fr); }
        }

        /* ── MiniHeroCard — ultra-compact KPI card replaces full HeroPanel ── */
        .mini-hero {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 0.7rem 0.8rem 0.55rem;
          display: flex; flex-direction: column;
          gap: 0.5rem;
          box-shadow: var(--tier-1);
        }
        .mini-hero-head {
          display: flex; align-items: center; justify-content: space-between;
          gap: 0.4rem;
        }
        .mini-hero-label {
          display: inline-flex; align-items: center; gap: 0.4rem;
          font-size: 0.72rem; font-weight: 500;
          color: var(--text-3);
          letter-spacing: -0.005em;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .mini-hero-combined {
          font-size: 0.55rem; font-weight: 700;
          color: var(--accent);
          background: var(--accent-tint);
          padding: 0.1rem 0.32rem;
          border-radius: 4px;
          letter-spacing: 0.06em;
          flex-shrink: 0;
        }
        .mini-hero-toggle {
          display: inline-flex;
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: 7px;
          padding: 2px;
          gap: 0;
          flex-shrink: 0;
        }
        .mini-hero-toggle-btn {
          appearance: none;
          background: transparent;
          border: none;
          padding: 0.25rem 0.45rem;
          font-family: inherit;
          font-size: 0.66rem; font-weight: 600;
          color: var(--text-3);
          border-radius: 5px;
          cursor: pointer;
          transition: background 0.18s, color 0.18s;
          min-width: 22px;
        }
        .mini-hero-toggle-btn.is-on {
          background: var(--surface);
          color: var(--text);
          box-shadow: 0 1px 2px rgba(0,0,0,0.08);
        }
        .mini-hero-value {
          display: flex; align-items: baseline;
          gap: 0.45rem; flex-wrap: wrap;
        }
        .mini-hero-num {
          font-family: var(--font-mono);
          font-size: clamp(1.5rem, 5vw, 1.9rem);
          font-weight: 600;
          letter-spacing: -0.035em;
          color: var(--text);
          line-height: 1;
          font-variant-numeric: tabular-nums;
        }
        .mini-hero-unit {
          font-size: 0.78rem; font-weight: 500;
          color: var(--text-3);
        }
        .mini-hero-yoy {
          display: inline-flex; align-items: center; gap: 0.22rem;
          font-size: 0.66rem; font-weight: 700;
          color: var(--success);
          background: var(--success-tint);
          padding: 0.16rem 0.4rem;
          border-radius: 5px;
          margin-left: auto;
        }

        .scroll-hidden::-webkit-scrollbar { display: none; }
        .scroll-hidden { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

// ── Top navigation ───────────────────────────────────────────────────────────

function TopNav() {
  return (
    <header
      style={{
        position: "sticky", top: 0, zIndex: 30,
        backdropFilter: "saturate(140%) blur(14px)",
        WebkitBackdropFilter: "saturate(140%) blur(14px)",
        background: "color-mix(in srgb, var(--bg) 78%, transparent)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          maxWidth: 1240, margin: "0 auto",
          padding: "0.75rem clamp(1.25rem, 3vw, 2.5rem)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <Link
          href="/" aria-label="Accueil Orkestra"
          style={{
            display: "inline-flex", alignItems: "center", gap: "0.55rem",
            textDecoration: "none", color: "var(--text)",
          }}
        >
          <svg viewBox="0 0 60 70" fill="none" style={{ width: 24, height: 24 }} aria-hidden>
            <polygon points="30,2 58,17.5 58,52.5 30,68 2,52.5 2,17.5" fill="none" stroke="var(--accent)" strokeWidth="4" />
            <polygon points="30,12 48,22.5 48,47.5 30,58 12,47.5 12,22.5" fill="var(--accent)" opacity="0.4" />
            <polygon points="30,22 38,27 38,43 30,48 22,43 22,27" fill="var(--accent)" />
          </svg>
          <span style={{ fontSize: "0.76rem", fontWeight: 800, letterSpacing: "1.6px", textTransform: "uppercase" }}>
            Malyz
          </span>
          <span aria-hidden style={{ width: 1, height: 14, background: "var(--border-strong)" }} />
          <span style={{ fontSize: "0.92rem", fontWeight: 700, letterSpacing: "-0.015em" }}>
            Ork<span style={{ color: "var(--accent)" }}>estra</span>
          </span>
        </Link>

        <nav
          aria-label="Navigation principale"
          style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
        >
          <Link
            href="/login"
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.4rem",
              height: 36, padding: "0 0.95rem",
              background: "linear-gradient(to bottom, var(--accent), var(--accent-2))",
              color: "#FFFFFF",
              fontFamily: "inherit", fontSize: "0.84rem", fontWeight: 600,
              letterSpacing: "-0.005em",
              borderRadius: 10, textDecoration: "none",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.25), 0 0 0 1px color-mix(in srgb, var(--accent) 30%, transparent), 0 4px 14px -4px color-mix(in srgb, var(--accent) 40%, transparent)",
              transition: "transform 0.22s ease, box-shadow 0.22s ease",
              marginLeft: "0.5rem",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
          >
            Se connecter
            <ArrowRight size={13} strokeWidth={2.25} />
          </Link>
        </nav>
      </div>
    </header>
  );
}

function NavAnchor({ href, label }: { href: string; label: string }) {
  // Display rule lives in the page-level mobile-first CSS (.nav-anchor).
  return (
    <a
      href={href}
      className="nav-anchor"
      style={{
        padding: "0.45rem 0.7rem",
        fontSize: "0.84rem", fontWeight: 500,
        color: "var(--text-2)",
        textDecoration: "none", borderRadius: 8,
        transition: "color 0.18s, background 0.18s",
        alignItems: "center",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.background = "var(--surface-2)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-2)"; e.currentTarget.style.background = "transparent"; }}
    >
      {label}
    </a>
  );
}

// ── Animated hex grid background (decorative) ────────────────────────────────

function HexGridBg({
  density = 7, opacity = 0.06, color = "var(--accent)",
}: { density?: number; opacity?: number; color?: string }) {
  // Deterministic positions so SSR + CSR match.
  const seeds = [
    { top: "12%", left: "8%",  size: 140, delay: "0s" },
    { top: "26%", left: "70%", size: 90,  delay: "1.4s" },
    { top: "58%", left: "12%", size: 180, delay: "0.8s" },
    { top: "70%", left: "62%", size: 110, delay: "2.2s" },
    { top: "82%", left: "32%", size: 80,  delay: "1.1s" },
    { top: "8%",  left: "48%", size: 100, delay: "3s" },
    { top: "42%", left: "44%", size: 70,  delay: "2s" },
    { top: "92%", left: "78%", size: 70,  delay: "0.4s" },
  ].slice(0, density);
  return (
    <div
      aria-hidden
      style={{
        position: "absolute", inset: 0,
        pointerEvents: "none", overflow: "hidden",
        // @ts-expect-error custom CSS property
        "--hex-op": opacity,
      }}
    >
      {seeds.map((h, i) => (
        <svg
          key={i}
          className="hex-drift"
          viewBox="0 0 60 70"
          fill="none"
          style={{
            position: "absolute",
            top: h.top, left: h.left,
            width: h.size, height: h.size,
            animationDelay: h.delay,
            opacity,
          }}
        >
          <polygon
            points="30,2 58,17.5 58,52.5 30,68 2,52.5 2,17.5"
            fill="none" stroke={color} strokeWidth="1.5"
          />
        </svg>
      ))}
    </div>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────

function Hero({
  period, onPeriodChange, onCta,
}: {
  period: "M" | "T" | "A";
  onPeriodChange: (p: "M" | "T" | "A") => void;
  onCta: () => void;
}) {
  const reduceMotion = useReducedMotionSafe();
  const fadeIn = (delay = 0) =>
    reduceMotion
      ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <section style={{ position: "relative", overflow: "hidden" }}>
      {/* Animated hex grid — hero only */}
      <HexGridBg density={7} opacity={0.06} />

      {/* Soft indigo bloom anchoring the mockup */}
      <div
        aria-hidden
        style={{
          position: "absolute", top: 80, left: "50%",
          width: "min(1100px, 95%)", height: 600,
          transform: "translateX(-50%)",
          background:
            "radial-gradient(60% 60% at 50% 40%, color-mix(in srgb, var(--accent) 18%, transparent), transparent 70%)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      <div
        className="landing-hero-inner"
        style={{
          position: "relative",
          maxWidth: 1240, margin: "0 auto",
          padding: "clamp(1.75rem, 5vw, 5rem) clamp(1rem, 3vw, 2.5rem) clamp(1.5rem, 4vw, 3rem)",
          display: "grid", gridTemplateColumns: "1fr",
          gap: "clamp(1.5rem, 4vw, 3rem)",
        }}
      >
        {/* Copy column */}
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <motion.span
            {...fadeIn(0)}
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.4rem",
              padding: "0.28rem 0.65rem",
              borderRadius: 100,
              background: "var(--accent-tint)",
              color: "var(--accent)",
              border: "1px solid color-mix(in srgb, var(--accent) 22%, transparent)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.62rem", fontWeight: 700,
              letterSpacing: "0.12em", textTransform: "uppercase",
              marginBottom: "1rem",
            }}
          >
            <span aria-hidden className="animate-blink" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)" }} />
            Cockpit BFSI · Suisse · 2026
          </motion.span>

          <motion.h1
            {...fadeIn(0.08)}
            style={{
              /* Mobile-first: 1.95rem floor stays readable on a 320px phone
               * without forcing a 4-line headline; 6vw lets it grow to ~3.8rem
               * on a desktop window. */
              fontSize: "clamp(1.95rem, 6vw, 3.6rem)",
              fontWeight: 800,
              lineHeight: 1.06,
              letterSpacing: "-0.034em",
              color: "var(--text)",
              margin: 0,
              maxWidth: "16ch",
              marginInline: "auto",
            }}
          >
            Orchestrez vos données. Pilotez votre PME.{" "}
            <span style={{
              background: "linear-gradient(180deg, var(--accent) 0%, var(--accent-2) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Agissez.
            </span>
          </motion.h1>

          <motion.p
            {...fadeIn(0.16)}
            style={{
              marginTop: "0.95rem",
              fontSize: "clamp(0.95rem, 1.6vw, 1.1rem)",
              color: "var(--text-2)",
              lineHeight: 1.55,
              maxWidth: "52ch",
              marginInline: "auto",
            }}
          >
            Un cockpit qui répond à <em style={{ fontStyle: "normal", color: "var(--text)", fontWeight: 600 }}>« que dois-je faire aujourd’hui&nbsp;? »</em> dès la connexion.
            Helvebroker SA et Odoo enfin parlent la même langue.
          </motion.p>

          <motion.div
            {...fadeIn(0.24)}
            className="landing-hero-cta"
            style={{
              marginTop: "1.4rem",
              display: "flex",
              gap: "0.6rem",
            }}
          >
            <Link
              href="/login"
              onClick={onCta}
              className="hero-cta-primary"
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.45rem",
                background: "linear-gradient(180deg, var(--accent), var(--accent-2))",
                color: "#FFFFFF",
                fontFamily: "inherit", fontWeight: 600,
                letterSpacing: "-0.005em",
                borderRadius: 10, textDecoration: "none",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.3), 0 0 0 1px color-mix(in srgb, var(--accent) 30%, transparent), 0 10px 24px -10px color-mix(in srgb, var(--accent) 55%, transparent)",
                transition: "transform 0.22s ease, box-shadow 0.22s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "inset 0 1px 0 rgba(255,255,255,0.3), 0 0 0 1px color-mix(in srgb, var(--accent) 30%, transparent), 0 14px 32px -10px color-mix(in srgb, var(--accent) 65%, transparent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "inset 0 1px 0 rgba(255,255,255,0.3), 0 0 0 1px color-mix(in srgb, var(--accent) 30%, transparent), 0 10px 24px -10px color-mix(in srgb, var(--accent) 55%, transparent)";
              }}
            >
              Accéder au cockpit
              <ArrowRight size={15} strokeWidth={2.25} />
            </Link>

            <a
              href="#ia"
              className="hero-cta-secondary"
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.4rem",
                background: "transparent",
                color: "var(--text-2)",
                border: "1px solid var(--border-strong)",
                fontFamily: "inherit", fontWeight: 500,
                borderRadius: 10, textDecoration: "none",
                transition: "background 0.18s, color 0.18s, border-color 0.18s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-2)"; e.currentTarget.style.color = "var(--text)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-2)"; }}
            >
              <MessageSquare size={14} strokeWidth={2} />
              Voir l’IA en action
            </a>
          </motion.div>

          <motion.div
            {...fadeIn(0.32)}
            className="landing-hero-chips"
            style={{
              marginTop: "1.2rem",
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: "0.4rem", flexWrap: "wrap",
            }}
          >
            <SourcePill dot="var(--info)"    label="Helvebroker SA" />
            <SourcePill dot="var(--purple)"  label="Odoo" />
            <SourcePill dot="var(--success)" label="⊕ Combiné" combined />
            <span
              className="hero-compliance"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.62rem", fontWeight: 600,
                color: "var(--text-4)",
                letterSpacing: "0.08em", textTransform: "uppercase",
                marginLeft: "0.25rem",
              }}
            >
              <span className="hero-compliance-short">CH · LPD Art.16</span>
              <span className="hero-compliance-full"> CH · LPD Art.16 · Mistral · Infomaniak</span>
            </span>
          </motion.div>
        </div>

        {/* Mockup column — the cockpit, faithful */}
        <motion.div
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: "relative", maxWidth: 1180, marginInline: "auto", width: "100%" }}
        >
          <CockpitMockup
            period={period}
            onPeriodChange={onPeriodChange}
            onAny={onCta}
          />
        </motion.div>
      </div>
    </section>
  );
}

// ── Cockpit mockup — compact, fits a single mobile viewport ──────────────────
//
// Mobile content (~440px tall, fits 600px+ viewport):
//   chip + 1-line header
//   + MiniHeroCard (compact KPI: title + value + sparkline)
//   + TroisChosesMock (3 priority rows)
//
// Tablet ≥640 adds: SatelliteKPI strip (3 KPIs row), source pills in header
// Desktop ≥980 adds: 6 MiniTile grid

function CockpitMockup({
  period, onPeriodChange, onAny,
}: {
  period: "M" | "T" | "A";
  onPeriodChange: (p: "M" | "T" | "A") => void;
  onAny: () => void;
}) {
  return (
    <div
      role="img"
      aria-label="Aperçu du cockpit Orkestra : chiffre d'affaires, indicateurs et priorités du jour."
      className="mock"
    >
      <div className="mock-body">
        {/* Compact KPI card — always visible. Tells the cockpit's headline story. */}
        <MiniHeroCard period={period} onPeriodChange={onPeriodChange} />

        {/* Priorities — always visible. The cockpit's strongest signal. */}
        <TroisChosesMock onAny={onAny} />

        {/* Tablet+: 3 SatelliteKPI in a horizontal strip */}
        <div className="mock-satellite-row">
          {previewSatellites.map((s) => (
            <SatelliteKPI key={s.label} kpi={s} onOpen={onAny} />
          ))}
        </div>

        {/* Desktop+: 6 mini-tiles grid */}
        <div className="mock-tile-grid">
          {miniTiles.map((t) => (
            <MiniTile key={t.title} tile={t} onClick={onAny} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Compact KPI card — replaces HeroPanel inside the preview so the whole
// mockup fits in one mobile viewport.
function MiniHeroCard({
  period, onPeriodChange,
}: {
  period: "M" | "T" | "A";
  onPeriodChange: (p: "M" | "T" | "A") => void;
}) {
  const options: { v: "M" | "T" | "A"; label: string }[] = [
    { v: "M", label: "Mois" },
    { v: "T", label: "Trim." },
    { v: "A", label: "Année" },
  ];
  return (
    <div className="mini-hero">
      <div className="mini-hero-head">
        <div className="mini-hero-label">
          <span>Chiffre d&apos;affaires</span>
          <span className="mini-hero-combined">⊕ COMBINÉ</span>
        </div>
        <div className="mini-hero-toggle" role="tablist" aria-label="Période">
          {options.map((o) => (
            <button
              key={o.v}
              type="button"
              role="tab"
              aria-selected={o.v === period}
              onClick={() => onPeriodChange(o.v)}
              className={"mini-hero-toggle-btn" + (o.v === period ? " is-on" : "")}
            >
              {o.v}
            </button>
          ))}
        </div>
      </div>

      <div className="mini-hero-value">
        <span className="mini-hero-num">92 400</span>
        <span className="mini-hero-unit">CHF</span>
        <span className="mini-hero-yoy">
          <TrendingUp size={11} strokeWidth={2.5} />
          +12.0% YoY
        </span>
      </div>

      <MiniSpark data={previewData} />
    </div>
  );
}

function MiniSpark({ data }: { data: number[] }) {
  const w = 200;
  const h = 44;
  const padX = 4;
  const padY = 4;
  const stepX = (w - padX * 2) / Math.max(1, data.length - 1);
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = padX + i * stepX;
    const y = padY + (1 - (v - min) / range) * (h - padY * 2);
    return [x, y] as const;
  });
  const path = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
    .join(" ");
  const [lastX] = pts[pts.length - 1];
  const [firstX] = pts[0];
  const area = `${path} L ${lastX.toFixed(1)} ${h} L ${firstX.toFixed(1)} ${h} Z`;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      aria-hidden
      style={{ width: "100%", height: 44, display: "block" }}
    >
      <defs>
        <linearGradient id="mini-spark-grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.32" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#mini-spark-grad)" />
      <path
        d={path}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function MiniTile({ tile, onClick }: { tile: MiniTile; onClick: () => void }) {
  const alertColor =
    tile.alertTone === "warn"   ? "var(--warn)"
    : tile.alertTone === "good"   ? "var(--success)"
    : tile.alertTone === "danger" ? "var(--danger)"
    : "var(--text-3)";
  const { Icon } = tile;
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: "left",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "0.7rem 0.8rem 0.65rem",
        cursor: "pointer",
        fontFamily: "inherit", color: "inherit",
        display: "flex", flexDirection: "column", gap: "0.5rem",
        transition: "box-shadow 0.22s ease, transform 0.18s ease, border-color 0.22s",
        minHeight: 102,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "var(--tier-1)";
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.borderColor = "color-mix(in srgb, var(--accent) 26%, var(--border))";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "var(--border)";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span
          style={{
            width: 24, height: 24, borderRadius: 7,
            background: tile.bg, color: tile.color,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
          }}
          aria-hidden
        >
          <Icon size={12} strokeWidth={2} />
        </span>
        <span style={{ fontSize: "0.78rem", fontWeight: 600, letterSpacing: "-0.01em" }}>
          {tile.title}
        </span>
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "1.4rem", fontWeight: 600,
          letterSpacing: "-0.03em",
          fontVariantNumeric: "tabular-nums",
          color: "var(--text)",
          lineHeight: 1,
        }}
      >
        {tile.metric}
        {tile.unit && (
          <span style={{ fontSize: "0.55em", marginLeft: "0.12rem", color: "var(--text-3)" }}>{tile.unit}</span>
        )}
      </div>
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          fontSize: "0.66rem", color: "var(--text-4)",
          paddingTop: "0.4rem",
          borderTop: "1px solid var(--border)",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: alertColor, fontWeight: 600 }}>
          <Circle size={5} strokeWidth={0} fill="currentColor" />
          {tile.alert}
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem" }}>{tile.caption}</span>
      </div>
    </button>
  );
}

function TroisChosesMock({ onAny }: { onAny: () => void }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: "0.9rem 1rem",
      }}
    >
      <div
        style={{
          display: "flex", alignItems: "center", gap: "0.45rem",
          fontSize: "0.68rem", fontWeight: 700,
          letterSpacing: "0.16em", textTransform: "uppercase",
          color: "var(--accent)",
          marginBottom: "0.55rem",
        }}
      >
        Trois choses aujourd’hui
        <span
          style={{
            fontSize: "0.6rem", fontWeight: 700,
            color: "var(--text-3)",
            background: "var(--surface-2)",
            padding: "0.08rem 0.4rem",
            borderRadius: 100,
            letterSpacing: "0.04em",
          }}
        >
          0/3
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        {troisPreview.map((it) => {
          const { Icon } = it;
          return (
            <button
              key={it.text}
              onClick={onAny}
              style={{
                display: "flex", alignItems: "center", gap: "0.65rem",
                padding: "0.55rem 0.65rem",
                background: "transparent",
                border: "1px solid var(--border)",
                borderRadius: 10,
                fontFamily: "inherit", color: "inherit",
                textAlign: "left", cursor: "pointer",
                transition: "background 0.18s, border-color 0.18s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-2)"; e.currentTarget.style.borderColor = "var(--border-strong)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "var(--border)"; }}
            >
              <span
                style={{
                  width: 26, height: 26, borderRadius: 7,
                  background: it.bg, color: it.color,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}
                aria-hidden
              >
                <Icon size={13} strokeWidth={2} />
              </span>
              <span
                style={{
                  flex: 1, minWidth: 0,
                  fontSize: "0.83rem", color: "var(--text)",
                  letterSpacing: "-0.005em",
                }}
              >
                {it.text}
              </span>
              <span
                style={{
                  display: "inline-flex", alignItems: "center", gap: "0.25rem",
                  fontSize: "0.7rem", fontWeight: 600,
                  color: "var(--accent)",
                  flexShrink: 0,
                }}
              >
                {it.cta}
                <ChevronRight size={12} strokeWidth={2.25} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SourcePill({ dot, label, combined }: { dot: string; label: string; combined?: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: "0.35rem",
        padding: "0.28rem 0.6rem",
        background: combined ? "var(--success-tint)" : "var(--surface)",
        color: combined ? "var(--success)" : "var(--text-2)",
        border: combined ? "1px solid color-mix(in srgb, var(--success) 24%, transparent)" : "1px solid var(--border)",
        borderRadius: 100,
        fontSize: "0.72rem", fontWeight: 600,
        letterSpacing: "-0.005em",
      }}
    >
      <Circle size={6} strokeWidth={0} fill={dot} />
      {label}
    </span>
  );
}

// ── AI section — streaming assistant + chat mockup ───────────────────────────

const aiFeatures = [
  { Icon: Database, title: "Sur vos données",       body: "Helvebroker SA + Odoo + CSV interrogés en direct, jamais recopiés." },
  { Icon: Cpu,      title: "Outils transparents",   body: "Chaque appel d’outil est visible et auditable côté cabinet." },
  { Icon: Mic,      title: "Voix + texte",          body: "Dictez « renouvellements de mars » — réponse immédiate." },
  { Icon: Layers,   title: "Mémoire qui persiste",  body: "L’assistant retient vos préférences, vos clients, vos seuils." },
];

function AISection() {
  return (
    <section id="ia" className="landing-section" style={{ position: "relative" }}>
      <div className="ai-grid">
        {/* Copy column */}
        <div className="ai-copy">
          <div className="ai-eyebrow">
            <Sparkles size={11} strokeWidth={2.25} />
            Agent IA · Mistral
          </div>
          <h2 className="ai-title">
            Posez une question. Obtenez une réponse, pas un fichier.
          </h2>
          <p className="ai-lede">
            L’assistant interroge Helvebroker SA et Odoo en direct, raisonne sur vos
            contrats et primes, et vous renvoie une réponse — pas un export.
          </p>

          <AIFeatureCarousel />

          <div className="ai-cta-row">
            <Link href="/login" className="ai-cta-primary">
              Parler à l’IA
              <ArrowRight size={14} strokeWidth={2.25} />
            </Link>
            <span className="ai-cta-note">
              <ShieldCheck size={12} strokeWidth={2} color="var(--success)" />
              Souverain CH · LPD Art.16
            </span>
          </div>
        </div>

        {/* Chat mockup column */}
        <ChatMockup />
      </div>
    </section>
  );
}

function AIFeatureCarousel() {
  const reduce = useReducedMotionSafe();
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(
      () => setIdx((i) => (i + 1) % aiFeatures.length),
      3500,
    );
    return () => window.clearInterval(id);
  }, [reduce]);

  if (reduce) {
    return (
      <ul className="ai-features-static" aria-label="Points clés de l’IA">
        {aiFeatures.map((f) => (
          <AIFeatureRow key={f.title} feature={f} />
        ))}
      </ul>
    );
  }

  return (
    <div className="ai-carousel" aria-label="Points clés de l’IA — rotation automatique">
      <div className="ai-carousel-stage" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <AIFeatureRow feature={aiFeatures[idx]} />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="ai-carousel-dots" role="tablist" aria-label="Choisir un point clé">
        {aiFeatures.map((f, i) => (
          <button
            key={f.title}
            type="button"
            role="tab"
            aria-selected={i === idx}
            aria-label={f.title}
            onClick={() => setIdx(i)}
            className={"ai-carousel-dot" + (i === idx ? " is-on" : "")}
          />
        ))}
      </div>
    </div>
  );
}

function AIFeatureRow({ feature }: { feature: typeof aiFeatures[number] }) {
  const { Icon } = feature;
  return (
    <div className="ai-feature">
      <span className="ai-feature-icon" aria-hidden>
        <Icon size={14} strokeWidth={2} />
      </span>
      <div className="ai-feature-text">
        <div className="ai-feature-title">{feature.title}</div>
        <div className="ai-feature-body">{feature.body}</div>
      </div>
    </div>
  );
}

// Animated chat mockup — simulated streaming + tool call
function ChatMockup() {
  const reduce = useReducedMotionSafe();
  const [, forceTick] = useReducer((n) => n + 1, 0);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (reduce) { setStep(4); return; }
    const t1 = setTimeout(() => setStep(1), 700);
    const t2 = setTimeout(() => setStep(2), 1700);
    const t3 = setTimeout(() => setStep(3), 2900);
    const t4 = setTimeout(() => setStep(4), 4200);
    return () => { [t1, t2, t3, t4].forEach(clearTimeout); };
  }, [reduce]);

  // Force re-render on resize so any inline measurements adapt
  useEffect(() => {
    const r = () => forceTick();
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);

  return (
    <motion.div
      initial={reduce ? { opacity: 1 } : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "relative",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 18,
        boxShadow: "var(--tier-2)",
        overflow: "hidden",
      }}
    >
      {/* Soft indigo bloom behind */}
      <div
        aria-hidden
        style={{
          position: "absolute", inset: -40,
          background:
            "radial-gradient(50% 40% at 50% 0%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 70%)",
          filter: "blur(20px)",
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <div
        style={{
          position: "relative",
          display: "flex", alignItems: "center", gap: "0.6rem",
          padding: "0.85rem 1rem",
          borderBottom: "1px solid var(--border)",
          background: "color-mix(in srgb, var(--surface) 85%, var(--surface-2))",
        }}
      >
        <span
          style={{
            width: 28, height: 28, borderRadius: 8,
            background: "var(--accent-tint)",
            color: "var(--accent)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            border: "1px solid color-mix(in srgb, var(--accent) 20%, transparent)",
          }}
        >
          <Bot size={14} strokeWidth={2} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "0.82rem", fontWeight: 600, letterSpacing: "-0.01em" }}>
            Assistant Orkestra
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.62rem", color: "var(--text-4)",
              letterSpacing: "0.06em", textTransform: "uppercase",
            }}
          >
            Mistral Large · streaming
          </div>
        </div>
        <span
          style={{
            display: "inline-flex", alignItems: "center", gap: "0.3rem",
            fontSize: "0.66rem", fontWeight: 600,
            color: "var(--success)",
          }}
        >
          <span aria-hidden className="animate-blink" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)" }} />
          en ligne
        </span>
      </div>

      {/* Body */}
      <div
        style={{
          position: "relative",
          padding: "clamp(0.8rem, 2vw, 1rem)",
          display: "flex", flexDirection: "column",
          gap: "0.7rem",
          minHeight: "clamp(240px, 50vw, 380px)",
        }}
      >
        {/* User question */}
        <ChatBubble role="user">
          Quels renouvellements arrivent dans les 30 prochains jours, et lesquels risquent un impayé ?
        </ChatBubble>

        {/* Tool call chip — desktop only (hidden on mobile via .chat-tool-chip) */}
        {step >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="chat-tool-chip"
          >
            <Cpu size={12} strokeWidth={2} color="var(--accent)" />
            <span style={{ fontWeight: 600 }}>query_helvebroker</span>
            <span style={{ color: "var(--text-4)" }}>renouv.j30=true · impayé=auto</span>
            {step >= 2 && <Check size={12} strokeWidth={2.5} color="var(--success)" />}
          </motion.div>
        )}

        {/* Assistant reply (streams in) */}
        {step >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <ChatBubble role="assistant" streaming={step < 4}>
              {step >= 3 ? (
                <>
                  {/* Mobile: brief, scannable summary card */}
                  <span className="chat-reply-mobile">
                    <span className="chat-reply-stat" data-tone="info">
                      <Mail size={12} strokeWidth={2} />
                      <strong>4 renouv.</strong> <em>J-30</em>
                    </span>
                    <span className="chat-reply-stat" data-tone="warn">
                      <ShieldAlert size={12} strokeWidth={2} />
                      <strong>Rossi SA</strong> <em>risque impayé</em>
                    </span>
                  </span>
                  {/* Desktop: full prose response */}
                  <span className="chat-reply-desktop">
                    Quatre renouvellements approchent : Dubois SA (J-7), Rossi SA (J-12),
                    Audemars (J-21), Béatrice Müller (J-28). Rossi SA présente un risque
                    — impayé de 1 800 CHF à 67 jours.
                  </span>
                </>
              ) : (
                "Je consulte vos contrats…"
              )}
            </ChatBubble>

            {/* Result cards — desktop only */}
            {step >= 4 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="chat-results"
              >
                <ResultChip
                  Icon={Mail}
                  tone="info"
                  title="4 renouv. J-30"
                  sub="Brouillons préparés"
                />
                <ResultChip
                  Icon={ShieldAlert}
                  tone="warn"
                  title="Rossi SA · risque"
                  sub="Relance recommandée"
                />
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Input row (visual only) */}
        <div style={{ flex: 1 }} />
        <div
          style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            padding: "0.6rem 0.7rem",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 12,
          }}
        >
          <span
            style={{
              flex: 1,
              fontFamily: "inherit",
              fontSize: "0.85rem",
              color: "var(--text-4)",
            }}
          >
            Demandez « impayés à plus de 60 jours »…
          </span>
          <button
            aria-label="Dicter à la voix"
            style={{
              width: 30, height: 30, borderRadius: 8,
              background: "transparent", border: "1px solid var(--border)",
              color: "var(--text-3)",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Mic size={14} strokeWidth={2} />
          </button>
          <button
            aria-label="Envoyer"
            style={{
              width: 30, height: 30, borderRadius: 8,
              background: "var(--accent)",
              color: "#FFFFFF",
              border: "none",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Send size={13} strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function ChatBubble({
  role, children, streaming,
}: {
  role: "user" | "assistant";
  children: React.ReactNode;
  streaming?: boolean;
}) {
  const isUser = role === "user";
  return (
    <div
      style={{
        alignSelf: isUser ? "flex-end" : "flex-start",
        maxWidth: "82%",
        padding: "0.65rem 0.85rem",
        background: isUser ? "var(--accent)" : "var(--surface-2)",
        color: isUser ? "#FFFFFF" : "var(--text)",
        border: isUser ? "none" : "1px solid var(--border)",
        borderRadius: 14,
        borderTopRightRadius: isUser ? 4 : 14,
        borderTopLeftRadius:  isUser ? 14 : 4,
        fontSize: "0.88rem",
        lineHeight: 1.5,
        letterSpacing: "-0.005em",
      }}
    >
      <span className={streaming ? "stream-cursor" : undefined}>
        {children}
      </span>
    </div>
  );
}

function ResultChip({
  Icon, tone, title, sub,
}: {
  Icon: LucideIcon;
  tone: "info" | "warn" | "success" | "danger";
  title: string;
  sub: string;
}) {
  const color =
    tone === "info"    ? "var(--info)"
    : tone === "warn"    ? "var(--warn)"
    : tone === "success" ? "var(--success)"
    : "var(--danger)";
  const bg =
    tone === "info"    ? "var(--info-tint)"
    : tone === "warn"    ? "var(--warn-tint)"
    : tone === "success" ? "var(--success-tint)"
    : "var(--danger-tint)";
  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: "0.55rem",
        padding: "0.6rem 0.7rem",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 10,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 26, height: 26, borderRadius: 7,
          background: bg, color,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={13} strokeWidth={2} />
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: "0.78rem", fontWeight: 600, letterSpacing: "-0.01em", color: "var(--text)" }}>{title}</div>
        <div style={{ fontSize: "0.7rem", color: "var(--text-3)" }}>{sub}</div>
      </div>
    </div>
  );
}

// ── Calm vs Chaos ────────────────────────────────────────────────────────────

function CalmChaosSection() {
  return (
    <section id="calme" className="landing-section">
      <SectionHeader
        eyebrow="Avant / Après"
        title="Le calme remplace les onglets."
        sub="Cinq fenêtres, trois exports, deux PDF — devenus un seul écran."
      />
      <div className="ba-shell" style={{ marginTop: "clamp(1.2rem, 3vw, 2rem)" }}>
        <BeforeAfterCard />
      </div>
    </section>
  );
}

function BeforeAfterCard() {
  const reduce = useReducedMotionSafe();
  const [state, setState] = useState<"before" | "after">("before");

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(
      () => setState((s) => (s === "before" ? "after" : "before")),
      4200,
    );
    return () => window.clearInterval(id);
  }, [reduce]);

  return (
    <div className="ba-card">
      {/* Toggle tabs — also visible state indicator */}
      <div className="ba-tabs" role="tablist" aria-label="Avant ou après Orkestra">
        <button
          type="button" role="tab"
          aria-selected={state === "before"}
          onClick={() => setState("before")}
          className={"ba-tab" + (state === "before" ? " is-on" : "")}
          data-tone="danger"
        >
          <span className="ba-tab-led" /> Avant
        </button>
        <button
          type="button" role="tab"
          aria-selected={state === "after"}
          onClick={() => setState("after")}
          className={"ba-tab" + (state === "after" ? " is-on" : "")}
          data-tone="accent"
        >
          <span className="ba-tab-led" /> Après
        </button>
      </div>

      <div className="ba-stage">
        <AnimatePresence mode="wait">
          {state === "before" ? (
            <motion.div
              key="before"
              initial={reduce ? false : { opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 1 } : { opacity: 0, scale: 1.015 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="ba-state ba-before"
            >
              <BeforeContent />
            </motion.div>
          ) : (
            <motion.div
              key="after"
              initial={reduce ? false : { opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 1 } : { opacity: 0, scale: 1.015 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="ba-state ba-after"
            >
              <AfterContent />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function BeforeContent() {
  const files = [
    { label: "Helvebroker SA.xlsx", sub: "Primes T1.csv",      Icon: FileSpreadsheet, rot: -3 },
    { label: "Odoo · Factures", sub: "export-mars.pdf",    Icon: FileText,        rot: 2 },
    { label: "Sinistres",       sub: "rapport_sin.pdf",    Icon: ShieldAlert,     rot: -1 },
    { label: "Renouvellements", sub: "Modèle email v3",    Icon: Mail,            rot: 3 },
  ];
  return (
    <>
      <h3 className="ba-headline">Cinq outils, aucune vue d&apos;ensemble.</h3>
      <p className="ba-body">
        Tableurs qui ne se parlent pas, exports à la main, PDF consolidés à minuit.
      </p>
      <div className="ba-files" aria-hidden>
        {files.map((f, i) => {
          const { Icon } = f;
          return (
            <div
              key={f.label}
              className="ba-file"
              style={{
                top: `${i * 22}px`,
                left: `${4 + (i % 2) * 22}px`,
                right: `${4 + ((i + 1) % 2) * 22}px`,
                transform: `rotate(${f.rot}deg)`,
              }}
            >
              <span className="ba-file-icon"><Icon size={12} strokeWidth={2} /></span>
              <div className="ba-file-meta">
                <div className="ba-file-name">{f.label}</div>
                <div className="ba-file-sub">{f.sub}</div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function AfterContent() {
  return (
    <>
      <h3 className="ba-headline">Un cockpit. Trois actions. Six tuiles.</h3>
      <p className="ba-body">
        Helvebroker SA et Odoo réconciliés. Les priorités du jour au premier plan.
      </p>
      <div className="ba-cockpit">
        <div className="ba-cockpit-head">
          <span className="ba-cockpit-label">Chiffre d&apos;affaires</span>
          <div className="ba-cockpit-toggle">
            {(["M","T","A"] as const).map((p) => (
              <span key={p} className={"ba-cockpit-toggle-pill" + (p === "M" ? " is-on" : "")}>{p}</span>
            ))}
          </div>
        </div>
        <div className="ba-cockpit-value">
          <span className="ba-cockpit-num">92 400 <small>CHF</small></span>
          <span className="ba-cockpit-yoy">+12.0% YoY</span>
        </div>
        <svg viewBox="0 0 200 40" className="ba-cockpit-spark" aria-hidden>
          <defs>
            <linearGradient id="ba-spark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="var(--accent)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M 0 28 C 25 26, 40 24, 60 22 S 100 20, 120 16 S 160 10, 200 6 L 200 40 L 0 40 Z" fill="url(#ba-spark)" />
          <path d="M 0 28 C 25 26, 40 24, 60 22 S 100 20, 120 16 S 160 10, 200 6" stroke="var(--accent)" strokeWidth="1.6" fill="none" />
        </svg>
        <div className="ba-cockpit-kpis">
          <div className="ba-cockpit-kpi" data-tone="success">
            <span className="ba-cockpit-kpi-label">Marge</span>
            <span className="ba-cockpit-kpi-value">68 %</span>
          </div>
          <div className="ba-cockpit-kpi" data-tone="accent">
            <span className="ba-cockpit-kpi-label">Cash-flow</span>
            <span className="ba-cockpit-kpi-value">+18 K</span>
          </div>
          <div className="ba-cockpit-kpi" data-tone="info">
            <span className="ba-cockpit-kpi-label">Rétention</span>
            <span className="ba-cockpit-kpi-value">87 %</span>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Closing CTA band ─────────────────────────────────────────────────────────

function CtaBand() {
  return (
    <section className="cta-band">
      <div className="cta-band-inner">
        <HexGridBg density={6} opacity={0.07} color="#FFFFFF" />
        <div aria-hidden className="cta-band-sheen" />

        <div className="cta-band-body">
          <div className="cta-band-eyebrow">
            <Sparkles size={10} strokeWidth={2.5} />
            Démo · sans mot de passe
          </div>
          <h2 className="cta-band-title">
            Un cockpit, chaque matin.
            <br />
            <span className="cta-band-title-soft">Trois actions, jamais plus.</span>
          </h2>
          <div className="cta-band-actions">
            <Link href="/login" className="cta-band-primary">
              Accéder au cockpit
              <ArrowRight size={15} strokeWidth={2.25} />
            </Link>
            <a href="#metiers" className="cta-band-secondary">
              Revoir les modules
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Section header (shared) ──────────────────────────────────────────────────

function SectionHeader({
  eyebrow, title, sub,
}: { eyebrow: string; title: string; sub?: string }) {
  const reduce = useReducedMotionSafe();
  return (
    <motion.div
      initial={reduce ? { opacity: 1 } : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{ textAlign: "center", maxWidth: 720, marginInline: "auto" }}
    >
      <span
        style={{
          display: "inline-block",
          fontFamily: "var(--font-mono)",
          fontSize: "0.66rem", fontWeight: 700,
          color: "var(--accent)",
          letterSpacing: "0.16em", textTransform: "uppercase",
          marginBottom: "0.65rem",
        }}
      >
        {eyebrow}
      </span>
      <h2
        style={{
          fontSize: "clamp(1.7rem, 3.4vw, 2.4rem)",
          fontWeight: 700,
          letterSpacing: "-0.028em",
          color: "var(--text)",
          margin: 0, lineHeight: 1.12,
        }}
      >
        {title}
      </h2>
      {sub && (
        <p
          style={{
            marginTop: "0.9rem",
            fontSize: "1rem",
            color: "var(--text-3)",
            lineHeight: 1.55,
            maxWidth: "54ch",
            marginInline: "auto",
          }}
        >
          {sub}
        </p>
      )}
    </motion.div>
  );
}

// ── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <svg viewBox="0 0 60 70" fill="none" style={{ width: 22, height: 22 }} aria-hidden>
            <polygon points="30,2 58,17.5 58,52.5 30,68 2,52.5 2,17.5" fill="none" stroke="#5856D6" strokeWidth="4" />
            <polygon points="30,12 48,22.5 48,47.5 30,58 12,47.5 12,22.5" fill="#5856D6" opacity="0.4" />
            <polygon points="30,22 38,27 38,43 30,48 22,43 22,27" fill="#5856D6" />
          </svg>
          <span className="footer-malyz">Malyz</span>
          <span className="footer-dot" aria-hidden>·</span>
          <span className="footer-ork">Ork<span style={{ color: "#9CA0FF" }}>estra</span></span>
        </div>

        <nav className="footer-links" aria-label="Liens secondaires">
          <a href="#ia">L’IA</a>
          <Link href="/login">Cockpit</Link>
          <Link href="/rapports">Rapports</Link>
        </nav>

        <div className="footer-legal">
          <span>© 2026 Malyz Sàrl · Zürich</span>
          <span className="footer-legal-meta">CH · LPD Art.16 · Mistral</span>
        </div>
      </div>
    </footer>
  );
}
