"use client";

/**
 * Floating palette picker pinned to the top-right corner of the viewport.
 *
 * Consumes the shared palette hook so it stays in sync with any other
 * picker on the page (e.g. the inline picker on /). The dismiss button
 * collapses the pill to a swatch + chevron; collapsed state lives in
 * sessionStorage so it doesn't leak across tab sessions.
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

  /* Pinned to the top-right corner with zero viewport margin. maxWidth
   * keeps the expanded form on-screen if the viewport is very narrow. */
  const anchorStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    right: 0,
    zIndex: 9000,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    boxShadow: "var(--tier-1)",
    fontFamily: "inherit",
  };

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsedPersisted(false)}
        aria-label={`Déployer le sélecteur de palette — actif : ${activePalette.label}`}
        title={`Palette : ${activePalette.label}`}
        style={{
          ...anchorStyle,
          appearance: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.35rem",
          padding: "0.22rem 0.4rem 0.22rem 0.32rem",
          borderRadius: 999,
          color: "var(--text-2)",
          fontSize: "0.68rem",
          fontWeight: 600,
          letterSpacing: "0.01em",
          cursor: "pointer",
          transition: "box-shadow 0.18s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = "var(--tier-2)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = "var(--tier-1)";
        }}
      >
        <span
          aria-hidden
          style={{
            width: 14,
            height: 14,
            borderRadius: "4px",
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
        <ChevronUp size={12} strokeWidth={2.25} color="var(--text-3)" />
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
          padding: "0.22rem 0.45rem 0.22rem 0.28rem",
          borderRadius: "6px",
          fontFamily: "inherit",
          fontSize: "0.68rem",
          fontWeight: 600,
          letterSpacing: "0.01em",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.35rem",
          background: active ? "var(--surface)" : "transparent",
          color: active ? "var(--text)" : "var(--text-3)",
          boxShadow: active ? "var(--tier-1)" : "none",
          transition: "background 0.18s, color 0.18s, box-shadow 0.18s",
        }}
      >
        <span
          aria-hidden
          style={{
            width: 12,
            height: 12,
            borderRadius: "3px",
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
        ...anchorStyle,
        maxWidth: "100vw",
        display: "flex",
        alignItems: "center",
        gap: "0.2rem",
        padding: "0.22rem 0.26rem",
        borderRadius: "10px",
      }}
    >
      <span
        className="palette-switcher-label"
        style={{
          fontSize: "0.54rem",
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--text-4)",
          marginLeft: "0.15rem",
          marginRight: "0.1rem",
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
          gap: "0.08rem",
          padding: "0.14rem",
          background: "var(--surface-2)",
          borderRadius: "8px",
          minWidth: 0,
        }}
      >
        {PALETTES.map(segment)}
      </div>
      <button
        type="button"
        onClick={() => setCollapsedPersisted(true)}
        aria-label="Replier le sélecteur de palette"
        title="Replier"
        style={{
          appearance: "none",
          border: "none",
          background: "transparent",
          color: "var(--text-4)",
          padding: "0.18rem",
          borderRadius: "5px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
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
        <ChevronDown size={12} strokeWidth={2.25} />
      </button>
      {/* Hide the "PALETTE" label on narrow viewports so the segmented row
       * stays compact. */}
      <style>{`
        @media (max-width: 640px) {
          [aria-label="Palette preview switcher"] .palette-switcher-label { display: none; }
        }
      `}</style>
    </div>
  );
}
