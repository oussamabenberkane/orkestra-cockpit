"use client";

/**
 * Floating bottom-left palette picker. Consumes the shared palette
 * hook so it stays in sync with any other picker mounted on the page
 * (e.g. the inline picker on /).
 *
 * The switcher is always present on the page. The dismiss button
 * collapses it to a compact swatch+chevron pill (still visible, still
 * one click to reopen). Collapsed state is sessionStorage-scoped so it
 * doesn't leak across tab sessions.
 */

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { PALETTES, type PaletteMeta, usePalette } from "./palette";

const SESSION_COLLAPSED_KEY = "orkestra.palette.switcher.collapsed";
/* Legacy key from the earlier "permanently dismissed for this session"
 * behaviour. Migrated to collapsed=1 on mount so users who dismissed it
 * see the collapsed pill instead of nothing. */
const LEGACY_HIDDEN_KEY = "orkestra.palette.switcher.hidden";

export function PaletteSwitcher() {
  const { palette, setPalette, mounted } = usePalette();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const legacy = window.sessionStorage.getItem(LEGACY_HIDDEN_KEY);
      if (legacy === "1") {
        window.sessionStorage.setItem(SESSION_COLLAPSED_KEY, "1");
        window.sessionStorage.removeItem(LEGACY_HIDDEN_KEY);
      }
      setCollapsed(window.sessionStorage.getItem(SESSION_COLLAPSED_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  if (!mounted) return null;

  const setCollapsedPersisted = (next: boolean) => {
    setCollapsed(next);
    try {
      window.sessionStorage.setItem(SESSION_COLLAPSED_KEY, next ? "1" : "0");
    } catch {
      /* ignore */
    }
  };

  const activePalette =
    PALETTES.find((p) => p.id === palette) ?? PALETTES[0];

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsedPersisted(false)}
        aria-label={`Show palette switcher — current: ${activePalette.label}`}
        title={`Palette : ${activePalette.label}`}
        style={{
          position: "fixed",
          left: 16,
          bottom: 16,
          zIndex: 9000,
          display: "inline-flex",
          alignItems: "center",
          gap: "0.45rem",
          padding: "0.34rem 0.55rem 0.34rem 0.4rem",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 999,
          boxShadow: "var(--tier-1)",
          fontFamily: "inherit",
          color: "var(--text-2)",
          fontSize: "0.7rem",
          fontWeight: 600,
          letterSpacing: "0.01em",
          cursor: "pointer",
          transition: "transform 0.18s ease, box-shadow 0.18s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
          (e.currentTarget as HTMLElement).style.boxShadow = "var(--tier-2)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLElement).style.boxShadow = "var(--tier-1)";
        }}
      >
        <span
          aria-hidden
          style={{
            width: 16,
            height: 16,
            borderRadius: "5px",
            background: activePalette.bg,
            position: "relative",
            overflow: "hidden",
            boxShadow: "inset 0 0 0 1px rgba(127,127,127,0.25)",
            flexShrink: 0,
          }}
        >
          <span
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              left: "60%",
              background: activePalette.accent,
            }}
          />
        </span>
        <span>Palette</span>
        <ChevronUp size={13} strokeWidth={2.25} color="var(--text-3)" />
      </button>
    );
  }

  const segment = (meta: PaletteMeta) => {
    const active = palette === meta.id;
    return (
      <button
        key={meta.id}
        type="button"
        onClick={() => setPalette(meta.id)}
        aria-pressed={active}
        title={`${meta.label} — ${meta.blurb}`}
        style={{
          appearance: "none",
          border: "none",
          padding: "0.28rem 0.55rem 0.28rem 0.32rem",
          borderRadius: "7px",
          fontFamily: "inherit",
          fontSize: "0.7rem",
          fontWeight: 600,
          letterSpacing: "0.01em",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          background: active ? "var(--surface)" : "transparent",
          color: active ? "var(--text)" : "var(--text-3)",
          boxShadow: active ? "var(--tier-1)" : "none",
          transition: "background 0.18s, color 0.18s, box-shadow 0.18s",
        }}
      >
        <span
          aria-hidden
          style={{
            width: 14,
            height: 14,
            borderRadius: "4px",
            background: meta.bg,
            position: "relative",
            overflow: "hidden",
            boxShadow: "inset 0 0 0 1px rgba(127,127,127,0.25)",
            flexShrink: 0,
          }}
        >
          <span
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              left: "60%",
              background: meta.accent,
            }}
          />
        </span>
        <span>{meta.label}</span>
      </button>
    );
  };

  return (
    <div
      role="region"
      aria-label="Palette preview switcher"
      style={{
        position: "fixed",
        left: 16,
        bottom: 16,
        zIndex: 9000,
        maxWidth: "calc(100vw - 32px)",
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        padding: "0.3rem 0.34rem 0.3rem 0.6rem",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        boxShadow: "var(--tier-1)",
        fontFamily: "inherit",
      }}
    >
      <span
        className="palette-switcher-label"
        style={{
          fontSize: "0.56rem",
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--text-4)",
          marginRight: "0.15rem",
          flexShrink: 0,
        }}
      >
        Palette
      </span>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "0.1rem",
          padding: "0.18rem",
          background: "var(--surface-2)",
          borderRadius: "9px",
          minWidth: 0,
        }}
      >
        {PALETTES.map(segment)}
      </div>
      <button
        type="button"
        onClick={() => setCollapsedPersisted(true)}
        aria-label="Collapse palette switcher"
        title="Replier"
        style={{
          appearance: "none",
          border: "none",
          background: "transparent",
          color: "var(--text-4)",
          padding: "0.22rem",
          borderRadius: "6px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.15s, color 0.15s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
          (e.currentTarget as HTMLElement).style.color = "var(--text-2)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = "transparent";
          (e.currentTarget as HTMLElement).style.color = "var(--text-4)";
        }}
      >
        <ChevronDown size={13} strokeWidth={2.25} />
      </button>
      {/* Hide the "PALETTE" label on narrow viewports so the segmented row
       * stays readable on 360–480 px phones without horizontal overflow. */}
      <style>{`
        @media (max-width: 640px) {
          [aria-label="Palette preview switcher"] .palette-switcher-label { display: none; }
        }
        @media (max-width: 420px) {
          [aria-label="Palette preview switcher"] {
            left: 8px !important;
            right: 8px !important;
            bottom: 8px !important;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
