"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

export type HeroEvent = { i: number; label: string; sub: string };
export type Period = "M" | "T" | "A";

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

function PeriodToggle({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  const options: { v: Period; label: string }[] = [
    { v: "M", label: "Mois" },
    { v: "T", label: "Trim." },
    { v: "A", label: "Année" },
  ];
  const idx = options.findIndex((o) => o.v === value);
  return (
    <div style={{
      display: "flex",
      background: "var(--surface-2)",
      border: "1px solid var(--border)",
      borderRadius: "8px",
      padding: "2px",
      position: "relative",
      /* When the header row wraps on narrow widths, this keeps the toggle
         right-aligned on its own line. No effect on desktop, where the
         parent's space-between already places it at the end. */
      marginLeft: "auto",
    }}>
      <span aria-hidden style={{
        position: "absolute",
        top: 2, bottom: 2,
        left: `calc(2px + ${idx} * (100% - 4px) / 3)`,
        width: "calc((100% - 4px) / 3)",
        background: "var(--surface)",
        borderRadius: "6px",
        boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
        transition: "left 0.22s cubic-bezier(0.22, 1, 0.36, 1)",
      }} />
      {options.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className="hero-period-btn"
          style={{
            position: "relative", zIndex: 1,
            background: "transparent",
            color: value === o.v ? "var(--text)" : "var(--text-3)",
            border: "none",
            borderRadius: "6px",
            padding: "0.35rem 0.75rem",
            fontFamily: "inherit",
            fontSize: "0.72rem", fontWeight: 600,
            cursor: "pointer",
            transition: "color 0.18s",
            minHeight: 32,
          }}
        >{o.label}</button>
      ))}
    </div>
  );
}

export function HeroPanel({
  title, combinedBadge, value, unit, yoyLabel,
  data, months, events = [],
  period, onPeriodChange,
}: HeroPanelProps) {
  const [hoveredEvent, setHoveredEvent] = useState<number | null>(null);

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
        <PeriodToggle value={period} onChange={onPeriodChange} />
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
      </div>

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
    </div>
  );
}
