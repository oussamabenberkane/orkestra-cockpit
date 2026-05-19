"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginCard() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError("Identifiants incorrects. Veuillez réessayer.");
      setLoading(false);
      return;
    }
    router.replace("/dashboard");
  };

  return (
    <main
      style={{
        flex: 1,
        background: "var(--surface-2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(1.5rem, 5vw, 3rem)",
        minHeight: 0,
        position: "relative",
        overflowY: "auto",
      }}
    >
      {/* Top-right wordmark — desktop only */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="hidden md:block"
        style={{
          position: "absolute",
          top: "2rem",
          right: "2.25rem",
          fontSize: "1rem",
          fontWeight: 700,
          color: "var(--text)",
          letterSpacing: "-0.015em",
        }}
      >
        Ork<span style={{ color: "var(--accent)" }}>estra</span>
      </motion.div>

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
        {/* Mobile-only brand mark above heading */}
        <div className="flex md:hidden items-center gap-2 mb-6">
          <svg viewBox="0 0 60 70" fill="none" style={{ width: 32, height: 32 }}>
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
          <div>
            <div style={{
              fontSize: "0.78rem", fontWeight: 800,
              color: "var(--text)",
              letterSpacing: "1.8px", textTransform: "uppercase",
            }}>Malyz</div>
            <div style={{
              fontSize: "0.58rem", color: "var(--text-3)",
              letterSpacing: "0.5px", textTransform: "uppercase",
            }}>Consulting Sàrl</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.4rem" }}>
          <h1
            style={{
              fontSize: "1.7rem",
              fontWeight: 700,
              letterSpacing: "-0.025em",
              color: "var(--text)",
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            Bonjour, Thomas.
          </h1>
          <button
            type="button"
            onClick={() => { setEmail("demo@cabinet-muller.ch"); setPassword("Cockpit2026"); }}
            style={{
              marginTop: "0.25rem",
              background: "var(--accent-tint)",
              border: "1px solid var(--accent-tint-2)",
              borderRadius: "7px",
              padding: "0.25rem 0.6rem",
              fontSize: "0.7rem",
              fontWeight: 600,
              color: "var(--accent)",
              fontFamily: "inherit",
              cursor: "pointer",
              whiteSpace: "nowrap",
              letterSpacing: "-0.005em",
            }}
          >
            Démo
          </button>
        </div>
        <p
          style={{
            fontSize: "0.92rem",
            color: "var(--text-3)",
            margin: 0,
            marginBottom: "1.75rem",
            lineHeight: 1.55,
          }}
        >
          Connectez-vous à votre cockpit BFSI.
        </p>

        <form onSubmit={handleSubmit}>
          <Field
            id="email"
            label="Adresse e-mail"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="thomas@muller.ch"
            autoComplete="email"
          />
          <Field
            id="password"
            label="Mot de passe"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            autoComplete="current-password"
          />

          {error && (
            <div
              style={{
                marginBottom: "1rem",
                padding: "0.65rem 0.9rem",
                background: "var(--danger-tint)",
                border: "1px solid var(--danger)",
                borderRadius: "9px",
                fontSize: "0.8rem",
                color: "var(--danger)",
                fontWeight: 500,
              }}
            >
              {error}
            </div>
          )}

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
              padding: "0.8rem",
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
              transition: "transform 0.22s ease, box-shadow 0.22s ease, filter 0.18s ease",
              boxShadow: loading
                ? "none"
                : "inset 0 1px 0 rgba(255,255,255,0.25), 0 0 0 1px rgba(0,98,204,0.30), 0 8px 24px -6px rgba(0,122,255,0.45)",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "inset 0 1px 0 rgba(255,255,255,0.25), 0 0 0 1px rgba(0,98,204,0.30), 0 12px 30px -6px rgba(0,122,255,0.55)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "inset 0 1px 0 rgba(255,255,255,0.25), 0 0 0 1px rgba(0,98,204,0.30), 0 8px 24px -6px rgba(0,122,255,0.45)";
              }
            }}
          >
            {loading ? "Connexion…" : "Accéder au cockpit"}
            {!loading && <ArrowRight size={15} strokeWidth={2.25} />}
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
          <span style={{ color: "var(--accent)", fontWeight: 600 }}>
            Contactez votre administrateur
          </span>
        </div>
      </motion.div>

      <footer
        style={{
          position: "absolute",
          bottom: "1.25rem",
          left: 0, right: 0,
          textAlign: "center",
          fontSize: "0.7rem",
          color: "var(--text-4)",
        }}
      >
        © 2026 Cabinet Müller &amp; Associés SA · Zürich
      </footer>
    </main>
  );
}

function Field({
  id, label, type, value, onChange, placeholder, autoComplete,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete?: string;
}) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label
        htmlFor={id}
        style={{
          display: "block",
          fontSize: "0.8rem",
          fontWeight: 600,
          color: "var(--text-2)",
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
        autoComplete={autoComplete}
        style={{
          width: "100%",
          padding: "0.75rem 0.9rem",
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
