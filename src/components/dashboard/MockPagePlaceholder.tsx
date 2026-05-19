"use client";

import { motion } from "framer-motion";
import { Construction, type LucideIcon } from "lucide-react";

interface MockPagePlaceholderProps {
  title: string;
  subtitle?: string;
  /** Lucide icon component, defaults to a hard-hat. */
  Icon?: LucideIcon;
  /** Eyebrow chip text — short brand pill. Defaults to "Bientôt". */
  eyebrow?: string;
}

/**
 * Drop-in scaffold for sidebar routes that haven't been built out yet —
 * keeps end-to-end navigation working without forcing every stub to repeat
 * the same layout. Real pages replace it when the feature is ready.
 */
export function MockPagePlaceholder({
  title,
  subtitle,
  Icon = Construction,
  eyebrow = "Bientôt",
}: MockPagePlaceholderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: "1rem",
        padding: "2rem 1rem",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 64,
          height: 64,
          borderRadius: "16px",
          background: "var(--accent-tint)",
          color: "var(--accent)",
          boxShadow: "var(--tier-1)",
        }}
      >
        <Icon size={26} strokeWidth={2} />
      </span>

      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.35rem",
          fontSize: "0.66rem",
          fontWeight: 700,
          color: "var(--accent)",
          background: "var(--accent-tint)",
          padding: "0.2rem 0.55rem",
          borderRadius: "100px",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
        }}
      >
        {eyebrow}
      </span>

      <h1
        style={{
          fontSize: "clamp(1.6rem, 3vw, 2rem)",
          fontWeight: 700,
          letterSpacing: "-0.025em",
          color: "var(--text)",
          margin: 0,
          lineHeight: 1.1,
        }}
      >
        {title}
      </h1>

      {subtitle && (
        <p
          style={{
            fontSize: "0.95rem",
            color: "var(--text-3)",
            lineHeight: 1.55,
            maxWidth: "44ch",
            margin: 0,
          }}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
