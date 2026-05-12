"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push("/a/dashboard");
    }, 400);
  };

  return (
    <div
      style={{
        flex: 1,
        background: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(1.5rem, 5vw, 3rem)",
        minHeight: 0,
        overflowY: "auto",
      }}
    >
      {/* Wordmark — desktop only (brand panel visible) */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="hidden md:block"
        style={{
          position: "absolute",
          top: "2rem",
          right: "2rem",
          fontSize: "1rem",
          fontWeight: 800,
          color: "#1E2761",
          letterSpacing: "-0.3px",
        }}
      >
        Ork<span style={{ color: "#2B3AE8" }}>estra</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: "100%", maxWidth: "380px" }}
      >
        {/* Mobile logo — hidden on md+ where BrandPanel shows */}
        <div className="flex md:hidden items-center gap-2 mb-8">
          <svg viewBox="0 0 60 70" fill="none" style={{ width: 36, height: 36 }}>
            <polygon points="30,2 58,17.5 58,52.5 30,68 2,52.5 2,17.5" fill="none" stroke="#2B3AE8" strokeWidth="3" />
            <polygon points="30,12 48,22.5 48,47.5 30,58 12,47.5 12,22.5" fill="#2B3AE8" opacity="0.5" />
            <polygon points="30,22 38,27 38,43 30,48 22,43 22,27" fill="#2B3AE8" />
          </svg>
          <div>
            <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "#1E2761", letterSpacing: "2px", textTransform: "uppercase" }}>Malyz</div>
            <div style={{ fontSize: "0.6rem", color: "#6B7280", letterSpacing: "0.5px", textTransform: "uppercase" }}>Consulting Sàrl</div>
          </div>
        </div>

        {/* Heading */}
        <h2
          style={{
            fontSize: "1.6rem",
            fontWeight: 800,
            color: "#1E2761",
            letterSpacing: "-0.3px",
            marginBottom: "0.5rem",
          }}
        >
          Bienvenue
        </h2>
        <p
          style={{
            fontSize: "0.85rem",
            color: "#6B7280",
            marginBottom: "2rem",
            lineHeight: 1.5,
          }}
        >
          Connectez-vous à votre cockpit BFSI
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              style={{
                display: "block",
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "#1A1F36",
                marginBottom: "0.4rem",
              }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="thomas@muller.ch"
              style={{
                width: "100%",
                padding: "0.65rem 0.9rem",
                border: "1px solid #E4E7F0",
                borderRadius: "8px",
                fontSize: "0.85rem",
                color: "#1A1F36",
                outline: "none",
                fontFamily: "inherit",
                transition: "border-color 0.15s",
                background: "white",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#2B3AE8")}
              onBlur={(e) => (e.target.style.borderColor = "#E4E7F0")}
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              style={{
                display: "block",
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "#1A1F36",
                marginBottom: "0.4rem",
              }}
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "0.65rem 0.9rem",
                border: "1px solid #E4E7F0",
                borderRadius: "8px",
                fontSize: "0.85rem",
                color: "#1A1F36",
                outline: "none",
                fontFamily: "inherit",
                transition: "border-color 0.15s",
                background: "white",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#2B3AE8")}
              onBlur={(e) => (e.target.style.borderColor = "#E4E7F0")}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.75rem",
              background: loading ? "#6B7280" : "#2B3AE8",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "0.88rem",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              marginTop: "0.5rem",
              transition: "background 0.15s",
              letterSpacing: "0.3px",
            }}
            onMouseEnter={(e) => {
              if (!loading) (e.currentTarget.style.background = "#1E2BD4");
            }}
            onMouseLeave={(e) => {
              if (!loading) (e.currentTarget.style.background = "#2B3AE8");
            }}
          >
            {loading ? "Connexion…" : "Se connecter →"}
          </button>
        </form>

        {/* Footer */}
        <p
          style={{
            marginTop: "2.5rem",
            fontSize: "0.72rem",
            color: "#6B7280",
            textAlign: "center",
          }}
        >
          🇨🇭 Infomaniak — Données hébergées en Suisse
        </p>
      </motion.div>
    </div>
  );
}
