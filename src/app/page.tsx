"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight, Sparkles, Globe, ShieldCheck,
  Percent, Wallet, Circle,
  type LucideIcon,
} from "lucide-react";
import { HeroPanel, type HeroEvent } from "@/components/dashboard/HeroPanel";
import { SatelliteKPI, type Satellite } from "@/components/dashboard/SatelliteKPI";

// ── Preview data (mirrors /dashboard so the landing feels like the product) ──
const previewData = [62, 64, 70, 68, 72, 78, 80, 82, 86, 88, 92, 92];
const previewMonths = ["juin", "juil.", "août", "sept.", "oct.", "nov.", "déc.", "janv.", "févr.", "mars", "avril", "mai"];
const previewEvents: HeroEvent[] = [
  { i: 9, label: "+9 200 CHF", sub: "Commission Dubois SA · mars" },
];

const previewSatellites: Satellite[] = [
  {
    label: "Marge nette", value: "68", unit: "%", trend: "+4 pt",
    spark: [55, 58, 60, 62, 63, 64, 64, 66, 67, 67, 68, 68],
    combined: true,
    breakdown: [
      { src: "Primes BS", val: "85.0 K" },
      { src: "Charges",   val: "27.2 K" },
      { src: "⊕ Marge",   val: "68 %" },
    ],
    Icon: Percent, target: "Obj. 70 %", sparkTarget: 70,
    modalKey: "finance",
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
    Icon: Wallet, target: "Obj. +20 K", sparkTarget: 20,
    modalKey: "finance",
  },
];

type PilierData = {
  Icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  title: string;
  body: string;
  note: string;
};

const piliers: PilierData[] = [
  {
    Icon: Globe,
    iconColor: "var(--accent)",
    iconBg: "var(--accent-tint)",
    title: "Vue 360°",
    body:
      "BrokerStar et Odoo fusionnés en un cockpit unique. Marge, cash-flow, sinistralité, rétention — toutes vos métriques sur une même surface.",
    note: "Sync 3 min",
  },
  {
    Icon: Sparkles,
    iconColor: "var(--purple)",
    iconBg: "var(--purple-tint)",
    title: "Trois agents IA",
    body:
      "Renouvellements, impayés, rapports — vos trois agents préparent les actions chaque nuit. Vous validez en quelques clics le matin.",
    note: "Préparation nocturne",
  },
  {
    Icon: ShieldCheck,
    iconColor: "var(--success)",
    iconBg: "var(--success-tint)",
    title: "Souverain & conforme",
    body:
      "LLM Mistral hébergé chez Infomaniak en Suisse. LPD Art.16 conforme. Aucune donnée client ne quitte Zürich.",
    note: "CH · LPD Art.16",
  },
];

// ─────────────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const router = useRouter();
  const [period, setPeriod] = useState<"M" | "T" | "A">("M");

  // KPI clicks in the preview become a soft lead-capture — route to /login.
  const onPreviewKpiOpen = () => router.push("/login");

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
        <Hero
          period={period}
          onPeriodChange={setPeriod}
          onPreviewKpiOpen={onPreviewKpiOpen}
        />
        <Piliers />
      </main>
      <Footer />
    </div>
  );
}

// ── Top navigation ───────────────────────────────────────────────────────────

function TopNav() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        backdropFilter: "saturate(140%) blur(12px)",
        WebkitBackdropFilter: "saturate(140%) blur(12px)",
        background: "rgba(255,255,255,0.78)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "0.75rem clamp(1.25rem, 3vw, 2.5rem)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <Link
          href="/"
          aria-label="Accueil"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.55rem",
            textDecoration: "none",
            color: "var(--text)",
          }}
        >
          <svg viewBox="0 0 60 70" fill="none" style={{ width: 26, height: 26 }} aria-hidden>
            <polygon
              points="30,2 58,17.5 58,52.5 30,68 2,52.5 2,17.5"
              fill="none" stroke="var(--accent)" strokeWidth="4"
            />
            <polygon
              points="30,12 48,22.5 48,47.5 30,58 12,47.5 12,22.5"
              fill="var(--accent)" opacity="0.4"
            />
            <polygon
              points="30,22 38,27 38,43 30,48 22,43 22,27"
              fill="var(--accent)"
            />
          </svg>
          <span
            style={{
              fontSize: "0.78rem",
              fontWeight: 800,
              letterSpacing: "1.8px",
              textTransform: "uppercase",
              color: "var(--text)",
            }}
          >
            Malyz
          </span>
          <span
            aria-hidden
            style={{
              width: 1, height: 16,
              background: "var(--border-strong)",
            }}
          />
          <span
            style={{
              fontSize: "0.92rem",
              fontWeight: 700,
              letterSpacing: "-0.015em",
              color: "var(--text)",
            }}
          >
            Ork<span style={{ color: "var(--accent)" }}>estra</span>
          </span>
        </Link>

        <Link
          href="/login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            height: 36,
            padding: "0 0.95rem",
            background: "linear-gradient(to bottom, var(--accent), var(--accent-2))",
            color: "#FFFFFF",
            fontFamily: "inherit",
            fontSize: "0.84rem",
            fontWeight: 600,
            letterSpacing: "-0.005em",
            borderRadius: 10,
            textDecoration: "none",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.25), 0 0 0 1px rgba(0,98,204,0.30), 0 4px 14px -4px rgba(0,122,255,0.40)",
            transition: "transform 0.22s ease, box-shadow 0.22s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow =
              "inset 0 1px 0 rgba(255,255,255,0.25), 0 0 0 1px rgba(0,98,204,0.30), 0 8px 20px -4px rgba(0,122,255,0.50)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow =
              "inset 0 1px 0 rgba(255,255,255,0.25), 0 0 0 1px rgba(0,98,204,0.30), 0 4px 14px -4px rgba(0,122,255,0.40)";
          }}
        >
          Se connecter
          <ArrowRight size={13} strokeWidth={2.25} />
        </Link>
      </div>
    </header>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────

function Hero({
  period,
  onPeriodChange,
  onPreviewKpiOpen,
}: {
  period: "M" | "T" | "A";
  onPeriodChange: (p: "M" | "T" | "A") => void;
  onPreviewKpiOpen: () => void;
}) {
  return (
    <section style={{ position: "relative", overflow: "hidden" }}>
      {/* Ambient depth — soft indigo bloom behind the preview */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -120,
          right: -160,
          width: 520,
          height: 520,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at center, rgba(0,122,255,0.16), rgba(0,122,255,0) 65%)",
          filter: "blur(20px)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: -180,
          left: -160,
          width: 440,
          height: 440,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at center, rgba(0,122,255,0.08), rgba(0,122,255,0) 65%)",
          filter: "blur(20px)",
          pointerEvents: "none",
        }}
      />

      <div
        className="landing-hero"
        style={{
          position: "relative",
          maxWidth: 1240,
          margin: "0 auto",
          padding: "clamp(2.5rem, 5vw, 4.5rem) clamp(1.25rem, 3vw, 2.5rem) clamp(2.5rem, 5vw, 4rem)",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.05fr)",
          gap: "clamp(2rem, 4vw, 3.5rem)",
          alignItems: "center",
        }}
      >
        {/* Left column — copy + CTA */}
        <div style={{ minWidth: 0 }}>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem",
              padding: "0.3rem 0.65rem",
              borderRadius: 100,
              background: "var(--accent-tint)",
              color: "var(--accent)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.66rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: "1.25rem",
            }}
          >
            <span
              aria-hidden
              className="animate-blink"
              style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "var(--accent)",
              }}
            />
            Cockpit BFSI · 2026
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontSize: "clamp(2.4rem, 5vw, 3.6rem)",
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.035em",
              color: "var(--text)",
              margin: 0,
              maxWidth: "13ch",
            }}
          >
            Pilotez votre cabinet
            <br />
            <span style={{ color: "var(--accent)" }}>avec intelligence.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{
              marginTop: "1.25rem",
              fontSize: "1.05rem",
              color: "var(--text-2)",
              lineHeight: 1.6,
              maxWidth: "44ch",
            }}
          >
            Un chiffre par mois. Trois actions par matin. Six modules à portée
            de clic. BrokerStar et Odoo enfin parlent la même langue.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{
              marginTop: "1.85rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.55rem",
                height: 48,
                padding: "0 1.4rem",
                background: "linear-gradient(to bottom, var(--accent), var(--accent-2))",
                color: "#FFFFFF",
                fontFamily: "inherit",
                fontSize: "0.98rem",
                fontWeight: 600,
                letterSpacing: "-0.005em",
                borderRadius: 12,
                textDecoration: "none",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.25), 0 0 0 1px rgba(0,98,204,0.30), 0 10px 28px -8px rgba(0,122,255,0.50)",
                transition: "transform 0.22s ease, box-shadow 0.22s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "inset 0 1px 0 rgba(255,255,255,0.25), 0 0 0 1px rgba(0,98,204,0.30), 0 16px 36px -10px rgba(0,122,255,0.60)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "inset 0 1px 0 rgba(255,255,255,0.25), 0 0 0 1px rgba(0,98,204,0.30), 0 10px 28px -8px rgba(0,122,255,0.50)";
              }}
            >
              Accéder au cockpit
              <ArrowRight size={16} strokeWidth={2.25} />
            </Link>

            <span
              style={{
                fontSize: "0.78rem",
                color: "var(--text-3)",
                letterSpacing: "-0.005em",
              }}
            >
              Démo Cabinet Müller &amp; Associés SA — pas de mot de passe requis.
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            style={{
              marginTop: "2.25rem",
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              flexWrap: "wrap",
            }}
          >
            <SourcePill dot="var(--info)" label="BrokerStar" />
            <SourcePill dot="var(--purple)" label="Odoo" />
            <SourcePill dot="var(--success)" label="⊕ Combiné" combined />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.66rem",
                color: "var(--text-4)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginLeft: "0.25rem",
              }}
            >
              CH · LPD Art.16
            </span>
          </motion.div>
        </div>

        {/* Right column — interactive dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.32, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="landing-preview"
          style={{ position: "relative", minWidth: 0 }}
        >
          {/* Floating "Aperçu interactif" chip */}
          <span
            style={{
              position: "absolute",
              top: -12,
              left: 16,
              zIndex: 2,
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.3rem 0.65rem",
              background: "var(--text)",
              color: "var(--surface)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.62rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              borderRadius: 100,
              boxShadow: "0 6px 18px -6px rgba(0,0,0,0.35)",
            }}
          >
            <Sparkles size={11} strokeWidth={2.25} />
            Aperçu interactif
          </span>

          <div
            style={{
              padding: "1.1rem",
              background: "var(--surface-2)",
              borderRadius: 18,
              boxShadow: "var(--tier-2)",
            }}
          >
            <div
              className="landing-preview-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.45fr) minmax(0, 1fr)",
                gap: "0.85rem",
                alignItems: "stretch",
              }}
            >
              <HeroPanel
                title="Chiffre d'affaires"
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
                style={{
                  display: "grid",
                  gridTemplateRows: "repeat(2, 1fr)",
                  gap: "0.85rem",
                  minWidth: 0,
                }}
              >
                {previewSatellites.map((s) => (
                  <SatelliteKPI key={s.label} kpi={s} onOpen={onPreviewKpiOpen} />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .landing-hero { grid-template-columns: 1fr !important; }
          .landing-preview-grid { grid-template-columns: minmax(0, 1fr) !important; }
        }
        @media (max-width: 720px) {
          .landing-preview { display: none !important; }
        }
      `}</style>
    </section>
  );
}

function SourcePill({
  dot, label, combined,
}: {
  dot: string;
  label: string;
  combined?: boolean;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        padding: "0.3rem 0.65rem",
        background: combined ? "var(--success-tint)" : "var(--surface)",
        color: combined ? "var(--success)" : "var(--text-2)",
        borderRadius: 100,
        fontSize: "0.74rem",
        fontWeight: 600,
        boxShadow: combined ? "none" : "var(--tier-1)",
        letterSpacing: "-0.005em",
      }}
    >
      <Circle size={6} strokeWidth={0} fill={dot} />
      {label}
    </span>
  );
}

// ── Piliers ──────────────────────────────────────────────────────────────────

function Piliers() {
  return (
    <section
      style={{
        maxWidth: 1240,
        margin: "0 auto",
        padding: "clamp(3rem, 6vw, 5rem) clamp(1.25rem, 3vw, 2.5rem)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ marginBottom: "2rem", textAlign: "center" }}
      >
        <span
          style={{
            display: "inline-block",
            fontFamily: "var(--font-mono)",
            fontSize: "0.66rem",
            fontWeight: 700,
            color: "var(--accent)",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            marginBottom: "0.65rem",
          }}
        >
          Trois piliers
        </span>
        <h2
          style={{
            fontSize: "clamp(1.6rem, 3vw, 2rem)",
            fontWeight: 700,
            letterSpacing: "-0.025em",
            color: "var(--text)",
            margin: 0,
            maxWidth: "22ch",
            marginInline: "auto",
            lineHeight: 1.15,
          }}
        >
          Conçu pour les cabinets BFSI suisses.
        </h2>
      </motion.div>

      <div
        className="landing-piliers"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1rem",
        }}
      >
        {piliers.map((p, i) => (
          <Pilier key={p.title} pilier={p} index={i} />
        ))}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .landing-piliers { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

function Pilier({ pilier, index }: { pilier: PilierData; index: number }) {
  const { Icon } = pilier;
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: "var(--surface)",
        borderRadius: 16,
        padding: "1.6rem 1.5rem",
        boxShadow: "var(--tier-1)",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        transition: "box-shadow 0.22s ease, transform 0.22s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--tier-2)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--tier-1)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
      }}
    >
      <span
        style={{
          width: 42, height: 42,
          background: pilier.iconBg,
          color: pilier.iconColor,
          borderRadius: 12,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.65)",
        }}
        aria-hidden
      >
        <Icon size={20} strokeWidth={2} />
      </span>
      <div style={{ flex: 1 }}>
        <h3
          style={{
            fontSize: "1.1rem",
            fontWeight: 700,
            letterSpacing: "-0.015em",
            color: "var(--text)",
            margin: 0,
            marginBottom: "0.45rem",
          }}
        >
          {pilier.title}
        </h3>
        <p
          style={{
            fontSize: "0.92rem",
            color: "var(--text-3)",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {pilier.body}
        </p>
      </div>
      <div
        style={{
          paddingTop: "0.8rem",
          background:
            "linear-gradient(to right, transparent, var(--border) 12%, var(--border) 88%, transparent) top / 100% 1px no-repeat",
          fontFamily: "var(--font-mono)",
          fontSize: "0.66rem",
          fontWeight: 600,
          color: "var(--text-4)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {pilier.note}
      </div>
    </motion.article>
  );
}

// ── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        padding: "1.25rem clamp(1.25rem, 3vw, 2.5rem)",
        background: "var(--surface)",
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
          fontSize: "0.72rem",
          color: "var(--text-4)",
          flexWrap: "wrap",
        }}
      >
        <span>© 2026 Cabinet Müller &amp; Associés SA · Zürich</span>
        <span>LPD Art.16 · Infomaniak CH · Mistral Large</span>
      </div>
    </footer>
  );
}
