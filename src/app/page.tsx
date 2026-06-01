"use client";

import { useState, useEffect, useReducer } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Sparkles, Globe, ShieldCheck, ShieldAlert,
  Circle, MessageSquare, Mic, FileText, Mail,
  Bot, Check, Cpu, Database, FileSpreadsheet,
  Layers, Send,
  type LucideIcon,
} from "lucide-react";

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

// ─────────────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const router = useRouter();
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
        <Hero onCta={goLogin} />
        <PillarsSection />
        <CalmChaosSection />
        <AISection />
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

        /* ── Three pillars grid — 1 col phone, 3 cols tablet+ ────────── */
        .pillars-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
        @media (min-width: 760px) {
          .pillars-grid { grid-template-columns: repeat(3, 1fr); gap: clamp(1rem, 2vw, 1.5rem); }
        }

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

        /* Decorative hero wave — purely visual flourish below the source
         * pills. Hidden on very small phones where the hero already feels
         * dense, shown from ~420px upward. */
        .hero-wave { display: none; }
        @media (min-width: 420px) { .hero-wave { display: block; } }
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

function Hero({ onCta }: { onCta: () => void }) {
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
    <section className="landing-hero" style={{ position: "relative", overflow: "hidden" }}>
      {/* Animated hex grid — hero only */}
      <HexGridBg density={8} opacity={0.07} />

      {/* Twin indigo blooms — one anchoring the upper third, one for depth at the bottom */}
      <div
        aria-hidden
        style={{
          position: "absolute", top: -120, left: "50%",
          width: "min(1200px, 100%)", height: 720,
          transform: "translateX(-50%)",
          background:
            "radial-gradient(60% 60% at 50% 40%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 70%)",
          filter: "blur(46px)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute", bottom: -200, left: "50%",
          width: "min(900px, 95%)", height: 420,
          transform: "translateX(-50%)",
          background:
            "radial-gradient(50% 55% at 50% 50%, color-mix(in srgb, var(--purple) 14%, transparent), transparent 72%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      <div
        className="landing-hero-inner"
        style={{
          position: "relative",
          maxWidth: 1240, margin: "0 auto",
          padding: "clamp(2.5rem, 8vw, 7rem) clamp(1rem, 3vw, 2.5rem) clamp(3rem, 8vw, 6.5rem)",
          display: "grid", gridTemplateColumns: "1fr",
          gap: "clamp(1.5rem, 4vw, 3rem)",
        }}
      >
        {/* Copy column — centered narrative */}
        <div style={{ maxWidth: 820, margin: "0 auto", textAlign: "center" }}>
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
              /* Now that the mockup column is gone, the headline carries more
               * of the hero's visual weight — push the desktop max up a notch
               * and tighten letter-spacing so the gradient word lands cleanly. */
              fontSize: "clamp(2.1rem, 7vw, 4.25rem)",
              fontWeight: 800,
              lineHeight: 1.04,
              letterSpacing: "-0.036em",
              color: "var(--text)",
              margin: 0,
              maxWidth: "18ch",
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

          {/* Decorative accent wave — purely visual flourish, suggests the
           * "data trajectory" the cockpit promises without showing any actual
           * chart or numbers. */}
          <motion.div
            {...fadeIn(0.42)}
            aria-hidden
            className="hero-wave"
            style={{
              marginTop: "clamp(2rem, 5vw, 3.25rem)",
              width: "min(620px, 100%)",
              marginInline: "auto",
            }}
          >
            <svg viewBox="0 0 620 70" preserveAspectRatio="none" style={{ width: "100%", height: "auto", display: "block" }}>
              <defs>
                <linearGradient id="hero-wave-stroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%"   stopColor="var(--accent)" stopOpacity="0" />
                  <stop offset="18%"  stopColor="var(--accent)" stopOpacity="0.55" />
                  <stop offset="82%"  stopColor="var(--accent-2)" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="var(--accent-2)" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="hero-wave-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"  stopColor="var(--accent)" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 52 C 80 50, 130 40, 200 32 S 320 18, 400 22 S 540 38, 620 28 L 620 70 L 0 70 Z"
                fill="url(#hero-wave-fill)"
              />
              <path
                d="M 0 52 C 80 50, 130 40, 200 32 S 320 18, 400 22 S 540 38, 620 28"
                fill="none"
                stroke="url(#hero-wave-stroke)"
                strokeWidth="1.6"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
              {/* Three subtle waypoint dots tracking the curve */}
              <circle cx="200" cy="32" r="2.4" fill="var(--accent)" opacity="0.7" />
              <circle cx="400" cy="22" r="2.4" fill="var(--accent)" opacity="0.85" />
              <circle cx="620" cy="28" r="3"   fill="var(--accent-2)" />
            </svg>
          </motion.div>
        </div>
      </div>
    </section>
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
                    Audemars (J-21), Béatrice Favre (J-28). Rossi SA présente un risque
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

// ── Three pillars — what the cockpit promises ────────────────────────────────

type Pillar = {
  Icon: LucideIcon; color: string; bg: string;
  title: string; body: string; meta: string;
  bullets?: string[];
};

const pillars: Pillar[] = [
  {
    Icon: Globe, color: "var(--info)", bg: "var(--info-tint)",
    title: "Vue 360°",
    body: "Helvebroker SA et Odoo fusionnés en un cockpit unique. Marge, cash-flow, sinistralité, rétention — toutes vos métriques sur une même surface.",
    meta: "Synchronisation < 3 min",
  },
  {
    Icon: Sparkles, color: "var(--purple)", bg: "var(--purple-tint)",
    title: "Trois agents IA",
    body: "Renouvellements, commissions, rapports — vos trois agents préparent les actions chaque nuit. Vous validez en quelques clics le matin.",
    meta: "Préparation chaque nuit",
  },
  {
    Icon: ShieldCheck, color: "var(--success)", bg: "var(--success-tint)",
    title: "Souverain & conforme",
    body: "Aucune donnée client ne quitte la Suisse.",
    bullets: [
      "Synchronisation < 3 min",
      "Préparation chaque nuit",
      "Hébergement Suisse · LPD Art.16",
    ],
    meta: "Hébergement Suisse · LPD Art.16",
  },
];

function PillarsSection() {
  const reduce = useReducedMotionSafe();
  return (
    <section id="piliers" className="landing-section">
      <SectionHeader title="Conçu pour les cabinets BFSI suisses." />
      <div className="pillars-grid" style={{ marginTop: "clamp(1.5rem, 3vw, 2.5rem)" }}>
        {pillars.map((p, i) => (
          <PillarCard key={p.title} pillar={p} index={i} reduce={reduce} />
        ))}
      </div>
    </section>
  );
}

function PillarCard({
  pillar, index, reduce,
}: { pillar: Pillar; index: number; reduce: boolean | null }) {
  const { Icon } = pillar;
  return (
    <motion.div
      initial={reduce ? { opacity: 1 } : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay: reduce ? 0 : index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{ display: "flex" }}
    >
      {/* Inner div owns the hover lift so it never fights framer's entrance transform. */}
      <div
        style={{
          flex: 1,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "clamp(1.15rem, 2.5vw, 1.5rem)",
          display: "flex", flexDirection: "column", gap: "0.85rem",
          boxShadow: "var(--tier-1)",
          transition: "box-shadow 0.22s ease, transform 0.18s ease, border-color 0.22s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = "var(--tier-2)";
          e.currentTarget.style.borderColor = "color-mix(in srgb, var(--accent) 24%, var(--border))";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "var(--tier-1)";
          e.currentTarget.style.borderColor = "var(--border)";
        }}
      >
        <span
          aria-hidden
          style={{
            width: 38, height: 38, borderRadius: 10,
            background: pillar.bg, color: pillar.color,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
          }}
        >
          <Icon size={18} strokeWidth={2} />
        </span>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", flex: 1 }}>
          <h3
            style={{
              fontSize: "1.05rem", fontWeight: 700,
              letterSpacing: "-0.02em", color: "var(--text)",
              margin: 0, lineHeight: 1.2,
            }}
          >
            {pillar.title}
          </h3>
          <p
            style={{
              fontSize: "0.9rem", lineHeight: 1.55,
              color: "var(--text-3)", margin: 0,
            }}
          >
            {pillar.body}
          </p>
          {pillar.bullets && (
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: "0.5rem 0 0",
                display: "flex",
                flexDirection: "column",
                gap: "0.4rem",
              }}
            >
              {pillar.bullets.map((b) => (
                <li
                  key={b}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.5rem",
                    fontSize: "0.84rem",
                    lineHeight: 1.45,
                    color: "var(--text-2)",
                    letterSpacing: "-0.005em",
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 4,
                      background: pillar.bg,
                      color: pillar.color,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    <Check size={10} strokeWidth={3} />
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div
          style={{
            paddingTop: "0.7rem",
            borderTop: "1px solid var(--border)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.62rem", fontWeight: 600,
            letterSpacing: "0.1em", textTransform: "uppercase",
            color: "var(--text-4)",
          }}
        >
          {pillar.meta}
        </div>
      </div>
    </motion.div>
  );
}

// ── Calm vs Chaos ────────────────────────────────────────────────────────────

function CalmChaosSection() {
  return (
    <section id="calme" className="landing-section">
      <SectionHeader
        eyebrow="Avant / Après"
        title="Moins d'onglets. Plus de décisions."
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

// ── Section header (shared) ──────────────────────────────────────────────────

function SectionHeader({
  eyebrow, title, sub,
}: { eyebrow?: string; title: string; sub?: string }) {
  const reduce = useReducedMotionSafe();
  return (
    <motion.div
      initial={reduce ? { opacity: 1 } : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{ textAlign: "center", maxWidth: 720, marginInline: "auto" }}
    >
      {eyebrow && (
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
      )}
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
