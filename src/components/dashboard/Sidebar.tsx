"use client";

interface SidebarProps {
  onOpenSettings: () => void;
}

interface NavItem {
  icon: string;
  label: string;
  badge?: string;
  badgeType?: "red" | "warn" | "ok" | "blue";
  active?: boolean;
  onClick?: () => void;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function Sidebar({ onOpenSettings }: SidebarProps) {
  const sections: NavSection[] = [
    {
      title: "Menu",
      items: [
        { icon: "🏠", label: "Accueil", active: true },
        { icon: "📊", label: "Rapports" },
      ],
    },
    {
      title: "Métier",
      items: [
        { icon: "🎯", label: "Prospection", badge: "12", badgeType: "ok" },
        { icon: "📋", label: "Portefeuille" },
        { icon: "🔥", label: "Sinistres", badge: "3", badgeType: "red" },
        { icon: "💰", label: "Finance", badge: "2", badgeType: "warn" },
        { icon: "🌐", label: "Vue 360°" },
      ],
    },
    {
      title: "Intelligence",
      items: [
        { icon: "💬", label: "Chat IA", badge: "3", badgeType: "warn" },
        { icon: "⚠️", label: "Alertes", badge: "5", badgeType: "red" },
      ],
    },
    {
      title: "Admin",
      items: [
        { icon: "⚙️", label: "Paramètres", onClick: onOpenSettings },
        { icon: "🎫", label: "Support" },
      ],
    },
  ];

  const getBadgeStyle = (type: NavItem["badgeType"]) => {
    const base = {
      marginLeft: "auto",
      fontSize: "0.62rem",
      fontWeight: 700,
      padding: "1px 6px",
      borderRadius: "10px",
      color: "white",
    };
    const colors: Record<string, string> = {
      red: "#EF4444",
      warn: "#F59E0B",
      ok: "#10B981",
      blue: "#2B3AE8",
    };
    return { ...base, background: colors[type ?? "red"] };
  };

  return (
    <aside
      style={{
        width: "200px",
        background: "#1E2761",
        padding: "1rem 0",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      {sections.map((section) => (
        <div key={section.title}>
          <div
            style={{
              padding: "0.5rem 1rem 0.25rem",
              fontSize: "0.6rem",
              fontWeight: 700,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.25)",
              marginTop: "0.5rem",
            }}
          >
            {section.title}
          </div>
          {section.items.map((item) => (
            <div
              key={item.label}
              onClick={item.onClick}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.65rem",
                padding: "0.55rem 1rem",
                fontSize: "0.82rem",
                fontWeight: item.active ? 600 : 500,
                color: item.active ? "white" : "rgba(255,255,255,0.55)",
                cursor: "pointer",
                borderLeft: item.active ? "3px solid #2B3AE8" : "3px solid transparent",
                background: item.active ? "rgba(43,58,232,0.2)" : "transparent",
                margin: "1px 0",
                transition: "all 0.15s",
                userSelect: "none",
              }}
              onMouseEnter={(e) => {
                if (!item.active) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.85)";
                }
              }}
              onMouseLeave={(e) => {
                if (!item.active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "rgba(255,255,255,0.55)";
                }
              }}
            >
              {item.icon} {item.label}
              {item.badge && (
                <span style={getBadgeStyle(item.badgeType)}>{item.badge}</span>
              )}
            </div>
          ))}
        </div>
      ))}

      {/* Footer */}
      <div
        style={{
          marginTop: "auto",
          padding: "1rem",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "0.62rem",
            color: "rgba(255,255,255,0.25)",
            lineHeight: 1.5,
          }}
        >
          🇨🇭 Infomaniak CH
          <br />
          LPD Art.16 conforme
        </div>
      </div>
    </aside>
  );
}
