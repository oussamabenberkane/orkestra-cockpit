"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ShieldCheck, Sparkles, Activity } from "lucide-react";

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
      className="forge-login"
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "grid",
        gridTemplateColumns: "1.1fr 1fr",
      }}
    >
      {/* Left — brand panel */}
      <aside
        style={{
          position: "relative",
          background: "var(--surface)",
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
              "radial-gradient(50% 40% at 20% 10%, rgba(59,91,126,0.05), transparent 65%)",
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
              padding: "0.35rem 0.65rem",
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
            <ArrowLeft size={13} strokeWidth={2.25} />
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
            Pilotez votre cabinet avec intelligence.
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
            Tous vos KPIs combinés BrokerStar + Odoo, agents IA inclus, dans une vue unifiée.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem",
              maxWidth: "32rem",
            }}
          >
            <Feature
              icon={<Sparkles size={13} strokeWidth={2.25} />}
              text="KPIs combinés mis à jour en continu."
            />
            <Feature
              icon={<Activity size={13} strokeWidth={2.25} />}
              text="Strip de variations depuis la dernière session."
            />
            <Feature
              icon={<ShieldCheck size={13} strokeWidth={2.25} />}
              text="LLM souverain Infomaniak — LPD Art.16."
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
          <span>Variante B — Forge</span>
          <span>BrokerStar · Odoo · Combiné</span>
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
            Connexion
          </h2>
          <p
            style={{
              fontSize: "0.92rem",
              color: "var(--text-3)",
              marginBottom: "2rem",
            }}
          >
            Continuez avec votre compte Cabinet Müller.
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
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "-0.25rem",
                marginBottom: "1.25rem",
              }}
            >
              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontSize: "0.78rem",
                  color: "var(--text-2)",
                  cursor: "pointer",
                }}
              >
                <input type="checkbox" defaultChecked style={{ accentColor: "var(--accent)" }} />
                Rester connecté
              </label>
              <button
                type="button"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--accent)",
                  fontFamily: "inherit",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Oublié ?
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
                fontFamily: "var(--font-sans)",
                fontSize: "0.92rem",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                display: "inline-flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "0.45rem",
                letterSpacing: "-0.005em",
                transition: "background 0.2s",
                boxShadow: loading ? "none" : "0 2px 6px rgba(59,91,126,0.18)",
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.background = "var(--accent-2)";
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.background = "var(--accent)";
              }}
            >
              {loading ? "Connexion…" : "Accéder au cockpit"}
              {!loading && <ArrowRight size={15} strokeWidth={2.25} />}
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
          .forge-login { grid-template-columns: 1fr !important; }
          .forge-login > aside { min-height: 320px; }
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
          width: 38,
          height: 38,
          background: "var(--accent)",
          color: "#FFFFFF",
          borderRadius: "9px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.88rem",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          boxShadow:
            "0 1px 2px rgba(59,91,126,0.12), inset 0 1px 0 rgba(255,255,255,0.16)",
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
          fontFamily: "var(--font-sans)",
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
