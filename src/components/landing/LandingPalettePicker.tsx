"use client";

/**
 * Inline palette picker rendered on the landing page, below the piliers.
 *
 * Each card is a miniature dashboard layout (sidebar band | canvas with
 * a floating card holding the accent) so the visual hierarchy of each
 * palette is legible without applying it. Clicking a card flips the
 * whole app immediately via the shared usePalette hook — the floating
 * pill picks it up via the same change event and stays in sync.
 */

import { motion } from "framer-motion";
import { Check } from "lucide-react";

import {
  PALETTES,
  type Palette,
  type PaletteMeta,
  usePalette,
} from "@/components/dev/palette";

/* Source-of-truth surface samples per palette. These mirror the CSS
 * variable values exactly so the previews can render without being
 * applied — letting a user compare all 9 side-by-side at once. */
/* `sidebarItem` is the on-sidebar accent — for light sidebars it equals
 * the main accent, but for colored sidebars (Cobalt) it switches to the
 * palette's --rail-accent so the preview's "active item" stays visible
 * against the dark sidebar surface. `sidebarLine` is the muted rail
 * indicator color for inactive items (mirrors --rail-text-soft). */
const SURFACE_SAMPLES: Record<
  Palette,
  {
    bg: string;
    surface: string;
    surface2: string;
    border: string;
    sidebarItem?: string;
    sidebarLine?: string;
  }
> = {
  aurora:   { bg: "#F2F4F9", surface: "#FFFFFF", surface2: "#D6DEEC", border: "rgba(15,23,42,0.14)" },
  marble:   { bg: "#EEF1F8", surface: "#FFFFFF", surface2: "#C8D2E6", border: "rgba(70,90,150,0.18)" },
  pearl:    { bg: "#EBEBEE", surface: "#FFFFFF", surface2: "#D4D4D8", border: "rgba(24,24,27,0.16)" },
  mineral:  { bg: "#E6ECF3", surface: "#FFFFFF", surface2: "#B5C1D2", border: "rgba(30,41,59,0.18)" },
  atelier:  { bg: "#DDE2EB", surface: "#FFFFFF", surface2: "#B5BDCB", border: "rgba(30,41,59,0.22)" },
  cobalt:   {
    bg: "#F4F7FB",
    surface: "#FFFFFF",
    surface2: "#1E3A8A",                     /* preview shows the SIDEBAR color */
    border: "rgba(15,23,42,0.14)",
    sidebarItem: "#BAE6FD",                  /* --rail-accent: sky-200 */
    sidebarLine: "rgba(255,255,255,0.34)",
  },
  azure:    {
    bg: "#F4F7FB",
    surface: "#FFFFFF",
    surface2: "#2563EB",                     /* preview shows the SIDEBAR color */
    border: "rgba(15,23,42,0.14)",
    sidebarItem: "#DBEAFE",                  /* --rail-accent: blue-100 */
    sidebarLine: "rgba(255,255,255,0.36)",
  },
};

export function LandingPalettePicker() {
  const { palette, setPalette, mounted } = usePalette();

  return (
    <section
      aria-labelledby="landing-theme-heading"
      style={{
        maxWidth: 1240,
        margin: "0 auto",
        padding:
          "clamp(2.5rem, 5vw, 4rem) clamp(1.25rem, 3vw, 2.5rem) clamp(3rem, 5vw, 4rem)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ marginBottom: "1.85rem", textAlign: "center" }}
      >
        <span
          style={{
            display: "inline-block",
            fontFamily: "var(--font-mono)",
            fontSize: "0.66rem",
            fontWeight: 700,
            color: "var(--accent)",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            marginBottom: "0.65rem",
          }}
        >
          Apparence
        </span>
        <h2
          id="landing-theme-heading"
          style={{
            fontSize: "clamp(1.6rem, 3vw, 2rem)",
            fontWeight: 700,
            letterSpacing: "-0.025em",
            color: "var(--text)",
            margin: 0,
            maxWidth: "26ch",
            marginInline: "auto",
            lineHeight: 1.15,
          }}
        >
          Choisissez votre thème.
        </h2>
        <p
          style={{
            marginTop: "0.6rem",
            fontSize: "0.92rem",
            color: "var(--text-3)",
            maxWidth: "44ch",
            marginInline: "auto",
            lineHeight: 1.6,
          }}
        >
          Neuf palettes professionnelles. Le choix s&apos;applique
          instantanément à tout le cockpit.
        </p>
      </motion.div>

      <div
        className="landing-themes-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "0.85rem",
        }}
      >
        {PALETTES.map((meta, i) => (
          <ThemeCard
            key={meta.id}
            meta={meta}
            active={mounted && palette === meta.id}
            onSelect={() => setPalette(meta.id)}
            index={i}
          />
        ))}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .landing-themes-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 540px) {
          .landing-themes-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

function ThemeCard({
  meta,
  active,
  onSelect,
  index,
}: {
  meta: PaletteMeta;
  active: boolean;
  onSelect: () => void;
  index: number;
}) {
  const sample = SURFACE_SAMPLES[meta.id];

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      aria-label={`Appliquer le thème ${meta.label}`}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.45,
        delay: index * 0.04,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        position: "relative",
        appearance: "none",
        textAlign: "left",
        fontFamily: "inherit",
        cursor: "pointer",
        padding: "0.85rem 0.95rem 1rem",
        background: "var(--surface)",
        border: active
          ? "1.5px solid var(--accent)"
          : "1px solid var(--border)",
        borderRadius: 14,
        boxShadow: active ? "var(--tier-2)" : "var(--tier-1)",
        display: "flex",
        flexDirection: "column",
        gap: "0.85rem",
        transition:
          "box-shadow 0.22s ease, transform 0.22s ease, border-color 0.18s ease",
      }}
      onMouseEnter={(e) => {
        if (active) return;
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--tier-2)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        if (active) return;
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--tier-1)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
      }}
    >
      {/* Mini dashboard preview — same layered structure (sidebar / canvas /
       * card) as the real app, sized down. Lets the user read each palette's
       * actual hierarchy without applying it. */}
      <ThemePreview sample={sample} accent={meta.accent} />

      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "0.92rem",
              fontWeight: 700,
              letterSpacing: "-0.015em",
              color: "var(--text)",
              marginBottom: "0.2rem",
            }}
          >
            {meta.label}
          </div>
          <div
            style={{
              fontSize: "0.78rem",
              color: "var(--text-3)",
              lineHeight: 1.45,
            }}
          >
            {meta.blurb}
          </div>
        </div>

        {/* Active badge — keeps the selection state legible at the bottom
         * even after the user scrolls past the card border. */}
        <span
          aria-hidden
          style={{
            flexShrink: 0,
            width: 24,
            height: 24,
            borderRadius: 999,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: active ? "var(--accent)" : "var(--surface-2)",
            color: active ? "#FFFFFF" : "var(--text-4)",
            transition: "background 0.18s, color 0.18s",
          }}
        >
          {active && <Check size={13} strokeWidth={2.6} />}
        </span>
      </div>
    </motion.button>
  );
}

/* The mini preview renders the three core surfaces (sidebar / canvas /
 * floating card) and an accent block — the exact structural layout of
 * the cockpit so the depth ramp of each palette is directly readable. */
function ThemePreview({
  sample,
  accent,
}: {
  sample: {
    bg: string;
    surface: string;
    surface2: string;
    border: string;
    sidebarItem?: string;
    sidebarLine?: string;
  };
  accent: string;
}) {
  /* On colored sidebars (Cobalt) the rail-side accent differs from the main
   * accent so the preview's active item stays visible. Inactive lines use
   * a muted on-rail color rather than the global border. */
  const railAccent = sample.sidebarItem ?? accent;
  const railLine = sample.sidebarLine ?? sample.border;

  return (
    <div
      aria-hidden
      style={{
        position: "relative",
        height: 76,
        borderRadius: 9,
        overflow: "hidden",
        border: `1px solid ${sample.border}`,
        background: sample.bg,
        display: "flex",
      }}
    >
      {/* Sidebar band — same role as --surface-2 in the app */}
      <div
        style={{
          width: "22%",
          background: sample.surface2,
          borderRight: `1px solid ${sample.border}`,
          padding: "8px 6px",
          display: "flex",
          flexDirection: "column",
          gap: "5px",
        }}
      >
        {[0.85, 0.55, 0.55, 0.55].map((opacity, i) => (
          <span
            key={i}
            style={{
              display: "block",
              height: 4,
              borderRadius: 2,
              background: i === 0 ? railAccent : railLine,
              opacity: i === 0 ? 1 : opacity,
              width: i === 0 ? "100%" : `${60 + i * 8}%`,
            }}
          />
        ))}
      </div>

      {/* Canvas area + floating card with accent dot */}
      <div
        style={{
          flex: 1,
          padding: "8px",
          display: "flex",
          gap: 6,
          alignItems: "stretch",
          minWidth: 0,
        }}
      >
        <div
          style={{
            flex: 1.6,
            background: sample.surface,
            borderRadius: 5,
            border: `1px solid ${sample.border}`,
            padding: 6,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minWidth: 0,
          }}
        >
          <span
            style={{
              display: "block",
              width: "60%",
              height: 4,
              borderRadius: 2,
              background: sample.border,
            }}
          />
          <span
            aria-hidden
            style={{
              alignSelf: "flex-end",
              width: 14,
              height: 14,
              borderRadius: 4,
              background: accent,
            }}
          />
        </div>
        <div
          style={{
            flex: 1,
            background: sample.surface,
            borderRadius: 5,
            border: `1px solid ${sample.border}`,
            padding: 6,
            display: "flex",
            flexDirection: "column",
            gap: 4,
            justifyContent: "center",
            minWidth: 0,
          }}
        >
          <span
            style={{
              display: "block",
              width: "70%",
              height: 3,
              borderRadius: 2,
              background: sample.border,
            }}
          />
          <span
            style={{
              display: "block",
              width: "45%",
              height: 6,
              borderRadius: 2,
              background: accent,
              opacity: 0.85,
            }}
          />
        </div>
      </div>
    </div>
  );
}
