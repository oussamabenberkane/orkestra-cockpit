"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Search, Bell, Menu,
  type LucideIcon,
} from "lucide-react";
import type { ModalKey } from "@/lib/types";
import { NotificationsContent } from "@/components/shared/NotificationsContent";
import { UserMenuContent } from "@/components/shared/UserMenuContent";
import { useNotifications } from "@/components/dashboard/NotificationsProvider";
import { useAlerts } from "@/components/dashboard/AlertsProvider";
import { useWorkspace } from "@/lib/workspaces";
import type { NavItem, NavSection } from "@/lib/workspaces/types";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onLogout: () => void;
  onOpenPalette: () => void;
  onOpenModal?: (key: ModalKey) => void;
  /** Server-fetched alertes unread count — overrides the in-memory notification count when provided. */
  serverUnreadCount?: number;
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

type OpenPopup = "profile" | "notif";

const EXPANDED_W = 248;
const COLLAPSED_W = 64;
const ICON_BTN = 36;
const BREAKPOINT_MOBILE = 720;
const POPUP_INSET = 8;
const POPUP_WIDTH = 296;
const POPUP_HEIGHT_MAX = 340;
const POPUP_VIEWPORT_RESERVE = 200;
/* Bottom bar heights: expanded row is taller than two stacked icons */
const POPUP_BOTTOM_OFFSET_EXPANDED = 74;
const POPUP_BOTTOM_OFFSET_COLLAPSED = 96;

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
  item, collapsed, active, showTip, hideTip, onOpenModal, onNavigate,
}: {
  item: NavItemData;
  collapsed: boolean;
  active: boolean;
  showTip: (label: string, el: HTMLElement) => void;
  hideTip: () => void;
  onOpenModal?: (key: ModalKey) => void;
  onNavigate?: () => void;
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
      onNavigate?.();
    } else if (isLink) {
      onNavigate?.();
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
    /* Active sits on a white pill (var(--surface)) so uses --text (dark).
     * Inactive sits directly on the sidebar surface so uses --rail-text-muted,
     * which is dark on light sidebars and light on the Cobalt deep-blue sidebar. */
    color: active ? "var(--text)" : "var(--rail-text-muted)",
    cursor: "pointer",
    textAlign: "left",
    textDecoration: "none",
    boxShadow: active && !collapsed ? "var(--tier-active)" : "none",
    transition: "background 0.18s, color 0.18s, transform 0.18s",
    margin: "1px 0",
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    if (!active && !collapsed) {
      e.currentTarget.style.background = "var(--rail-hover)";
      const iconEl = e.currentTarget.querySelector("[data-nav-icon]") as HTMLElement | null;
      if (iconEl) {
        iconEl.style.opacity = "1";
        iconEl.style.transform = "scale(1.08)";
      }
    }
    if (collapsed) {
      const wrap = e.currentTarget.querySelector("[data-nav-icon-collapsed]") as HTMLElement | null;
      if (wrap) wrap.style.background = active ? "var(--surface)" : "var(--rail-hover)";
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
      /* rail-on-white when active: the wrap becomes a white card on the
       * cobalt rail, so its text/icon tokens re-scope to dark variants. */
      className={active ? "rail-on-white" : undefined}
      style={{
        width: ICON_BTN,
        height: ICON_BTN,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: active ? "var(--surface)" : "transparent",
        borderRadius: "9px",
        boxShadow: active ? "var(--tier-active)" : "none",
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
        /* Count chip — uses --rail-badge-* tokens so colored-sidebar palettes
         * (Cobalt) can flip the chip to a solid white pill with dark text.
         * The rail-on-white class kicks in the semantic-color reset there so
         * the badge count reads in the deep semantic variant on the white pill. */
        <span
          className="rail-on-white"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.66rem",
            fontWeight: 600,
            color: badgeColor,
            padding: "0.05rem 0.4rem",
            background: "var(--rail-badge-bg)",
            border: "1px solid var(--rail-badge-border)",
            borderRadius: "100px",
            flexShrink: 0,
          }}
        >
          {item.badge}
        </span>
      )}
    </>
  );

  /* When the expanded pill is active, the surface flips to var(--surface)
   * (white). Mark it rail-on-white so text + nav-icon tokens re-scope to
   * dark variants on the Cobalt palette where the surrounding sidebar
   * tokens are light. No-op in light-sidebar palettes (no scope rule
   * matches). */
  const activeWhiteClass = active && !collapsed ? "rail-on-white" : undefined;

  if (isLink) {
    return (
      <Link
        href={item.href!}
        className={activeWhiteClass}
        style={commonStyle}
        onClick={handleClick}
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
      className={activeWhiteClass}
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
  collapsed, onToggle, onLogout, onOpenPalette, onOpenModal, serverUnreadCount,
}: SidebarProps) {
  const { unreadCount: notifCount } = useNotifications();
  const unreadCount = serverUnreadCount ?? notifCount;
  const pathname = usePathname() ?? "";
  /* Nav items are workspace-scoped — switching the top-of-page tab swaps
   * the Métier/Trading section in place without remounting the rail. */
  const { shape } = useWorkspace();
  /* Live counts for the nav badges. Alerts live in the same provider that
   * powers /alertes, so the rail's "Alertes" count, the "Sinistres" and
   * "Finance" badges, and the alerts page itself all stay in sync — mark a
   * row as read on /alertes and the rail badge drops immediately. Badges
   * collapse (return undefined) when their corresponding count hits zero so
   * the rail doesn't display empty "0" chips. */
  const { alerts, unreadCount: alertsUnread } = useAlerts();
  const sections = useMemo<NavSection[]>(() => {
    const sinistreUnread = alerts.filter((a) => !a.read && a.category === "sinistre").length;
    const financeUnread  = alerts.filter((a) => !a.read && a.category === "finance").length;
    const liveBadge = (item: NavItem): NavItem => {
      if (item.label === "Alertes") {
        return alertsUnread > 0
          ? { ...item, badge: String(alertsUnread), badgeTone: "danger" }
          : { ...item, badge: undefined, badgeTone: undefined };
      }
      if (item.label === "Sinistres") {
        return sinistreUnread > 0
          ? { ...item, badge: String(sinistreUnread), badgeTone: "danger" }
          : { ...item, badge: undefined, badgeTone: undefined };
      }
      if (item.label === "Finance") {
        return financeUnread > 0
          ? { ...item, badge: String(financeUnread), badgeTone: "warn" }
          : { ...item, badge: undefined, badgeTone: undefined };
      }
      return item;
    };
    return shape.nav.map((s) => ({ ...s, items: s.items.map(liveBadge) }));
  }, [shape.nav, alerts, alertsUnread]);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [mounted, setMounted] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [openPopup, setOpenPopup] = useState<OpenPopup | null>(null);

  const sidebarRef = useRef<HTMLElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Responsive: mobile detection
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(`(max-width: ${BREAKPOINT_MOBILE}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Close drawer + popup on route change
  useEffect(() => {
    setDrawerOpen(false);
    setOpenPopup(null);
  }, [pathname]);

  /* Cross-sidebar coordination — when another sidebar on the page (e.g. the
   * /chat history rail) opens its mobile drawer, it dispatches this event so
   * we can close ours. Keeps the "one-at-a-time" mobile UX without lifting
   * drawer state out of either component. Optional and source-agnostic. */
  useEffect(() => {
    const onCloseOthers = (e: Event) => {
      const detail = (e as CustomEvent<{ source?: string }>).detail;
      if (detail?.source === "app-sidebar") return;
      setDrawerOpen(false);
      setOpenPopup(null);
    };
    window.addEventListener("orkestra:close-sidebars", onCloseOthers);
    return () => window.removeEventListener("orkestra:close-sidebars", onCloseOthers);
  }, []);

  /* Conversely, broadcast when we open the drawer so other rails can collapse. */
  useEffect(() => {
    if (!drawerOpen) return;
    window.dispatchEvent(
      new CustomEvent("orkestra:close-sidebars", { detail: { source: "app-sidebar" } }),
    );
  }, [drawerOpen]);

  /* Lock background scroll while the mobile drawer is open. Toggling a class
   * on <html> (rather than mutating body inline styles) locks both the html
   * and body scroll containers, survives re-renders, and works on iOS Safari
   * where body-only locks leak through. See `.scroll-locked` in globals.css. */
  useEffect(() => {
    if (!isMobile || !drawerOpen) return;
    document.documentElement.classList.add("scroll-locked");
    return () => {
      document.documentElement.classList.remove("scroll-locked");
    };
  }, [isMobile, drawerOpen]);

  // Close popup if sidebar gets collapsed (popup lives inside it and would clip)
  useEffect(() => {
    if (collapsed && !isMobile) setOpenPopup(null);
  }, [collapsed, isMobile]);

  // Outside click + Escape for popup. Capture-phase click listener so the
  // dismissing click never reaches the underlying element (a nav <Link>, a
  // tile, etc.) — outside-click should *only* close the popup and nothing
  // else. The popup itself, its trigger, and the mobile drawer backdrop are
  // all allowed through so their own handlers can run normally.
  useEffect(() => {
    if (!openPopup) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (popupRef.current?.contains(t)) return;
      const el = t as HTMLElement;
      if (el.closest?.("[data-popup-trigger]")) return;
      if (el.closest?.("[data-drawer-backdrop]")) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      setOpenPopup(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenPopup(null);
    };
    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [openPopup]);

  /** Desktop: open iff not collapsed. Mobile: open iff drawer is open. */
  const isOpen = isMobile ? drawerOpen : !collapsed;

  const showTip = useCallback((label: string, el: HTMLElement) => {
    if (isMobile) return;
    const rect = el.getBoundingClientRect();
    setTooltip({ label, x: rect.right + 10, y: rect.top + rect.height / 2 });
  }, [isMobile]);
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

  /** Trigger: same popup closes; different popup switches; collapsed expands first. */
  const handlePopupTrigger = (popup: OpenPopup) => {
    hideTip();
    if (openPopup === popup) {
      setOpenPopup(null);
      return;
    }
    if (!isMobile && collapsed) {
      onToggle();
    }
    setOpenPopup(popup);
  };

  const closePopup = useCallback(() => setOpenPopup(null), []);

  /** Toggle: closes popup first to avoid leaving an orphan panel inside a collapsing sidebar. */
  const handleSidebarToggle = () => {
    hideTip();
    setOpenPopup(null);
    if (isMobile) {
      setDrawerOpen(false);
    } else {
      onToggle();
    }
  };

  /* Mobile uses top/bottom anchoring (no height: 100vh) so the bottom row stays
   * pinned to the visible viewport even when the mobile address bar resizes. */
  const sidebarPosition: React.CSSProperties = isMobile
    ? {
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        transform: drawerOpen ? "translateX(0)" : `translateX(-${EXPANDED_W + 4}px)`,
        transition: "transform 0.34s cubic-bezier(0.22, 1, 0.36, 1)",
        zIndex: 50,
        boxShadow: drawerOpen ? "0 24px 60px -16px rgba(15,23,42,0.32)" : "none",
      }
    : {
        position: "sticky",
        top: 0,
        height: "100vh",
        transition: "width 0.36s cubic-bezier(0.22, 1, 0.36, 1)",
        zIndex: 20,
      };

  return (
    <>
      {/* Mobile hamburger */}
      {isMobile && !drawerOpen && (
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Ouvrir le menu"
          style={{
            position: "fixed",
            top: "0.75rem",
            left: "0.75rem",
            zIndex: 45,
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            boxShadow: "var(--tier-1)",
            cursor: "pointer",
            color: "var(--text)",
          }}
        >
          <Menu size={18} strokeWidth={2.25} />
        </button>
      )}

      {/* Mobile top clearance bar — full-width fixed strip matching page bg.
       * Sits at z:39 (below the drawer backdrop) so it's only visible when the
       * drawer is closed; prevents page content from scrolling behind the
       * hamburger. Portalled to body so position:fixed anchors to the viewport
       * (same reasoning as the sidebar itself). */}
      {mounted && isMobile && createPortal(
        <div
          aria-hidden
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: "4.5rem",
            background: "var(--bg)",
            zIndex: 39,
          }}
        />,
        document.body,
      )}

      {/* Mobile backdrop */}
      {mounted && createPortal(
        <AnimatePresence>
          {isMobile && drawerOpen && (
            <motion.div
              data-drawer-backdrop="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => {
                if (openPopup) setOpenPopup(null);
                else setDrawerOpen(false);
              }}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(15,23,42,0.42)",
                zIndex: 40,
              }}
            />
          )}
        </AnimatePresence>,
        document.body,
      )}

      {(() => {
        const asideElement = (
        <aside
          ref={sidebarRef}
          className="app-sidebar"
          style={{
            width: isMobile ? EXPANDED_W : (collapsed ? COLLAPSED_W : EXPANDED_W),
            flexShrink: 0,
            background: "var(--surface-2)",
            borderRight: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            ...sidebarPosition,
          }}
        >
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          height: 58,
          padding: "0 0.6rem",
          gap: "0.45rem",
          flexShrink: 0,
          justifyContent: isOpen ? "space-between" : "center",
        }}>
          {isOpen && (
            <>
              <div style={{
                width: 40, height: 40,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <svg viewBox="0 0 60 70" fill="none" style={{ width: 30, height: 30 }}>
                  <polygon points="30,2 58,17.5 58,52.5 30,68 2,52.5 2,17.5"
                    fill="none" stroke="var(--rail-accent)" strokeWidth="3.5" />
                  <polygon points="30,12 48,22.5 48,47.5 30,58 12,47.5 12,22.5"
                    fill="var(--rail-accent)" opacity="0.22" />
                  <polygon points="30,20 40,26 40,44 30,50 20,44 20,26"
                    fill="var(--rail-accent)" opacity="0.55" />
                  <polygon points="30,28 36,31.5 36,38.5 30,42 24,38.5 24,31.5"
                    fill="var(--rail-accent)" />
                </svg>
              </div>

              <div style={{
                flex: 1, minWidth: 0,
                overflow: "hidden",
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}>
                <div style={{
                  fontSize: "0.92rem", fontWeight: 900,
                  color: "var(--rail-accent)", letterSpacing: "2.4px",
                  textTransform: "uppercase",
                }}>Malyz</div>
                <div style={{
                  fontSize: "0.55rem", color: "var(--rail-text-soft)",
                  letterSpacing: "0.7px", textTransform: "uppercase",
                  marginTop: "3px", fontWeight: 500,
                }}>Consulting Sàrl</div>
              </div>
            </>
          )}

          {/* Toggle — always visible */}
          <button
            onClick={handleSidebarToggle}
            onMouseEnter={(e) => {
              /* Hover: white card on the rail. Color uses --accent so the
               * chevron stays legible on dark-rail palettes (azure/cobalt
               * etc.) where --text resolves to white inside .app-sidebar
               * scope and would disappear against the white hover card. */
              e.currentTarget.style.background = "var(--surface)";
              e.currentTarget.style.color = "var(--accent)";
              if (!isMobile && collapsed) showTip("Déployer le panneau", e.currentTarget);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--rail-text-muted)";
              hideTip();
            }}
            aria-label={
              isMobile ? "Fermer le menu"
              : collapsed ? "Déployer le panneau"
              : "Replier le panneau"
            }
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: ICON_BTN, height: ICON_BTN,
              flexShrink: 0,
              background: "transparent",
              border: "none",
              borderRadius: "8px",
              color: "var(--rail-text-muted)",
              cursor: "pointer",
              transition: "background 0.16s, color 0.16s",
            }}
          >
            {!isMobile && collapsed ? (
              <ChevronRight size={17} strokeWidth={2.25} />
            ) : (
              <ChevronLeft size={17} strokeWidth={2.25} />
            )}
          </button>
        </div>

        {/* Search — always a white card on the rail, so rail-on-white scopes
         * its text tokens to dark variants on Cobalt (no-op elsewhere). */}
        <div style={{ padding: "0 0.55rem 0.65rem", flexShrink: 0 }}>
          <button
            className="rail-on-white"
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
          </button>
        </div>

        {/* Nav — overflow hidden so no scrollbar (or reserved gutter) is
         * ever painted on the rail. Content is sized to fit the viewport
         * across all supported breakpoints; if a future addition would
         * overflow, the bottom section pins to the rail floor and the
         * extra items would be clipped — at which point this should be
         * reconsidered. */}
        <nav className="sidebar-nav" style={{
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          padding: "0 0.55rem 0.6rem",
        }}>
          {sections.map((section) => (
            <div key={section.title} style={{ marginTop: "0.8rem" }}>
              <div style={{
                padding: "0 0.55rem 0.3rem",
                fontSize: "0.62rem", fontWeight: 700,
                color: "var(--rail-text-soft)",
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
                  onNavigate={isMobile ? () => setDrawerOpen(false) : undefined}
                />
              ))}
            </div>
          ))}
        </nav>

        {/* Bottom: user row + bell (expanded) | stacked icons (collapsed) */}
        {isOpen ? (
          <div
            style={{
              padding: "0.5rem 0.6rem 0.7rem",
              borderTop: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              flexShrink: 0,
            }}
          >
            {/* User info button */}
            <button
              type="button"
              data-popup-trigger="profile"
              onClick={() => handlePopupTrigger("profile")}
              aria-label="Profil"
              aria-expanded={openPopup === "profile"}
              onMouseEnter={(e) => {
                if (openPopup === "profile") return;
                (e.currentTarget as HTMLElement).style.background = "var(--surface-3)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = openPopup === "profile" ? "var(--surface-3)" : "transparent";
              }}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.4rem 0.45rem",
                background: openPopup === "profile" ? "var(--surface-3)" : "transparent",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontFamily: "inherit",
                textAlign: "left",
                transition: "background 0.16s",
                minWidth: 0,
              }}
            >
              <span style={{ position: "relative", flexShrink: 0 }}>
                <span style={{
                  width: 30, height: 30,
                  background: "var(--rail-avatar-bg, var(--accent))",
                  color: "var(--rail-avatar-fg, #FFFFFF)",
                  borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.68rem", fontWeight: 700,
                  letterSpacing: "0.02em",
                  boxShadow: "var(--rail-avatar-shadow, inset 0 1px 0 rgba(255,255,255,0.22), 0 2px 6px rgba(0,98,204,0.35))",
                }}>TM</span>
                <span aria-hidden style={{
                  position: "absolute",
                  bottom: 1, right: 1,
                  width: 7, height: 7,
                  borderRadius: "50%",
                  background: "var(--success)",
                  border: "1.5px solid var(--surface-2)",
                }} />
              </span>
              <div style={{ minWidth: 0, lineHeight: 1.2 }}>
                <div style={{
                  fontSize: "0.78rem", fontWeight: 600,
                  color: "var(--rail-text)",
                  letterSpacing: "-0.01em",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>Mirko Righele</div>
                <div style={{
                  fontSize: "0.6rem",
                  color: "var(--rail-text-soft)",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  marginTop: "1px",
                }}>m.ferretti@helvebroker.ch</div>
              </div>
            </button>

            {/* Bell button — always a white card on the rail */}
            <button
              type="button"
              data-popup-trigger="notif"
              className="rail-on-white"
              onClick={() => handlePopupTrigger("notif")}
              aria-label="Notifications"
              aria-expanded={openPopup === "notif"}
              onMouseEnter={(e) => {
                if (openPopup === "notif") return;
                (e.currentTarget as HTMLElement).style.background = "var(--surface-3)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = openPopup === "notif" ? "var(--surface-3)" : "var(--surface)";
              }}
              style={{
                position: "relative",
                display: "flex", alignItems: "center", justifyContent: "center",
                width: ICON_BTN, height: ICON_BTN,
                flexShrink: 0,
                background: openPopup === "notif" ? "var(--surface-3)" : "var(--surface)",
                border: "none", borderRadius: "9px",
                color: "var(--text-2)",
                cursor: "pointer",
                boxShadow: "var(--tier-1)",
                transition: "background 0.16s",
              }}
            >
              <Bell size={16} strokeWidth={2.25} />
              {unreadCount > 0 && (
                <span aria-hidden style={{
                  position: "absolute", top: 4, right: 4,
                  minWidth: 13, height: 13,
                  padding: "0 2.5px",
                  borderRadius: "6.5px",
                  background: "var(--danger)",
                  color: "#FFFFFF",
                  fontSize: "0.56rem", fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                  lineHeight: 1,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "1.5px solid var(--surface-2)",
                }}>{unreadCount}</span>
              )}
            </button>
          </div>
        ) : (
          <div
            style={{
              padding: "0.55rem 0 0.75rem",
              borderTop: "1px solid var(--border)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.4rem",
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              data-popup-trigger="notif"
              onClick={() => handlePopupTrigger("notif")}
              onMouseEnter={(e) => {
                const wrap = e.currentTarget.querySelector("[data-icon-wrap]") as HTMLElement | null;
                if (wrap) wrap.style.background = openPopup === "notif" ? "var(--surface-3)" : "var(--surface-3)";
                showTip(`Notifications · ${unreadCount}`, e.currentTarget);
              }}
              onMouseLeave={(e) => {
                const wrap = e.currentTarget.querySelector("[data-icon-wrap]") as HTMLElement | null;
                if (wrap) wrap.style.background = openPopup === "notif" ? "var(--surface)" : "transparent";
                hideTip();
              }}
              aria-label="Notifications"
              style={{
                position: "relative",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "transparent", border: "none",
                cursor: "pointer", padding: 0,
              }}
            >
              <span
                data-icon-wrap
                className={openPopup === "notif" ? "rail-on-white" : undefined}
                style={{
                  width: ICON_BTN, height: ICON_BTN,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: openPopup === "notif" ? "var(--surface)" : "transparent",
                  borderRadius: "9px",
                  boxShadow: openPopup === "notif" ? "var(--tier-1)" : "none",
                  transition: "background 0.16s, box-shadow 0.16s",
                }}
              >
                <Bell size={18} strokeWidth={2.1} color="var(--rail-text-muted)" />
              </span>
              {unreadCount > 0 && (
                <span aria-hidden style={{
                  position: "absolute", top: 5, right: 5,
                  width: 7, height: 7, borderRadius: "50%",
                  background: "var(--danger)",
                  border: "1.5px solid var(--surface-2)",
                }} />
              )}
            </button>

            <button
              type="button"
              data-popup-trigger="profile"
              onClick={() => handlePopupTrigger("profile")}
              onMouseEnter={(e) => {
                const wrap = e.currentTarget.querySelector("[data-icon-wrap]") as HTMLElement | null;
                if (wrap) wrap.style.background = "var(--surface-3)";
                showTip("Mirko Righele", e.currentTarget);
              }}
              onMouseLeave={(e) => {
                const wrap = e.currentTarget.querySelector("[data-icon-wrap]") as HTMLElement | null;
                if (wrap) wrap.style.background = openPopup === "profile" ? "var(--surface)" : "transparent";
                hideTip();
              }}
              aria-label="Profil"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "transparent", border: "none",
                cursor: "pointer", padding: 0,
              }}
            >
              <span
                data-icon-wrap
                className={openPopup === "profile" ? "rail-on-white" : undefined}
                style={{
                  width: ICON_BTN, height: ICON_BTN,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: openPopup === "profile" ? "var(--surface)" : "transparent",
                  borderRadius: "9px",
                  boxShadow: openPopup === "profile" ? "var(--tier-1)" : "none",
                  position: "relative",
                  transition: "background 0.16s, box-shadow 0.16s",
                }}
              >
                <span style={{
                  width: 26, height: 26,
                  background: "var(--rail-avatar-bg, var(--accent))",
                  color: "var(--rail-avatar-fg, #FFFFFF)",
                  borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.68rem", fontWeight: 700,
                  letterSpacing: "0.02em",
                  boxShadow: "var(--rail-avatar-shadow-collapsed, inset 0 1px 0 rgba(255,255,255,0.22))",
                }}>TM</span>
              </span>
            </button>
          </div>
        )}

        {/* Separate popups — each opens directly from its own trigger, no tabs */}
        <AnimatePresence>
          {openPopup !== null && isOpen && (
            <motion.div
              ref={popupRef}
              key="popup-panel"
              /* The popup is a white card rendered inside the sidebar scope,
               * so its text tokens need to flip back to dark for legibility
               * on the Cobalt palette. */
              className="rail-on-white"
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              transition={{ duration: 0.19, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "absolute",
                left: POPUP_INSET,
                width: `min(${POPUP_WIDTH}px, calc(100vw - 16px))`,
                bottom: POPUP_BOTTOM_OFFSET_EXPANDED,
                height: `min(${POPUP_HEIGHT_MAX}px, calc(100vh - ${POPUP_VIEWPORT_RESERVE}px))`,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 14,
                boxShadow:
                  "0 24px 56px -16px rgba(15,23,42,0.30), 0 8px 20px -8px rgba(15,23,42,0.12), 0 0 0 1px rgba(0,0,0,0.03)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                zIndex: 30,
                transformOrigin: "bottom left",
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={openPopup}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                  style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}
                >
                  {openPopup === "profile" ? (
                    <UserMenuContent onLogout={onLogout} onClose={closePopup} bare />
                  ) : (
                    <NotificationsContent onClose={closePopup} bare />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
        </aside>
        );
        return isMobile && mounted
          ? createPortal(asideElement, document.body)
          : asideElement;
      })()}

      {mounted && tooltip && createPortal(
        <TooltipBubble label={tooltip.label} x={tooltip.x} y={tooltip.y} />,
        document.body,
      )}
    </>
  );
}
