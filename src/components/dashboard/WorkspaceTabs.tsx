"use client";

import { Briefcase, Activity } from "lucide-react";
import { useWorkspace, WORKSPACES, type Workspace } from "@/lib/workspaces";

/* Segmented pill: Broker / Commodity. Sits at the top of the main content
 * area in every shell-using page. The active tab is read from
 * WorkspaceContext (persisted to localStorage), so switching here also
 * updates the sidebar nav and dashboard data. */

const META: Record<Workspace, { Icon: typeof Briefcase }> = {
  broker:    { Icon: Briefcase },
  commodity: { Icon: Activity },
};

export function WorkspaceTabs() {
  const { workspace, setWorkspace, shape } = useWorkspace();

  return (
    <div
      className="workspace-tabs"
      role="tablist"
      aria-label="Espace de travail"
      style={{
        display: "inline-flex",
        background: "var(--surface-2)",
        borderRadius: 11,
        padding: 3,
        gap: 2,
        boxShadow: "var(--tier-1)",
        width: "fit-content",
        marginBottom: "clamp(0.85rem, 2vw, 1.1rem)",
      }}
    >
      {WORKSPACES.map((ws) => {
        const active = ws === workspace;
        const Icon = META[ws].Icon;
        const label = ws === workspace ? shape.label : (ws === "broker" ? "Broker" : "Matières premières");
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
              gap: "0.45rem",
              fontFamily: "inherit",
              fontSize: "0.84rem",
              fontWeight: active ? 700 : 500,
              color: active ? "var(--text)" : "var(--text-3)",
              background: active ? "var(--surface)" : "transparent",
              border: "none",
              borderRadius: 8,
              padding: "0.45rem 0.95rem",
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
            <Icon size={14} strokeWidth={2.25} style={{ flexShrink: 0 }} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
