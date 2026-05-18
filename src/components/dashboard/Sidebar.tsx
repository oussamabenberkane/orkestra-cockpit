"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, BarChart3, Target, FolderArchive, Flame, Wallet, Globe,
  Sparkles, MessageSquare, AlertTriangle, Settings, HelpCircle,
  ChevronDown, ChevronLeft, Search, Bell, Pin,
  type LucideIcon,
} from "lucide-react";
import type { ModalKey } from "@/lib/types";
import { Popover } from "@/components/shared/Popover";
import { NotificationsContent } from "@/components/shared/NotificationsContent";
import { UserMenuContent } from "@/components/shared/UserMenuContent";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onLogout: () => void;
  onOpenPalette: () => void;
  onOpenModal?: (key: ModalKey) => void;
}

type NavItemData = {
  Icon: LucideIcon;
  label: string;
  iconColor: string;
  href?: string;
  modalKey?: ModalKey;
  badge?: string;
  badgeTone?: "neutral" | "warn" | "danger";
};

const sections: { title: string; items: NavItemData[] }[] = [
  {
    title: "Espace",
    items: [
      { Icon: Home, label: "Vue 360", iconColor: "var(--accent)", href: "/dashboard" },
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
      { Icon: MessageSquare,  label: "Chat IA",  iconColor: "var(--nav-chat)",    href: "/chat",     badge: "3", badgeTone: "warn" },
      { Icon: AlertTriangle,  label: "Alertes",  iconColor: "var(--nav-alertes)", href: "/alertes", badge: "5", badgeTone: "danger" },
      { Icon: Sparkles,       label: "Agents",   iconColor: "var(--nav-agents)",  modalKey: "agents", badge: "3", badgeTone: "neutral" },
    ],
  },
  {
    title: "Administration",
    items: [
      { Icon: Settings,   label: "Paramètres", iconColor: "var(--nav-neutral)", href: "/parametres" },
      { Icon: HelpCircle, label: "Support",    iconColor: "var(--nav-neutral)", href: "/support" },
    ],
  },
];

const EXPANDED_W = 248;
const COLLAPSED_W = 64;
const ICON_BTN = 36;

interface TooltipState { label: string; x: number; y: number }

function TooltipBubble({ label, x, y }: TooltipState) {
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setVis(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div
      style={{
        position: "fixed",
        left: x,
        top: y,
        transform: `translateY(-50%) translateX(${vis ? 0 : -6}px)`,
        opacity: vis ? 1 : 0,
        zIndex: 9999,
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        transition: "opacity 0.15s ease, transform 0.17s ease",
      }}
    >
      <div aria-hidden style={{
        width: 0, height: 0,
        borderTop: "6px solid transparent",
        borderBottom: "6px solid transparent",
        borderRight: "6px solid #111113",
        flexShrink: 0,
      }} />
      <div style={{
        background: "#111113",
        color: "#F2F2F7",
        padding: "0.42rem 0.85rem",
        borderRadius: "9px",
        fontSize: "0.82rem",
        fontWeight: 600,
        whiteSpace: "nowrap",
        letterSpacing: "0.01em",
        lineHeight: 1.4,
        boxShadow: "0 12px 28px -4px rgba(0,0,0,0.38), 0 4px 10px -2px rgba(0,0,0,0.22), 0 0 0 1px rgba(255,255,255,0.06)",
      }}>
        {label}
      </div>
    </div>
  );
}

function NavItem({
  item, collapsed, active, showTip, hideTip, onOpenModal,
}: {
  item: NavItemData;
  collapsed: boolean;
  active: boolean;
  showTip: (label: string, el: HTMLElement) => void;
  hideTip: () => void;
  onOpenModal?: (key: ModalKey) => void;
}) {
  const { Icon } = item;
  const badgeColor =
    item.badgeTone === "danger" ? "var(--danger)"
    : item.badgeTone === "warn"  ? "var(--warn)"
    : "var(--text-3)";

  const isModalTrigger = !!item.modalKey;
  const isLink = !!item.href;

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (isModalTrigger && onOpenModal && item.modalKey) {
      e.preventDefault();
      onOpenModal(item.modalKey);
    }
  };

  const commonStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "0.55rem",
    padding: collapsed ? "0.25rem" : "0.45rem 0.55rem",
    justifyContent: collapsed ? "center" : "flex-start",
    background: active && !collapsed ? "var(--surface)" : "transparent",
    border: "none",
    borderRadius: "10px",
    fontFamily: "inherit",
    fontSize: "0.85rem",
    fontWeight: active ? 600 : 500,
    color: active ? "var(--text)" : "var(--text-2)",
    cursor: "pointer",
    textAlign: "left",
    textDecoration: "none",
    boxShadow: active && !collapsed ? "var(--tier-1)" : "none",
    transition: "background 0.18s, color 0.18s, transform 0.18s",
    margin: "1px 0",
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    if (!active && !collapsed) {
      e.currentTarget.style.background = "rgba(0,0,0,0.03)";
      const iconEl = e.currentTarget.querySelector("[data-nav-icon]") as HTMLElement | null;
      if (iconEl) {
        iconEl.style.opacity = "1";
        iconEl.style.transform = "scale(1.08)";
      }
    }
    if (collapsed) {
      const wrap = e.currentTarget.querySelector("[data-nav-icon-collapsed]") as HTMLElement | null;
      if (wrap) wrap.style.background = active ? "var(--surface)" : "rgba(0,0,0,0.05)";
      showTip(item.label + (item.badge ? ` · ${item.badge}` : ""), e.currentTarget);
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    if (!active && !collapsed) {
      e.currentTarget.style.background = "transparent";
      const iconEl = e.currentTarget.querySelector("[data-nav-icon]") as HTMLElement | null;
      if (iconEl) {
        iconEl.style.opacity = "0.7";
        iconEl.style.transform = "scale(1)";
      }
    }
    if (collapsed) {
      const wrap = e.currentTarget.querySelector("[data-nav-icon-collapsed]") as HTMLElement | null;
      if (wrap) wrap.style.background = active ? "var(--surface)" : "transparent";
    }
    hideTip();
  };

  const inner = collapsed ? (
    <span
      data-nav-icon-collapsed
      style={{
        width: ICON_BTN,
        height: ICON_BTN,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: active ? "var(--surface)" : "transparent",
        borderRadius: "9px",
        boxShadow: active ? "var(--tier-1)" : "none",
        position: "relative",
        flexShrink: 0,
        transition: "background 0.18s, box-shadow 0.18s",
      }}
    >
      <Icon
        size={19}
        strokeWidth={active ? 2.25 : 2}
        color={item.iconColor}
        style={{ opacity: active ? 1 : 0.85, transition: "opacity 0.18s" }}
      />
      {item.badge && (
        <span aria-hidden style={{
          position: "absolute", top: 4, right: 4,
          width: 6, height: 6,
          borderRadius: "50%",
          background: badgeColor,
          border: "1.5px solid var(--surface-2)",
        }} />
      )}
    </span>
  ) : (
    <>
      <span
        data-nav-icon
        style={{
          width: 16, height: 16,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          opacity: active ? 1 : 0.7,
          transition: "opacity 0.18s, transform 0.18s",
        }}
      >
        <Icon size={15} strokeWidth={active ? 2.25 : 2} color={item.iconColor} />
      </span>
      <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden" }}>
        {item.label}
      </span>
      {item.badge && (
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.66rem",
          fontWeight: 600,
          color: badgeColor,
          padding: "0.05rem 0.4rem",
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: "100px",
          flexShrink: 0,
        }}>
          {item.badge}
        </span>
      )}
    </>
  );

  if (isLink) {
    return (
      <Link
        href={item.href!}
        style={commonStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {inner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!isModalTrigger}
      aria-label={item.label}
      style={{
        ...commonStyle,
        cursor: isModalTrigger ? "pointer" : "default",
        opacity: isModalTrigger ? 1 : 0.85,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {inner}
    </button>
  );
}

export function Sidebar({
  collapsed, onToggle, onLogout, onOpenPalette, onOpenModal,
}: SidebarProps) {
  const pathname = usePathname() ?? "";
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => () => { if (leaveTimer.current) clearTimeout(leaveTimer.current); }, []);

  const isOpen = !collapsed || hovered;

  const handleMouseEnter = useCallback(() => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setHovered(true);
  }, []);
  const handleMouseLeave = useCallback(() => {
    leaveTimer.current = setTimeout(() => setHovered(false), 300);
  }, []);

  const showTip = useCallback((label: string, el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    setTooltip({ label, x: rect.right + 10, y: rect.top + rect.height / 2 });
  }, []);
  const hideTip = useCallback(() => setTooltip(null), []);

  const isItemActive = useCallback(
    (item: NavItemData): boolean => {
      if (!item.href) return false;
      if (item.href === "/dashboard") return pathname === "/dashboard";
      if (item.href === "/rapports")  return pathname.startsWith("/rapports");
      if (item.href === "/chat")      return pathname.startsWith("/chat");
      return pathname === item.href;
    },
    [pathname],
  );

  return (
    <aside
      className="app-sidebar"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        width: isOpen ? EXPANDED_W : COLLAPSED_W,
        flexShrink: 0,
        background: "var(--surface-2)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
        overflow: "hidden",
        transition: "width 0.36s cubic-bezier(0.22, 1, 0.36, 1)",
        zIndex: 20,
      }}
    >
      {/* Header: logo + brand text + toggle */}
      <div style={{
        display: "flex",
        alignItems: "center",
        height: 52,
        padding: "0 0.55rem",
        gap: "0.45rem",
        flexShrink: 0,
        justifyContent: isOpen ? "flex-start" : "center",
      }}>
        <div style={{
          width: ICON_BTN, height: ICON_BTN,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <svg viewBox="0 0 60 70" fill="none" style={{ width: 22, height: 22 }}>
            <polygon points="30,2 58,17.5 58,52.5 30,68 2,52.5 2,17.5"
              fill="none" stroke="var(--accent)" strokeWidth="4" />
            <polygon points="30,12 48,22.5 48,47.5 30,58 12,47.5 12,22.5"
              fill="var(--accent)" opacity="0.4" />
            <polygon points="30,22 38,27 38,43 30,48 22,43 22,27"
              fill="var(--accent)" />
          </svg>
        </div>

        <div style={{
          flex: 1, minWidth: 0,
          overflow: "hidden",
          maxWidth: isOpen ? "160px" : "0px",
          opacity: isOpen ? 1 : 0,
          transform: `translateX(${isOpen ? 0 : -6}px)`,
          transition: "max-width 0.34s cubic-bezier(0.22,1,0.36,1), opacity 0.22s ease, transform 0.28s cubic-bezier(0.22,1,0.36,1)",
          pointerEvents: isOpen ? "auto" : "none",
          lineHeight: 1, whiteSpace: "nowrap",
        }}>
          <div style={{
            fontSize: "0.7rem", fontWeight: 800,
            color: "var(--accent)", letterSpacing: "1.8px",
            textTransform: "uppercase",
          }}>Malyz</div>
          <div style={{
            fontSize: "0.52rem", color: "var(--text-4)",
            letterSpacing: "0.6px", textTransform: "uppercase",
            marginTop: "2px",
          }}>Consulting Sàrl</div>
        </div>

        <button
          onClick={() => { hideTip(); onToggle(); }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--surface)";
            e.currentTarget.style.color = "var(--text)";
            if (collapsed) showTip("Épingler", e.currentTarget);
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--text-3)";
            hideTip();
          }}
          aria-label={collapsed ? "Épingler le panneau" : "Replier le panneau"}
          style={{
            position: "relative",
            display: "flex", alignItems: "center", justifyContent: "center",
            width: ICON_BTN, height: ICON_BTN,
            flexShrink: 0,
            background: "transparent",
            border: "none", borderRadius: "8px",
            color: "var(--text-3)",
            cursor: "pointer",
            overflow: "hidden",
            maxWidth: isOpen ? `${ICON_BTN}px` : "0px",
            opacity: isOpen ? 1 : 0,
            transition: "max-width 0.34s cubic-bezier(0.22,1,0.36,1), opacity 0.22s ease, background 0.16s, color 0.16s",
            pointerEvents: isOpen ? "auto" : "none",
          }}
        >
          <span style={{
            position: "absolute",
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: collapsed ? 1 : 0,
            transform: collapsed ? "rotate(45deg) scale(1)" : "rotate(90deg) scale(0.6)",
            transition: "opacity 0.2s ease, transform 0.26s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}>
            <Pin size={15} strokeWidth={2} />
          </span>
          <span style={{
            position: "absolute",
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: collapsed ? 0 : 1,
            transform: collapsed ? "translateX(6px) scale(0.7)" : "translateX(0) scale(1)",
            transition: "opacity 0.2s ease, transform 0.26s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}>
            <ChevronLeft size={17} strokeWidth={2.25} />
          </span>
        </button>
      </div>

      {/* Search */}
      <div style={{ padding: "0 0.55rem 0.65rem", flexShrink: 0 }}>
        <button
          onClick={() => { hideTip(); onOpenPalette(); }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.color = "var(--text-2)";
            if (!isOpen) showTip("Rechercher", e.currentTarget);
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.color = "var(--text-3)";
            hideTip();
          }}
          style={{
            width: "100%",
            display: "flex", alignItems: "center",
            justifyContent: isOpen ? "flex-start" : "center",
            gap: "0.55rem",
            padding: isOpen ? "0.5rem 0.65rem" : "0",
            height: isOpen ? "auto" : ICON_BTN,
            background: "var(--surface)",
            border: "none", borderRadius: "10px",
            color: "var(--text-3)",
            fontSize: "0.84rem",
            fontFamily: "inherit",
            cursor: "pointer",
            boxShadow: "var(--tier-1)",
            transition: "transform 0.22s ease, color 0.18s",
          }}
        >
          <Search size={isOpen ? 14 : 19} strokeWidth={2} style={{ flexShrink: 0 }} />
          {isOpen && (
            <span style={{
              flex: 1, textAlign: "left",
              whiteSpace: "nowrap", overflow: "hidden",
            }}>Rechercher…</span>
          )}
          {isOpen && (
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              color: "var(--text-4)",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              padding: "0.05rem 0.35rem",
              borderRadius: "5px",
              flexShrink: 0,
            }}>⌘K</span>
          )}
        </button>
      </div>

      {/* Nav */}
      <nav style={{
        flex: 1,
        overflowY: "auto", overflowX: "hidden",
        padding: "0 0.55rem 0.6rem",
      }}>
        {sections.map((section) => (
          <div key={section.title} style={{ marginTop: "0.8rem" }}>
            <div style={{
              padding: "0 0.55rem 0.3rem",
              fontSize: "0.62rem", fontWeight: 700,
              color: "var(--text-4)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              opacity: isOpen ? 1 : 0,
              maxHeight: isOpen ? "2rem" : "0.35rem",
              overflow: "hidden",
              transition: "opacity 0.2s ease, max-height 0.3s cubic-bezier(0.22,1,0.36,1)",
              whiteSpace: "nowrap",
            }}>
              {section.title}
            </div>
            {section.items.map((item) => (
              <NavItem
                key={item.label}
                item={item}
                collapsed={!isOpen}
                active={isItemActive(item)}
                showTip={showTip}
                hideTip={hideTip}
                onOpenModal={onOpenModal}
              />
            ))}
          </div>
        ))}
      </nav>

      {/* Bottom: bell + user */}
      <div style={{
        padding: "0.55rem 0.55rem 0.75rem",
        borderTop: "1px solid var(--border)",
        display: "flex",
        flexDirection: isOpen ? "row" : "column",
        alignItems: "center",
        gap: "0.4rem",
        flexShrink: 0,
      }}>
        <Popover
          placement="right-end"
          offset={12}
          portal
          trigger={({ open, toggle }) => (
            <button
              onClick={() => { hideTip(); toggle(); }}
              onMouseEnter={(e) => {
                if (!open) {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  if (!isOpen) showTip("Alertes · 3", e.currentTarget);
                }
              }}
              onMouseLeave={(e) => {
                if (!open) e.currentTarget.style.transform = "translateY(0)";
                hideTip();
              }}
              aria-label="Alertes"
              aria-expanded={open}
              style={{
                position: "relative",
                display: "flex", alignItems: "center", justifyContent: "center",
                width: ICON_BTN, height: ICON_BTN,
                flexShrink: 0,
                background: open ? "var(--surface-3)" : "var(--surface)",
                border: "none", borderRadius: "9px",
                color: "var(--text-2)",
                cursor: "pointer",
                boxShadow: "var(--tier-1)",
                transition: "transform 0.22s ease, background 0.18s",
              }}
            >
              <Bell size={16} strokeWidth={2.25} />
              <span style={{
                position: "absolute", top: 3, right: 3,
                minWidth: 14, height: 14,
                padding: "0 3px",
                borderRadius: "7px",
                background: "var(--danger)",
                color: "#FFFFFF",
                fontSize: "0.58rem", fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
                lineHeight: 1,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "1.5px solid var(--surface)",
              }}>3</span>
            </button>
          )}
        >
          {(close) => <NotificationsContent onClose={close} />}
        </Popover>

        <Popover
          placement="right-end"
          offset={12}
          portal
          trigger={({ open, toggle }) => (
            <button
              onClick={() => { hideTip(); toggle(); }}
              onMouseEnter={(e) => {
                if (!open) {
                  if (isOpen) e.currentTarget.style.transform = "translateY(-1px)";
                  if (!isOpen) showTip("Thomas", e.currentTarget);
                }
              }}
              onMouseLeave={(e) => {
                if (!open) e.currentTarget.style.transform = "translateY(0)";
                hideTip();
              }}
              aria-label="Menu utilisateur"
              aria-expanded={open}
              style={{
                flex: isOpen ? 1 : "0 0 auto",
                minWidth: 0,
                width: isOpen ? "auto" : ICON_BTN,
                height: isOpen ? "auto" : ICON_BTN,
                display: "flex", alignItems: "center",
                gap: "0.5rem",
                padding: isOpen ? "0.3rem 0.5rem" : "0",
                justifyContent: isOpen ? "flex-start" : "center",
                background: open ? "var(--surface-3)" : "var(--surface)",
                border: "none", borderRadius: "9px",
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: "var(--tier-1)",
                transition: "transform 0.22s ease, background 0.18s",
              }}
            >
              <span style={{
                width: 26, height: 26,
                background: "var(--accent)",
                color: "#FFFFFF",
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-mono)",
                fontSize: "0.7rem", fontWeight: 700,
                letterSpacing: "0.02em",
                flexShrink: 0,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.22), 0 1px 2px rgba(0,0,0,0.1)",
              }}>TM</span>
              <span style={{
                display: "flex", alignItems: "center",
                gap: "0.3rem",
                flex: 1, minWidth: 0,
                overflow: "hidden",
                maxWidth: isOpen ? "140px" : "0px",
                opacity: isOpen ? 1 : 0,
                transition: "max-width 0.34s cubic-bezier(0.22,1,0.36,1), opacity 0.22s ease",
                pointerEvents: isOpen ? "auto" : "none",
              }}>
                <span style={{
                  flex: 1, minWidth: 0,
                  textAlign: "left",
                  fontSize: "0.78rem", fontWeight: 600,
                  color: "var(--text)",
                  letterSpacing: "-0.005em",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>Thomas</span>
                <ChevronDown size={12} strokeWidth={2} color="var(--text-3)" style={{ flexShrink: 0 }} />
              </span>
            </button>
          )}
        >
          {(close) => <UserMenuContent onLogout={onLogout} onClose={close} />}
        </Popover>
      </div>

      {mounted && tooltip && createPortal(
        <TooltipBubble label={tooltip.label} x={tooltip.x} y={tooltip.y} />,
        document.body,
      )}
    </aside>
  );
}
