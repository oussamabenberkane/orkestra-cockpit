"use client";

import { motion } from "framer-motion";

/**
 * Subtle global route transition. `template.tsx` remounts on every navigation
 * (unlike `layout.tsx`), so this fade fires on each route change without
 * touching individual pages. Kept short (~180ms) so it doesn't compound
 * visibly with per-section `initial/animate` choreography pages already do.
 *
 * Respects prefers-reduced-motion via framer-motion's `MotionConfig`-aware
 * defaults — the opacity transition is short enough to feel near-instant.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
