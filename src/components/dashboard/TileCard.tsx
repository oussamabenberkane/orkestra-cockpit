"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight, Circle,
  type LucideIcon,
} from "lucide-react";
import { Sparkline } from "@/components/shared/Sparkline";
import type { ModalKey } from "@/lib/types";

export type TileEntry = {
  Icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  glowColor?: string;
  title: string;
  metric: string;
  unit: string;
  caption: string;
  alert: string;
  alertTone: "warn" | "good" | "neutral" | "danger";
  sources: string[];
  modalKey: ModalKey;
  spark?: number[];
};

interface TileCardProps {
  tile: TileEntry;
  onOpen: (k: ModalKey) => void;
}

export function TileCard({ tile, onOpen }: TileCardProps) {
  const { Icon } = tile;
  const alertColor =
    tile.alertTone === "warn"   ? "var(--warn)"
    : tile.alertTone === "good"   ? "var(--success)"
    : tile.alertTone === "danger" ? "var(--danger)"
    : "var(--text-3)";

  const glow = tile.glowColor ?? tile.iconBg;

  return (
    <motion.button
      onClick={() => onOpen(tile.modalKey)}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.18 }}
      style={{
        background: "var(--surface)",
        border: "none",
        borderRadius: "12px",
        padding: "clamp(0.85rem, 2.2vw, 1.05rem) clamp(0.9rem, 2.4vw, 1.1rem) clamp(0.8rem, 2vw, 0.95rem)",
        textAlign: "left",
        fontFamily: "inherit",
        color: "inherit",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: "clamp(0.55rem, 1.5vw, 0.7rem)",
        boxShadow: "var(--tier-1)",
        transition: "box-shadow 0.25s, transform 0.18s",
        position: "relative",
        overflow: "hidden",
        minHeight: 138,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = `var(--tier-2), 0 0 0 4px ${glow}`;
        const icon = e.currentTarget.querySelector("[data-tile-icon]") as HTMLElement | null;
        if (icon) icon.style.transform = "rotate(4deg) scale(1.06)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "var(--tier-1)";
        const icon = e.currentTarget.querySelector("[data-tile-icon]") as HTMLElement | null;
        if (icon) icon.style.transform = "rotate(0) scale(1)";
      }}
    >
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        gap: "0.5rem",
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "0.55rem",
          minWidth: 0, flex: 1,
        }}>
          <span
            data-tile-icon
            style={{
              width: 30, height: 30,
              background: tile.iconBg,
              color: tile.iconColor,
              borderRadius: "9px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
              transition: "transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
              flexShrink: 0,
            }}
          >
            <Icon size={14} strokeWidth={2} />
          </span>
          <span style={{
            fontSize: "clamp(0.86rem, 2vw, 0.92rem)",
            fontWeight: 600,
            color: "var(--text)",
            letterSpacing: "-0.01em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>{tile.title}</span>
        </div>
        <ArrowUpRight size={13} strokeWidth={2.25} color="var(--text-4)" style={{ flexShrink: 0 }} />
      </div>

      <div style={{
        display: "flex", alignItems: "flex-end",
        gap: "clamp(0.5rem, 1.5vw, 0.7rem)",
        minWidth: 0,
      }}>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "clamp(1.45rem, 4.4vw, 1.9rem)",
          fontWeight: 600,
          letterSpacing: "-0.035em",
          color: "var(--text)",
          lineHeight: 0.95,
          fontVariantNumeric: "tabular-nums",
          flexShrink: 0,
        }}>
          {tile.metric}
          {tile.unit && (
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.55em", fontWeight: 500,
              color: "var(--text-3)",
              marginLeft: "0.12rem",
              letterSpacing: 0,
            }}>{tile.unit}</span>
          )}
        </span>
        {tile.spark && (
          <div style={{
            flex: 1, marginBottom: "0.2rem",
            color: tile.iconColor, opacity: 0.85,
            minWidth: 0,
            overflow: "hidden",
          }}>
            <Sparkline
              data={tile.spark}
              width={130}
              height={20}
              stroke="currentColor"
              strokeWidth={1.4}
            />
          </div>
        )}
      </div>

      <div style={{
        display: "flex", alignItems: "center",
        gap: "0.5rem", flexWrap: "wrap", rowGap: "0.3rem",
        paddingTop: "0.55rem",
        background:
          "linear-gradient(to right, transparent, var(--border) 12%, var(--border) 88%, transparent) top / 100% 1px no-repeat",
      }}>
        <span style={{
          display: "inline-flex", alignItems: "center",
          gap: "0.3rem",
          fontSize: "clamp(0.68rem, 1.7vw, 0.72rem)",
          fontWeight: 600,
          color: alertColor,
          minWidth: 0,
        }}>
          <Circle size={5} strokeWidth={0} fill="currentColor" />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{tile.alert}</span>
        </span>
        <span style={{ flex: 1, minWidth: 0 }} />
        <span style={{
          fontSize: "clamp(0.62rem, 1.5vw, 0.66rem)",
          color: "var(--text-4)",
          fontWeight: 500,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>{tile.sources.join(" · ")}</span>
      </div>
    </motion.button>
  );
}
