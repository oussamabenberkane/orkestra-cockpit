"use client";

import { Landmark, LineChart, type LucideIcon } from "lucide-react";
import { useWorkspace, WORKSPACES, type Workspace } from "@/lib/workspaces";

/* Segmented pill — BFSI / Commodities — centered in the app top strip.
 * The active tab reads from WorkspaceContext (persisted to localStorage),
 * so switching here also re-renders the sidebar nav and dashboard data.
 *
 * Each tab carries its own accent color so the switcher reads in palette
 * even at a glance: BFSI uses the brand blue (advisory/financial), and
 * Commodities uses an amber/warn tone (trading desk). Active state tints
 * the pill with the tab's color; inactive keeps the colored icon as a
 * cue while the label stays neutral.
 *
 * Icon choices: Landmark (institutional columns) reads as BFSI;
 * LineChart (P&L curves) reads as a commodity trading desk. */

const META: Record<Workspace, {
  Icon: LucideIcon;
  fallback: string;
  color: string;
  tint: string;
}> = {
  broker:    {
    Icon: Landmark,
    fallback: "BFSI",
    color: "var(--info)",
    tint:  "var(--info-tint)",
  },
  commodity: {
    Icon: LineChart,
    fallback: "Commodities",
    color: "var(--warn)",
    tint:  "var(--warn-tint)",
  },
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
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: 9,
          padding: 2,
          gap: 2,
          boxShadow: "var(--tier-1)",
          width: "fit-content",
          maxWidth: "calc(100vw - 2rem)",
        }}
      >
        {WORKSPACES.map((ws) => {
          const active = ws === workspace;
          const { Icon, fallback, color, tint } = META[ws];
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
                gap: "0.36rem",
                fontFamily: "inherit",
                fontSize: "0.76rem",
                fontWeight: active ? 700 : 500,
                color: active ? color : "var(--text-3)",
                background: active ? tint : "transparent",
                border: "none",
                borderRadius: 7,
                padding: "0.32rem 0.7rem",
                cursor: active ? "default" : "pointer",
                boxShadow: active
                  ? `inset 0 0 0 1px color-mix(in srgb, ${color} 28%, transparent), 0 1px 2px rgba(15,23,42,0.06)`
                  : "none",
                transition: "background 0.18s, color 0.18s, box-shadow 0.18s",
                letterSpacing: "-0.005em",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                if (!active) (e.currentTarget as HTMLButtonElement).style.color = "var(--text-2)";
              }}
              onMouseLeave={(e) => {
                if (!active) (e.currentTarget as HTMLButtonElement).style.color = "var(--text-3)";
              }}
            >
              <Icon
                size={13}
                strokeWidth={2.25}
                color={color}
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
