import {
  Home, Target, FolderArchive, Flame, Wallet, Globe,
  MessageSquare, AlertTriangle, Settings, HelpCircle,
} from "lucide-react";
import {
  heroByPeriod,
  satellites,
  troisItems,
  tiles,
  sourceBadges,
} from "@/lib/dashboard-mock";
import type { WorkspaceShape } from "./types";

/** Broker workspace — Helvebroker SA insurance brokerage cockpit.
 *  Data lives in dashboard-mock.ts (and is overlaid with live Supabase values
 *  inside DashboardClient when available). The nav structure below replaces
 *  the const that previously lived inline in Sidebar.tsx. */
export const brokerWorkspace: WorkspaceShape = {
  label: "BFSI",
  heroByPeriod,
  satellites,
  troisItems,
  tiles,
  sourceBadges,
  nav: [
    {
      title: "Espace",
      items: [
        { Icon: Home,          label: "Vue 360",           iconColor: "var(--nav-vue-ensemble)",  href: "/dashboard" },
      ],
    },
    {
      title: "Métier",
      items: [
        { Icon: Target,        label: "Prospection",       iconColor: "var(--nav-prospection)",  modalKey: "prospection", badge: "12", badgeTone: "neutral" },
        { Icon: FolderArchive, label: "Portefeuille",      iconColor: "var(--nav-portefeuille)", modalKey: "portefeuille" },
        { Icon: Flame,         label: "Sinistres",         iconColor: "var(--nav-sinistres)",    modalKey: "sinistres",   badge: "3", badgeTone: "danger" },
        { Icon: Wallet,        label: "Finance",           iconColor: "var(--nav-finance)",      modalKey: "finance",     badge: "2", badgeTone: "warn" },
        { Icon: Globe,         label: "Tous les rapports", iconColor: "var(--nav-vue-ensemble)", href: "/rapports" },
      ],
    },
    {
      title: "Intelligence",
      items: [
        { Icon: MessageSquare, label: "Chat IA",  iconColor: "var(--nav-chat)",    href: "/chat",     badge: "3", badgeTone: "warn" },
        { Icon: AlertTriangle, label: "Alertes",  iconColor: "var(--nav-alertes)", href: "/alertes",  badge: "5", badgeTone: "danger" },
      ],
    },
    {
      title: "Administration",
      items: [
        { Icon: Settings,   label: "Paramètres", iconColor: "var(--nav-neutral)", href: "/parametres" },
        { Icon: HelpCircle, label: "Support",    iconColor: "var(--nav-neutral)", href: "/support" },
      ],
    },
  ],
};
