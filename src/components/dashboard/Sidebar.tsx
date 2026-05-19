"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  Home, Target, FolderArchive, Flame, Wallet, Globe,
  Sparkles, MessageSquare, AlertTriangle, Settings, HelpCircle,
  ChevronLeft, ChevronRight, Search, Bell, Menu,
  type LucideIcon,
} from "lucide-react";
import type { ModalKey } from "@/lib/types";
import { NotificationsContent } from "@/components/shared/NotificationsContent";
import { UserMenuContent } from "@/components/shared/UserMenuContent";
import { useNotifications } from "@/components/dashboard/NotificationsProvider";

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

type PopupTab = "profile" | "notif";

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
const BREAKPOINT_MOBILE = 720;
/* Popup geometry — same in both tabs so they are visually identical.
 * Height clamps so short viewports get a tighter panel without breaking layout. */
const POPUP_INSET = 8;
const POPUP_WIDTH = 296;
const POPUP_HEIGHT_MAX = 312;
const POPUP_VIEWPORT_RESERVE = 200; /* header + search + bottom row + margin */
const POPUP_TABBAR_H = 42;
const POPUP_BOTTOM_OFFSET = 58;

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
  const { unreadCount } = useNotifications();
  const pathname = usePathname() ?? "";
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [mounted, setMounted] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [popupOpen, setPopupOpen] = useState(false);
  const [popupTab, setPopupTab] = useState<PopupTab>("profile");

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
    setPopupOpen(false);
  }, [pathname]);

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
    if (collapsed && !isMobile) setPopupOpen(false);
  }, [collapsed, isMobile]);

  // Outside click + Escape for popup. Capture-phase click listener so the
  // dismissing click never reaches the underlying element (a nav <Link>, a
  // tile, etc.) — outside-click should *only* close the popup and nothing
  // else. The popup itself, its trigger, and the mobile drawer backdrop are
  // all allowed through so their own handlers can run normally.
  useEffect(() => {
    if (!popupOpen) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (popupRef.current?.contains(t)) return;
      const el = t as HTMLElement;
      if (el.closest?.("[data-popup-trigger]")) return;
      if (el.closest?.("[data-drawer-backdrop]")) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      setPopupOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPopupOpen(false);
    };
    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [popupOpen]);

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

  /** Trigger logic: same tab twice closes; different tab switches; collapsed expands first. */
  const handlePopupTrigger = (tab: PopupTab) => {
    hideTip();
    if (popupOpen && popupTab === tab) {
      setPopupOpen(false);
      return;
    }
    if (!isMobile && collapsed) {
      onToggle();
    }
    setPopupTab(tab);
    setPopupOpen(true);
  };

  const closePopup = useCallback(() => setPopupOpen(false), []);

  /** Toggle: closes popup first to avoid leaving an orphan panel inside a collapsing sidebar. */
  const handleSidebarToggle = () => {
    hideTip();
    setPopupOpen(false);
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
                // Layered dismiss: close the popup first if it's open,
                // then close the drawer on the next click.
                if (popupOpen) setPopupOpen(false);
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
          height: 52,
          padding: "0 0.55rem",
          gap: "0.45rem",
          flexShrink: 0,
          justifyContent: isOpen ? "space-between" : "center",
        }}>
          {isOpen && (
            <>
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
                lineHeight: 1,
                whiteSpace: "nowrap",
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
            </>
          )}

          {/* Toggle — always visible */}
          <button
            onClick={handleSidebarToggle}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--surface)";
              e.currentTarget.style.color = "var(--text)";
              if (!isMobile && collapsed) showTip("Déployer le panneau", e.currentTarget);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--text-3)";
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
              color: "var(--text-3)",
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
                  onNavigate={isMobile ? () => setDrawerOpen(false) : undefined}
                />
              ))}
            </div>
          ))}
        </nav>

        {/* Bottom: bell + avatar (compact, right-aligned when expanded) */}
        <div
          style={{
            padding: "0.55rem 0.55rem 0.75rem",
            borderTop: "1px solid var(--border)",
            display: "flex",
            flexDirection: isOpen ? "row" : "column",
            alignItems: "center",
            justifyContent: isOpen ? "flex-end" : "center",
            gap: "0.4rem",
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            data-popup-trigger="notif"
            onClick={() => handlePopupTrigger("notif")}
            onMouseEnter={(e) => {
              if (popupOpen && popupTab === "notif") return;
              e.currentTarget.style.transform = "translateY(-1px)";
              if (!isOpen) showTip(`Alertes · ${unreadCount}`, e.currentTarget);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              hideTip();
            }}
            aria-label="Alertes"
            aria-expanded={popupOpen && popupTab === "notif"}
            style={{
              position: "relative",
              display: "flex", alignItems: "center", justifyContent: "center",
              width: ICON_BTN, height: ICON_BTN,
              flexShrink: 0,
              background: popupOpen && popupTab === "notif" ? "var(--surface-3)" : "var(--surface)",
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
            }}>{unreadCount}</span>
          </button>

          <button
            type="button"
            data-popup-trigger="profile"
            onClick={() => handlePopupTrigger("profile")}
            onMouseEnter={(e) => {
              if (popupOpen && popupTab === "profile") return;
              e.currentTarget.style.transform = "translateY(-1px)";
              if (!isOpen) showTip("Thomas", e.currentTarget);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              hideTip();
            }}
            aria-label="Profil"
            aria-expanded={popupOpen && popupTab === "profile"}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: ICON_BTN, height: ICON_BTN,
              flexShrink: 0,
              background: popupOpen && popupTab === "profile" ? "var(--surface-3)" : "var(--surface)",
              border: "none", borderRadius: "9px",
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: "var(--tier-1)",
              transition: "transform 0.22s ease, background 0.18s",
              padding: 0,
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
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.22), 0 1px 2px rgba(0,0,0,0.1)",
            }}>TM</span>
          </button>
        </div>

        {/* Unified tabbed popup — anchored inside the sidebar */}
        <AnimatePresence>
          {popupOpen && isOpen && (
            <motion.div
              ref={popupRef}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "absolute",
                left: POPUP_INSET,
                width: `min(${POPUP_WIDTH}px, calc(100vw - 16px))`,
                bottom: POPUP_BOTTOM_OFFSET,
                height: `min(${POPUP_HEIGHT_MAX}px, calc(100vh - ${POPUP_VIEWPORT_RESERVE}px))`,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                boxShadow:
                  "0 20px 50px -16px rgba(15,23,42,0.28), 0 6px 16px -8px rgba(15,23,42,0.12)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                zIndex: 30,
                transformOrigin: "bottom right",
              }}
            >
              <LayoutGroup id="sidebar-popup-tabs">
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  padding: "0.18rem 0.22rem",
                  gap: "0.15rem",
                  borderBottom: "1px solid var(--border)",
                  height: POPUP_TABBAR_H,
                  flexShrink: 0,
                }}>
                  {(["notif", "profile"] as PopupTab[]).map((t) => {
                    const active = popupTab === t;
                    const label = t === "profile" ? "Profil" : "Alertes";
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setPopupTab(t)}
                        style={{
                          position: "relative",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.35rem",
                          height: "100%",
                          background: "transparent",
                          border: "none",
                          borderRadius: 6,
                          fontFamily: "inherit",
                          fontSize: "0.68rem",
                          fontWeight: active ? 600 : 500,
                          color: active ? "var(--text)" : "var(--text-3)",
                          cursor: "pointer",
                          transition: "color 0.18s",
                        }}
                        onMouseEnter={(e) => {
                          if (!active) e.currentTarget.style.color = "var(--text-2)";
                        }}
                        onMouseLeave={(e) => {
                          if (!active) e.currentTarget.style.color = "var(--text-3)";
                        }}
                      >
                        {active && (
                          <motion.span
                            layoutId="popup-active-tab"
                            style={{
                              position: "absolute",
                              inset: 0,
                              background: "var(--surface-2)",
                              borderRadius: 6,
                              zIndex: 0,
                            }}
                            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                          />
                        )}
                        <span style={{
                          position: "relative", zIndex: 1,
                          display: "inline-flex", alignItems: "center",
                          gap: "0.4rem",
                        }}>
                          {t === "profile" ? (
                            <span style={{
                              width: 14, height: 14,
                              borderRadius: "100px",
                              background: "var(--accent)",
                              color: "#FFFFFF",
                              display: "flex",
                              alignItems: "center", justifyContent: "center",
                              fontFamily: "var(--font-mono)",
                              fontSize: "0.46rem", fontWeight: 700,
                              letterSpacing: "0.02em",
                              flexShrink: 0,
                            }}>TM</span>
                          ) : (
                            <span style={{ position: "relative", display: "inline-flex" }}>
                              <Bell size={12} strokeWidth={2.25} />
                              <span aria-hidden style={{
                                position: "absolute",
                                top: -3, right: -5,
                                minWidth: 10, height: 10,
                                padding: "0 2px",
                                borderRadius: "5px",
                                background: "var(--danger)",
                                color: "#FFFFFF",
                                fontSize: "0.44rem", fontWeight: 700,
                                lineHeight: 1,
                                display: "flex",
                                alignItems: "center", justifyContent: "center",
                                border: "1.25px solid var(--surface)",
                              }}>{unreadCount}</span>
                            </span>
                          )}
                          {label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </LayoutGroup>

              <motion.div
                key={popupTab}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  flex: 1,
                  minHeight: 0,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {popupTab === "profile" ? (
                  <UserMenuContent onLogout={onLogout} onClose={closePopup} bare />
                ) : (
                  <NotificationsContent onClose={closePopup} bare />
                )}
              </motion.div>
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
