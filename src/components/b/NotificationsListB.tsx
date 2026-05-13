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
    desc: "Dubois SA · RC Pro · escalade automatique recommandée",
    time: "2 min",
    unread: true,
  },
  {
    Icon: AlertCircle,
    iconColor: "var(--warn)",
    iconBg: "var(--warn-tint)",
    title: "2 impayés détectés par Odoo",
    desc: "Rossi SA · 1 800 CHF · 67 jours d'ouverture",
    time: "28 min",
    unread: true,
  },
  {
    Icon: Mail,
    iconColor: "var(--info)",
    iconBg: "var(--info-tint)",
    title: "4 renouvellements prêts",
    desc: "Agent Renouvellement · échéances J-28",
    time: "1 h",
    unread: true,
  },
  {
    Icon: TrendingUp,
    iconColor: "var(--success)",
    iconBg: "var(--success-tint)",
    title: "Marge nette +4 pt ce mois",
    desc: "68 % consolidé · +4 pt vs marché suisse",
    time: "3 h",
  },
  {
    Icon: FileText,
    iconColor: "var(--accent)",
    iconBg: "var(--accent-tint)",
    title: "Rapport direction généré",
    desc: "Synthèse mensuelle BS + Odoo · prêt à signer",
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
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "0.55rem 0.85rem 0.35rem",
          }}
        >
          <button
            type="button"
            className="notif-b-action"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              background: "transparent",
              border: "none",
              padding: "0.25rem 0.45rem",
              fontFamily: "inherit",
              fontSize: "0.72rem",
              fontWeight: 500,
              color: "var(--text-3)",
              cursor: "pointer",
              borderRadius: "6px",
              transition: "background 0.15s, color 0.15s",
            }}
          >
            <Check size={11} strokeWidth={2.5} />
            Tout marquer lu
          </button>
        </div>

        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
          }}
        >
          {notifications.map((n, idx) => (
            <li
              key={idx}
              style={{
                position: "relative",
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                columnGap: "0.75rem",
                rowGap: "0.18rem",
                padding: "0.6rem 0.95rem 0.65rem",
                borderTop: idx === 0 ? "none" : "1px solid var(--border)",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--surface-2)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              {n.unread && (
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 8,
                    bottom: 8,
                    width: 2,
                    background: "var(--accent)",
                    borderRadius: "0 2px 2px 0",
                  }}
                />
              )}
              <span
                style={{
                  gridRow: "1 / span 2",
                  width: 24,
                  height: 24,
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
                <n.Icon size={12} strokeWidth={2.25} />
              </span>
              <div
                style={{
                  gridColumn: 2,
                  display: "flex",
                  alignItems: "baseline",
                  gap: "0.6rem",
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
                    fontSize: "0.64rem",
                    fontWeight: 500,
                    color: "var(--text-4)",
                    fontVariantNumeric: "tabular-nums",
                    letterSpacing: "0.02em",
                    flexShrink: 0,
                  }}
                >
                  {n.time}
                </span>
              </div>
              <span
                style={{
                  gridColumn: 2,
                  fontSize: "0.74rem",
                  color: "var(--text-3)",
                  lineHeight: 1.4,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {n.desc}
              </span>
            </li>
          ))}

          <li
            style={{
              listStyle: "none",
              borderTop: "1px solid var(--border)",
              padding: "0.65rem 0.95rem 0.75rem",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <button
              type="button"
              className="notif-b-more"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                background: "transparent",
                border: "none",
                padding: "0.2rem 0.35rem",
                fontFamily: "inherit",
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "var(--accent)",
                cursor: "pointer",
                borderRadius: "4px",
                transition: "color 0.15s",
              }}
            >
              Voir toutes les notifications
              <ArrowRight size={12} strokeWidth={2.5} />
            </button>
          </li>
        </ul>
      </div>

      <style>{`
        .notif-b-action:hover {
          background: var(--surface-2);
          color: var(--text-2);
        }
        .notif-b-more:hover {
          color: var(--accent-2);
        }
      `}</style>
    </div>
  );
}
