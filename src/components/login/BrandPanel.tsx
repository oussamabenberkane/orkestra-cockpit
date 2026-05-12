"use client";

import { motion } from "framer-motion";

export default function BrandPanel() {
  return (
    <motion.div
      initial={{ x: "-100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{ backgroundColor: "#1E2761", width: "42%" }}
      className="relative flex flex-col justify-between p-10 overflow-hidden flex-shrink-0"
    >
      {/* Hex grid background */}
      <div className="hex-grid-bg">
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

      {/* Top: Logo + Brand */}
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-12">
          <svg viewBox="0 0 60 70" fill="none" style={{ width: 48, height: 48 }}>
            <polygon
              points="30,2 58,17.5 58,52.5 30,68 2,52.5 2,17.5"
              fill="none"
              stroke="#2B3AE8"
              strokeWidth="3"
            />
            <polygon
              points="30,12 48,22.5 48,47.5 30,58 12,47.5 12,22.5"
              fill="#2B3AE8"
              opacity="0.5"
            />
            <polygon
              points="30,22 38,27 38,43 30,48 22,43 22,27"
              fill="#2B3AE8"
            />
          </svg>
          <div>
            <div
              style={{
                fontSize: "0.8rem",
                fontWeight: 800,
                color: "white",
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
            fontSize: "1.8rem",
            fontWeight: 800,
            color: "white",
            lineHeight: 1.2,
            letterSpacing: "-0.5px",
          }}
        >
          Pilotez votre cabinet avec intelligence
        </h1>
        <p
          style={{
            marginTop: "1rem",
            fontSize: "0.9rem",
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.6,
          }}
        >
          Cockpit unifié BrokerStar + Odoo pour les cabinets BFSI suisses.
        </p>
      </div>

      {/* Bottom: Pills + compliance */}
      <div className="relative z-10">
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
          <span
            style={{
              background: "#EFF6FF",
              color: "#2563EB",
              border: "1px solid #BFDBFE",
              borderRadius: "20px",
              padding: "0.3rem 0.8rem",
              fontSize: "0.72rem",
              fontWeight: 600,
            }}
          >
            ● BrokerStar
          </span>
          <span
            style={{
              background: "#F5F3FF",
              color: "#7C3AED",
              border: "1px solid #DDD6FE",
              borderRadius: "20px",
              padding: "0.3rem 0.8rem",
              fontSize: "0.72rem",
              fontWeight: 600,
            }}
          >
            ● Odoo
          </span>
          <span
            style={{
              background: "#ECFDF5",
              color: "#10B981",
              border: "1px solid #A7F3D0",
              borderRadius: "20px",
              padding: "0.3rem 0.8rem",
              fontSize: "0.72rem",
              fontWeight: 600,
            }}
          >
            ⊕ Combiné
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.7rem",
            color: "rgba(255,255,255,0.35)",
          }}
        >
          <span>🇨🇭</span>
          <span>LPD Art.16 conforme — Infomaniak CH</span>
        </div>
      </div>
    </motion.div>
  );
}
