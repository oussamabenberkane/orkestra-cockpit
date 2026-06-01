"use client";

import { Landmark, LineChart, type LucideIcon } from "lucide-react";
import { useWorkspace, WORKSPACES, type Workspace } from "@/lib/workspaces";

/* Segmented pill — BFSI / Commodities — centered in the app top strip.
 * The active tab reads from WorkspaceContext (persisted to localStorage),
 * so switching here also re-renders the sidebar nav and dashboard data.
 *
 * Visual: blue container, white labels at rest; the active tab is a
 * white pill with dark text. Simple, high-contrast, palette-aware via
 * --accent (always the brand blue across palettes).
 *
 * Icon choices: Landmark (institutional columns) reads as BFSI;
 * LineChart (P&L curves) reads as a commodity trading desk. */

const META: Record<Workspace, { Icon: LucideIcon; fallback: string }> = {
  broker:    { Icon: Landmark,  fallback: "BFSI" },
  commodity: { Icon: LineChart, fallback: "Commodities" },
};

export function WorkspaceTabs() {
  const { workspace, setWorkspace, shape } = useWorkspace();

  return (
    <div
      className="workspace-tabs-wrap"
      style={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <div
        className="workspace-tabs"
        role="tablist"
        aria-label="Espace de travail"
        style={{
          display: "inline-flex",
          background: "var(--accent)",
          borderRadius: 9,
          padding: 3,
          gap: 2,
          boxShadow:
            "0 1px 2px rgba(49,46,129,0.10), 0 8px 18px -6px color-mix(in srgb, var(--accent) 36%, transparent)",
          width: "fit-content",
          maxWidth: "calc(100vw - 2rem)",
        }}
      >
        {WORKSPACES.map((ws) => {
          const active = ws === workspace;
          const { Icon, fallback } = META[ws];
          /* Use the live shape label for the active tab (single source of
           * truth), and the static fallback for the inactive one (so the
           * UI doesn't have to re-derive both workspaces' labels). */
          const label = active ? shape.label : fallback;
          return (
            <button
              key={ws}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => { if (!active) setWorkspace(ws); }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                fontFamily: "inherit",
                fontSize: "0.78rem",
                fontWeight: active ? 650 : 500,
                color: active ? "var(--text)" : "#FFFFFF",
                background: active ? "var(--surface)" : "transparent",
                border: "none",
                borderRadius: 7,
                padding: "0.36rem 0.85rem",
                cursor: active ? "default" : "pointer",
                boxShadow: active ? "0 1px 2px rgba(49,46,129,0.16)" : "none",
                transition: "background 0.18s, color 0.18s, box-shadow 0.18s",
                letterSpacing: "-0.005em",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                if (!active) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.14)";
              }}
              onMouseLeave={(e) => {
                if (!active) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              }}
            >
              <Icon
                size={13}
                strokeWidth={2.25}
                color={active ? "var(--accent)" : "#FFFFFF"}
                style={{ flexShrink: 0 }}
              />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
