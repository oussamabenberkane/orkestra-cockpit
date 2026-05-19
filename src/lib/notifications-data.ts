import {
  FileText,
  Flame,
  AlertCircle,
  Mail,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export type NotificationItem = {
  id: string;
  Icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  title: string;
  desc: string;
  time: string;
  archived: boolean;
};

export const initialNotifications: NotificationItem[] = [
  {
    id: "chx-0187",
    Icon: FileText,
    iconColor: "var(--danger)",
    iconBg: "var(--danger-tint)",
    title: "Contrat CHX-0187 expiré",
    desc: "Sophie Fontaine · couverture inactive",
    time: "il y a 3 jours",
    archived: false,
  },
  {
    id: "chx-0291",
    Icon: FileText,
    iconColor: "var(--warn)",
    iconBg: "var(--warn-tint)",
    title: "Renouvellement CHX-0291",
    desc: "Étienne Marchand · échéance dans 14 jours",
    time: "il y a 2h",
    archived: false,
  },
  {
    id: "sin-0047",
    Icon: Flame,
    iconColor: "var(--danger)",
    iconBg: "var(--danger-tint)",
    title: "SIN-0047 a dépassé 60 jours",
    desc: "Dubois SA · RC Pro · escalade recommandée",
    time: "il y a 2 min",
    archived: false,
  },
  {
    id: "impayes",
    Icon: AlertCircle,
    iconColor: "var(--warn)",
    iconBg: "var(--warn-tint)",
    title: "2 impayés détectés",
    desc: "Rossi SA · 1 800 CHF · 67 j",
    time: "il y a 28 min",
    archived: false,
  },
  {
    id: "renouvellements",
    Icon: Mail,
    iconColor: "var(--info)",
    iconBg: "var(--info-tint)",
    title: "4 renouvellements prêts",
    desc: "Agent Renouvellement · J-28",
    time: "il y a 1 h",
    archived: false,
  },
  {
    id: "marge",
    Icon: TrendingUp,
    iconColor: "var(--success)",
    iconBg: "var(--success-tint)",
    title: "Marge nette +4 pt ce mois",
    desc: "68 % consolidé · +4 pt vs marché",
    time: "il y a 3 h",
    archived: false,
  },
  {
    id: "rapport",
    Icon: FileText,
    iconColor: "var(--accent)",
    iconBg: "var(--accent-tint)",
    title: "Rapport direction généré",
    desc: "Synthèse mensuelle BS + Odoo",
    time: "il y a 5 h",
    archived: false,
  },
];
