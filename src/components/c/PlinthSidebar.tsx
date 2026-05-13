"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Home, BarChart3, Target, FolderArchive, Flame, Wallet, Globe,
  Sparkles, MessageSquare, AlertTriangle, Settings, HelpCircle,
  ChevronDown, ChevronLeft, ChevronRight, Search, Bell,
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
      {/* arrow */}
      <div style={{
        width: 0, height: 0,
        borderTop: "6px solid transparent",
        borderBottom: "6px solid transparent",
        borderRight: "6px solid #111113",
        flexShrink: 0,
      }} />
      {/* label */}
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

  return (
    <button
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
        boxShadow: item.active && !collapsed ? "var(--tier-1)" : "none",
        transition: "background 0.18s, color 0.18s",
        margin: "1px 0",
      }}
      onMouseEnter={(e) => {
        if (!item.active || collapsed) e.currentTarget.style.background = collapsed ? "transparent" : "var(--surface)";
        if (collapsed) showTip(item.label + (item.badge ? ` · ${item.badge}` : ""), e.currentTarget);
      }}
      onMouseLeave={(e) => {
        if (!item.active || collapsed) e.currentTarget.style.background = "transparent";
        hideTip();
      }}
    >
      {collapsed ? (
        // Uniform icon container — same size as toggle / bell / user
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
    </button>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
export function PlinthSidebar({
  collapsed, onToggle, onLogout, onOpenPalette,
}: PlinthSidebarProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const showTip = useCallback((label: string, el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    setTooltip({ label, x: rect.right + 10, y: rect.top + rect.height / 2 });
  }, []);
  const hideTip = useCallback(() => setTooltip(null), []);

  return (
    <aside
      className="plinth-sidebar"
      data-collapsed={collapsed ? "true" : "false"}
      style={{
        width: collapsed ? COLLAPSED_W : EXPANDED_W,
        flexShrink: 0,
        background: "var(--surface-2)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
        overflow: "hidden",
        transition: "width 0.32s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      {/* ── Logo ─────────────────────────────────────────────────── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.75rem 1rem 0",
        maxHeight: collapsed ? 0 : 56,
        opacity: collapsed ? 0 : 1,
        overflow: "hidden",
        pointerEvents: collapsed ? "none" : "auto",
        transition: "max-height 0.32s cubic-bezier(0.22,1,0.36,1), opacity 0.20s ease, padding 0.28s ease",
        flexShrink: 0,
      }}>
        <svg viewBox="0 0 60 70" fill="none" style={{ width: 22, height: 22, flexShrink: 0 }}>
          <polygon points="30,2 58,17.5 58,52.5 30,68 2,52.5 2,17.5" fill="none" stroke="var(--accent)" strokeWidth="4" />
          <polygon points="30,12 48,22.5 48,47.5 30,58 12,47.5 12,22.5" fill="var(--accent)" opacity="0.4" />
          <polygon points="30,22 38,27 38,43 30,48 22,43 22,27" fill="var(--accent)" />
        </svg>
        <div style={{ lineHeight: 1 }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--accent)", letterSpacing: "1.8px", textTransform: "uppercase" }}>
            Malyz
          </div>
          <div style={{ fontSize: "0.52rem", color: "var(--text-4)", letterSpacing: "0.6px", textTransform: "uppercase", marginTop: "2px" }}>
            Consulting Sàrl
          </div>
        </div>
      </div>

      {/* ── Workspace + toggle ────────────────────────────────────── */}
      <div style={{
        padding: "0.6rem 0.55rem 0.55rem",
        display: "flex",
        alignItems: "center",
        gap: collapsed ? 0 : "0.4rem",
        flexShrink: 0,
        justifyContent: collapsed ? "center" : "flex-start",
      }}>
        <button
          className="plinth-workspace"
          style={{
            flex: collapsed ? "0 0 0%" : 1,
            minWidth: 0,
            overflow: "hidden",
            opacity: collapsed ? 0 : 1,
            pointerEvents: collapsed ? "none" : "auto",
            display: "flex",
            alignItems: "center",
            gap: "0.55rem",
            padding: collapsed ? 0 : "0.35rem 0.45rem",
            background: "var(--surface)",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: "var(--tier-1)",
            transition: "transform 0.22s ease, flex 0.32s cubic-bezier(0.22,1,0.36,1), opacity 0.20s ease, padding 0.28s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          <span style={{
            width: 26, height: 26,
            background: "linear-gradient(to bottom, var(--accent), var(--accent-2))",
            color: "#FFFFFF",
            borderRadius: "7px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.64rem", fontWeight: 700, flexShrink: 0,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), 0 0 0 1px rgba(68,65,200,0.2), 0 2px 6px -2px rgba(88,86,214,0.4)",
          }}>
            CMA
          </span>
          <div className="plinth-workspace-label" style={{ flex: 1, minWidth: 0, textAlign: "left", lineHeight: 1.15, whiteSpace: "nowrap", overflow: "hidden" }}>
            <div style={{ fontSize: "0.84rem", fontWeight: 600, color: "var(--text)", letterSpacing: "-0.005em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Cabinet Müller
            </div>
            <div style={{ fontSize: "0.66rem", color: "var(--text-3)" }}>5 courtiers</div>
          </div>
          <ChevronDown size={13} strokeWidth={2} color="var(--text-3)" style={{ flexShrink: 0 }} />
        </button>

        {/* Toggle */}
        <button
          onClick={() => { hideTip(); onToggle(); }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--surface)";
            e.currentTarget.style.color = "var(--text)";
            if (collapsed) showTip("Déplier", e.currentTarget);
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = collapsed ? "transparent" : "var(--surface)";
            e.currentTarget.style.color = "var(--text-3)";
            hideTip();
          }}
          aria-label={collapsed ? "Déplier le panneau" : "Replier le panneau"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: ICON_BTN,
            height: ICON_BTN,
            flexShrink: 0,
            background: collapsed ? "transparent" : "var(--surface)",
            border: "none",
            borderRadius: "8px",
            color: "var(--text-3)",
            cursor: "pointer",
            boxShadow: collapsed ? "none" : "var(--tier-1)",
            transition: "background 0.18s ease, color 0.18s, box-shadow 0.18s",
          }}
        >
          {collapsed ? <ChevronRight size={18} strokeWidth={2} /> : <ChevronLeft size={17} strokeWidth={2.25} />}
        </button>
      </div>

      {/* ── Search ───────────────────────────────────────────────── */}
      <div style={{ padding: "0 0.55rem 0.6rem", flexShrink: 0 }}>
        <button
          onClick={() => { hideTip(); onOpenPalette(); }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.color = "var(--text-2)";
            if (collapsed) showTip("Rechercher", e.currentTarget);
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
            justifyContent: collapsed ? "center" : "flex-start",
            gap: "0.55rem",
            padding: collapsed ? "0" : "0.5rem 0.65rem",
            height: collapsed ? ICON_BTN : "auto",
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
          <Search size={collapsed ? 20 : 14} strokeWidth={2} style={{ flexShrink: 0 }} />
          {!collapsed && (
            <span style={{ flex: 1, textAlign: "left", whiteSpace: "nowrap", overflow: "hidden" }}>
              Rechercher…
            </span>
          )}
        </button>
      </div>

      {/* ── Nav ──────────────────────────────────────────────────── */}
      <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "0.25rem 0.55rem 0.6rem" }}>
        {sections.map((section) => (
          <div key={section.title} style={{ marginTop: "0.85rem" }}>
            <div
              className="plinth-section-title"
              style={{
                padding: "0 0.55rem 0.35rem",
                fontSize: "0.62rem",
                fontWeight: 700,
                color: "var(--text-4)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                opacity: collapsed ? 0 : 1,
                height: collapsed ? "0.4rem" : "auto",
                overflow: "hidden",
                transition: "opacity 0.18s, height 0.22s",
                whiteSpace: "nowrap",
              }}
            >
              {section.title}
            </div>
            {section.items.map((item) => (
              <NavItem key={item.label} item={item} collapsed={collapsed} showTip={showTip} hideTip={hideTip} />
            ))}
          </div>
        ))}
      </nav>

      {/* ── Bottom: bell + user ───────────────────────────────────── */}
      <div style={{
        padding: "0.55rem 0.55rem 0.75rem",
        borderTop: "1px solid var(--border)",
        display: "flex",
        flexDirection: collapsed ? "column" : "row",
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
                  if (collapsed) showTip("Notifications · 3", e.currentTarget);
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
                  if (!collapsed) e.currentTarget.style.transform = "translateY(-1px)";
                  if (collapsed) showTip("Thomas", e.currentTarget);
                }
              }}
              onMouseLeave={(e) => {
                if (!open) e.currentTarget.style.transform = "translateY(0)";
                hideTip();
              }}
              aria-label="Menu utilisateur"
              aria-expanded={open}
              style={{
                flex: collapsed ? "0 0 auto" : 1,
                minWidth: 0,
                width: collapsed ? ICON_BTN : "auto",
                height: collapsed ? ICON_BTN : "auto",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: collapsed ? "0" : "0.3rem 0.5rem",
                justifyContent: collapsed ? "center" : "flex-start",
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
              {!collapsed && (
                <>
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
                </>
              )}
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
