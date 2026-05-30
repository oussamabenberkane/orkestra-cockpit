"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { brokerWorkspace } from "./broker";
import { commodityWorkspace } from "./commodity";
import type { Workspace, WorkspaceShape } from "./types";

export type { Workspace, WorkspaceShape, NavItem, NavSection, SourceBadge } from "./types";

export const workspaceConfig: Record<Workspace, WorkspaceShape> = {
  broker:    brokerWorkspace,
  commodity: commodityWorkspace,
};

export const WORKSPACES: Workspace[] = ["broker", "commodity"];

const STORAGE_KEY = "orkestra.workspace";
const DEFAULT_WORKSPACE: Workspace = "broker";

interface WorkspaceContextValue {
  workspace: Workspace;
  setWorkspace: (next: Workspace) => void;
  shape: WorkspaceShape;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspace, setWorkspaceState] = useState<Workspace>(DEFAULT_WORKSPACE);

  /* Hydrate from localStorage after mount — server-render stays deterministic
   * on the default workspace, so the sidebar/tabs don't flash the wrong content
   * before the client takes over. */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "broker" || stored === "commodity") {
        setWorkspaceState(stored);
      }
    } catch {
      /* localStorage may throw in private mode — fall back to default. */
    }
  }, []);

  const setWorkspace = useCallback((next: Workspace) => {
    setWorkspaceState(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch {}
  }, []);

  return (
    <WorkspaceContext.Provider
      value={{ workspace, setWorkspace, shape: workspaceConfig[workspace] }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspace must be used inside <WorkspaceProvider>");
  }
  return ctx;
}
