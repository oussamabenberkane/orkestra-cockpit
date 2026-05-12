"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Command } from "lucide-react";

export default function LoginPageE() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push("/e/dashboard"), 400);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Subtle indigo glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(45% 35% at 50% 20%, rgba(129,140,248,0.10), transparent 60%), radial-gradient(40% 30% at 80% 85%, rgba(99,102,241,0.06), transparent 60%)",
          pointerEvents: "none",
        }}
      />
      {/* Subtle dot grid */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse 60% 50% at 50% 40%, #000 50%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      <header
        style={{
          padding: "1.4rem clamp(1.5rem, 4vw, 3rem)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
          zIndex: 1,
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
            padding: "0.4rem 0.7rem",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            transition: "color 0.15s, background 0.15s, border-color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--text)";
            e.currentTarget.style.background = "var(--surface-2)";
            e.currentTarget.style.borderColor = "var(--border-strong)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-3)";
            e.currentTarget.style.background = "var(--surface)";
            e.currentTarget.style.borderColor = "var(--border)";
          }}
        >
          <ArrowLeft size={13} strokeWidth={2.25} />
          Sélection
        </Link>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            color: "var(--text-3)",
            letterSpacing: "0.04em",
          }}
        >
          variant — E · onyx
        </span>
      </header>

      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(2rem, 5vw, 4rem) 1.5rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{
            width: "100%",
            maxWidth: "400px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "14px",
            padding: "clamp(1.75rem, 3vw, 2.25rem)",
            boxShadow:
              "0 0 0 1px var(--inset-highlight) inset, 0 24px 60px -16px rgba(0,0,0,0.55), 0 8px 24px -8px rgba(129,140,248,0.10)",
          }}
        >
          <div style={{ marginBottom: "1.75rem" }}>
            <BrandMark />
            <h1
              style={{
                fontSize: "1.7rem",
                fontWeight: 600,
                letterSpacing: "-0.025em",
                color: "var(--text)",
                margin: 0,
                marginTop: "1.25rem",
                marginBottom: "0.35rem",
              }}
            >
              Connexion au cockpit
            </h1>
            <p style={{ fontSize: "0.9rem", color: "var(--text-3)", margin: 0 }}>
              Continuez avec votre compte Cabinet Müller.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <Field
              id="email-e"
              label="E-mail"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="thomas@muller.ch"
            />
            <Field
              id="password-e"
              label="Mot de passe"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder=""
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                marginTop: "0.5rem",
                padding: "0.72rem",
                background: loading ? "var(--surface-2)" : "var(--accent)",
                color: loading ? "var(--text-3)" : "#0B0C0F",
                border: "none",
                borderRadius: "9px",
                fontFamily: "inherit",
                fontSize: "0.9rem",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                display: "inline-flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "0.45rem",
                letterSpacing: "-0.005em",
                transition: "background 0.18s, box-shadow 0.18s",
                boxShadow: loading
                  ? "none"
                  : "0 0 0 0 var(--accent-tint), 0 8px 24px -8px rgba(129,140,248,0.45)",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = "var(--accent-2)";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 4px var(--accent-tint), 0 8px 24px -6px rgba(129,140,248,0.55)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = "var(--accent)";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 0 var(--accent-tint), 0 8px 24px -8px rgba(129,140,248,0.45)";
                }
              }}
            >
              {loading ? "Connexion…" : "Continuer"}
              {!loading && <ArrowRight size={14} strokeWidth={2.25} />}
            </button>
          </form>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.55rem",
              margin: "1.5rem 0 0.5rem",
              fontSize: "0.72rem",
              color: "var(--text-4)",
            }}
          >
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span>ou</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          <button
            type="button"
            style={{
              width: "100%",
              marginTop: "0.5rem",
              padding: "0.6rem",
              background: "var(--surface-2)",
              color: "var(--text)",
              border: "1px solid var(--border)",
              borderRadius: "9px",
              fontFamily: "inherit",
              fontSize: "0.86rem",
              fontWeight: 500,
              cursor: "pointer",
              display: "inline-flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "0.45rem",
              transition: "background 0.15s, border-color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--surface-3)";
              e.currentTarget.style.borderColor = "var(--border-strong)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--surface-2)";
              e.currentTarget.style.borderColor = "var(--border)";
            }}
          >
            Continuer avec SSO
          </button>

          <div
            style={{
              marginTop: "1.5rem",
              paddingTop: "1rem",
              borderTop: "1px solid var(--border)",
              display: "flex",
              justifyContent: "center",
              gap: "0.45rem",
              fontSize: "0.72rem",
              color: "var(--text-3)",
              alignItems: "center",
            }}
          >
            <Command size={11} strokeWidth={2} />
            <span>
              Astuce —{" "}
              <kbd
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.66rem",
                  padding: "0.05rem 0.3rem",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "4px",
                  color: "var(--text-2)",
                }}
              >
                ⌘K
              </kbd>{" "}
              pour la palette
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
          position: "relative",
          zIndex: 1,
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
    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.55rem" }}>
      <div
        style={{
          width: 32,
          height: 32,
          background: "var(--accent)",
          color: "#0B0C0F",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.74rem",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          boxShadow: "0 0 0 1px var(--inset-highlight) inset, 0 4px 16px -4px rgba(129,140,248,0.45)",
        }}
      >
        CMA
      </div>
      <span
        style={{
          fontSize: "0.92rem",
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
    <div style={{ marginBottom: "0.85rem" }}>
      <label
        htmlFor={id}
        style={{
          display: "block",
          fontSize: "0.78rem",
          fontWeight: 500,
          color: "var(--text-2)",
          marginBottom: "0.35rem",
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
          padding: "0.6rem 0.8rem",
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: "9px",
          fontFamily: "inherit",
          fontSize: "0.9rem",
          color: "var(--text)",
          outline: "none",
          transition: "border-color 0.15s, box-shadow 0.15s, background 0.15s",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "var(--accent)";
          e.target.style.boxShadow = "0 0 0 3px var(--accent-tint)";
          e.target.style.background = "var(--surface-3)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "var(--border)";
          e.target.style.boxShadow = "none";
          e.target.style.background = "var(--surface-2)";
        }}
      />
    </div>
  );
}
