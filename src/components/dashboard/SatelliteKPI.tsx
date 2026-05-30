"use client";

import { ArrowUpRight, TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";
import type { ModalKey } from "@/lib/types";

/** Tone drives the per-card hue: sparkline area+line+dot, metric icon,
 * "⊕ combiné" chip, and focus outline. Defaults to "accent" so cards
 * without an explicit tone fall back to the existing monochrome look. */
export type SatelliteTone =
  | "accent"
  | "success"
  | "info"
  | "warn"
  | "danger"
  | "purple";

export type Satellite = {
  label: string;
  value: string;
  unit: string;
  trend: string;
  spark: number[];
  combined: boolean;
  breakdown: { src: string; val: string }[];
  Icon: LucideIcon;
  target: string;
  sparkTarget: number;
  modalKey: ModalKey;
  tone?: SatelliteTone;
};

function trendDirection(trend: string): "up" | "down" | "flat" {
  const t = trend.trim();
  if (t.startsWith("+")) return "up";
  if (t.startsWith("-") || t.startsWith("−")) return "down";
  return "flat";
}

const trendIconByDir: Record<"up" | "down" | "flat", LucideIcon> = {
  up: TrendingUp, down: TrendingDown, flat: Minus,
};
const trendColorByDir: Record<"up" | "down" | "flat", string> = {
  up: "var(--success)", down: "var(--danger)", flat: "var(--text-3)",
};

function SatelliteSparkline({
  data, target, width = 280, height = 44, idSeed, color = "var(--accent)",
}: {
  data: number[];
  target?: number;
  width?: number;
  height?: number;
  idSeed: string;
  color?: string;
}) {
  if (data.length === 0) return null;
  const lo = Math.min(...data, target ?? Infinity);
  const hi = Math.max(...data, target ?? -Infinity);
  const range = hi - lo || 1;
  const stepX = width / Math.max(1, data.length - 1);
  const y = (v: number) => height - ((v - lo) / range) * height;
  const pts = data.map((v, i) => [i * stepX, y(v)] as const);
  const linePath = pts
    .map(([x, py], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${py.toFixed(2)}`)
    .join(" ");
  const areaPath = `${linePath} L ${width.toFixed(2)} ${height} L 0 ${height} Z`;
  const last = pts[pts.length - 1];
  const targetY = target !== undefined ? y(target) : null;
  const gradId = `sat-grad-${idSeed}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      style={{ display: "block", width: "100%", height: `${height}px`, overflow: "visible" }}
      aria-hidden>
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} stroke="none" />
      {targetY !== null && (
        <line x1={0} x2={width} y1={targetY} y2={targetY}
          stroke={color} strokeOpacity="0.35"
          strokeWidth="1" strokeDasharray="3 3"
          vectorEffect="non-scaling-stroke" />
      )}
      <path d={linePath} fill="none"
        stroke={color} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round"
        vectorEffect="non-scaling-stroke" />
      <circle cx={last[0]} cy={last[1]} r="3"
        fill={color} stroke="var(--surface)" strokeWidth="1.5" />
    </svg>
  );
}

export function SatelliteKPI({
  kpi, onOpen,
}: {
  kpi: Satellite;
  onOpen: (k: ModalKey) => void;
}) {
  const dir = trendDirection(kpi.trend);
  const TrendIcon = trendIconByDir[dir];
  const trendColor = trendColorByDir[dir];
  const MetricIcon = kpi.Icon;

  /* Tone resolution — picks the CSS variable for this card's hue. The
   * full var() string is computed once and threaded through the sparkline
   * fill/stroke, the metric icon, the "⊕ combiné" chip, and the focus
   * outline so the card reads as a unified colored cell rather than a
   * monochrome accent surface. Defaults to "accent" so existing data with
   * no tone field renders unchanged. */
  const tone: SatelliteTone = kpi.tone ?? "accent";
  const toneVar = `var(--${tone})`;
  const toneTintVar = `var(--${tone}-tint)`;

  return (
    <button
      type="button"
      onClick={() => onOpen(kpi.modalKey)}
      className="satellite-kpi"
      aria-label={`${kpi.label} — ouvrir le détail`}
      style={{
        background: "var(--surface)",
        borderRadius: "12px",
        padding: "clamp(0.75rem, 2vw, 1rem) clamp(0.85rem, 2.2vw, 1.05rem)",
        boxShadow: "var(--tier-1)",
        display: "flex",
        flexDirection: "column",
        gap: "0.35rem",
        position: "relative",
        overflow: "hidden",
        transition: "box-shadow 0.2s, transform 0.2s",
        cursor: "pointer",
        textAlign: "left",
        fontFamily: "inherit",
        color: "inherit",
        width: "100%",
        minHeight: 132,
        border: "none",
        ["--kpi-tone" as string]: toneVar,
      }}
    >
      <span
        className="satellite-kpi-arrow"
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "0.7rem", right: "0.8rem",
          display: "inline-flex",
          color: "var(--text-4)",
          transition: "color 0.2s ease, transform 0.2s ease",
        }}
      >
        <ArrowUpRight size={14} strokeWidth={2.25} />
      </span>

      <div style={{
        fontSize: "clamp(0.7rem, 1.6vw, 0.74rem)",
        fontWeight: 500,
        color: "var(--text-3)",
        display: "flex", alignItems: "center",
        gap: "0.35rem",
        paddingRight: "1.4rem",
        minWidth: 0,
      }}>
        <MetricIcon size={13} strokeWidth={2.25} color={toneVar} style={{ flexShrink: 0 }} />
        <span style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>{kpi.label}</span>
        {kpi.combined && (
          <span style={{
            fontSize: "0.55rem", fontWeight: 700,
            color: toneVar,
            background: toneTintVar,
            padding: "0.05rem 0.3rem",
            borderRadius: "3px",
            letterSpacing: "0.04em",
            flexShrink: 0,
          }}>⊕</span>
        )}
      </div>

      <div style={{
        display: "flex", alignItems: "baseline",
        gap: "0.3rem", flexWrap: "wrap",
        rowGap: "0.2rem",
      }}>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "clamp(1.25rem, 3.6vw, 1.5rem)",
          fontWeight: 600,
          letterSpacing: "-0.025em",
          color: "var(--text)",
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
        }}>{kpi.value}</span>
        {kpi.unit && (
          <span style={{
            fontSize: "clamp(0.7rem, 1.7vw, 0.78rem)",
            color: "var(--text-3)",
          }}>{kpi.unit}</span>
        )}
        <span style={{ flex: 1 }} />
        <span style={{
          display: "inline-flex", alignItems: "center",
          gap: "0.2rem",
          fontSize: "clamp(0.66rem, 1.6vw, 0.7rem)",
          fontWeight: 600,
          color: trendColor,
          flexShrink: 0,
        }}>
          <TrendIcon size={10} strokeWidth={2.5} />
          {kpi.trend}
        </span>
      </div>

      <div style={{
        fontSize: "clamp(0.62rem, 1.5vw, 0.66rem)",
        color: "var(--text-3)",
        letterSpacing: "0.005em",
        fontVariantNumeric: "tabular-nums",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}>{kpi.target}</div>

      <div style={{ marginTop: "auto", position: "relative", height: 52 }}>
        <div className="satellite-kpi-spark"
          style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center",
            transition: "opacity 0.2s ease",
          }}>
          <SatelliteSparkline
            data={kpi.spark}
            target={kpi.sparkTarget}
            idSeed={kpi.label.replace(/\s+/g, "-")}
            color={toneVar} />
        </div>
        <div className="satellite-kpi-break"
          aria-hidden="true"
          style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            justifyContent: "center",
            transition: "opacity 0.2s ease",
          }}>
          {kpi.breakdown.map((b, idx) => (
            <div key={b.src} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.68rem",
              color: "var(--text-3)",
              padding: "0.14rem 0",
              borderTop: idx === 0 ? "none" : "1px solid var(--border)",
            }}>
              <span>{b.src}</span>
              <span style={{
                color: "var(--text-2)",
                fontVariantNumeric: "tabular-nums",
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
              }}>{b.val}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .satellite-kpi:hover,
        .satellite-kpi:focus-within {
          box-shadow: var(--tier-2);
          transform: translateY(-1px);
        }
        .satellite-kpi:focus-visible {
          outline: 2px solid var(--kpi-tone, var(--accent));
          outline-offset: 2px;
        }
        .satellite-kpi:hover .satellite-kpi-arrow,
        .satellite-kpi:focus-within .satellite-kpi-arrow {
          color: var(--kpi-tone, var(--accent));
          transform: translate(2px, -2px);
        }
        .satellite-kpi-break { opacity: 0; }
        .satellite-kpi:hover .satellite-kpi-spark,
        .satellite-kpi:focus-within .satellite-kpi-spark { opacity: 0; }
        .satellite-kpi:hover .satellite-kpi-break,
        .satellite-kpi:focus-within .satellite-kpi-break { opacity: 1; }
      `}</style>
    </button>
  );
}
