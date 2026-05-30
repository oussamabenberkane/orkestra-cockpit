import type { LucideIcon } from "lucide-react";
import type { ModalKey } from "@/lib/types";
import type { HeroDataset, Period } from "@/lib/dashboard-mock";
import type { Satellite } from "@/components/dashboard/SatelliteKPI";
import type { TroisItem } from "@/components/dashboard/TroisChoses";
import type { TileEntry } from "@/components/dashboard/TileCard";

/** Two parallel cockpits — broker = insurance brokerage, commodity = trading desk. */
export type Workspace = "broker" | "commodity";

/** Shared shape for sidebar nav items. Mirrors the original NavItemData
 *  that previously lived inline in Sidebar.tsx — moved here so both
 *  workspaces can declare their own nav and the Sidebar can render
 *  whichever workspace is active. */
export type NavItem = {
  Icon: LucideIcon;
  label: string;
  iconColor: string;
  href?: string;
  modalKey?: ModalKey;
  badge?: string;
  badgeTone?: "neutral" | "warn" | "danger";
};

export type NavSection = { title: string; items: NavItem[] };

export type SourceBadge = { dot: string; label: string };

/** Everything a workspace contributes to the cockpit shell. Both broker
 *  and commodity provide the same shape — components stay generic and
 *  pull from `workspaceConfig[workspace]` rather than branching. */
export interface WorkspaceShape {
  /** Display label for the tab pill ("Broker", "Commodity"). */
  label: string;
  /** Per-period hero KPI data — drives the M/T/A toggle on the dashboard. */
  heroByPeriod: Record<Period, HeroDataset>;
  /** Three satellite KPI cards under the hero. */
  satellites: Satellite[];
  /** Morning checklist items ("Trois choses aujourd'hui"). */
  troisItems: TroisItem[];
  /** Six domain tiles. */
  tiles: TileEntry[];
  /** Sidebar nav sections — Métier items swap per workspace. */
  nav: NavSection[];
  /** Source badges shown next to the dashboard greeting row. */
  sourceBadges: SourceBadge[];
}
