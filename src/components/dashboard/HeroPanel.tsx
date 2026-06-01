"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TrendingUp, LineChart, BarChart3 } from "lucide-react";

export type HeroEvent = { i: number; label: string; sub: string };
export type Period = "M" | "T" | "A";
export type HeroView = "trend" | "distribution";
export type HeroDistributionItem = { label: string; value: number };

interface HeroPanelProps {
  title: string;
  combinedBadge?: boolean;
  value: string;
  unit?: string;
  yoyLabel?: string;
  data: number[];
  months: string[];
  events?: HeroEvent[];
  period: Period;
  onPeriodChange: (p: Period) => void;
  distribution?: HeroDistributionItem[];
}

function monotoneCubicPath(pts: ReadonlyArray<readonly [number, number]>): string {
  const n = pts.length;
  if (n === 0) return "";
  if (n === 1) return `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  if (n === 2)
    return `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)} L ${pts[1][0].toFixed(2)} ${pts[1][1].toFixed(2)}`;

  const dx: number[] = [];
  const dy: number[] = [];
  const slope: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    const dxi = pts[i + 1][0] - pts[i][0];
    const dyi = pts[i + 1][1] - pts[i][1];
    dx.push(dxi);
    dy.push(dyi);
    slope.push(dyi / dxi);
  }
  const m: number[] = new Array(n);
  m[0] = slope[0];
  m[n - 1] = slope[n - 2];
  for (let i = 1; i < n - 1; i++) {
    m[i] = slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2;
  }
  for (let i = 0; i < n - 1; i++) {
    if (slope[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
    } else {
      const a = m[i] / slope[i];
      const b = m[i + 1] / slope[i];
      const h = Math.hypot(a, b);
      if (h > 3) {
        const t = 3 / h;
        m[i] = t * a * slope[i];
        m[i + 1] = t * b * slope[i];
      }
    }
  }
  let d = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < n - 1; i++) {
    const c1x = pts[i][0] + dx[i] / 3;
    const c1y = pts[i][1] + (m[i] * dx[i]) / 3;
    const c2x = pts[i + 1][0] - dx[i] / 3;
    const c2y = pts[i + 1][1] - (m[i + 1] * dx[i]) / 3;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${pts[i + 1][0].toFixed(2)} ${pts[i + 1][1].toFixed(2)}`;
  }
  return d;
}

/** Secondary control — granularity selector inside the chosen view.
 *  Renders as letter chips (M/T/A) so it visually reads as a "filter"
 *  rather than competing with the primary ViewToggle. */
function PeriodToggle({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  const options: { v: Period; label: string; full: string }[] = [
    { v: "M", label: "M", full: "Mois" },
    { v: "T", label: "T", full: "Trimestre" },
    { v: "A", label: "A", full: "Année" },
  ];
  const idx = options.findIndex((o) => o.v === value);
  return (
    <div
      role="tablist"
      aria-label="Granularité de la période"
      className="hero-period-toggle"
      style={{
        display: "flex",
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        borderRadius: "7px",
        padding: "2px",
        position: "relative",
        flexShrink: 0,
        /* Explicit height — guarantees the track matches ViewToggle pixel-for-pixel.
         * 32px = 1px border + 2px padding + 26px button + 2px padding + 1px border. */
        height: 32,
      }}
    >
      <span aria-hidden style={{
        position: "absolute",
        top: 2, bottom: 2,
        left: `calc(2px + ${idx} * (100% - 4px) / 3)`,
        width: "calc((100% - 4px) / 3)",
        background: "var(--surface)",
        borderRadius: "5px",
        boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
        transition: "left 0.22s cubic-bezier(0.22, 1, 0.36, 1)",
      }} />
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          role="tab"
          aria-selected={value === o.v}
          aria-label={o.full}
          onClick={() => onChange(o.v)}
          className="hero-period-btn"
          style={{
            position: "relative", zIndex: 1,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            color: value === o.v ? "var(--text)" : "var(--text-3)",
            border: "none",
            borderRadius: "5px",
            padding: "0 0.4rem",
            fontFamily: "var(--font-mono)",
            fontSize: "0.66rem", fontWeight: 700,
            letterSpacing: "0.04em",
            cursor: "pointer",
            transition: "color 0.18s",
            height: 26,
            minWidth: 22,
          }}
        >{o.label}</button>
      ))}
    </div>
  );
}

/** Primary control — switches the chart between two distinct visualisations.
 *  Gets a heavier visual treatment than PeriodToggle: filled accent background
 *  on the active segment so users read it as the dominant choice in the row. */
function ViewToggle({ value, onChange }: { value: HeroView; onChange: (v: HeroView) => void }) {
  const options: { v: HeroView; label: string; Icon: typeof LineChart }[] = [
    { v: "trend",        label: "Tendance",    Icon: LineChart },
    { v: "distribution", label: "Répartition", Icon: BarChart3 },
  ];
  const idx = options.findIndex((o) => o.v === value);
  return (
    <div
      role="tablist"
      aria-label="Mode d'affichage du graphique"
      className="hero-view-toggle"
      style={{
        display: "flex",
        background: "var(--accent-tint)",
        border: "1px solid var(--accent-tint-2)",
        borderRadius: "7px",
        padding: "2px",
        position: "relative",
        flexShrink: 0,
        /* Explicit height — keeps the track byte-identical to PeriodToggle.
         * 32px = 1px border + 2px padding + 26px button + 2px padding + 1px border. */
        height: 32,
      }}
    >
      <span aria-hidden style={{
        position: "absolute",
        top: 2, bottom: 2,
        left: `calc(2px + ${idx} * (100% - 4px) / 2)`,
        width: "calc((100% - 4px) / 2)",
        background: "var(--accent)",
        borderRadius: "5px",
        boxShadow: "0 1px 3px -1px rgba(88, 86, 214, 0.45)",
        transition: "left 0.24s cubic-bezier(0.22, 1, 0.36, 1)",
      }} />
      {options.map((o) => {
        const Icon = o.Icon;
        const active = value === o.v;
        return (
          <button
            key={o.v}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={o.label}
            onClick={() => onChange(o.v)}
            className="hero-view-btn"
            style={{
              position: "relative", zIndex: 1,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.3rem",
              background: "transparent",
              color: active ? "#FFFFFF" : "var(--accent)",
              border: "none",
              borderRadius: "5px",
              padding: "0 0.55rem",
              fontFamily: "inherit",
              fontSize: "0.68rem", fontWeight: 600,
              letterSpacing: "-0.005em",
              cursor: "pointer",
              transition: "color 0.18s",
              height: 26,
            }}
          >
            <Icon size={11} strokeWidth={2.4} aria-hidden="true" />
            <span className="hero-view-btn__label">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Pick the value suffix from the headline's unit so the histogram labels
 *  speak the same language as the big number above. Broker carries values
 *  in K CHF (unit = "CHF"), commodity carries them in M CHF (unit = "M CHF").
 *  Anything starting with "M" is treated as already-in-millions. */
function formatHistValue(v: number, unit: string | undefined): string {
  const u = (unit ?? "").trim().toUpperCase();
  if (u.startsWith("M")) return `${v.toFixed(1)} M`;
  return `${Math.round(v)} K`;
}

function Histogram({ items, unit }: { items: HeroDistributionItem[]; unit?: string }) {
  const w = 600;
  const h = 200;
  const padX = 28;
  /* Asymmetric vertical padding: the top reserves room for the larger
   * value labels we render as HTML above each bar, so even the tallest
   * bar's label sits inside the chart container instead of bleeding
   * upwards into the headline area. The bottom is kept tight so the
   * bar baseline sits close to the partner-name strip below the chart. */
  const padTop = 52;
  const padBottom = 6;
  const chartH = h - padTop - padBottom;
  const baseY = h - padBottom;

  const n = items.length;
  const slot = (w - padX * 2) / n;
  const barW = slot * 0.6;
  const barOffset = (slot - barW) / 2;

  const max = Math.max(...items.map((d) => d.value)) || 1;
  const total = items.reduce((s, d) => s + d.value, 0) || 1;

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <defs>
          <linearGradient id="hist-grad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%"   stopColor="var(--accent)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.45" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((p) => (
          <line key={p}
            x1={padX} x2={w - padX}
            y1={padTop + p * chartH}
            y2={padTop + p * chartH}
            stroke="var(--border-strong)"
            strokeWidth="1"
            strokeDasharray="1 5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            opacity="0.9" />
        ))}
        <line
          x1={padX} x2={w - padX}
          y1={baseY} y2={baseY}
          stroke="var(--border-strong)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
          opacity="0.55" />
        {items.map((d, i) => {
          const barH = (d.value / max) * chartH;
          const x = padX + i * slot + barOffset;
          const y = baseY - barH;
          return (
            <motion.rect
              key={d.label}
              x={x}
              width={barW}
              rx={4}
              fill="url(#hist-grad)"
              initial={{ y: baseY, height: 0 }}
              animate={{ y, height: barH }}
              transition={{
                delay: 0.06 + i * 0.07,
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          );
        })}
      </svg>

      {/* Value labels — rendered as HTML so they don't get squashed by the
          SVG's preserveAspectRatio="none" stretch. Each label sits flush above
          its bar's top edge, horizontally centered on the bar via translate. */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {items.map((d, i) => {
          const barH = (d.value / max) * chartH;
          const x = padX + i * slot + barOffset;
          const y = baseY - barH;
          const pct = (d.value / total) * 100;
          return (
            /* Two layers: outer plain <div> owns the static positioning
             * (anchor at bar top + translate above), inner <motion.div> owns
             * the entrance animation only. Combining both on the same element
             * would let framer-motion's transform pipeline overwrite the
             * static translate(-50%, calc(-100% - 12px)) once the `y` tween
             * starts — which is what made the labels render *inside* the
             * bars (top edge stuck at bar top, left edge stuck at bar center). */
            <div
              key={d.label}
              style={{
                position: "absolute",
                left: `${((x + barW / 2) / w) * 100}%`,
                top: `${(y / h) * 100}%`,
                transform: "translate(-50%, calc(-100% - 12px))",
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.42 + i * 0.07, duration: 0.32 }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                  whiteSpace: "nowrap",
                  textAlign: "center",
                }}
              >
                <span style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "clamp(0.85rem, 2.2vw, 1.02rem)",
                  fontWeight: 700,
                  color: "var(--text)",
                  letterSpacing: "-0.025em",
                  fontVariantNumeric: "tabular-nums",
                  lineHeight: 1.05,
                }}>{formatHistValue(d.value, unit)}</span>
                <span style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "clamp(0.6rem, 1.4vw, 0.66rem)",
                  fontWeight: 600,
                  color: "var(--text-3)",
                  letterSpacing: "0.02em",
                  lineHeight: 1,
                }}>{Math.round(pct)} %</span>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function HeroPanel({
  title, combinedBadge, value, unit, yoyLabel,
  data, months, events = [],
  period, onPeriodChange,
  distribution,
}: HeroPanelProps) {
  const [hoveredEvent, setHoveredEvent] = useState<number | null>(null);
  const [view, setView] = useState<HeroView>("trend");
  const hasDistribution = !!(distribution && distribution.length > 0);
  /* Auto-fall-back if a workspace switches to data with no distribution
   * (e.g., live broker data before the partner-breakdown view exists). */
  const effectiveView: HeroView = view === "distribution" && !hasDistribution ? "trend" : view;

  const w = 600;
  const h = 200;
  const padX = 28;
  const padY = 24;
  const stepX = (w - padX * 2) / Math.max(1, data.length - 1);
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = padX + i * stepX;
    const y = padY + (1 - (v - min) / range) * (h - padY * 2);
    return [x, y] as const;
  });
  const line = monotoneCubicPath(pts);
  const baselineY = h - padY / 2;
  const area = `${line} L ${pts[pts.length - 1][0].toFixed(2)} ${baselineY} L ${pts[0][0].toFixed(2)} ${baselineY} Z`;
  const [nowX, nowY] = pts[pts.length - 1];

  return (
    <div style={{
      background: "var(--surface)",
      borderRadius: "14px",
      padding: "clamp(0.9rem, 2.4vw, 1.25rem) clamp(0.95rem, 2.6vw, 1.25rem) clamp(0.7rem, 2vw, 0.85rem)",
      boxShadow: "var(--tier-1)",
      display: "flex",
      flexDirection: "column",
      gap: "clamp(0.65rem, 1.8vw, 0.85rem)",
      minHeight: "clamp(280px, 60vw, 340px)",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", gap: "0.5rem",
        flexWrap: "wrap",
        rowGap: "0.5rem",
      }}>
        <div style={{
          fontSize: "clamp(0.72rem, 1.7vw, 0.78rem)",
          fontWeight: 500,
          color: "var(--text-3)",
          display: "flex", alignItems: "center", gap: "0.4rem",
          minWidth: 0,
        }}>
          <span style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>{title}</span>
          {combinedBadge && (
            <span style={{
              fontSize: "0.58rem", fontWeight: 700,
              color: "var(--accent)",
              background: "var(--accent-tint)",
              padding: "0.1rem 0.35rem",
              borderRadius: "4px",
              letterSpacing: "0.06em",
              flexShrink: 0,
            }}>⊕ COMBINÉ</span>
          )}
        </div>
        {/* Toggles stay on a single row at every width. The whole group wraps
         *  below the title when the row gets tight rather than the two toggles
         *  stacking on top of each other. */}
        <div
          className="hero-toggles"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginLeft: "auto",
            flexShrink: 0,
            flexWrap: "nowrap",
          }}
        >
          {hasDistribution && <ViewToggle value={effectiveView} onChange={setView} />}
          <PeriodToggle value={period} onChange={onPeriodChange} />
        </div>
      </div>

      <div style={{
        display: "flex",
        alignItems: "baseline",
        gap: "clamp(0.45rem, 1.6vw, 0.85rem)",
        flexWrap: "wrap",
        rowGap: "0.3rem",
      }}>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "clamp(1.7rem, 6vw, 2.7rem)",
          fontWeight: 600,
          letterSpacing: "-0.035em",
          color: "var(--text)",
          lineHeight: 0.95,
          fontVariantNumeric: "tabular-nums",
        }}>{value}</span>
        {unit && (
          <span style={{
            fontSize: "clamp(0.74rem, 1.7vw, 0.84rem)",
            fontWeight: 500,
            color: "var(--text-3)",
          }}>
            {unit}
          </span>
        )}
        {yoyLabel && (
          <span style={{
            display: "inline-flex", alignItems: "center",
            gap: "0.25rem",
            fontSize: "clamp(0.66rem, 1.6vw, 0.72rem)",
            fontWeight: 700,
            color: "var(--success)",
            background: "var(--success-tint)",
            padding: "0.18rem 0.5rem",
            borderRadius: "5px",
            marginLeft: "0.25rem",
          }}>
            <TrendingUp size={11} strokeWidth={2.5} />
            {yoyLabel}
          </span>
        )}
      </div>

      <div style={{ position: "relative", flex: 1, minHeight: 180 }}>
        <AnimatePresence mode="wait" initial={false}>
          {effectiveView === "trend" ? (
            <motion.div
              key="trend"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              style={{ position: "absolute", inset: 0 }}
            >
              <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none"
                style={{ width: "100%", height: "100%", display: "block" }}>
                <defs>
                  <linearGradient id="hero-grad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.26" />
                    <stop offset="38%" stopColor="var(--accent)" stopOpacity="0.12" />
                    <stop offset="75%" stopColor="var(--accent)" stopOpacity="0.03" />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[0.25, 0.5, 0.75].map((p) => (
                  <line key={p}
                    x1={padX} x2={w - padX}
                    y1={padY + p * (h - padY * 2)}
                    y2={padY + p * (h - padY * 2)}
                    stroke="var(--border-strong)"
                    strokeWidth="1"
                    strokeDasharray="1 5"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    opacity="0.9" />
                ))}
                <path d={area} fill="url(#hero-grad)" />
                <line
                  x1={nowX} x2={nowX}
                  y1={padY} y2={baselineY}
                  stroke="var(--accent)"
                  strokeWidth="1"
                  strokeDasharray="2 5"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  opacity="0.32" />
                <motion.path
                  d={line}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }} />
              </svg>

              {/* Event markers and 'Aujourd'hui' overlays.
               *
               * Each event picks its hue from the SIGN of its label: amounts
               * starting with "+" read as wins (success/emerald), amounts
               * starting with "−" / "-" read as losses (danger/red). Labels
               * with no signed amount fall back to the accent so chart-level
               * identity stays consistent. This gives the chart two
               * semantically-meaningful color points beyond the accent line
               * without needing per-event color data. */}
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                {events.map((ev) => {
                  if (ev.i < 0 || ev.i >= pts.length) return null;
                  const [x, y] = pts[ev.i];
                  const isHovered = hoveredEvent === ev.i;
                  const lbl = ev.label.trim();
                  const tone: "success" | "danger" | "accent" =
                    lbl.startsWith("+") ? "success"
                    : (lbl.startsWith("−") || lbl.startsWith("-")) ? "danger"
                    : "accent";
                  const toneVar = `var(--${tone})`;
                  const toneTintVar = `var(--${tone}-tint)`;
                  return (
                    <div key={ev.i} style={{
                      position: "absolute",
                      left: `${(x / w) * 100}%`,
                      top: `${(y / h) * 100}%`,
                      transform: "translate(-50%, -50%)",
                      pointerEvents: "auto",
                    }}>
                      <button
                        type="button"
                        onMouseEnter={() => setHoveredEvent(ev.i)}
                        onMouseLeave={() => setHoveredEvent(null)}
                        onFocus={() => setHoveredEvent(ev.i)}
                        onBlur={() => setHoveredEvent(null)}
                        aria-label={ev.label}
                        style={{
                          position: "relative",
                          display: "block",
                          width: 12, height: 12,
                          padding: 0,
                          borderRadius: "50%",
                          background: "var(--surface)",
                          border: `1.75px solid ${toneVar}`,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          transition: "transform 0.18s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.18s ease",
                          transform: isHovered ? "scale(1.18)" : "scale(1)",
                          boxShadow: isHovered
                            ? `0 0 0 5px ${toneTintVar}, 0 2px 6px rgba(15,23,42,0.18)`
                            : "0 1px 2px rgba(0,0,0,0.08)",
                        }}>
                        <span aria-hidden style={{
                          position: "absolute",
                          inset: "32%",
                          borderRadius: "50%",
                          background: toneVar,
                        }} />
                      </button>
                    </div>
                  );
                })}

                <div style={{
                  position: "absolute",
                  left: `${(nowX / w) * 100}%`,
                  top: `${(nowY / h) * 100}%`,
                  transform: "translate(-50%, -50%)",
                }}>
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      width: 12, height: 12, borderRadius: "50%",
                      background: "var(--surface)",
                      border: "1.75px solid var(--accent)",
                      boxShadow:
                        "0 0 0 4px var(--accent-tint), 0 1px 2px rgba(0,0,0,0.08)",
                    }} />
                </div>
              </div>

              {/* "Aujourd'hui" pill — anchored to the right edge of the chart so it
                  never bleeds past the container on narrow widths. The 'now' dot is
                  always the rightmost data point, so right-pinning stays semantically
                  correct at every width. */}
              <div style={{
                position: "absolute",
                right: "0.3rem",
                top: `${(padY / h) * 100}%`,
                transform: "translateY(calc(-100% - 0.35rem))",
                pointerEvents: "none",
                maxWidth: "calc(100% - 0.6rem)",
              }}>
                <span style={{
                  display: "inline-flex", alignItems: "center",
                  gap: "0.3rem",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.58rem", fontWeight: 600,
                  color: "var(--accent)",
                  background: "var(--accent-tint)",
                  padding: "0.15rem 0.45rem",
                  borderRadius: "100px",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  border: "1px solid var(--accent-tint-2)",
                }}>
                  <span aria-hidden style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--accent)" }} />
                  Aujourd&apos;hui
                </span>
              </div>

              {hoveredEvent !== null && (() => {
                const ev = events.find((e) => e.i === hoveredEvent);
                if (!ev) return null;
                const [x, y] = pts[ev.i];
                const xPct = (x / w) * 100;
                const yPct = (y / h) * 100;
                return (
                  <div style={{
                    position: "absolute",
                    left: `${xPct}%`,
                    top: `${yPct}%`,
                    transform: "translate(-50%, calc(-100% - 14px))",
                    background: "var(--text)",
                    color: "var(--surface)",
                    padding: "0.55rem 0.75rem",
                    borderRadius: "8px",
                    fontSize: "clamp(0.68rem, 1.7vw, 0.74rem)",
                    fontWeight: 500,
                    maxWidth: "min(240px, 70vw)",
                    pointerEvents: "none",
                    boxShadow: "0 8px 20px -6px rgba(0,0,0,0.32)",
                    zIndex: 5,
                  }}>
                    <div style={{ fontWeight: 700, marginBottom: "0.1rem" }}>{ev.label}</div>
                    <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.7rem" }}>{ev.sub}</div>
                    <span aria-hidden style={{
                      position: "absolute",
                      left: "50%", bottom: -4,
                      transform: "translateX(-50%) rotate(45deg)",
                      width: 8, height: 8,
                      background: "var(--text)",
                    }} />
                  </div>
                );
              })()}
            </motion.div>
          ) : (
            <motion.div
              key="distribution"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              style={{ position: "absolute", inset: 0 }}
            >
              {distribution && <Histogram items={distribution} unit={unit} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {effectiveView === "trend" ? (
        <div className="hero-month-labels" style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "var(--font-mono)",
          fontSize: "clamp(0.58rem, 1.4vw, 0.66rem)",
          color: "var(--text-4)",
          padding: "0 0.4rem",
        }}>
          {months.map((m, i) => (
            <span
              key={`${m}-${i}`}
              data-month-index={i}
              style={{ opacity: i % 2 === 0 ? 1 : 0.55 }}
            >
              {m}
            </span>
          ))}
        </div>
      ) : distribution ? (
        /* Partner / underlying labels — grid columns line up with the bar
           centers exactly (same padX as the SVG). Negative marginTop counter-
           acts the panel's flex gap so the names sit close to the bars they
           label rather than floating in the middle of the row below. */
        <div
          className="hero-distribution-labels"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${distribution.length}, 1fr)`,
            padding: `0 ${(28 / 600) * 100}%`,
            marginTop: "calc(-1 * clamp(0.4rem, 1.2vw, 0.55rem))",
            fontFamily: "var(--font-mono)",
            fontSize: "clamp(0.62rem, 1.5vw, 0.7rem)",
            fontWeight: 600,
            color: "var(--text-2)",
            columnGap: "0.4rem",
          }}
        >
          {distribution.map((d) => (
            <span
              key={d.label}
              title={d.label}
              style={{
                textAlign: "center",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {d.label}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
