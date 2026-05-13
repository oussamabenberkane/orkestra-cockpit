"use client";

import {
  User,
  Settings,
  HelpCircle,
  Moon,
  LogOut,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

interface UserMenuBProps {
  onLogout: () => void;
}

type MenuItem = {
  Icon: LucideIcon;
  label: string;
  sub?: string;
  onClick?: () => void;
  danger?: boolean;
};

export function UserMenuB({ onLogout }: UserMenuBProps) {
  const items: MenuItem[] = [
    { Icon: User, label: "Mon profil", sub: "Préférences personnelles" },
    { Icon: Settings, label: "Paramètres", sub: "Workspace, sources, agents" },
    { Icon: Moon, label: "Apparence", sub: "Auto · clair · sombre" },
    { Icon: HelpCircle, label: "Aide & support", sub: "Documentation, contact" },
  ];

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
          display: "flex",
          alignItems: "center",
          gap: "0.7rem",
          padding: "0.85rem 1rem 0.8rem",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: "100px",
            background: "var(--text)",
            color: "#FFFFFF",
            fontFamily: "var(--font-mono)",
            fontSize: "0.78rem",
            fontWeight: 700,
            letterSpacing: "0.02em",
            flexShrink: 0,
          }}
        >
          TM
        </span>
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <span
            style={{
              fontSize: "0.86rem",
              fontWeight: 700,
              color: "var(--text)",
              letterSpacing: "-0.01em",
              lineHeight: 1.2,
            }}
          >
            Thomas Müller
          </span>
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 500,
              color: "var(--text-3)",
              lineHeight: 1.3,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            thomas@muller.ch · Associé
          </span>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          minHeight: 0,
          padding: "0.4rem 0.5rem",
        }}
      >
        {items.map((it) => (
          <MenuRow key={it.label} item={it} />
        ))}

        <MenuRow
          item={{
            Icon: LogOut,
            label: "Déconnexion",
            danger: true,
            onClick: onLogout,
          }}
          hideChevron
        />
      </div>
    </div>
  );
}

function MenuRow({
  item,
  hideChevron = false,
}: {
  item: MenuItem;
  hideChevron?: boolean;
}) {
  const danger = !!item.danger;
  return (
    <button
      type="button"
      onClick={item.onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.65rem",
        width: "100%",
        padding: "0.5rem 0.55rem",
        background: "transparent",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontFamily: "inherit",
        textAlign: "left",
        color: danger ? "var(--danger)" : "var(--text-2)",
        transition: "background 0.15s, color 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = danger
          ? "var(--danger-tint)"
          : "var(--surface-2)";
        if (!danger) e.currentTarget.style.color = "var(--text)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = danger ? "var(--danger)" : "var(--text-2)";
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 22,
          height: 22,
          flexShrink: 0,
        }}
      >
        <item.Icon size={14} strokeWidth={2.25} />
      </span>
      <span style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <span
          style={{
            fontSize: "0.82rem",
            fontWeight: 600,
            letterSpacing: "-0.005em",
            lineHeight: 1.25,
          }}
        >
          {item.label}
        </span>
        {item.sub && (
          <span
            style={{
              fontSize: "0.68rem",
              fontWeight: 500,
              color: "var(--text-3)",
              lineHeight: 1.3,
            }}
          >
            {item.sub}
          </span>
        )}
      </span>
      {!hideChevron && (
        <ChevronRight size={11} strokeWidth={2.25} color="var(--text-4)" />
      )}
    </button>
  );
}
