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
        padding: "1rem 1.05rem 0.95rem",
        textAlign: "left",
        fontFamily: "inherit",
        color: "inherit",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: "0.7rem",
        boxShadow: "var(--tier-1)",
        transition: "box-shadow 0.25s, transform 0.18s",
        position: "relative",
        overflow: "hidden",
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
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
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
            }}
          >
            <Icon size={14} strokeWidth={2} />
          </span>
          <span style={{
            fontSize: "0.92rem", fontWeight: 600,
            color: "var(--text)",
            letterSpacing: "-0.01em",
          }}>{tile.title}</span>
        </div>
        <ArrowUpRight size={13} strokeWidth={2.25} color="var(--text-4)" />
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: "0.7rem" }}>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "1.9rem", fontWeight: 600,
          letterSpacing: "-0.035em",
          color: "var(--text)",
          lineHeight: 0.95,
          fontVariantNumeric: "tabular-nums",
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

      <p style={{
        fontSize: "0.8rem",
        color: "var(--text-3)",
        lineHeight: 1.45,
        margin: 0,
        minHeight: "1.15rem",
      }}>{tile.caption}</p>

      <div style={{
        display: "flex", alignItems: "center",
        gap: "0.5rem",
        paddingTop: "0.55rem",
        background:
          "linear-gradient(to right, transparent, var(--border) 12%, var(--border) 88%, transparent) top / 100% 1px no-repeat",
      }}>
        <span style={{
          display: "inline-flex", alignItems: "center",
          gap: "0.3rem",
          fontSize: "0.72rem", fontWeight: 600,
          color: alertColor,
        }}>
          <Circle size={5} strokeWidth={0} fill="currentColor" />
          {tile.alert}
        </span>
        <span style={{ flex: 1 }} />
        <span style={{
          fontSize: "0.66rem",
          color: "var(--text-4)",
          fontWeight: 500,
        }}>{tile.sources.join(" · ")}</span>
      </div>
    </motion.button>
  );
}
