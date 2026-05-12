"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Command, KeyRound } from "lucide-react";

export default function LoginPageC() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push("/c/dashboard"), 400);
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
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem clamp(1.25rem, 3vw, 2rem)",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          <div
            style={{
              width: 26,
              height: 26,
              background: "var(--text)",
              color: "var(--surface)",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.68rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
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
          <span
            style={{
              fontSize: "0.72rem",
              color: "var(--text-3)",
              padding: "0.15rem 0.4rem",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              fontFamily: "var(--font-geist-mono)",
            }}
          >
            workspace
          </span>
        </div>

        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
            fontSize: "0.78rem",
            fontWeight: 500,
            color: "var(--text-3)",
            textDecoration: "none",
            padding: "0.35rem 0.6rem",
            borderRadius: "6px",
            transition: "color 0.15s, background 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--text)";
            e.currentTarget.style.background = "var(--surface-2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-3)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          <ArrowLeft size={13} strokeWidth={2.25} />
          Sélection
        </Link>
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
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{
            width: "100%",
            maxWidth: "400px",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h1
              style={{
                fontSize: "1.65rem",
                fontWeight: 600,
                letterSpacing: "-0.025em",
                color: "var(--text)",
                margin: 0,
                marginBottom: "0.35rem",
              }}
            >
              Connexion au cockpit
            </h1>
            <p style={{ fontSize: "0.92rem", color: "var(--text-3)", margin: 0 }}>
              Continuez avec votre compte Müller &amp; Associés.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <Field
              id="email-c"
              label="E-mail"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="thomas@muller.ch"
            />
            <Field
              id="password-c"
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
                padding: "0.7rem",
                background: loading ? "var(--text-3)" : "var(--accent)",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "8px",
                fontFamily: "inherit",
                fontSize: "0.9rem",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                display: "inline-flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "0.4rem",
                letterSpacing: "-0.005em",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.background = "var(--accent-2)";
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.background = "var(--accent)";
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
              gap: "0.65rem",
              margin: "1.4rem 0",
              fontSize: "0.74rem",
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
              padding: "0.65rem",
              background: "var(--surface)",
              color: "var(--text)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontFamily: "inherit",
              fontSize: "0.86rem",
              fontWeight: 500,
              cursor: "pointer",
              display: "inline-flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "0.5rem",
              transition: "background 0.15s, border-color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--surface-2)";
              e.currentTarget.style.borderColor = "var(--border-strong)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--surface)";
              e.currentTarget.style.borderColor = "var(--border)";
            }}
          >
            <KeyRound size={14} strokeWidth={2} />
            Continuer avec SSO
          </button>

          <div
            style={{
              marginTop: "1.5rem",
              paddingTop: "1rem",
              borderTop: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              fontSize: "0.74rem",
              color: "var(--text-3)",
            }}
          >
            <Command size={12} strokeWidth={2} />
            <span>
              Astuce :{" "}
              <kbd
                style={{
                  fontFamily: "var(--font-geist-mono)",
                  fontSize: "0.7rem",
                  padding: "0.1rem 0.3rem",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "4px",
                  color: "var(--text-2)",
                }}
              >
                ⌘K
              </kbd>{" "}
              pour la palette de commandes.
            </span>
          </div>
        </motion.div>
      </main>

      <footer
        style={{
          padding: "0.85rem clamp(1.25rem, 3vw, 2rem)",
          borderTop: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          fontSize: "0.72rem",
          color: "var(--text-3)",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <span>Variante C — Atrium · Orkestra Cockpit</span>
        <span>LPD Art.16 · Infomaniak CH</span>
      </footer>
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
          letterSpacing: "-0.005em",
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
          padding: "0.55rem 0.75rem",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          fontFamily: "inherit",
          fontSize: "0.88rem",
          color: "var(--text)",
          outline: "none",
          transition: "border-color 0.15s, box-shadow 0.15s",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "var(--accent)";
          e.target.style.boxShadow = "0 0 0 3px var(--accent-tint)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "var(--border)";
          e.target.style.boxShadow = "none";
        }}
      />
    </div>
  );
}
