export interface ModalData {
  title: string;
  body: string;
  data: string;
  cta: string;
}

export type ModalKey =
  | "finance"
  | "vue360"
  | "sinistres"
  | "prospection"
  | "portefeuille"
  | "agents"
  | "rapport";

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
