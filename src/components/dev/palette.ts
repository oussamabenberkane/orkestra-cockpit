"use client";

/**
 * Single source of truth for the palette switching system.
 *
 * The contract:
 *   - `applyPalette(id)` writes `data-palette` to <html>, persists to
 *     localStorage, and dispatches a custom event so any other mounted
 *     UI (e.g. floating pill + landing inline picker) can react.
 *   - `usePalette()` subscribes to that event and exposes a setter, so
 *     two pickers on the same page stay in sync automatically.
 *   - The init script in app/layout.tsx writes `data-palette` before
 *     first paint using the same V/LEGACY_REMAP mappings expressed in
 *     this file, so no-flash behaviour is preserved.
 */

import { useEffect, useState } from "react";

export type Palette =
  | "aurora"
  | "marble"
  | "pearl"
  | "mineral"
  | "atelier"
  | "cobalt"
  | "prism";

export interface PaletteMeta {
  id: Palette;
  label: string;
  /* One-line description shown in landing picker; stays out of the floating pill. */
  blurb: string;
  /* Tiny swatch shown in each chip — canvas + accent slice. */
  bg: string;
  accent: string;
  text: string;
}

/* Sample swatches mirror each palette's sidebar surface (--surface-2)
 * and accent color so the previews reflect the exact CSS values. */
export const PALETTES: readonly PaletteMeta[] = [
  { id: "aurora",   label: "Aurora",   blurb: "Cool slate sidebar, indigo accent",         bg: "#D6DEEC", accent: "#4F46E5", text: "#0F172A" },
  { id: "marble",   label: "Marble",   blurb: "Saturated dove-blue sidebar, sapphire",     bg: "#C8D2E6", accent: "#1E40AF", text: "#1A1E2E" },
  { id: "pearl",    label: "Pearl",    blurb: "Zinc-neutral chrome, editorial ink",        bg: "#D4D4D8", accent: "#18181B", text: "#09090B" },
  { id: "mineral",  label: "Mineral",  blurb: "Heaviest cool slate, technical cyan",       bg: "#B5C1D2", accent: "#0E7490", text: "#0F172A" },
  { id: "atelier",  label: "Atelier",  blurb: "Industrial slate, engineering blue",        bg: "#B5BDCB", accent: "#1D4ED8", text: "#0F172A" },
  { id: "cobalt",   label: "Cobalt",   blurb: "Deep cobalt sidebar, light app",            bg: "#1E3A8A", accent: "#2563EB", text: "#0F172A" },
  { id: "prism",    label: "Prism",    blurb: "Paper chrome, violet accent, multi-hue chips", bg: "#D8DBE5", accent: "#6D28D9", text: "#15172B" },
] as const;

const STORAGE_KEY = "orkestra.palette.v1";
const CHANGE_EVENT = "orkestra:palette-change";

const VALID_IDS = new Set<Palette>(PALETTES.map((p) => p.id));

/* Legacy IDs from previously-removed variants fall through to a sensible
 * survivor so old preview links / persisted localStorage values resolve
 * gracefully instead of being silently dropped to the default. */
const LEGACY_REMAP: Record<string, Palette> = {
  cool:     "aurora",
  warm:     "marble",
  slate:    "atelier",
  midnight: "cobalt",    // saturated deep blue → saturated deep blue
  forest:   "mineral",
  graphite: "pearl",
  stratus:  "aurora",    // cool neutral light → cool slate light
  quill:    "marble",    // lavender chrome with violet accent → saturated tinted chrome
  mist:     "aurora",    // soft cool light → soft cool light
  granite:  "pearl",     // heavy neutral → editorial neutral
};

export function normalizePalette(raw: string | null): Palette | null {
  if (!raw) return null;
  if (raw in LEGACY_REMAP) return LEGACY_REMAP[raw];
  return VALID_IDS.has(raw as Palette) ? (raw as Palette) : null;
}

export function readInitialPalette(): Palette {
  if (typeof window === "undefined") return "aurora";
  try {
    const fromUrl = normalizePalette(
      new URL(window.location.href).searchParams.get("palette"),
    );
    if (fromUrl) return fromUrl;
    const fromStorage = normalizePalette(window.localStorage.getItem(STORAGE_KEY));
    if (fromStorage) return fromStorage;
  } catch {
    /* fall through */
  }
  return "aurora";
}

export function applyPalette(p: Palette) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-palette", p);
  try {
    window.localStorage.setItem(STORAGE_KEY, p);
  } catch {
    /* private mode etc. — apply still succeeds, persistence skipped */
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: p }));
}

/**
 * React hook for palette state. Subscribes to the change event so
 * multiple pickers on the same page stay aligned. `mounted` flips
 * true after the initial effect so callers can render an SSR-safe
 * skeleton until the client-side palette is resolved.
 */
export function usePalette() {
  const [palette, setPaletteState] = useState<Palette>("aurora");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial = readInitialPalette();
    setPaletteState(initial);
    applyPalette(initial);
    setMounted(true);

    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<Palette>).detail;
      if (detail) setPaletteState(detail);
    };
    window.addEventListener(CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CHANGE_EVENT, onChange);
  }, []);

  return {
    palette,
    setPalette: (p: Palette) => applyPalette(p),
    mounted,
  };
}
