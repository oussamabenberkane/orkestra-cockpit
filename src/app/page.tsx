"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(2rem, 5vw, 4rem) 1.5rem",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            width: "100%",
            maxWidth: "520px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "1.5rem",
          }}
        >
          {/* Brand mark */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <svg viewBox="0 0 60 70" fill="none" style={{ width: 44, height: 44 }}>
              <polygon
                points="30,2 58,17.5 58,52.5 30,68 2,52.5 2,17.5"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="3"
              />
              <polygon
                points="30,12 48,22.5 48,47.5 30,58 12,47.5 12,22.5"
                fill="var(--accent)"
                opacity="0.5"
              />
              <polygon
                points="30,22 38,27 38,43 30,48 22,43 22,27"
                fill="var(--accent)"
              />
            </svg>
            <div style={{ lineHeight: 1.05 }}>
              <div
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 800,
                  color: "var(--text)",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                }}
              >
                Malyz
              </div>
              <div
                style={{
                  fontSize: "0.6rem",
                  color: "var(--text-3)",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  marginTop: "2px",
                }}
              >
                Consulting Sàrl
              </div>
            </div>
          </div>

          {/* Tagline */}
          <h1
            style={{
              fontSize: "clamp(2rem, 4vw, 2.6rem)",
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              color: "var(--text)",
              margin: 0,
              maxWidth: "14ch",
            }}
          >
            Pilotez votre cabinet avec intelligence.
          </h1>
          <p
            style={{
              fontSize: "0.96rem",
              color: "var(--text-3)",
              lineHeight: 1.6,
              maxWidth: "42ch",
              margin: 0,
            }}
          >
            Cockpit unifié BrokerStar + Odoo pour Cabinet Müller &amp; Associés SA.
          </p>

          {/* CTA */}
          <Link
            href="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.85rem 1.3rem",
              marginTop: "0.5rem",
              background: "linear-gradient(to bottom, var(--accent), var(--accent-2))",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "12px",
              fontFamily: "inherit",
              fontSize: "0.95rem",
              fontWeight: 600,
              cursor: "pointer",
              textDecoration: "none",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.25), 0 0 0 1px rgba(68,65,200,0.30), 0 8px 24px -6px rgba(88,86,214,0.45)",
              transition: "transform 0.22s ease, box-shadow 0.22s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow =
                "inset 0 1px 0 rgba(255,255,255,0.25), 0 0 0 1px rgba(68,65,200,0.30), 0 14px 32px -8px rgba(88,86,214,0.55)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "inset 0 1px 0 rgba(255,255,255,0.25), 0 0 0 1px rgba(68,65,200,0.30), 0 8px 24px -6px rgba(88,86,214,0.45)";
            }}
          >
            Accéder au cockpit
            <ArrowRight size={16} strokeWidth={2.25} />
          </Link>
        </motion.div>
      </main>

      <footer
        style={{
          padding: "1.25rem clamp(1.5rem, 4vw, 3rem)",
          display: "flex",
          justifyContent: "space-between",
          gap: "0.75rem",
          fontSize: "0.72rem",
          color: "var(--text-4)",
          flexWrap: "wrap",
        }}
      >
        <span>© 2026 Cabinet Müller &amp; Associés SA · Zürich</span>
        <span>LPD Art.16 · Infomaniak CH</span>
      </footer>
    </div>
  );
}
