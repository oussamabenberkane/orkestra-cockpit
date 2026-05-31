"use client";

import { motion } from "framer-motion";

const NAVY = "#1E2761";

export default function BrandPanel() {
  return (
    <motion.aside
      initial={{ x: "-100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="hidden md:flex relative flex-col justify-between p-10 overflow-hidden shrink-0 md:w-[42%]"
      style={{ backgroundColor: NAVY, color: "#FFFFFF" }}
    >
      {/* Hex grid background */}
      <div className="hex-grid-bg" aria-hidden>
        {[
          { top: "10%", left: "15%", size: 120, delay: "0s" },
          { top: "25%", left: "55%", size: 80, delay: "1.5s" },
          { top: "50%", left: "10%", size: 160, delay: "0.8s" },
          { top: "65%", left: "60%", size: 100, delay: "2.2s" },
          { top: "80%", left: "30%", size: 70, delay: "1s" },
          { top: "5%", left: "70%", size: 90, delay: "3s" },
        ].map((hex, i) => (
          <svg
            key={i}
            viewBox="0 0 60 70"
            fill="none"
            style={{
              top: hex.top,
              left: hex.left,
              width: hex.size,
              height: hex.size,
              animationDelay: hex.delay,
              opacity: 0.05,
            }}
          >
            <polygon
              points="30,2 58,17.5 58,52.5 30,68 2,52.5 2,17.5"
              fill="none"
              stroke="white"
              strokeWidth="2"
            />
          </svg>
        ))}
      </div>

      {/* Soft radial gradient overlay for depth */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(60% 50% at 20% 10%, rgba(88,86,214,0.18), transparent 60%), radial-gradient(70% 60% at 90% 90%, rgba(0,0,0,0.20), transparent 60%)",
          pointerEvents: "none",
        }}
      />

      {/* Top: Logo + brand text */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "3rem" }}>
          <svg viewBox="0 0 60 70" fill="none" style={{ width: 48, height: 48 }}>
            <polygon
              points="30,2 58,17.5 58,52.5 30,68 2,52.5 2,17.5"
              fill="none"
              stroke="#5856D6"
              strokeWidth="3"
            />
            <polygon
              points="30,12 48,22.5 48,47.5 30,58 12,47.5 12,22.5"
              fill="#5856D6"
              opacity="0.5"
            />
            <polygon
              points="30,22 38,27 38,43 30,48 22,43 22,27"
              fill="#5856D6"
            />
          </svg>
          <div>
            <div
              style={{
                fontSize: "0.8rem",
                fontWeight: 800,
                color: "#FFFFFF",
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              Malyz
            </div>
            <div
              style={{
                fontSize: "0.6rem",
                color: "rgba(255,255,255,0.4)",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              Consulting Sàrl
            </div>
          </div>
        </div>

        {/* Tagline */}
        <h1
          style={{
            fontSize: "1.85rem",
            fontWeight: 700,
            color: "#FFFFFF",
            lineHeight: 1.15,
            letterSpacing: "-0.025em",
            maxWidth: "16ch",
          }}
        >
          Bonjour Mirko, votre cockpit Helvebroker est prêt.
        </h1>
        <p
          style={{
            marginTop: "1rem",
            fontSize: "0.92rem",
            color: "rgba(255,255,255,0.6)",
            lineHeight: 1.6,
            maxWidth: "36ch",
          }}
        >
          Cockpit unifié Helvebroker SA + Odoo pour les cabinets BFSI suisses.
        </p>
      </div>

      {/* Bottom: Pills + compliance */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
          <Pill bg="rgba(0,122,255,0.14)"  fg="#9CCAFF"  bd="rgba(0,122,255,0.30)">● Helvebroker SA</Pill>
          <Pill bg="rgba(88,86,214,0.18)"  fg="#C7C5FF"  bd="rgba(88,86,214,0.34)">● Odoo</Pill>
          <Pill bg="rgba(52,168,83,0.16)"  fg="#A6E3B5"  bd="rgba(52,168,83,0.30)">⊕ Combiné</Pill>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.7rem",
            color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.04em",
          }}
        >
          <span style={{
            display: "inline-flex",
            alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-mono)",
            fontSize: "0.62rem", fontWeight: 700,
            color: "rgba(255,255,255,0.7)",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            padding: "0.15rem 0.4rem",
            borderRadius: 4,
            letterSpacing: "0.08em",
          }}>CH</span>
          <span>LPD Art.16 conforme · Infomaniak CH</span>
        </div>
      </div>
    </motion.aside>
  );
}

function Pill({
  children, bg, fg, bd,
}: {
  children: React.ReactNode;
  bg: string;
  fg: string;
  bd: string;
}) {
  return (
    <span style={{
      background: bg,
      color: fg,
      border: `1px solid ${bd}`,
      borderRadius: "20px",
      padding: "0.3rem 0.8rem",
      fontSize: "0.72rem",
      fontWeight: 600,
    }}>
      {children}
    </span>
  );
}
