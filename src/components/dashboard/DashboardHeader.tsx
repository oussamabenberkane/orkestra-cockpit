"use client";

import { useRouter } from "next/navigation";

interface DashboardHeaderProps {
  onOpenSettings: () => void;
}

export default function DashboardHeader({ onOpenSettings }: DashboardHeaderProps) {
  const router = useRouter();
  return (
    <header
      style={{
        background: "white",
        borderBottom: "1px solid #E4E7F0",
        height: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1.5rem",
        flexShrink: 0,
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        zIndex: 10,
      }}
    >
      {/* Left */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {/* Malyz Logo */}
        <a
          href="#"
          style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}
        >
          <svg viewBox="0 0 60 70" fill="none" style={{ width: 32, height: 32 }}>
            <polygon
              points="30,2 58,17.5 58,52.5 30,68 2,52.5 2,17.5"
              fill="none"
              stroke="#2B3AE8"
              strokeWidth="3"
            />
            <polygon
              points="30,12 48,22.5 48,47.5 30,58 12,47.5 12,22.5"
              fill="#2B3AE8"
              opacity="0.5"
            />
            <polygon
              points="30,22 38,27 38,43 30,48 22,43 22,27"
              fill="#2B3AE8"
            />
          </svg>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 800,
                color: "#2B3AE8",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
              }}
            >
              Malyz
            </span>
            <span
              style={{
                fontSize: "0.55rem",
                color: "#6B7280",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              Consulting Sàrl
            </span>
          </div>
        </a>

        {/* Divider */}
        <div
          style={{ width: "1px", height: "24px", background: "#E4E7F0" }}
        />

        {/* Orkestra wordmark */}
        <div
          style={{
            fontSize: "1.1rem",
            fontWeight: 800,
            color: "#1E2761",
            letterSpacing: "-0.3px",
          }}
        >
          Ork<span style={{ color: "#2B3AE8" }}>estra</span>
        </div>
      </div>

      {/* Center */}
      <div style={{ fontSize: "0.8rem", color: "#6B7280", fontWeight: 500 }}>
        Cabinet Müller &amp; Associés SA — 5 courtiers · 4 juin 2026
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        {/* Live badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            background: "#ECFDF5",
            color: "#10B981",
            fontSize: "0.72rem",
            fontWeight: 600,
            padding: "0.25rem 0.65rem",
            borderRadius: "20px",
            border: "1px solid rgba(16,185,129,0.2)",
          }}
        >
          <div
            className="animate-blink"
            style={{
              width: 6,
              height: 6,
              background: "#10B981",
              borderRadius: "50%",
            }}
          />
          Temps réel
        </div>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            background: "#F4F6FB",
            border: "1px solid #E4E7F0",
            borderRadius: "8px",
            padding: "0.35rem 0.75rem",
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "#1A1F36",
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "white";
            e.currentTarget.style.borderColor = "#2B3AE8";
            e.currentTarget.style.color = "#2B3AE8";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#F4F6FB";
            e.currentTarget.style.borderColor = "#E4E7F0";
            e.currentTarget.style.color = "#1A1F36";
          }}
        >
          ⚙️ Paramètres
        </button>

        {/* Logout button */}
        <button
          onClick={() => router.push("/login")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            background: "transparent",
            border: "1px solid #E4E7F0",
            borderRadius: "8px",
            padding: "0.35rem 0.75rem",
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "#6B7280",
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#EF4444";
            e.currentTarget.style.color = "#EF4444";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#E4E7F0";
            e.currentTarget.style.color = "#6B7280";
          }}
        >
          ↩ Déconnexion
        </button>

        {/* Avatar */}
        <div
          title="Thomas Müller"
          style={{
            width: 32,
            height: 32,
            background: "#2B3AE8",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "white",
            cursor: "pointer",
          }}
        >
          TM
        </div>
      </div>
    </header>
  );
}
