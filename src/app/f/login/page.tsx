"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function LoginPageF() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push("/f/dashboard"), 400);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        style={{
          padding: "1.4rem clamp(1.5rem, 4vw, 3rem)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            fontSize: "0.78rem",
            fontWeight: 500,
            color: "var(--text-3)",
            textDecoration: "none",
            padding: "0.45rem 0.7rem",
            background: "var(--surface)",
            borderRadius: "10px",
            boxShadow: "var(--tier-1)",
            transition: "transform 0.22s ease, color 0.22s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.color = "var(--text)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.color = "var(--text-3)";
          }}
        >
          <ArrowLeft size={13} strokeWidth={2.25} />
          Sélection
        </Link>
        <span
          style={{
            fontSize: "0.72rem",
            fontWeight: 600,
            color: "var(--accent)",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          Variante F · Plinth
        </span>
      </header>

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
            maxWidth: "420px",
            background: "var(--surface)",
            borderRadius: "18px",
            padding: "clamp(1.85rem, 3vw, 2.5rem)",
            boxShadow: "var(--tier-2)",
          }}
        >
          <div style={{ marginBottom: "1.75rem", textAlign: "center" }}>
            <BrandMark />
            <h1
              style={{
                fontSize: "1.75rem",
                fontWeight: 600,
                letterSpacing: "-0.025em",
                color: "var(--text)",
                margin: 0,
                marginTop: "1.5rem",
                marginBottom: "0.4rem",
              }}
            >
              Bonjour, Thomas.
            </h1>
            <p style={{ fontSize: "0.92rem", color: "var(--text-3)", margin: 0 }}>
              Reconnectez-vous au cockpit.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <Field
              id="email-f"
              label="E-mail"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="thomas@muller.ch"
            />
            <Field
              id="password-f"
              label="Mot de passe"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                marginTop: "0.5rem",
                padding: "0.78rem",
                background: loading
                  ? "var(--surface-3)"
                  : "linear-gradient(to bottom, var(--accent), var(--accent-2))",
                color: loading ? "var(--text-3)" : "#FFFFFF",
                border: "none",
                borderRadius: "11px",
                fontFamily: "inherit",
                fontSize: "0.92rem",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                display: "inline-flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "0.45rem",
                letterSpacing: "-0.005em",
                transition: "transform 0.22s ease, box-shadow 0.22s ease",
                boxShadow: loading
                  ? "none"
                  : "inset 0 1px 0 rgba(255,255,255,0.25), 0 0 0 1px rgba(68,65,200,0.30), 0 8px 24px -6px rgba(88,86,214,0.45)",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow =
                    "inset 0 1px 0 rgba(255,255,255,0.25), 0 0 0 1px rgba(68,65,200,0.30), 0 12px 30px -6px rgba(88,86,214,0.55)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "inset 0 1px 0 rgba(255,255,255,0.25), 0 0 0 1px rgba(68,65,200,0.30), 0 8px 24px -6px rgba(88,86,214,0.45)";
                }
              }}
            >
              {loading ? "Connexion…" : "Continuer"}
              {!loading && <ArrowRight size={14} strokeWidth={2.25} />}
            </button>
          </form>

          <div
            style={{
              marginTop: "1.75rem",
              paddingTop: "1.25rem",
              borderTop: "1px solid var(--border)",
              fontSize: "0.74rem",
              color: "var(--text-3)",
              textAlign: "center",
            }}
          >
            Pas de compte ?{" "}
            <span style={{ color: "var(--accent)", fontWeight: 500 }}>
              Contactez votre administrateur
            </span>
          </div>
        </motion.div>
      </main>

      <footer
        style={{
          padding: "1rem clamp(1.5rem, 4vw, 3rem)",
          display: "flex",
          justifyContent: "space-between",
          fontSize: "0.72rem",
          color: "var(--text-3)",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <span>Cabinet Müller &amp; Associés SA · Zürich</span>
        <span>LPD Art.16 · Infomaniak CH</span>
      </footer>
    </div>
  );
}

function BrandMark() {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.55rem",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          background: "linear-gradient(to bottom, var(--accent), var(--accent-2))",
          color: "#FFFFFF",
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.78rem",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.3), 0 0 0 1px rgba(68,65,200,0.2), 0 4px 14px -4px rgba(88,86,214,0.40)",
        }}
      >
        CMA
      </div>
      <span
        style={{
          fontSize: "0.96rem",
          fontWeight: 600,
          color: "var(--text)",
          letterSpacing: "-0.01em",
        }}
      >
        Cabinet Müller
      </span>
    </div>
  );
}

function Field({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div style={{ marginBottom: "0.9rem" }}>
      <label
        htmlFor={id}
        style={{
          display: "block",
          fontSize: "0.78rem",
          fontWeight: 500,
          color: "var(--text-2)",
          marginBottom: "0.4rem",
        }}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "0.7rem 0.9rem",
          background: "var(--surface-2)",
          border: "none",
          borderRadius: "11px",
          fontFamily: "inherit",
          fontSize: "0.92rem",
          color: "var(--text)",
          outline: "none",
          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.04), inset 0 0 0 1px rgba(0,0,0,0.06)",
          transition: "box-shadow 0.22s ease, background 0.22s ease",
        }}
        onFocus={(e) => {
          e.target.style.boxShadow =
            "inset 0 1px 2px rgba(0,0,0,0.04), inset 0 0 0 1px var(--accent), 0 0 0 4px var(--accent-tint)";
          e.target.style.background = "var(--surface)";
        }}
        onBlur={(e) => {
          e.target.style.boxShadow =
            "inset 0 1px 2px rgba(0,0,0,0.04), inset 0 0 0 1px rgba(0,0,0,0.06)";
          e.target.style.background = "var(--surface-2)";
        }}
      />
    </div>
  );
}
