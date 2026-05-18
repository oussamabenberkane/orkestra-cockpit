"use client";

import { useRouter } from "next/navigation";
import { User, Settings, HelpCircle, Moon, LogOut, ChevronRight } from "lucide-react";

interface UserMenuContentProps {
  onLogout: () => void;
  bare?: boolean;
  /** Closes the popover when an item triggers navigation. */
  onClose?: () => void;
}

export function UserMenuContent({ onLogout, bare = false, onClose }: UserMenuContentProps) {
  const router = useRouter();
  const nav = (path: string) => {
    onClose?.();
    router.push(path);
  };
  const items: Array<{
    Icon: typeof User;
    label: string;
    onClick?: () => void;
    danger?: boolean;
    sub?: string;
  }> = [
    { Icon: User, label: "Mon profil", sub: "Préférences personnelles" },
    { Icon: Settings, label: "Paramètres", sub: "Workspace, sources, agents", onClick: () => nav("/parametres") },
    { Icon: Moon, label: "Apparence", sub: "Auto · clair · sombre" },
    { Icon: HelpCircle, label: "Aide & support", sub: "Documentation, contact", onClick: () => nav("/support") },
  ];

  return (
    <div
      style={
        bare
          ? { width: "100%" }
          : {
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              boxShadow:
                "0 24px 60px -16px rgba(15,23,42,0.18), 0 8px 20px -8px rgba(15,23,42,0.08)",
              overflow: "hidden",
              width: "260px",
            }
      }
    >
      <div
        style={{
          padding: "0.85rem 1rem 0.75rem",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: "0.65rem",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "var(--text)",
            color: "var(--surface)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.78rem",
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          TM
        </div>
        <div style={{ minWidth: 0, lineHeight: 1.25 }}>
          <div
            style={{
              fontSize: "0.86rem",
              fontWeight: 600,
              color: "var(--text)",
              letterSpacing: "-0.005em",
            }}
          >
            Thomas Müller
          </div>
          <div
            style={{
              fontSize: "0.72rem",
              color: "var(--text-3)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            thomas@muller.ch · Associé
          </div>
        </div>
      </div>

      <div style={{ padding: "0.35rem" }}>
        {items.map((item) => {
          const I = item.Icon;
          return (
            <button
              key={item.label}
              onClick={item.onClick}
              style={{
                width: "100%",
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                gap: "0.6rem",
                alignItems: "center",
                padding: "0.5rem 0.6rem",
                border: "none",
                background: "transparent",
                borderRadius: "8px",
                cursor: "pointer",
                fontFamily: "inherit",
                color: "inherit",
                textAlign: "left",
                transition: "background 0.12s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--surface-2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <span
                style={{
                  width: 24,
                  height: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-3)",
                }}
              >
                <I size={13} strokeWidth={2} />
              </span>
              <div style={{ minWidth: 0, lineHeight: 1.2 }}>
                <div
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 500,
                    color: "var(--text)",
                    letterSpacing: "-0.005em",
                  }}
                >
                  {item.label}
                </div>
                {item.sub && (
                  <div
                    style={{
                      fontSize: "0.68rem",
                      color: "var(--text-4)",
                      marginTop: "0.1rem",
                    }}
                  >
                    {item.sub}
                  </div>
                )}
              </div>
              {item.onClick ? (
                <ChevronRight size={11} strokeWidth={2} color="var(--text-4)" />
              ) : (
                <span
                  style={{
                    fontSize: "0.58rem",
                    fontWeight: 600,
                    color: "var(--text-4)",
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    padding: "0.1rem 0.35rem",
                    borderRadius: "100px",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  Bientôt
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div
        style={{
          padding: "0.35rem",
          borderTop: "1px solid var(--border)",
          background: "var(--surface-2)",
        }}
      >
        <button
          onClick={onLogout}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            padding: "0.5rem 0.6rem",
            border: "none",
            background: "transparent",
            borderRadius: "8px",
            cursor: "pointer",
            fontFamily: "inherit",
            color: "var(--text-2)",
            fontSize: "0.82rem",
            fontWeight: 500,
            transition: "background 0.12s, color 0.12s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--danger-tint)";
            e.currentTarget.style.color = "var(--danger)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--text-2)";
          }}
        >
          <LogOut size={13} strokeWidth={2} />
          Déconnexion
        </button>
      </div>
    </div>
  );
}
