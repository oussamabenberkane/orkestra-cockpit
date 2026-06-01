"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginCard() {
  const router = useRouter();
  // Demo session: prefill the form so a one-click login is possible. The
  // placeholders below mirror the same values so the intent stays clear if
  // the user clears the fields.
  const [email, setEmail] = useState("mirko@helvebroker.ch");
  const [password, setPassword] = useState("Cockpit2026");
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
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "var(--surface)",
          borderRadius: "20px",
          padding: "clamp(2rem, 3.5vw, 2.75rem)",
          boxShadow: "var(--tier-2)",
          display: "flex",
          flexDirection: "column",
          gap: "1.65rem",
        }}
      >
        {/* Mobile-only brand mark — BrandPanel is hidden below md, so this is
         * the only brand surface visitors see on phones. */}
        <div className="flex md:hidden items-center gap-2">
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

        {/* Greeting — the only marketing text on this panel. Balanced for a
         * 2–3 line wrap on common viewports. */}
        <header style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          <span
            aria-hidden
            style={{
              alignSelf: "flex-start",
              display: "inline-flex", alignItems: "center", gap: "0.4rem",
              padding: "0.24rem 0.6rem",
              borderRadius: 100,
              background: "var(--accent-tint)",
              color: "var(--accent)",
              border: "1px solid var(--accent-tint-2)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem", fontWeight: 700,
              letterSpacing: "0.14em", textTransform: "uppercase",
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)" }} />
            Cockpit · Helvebroker
          </span>
          <h1
            style={{
              fontSize: "clamp(1.55rem, 3.4vw, 1.95rem)",
              fontWeight: 700,
              letterSpacing: "-0.028em",
              color: "var(--text)",
              margin: 0,
              lineHeight: 1.18,
              textWrap: "balance",
            }}
          >
            Bonjour Mirko, Votre cockpit Helvebroker est prêt.
          </h1>
        </header>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <Field
            id="email"
            label="Adresse e-mail"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="mirko@helvebroker.ch"
            autoComplete="email"
          />
          <PasswordField
            value={password}
            onChange={setPassword}
            placeholder="Cockpit2026"
          />

          {error && (
            <div
              role="alert"
              style={{
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

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.85rem",
              marginTop: "0.25rem",
              background: loading
                ? "var(--surface-3)"
                : "linear-gradient(to bottom, var(--accent), var(--accent-2))",
              color: loading ? "var(--text-3)" : "#FFFFFF",
              border: "none",
              borderRadius: "12px",
              fontFamily: "inherit",
              fontSize: "0.94rem",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              display: "inline-flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "0.5rem",
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
      </motion.div>
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
    <div>
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

function PasswordField({
  value, onChange, placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label
        htmlFor="password"
        style={{
          display: "block",
          fontSize: "0.8rem",
          fontWeight: 600,
          color: "var(--text-2)",
          marginBottom: "0.4rem",
          letterSpacing: "-0.005em",
        }}
      >
        Mot de passe
      </label>
      <div style={{ position: "relative" }}>
        <input
          id="password"
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="current-password"
          style={{
            width: "100%",
            padding: "0.75rem 2.65rem 0.75rem 0.9rem",
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
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          aria-pressed={visible}
          tabIndex={-1}
          style={{
            position: "absolute",
            top: "50%",
            right: "0.35rem",
            transform: "translateY(-50%)",
            width: 32,
            height: 32,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            border: "none",
            borderRadius: 8,
            color: "var(--text-3)",
            cursor: "pointer",
            transition: "background 0.15s ease, color 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--surface-3)";
            e.currentTarget.style.color = "var(--text)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--text-3)";
          }}
        >
          {visible ? (
            <EyeOff size={16} strokeWidth={2} />
          ) : (
            <Eye size={16} strokeWidth={2} />
          )}
        </button>
      </div>
    </div>
  );
}
