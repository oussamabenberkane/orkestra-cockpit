"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ShieldCheck, BarChart3, Sparkles } from "lucide-react";

export default function LoginPageD() {
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
        gridTemplateColumns: "1fr 1fr",
      }}
      className="aperture-login"
    >
      {/* Left — form */}
      <main
        style={{
          background: "var(--surface)",
          padding: "clamp(2rem, 4vw, 3.5rem)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <a
            href="#"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            <svg viewBox="0 0 60 70" fill="none" style={{ width: 32, height: 32 }} aria-hidden="true">
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
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.05 }}>
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "var(--accent)",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                Malyz
              </span>
              <span
                style={{
                  fontSize: "0.56rem",
                  fontWeight: 500,
                  color: "var(--text-3)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Consulting Sàrl
              </span>
            </div>
            <span
              style={{
                width: 1,
                height: 22,
                background: "var(--border-strong)",
                margin: "0 0.5rem",
              }}
            />
            <span
              style={{
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "var(--text)",
                letterSpacing: "-0.015em",
              }}
            >
              Ork<span style={{ color: "var(--accent)" }}>estra</span>
            </span>
          </a>
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
              padding: "0.35rem 0.65rem",
              borderRadius: "8px",
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
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{ maxWidth: "400px", width: "100%" }}
        >
          <span
            style={{
              fontSize: "0.66rem",
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: "0.65rem",
              display: "inline-block",
            }}
          >
            Variante D · Aperture
          </span>
          <h1
            style={{
              fontSize: "clamp(1.9rem, 3.5vw, 2.4rem)",
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
              color: "var(--text)",
              margin: 0,
              marginBottom: "0.55rem",
            }}
          >
            Bonjour, Thomas.
          </h1>
          <p
            style={{
              fontSize: "0.96rem",
              color: "var(--text-3)",
              marginBottom: "2rem",
              maxWidth: "34ch",
              lineHeight: 1.55,
            }}
          >
            Connectez-vous pour voir le chiffre du mois et les trois actions qui vous attendent.
          </p>

          <form onSubmit={handleSubmit}>
            <Field
              id="email-d"
              label="Adresse e-mail"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="thomas@muller.ch"
            />
            <Field
              id="password-d"
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
                padding: "0.78rem",
                background: loading ? "var(--text-3)" : "var(--accent)",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "10px",
                fontFamily: "inherit",
                fontSize: "0.92rem",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                display: "inline-flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "0.45rem",
                letterSpacing: "-0.005em",
                transition: "background 0.2s",
                boxShadow: loading ? "none" : "0 2px 8px rgba(30,64,175,0.22)",
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
        </motion.div>

        <footer
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.72rem",
            color: "var(--text-3)",
            gap: "0.5rem",
            flexWrap: "wrap",
          }}
        >
          <span>© 2026 Cabinet Müller &amp; Associés SA</span>
          <span>LPD Art.16 · Infomaniak CH</span>
        </footer>
      </main>

      {/* Right — feature panel */}
      <aside
        style={{
          background: "var(--accent)",
          color: "#FFFFFF",
          padding: "clamp(2rem, 4vw, 3.5rem)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
        className="aperture-aside"
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(50% 40% at 80% 10%, rgba(255,255,255,0.10), transparent 60%), radial-gradient(60% 50% at 10% 90%, rgba(0,0,0,0.10), transparent 60%)",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
            pointerEvents: "none",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.6 }}
          style={{ position: "relative", zIndex: 1 }}
        >
          <h2
            style={{
              fontSize: "clamp(1.7rem, 3vw, 2.15rem)",
              fontWeight: 700,
              letterSpacing: "-0.025em",
              lineHeight: 1.15,
              margin: 0,
              marginBottom: "1.25rem",
              maxWidth: "22ch",
            }}
          >
            Un chiffre par mois, trois actions par matin.
          </h2>
          <p
            style={{
              fontSize: "0.95rem",
              color: "rgba(255,255,255,0.78)",
              lineHeight: 1.6,
              maxWidth: "38ch",
              margin: 0,
            }}
          >
            Aperture met en avant l&apos;essentiel — le chiffre d&apos;affaires, les actions
            prioritaires, et tout le reste en support.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.6 }}
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "0.85rem",
          }}
        >
          <Feature
            icon={<BarChart3 size={14} strokeWidth={2.25} />}
            title="Hero KPI"
            desc="Un graphique principal avec événements annotés."
          />
          <Feature
            icon={<Sparkles size={14} strokeWidth={2.25} />}
            title="Trois choses aujourd'hui"
            desc="Vos actions du matin, mises au premier plan."
          />
          <Feature
            icon={<ShieldCheck size={14} strokeWidth={2.25} />}
            title="LPD conforme"
            desc="LLM souverain Infomaniak. Données en Suisse."
          />
        </motion.div>
      </aside>

      <style>{`
        @media (max-width: 820px) {
          .aperture-login { grid-template-columns: 1fr !important; }
          .aperture-aside { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: "0.85rem",
        alignItems: "flex-start",
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "10px",
        padding: "0.85rem 1rem",
      }}
    >
      <span
        style={{
          flexShrink: 0,
          width: 28,
          height: 28,
          background: "rgba(255,255,255,0.14)",
          borderRadius: "7px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FFFFFF",
        }}
      >
        {icon}
      </span>
      <div>
        <div
          style={{
            fontSize: "0.86rem",
            fontWeight: 700,
            marginBottom: "0.15rem",
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: "0.78rem",
            color: "rgba(255,255,255,0.68)",
            lineHeight: 1.5,
          }}
        >
          {desc}
        </div>
      </div>
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
    <div style={{ marginBottom: "1rem" }}>
      <label
        htmlFor={id}
        style={{
          display: "block",
          fontSize: "0.82rem",
          fontWeight: 600,
          color: "var(--text)",
          marginBottom: "0.4rem",
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
          padding: "0.7rem 0.9rem",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "10px",
          fontFamily: "inherit",
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
