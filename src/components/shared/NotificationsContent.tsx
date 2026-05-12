"use client";

import { Mail, AlertCircle, FileText, Flame, TrendingUp, Bell } from "lucide-react";

type Notification = {
  Icon: typeof Mail;
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
    desc: "Dubois SA · RC Pro · escalade automatique recommandée",
    time: "il y a 2 min",
    unread: true,
  },
  {
    Icon: AlertCircle,
    iconColor: "var(--warn)",
    iconBg: "var(--warn-tint)",
    title: "2 impayés détectés par Odoo",
    desc: "Rossi SA · 1 800 CHF · 67 jours d'ouverture",
    time: "il y a 28 min",
    unread: true,
  },
  {
    Icon: Mail,
    iconColor: "var(--info)",
    iconBg: "var(--info-tint)",
    title: "4 renouvellements prêts",
    desc: "Agent Renouvellement · échéances J-28",
    time: "il y a 1 h",
    unread: true,
  },
  {
    Icon: TrendingUp,
    iconColor: "var(--success)",
    iconBg: "var(--success-tint)",
    title: "Marge nette +4 pt ce mois",
    desc: "68 % consolidé · +4 pt vs marché suisse",
    time: "il y a 3 h",
  },
  {
    Icon: FileText,
    iconColor: "var(--accent)",
    iconBg: "var(--accent-tint)",
    title: "Rapport direction généré",
    desc: "Synthèse mensuelle BS + Odoo · prêt à signer",
    time: "il y a 5 h",
  },
];

export function NotificationsContent({ onClose }: { onClose?: () => void }) {
  void onClose;
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        boxShadow:
          "0 24px 60px -16px rgba(15,23,42,0.18), 0 8px 20px -8px rgba(15,23,42,0.08)",
        overflow: "hidden",
        width: "360px",
        maxWidth: "calc(100vw - 2rem)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.75rem 1rem",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
          <Bell size={13} strokeWidth={2.25} color="var(--text-2)" />
          <span
            style={{
              fontSize: "0.86rem",
              fontWeight: 600,
              color: "var(--text)",
              letterSpacing: "-0.01em",
            }}
          >
            Notifications
          </span>
          <span
            style={{
              fontSize: "0.66rem",
              fontWeight: 600,
              color: "var(--danger)",
              background: "var(--danger-tint)",
              padding: "0.1rem 0.4rem",
              borderRadius: "100px",
              letterSpacing: "0.02em",
            }}
          >
            3 non lus
          </span>
        </div>
        <button
          style={{
            fontFamily: "inherit",
            fontSize: "0.72rem",
            fontWeight: 600,
            color: "var(--text-3)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "0.2rem 0.4rem",
            borderRadius: "5px",
            transition: "color 0.15s, background 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--text)";
            e.currentTarget.style.background = "var(--surface-2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-3)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          Tout marquer lu
        </button>
      </div>

      <div style={{ maxHeight: "380px", overflowY: "auto" }}>
        {notifications.map((n, i) => {
          const I = n.Icon;
          return (
            <button
              key={i}
              style={{
                width: "100%",
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: "0.7rem",
                alignItems: "flex-start",
                padding: "0.75rem 1rem",
                border: "none",
                borderBottom: i === notifications.length - 1 ? "none" : "1px solid var(--border)",
                background: "transparent",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "inherit",
                color: "inherit",
                transition: "background 0.12s",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--surface-2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              {n.unread && (
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: 4,
                    top: "calc(0.75rem + 11px)",
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "var(--accent)",
                  }}
                />
              )}
              <span
                style={{
                  width: 28,
                  height: 28,
                  background: n.iconBg,
                  color: n.iconColor,
                  borderRadius: "7px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginLeft: n.unread ? "0.4rem" : 0,
                }}
              >
                <I size={13} strokeWidth={2} />
              </span>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "var(--text)",
                    letterSpacing: "-0.005em",
                    marginBottom: "0.15rem",
                  }}
                >
                  {n.title}
                </div>
                <div
                  style={{
                    fontSize: "0.74rem",
                    color: "var(--text-3)",
                    lineHeight: 1.45,
                  }}
                >
                  {n.desc}
                </div>
                <div
                  style={{
                    fontSize: "0.66rem",
                    color: "var(--text-4)",
                    marginTop: "0.25rem",
                  }}
                >
                  {n.time}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div
        style={{
          padding: "0.55rem 1rem",
          borderTop: "1px solid var(--border)",
          background: "var(--surface-2)",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <button
          style={{
            fontFamily: "inherit",
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "var(--accent)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "0.25rem 0.5rem",
            borderRadius: "5px",
          }}
        >
          Voir toutes les notifications →
        </button>
      </div>
    </div>
  );
}
