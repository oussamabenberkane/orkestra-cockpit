"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

type Variant = {
  letter: string;
  href: string;
  name: string;
  reference: string;
  tagline: string;
  signature: string[];
  swatches: string[];
  preview: React.ReactNode;
};

const variants: Variant[] = [
  {
    letter: "A",
    href: "/a/login",
    name: "Cockpit Standard",
    reference: "Version actuelle",
    tagline:
      "Le cockpit en place. Sidebar foncée, pills colorées, grille de tuiles — l'aspect actuel d'Orkestra.",
    signature: ["Sidebar foncée", "Pills source", "6 tuiles couleur"],
    swatches: ["#1E2761", "#2B3AE8", "#10B981", "#F4F6FB"],
    preview: <PreviewA />,
  },
  {
    letter: "B",
    href: "/b/login",
    name: "Forge",
    reference: "Linear · Stripe Connect · Brex",
    tagline:
      "SaaS standard pro. Sidebar rail, densité maîtrisée, strip de variations « depuis hier », sparklines partout. La référence du genre.",
    signature: ["Sidebar workspace", "Delta strip", "Sparklines inline"],
    swatches: ["#FAFAFA", "#0F172A", "#3B5B7E", "#E5E7EB"],
    preview: <PreviewForge />,
  },
  {
    letter: "C",
    href: "/c/login",
    name: "Halo",
    reference: "Mercury · Stripe Atlas · Pylon",
    tagline:
      "Light tiède, typographie-driven. Pas de sidebar, beaucoup d'air, KPIs en grand, sources en filigrane. La direction « calm money software ».",
    signature: ["Top-nav", "Numéros count-up", "Hover source breakdown"],
    swatches: ["#FAF7F2", "#1F1E1B", "#1F6F5B", "#C9A158"],
    preview: <PreviewHalo />,
  },
  {
    letter: "D",
    href: "/d/login",
    name: "Aperture",
    reference: "Mercury Treasury · Linear Project",
    tagline:
      "Hero KPI avec satellites. Un grand chiffre avec chart annoté, deux petits KPIs flanquants, strip d'actions prioritaires. Le dashboard qui raconte une histoire.",
    signature: ["Hero + satellites", "Chart annoté", "3 actions du jour"],
    swatches: ["#FAFBFB", "#0F172A", "#1E40AF", "#DBEAFE"],
    preview: <PreviewAperture />,
  },
  {
    letter: "E",
    href: "/e/login",
    name: "Onyx",
    reference: "Linear Dark · Vercel · Raycast",
    tagline:
      "Dark élégant, pas terminal. Trois paliers de surface, bordures presque invisibles, focus glow. La sophistication des produits modernes en mode nuit.",
    signature: ["3 paliers surface", "Glow focus", "Indigo accent"],
    swatches: ["#0B0C0F", "#14161B", "#818CF8", "#1B1E25"],
    preview: <PreviewOnyx />,
  },
  {
    letter: "F",
    href: "/f/login",
    name: "Plinth",
    reference: "Things 3 · Cron · macOS Sonoma",
    tagline:
      "Élévation en strates. Cartes avec double ombre (inner tight + outer soft), chiffres à poids mixtes, transitions 220ms. La polish keynote Apple appliquée à un dashboard.",
    signature: ["Double ombre", "Poids mixtes", "Transitions soyeuses"],
    swatches: ["#F5F5F7", "#1D1D1F", "#5856D6", "#FBFBFD"],
    preview: <PreviewPlinth />,
  },
];

export default function SelectorClient() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        style={{
          padding: "1.25rem clamp(1.5rem, 4vw, 3rem)",
          borderBottom: "1px solid #E5E7EB",
          background: "#FFFFFF",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <svg viewBox="0 0 60 70" fill="none" style={{ width: 24, height: 24 }}>
              <polygon
                points="30,2 58,17.5 58,52.5 30,68 2,52.5 2,17.5"
                fill="none"
                stroke="#1E2761"
                strokeWidth="3"
              />
              <polygon
                points="30,22 38,27 38,43 30,48 22,43 22,27"
                fill="#2B3AE8"
              />
            </svg>
            <span
              style={{
                fontSize: "0.95rem",
                fontWeight: 600,
                color: "#0F172A",
                letterSpacing: "-0.01em",
              }}
            >
              Orkestra · Cockpit
            </span>
          </div>
          <span
            style={{
              fontSize: "0.78rem",
              color: "#64748B",
              fontWeight: 500,
            }}
          >
            Présentation interne — Cabinet Müller &amp; Associés SA
          </span>
        </div>
      </header>

      <main
        style={{
          flex: 1,
          maxWidth: "1280px",
          width: "100%",
          margin: "0 auto",
          padding: "clamp(2rem, 5vw, 3.5rem) clamp(1.5rem, 4vw, 3rem)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: "clamp(2rem, 4vw, 2.5rem)", maxWidth: "680px" }}
        >
          <div
            style={{
              fontSize: "0.74rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#2563EB",
              marginBottom: "0.85rem",
            }}
          >
            Six directions à explorer
          </div>
          <h1
            style={{
              fontSize: "clamp(1.85rem, 3.5vw, 2.6rem)",
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
              color: "#0F172A",
              margin: 0,
              marginBottom: "0.75rem",
            }}
          >
            Choisissez la direction de design à présenter.
          </h1>
          <p
            style={{
              fontSize: "1rem",
              lineHeight: 1.55,
              color: "#475569",
              margin: 0,
            }}
          >
            Le même cockpit, six langues visuelles. Mêmes KPIs, mêmes sources, mêmes flux —
            seuls changent l&apos;ambiance, la densité et la grammaire produit.
          </p>
        </motion.div>

        <div
          className="selector-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "clamp(1rem, 2vw, 1.25rem)",
          }}
        >
          {variants.map((v, i) => (
            <motion.div
              key={v.letter}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.08 + i * 0.06,
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <VariantCard variant={v} />
            </motion.div>
          ))}
        </div>
      </main>

      <footer
        style={{
          padding: "1rem clamp(1.5rem, 4vw, 3rem)",
          borderTop: "1px solid #E5E7EB",
          fontSize: "0.74rem",
          color: "#64748B",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <span>Orkestra — Malyz Consulting Sàrl · Démo v0.1</span>
          <span>CH · Infomaniak · LPD Art.16</span>
        </div>
      </footer>

      <style>{`
        @media (max-width: 1100px) {
          .selector-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 700px) {
          .selector-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function VariantCard({ variant }: { variant: Variant }) {
  return (
    <Link
      href={variant.href}
      style={{
        display: "block",
        textDecoration: "none",
        color: "inherit",
        height: "100%",
      }}
    >
      <motion.article
        whileHover={{ y: -3 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: "14px",
          overflow: "hidden",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          boxShadow:
            "0 1px 2px rgba(15,23,42,0.04), 0 4px 12px -8px rgba(15,23,42,0.08)",
          cursor: "pointer",
          transition: "border-color 0.2s, box-shadow 0.2s",
        }}
      >
        <div
          style={{
            height: "168px",
            borderBottom: "1px solid #E5E7EB",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {variant.preview}
        </div>

        <div
          style={{
            padding: "1.1rem 1.25rem 1.25rem",
            display: "flex",
            flexDirection: "column",
            flex: 1,
            gap: "0.75rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: "0.5rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.65rem" }}>
              <span
                style={{
                  fontSize: "0.66rem",
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#94A3B8",
                  background: "#F1F5F9",
                  padding: "0.12rem 0.4rem",
                  borderRadius: "4px",
                }}
              >
                {variant.letter}
              </span>
              <h2
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 600,
                  color: "#0F172A",
                  letterSpacing: "-0.015em",
                  margin: 0,
                }}
              >
                {variant.name}
              </h2>
            </div>
          </div>

          <p
            style={{
              fontSize: "0.78rem",
              lineHeight: 1.5,
              color: "#475569",
              margin: 0,
              flex: 1,
            }}
          >
            {variant.tagline}
          </p>

          <div
            style={{
              fontSize: "0.66rem",
              fontWeight: 500,
              color: "#94A3B8",
              letterSpacing: "0.04em",
              fontStyle: "italic",
            }}
          >
            inspiré de — {variant.reference}
          </div>

          <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "0.2rem" }}>
              {variant.swatches.map((c) => (
                <span
                  key={c}
                  title={c}
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "3px",
                    background: c,
                    border: "1px solid rgba(15,23,42,0.08)",
                  }}
                />
              ))}
            </div>
            <span style={{ flex: 1 }} />
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                fontSize: "0.74rem",
                fontWeight: 600,
                color: "#2563EB",
              }}
            >
              Explorer
              <ArrowUpRight size={13} strokeWidth={2.25} />
            </span>
          </div>

          <div
            style={{
              display: "flex",
              gap: "0.35rem",
              flexWrap: "wrap",
              paddingTop: "0.6rem",
              borderTop: "1px solid #F1F5F9",
            }}
          >
            {variant.signature.map((s) => (
              <span
                key={s}
                style={{
                  fontSize: "0.66rem",
                  fontWeight: 500,
                  color: "#64748B",
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  padding: "0.18rem 0.45rem",
                  borderRadius: "100px",
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </motion.article>
    </Link>
  );
}

/* ─── Previews ─── */

function PreviewA() {
  return (
    <div style={{ position: "absolute", inset: 0, background: "#F4F6FB", display: "flex" }}>
      <div style={{ width: 36, background: "#1E2761", padding: "8px 5px" }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              height: 5,
              width: "75%",
              background: i === 0 ? "#2B3AE8" : "rgba(255,255,255,0.16)",
              borderRadius: 2,
              marginBottom: 6,
            }}
          />
        ))}
      </div>
      <div style={{ flex: 1, padding: "12px 12px" }}>
        <div style={{ display: "flex", gap: 3, marginBottom: 8 }}>
          {["#2563EB", "#7C3AED", "#10B981"].map((c) => (
            <span
              key={c}
              style={{
                width: 28,
                height: 9,
                borderRadius: 9,
                background: c,
                opacity: 0.2,
                border: `1px solid ${c}`,
              }}
            />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 5, marginBottom: 7 }}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                height: 22,
                background: "#FFFFFF",
                border: "1px solid #E4E7F0",
                borderRadius: 5,
              }}
            />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 5 }}>
          {["#028090", "#10B981", "#EF4444"].map((c) => (
            <div
              key={c}
              style={{
                height: 48,
                background: "#FFFFFF",
                border: "1px solid #E4E7F0",
                borderRadius: 6,
                borderTop: `3px solid ${c}`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PreviewForge() {
  return (
    <div style={{ position: "absolute", inset: 0, background: "#FAFAFA", display: "flex" }}>
      <div style={{ width: 44, background: "#F4F4F5", borderRight: "1px solid #E5E7EB", padding: "8px 5px" }}>
        <div style={{ width: 18, height: 18, background: "#0F172A", borderRadius: 4, marginBottom: 10 }} />
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              height: 5,
              width: i === 0 ? "85%" : "70%",
              background: i === 0 ? "#3B5B7E" : "#D4D4D8",
              opacity: i === 0 ? 1 : 0.65,
              borderRadius: 2,
              marginBottom: 5,
            }}
          />
        ))}
      </div>
      <div style={{ flex: 1, padding: "11px 12px" }}>
        <div
          style={{
            fontSize: 8,
            color: "#475569",
            marginBottom: 6,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span style={{ color: "#3B5B7E", fontWeight: 600 }}>↑ 4 changements depuis hier</span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            background: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: 6,
            overflow: "hidden",
            marginBottom: 8,
          }}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                padding: 6,
                borderRight: i < 5 ? "1px solid #E5E7EB" : "none",
              }}
            >
              <div style={{ fontSize: 5, color: "#94A3B8", marginBottom: 2 }}>kpi {i}</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#0F172A" }}>92K</div>
              <svg viewBox="0 0 24 8" style={{ width: "100%", height: 5, marginTop: 1 }}>
                <polyline points="0,7 4,5 8,6 12,4 16,5 20,3 24,2" fill="none" stroke="#3B5B7E" strokeWidth="1" />
              </svg>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 5 }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                background: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: 6,
                padding: 6,
                height: 44,
              }}
            >
              <div style={{ width: 12, height: 12, background: "#DBEAFE", borderRadius: 3, marginBottom: 3 }} />
              <div style={{ fontSize: 6, color: "#475569" }}>domaine</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PreviewHalo() {
  return (
    <div style={{ position: "absolute", inset: 0, background: "#FAF7F2", padding: "11px 14px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
          paddingBottom: 6,
          borderBottom: "1px solid #EAE3D4",
        }}
      >
        <span style={{ fontSize: 8, color: "#1F1E1B", fontWeight: 600 }}>◆ CMA</span>
        <div style={{ display: "flex", gap: 5, fontSize: 6, color: "#807B72" }}>
          <span>Vue</span>
          <span>Domaines</span>
          <span>Agents</span>
        </div>
        <span style={{ fontSize: 6, color: "#807B72" }}>TM</span>
      </div>
      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 8, color: "#807B72", fontWeight: 500, marginBottom: 5 }}>
          Bonjour Thomas.
        </div>
        <div style={{ display: "flex", justifyContent: "space-around", gap: 8, marginTop: 6 }}>
          {[
            { v: "92.4K", l: "CA mensuel" },
            { v: "68%", l: "Marge" },
            { v: "+18K", l: "Cash" },
          ].map((kpi) => (
            <div key={kpi.l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#1F1E1B", letterSpacing: "-0.02em" }}>
                {kpi.v}
              </div>
              <div style={{ fontSize: 5, color: "#807B72", marginTop: 2 }}>{kpi.l}</div>
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          height: 1,
          background: "#EAE3D4",
          marginBottom: 8,
        }}
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 5 }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              background: "#FFFFFF",
              border: "1px solid #EAE3D4",
              borderRadius: 6,
              padding: 5,
              height: 38,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ fontSize: 5, color: "#807B72" }}>tuile</div>
            <div style={{ fontSize: 8, fontWeight: 600, color: "#1F1E1B" }}>18 %</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewAperture() {
  return (
    <div style={{ position: "absolute", inset: 0, background: "#FAFBFB", padding: "11px 12px" }}>
      <div
        style={{
          fontSize: 7,
          color: "#0F172A",
          fontWeight: 600,
          marginBottom: 8,
        }}
      >
        Bonjour Thomas — Mai 2026
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 6, marginBottom: 6 }}>
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: 6,
            padding: 7,
            position: "relative",
          }}
        >
          <div style={{ fontSize: 5, color: "#64748B", marginBottom: 1 }}>CA mensuel ⊕</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.02em" }}>
            92 400
          </div>
          <div style={{ fontSize: 5, color: "#059669", marginBottom: 4 }}>↗ +12 % YoY</div>
          <svg viewBox="0 0 120 30" style={{ width: "100%", height: 28 }}>
            <defs>
              <linearGradient id="sel-ap-grad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#1E40AF" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#1E40AF" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M 0 24 L 12 20 L 24 22 L 36 16 L 48 18 L 60 12 L 72 14 L 84 8 L 96 10 L 108 5 L 120 4 L 120 30 L 0 30 Z"
              fill="url(#sel-ap-grad)"
            />
            <polyline
              points="0,24 12,20 24,22 36,16 48,18 60,12 72,14 84,8 96,10 108,5 120,4"
              fill="none"
              stroke="#1E40AF"
              strokeWidth="1.4"
            />
            <circle cx="60" cy="12" r="2" fill="#1E40AF" />
            <circle cx="84" cy="8" r="2" fill="#1E40AF" />
          </svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div
            style={{
              flex: 1,
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: 6,
              padding: 5,
            }}
          >
            <div style={{ fontSize: 5, color: "#64748B" }}>Marge</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#0F172A" }}>68 %</div>
          </div>
          <div
            style={{
              flex: 1,
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: 6,
              padding: 5,
            }}
          >
            <div style={{ fontSize: 5, color: "#64748B" }}>Cash</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#0F172A" }}>+18K</div>
          </div>
        </div>
      </div>
      <div
        style={{
          background: "#EFF6FF",
          border: "1px solid #DBEAFE",
          borderRadius: 5,
          padding: "5px 7px",
          fontSize: 6,
        }}
      >
        <div style={{ color: "#1E40AF", fontWeight: 700, marginBottom: 2 }}>
          Trois choses aujourd&apos;hui →
        </div>
        <div style={{ color: "#475569", lineHeight: 1.4 }}>
          · Valider 4 renouvellements
          <br />· Relancer Rossi SA
        </div>
      </div>
    </div>
  );
}

function PreviewOnyx() {
  return (
    <div style={{ position: "absolute", inset: 0, background: "#0B0C0F", display: "flex" }}>
      <div
        style={{
          width: 44,
          background: "#14161B",
          borderRight: "1px solid rgba(255,255,255,0.07)",
          padding: "8px 5px",
        }}
      >
        <div style={{ width: 18, height: 18, background: "#818CF8", borderRadius: 4, marginBottom: 10 }} />
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              height: 5,
              width: i === 0 ? "85%" : "70%",
              background: i === 0 ? "#818CF8" : "rgba(255,255,255,0.18)",
              borderRadius: 2,
              marginBottom: 5,
              opacity: i === 0 ? 1 : 0.7,
            }}
          />
        ))}
      </div>
      <div style={{ flex: 1, padding: "11px 12px" }}>
        <div
          style={{
            fontSize: 8,
            color: "#E5E7EB",
            fontWeight: 500,
            marginBottom: 8,
          }}
        >
          Vue · Aujourd&apos;hui
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4, marginBottom: 8 }}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                background: "#14161B",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 5,
                padding: 5,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
            >
              <div style={{ fontSize: 5, color: "#94A3B8", marginBottom: 1 }}>kpi {i}</div>
              <div style={{ fontSize: 8, fontWeight: 600, color: "#E5E7EB" }}>92K</div>
              <svg viewBox="0 0 30 8" style={{ width: "100%", height: 5, marginTop: 1 }}>
                <polyline points="0,7 5,5 10,6 15,4 20,5 25,3 30,2" fill="none" stroke="#818CF8" strokeWidth="1" />
              </svg>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4 }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                background: "#14161B",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 5,
                padding: 5,
                height: 32,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
            >
              <div style={{ width: 10, height: 10, background: "rgba(129,140,248,0.18)", borderRadius: 3 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PreviewPlinth() {
  return (
    <div style={{ position: "absolute", inset: 0, background: "#F5F5F7", padding: "12px 14px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <span style={{ fontSize: 8, color: "#1D1D1F", fontWeight: 600 }}>CMA · Cockpit</span>
        <span style={{ fontSize: 5, color: "#86868B" }}>TM</span>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: 8,
        }}
      >
        {[
          { v: "92 400", l: "CA mensuel", t: "+12 %" },
          { v: "68 %", l: "Marge nette", t: "+4 pt" },
        ].map((k) => (
          <div
            key={k.l}
            style={{
              background: "#FFFFFF",
              borderRadius: 8,
              padding: 7,
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,1), 0 0 0 1px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.05), 0 6px 14px -10px rgba(0,0,0,0.12)",
            }}
          >
            <div style={{ fontSize: 5, color: "#86868B", marginBottom: 2 }}>{k.l}</div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#1D1D1F",
                letterSpacing: "-0.02em",
              }}
            >
              {k.v.split(" ")[0]}{" "}
              <span style={{ fontSize: 8, fontWeight: 500, color: "#86868B" }}>{k.v.split(" ")[1] ?? ""}</span>
            </div>
            <div style={{ fontSize: 5, color: "#34A853", marginTop: 2 }}>↗ {k.t}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              background: "#FFFFFF",
              borderRadius: 7,
              height: 38,
              padding: 5,
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,1), 0 0 0 1px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.05), 0 6px 14px -10px rgba(0,0,0,0.12)",
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                background: "rgba(88,86,214,0.14)",
                borderRadius: 3,
                marginBottom: 3,
              }}
            />
            <div style={{ fontSize: 5, color: "#86868B" }}>tuile</div>
          </div>
        ))}
      </div>
    </div>
  );
}
