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
    name: "Aperture",
    reference: "Mercury Treasury · Linear Project",
    tagline:
      "Hero KPI avec satellites. Un grand chiffre avec chart annoté, satellites flanquants, strip d'actions prioritaires. La nav s'étend horizontalement au survol.",
    signature: ["Hero + satellites", "Nav extensible", "3 actions du jour"],
    swatches: ["#FAFBFB", "#0F172A", "#1E40AF", "#DBEAFE"],
    preview: <PreviewAperture />,
  },
  {
    letter: "C",
    href: "/c/login",
    name: "Plinth",
    reference: "Things 3 · Cron · macOS Sonoma",
    tagline:
      "Sidebar rétractable Linear-style. Cartes à double ombre, transitions soyeuses, polish keynote Apple. Chaque détail considéré.",
    signature: ["Sidebar rétractable", "Double ombre", "Transitions 220ms"],
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
          padding: "clamp(2rem, 5vw, 4rem) clamp(1.5rem, 4vw, 3rem)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: "clamp(2rem, 4vw, 3rem)", maxWidth: "680px" }}
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
            Trois directions à explorer
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
            Le même cockpit, trois grammaires visuelles. Mêmes KPIs, mêmes sources, mêmes flux —
            seuls changent l&apos;ambiance, la densité et la grammaire produit.
          </p>
        </motion.div>

        <div
          className="selector-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "clamp(1rem, 2vw, 1.5rem)",
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
            height: "186px",
            borderBottom: "1px solid #E5E7EB",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {variant.preview}
        </div>

        <div
          style={{
            padding: "1.25rem 1.4rem 1.4rem",
            display: "flex",
            flexDirection: "column",
            flex: 1,
            gap: "0.85rem",
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
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem" }}>
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#94A3B8",
                  background: "#F1F5F9",
                  padding: "0.15rem 0.45rem",
                  borderRadius: "4px",
                }}
              >
                {variant.letter}
              </span>
              <h2
                style={{
                  fontSize: "1.15rem",
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
              fontSize: "0.86rem",
              lineHeight: 1.55,
              color: "#475569",
              margin: 0,
              flex: 1,
            }}
          >
            {variant.tagline}
          </p>

          <div
            style={{
              fontSize: "0.7rem",
              fontWeight: 500,
              color: "#94A3B8",
              letterSpacing: "0.04em",
              fontStyle: "italic",
            }}
          >
            inspiré de — {variant.reference}
          </div>

          <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "0.25rem" }}>
              {variant.swatches.map((c) => (
                <span
                  key={c}
                  title={c}
                  style={{
                    width: 14,
                    height: 14,
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
                gap: "0.3rem",
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "#2563EB",
              }}
            >
              Explorer
              <ArrowUpRight size={14} strokeWidth={2.25} />
            </span>
          </div>

          <div
            style={{
              display: "flex",
              gap: "0.4rem",
              flexWrap: "wrap",
              paddingTop: "0.75rem",
              borderTop: "1px solid #F1F5F9",
            }}
          >
            {variant.signature.map((s) => (
              <span
                key={s}
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 500,
                  color: "#64748B",
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  padding: "0.2rem 0.5rem",
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
      <div style={{ width: 42, background: "#1E2761", padding: "10px 6px" }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              height: 6,
              width: "70%",
              background: i === 0 ? "#2B3AE8" : "rgba(255,255,255,0.18)",
              borderRadius: 2,
              marginBottom: 7,
            }}
          />
        ))}
      </div>
      <div style={{ flex: 1, padding: "14px 14px" }}>
        <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
          {["#2563EB", "#7C3AED", "#10B981"].map((c) => (
            <span
              key={c}
              style={{
                width: 36,
                height: 12,
                borderRadius: 12,
                background: c,
                opacity: 0.18,
                border: `1px solid ${c}`,
              }}
            />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 8 }}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                height: 28,
                background: "#FFFFFF",
                border: "1px solid #E4E7F0",
                borderRadius: 6,
              }}
            />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
          {["#028090", "#10B981", "#EF4444"].map((c) => (
            <div
              key={c}
              style={{
                height: 52,
                background: "#FFFFFF",
                border: "1px solid #E4E7F0",
                borderRadius: 8,
                borderTop: `3px solid ${c}`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PreviewAperture() {
  return (
    <div style={{ position: "absolute", inset: 0, background: "#FAFBFB", padding: "11px 12px" }}>
      {/* Top nav with hover-expand */}
      <div
        style={{
          display: "flex",
          gap: 6,
          fontSize: 7,
          paddingBottom: 5,
          borderBottom: "1px solid #E2E8F0",
          color: "#64748B",
          marginBottom: 8,
          fontWeight: 500,
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <span style={{ background: "#1E40AF", color: "#FFFFFF", fontWeight: 700, padding: "1px 4px", borderRadius: 2 }}>CMA</span>
        <span style={{ color: "#0F172A", fontWeight: 600 }}>Vue</span>
        <span style={{ background: "#DBEAFE", color: "#1E40AF", padding: "1px 3px", borderRadius: 2 }}>· Aujourd&apos;hui</span>
        <span style={{ background: "#DBEAFE", color: "#1E40AF", padding: "1px 3px", borderRadius: 2 }}>· Semaine</span>
        <span style={{ marginLeft: 4 }}>Domaines</span>
        <span style={{ opacity: 0.6 }}>Agents</span>
        <span style={{ opacity: 0.3 }}>Rapp…</span>
        <span
          aria-hidden
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 5,
            width: 24,
            background: "linear-gradient(to right, transparent, #FAFBFB)",
          }}
        />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 6, marginBottom: 6 }}>
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
          <div style={{ fontSize: 5, color: "#059669", marginBottom: 4 }}>↗ +12 %</div>
          <svg viewBox="0 0 120 26" style={{ width: "100%", height: 24 }}>
            <defs>
              <linearGradient id="sel-ap-grad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#1E40AF" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#1E40AF" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M 0 22 L 12 18 L 24 20 L 36 14 L 48 16 L 60 11 L 72 13 L 84 7 L 96 9 L 108 4 L 120 3 L 120 26 L 0 26 Z"
              fill="url(#sel-ap-grad)"
            />
            <polyline
              points="0,22 12,18 24,20 36,14 48,16 60,11 72,13 84,7 96,9 108,4 120,3"
              fill="none"
              stroke="#1E40AF"
              strokeWidth="1.4"
            />
            <line x1="108" y1="0" x2="108" y2="26" stroke="#1E40AF" strokeWidth="0.7" strokeDasharray="2 2" opacity="0.5" />
            <circle cx="108" cy="4" r="2" fill="#FFFFFF" stroke="#1E40AF" strokeWidth="1.2" />
          </svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ flex: 1, background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 6, padding: 5 }}>
            <div style={{ fontSize: 5, color: "#64748B" }}>Marge</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#0F172A" }}>68 %</div>
          </div>
          <div style={{ flex: 1, background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 6, padding: 5 }}>
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
          padding: "4px 6px",
          fontSize: 6,
        }}
      >
        <div style={{ color: "#1E40AF", fontWeight: 700, marginBottom: 2 }}>Trois choses aujourd&apos;hui →</div>
        <div style={{ color: "#475569", lineHeight: 1.3 }}>· Valider 4 renouv. · Relancer Rossi</div>
      </div>
    </div>
  );
}

function PreviewPlinth() {
  return (
    <div style={{ position: "absolute", inset: 0, background: "#F5F5F7", display: "flex" }}>
      {/* Sidebar */}
      <div
        style={{
          width: 50,
          background: "#FBFBFD",
          borderRight: "1px solid rgba(0,0,0,0.06)",
          padding: "10px 6px",
          display: "flex",
          flexDirection: "column",
          gap: 5,
        }}
      >
        <div
          style={{
            width: "100%",
            height: 18,
            background: "linear-gradient(to bottom, #5856D6, #4441C8)",
            borderRadius: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
            fontSize: 6,
            fontWeight: 700,
            boxShadow: "0 2px 6px -2px rgba(88,86,214,0.4)",
          }}
        >
          CMA
        </div>
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              width: "100%",
              height: 12,
              background: i === 0 ? "#FFFFFF" : "transparent",
              borderRadius: 3,
              boxShadow: i === 0 ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
            }}
          />
        ))}
      </div>
      <div style={{ flex: 1, padding: "11px 14px" }}>
        <div style={{ fontSize: 8, color: "#1D1D1F", fontWeight: 600, marginBottom: 8 }}>
          Bonjour Thomas
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 6 }}>
          {[
            { v: "92 400", l: "CA mensuel", t: "+12 %" },
            { v: "68 %", l: "Marge nette", t: "+4 pt" },
          ].map((k) => (
            <div
              key={k.l}
              style={{
                background: "#FFFFFF",
                borderRadius: 7,
                padding: 6,
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,1), 0 0 0 1px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.05), 0 6px 14px -10px rgba(0,0,0,0.14)",
              }}
            >
              <div style={{ fontSize: 5, color: "#86868B", marginBottom: 2 }}>{k.l}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#1D1D1F", letterSpacing: "-0.02em" }}>
                {k.v}
              </div>
              <div style={{ fontSize: 5, color: "#34A853", marginTop: 1 }}>↗ {k.t}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 5 }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                background: "#FFFFFF",
                borderRadius: 6,
                height: 30,
                padding: 4,
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,1), 0 0 0 1px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.05), 0 6px 14px -10px rgba(0,0,0,0.14)",
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  background: "rgba(88,86,214,0.14)",
                  borderRadius: 3,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
