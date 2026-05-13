"use client";

interface BrandClusterProps {
  href?: string;
  /** Size of the hexagon SVG in px. Defaults to 28 (TopBar). */
  size?: number;
}

export function BrandCluster({ href = "#", size = 28 }: BrandClusterProps) {
  return (
    <a
      href={href}
      onClick={(e) => {
        if (href === "#") e.preventDefault();
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        textDecoration: "none",
        flexShrink: 0,
      }}
    >
      <svg viewBox="0 0 60 70" fill="none" style={{ width: size, height: size }} aria-hidden="true">
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
  );
}
