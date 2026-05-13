"use client";

import {
  Mail,
  AlertCircle,
  FileText,
  Flame,
  TrendingUp,
  Check,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

type Notification = {
  Icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  title: string;
  desc: string;
  time: string;
  unread?: boolean;
};

const notifications: Notification[] = [
  {
    Icon: Flame,
    iconColor: "var(--danger)",
    iconBg: "var(--danger-tint)",
    title: "SIN-0047 a dépassé 60 jours",
    desc: "Dubois SA · RC Pro · escalade auto",
    time: "2 min",
    unread: true,
  },
  {
    Icon: AlertCircle,
    iconColor: "var(--warn)",
    iconBg: "var(--warn-tint)",
    title: "2 impayés détectés par Odoo",
    desc: "Rossi SA · 1 800 CHF · 67 jours",
    time: "28 min",
    unread: true,
  },
  {
    Icon: Mail,
    iconColor: "var(--info)",
    iconBg: "var(--info-tint)",
    title: "4 renouvellements prêts",
    desc: "Agent Renouvellement · J-28",
    time: "1 h",
    unread: true,
  },
  {
    Icon: TrendingUp,
    iconColor: "var(--success)",
    iconBg: "var(--success-tint)",
    title: "Marge nette +4 pt ce mois",
    desc: "68 % consolidé · vs marché CH",
    time: "3 h",
  },
  {
    Icon: FileText,
    iconColor: "var(--accent)",
    iconBg: "var(--accent-tint)",
    title: "Rapport direction généré",
    desc: "Synthèse mensuelle BS + Odoo",
    time: "5 h",
  },
];

export function NotificationsListB() {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          minHeight: 0,
          padding: "0.4rem 0.5rem",
        }}
      >
        {notifications.map((n, idx) => (
          <NotifRow key={idx} n={n} />
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0.4rem",
          padding: "0.45rem 0.5rem 0.55rem",
          borderTop: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        <ActionButton align="left">
          Voir toutes les notifs
          <ArrowRight size={11} strokeWidth={2.5} />
        </ActionButton>
        <ActionButton align="right">
          <Check size={11} strokeWidth={2.5} />
          Tout marquer lu
        </ActionButton>
      </div>
    </div>
  );
}

function NotifRow({ n }: { n: Notification }) {
  return (
    <button
      type="button"
      style={{
        position: "relative",
        display: "flex",
        alignItems: "flex-start",
        gap: "0.95rem",
        width: "100%",
        padding: "0.5rem 0.55rem",
        background: "transparent",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontFamily: "inherit",
        textAlign: "left",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {n.unread && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: -1,
            top: 10,
            bottom: 10,
            width: 2,
            background: "var(--accent)",
            borderRadius: "0 2px 2px 0",
          }}
        />
      )}
      <span
        style={{
          width: 22,
          height: 22,
          background: n.iconBg,
          color: n.iconColor,
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        <n.Icon size={11} strokeWidth={2.25} />
      </span>
      <span style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <span
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "0.5rem",
            minWidth: 0,
          }}
        >
          <span
            style={{
              fontSize: "0.82rem",
              fontWeight: 600,
              color: "var(--text)",
              letterSpacing: "-0.005em",
              lineHeight: 1.25,
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {n.title}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.62rem",
              fontWeight: 500,
              color: "var(--text-4)",
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "0.02em",
              flexShrink: 0,
            }}
          >
            {n.time}
          </span>
        </span>
        <span
          style={{
            fontSize: "0.68rem",
            fontWeight: 500,
            color: "var(--text-3)",
            lineHeight: 1.3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            marginTop: "0.05rem",
          }}
        >
          {n.desc}
        </span>
      </span>
    </button>
  );
}

function ActionButton({
  children,
  align,
}: {
  children: React.ReactNode;
  align: "left" | "right";
}) {
  return (
    <button
      type="button"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.35rem",
        height: 30,
        padding: "0 0.6rem",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "7px",
        fontFamily: "inherit",
        fontSize: "0.72rem",
        fontWeight: 500,
        color: "var(--text-2)",
        cursor: "pointer",
        transition: "background 0.15s, border-color 0.15s, color 0.15s",
        whiteSpace: "nowrap",
        justifySelf: align === "left" ? "start" : "end",
        width: "100%",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--surface-2)";
        e.currentTarget.style.borderColor = "var(--border-strong)";
        e.currentTarget.style.color = "var(--text)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--surface)";
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.color = "var(--text-2)";
      }}
    >
      {children}
    </button>
  );
}
