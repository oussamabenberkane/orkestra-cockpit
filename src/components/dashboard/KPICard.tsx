"use client";

import { motion } from "framer-motion";
import type { KPICardProps } from "@/lib/types";

const trendColors = {
  up: "#10B981",
  down: "#EF4444",
  info: "#2B3AE8",
};

export default function KPICard({
  label,
  value,
  trend,
  trendType,
  valueColor,
  index,
}: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
      style={{
        background: "white",
        border: "1px solid #E4E7F0",
        borderRadius: "12px",
        padding: "0.9rem 1rem",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        cursor: "default",
      }}
    >
      <div
        style={{
          fontSize: "0.68rem",
          fontWeight: 600,
          color: "#6B7280",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          marginBottom: "0.4rem",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono), 'DM Mono', monospace",
          fontSize: "1.5rem",
          fontWeight: 500,
          color: valueColor ?? "#1E2761",
          lineHeight: 1,
          marginBottom: "0.3rem",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "0.68rem",
          fontWeight: 600,
          color: trendColors[trendType],
        }}
      >
        {trend}
      </div>
    </motion.div>
  );
}
