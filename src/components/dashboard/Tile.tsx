"use client";

import { motion } from "framer-motion";
import type { TileProps, TileColor } from "@/lib/types";

const colorMap: Record<TileColor, { bar: string; iconBg: string; metric: string; alert: string; alertBg: string }> = {
  teal: {
    bar: "#028090",
    iconBg: "#F0FDFD",
    metric: "#028090",
    alert: "#028090",
    alertBg: "rgba(2,128,144,0.08)",
  },
  green: {
    bar: "#10B981",
    iconBg: "#ECFDF5",
    metric: "#10B981",
    alert: "#10B981",
    alertBg: "#ECFDF5",
  },
  red: {
    bar: "#EF4444",
    iconBg: "#FEF2F2",
    metric: "#EF4444",
    alert: "#EF4444",
    alertBg: "#FEF2F2",
  },
  orange: {
    bar: "#F59E0B",
    iconBg: "#FFFBEB",
    metric: "#F59E0B",
    alert: "#F59E0B",
    alertBg: "#FFFBEB",
  },
  malyz: {
    bar: "#2B3AE8",
    iconBg: "rgba(43,58,232,0.08)",
    metric: "#2B3AE8",
    alert: "#2B3AE8",
    alertBg: "rgba(43,58,232,0.08)",
  },
  purple: {
    bar: "#8B5CF6",
    iconBg: "#F5F3FF",
    metric: "#8B5CF6",
    alert: "#8B5CF6",
    alertBg: "#F5F3FF",
  },
};

export default function Tile({
  icon,
  title,
  metric,
  sub,
  alert,
  color,
  headerPill,
  sourcePills,
  sourceLabel = "Source :",
  modalKey,
  index,
  onOpenModal,
}: TileProps) {
  const c = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2, boxShadow: "0 6px 20px rgba(0,0,0,0.1)" }}
      onClick={() => onOpenModal(modalKey)}
      style={{
        background: "white",
        border: "1px solid #E4E7F0",
        borderRadius: "14px",
        padding: "1.1rem 1.2rem",
        cursor: "pointer",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        position: "relative",
        overflow: "hidden",
        transition: "border-color 0.2s",
      }}
    >
      {/* Top color bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: c.bar,
          borderRadius: "14px 14px 0 0",
        }}
      />

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.75rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.95rem",
              background: c.iconBg,
            }}
          >
            {icon}
          </div>
          <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1A1F36" }}>
            {title}
          </span>
        </div>
        {headerPill}
      </div>

      {/* Metric */}
      <div
        style={{
          fontFamily: "var(--font-mono), 'DM Mono', monospace",
          fontSize: "1.8rem",
          fontWeight: 500,
          color: c.metric,
          lineHeight: 1,
          marginBottom: "0.2rem",
        }}
      >
        {metric}
      </div>

      {/* Sub */}
      <div style={{ fontSize: "0.72rem", color: "#6B7280", marginBottom: "0.75rem" }}>
        {sub}
      </div>

      {/* Alert */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          fontSize: "0.72rem",
          fontWeight: 600,
          padding: "0.4rem 0.65rem",
          borderRadius: "8px",
          background: c.alertBg,
          color: c.alert,
        }}
      >
        {alert}
      </div>

      {/* Source row */}
      {sourcePills && (
        <div
          style={{
            marginTop: "0.75rem",
            paddingTop: "0.65rem",
            borderTop: "1px solid #E4E7F0",
            display: "flex",
            gap: "0.3rem",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: "0.6rem", color: "#6B7280" }}>
            {sourceLabel}
          </span>
          {sourcePills}
        </div>
      )}
    </motion.div>
  );
}
