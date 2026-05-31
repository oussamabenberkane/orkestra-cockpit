/* ─── Dashboard modal — structured content schema ──────────────────────
 * Each modal declares its body as an array of typed sections. The renderer
 * dispatches on `kind`, so every section gets a dedicated, responsive
 * component instead of a string parser inferring the layout. */

/** A single key-value row, optionally tagged by source. */
export interface KvRow {
  /** Source pill (e.g. "Helvebroker SA", "Odoo"). Omit for plain rows. */
  source?: string;
  /** Renders the row with the accent treatment for combined-source values. */
  combined?: boolean;
  label: string;
  /** Right-aligned value. Omit for label-only rows. */
  value?: string;
}

/** A single action item (numbered or bulleted) — for "agents IA" style lists. */
export interface ActionItem {
  /** Optional source tag shown as a small pill before the title. */
  source?: string;
  /** Short title for the action. */
  title: string;
  /** Optional supporting line below the title. */
  detail?: string;
}

/** A status row with a colored dot — for sinistres-style dossier lists. */
export interface StatusRow {
  tone: "danger" | "warn" | "good" | "neutral";
  title: string;
  detail?: string;
}

/** A short footnote line (e.g. "Toutes actions loguées — LPD"). */
export type ModalSection =
  | { kind: "narrative"; text: string }
  | { kind: "kv-list"; subtitle?: string; rows: KvRow[] }
  | { kind: "action-list"; subtitle?: string; items: ActionItem[] }
  | { kind: "status-list"; subtitle?: string; rows: StatusRow[] }
  | { kind: "footnote"; text: string };

export interface ModalData {
  title: string;
  body?: string;
  sections: ModalSection[];
  cta: string;
}

export type ModalKey =
  | "finance"
  | "vue360"
  | "sinistres"
  | "prospection"
  | "portefeuille"
  | "agents"
  | "rapport"
  /* Commodity workspace — namespaced so the modal renderer stays generic
   * and tile/sidebar code in either workspace can never collide. */
  | "commodity:positions"
  | "commodity:hedges"
  | "commodity:counterparties"
  | "commodity:pnl"
  | "commodity:risk"
  | "commodity:vue360"
  | "commodity:agents";

export interface KPICardProps {
  label: string;
  value: string;
  trend: string;
  trendType: "up" | "down" | "info";
  valueColor?: string;
  index: number;
}

export type TileColor = "teal" | "green" | "red" | "orange" | "malyz" | "purple";

export interface TileProps {
  icon: string;
  title: string;
  metric: string;
  sub: string;
  alert: string;
  color: TileColor;
  headerPill?: React.ReactNode;
  sourcePills?: React.ReactNode;
  sourceLabel?: string;
  modalKey: ModalKey;
  index: number;
  onOpenModal: (key: ModalKey) => void;
}

export interface AgentCardProps {
  icon: string;
  name: string;
  desc: string;
  sourceLabel: string;
  sourceColor: string;
  primaryLabel: string;
  onPrimary: () => void;
}

export interface SettingRow {
  label: string;
  desc: string;
}
