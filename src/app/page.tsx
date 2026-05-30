"use client";

import { useState, useEffect, useReducer } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight, Sparkles, Globe, ShieldCheck, ShieldAlert,
  Percent, Wallet, Users, Circle, Target, FolderArchive,
  Flame, MessageSquare, Mic, FileText, AlertCircle, Mail,
  Bot, Check, ChevronRight, Cpu, Database, FileSpreadsheet,
  Layers, Send,
  type LucideIcon,
} from "lucide-react";
import { HeroPanel, type HeroEvent } from "@/components/dashboard/HeroPanel";
import { SatelliteKPI, type Satellite } from "@/components/dashboard/SatelliteKPI";
import { LandingPalettePicker } from "@/components/landing/LandingPalettePicker";

// ── Preview data (mirrors the cockpit so the landing FEELS like the product) ──

const previewData = [62, 64, 70, 68, 72, 78, 80, 82, 86, 88, 92, 92];
const previewMonths = ["juin", "juil.", "août", "sept.", "oct.", "nov.", "déc.", "janv.", "févr.", "mars", "avril", "mai"];
const previewEvents: HeroEvent[] = [
  { i: 6, label: "+9 200 CHF", sub: "Commission Dubois SA · décembre" },
  { i: 9, label: "−1 800 CHF", sub: "Impayé Rossi SA détecté · mars" },
];

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
  { Icon: Mail,        color: "var(--info)",   bg: "var(--info-tint)",   text: "Valider 4 renouvellements préparés par l’agent BrokerStar.", cta: "Valider" },
  { Icon: AlertCircle, color: "var(--warn)",   bg: "var(--warn-tint)",   text: "Relancer Rossi SA pour son impayé de 1 800 CHF (67 jours).",   cta: "Ouvrir"  },
  { Icon: FileText,    color: "var(--accent)", bg: "var(--accent-tint)", text: "Signer le rapport mensuel combiné BrokerStar + Odoo.",         cta: "Signer"  },
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

// 6 métiers feature grid
const metiers = [
  { Icon: Target,        color: "var(--accent)", bg: "var(--accent-tint)", title: "Prospection",  body: "Pipeline qualifié, relances automatiques, taux de conversion en temps réel." },
  { Icon: FolderArchive, color: "var(--info)",   bg: "var(--info-tint)",   title: "Portefeuille", body: "Contrats actifs, renouvellements J-30 préparés, primes consolidées par client." },
  { Icon: Flame,         color: "var(--danger)", bg: "var(--danger-tint)", title: "Sinistres",    body: "Dossiers ouverts, délais de traitement, ratio sinistralité — toujours à jour." },
  { Icon: Wallet,        color: "var(--warn)",   bg: "var(--warn-tint)",   title: "Finance",      body: "Cash-flow, marge nette, impayés détectés tôt — BrokerStar et Odoo réconciliés." },
  { Icon: Globe,         color: "var(--accent)", bg: "var(--accent-tint)", title: "Vue 360°",     body: "Une marge consolidée, une rétention, une santé d’ensemble. Le cabinet d’un coup d’œil." },
  { Icon: Sparkles,      color: "var(--purple)", bg: "var(--purple-tint)", title: "Agents IA",    body: "Renouvellements, impayés, rapports — vos agents préparent. Vous validez." },
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
        <MetiersSection />
        <AISection />
        <CalmChaosSection />
        <CtaBand />
        <LandingPalettePicker />
      </main>
      <Footer />

      {/* Page-level CSS helpers — reduced-motion + responsive shims. */}
      <style>{`
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

        /* Hero stacks copy/mockup at narrower widths. */
        @media (max-width: 980px) {
          .landing-hero-inner { grid-template-columns: 1fr !important; text-align: center; }
          .landing-hero-cta   { justify-content: center !important; }
          .landing-hero-chips { justify-content: center !important; }
        }

        .metiers-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(0.85rem, 1.5vw, 1.1rem); }
        @media (max-width: 960px) { .metiers-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 620px) { .metiers-grid { grid-template-columns: 1fr; } }

        .ai-grid { display: grid; grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr); gap: clamp(1.5rem, 3vw, 3rem); align-items: center; }
        @media (max-width: 960px) { .ai-grid { grid-template-columns: 1fr; } }

        .calm-grid { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(1rem, 2.4vw, 1.5rem); align-items: stretch; }
        @media (max-width: 820px) { .calm-grid { grid-template-columns: 1fr; } }

        /* Mockup interior — 6 mini-tiles in 3 cols, drop to 2 then 1 at narrow widths. */
        .mock-tile-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.6rem; }
        @media (max-width: 760px) { .mock-tile-grid { grid-template-columns: repeat(2, 1fr); } }

        /* Hero satellites column stacks below the hero panel on narrow widths. */
        .mock-hero-grid { display: grid; grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr); gap: 0.7rem; }
        @media (max-width: 760px) { .mock-hero-grid { grid-template-columns: 1fr; } }
        @media (max-width: 760px) { .mock-satellite-stack { grid-template-rows: auto !important; grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 480px) { .mock-satellite-stack { grid-template-columns: 1fr !important; } }

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
          <NavAnchor href="#metiers" label="Métiers" />
          <NavAnchor href="#ia"      label="L’IA"   />
          <NavAnchor href="#calme"   label="Avant / après" />
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
  return (
    <a
      href={href}
      className="nav-anchor"
      style={{
        display: "none",
        padding: "0.45rem 0.7rem",
        fontSize: "0.84rem", fontWeight: 500,
        color: "var(--text-2)",
        textDecoration: "none", borderRadius: 8,
        transition: "color 0.18s, background 0.18s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.background = "var(--surface-2)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-2)"; e.currentTarget.style.background = "transparent"; }}
    >
      {label}
      <style>{`@media (min-width: 720px) { .nav-anchor { display: inline-flex !important; } }`}</style>
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
  const reduceMotion = useReducedMotion();
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
          padding: "clamp(3rem, 6vw, 5.5rem) clamp(1.25rem, 3vw, 2.5rem) clamp(2rem, 4vw, 3rem)",
          display: "grid", gridTemplateColumns: "1fr",
          gap: "clamp(2rem, 4vw, 3rem)",
        }}
      >
        {/* Copy column */}
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <motion.span
            {...fadeIn(0)}
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.45rem",
              padding: "0.32rem 0.75rem",
              borderRadius: 100,
              background: "var(--accent-tint)",
              color: "var(--accent)",
              border: "1px solid color-mix(in srgb, var(--accent) 22%, transparent)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.66rem", fontWeight: 700,
              letterSpacing: "0.14em", textTransform: "uppercase",
              marginBottom: "1.4rem",
            }}
          >
            <span aria-hidden className="animate-blink" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)" }} />
            Cockpit BFSI · Suisse · 2026
          </motion.span>

          <motion.h1
            {...fadeIn(0.08)}
            style={{
              fontSize: "clamp(2.4rem, 5.4vw, 4rem)",
              fontWeight: 800,
              lineHeight: 1.04,
              letterSpacing: "-0.038em",
              color: "var(--text)",
              margin: 0,
              maxWidth: "16ch",
              marginInline: "auto",
            }}
          >
            Pilotez votre cabinet{" "}
            <span style={{
              background: "linear-gradient(180deg, var(--accent) 0%, var(--accent-2) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              avec intelligence.
            </span>
          </motion.h1>

          <motion.p
            {...fadeIn(0.16)}
            style={{
              marginTop: "1.2rem",
              fontSize: "clamp(1rem, 1.6vw, 1.12rem)",
              color: "var(--text-2)",
              lineHeight: 1.55,
              maxWidth: "54ch",
              marginInline: "auto",
            }}
          >
            Un cockpit qui répond à <em style={{ fontStyle: "normal", color: "var(--text)", fontWeight: 600 }}>« que dois-je faire aujourd’hui&nbsp;? »</em> dès la connexion.
            BrokerStar et Odoo enfin parlent la même langue.
          </motion.p>

          <motion.div
            {...fadeIn(0.24)}
            className="landing-hero-cta"
            style={{
              marginTop: "1.85rem",
              display: "flex", alignItems: "center",
              gap: "0.85rem", flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <Link
              href="/login"
              onClick={onCta}
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.55rem",
                height: 50, padding: "0 1.5rem",
                background: "linear-gradient(180deg, var(--accent), var(--accent-2))",
                color: "#FFFFFF",
                fontFamily: "inherit", fontSize: "1rem", fontWeight: 600,
                letterSpacing: "-0.005em",
                borderRadius: 12, textDecoration: "none",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.3), 0 0 0 1px color-mix(in srgb, var(--accent) 30%, transparent), 0 14px 32px -10px color-mix(in srgb, var(--accent) 55%, transparent)",
                transition: "transform 0.22s ease, box-shadow 0.22s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "inset 0 1px 0 rgba(255,255,255,0.3), 0 0 0 1px color-mix(in srgb, var(--accent) 30%, transparent), 0 18px 42px -10px color-mix(in srgb, var(--accent) 65%, transparent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "inset 0 1px 0 rgba(255,255,255,0.3), 0 0 0 1px color-mix(in srgb, var(--accent) 30%, transparent), 0 14px 32px -10px color-mix(in srgb, var(--accent) 55%, transparent)";
              }}
            >
              Accéder au cockpit
              <ArrowRight size={17} strokeWidth={2.25} />
            </Link>

            <a
              href="#ia"
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.45rem",
                height: 50, padding: "0 1.05rem",
                background: "transparent",
                color: "var(--text-2)",
                border: "1px solid var(--border-strong)",
                fontFamily: "inherit", fontSize: "0.95rem", fontWeight: 600,
                borderRadius: 12, textDecoration: "none",
                transition: "background 0.18s, color 0.18s, border-color 0.18s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-2)"; e.currentTarget.style.color = "var(--text)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-2)"; }}
            >
              <MessageSquare size={16} strokeWidth={2} />
              Voir l’IA en action
            </a>
          </motion.div>

          <motion.div
            {...fadeIn(0.32)}
            className="landing-hero-chips"
            style={{
              marginTop: "1.6rem",
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: "0.45rem", flexWrap: "wrap",
            }}
          >
            <SourcePill dot="var(--info)"    label="BrokerStar" />
            <SourcePill dot="var(--purple)"  label="Odoo" />
            <SourcePill dot="var(--success)" label="⊕ Combiné" combined />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.64rem", fontWeight: 600,
                color: "var(--text-4)",
                letterSpacing: "0.1em", textTransform: "uppercase",
                marginLeft: "0.25rem",
              }}
            >
              CH · LPD Art.16 · Mistral · Infomaniak
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

// ── Cockpit mockup — window-chromed dashboard composite ──────────────────────

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
      aria-label="Aperçu du cockpit Orkestra : chiffre d'affaires, indicateurs satellites, priorités du jour et tuiles par métier."
      style={{
        position: "relative",
        background: "var(--surface)",
        borderRadius: 20,
        border: "1px solid var(--border)",
        boxShadow:
          "var(--tier-2), 0 50px 100px -40px color-mix(in srgb, var(--accent) 30%, transparent)",
        overflow: "hidden",
      }}
    >
      {/* Floating "Aperçu interactif" chip */}
      <span
        style={{
          position: "absolute", top: -12, left: 20, zIndex: 3,
          display: "inline-flex", alignItems: "center", gap: "0.4rem",
          padding: "0.3rem 0.65rem",
          background: "var(--text)",
          color: "var(--surface)",
          fontFamily: "var(--font-mono)",
          fontSize: "0.62rem", fontWeight: 700,
          letterSpacing: "0.08em", textTransform: "uppercase",
          borderRadius: 100,
          boxShadow: "0 6px 18px -6px rgba(0,0,0,0.35)",
        }}
      >
        <Sparkles size={11} strokeWidth={2.25} />
        Aperçu interactif
      </span>

      {/* Window chrome */}
      <div
        style={{
          display: "flex", alignItems: "center",
          gap: "0.6rem", padding: "0.7rem 1rem",
          background: "var(--surface-2)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", gap: "0.35rem" }}>
          <Dot color="#ff5f57" />
          <Dot color="#febc2e" />
          <Dot color="#28c840" />
        </div>
        <div
          style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
            gap: "0.4rem",
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            color: "var(--text-3)",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "0.25rem 0.7rem",
            maxWidth: 360,
          }}
        >
          <ShieldCheck size={11} strokeWidth={2.25} color="var(--success)" />
          cockpit.malyz.ch / dashboard
        </div>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.62rem", fontWeight: 700,
            color: "var(--text-4)",
            letterSpacing: "0.08em", textTransform: "uppercase",
          }}
        >
          Mistral · Live
        </span>
      </div>

      {/* Dashboard body */}
      <div
        style={{
          padding: "clamp(0.85rem, 1.6vw, 1.1rem)",
          background: "var(--bg)",
          display: "flex", flexDirection: "column",
          gap: "0.7rem",
        }}
      >
        {/* Greeting row */}
        <div
          style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between", gap: "0.6rem",
            flexWrap: "wrap",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: "0.72rem", fontWeight: 600,
                color: "var(--text-3)",
                letterSpacing: "-0.005em",
              }}
            >
              Bonjour, Élise — vendredi 30 mai
            </div>
            <div
              style={{
                fontSize: "clamp(1rem, 2vw, 1.15rem)",
                fontWeight: 700,
                color: "var(--text)",
                letterSpacing: "-0.02em",
              }}
            >
              Tout est sous contrôle.
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            <SourcePill dot="var(--info)"    label="BrokerStar · 3 min" />
            <SourcePill dot="var(--purple)"  label="Odoo · 5 min" />
            <SourcePill dot="var(--success)" label="⊕ Combiné" combined />
          </div>
        </div>

        {/* Hero + 3 satellites */}
        <div className="mock-hero-grid">
          <HeroPanel
            title="Chiffre d’affaires"
            combinedBadge
            value="92 400"
            unit="CHF"
            yoyLabel="+12.0% YoY"
            data={previewData}
            months={previewMonths}
            events={previewEvents}
            period={period}
            onPeriodChange={onPeriodChange}
          />
          <div
            className="mock-satellite-stack"
            style={{
              display: "grid",
              gridTemplateRows: "repeat(3, 1fr)",
              gap: "0.7rem",
              minWidth: 0,
            }}
          >
            {previewSatellites.map((s) => (
              <SatelliteKPI key={s.label} kpi={s} onOpen={onAny} />
            ))}
          </div>
        </div>

        {/* Trois choses aujourd'hui */}
        <TroisChosesMock onAny={onAny} />

        {/* 6 mini-tiles */}
        <div className="mock-tile-grid">
          {miniTiles.map((t) => (
            <MiniTile key={t.title} tile={t} onClick={onAny} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Dot({ color }: { color: string }) {
  return <span aria-hidden style={{ width: 11, height: 11, borderRadius: "50%", background: color, display: "inline-block" }} />;
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

// ── Métiers grid ─────────────────────────────────────────────────────────────

function MetiersSection() {
  return (
    <section
      id="metiers"
      style={{
        maxWidth: 1240, margin: "0 auto",
        padding: "clamp(3.5rem, 7vw, 6rem) clamp(1.25rem, 3vw, 2.5rem)",
      }}
    >
      <SectionHeader
        eyebrow="Un seul cockpit"
        title="Tous vos métiers, sur une même surface."
        sub="BrokerStar et Odoo fusionnés. Six modules, une langue commune. Aucun export à recoller."
      />

      <div className="metiers-grid" style={{ marginTop: "2.2rem" }}>
        {metiers.map((m, i) => (
          <MetierCard key={m.title} metier={m} index={i} />
        ))}
      </div>
    </section>
  );
}

function MetierCard({
  metier, index,
}: {
  metier: typeof metiers[number];
  index: number;
}) {
  const reduce = useReducedMotion();
  const { Icon } = metier;
  return (
    <motion.article
      initial={reduce ? { opacity: 1 } : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: "1.4rem 1.4rem 1.2rem",
        display: "flex", flexDirection: "column", gap: "0.8rem",
        transition: "box-shadow 0.22s ease, transform 0.22s ease, border-color 0.22s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--tier-1)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLElement).style.borderColor = "color-mix(in srgb, var(--accent) 22%, var(--border))";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
      }}
    >
      <span
        aria-hidden
        style={{
          width: 40, height: 40, borderRadius: 10,
          background: metier.bg, color: metier.color,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
        }}
      >
        <Icon size={18} strokeWidth={1.85} />
      </span>
      <h3
        style={{
          fontSize: "1.05rem", fontWeight: 700,
          letterSpacing: "-0.018em",
          color: "var(--text)",
          margin: 0,
        }}
      >
        {metier.title}
      </h3>
      <p
        style={{
          fontSize: "0.92rem", lineHeight: 1.55,
          color: "var(--text-3)",
          margin: 0,
        }}
      >
        {metier.body}
      </p>
    </motion.article>
  );
}

// ── AI section — streaming assistant + chat mockup ───────────────────────────

function AISection() {
  return (
    <section
      id="ia"
      style={{
        position: "relative",
        maxWidth: 1240, margin: "0 auto",
        padding: "clamp(3.5rem, 7vw, 6rem) clamp(1.25rem, 3vw, 2.5rem)",
      }}
    >
      <div className="ai-grid">
        {/* Copy column */}
        <div>
          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.4rem",
              padding: "0.28rem 0.65rem",
              borderRadius: 100,
              background: "var(--purple-tint)",
              color: "var(--purple)",
              border: "1px solid color-mix(in srgb, var(--purple) 20%, transparent)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.66rem", fontWeight: 700,
              letterSpacing: "0.12em", textTransform: "uppercase",
              marginBottom: "1.1rem",
            }}
          >
            <Sparkles size={11} strokeWidth={2.25} />
            Agent IA · Mistral
          </div>
          <h2
            style={{
              fontSize: "clamp(1.7rem, 3.4vw, 2.4rem)",
              fontWeight: 700,
              letterSpacing: "-0.028em",
              color: "var(--text)",
              margin: 0, lineHeight: 1.12,
              maxWidth: "20ch",
            }}
          >
            Posez la question. L’IA répond sur vos données.
          </h2>
          <p
            style={{
              marginTop: "1.05rem",
              fontSize: "1.02rem", lineHeight: 1.6,
              color: "var(--text-2)",
              maxWidth: "52ch",
            }}
          >
            L’assistant interroge directement BrokerStar et Odoo, raisonne sur vos contrats,
            primes et sinistres, et vous renvoie une réponse — pas un export à interpréter.
            Réponse en streaming, outils visibles, mémoire qui persiste, voix au besoin.
          </p>

          <ul
            style={{
              listStyle: "none", padding: 0, margin: "1.5rem 0 0",
              display: "flex", flexDirection: "column", gap: "0.7rem",
            }}
          >
            <AIFeature Icon={Database}     title="Sur vos données"        body="BrokerStar + Odoo + CSV — interrogés en direct, jamais recopiés." />
            <AIFeature Icon={Cpu}          title="Outils transparents"     body="Chaque appel d’outil est visible et auditable côté cabinet." />
            <AIFeature Icon={Mic}          title="Voix + texte"           body="Dictez « renouvellements de mars » — réponse immédiate." />
            <AIFeature Icon={Layers}       title="Mémoire qui persiste"   body="L’assistant retient vos préférences, vos clients, vos seuils." />
          </ul>

          <div style={{ marginTop: "1.6rem", display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            <Link
              href="/login"
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.45rem",
                height: 44, padding: "0 1.05rem",
                background: "var(--text)",
                color: "var(--surface)",
                fontFamily: "inherit", fontSize: "0.9rem", fontWeight: 600,
                borderRadius: 10, textDecoration: "none",
                transition: "transform 0.22s ease, opacity 0.22s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.opacity = "0.92"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.opacity = "1"; }}
            >
              Parler à l’IA
              <ArrowRight size={14} strokeWidth={2.25} />
            </Link>
            <span
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.4rem",
                height: 44, padding: "0 0.95rem",
                fontSize: "0.78rem", fontWeight: 500,
                color: "var(--text-3)",
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.04em",
              }}
            >
              <ShieldCheck size={13} strokeWidth={2} color="var(--success)" />
              Hébergement souverain CH · LPD Art.16
            </span>
          </div>
        </div>

        {/* Chat mockup column */}
        <ChatMockup />
      </div>
    </section>
  );
}

function AIFeature({
  Icon, title, body,
}: { Icon: LucideIcon; title: string; body: string }) {
  return (
    <li style={{ display: "flex", gap: "0.85rem", alignItems: "flex-start" }}>
      <span
        aria-hidden
        style={{
          width: 32, height: 32, borderRadius: 9,
          background: "var(--accent-tint)",
          color: "var(--accent)",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          border: "1px solid color-mix(in srgb, var(--accent) 18%, transparent)",
          flexShrink: 0, marginTop: 2,
        }}
      >
        <Icon size={14} strokeWidth={2} />
      </span>
      <div>
        <div style={{ fontSize: "0.92rem", fontWeight: 600, color: "var(--text)", letterSpacing: "-0.01em" }}>
          {title}
        </div>
        <div style={{ fontSize: "0.85rem", color: "var(--text-3)", lineHeight: 1.5 }}>
          {body}
        </div>
      </div>
    </li>
  );
}

// Animated chat mockup — simulated streaming + tool call
function ChatMockup() {
  const reduce = useReducedMotion();
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
          padding: "1rem",
          display: "flex", flexDirection: "column",
          gap: "0.7rem",
          minHeight: 360,
        }}
      >
        {/* User question */}
        <ChatBubble role="user">
          Quels renouvellements arrivent dans les 30 prochains jours, et lesquels risquent un impayé ?
        </ChatBubble>

        {/* Tool call chip */}
        {step >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            style={{
              alignSelf: "flex-start",
              display: "inline-flex", alignItems: "center", gap: "0.45rem",
              padding: "0.4rem 0.6rem",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              color: "var(--text-2)",
            }}
          >
            <Cpu size={12} strokeWidth={2} color="var(--accent)" />
            <span style={{ fontWeight: 600 }}>query_brokerstar</span>
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
              {step >= 3
                ? "Quatre renouvellements approchent : Dubois SA (J-7), Rossi SA (J-12), Audemars (J-21), Béatrice Müller (J-28). Rossi SA présente un risque — impayé de 1 800 CHF à 67 jours."
                : "Je consulte vos contrats…"}
            </ChatBubble>

            {/* Result cards — actions */}
            {step >= 4 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr",
                  gap: "0.5rem", marginTop: "0.3rem",
                }}
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
    <section
      id="calme"
      style={{
        maxWidth: 1240, margin: "0 auto",
        padding: "clamp(3.5rem, 7vw, 6rem) clamp(1.25rem, 3vw, 2.5rem)",
      }}
    >
      <SectionHeader
        eyebrow="Avant / Après"
        title="Le calme remplace les onglets."
        sub="Cinq fenêtres, trois exports, deux PDF — devenus un seul écran."
      />

      <div className="calm-grid" style={{ marginTop: "2.4rem" }}>
        <ChaosCard />
        <CalmCard />
      </div>
    </section>
  );
}

function ChaosCard() {
  const reduce = useReducedMotion();
  const stacks = [
    { label: "BrokerStar.xlsx", sub: "Primes T1.csv",     Icon: FileSpreadsheet, rot: -3 },
    { label: "Odoo · Factures", sub: "export-mars.pdf",   Icon: FileText,        rot: 2 },
    { label: "Sinistres",       sub: "rapport_sin.pdf",   Icon: ShieldAlert,     rot: -1 },
    { label: "Renouvellements", sub: "Modèle email v3",   Icon: Mail,            rot: 4 },
    { label: "Clients VIP",     sub: "liste-relances.csv",Icon: AlertCircle,     rot: -2 },
  ];
  return (
    <motion.div
      initial={reduce ? { opacity: 1 } : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "relative",
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        borderRadius: 18,
        padding: "1.6rem 1.4rem 2rem",
        minHeight: 420,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.66rem", fontWeight: 700,
          letterSpacing: "0.16em", textTransform: "uppercase",
          color: "var(--danger)",
          marginBottom: "0.55rem",
          display: "inline-flex", alignItems: "center", gap: "0.4rem",
        }}
      >
        <Circle size={6} strokeWidth={0} fill="currentColor" />
        Avant Orkestra
      </div>
      <h3
        style={{
          fontSize: "1.2rem", fontWeight: 700,
          letterSpacing: "-0.022em",
          color: "var(--text)",
          margin: 0, marginBottom: "0.4rem",
        }}
      >
        Cinq outils, aucune vue d’ensemble.
      </h3>
      <p style={{ fontSize: "0.9rem", color: "var(--text-3)", margin: 0, lineHeight: 1.55 }}>
        Tableurs qui ne se parlent pas, exports recoupés à la main, rapports en PDF
        qu’il faut consolider à minuit. Chaque chiffre demande un détour.
      </p>

      {/* Stacked, slightly chaotic file pile */}
      <div
        aria-hidden
        style={{
          position: "relative",
          marginTop: "1.6rem",
          height: 200,
        }}
      >
        {stacks.map((s, i) => {
          const { Icon } = s;
          return (
            <div
              key={s.label}
              style={{
                position: "absolute",
                top: `${i * 24}px`,
                left: `${10 + (i % 2) * 30}px`,
                right: `${10 + ((i + 1) % 2) * 30}px`,
                transform: `rotate(${s.rot}deg)`,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "0.55rem 0.7rem",
                display: "flex", alignItems: "center", gap: "0.55rem",
                boxShadow: "var(--tier-1)",
              }}
            >
              <span
                style={{
                  width: 22, height: 22, borderRadius: 6,
                  background: "var(--surface-2)",
                  color: "var(--text-3)",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <Icon size={12} strokeWidth={2} />
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text)", letterSpacing: "-0.01em" }}>
                  {s.label}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--text-4)" }}>
                  {s.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function CalmCard() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? { opacity: 1 } : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "relative",
        background:
          "linear-gradient(180deg, var(--surface) 0%, color-mix(in srgb, var(--accent-tint) 60%, var(--surface)) 100%)",
        border: "1px solid color-mix(in srgb, var(--accent) 18%, var(--border))",
        borderRadius: 18,
        padding: "1.6rem 1.4rem 1.4rem",
        minHeight: 420,
        overflow: "hidden",
        boxShadow: "var(--tier-1)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.66rem", fontWeight: 700,
          letterSpacing: "0.16em", textTransform: "uppercase",
          color: "var(--accent)",
          marginBottom: "0.55rem",
          display: "inline-flex", alignItems: "center", gap: "0.4rem",
        }}
      >
        <Circle size={6} strokeWidth={0} fill="currentColor" />
        Avec Orkestra
      </div>
      <h3
        style={{
          fontSize: "1.2rem", fontWeight: 700,
          letterSpacing: "-0.022em",
          color: "var(--text)",
          margin: 0, marginBottom: "0.4rem",
        }}
      >
        Un cockpit, trois actions, six tuiles.
      </h3>
      <p style={{ fontSize: "0.9rem", color: "var(--text-3)", margin: 0, lineHeight: 1.55 }}>
        BrokerStar et Odoo réconciliés. Les chiffres arrivent au premier plan,
        les priorités du jour aussi. Vous décidez — Orkestra exécute.
      </p>

      {/* Mini cockpit composition */}
      <div
        style={{
          marginTop: "1.6rem",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "0.85rem",
          display: "flex", flexDirection: "column", gap: "0.6rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: "0.74rem", fontWeight: 600, color: "var(--text-2)" }}>Chiffre d’affaires</div>
          <div style={{ display: "flex", gap: "0.25rem" }}>
            {(["M","T","A"] as const).map((p) => (
              <span
                key={p}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6rem",
                  padding: "0.15rem 0.4rem",
                  borderRadius: 5,
                  background: p === "M" ? "var(--accent-tint)" : "transparent",
                  color: p === "M" ? "var(--accent)" : "var(--text-4)",
                  fontWeight: 600,
                }}
              >
                {p}
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem" }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "1.6rem", fontWeight: 600,
              letterSpacing: "-0.03em",
              fontVariantNumeric: "tabular-nums",
              color: "var(--text)",
              lineHeight: 1,
            }}
          >
            92 400
            <span style={{ fontSize: "0.55em", marginLeft: "0.2rem", color: "var(--text-3)" }}>CHF</span>
          </div>
          <span style={{ fontSize: "0.7rem", color: "var(--success)", fontWeight: 600, marginBottom: "0.15rem" }}>
            +12.0% YoY
          </span>
        </div>
        {/* Tiny sparkline */}
        <svg viewBox="0 0 200 40" style={{ width: "100%", height: 40 }} aria-hidden>
          <defs>
            <linearGradient id="calm-spark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="var(--accent)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M 0 28 C 25 26, 40 24, 60 22 S 100 20, 120 16 S 160 10, 200 6 L 200 40 L 0 40 Z" fill="url(#calm-spark)" />
          <path d="M 0 28 C 25 26, 40 24, 60 22 S 100 20, 120 16 S 160 10, 200 6" stroke="var(--accent)" strokeWidth="1.6" fill="none" />
        </svg>
      </div>

      <div
        style={{
          marginTop: "0.8rem",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "0.5rem",
        }}
      >
        <CalmMiniKpi label="Marge"     value="68 %"  tone="success" />
        <CalmMiniKpi label="Cash-flow" value="+18 K" tone="accent"  />
        <CalmMiniKpi label="Rétention" value="87 %"  tone="info"    />
      </div>
    </motion.div>
  );
}

function CalmMiniKpi({
  label, value, tone,
}: {
  label: string; value: string;
  tone: "success" | "accent" | "info";
}) {
  const color =
    tone === "success" ? "var(--success)"
    : tone === "info"    ? "var(--info)"
    : "var(--accent)";
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "0.55rem 0.7rem",
      }}
    >
      <div style={{ fontSize: "0.66rem", fontWeight: 600, color: "var(--text-3)", letterSpacing: "-0.005em" }}>
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "1rem", fontWeight: 600,
          letterSpacing: "-0.02em",
          color, lineHeight: 1.1,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ── Closing CTA band ─────────────────────────────────────────────────────────

function CtaBand() {
  return (
    <section
      style={{
        position: "relative",
        margin: "clamp(2rem, 4vw, 3.5rem) clamp(1.25rem, 3vw, 2.5rem) clamp(3rem, 5vw, 4.5rem)",
        overflow: "hidden",
        borderRadius: 24,
        maxWidth: 1240,
        marginInline: "auto",
      }}
    >
      <div
        style={{
          position: "relative",
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--accent) 96%, black) 0%, color-mix(in srgb, var(--accent-2) 92%, black) 100%)",
          color: "#FFFFFF",
          padding: "clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 3.5rem)",
          borderRadius: 24,
          overflow: "hidden",
          border: "1px solid color-mix(in srgb, var(--accent) 60%, black)",
        }}
      >
        <HexGridBg density={8} opacity={0.08} color="#FFFFFF" />

        {/* Soft top sheen */}
        <div
          aria-hidden
          style={{
            position: "absolute", inset: 0,
            background:
              "radial-gradient(60% 50% at 50% 0%, rgba(255,255,255,0.18), transparent 60%), radial-gradient(70% 60% at 90% 100%, rgba(0,0,0,0.30), transparent 60%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", maxWidth: 720, marginInline: "auto", textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.4rem",
              padding: "0.28rem 0.65rem",
              borderRadius: 100,
              background: "rgba(255,255,255,0.14)",
              border: "1px solid rgba(255,255,255,0.24)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.64rem", fontWeight: 700,
              letterSpacing: "0.12em", textTransform: "uppercase",
              marginBottom: "1.1rem",
            }}
          >
            <Sparkles size={10} strokeWidth={2.5} />
            Démo Helvebroker — sans mot de passe
          </div>
          <h2
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.08,
              margin: 0,
            }}
          >
            Un cockpit, chaque matin.
            <br />
            <span style={{ opacity: 0.78 }}>Trois actions, jamais plus.</span>
          </h2>
          <p
            style={{
              marginTop: "1rem",
              fontSize: "1.02rem",
              color: "rgba(255,255,255,0.78)",
              lineHeight: 1.6,
              maxWidth: "48ch",
              marginInline: "auto",
            }}
          >
            Ouvrez le cockpit, validez ce qui compte aujourd’hui, refermez l’onglet.
            Le reste, Orkestra s’en occupe pendant la nuit.
          </p>
          <div
            style={{
              marginTop: "1.8rem",
              display: "flex", justifyContent: "center", gap: "0.8rem",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/login"
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                height: 50, padding: "0 1.5rem",
                background: "#FFFFFF",
                color: "var(--accent)",
                fontFamily: "inherit", fontSize: "1rem", fontWeight: 700,
                borderRadius: 12, textDecoration: "none",
                boxShadow:
                  "0 14px 28px -10px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.6)",
                transition: "transform 0.22s ease, box-shadow 0.22s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 20px 36px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.6)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 14px 28px -10px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.6)";
              }}
            >
              Accéder au cockpit
              <ArrowRight size={17} strokeWidth={2.25} />
            </Link>
            <a
              href="#metiers"
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.45rem",
                height: 50, padding: "0 1.2rem",
                color: "#FFFFFF",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.34)",
                fontFamily: "inherit", fontSize: "0.95rem", fontWeight: 600,
                borderRadius: 12, textDecoration: "none",
                transition: "background 0.18s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.10)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
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
  const reduce = useReducedMotion();
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
    <footer
      style={{
        position: "relative",
        background: "#0B0F1E",
        color: "rgba(255,255,255,0.74)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        style={{
          maxWidth: 1240, marginInline: "auto",
          padding: "clamp(2rem, 4vw, 3rem) clamp(1.25rem, 3vw, 2.5rem) clamp(1.5rem, 3vw, 2rem)",
          display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) repeat(2, minmax(0, 1fr))",
          gap: "clamp(1.5rem, 3vw, 3rem)",
          alignItems: "flex-start",
        }}
        className="footer-grid"
      >
        {/* Brand block */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
            <svg viewBox="0 0 60 70" fill="none" style={{ width: 28, height: 28 }} aria-hidden>
              <polygon points="30,2 58,17.5 58,52.5 30,68 2,52.5 2,17.5" fill="none" stroke="#5856D6" strokeWidth="4" />
              <polygon points="30,12 48,22.5 48,47.5 30,58 12,47.5 12,22.5" fill="#5856D6" opacity="0.4" />
              <polygon points="30,22 38,27 38,43 30,48 22,43 22,27" fill="#5856D6" />
            </svg>
            <div>
              <div style={{ fontSize: "0.74rem", fontWeight: 800, letterSpacing: "1.8px", textTransform: "uppercase", color: "#FFFFFF" }}>
                Malyz
              </div>
              <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.015em" }}>
                Ork<span style={{ color: "#9CA0FF" }}>estra</span>
              </div>
            </div>
          </div>
          <p style={{ fontSize: "0.86rem", lineHeight: 1.55, color: "rgba(255,255,255,0.58)", maxWidth: "38ch", margin: 0 }}>
            Le cockpit IA des cabinets BFSI suisses.
            Souverain, conforme, conçu pour ne pas vous ralentir.
          </p>
          <div style={{ marginTop: "1.2rem", display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            <FooterPill>CH · Zürich</FooterPill>
            <FooterPill>LPD Art.16</FooterPill>
            <FooterPill>Infomaniak</FooterPill>
            <FooterPill>Mistral Large</FooterPill>
          </div>
        </div>

        <FooterCol
          title="Produit"
          links={[
            { label: "Cockpit",     href: "/login" },
            { label: "Métiers",     href: "#metiers" },
            { label: "L’IA",        href: "#ia" },
            { label: "Rapports",    href: "/rapports" },
          ]}
        />
        <FooterCol
          title="Cabinet"
          links={[
            { label: "Helvebroker",  href: "/login" },
            { label: "Démo guidée",  href: "/login" },
            { label: "Support",      href: "/support" },
            { label: "Paramètres",   href: "/parametres" },
          ]}
        />
      </div>

      <div
        style={{
          maxWidth: 1240, marginInline: "auto",
          padding: "1rem clamp(1.25rem, 3vw, 2.5rem)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex", justifyContent: "space-between", gap: "1rem",
          flexWrap: "wrap",
          fontSize: "0.72rem", color: "rgba(255,255,255,0.5)",
        }}
      >
        <span>© 2026 Malyz Consulting Sàrl · Zürich</span>
        <span style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>
          Bâti pour les cabinets qui n’ont pas le temps de chercher.
        </span>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}

function FooterCol({
  title, links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.66rem", fontWeight: 700,
          letterSpacing: "0.16em", textTransform: "uppercase",
          color: "rgba(255,255,255,0.5)",
          marginBottom: "0.8rem",
        }}
      >
        {title}
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.55rem" }}>
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              style={{
                fontSize: "0.88rem",
                color: "rgba(255,255,255,0.74)",
                textDecoration: "none",
                transition: "color 0.18s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#FFFFFF"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.74)"; }}
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterPill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center",
        padding: "0.22rem 0.55rem",
        background: "rgba(255,255,255,0.05)",
        color: "rgba(255,255,255,0.74)",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 100,
        fontFamily: "var(--font-mono)",
        fontSize: "0.62rem", fontWeight: 600,
        letterSpacing: "0.06em",
      }}
    >
      {children}
    </span>
  );
}
