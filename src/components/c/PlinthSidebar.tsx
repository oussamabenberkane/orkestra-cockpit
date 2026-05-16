"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Home, BarChart3, Target, FolderArchive, Flame, Wallet, Globe,
  Sparkles, MessageSquare, AlertTriangle, Settings, HelpCircle,
  ChevronDown, ChevronLeft, Search, Bell, Pin,
} from "lucide-react";
import { Popover } from "@/components/shared/Popover";
import { NotificationsContent } from "@/components/shared/NotificationsContent";
import { UserMenuContent } from "@/components/shared/UserMenuContent";

interface PlinthSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onLogout: () => void;
  onOpenPalette: () => void;
}

type NavItemData = {
  Icon: typeof Home;
  label: string;
  active?: boolean;
  badge?: string;
  badgeTone?: "neutral" | "warn" | "danger";
  href?: string;
};

const sections: { title: string; items: NavItemData[] }[] = [
  {
    title: "Espace",
    items: [
      { Icon: Home, label: "Accueil", active: true },
      { Icon: BarChart3, label: "Rapports" },
    ],
  },
  {
    title: "Métier",
    items: [
      { Icon: Target, label: "Prospection", badge: "12", badgeTone: "neutral" },
      { Icon: FolderArchive, label: "Portefeuille" },
      { Icon: Flame, label: "Sinistres", badge: "3", badgeTone: "danger" },
      { Icon: Wallet, label: "Finance", badge: "2", badgeTone: "warn" },
      { Icon: Globe, label: "Vue d'ensemble" },
    ],
  },
  {
    title: "Intelligence",
    items: [
      { Icon: MessageSquare, label: "Chat IA", badge: "3", badgeTone: "warn" },
      { Icon: AlertTriangle, label: "Alertes", badge: "5", badgeTone: "danger" },
      { Icon: Sparkles, label: "Agents", badge: "3", badgeTone: "neutral" },
    ],
  },
  {
    title: "Administration",
    items: [
      { Icon: Settings, label: "Paramètres" },
      { Icon: HelpCircle, label: "Support" },
    ],
  },
];

const EXPANDED_W = 248;
const COLLAPSED_W = 64;
const ICON_BTN = 36;

interface TooltipState { label: string; x: number; y: number }

// ── Portal tooltip ────────────────────────────────────────────────────────────
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
      <div style={{
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

// ── NavItem ───────────────────────────────────────────────────────────────────
function NavItem({
  item, collapsed, showTip, hideTip,
}: {
  item: NavItemData;
  collapsed: boolean;
  showTip: (label: string, el: HTMLElement) => void;
  hideTip: () => void;
}) {
  const { Icon } = item;
  const badgeColor =
    item.badgeTone === "danger" ? "var(--danger)"
    : item.badgeTone === "warn"  ? "var(--warn)"
    : "var(--text-3)";

  const Tag = item.href ? Link : "button";
  const tagProps = item.href
    ? { href: item.href }
    : { type: "button" as const };

  return (
    <Tag
      {...(tagProps as any)}
      className="plinth-nav-item"
      style={{
        position: "relative",
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "0.55rem",
        padding: collapsed ? "0.25rem" : "0.45rem 0.55rem",
        justifyContent: collapsed ? "center" : "flex-start",
        background: item.active && !collapsed ? "var(--surface)" : "transparent",
        border: "none",
        borderRadius: "8px",
        fontFamily: "inherit",
        fontSize: "0.84rem",
        fontWeight: item.active ? 600 : 500,
        color: item.active ? "var(--text)" : "var(--text-2)",
        cursor: "pointer",
        textAlign: "left",
        textDecoration: "none",
        boxShadow: item.active && !collapsed ? "var(--tier-1)" : "none",
        transition: "background 0.18s, color 0.18s",
        margin: "1px 0",
      }}
      onMouseEnter={(e: React.MouseEvent<HTMLElement>) => {
        if (!item.active || collapsed) e.currentTarget.style.background = collapsed ? "transparent" : "var(--surface)";
        if (collapsed) showTip(item.label + (item.badge ? ` · ${item.badge}` : ""), e.currentTarget);
      }}
      onMouseLeave={(e: React.MouseEvent<HTMLElement>) => {
        if (!item.active || collapsed) e.currentTarget.style.background = "transparent";
        hideTip();
      }}
    >
      {collapsed ? (
        <span style={{
          width: ICON_BTN,
          height: ICON_BTN,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: item.active ? "var(--surface)" : "transparent",
          borderRadius: "8px",
          boxShadow: item.active ? "var(--tier-1)" : "none",
          position: "relative",
          flexShrink: 0,
          transition: "background 0.18s, box-shadow 0.18s",
        }}>
          <Icon
            size={20}
            strokeWidth={item.active ? 2.25 : 2}
            color={item.active ? "var(--accent)" : "var(--text-3)"}
          />
          {item.badge && (
            <span aria-hidden style={{
              position: "absolute",
              top: 4, right: 4,
              width: 6, height: 6,
              borderRadius: "50%",
              background: badgeColor,
              border: "1.5px solid var(--surface-2)",
            }} />
          )}
        </span>
      ) : (
        <>
          <Icon
            size={14}
            strokeWidth={2}
            color={item.active ? "var(--accent)" : "var(--text-3)"}
            style={{ flexShrink: 0 }}
          />
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
      )}
    </Tag>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
export function PlinthSidebar({
  collapsed, onToggle, onLogout, onOpenPalette,
}: PlinthSidebarProps) {
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

  return (
    <aside
      className="plinth-sidebar"
      data-collapsed={collapsed ? "true" : "false"}
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
      }}
    >
      {/* ── Header: logo + brand text + toggle ───────────────────── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        height: 52,
        padding: "0 0.55rem",
        gap: "0.45rem",
        flexShrink: 0,
        justifyContent: isOpen ? "flex-start" : "center",
      }}>
        {/* Logo mark — always visible */}
        <div style={{
          width: ICON_BTN,
          height: ICON_BTN,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          <svg viewBox="0 0 60 70" fill="none" style={{ width: 22, height: 22 }}>
            <polygon points="30,2 58,17.5 58,52.5 30,68 2,52.5 2,17.5" fill="none" stroke="var(--accent)" strokeWidth="4" />
            <polygon points="30,12 48,22.5 48,47.5 30,58 12,47.5 12,22.5" fill="var(--accent)" opacity="0.4" />
            <polygon points="30,22 38,27 38,43 30,48 22,43 22,27" fill="var(--accent)" />
          </svg>
        </div>

        {/* Brand text — slides in when open */}
        <div style={{
          flex: 1,
          minWidth: 0,
          overflow: "hidden",
          maxWidth: isOpen ? "160px" : "0px",
          opacity: isOpen ? 1 : 0,
          transform: `translateX(${isOpen ? 0 : -6}px)`,
          transition: "max-width 0.34s cubic-bezier(0.22,1,0.36,1), opacity 0.22s ease, transform 0.28s cubic-bezier(0.22,1,0.36,1)",
          pointerEvents: isOpen ? "auto" : "none",
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--accent)", letterSpacing: "1.8px", textTransform: "uppercase" }}>
            Malyz
          </div>
          <div style={{ fontSize: "0.52rem", color: "var(--text-4)", letterSpacing: "0.6px", textTransform: "uppercase", marginTop: "2px" }}>
            Consulting Sàrl
          </div>
        </div>

        {/* Toggle — fades in when open, crossfades between Pin and ChevronLeft */}
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
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: ICON_BTN,
            height: ICON_BTN,
            flexShrink: 0,
            background: "transparent",
            border: "none",
            borderRadius: "8px",
            color: "var(--text-3)",
            cursor: "pointer",
            overflow: "hidden",
            maxWidth: isOpen ? `${ICON_BTN}px` : "0px",
            opacity: isOpen ? 1 : 0,
            transition: "max-width 0.34s cubic-bezier(0.22,1,0.36,1), opacity 0.22s ease, background 0.16s, color 0.16s",
            pointerEvents: isOpen ? "auto" : "none",
          }}
        >
          {/* Pin — visible when hover-open (not yet pinned) */}
          <span style={{
            position: "absolute",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: collapsed ? 1 : 0,
            transform: collapsed
              ? "rotate(45deg) scale(1)"
              : "rotate(90deg) scale(0.6)",
            transition: "opacity 0.2s ease, transform 0.26s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}>
            <Pin size={15} strokeWidth={2} />
          </span>

          {/* ChevronLeft — visible when pinned open */}
          <span style={{
            position: "absolute",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: collapsed ? 0 : 1,
            transform: collapsed
              ? "translateX(6px) scale(0.7)"
              : "translateX(0) scale(1)",
            transition: "opacity 0.2s ease, transform 0.26s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}>
            <ChevronLeft size={17} strokeWidth={2.25} />
          </span>
        </button>
      </div>

      {/* ── Search ───────────────────────────────────────────────── */}
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
          className="plinth-search"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: isOpen ? "flex-start" : "center",
            gap: "0.55rem",
            padding: isOpen ? "0.5rem 0.65rem" : "0",
            height: isOpen ? "auto" : ICON_BTN,
            background: "var(--surface)",
            border: "none",
            borderRadius: "10px",
            color: "var(--text-3)",
            fontSize: "0.84rem",
            fontFamily: "inherit",
            cursor: "pointer",
            boxShadow: "var(--tier-1)",
            transition: "transform 0.22s ease, color 0.18s",
          }}
        >
          <Search size={isOpen ? 14 : 20} strokeWidth={2} style={{ flexShrink: 0 }} />
          {isOpen && (
            <span style={{ flex: 1, textAlign: "left", whiteSpace: "nowrap", overflow: "hidden" }}>
              Rechercher…
            </span>
          )}
        </button>
      </div>

      {/* ── Nav ──────────────────────────────────────────────────── */}
      <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "0 0.55rem 0.6rem" }}>
        {sections.map((section) => (
          <div key={section.title} style={{ marginTop: "0.8rem" }}>
            <div
              className="plinth-section-title"
              style={{
                padding: "0 0.55rem 0.3rem",
                fontSize: "0.62rem",
                fontWeight: 700,
                color: "var(--text-4)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                opacity: isOpen ? 1 : 0,
                maxHeight: isOpen ? "2rem" : "0.35rem",
                overflow: "hidden",
                transition: "opacity 0.2s ease, max-height 0.3s cubic-bezier(0.22,1,0.36,1)",
                whiteSpace: "nowrap",
              }}
            >
              {section.title}
            </div>
            {section.items.map((item) => (
              <NavItem key={item.label} item={item} collapsed={!isOpen} showTip={showTip} hideTip={hideTip} />
            ))}
          </div>
        ))}
      </nav>

      {/* ── Bottom: bell + user ───────────────────────────────────── */}
      <div style={{
        padding: "0.55rem 0.55rem 0.75rem",
        borderTop: "1px solid var(--border)",
        display: "flex",
        flexDirection: isOpen ? "row" : "column",
        alignItems: "center",
        gap: "0.4rem",
        flexShrink: 0,
        transition: "flex-direction 0s",
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
                  if (!isOpen) showTip("Notifications · 3", e.currentTarget);
                }
              }}
              onMouseLeave={(e) => {
                if (!open) e.currentTarget.style.transform = "translateY(0)";
                hideTip();
              }}
              aria-label="Notifications"
              aria-expanded={open}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: ICON_BTN,
                height: ICON_BTN,
                flexShrink: 0,
                background: open ? "var(--surface-3)" : "var(--surface)",
                border: "none",
                borderRadius: "8px",
                color: "var(--text-2)",
                cursor: "pointer",
                boxShadow: "var(--tier-1)",
                transition: "transform 0.22s ease, background 0.18s",
              }}
            >
              <Bell size={18} strokeWidth={2} />
              <span style={{
                position: "absolute",
                top: 4, right: 4,
                minWidth: 13, height: 13,
                padding: "0 3px",
                borderRadius: "7px",
                background: "var(--danger)",
                color: "#FFFFFF",
                fontSize: "0.56rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1.5px solid var(--surface)",
              }}>
                3
              </span>
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
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: isOpen ? "0.3rem 0.5rem" : "0",
                justifyContent: isOpen ? "flex-start" : "center",
                background: open ? "var(--surface-3)" : "var(--surface)",
                border: "none",
                borderRadius: "9px",
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: "var(--tier-1)",
                transition: "transform 0.22s ease, background 0.18s",
              }}
            >
              <span style={{
                width: 26, height: 26,
                background: "linear-gradient(to bottom, var(--text-2), var(--text))",
                color: "var(--surface)",
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.62rem", fontWeight: 700, flexShrink: 0,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), 0 1px 2px rgba(0,0,0,0.1)",
              }}>
                TM
              </span>
              {/* Name + chevron fade in when open */}
              <span style={{
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
                flex: 1,
                minWidth: 0,
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
                }}>
                  Thomas
                </span>
                <ChevronDown size={12} strokeWidth={2} color="var(--text-3)" style={{ flexShrink: 0 }} />
              </span>
            </button>
          )}
        >
          <UserMenuContent onLogout={onLogout} />
        </Popover>
      </div>

      {/* ── Tooltip portal ────────────────────────────────────────── */}
      {mounted && tooltip && createPortal(
        <TooltipBubble label={tooltip.label} x={tooltip.x} y={tooltip.y} />,
        document.body,
      )}
    </aside>
  );
}
