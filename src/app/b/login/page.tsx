"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

export default function LoginPageB() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push("/b/dashboard"), 400);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "grid",
        gridTemplateColumns: "1.1fr 1fr",
      }}
      className="mercury-login"
    >
      {/* Left — brand panel */}
      <aside
        style={{
          position: "relative",
          background: "var(--surface-2)",
          borderRight: "1px solid var(--border)",
          padding: "clamp(2rem, 4vw, 3.5rem)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(60% 50% at 25% 20%, rgba(13,112,102,0.08), transparent 65%), radial-gradient(40% 30% at 80% 85%, rgba(13,112,102,0.06), transparent 65%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              textDecoration: "none",
              color: "var(--text-3)",
              fontSize: "0.78rem",
              fontWeight: 500,
              padding: "0.4rem 0.7rem",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              transition: "color 0.15s, border-color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--text)";
              e.currentTarget.style.borderColor = "var(--border-strong)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-3)";
              e.currentTarget.style.borderColor = "var(--border)";
            }}
          >
            <ArrowLeft size={14} strokeWidth={2.25} />
            Sélection
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: "relative", zIndex: 1 }}
        >
          <BrandMark />
          <h1
            style={{
              fontSize: "clamp(2rem, 4vw, 2.85rem)",
              fontWeight: 600,
              lineHeight: 1.08,
              letterSpacing: "-0.025em",
              color: "var(--text)",
              margin: "1.75rem 0 0.85rem",
              maxWidth: "16ch",
            }}
          >
            Le cockpit unifié de votre cabinet.
          </h1>
          <p
            style={{
              fontSize: "1rem",
              lineHeight: 1.55,
              color: "var(--text-2)",
              maxWidth: "36ch",
              marginBottom: "2.25rem",
            }}
          >
            Primes, sinistres, trésorerie, agents IA — toutes vos sources réunies dans
            une seule vue, en temps réel.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.65rem",
              maxWidth: "32rem",
            }}
          >
            <Feature
              icon={<Sparkles size={14} strokeWidth={2.25} />}
              text="KPIs combinés BrokerStar + Odoo, mis à jour en continu."
            />
            <Feature
              icon={<ShieldCheck size={14} strokeWidth={2.25} />}
              text="LLM souverain Infomaniak — données hébergées en Suisse."
            />
          </div>
        </motion.div>

        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.74rem",
            color: "var(--text-3)",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <span>Variante B — Mercury</span>
          <span>LPD Art.16 · Infomaniak CH</span>
        </div>
      </aside>

      {/* Right — form */}
      <main
        style={{
          background: "var(--bg)",
          padding: "clamp(2rem, 4vw, 3.5rem)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          style={{ width: "100%", maxWidth: "380px" }}
        >
          <h2
            style={{
              fontSize: "1.6rem",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "var(--text)",
              margin: 0,
              marginBottom: "0.4rem",
            }}
          >
            Bienvenue, Thomas.
          </h2>
          <p
            style={{
              fontSize: "0.95rem",
              color: "var(--text-3)",
              marginBottom: "2rem",
            }}
          >
            Connectez-vous pour accéder à votre cockpit.
          </p>

          <form onSubmit={handleSubmit}>
            <Field
              id="email-b"
              label="Adresse e-mail"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="thomas@muller.ch"
            />
            <Field
              id="password-b"
              label="Mot de passe"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
            />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: "1.25rem",
                marginTop: "-0.5rem",
              }}
            >
              <button
                type="button"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--accent)",
                  fontFamily: "inherit",
                  fontSize: "0.78rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Mot de passe oublié ?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.75rem",
                background: loading ? "var(--text-3)" : "var(--accent)",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "10px",
                fontFamily: "var(--font-inter-tight)",
                fontSize: "0.95rem",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                display: "inline-flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "0.45rem",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.background = "var(--accent-2)";
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.background = "var(--accent)";
              }}
            >
              {loading ? "Connexion…" : "Accéder au cockpit"}
              {!loading && <ArrowRight size={16} strokeWidth={2.25} />}
            </button>
          </form>

          <div
            style={{
              marginTop: "2rem",
              paddingTop: "1.25rem",
              borderTop: "1px solid var(--border)",
              fontSize: "0.74rem",
              color: "var(--text-3)",
              textAlign: "center",
            }}
          >
            Pas de compte ?{" "}
            <span style={{ color: "var(--text-2)", fontWeight: 500 }}>
              Contactez votre administrateur
            </span>
          </div>
        </motion.div>
      </main>

      <style>{`
        @media (max-width: 820px) {
          .mercury-login { grid-template-columns: 1fr !important; }
          .mercury-login > aside { min-height: 360px; }
        }
      `}</style>
    </div>
  );
}

function BrandMark() {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.65rem" }}>
      <div
        style={{
          width: 40,
          height: 40,
          background: "var(--accent)",
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FFFFFF",
          fontSize: "0.95rem",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          boxShadow: "0 2px 4px rgba(13,112,102,0.18)",
        }}
      >
        CMA
      </div>
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
        <span
          style={{
            fontSize: "0.95rem",
            fontWeight: 600,
            color: "var(--text)",
            letterSpacing: "-0.01em",
          }}
        >
          Cabinet Müller &amp; Associés
        </span>
        <span style={{ fontSize: "0.78rem", color: "var(--text-3)" }}>
          Orkestra Cockpit — BFSI
        </span>
      </div>
    </div>
  );
}

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "0.65rem",
        fontSize: "0.86rem",
        color: "var(--text-2)",
        lineHeight: 1.5,
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 22,
          height: 22,
          borderRadius: "6px",
          background: "var(--accent-tint)",
          color: "var(--accent)",
          flexShrink: 0,
          marginTop: "1px",
        }}
      >
        {icon}
      </span>
      <span>{text}</span>
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
    <div style={{ marginBottom: "1.1rem" }}>
      <label
        htmlFor={id}
        style={{
          display: "block",
          fontSize: "0.82rem",
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
          padding: "0.65rem 0.85rem",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "10px",
          fontFamily: "var(--font-inter-tight)",
          fontSize: "0.92rem",
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
