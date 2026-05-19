"use client";

import type { ReactNode } from "react";

export type BadgeTone =
  | "accent"
  | "info"
  | "warn"
  | "success"
  | "danger"
  | "neutral";

export interface BadgeProps {
  tone: BadgeTone;
  size?: "sm" | "md";
  icon?: ReactNode;
  children: ReactNode;
}

/**
 * Small local pill primitive built on Orkestra design tokens. Mirrors the
 * filled pill used on alertes/page.tsx (severity pill) — coloured fg on a
 * matching --*-tint background.
 */
export function Badge({ tone, size = "md", icon, children }: BadgeProps) {
  const palette = palettes[tone];
  const compact = size === "sm";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: compact ? "0.25rem" : "0.32rem",
        fontSize: compact ? "0.62rem" : "0.7rem",
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color: palette.fg,
        background: palette.bg,
        padding: compact ? "0.18rem 0.45rem" : "0.22rem 0.6rem",
        borderRadius: "100px",
        lineHeight: 1.2,
        whiteSpace: "nowrap",
      }}
    >
      {icon && <span style={{ display: "inline-flex" }}>{icon}</span>}
      {children}
    </span>
  );
}

const palettes: Record<BadgeTone, { fg: string; bg: string }> = {
  accent:  { fg: "var(--accent)",  bg: "var(--accent-tint)" },
  info:    { fg: "var(--info)",    bg: "var(--info-tint)" },
  warn:    { fg: "var(--warn)",    bg: "var(--warn-tint)" },
  success: { fg: "var(--success)", bg: "var(--success-tint)" },
  danger:  { fg: "var(--danger)",  bg: "var(--danger-tint)" },
  neutral: { fg: "var(--text-3)",  bg: "var(--surface-3)" },
};
