"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/**
 * Floating "back to the app" affordance for fullscreen pages that sit outside
 * the Sidebar shell (currently only `/chat`). Pinned top-left of the viewport.
 *
 * Uses router.back() when the user navigated in from inside the app
 * (`window.history.length > 1`), otherwise falls back to /dashboard so a
 * direct-load of /chat still gives the user a way home.
 */
export function BackToApp({
  label = "Cockpit",
  fallback = "/dashboard",
}: {
  label?: string;
  fallback?: string;
}) {
  const router = useRouter();

  const handleClick = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Retour ${label.toLowerCase()}`}
      style={{
        position: "fixed",
        top: "1rem",
        left: "1rem",
        zIndex: 50,
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        height: 36,
        padding: "0 0.85rem 0 0.7rem",
        background: "var(--surface)",
        border: "none",
        borderRadius: 999,
        color: "var(--text-2)",
        fontFamily: "inherit",
        fontSize: "0.8rem",
        fontWeight: 600,
        letterSpacing: "-0.005em",
        cursor: "pointer",
        boxShadow: "var(--tier-1)",
        transition: "transform 0.18s ease, color 0.18s ease, box-shadow 0.18s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.color = "var(--text)";
        e.currentTarget.style.boxShadow = "var(--tier-2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.color = "var(--text-2)";
        e.currentTarget.style.boxShadow = "var(--tier-1)";
      }}
    >
      <ArrowLeft size={14} strokeWidth={2.25} color="var(--accent)" />
      {label}
    </button>
  );
}
