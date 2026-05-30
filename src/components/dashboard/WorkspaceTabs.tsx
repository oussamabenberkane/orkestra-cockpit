"use client";

import { Landmark, LineChart, type LucideIcon } from "lucide-react";
import { useWorkspace, WORKSPACES, type Workspace } from "@/lib/workspaces";

/* Segmented pill — BFSI / Commodities — centered above the page header in
 * every shell-using surface. The active tab reads from WorkspaceContext
 * (persisted to localStorage), so switching here also re-renders the
 * sidebar nav and dashboard data.
 *
 * The outer wrapper is a full-width flex container with justify-content:
 * center; the pill itself stays width:fit-content. That way the pill
 * always sits in the visual centerline of the main column regardless of
 * the surrounding page's own padding.
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
        marginBottom: "clamp(0.85rem, 2vw, 1.1rem)",
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
                gap: "0.32rem",
                fontFamily: "inherit",
                fontSize: "0.74rem",
                fontWeight: active ? 700 : 500,
                color: active ? "var(--text)" : "var(--text-3)",
                background: active ? "var(--surface)" : "transparent",
                border: "none",
                borderRadius: 7,
                padding: "0.3rem 0.65rem",
                cursor: active ? "default" : "pointer",
                boxShadow: active ? "var(--tier-1)" : "none",
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
                size={12}
                strokeWidth={2.25}
                color={active ? "var(--accent)" : "currentColor"}
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
