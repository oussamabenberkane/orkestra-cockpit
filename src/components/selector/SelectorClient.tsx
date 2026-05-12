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
      "Le tableau de bord en place. Pills colorées, grille de tuiles, sidebar foncée — l'aspect actuel du cockpit Orkestra.",
    signature: ["Sidebar foncée", "Pills source", "6 tuiles couleur"],
    swatches: ["#1E2761", "#2B3AE8", "#10B981", "#F4F6FB"],
    preview: <PreviewA />,
  },
  {
    letter: "B",
    href: "/b/login",
    name: "Mercury",
    reference: "Mercury · Brex · Plaid",
    tagline:
      "Premium fintech. Off-white tiède, ombre douce, sparklines dans chaque KPI. La sensation d'un logiciel bancaire haut de gamme.",
    signature: ["Top bar workspace", "Sparklines KPI", "Élévation douce"],
    swatches: ["#FAFAF7", "#0F1419", "#0D7066", "#E7E3D8"],
    preview: <PreviewB />,
  },
  {
    letter: "C",
    href: "/c/login",
    name: "Atrium",
    reference: "Linear · Attio · Pylon",
    tagline:
      "Outil de productivité. Densité serrée, sidebar persistante, palette de commandes (⌘K). La référence des produits B2B modernes.",
    signature: ["Sidebar persistante", "Commande ⌘K", "Densité serrée"],
    swatches: ["#FAFAFA", "#0A0A0A", "#4F46E5", "#E4E4E7"],
    preview: <PreviewC />,
  },
  {
    letter: "D",
    href: "/d/login",
    name: "Bureau",
    reference: "Ramp · Stripe · Vercel",
    tagline:
      "Dashboard corporate avec personnalité. Grille bento à formats mixtes, charts intégrés, histoire de couleur de marque.",
    signature: ["Grille bento", "Charts intégrés", "Top-nav horizontale"],
    swatches: ["#FFFFFF", "#0F172A", "#1E40AF", "#C97A3F"],
    preview: <PreviewD />,
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
          style={{ marginBottom: "clamp(2rem, 4vw, 3rem)", maxWidth: "640px" }}
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
            Quatre directions à explorer
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
            Choisissez la direction de design à présenter au client.
          </h1>
          <p
            style={{
              fontSize: "1rem",
              lineHeight: 1.55,
              color: "#475569",
              margin: 0,
            }}
          >
            Le même cockpit, quatre langues visuelles. Sources, KPIs et flux identiques —
            seuls changent l&apos;ambiance et la grammaire produit. Cliquez pour ouvrir
            une direction.
          </p>
        </motion.div>

        <div
          className="selector-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "clamp(1rem, 2vw, 1.5rem)",
          }}
        >
          {variants.map((v, i) => (
            <motion.div
              key={v.letter}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.1 + i * 0.06,
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
        @media (max-width: 820px) {
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
        {/* Preview area */}
        <div
          style={{
            height: "188px",
            borderBottom: "1px solid #E5E7EB",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {variant.preview}
        </div>

        {/* Content */}
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
              gap: "0.75rem",
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
                Variante {variant.letter}
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
            <span
              style={{
                fontSize: "0.7rem",
                color: "#64748B",
                fontWeight: 500,
              }}
            >
              {variant.reference}
            </span>
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
                fontSize: 0,
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
                height: 56,
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

function PreviewB() {
  return (
    <div style={{ position: "absolute", inset: 0, background: "#FAFAF7", padding: "14px 16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
          padding: "0 0 8px",
          borderBottom: "1px solid #E7E3D8",
        }}
      >
        <span style={{ fontSize: 9, fontWeight: 600, color: "#0F1419" }}>CMA · Cockpit</span>
        <span style={{ fontSize: 8, color: "#6B7280" }}>⌘K</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 10 }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              background: "#FFFFFF",
              border: "1px solid #E7E3D8",
              borderRadius: 8,
              padding: 8,
              boxShadow: "0 1px 2px rgba(15,20,25,0.04)",
            }}
          >
            <div style={{ fontSize: 7, color: "#6B7280", marginBottom: 2 }}>KPI {i}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#0F1419" }}>92.4K</div>
            <svg viewBox="0 0 50 12" style={{ width: "100%", height: 10, marginTop: 4 }}>
              <polyline
                points="0,10 8,7 16,8 24,5 32,6 40,3 50,2"
                fill="none"
                stroke="#0D7066"
                strokeWidth="1.2"
              />
            </svg>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              background: "#FFFFFF",
              border: "1px solid #E7E3D8",
              borderRadius: 8,
              padding: 8,
              height: 50,
              boxShadow: "0 1px 2px rgba(15,20,25,0.04)",
            }}
          >
            <div style={{ width: 16, height: 16, background: "#E5F1EF", borderRadius: 4, marginBottom: 4 }} />
            <div style={{ fontSize: 7, color: "#6B7280" }}>Domaine {i}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewC() {
  return (
    <div style={{ position: "absolute", inset: 0, background: "#FAFAFA", display: "flex" }}>
      <div style={{ width: 50, background: "#F4F4F5", padding: "10px 6px", borderRight: "1px solid #E4E4E7" }}>
        <div style={{ height: 8, background: "#E4E4E7", borderRadius: 2, marginBottom: 8 }} />
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              height: 6,
              background: i === 1 ? "#4F46E5" : "#D4D4D8",
              opacity: i === 1 ? 1 : 0.5,
              borderRadius: 2,
              marginBottom: 6,
              width: "85%",
            }}
          />
        ))}
      </div>
      <div style={{ flex: 1, padding: "12px 14px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
            paddingBottom: 6,
            borderBottom: "1px solid #E4E4E7",
          }}
        >
          <span style={{ fontSize: 8, color: "#0A0A0A", fontWeight: 500 }}>Vue ▸ Aujourd&apos;hui</span>
          <span
            style={{
              fontSize: 7,
              border: "1px solid #E4E4E7",
              padding: "1px 4px",
              borderRadius: 3,
              color: "#71717A",
              background: "#FFFFFF",
            }}
          >
            ⌘K
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4, marginBottom: 10 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i}>
              <div style={{ fontSize: 6, color: "#71717A", marginBottom: 1 }}>L{i}</div>
              <div style={{ fontSize: 8, fontWeight: 600, color: "#0A0A0A" }}>189</div>
              <svg viewBox="0 0 30 8" style={{ width: "100%", height: 6, marginTop: 2 }}>
                <polyline
                  points="0,7 5,5 10,6 15,4 20,5 25,3 30,4"
                  fill="none"
                  stroke="#4F46E5"
                  strokeWidth="1"
                />
              </svg>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                background: "#FFFFFF",
                border: "1px solid #E4E4E7",
                borderRadius: 6,
                padding: 6,
                height: 40,
              }}
            >
              <div style={{ width: 12, height: 12, background: "#EEF2FF", borderRadius: 3, marginBottom: 3 }} />
              <div style={{ fontSize: 7, color: "#71717A" }}>Tile {i}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PreviewD() {
  return (
    <div style={{ position: "absolute", inset: 0, background: "#FFFFFF", padding: "10px 12px" }}>
      <div
        style={{
          display: "flex",
          gap: 12,
          fontSize: 7,
          paddingBottom: 6,
          borderBottom: "2px solid #1E40AF",
          color: "#475569",
          marginBottom: 12,
          fontWeight: 500,
        }}
      >
        <span style={{ color: "#1E40AF", fontWeight: 600 }}>CMA</span>
        <span>Vue</span>
        <span>Domaines</span>
        <span>Agents</span>
        <span>Rapports</span>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr 0.8fr",
          gridTemplateRows: "auto auto",
          gap: 6,
        }}
      >
        <div
          style={{
            gridRow: "span 2",
            background: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: 6,
            padding: 8,
            minHeight: 100,
          }}
        >
          <div style={{ fontSize: 7, color: "#64748B", marginBottom: 2 }}>CA mensuel</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>92 400</div>
          <svg viewBox="0 0 100 30" style={{ width: "100%", height: 50, marginTop: 4 }}>
            <defs>
              <linearGradient id="d-grad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#1E40AF" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#1E40AF" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M 0 22 L 12 18 L 24 20 L 36 14 L 48 16 L 60 10 L 72 12 L 84 6 L 100 4 L 100 30 L 0 30 Z"
              fill="url(#d-grad)"
            />
            <polyline
              points="0,22 12,18 24,20 36,14 48,16 60,10 72,12 84,6 100,4"
              fill="none"
              stroke="#1E40AF"
              strokeWidth="1.5"
            />
          </svg>
        </div>
        <div
          style={{
            background: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: 6,
            padding: 6,
          }}
        >
          <div style={{ fontSize: 6, color: "#64748B" }}>Sinistres</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#DC2626" }}>3</div>
          <div style={{ fontSize: 6, color: "#DC2626" }}>1 urgent</div>
        </div>
        <div
          style={{
            background: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: 6,
            padding: 6,
          }}
        >
          <div style={{ fontSize: 6, color: "#64748B" }}>Marge</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#0F172A" }}>68%</div>
          <div style={{ fontSize: 6, color: "#059669" }}>↗ +4pt</div>
        </div>
        <div
          style={{
            background: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: 6,
            padding: 6,
            gridColumn: "span 2",
          }}
        >
          <div style={{ fontSize: 6, color: "#64748B", marginBottom: 2 }}>Rétention</div>
          <svg viewBox="0 0 50 14" style={{ width: "100%", height: 18 }}>
            {[2, 4, 3, 6, 5, 8, 7, 9].map((v, i) => (
              <rect
                key={i}
                x={i * 6.2}
                y={14 - v}
                width={4}
                height={v}
                fill="#1E40AF"
                opacity={0.85}
              />
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}
