"use client";

import { useState } from "react";
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

export function PlinthSidebar({
  collapsed,
  onToggle,
  onLogout,
  onOpenPalette,
}: PlinthSidebarProps) {
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
      {/* Top: workspace + toggle */}
      <div
        style={{
          padding: "0.85rem 0.55rem 0.65rem",
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          flexShrink: 0,
        }}
      >
        <button
          className="plinth-workspace"
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            gap: "0.55rem",
            padding: "0.35rem 0.45rem",
            background: "var(--surface)",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: "var(--tier-1)",
            transition: "transform 0.22s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          <span
            style={{
              width: 26,
              height: 26,
              background: "linear-gradient(to bottom, var(--accent), var(--accent-2))",
              color: "#FFFFFF",
              borderRadius: "7px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.64rem",
              fontWeight: 700,
              flexShrink: 0,
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.3), 0 0 0 1px rgba(68,65,200,0.2), 0 2px 6px -2px rgba(88,86,214,0.4)",
            }}
          >
            CMA
          </span>
          <div
            className="plinth-workspace-label"
            style={{
              flex: 1,
              minWidth: 0,
              textAlign: "left",
              lineHeight: 1.15,
              opacity: collapsed ? 0 : 1,
              transform: collapsed ? "translateX(-6px)" : "translateX(0)",
              transition: "opacity 0.22s ease, transform 0.22s ease",
              pointerEvents: collapsed ? "none" : "auto",
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                fontSize: "0.84rem",
                fontWeight: 600,
                color: "var(--text)",
                letterSpacing: "-0.005em",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Cabinet Müller
            </div>
            <div style={{ fontSize: "0.66rem", color: "var(--text-3)" }}>
              5 courtiers
            </div>
          </div>
          <ChevronDown
            size={13}
            strokeWidth={2}
            color="var(--text-3)"
            style={{
              flexShrink: 0,
              opacity: collapsed ? 0 : 1,
              transition: "opacity 0.18s",
            }}
          />
        </button>

        <button
          onClick={onToggle}
          aria-label={collapsed ? "Déplier le panneau" : "Replier le panneau"}
          title={collapsed ? "Déplier" : "Replier"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 30,
            height: 30,
            flexShrink: 0,
            background: "var(--surface)",
            border: "none",
            borderRadius: "8px",
            color: "var(--text-3)",
            cursor: "pointer",
            boxShadow: "var(--tier-1)",
            transition: "transform 0.22s ease, color 0.18s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.color = "var(--text)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.color = "var(--text-3)";
          }}
        >
          {collapsed ? (
            <ChevronRight size={14} strokeWidth={2.25} />
          ) : (
            <ChevronLeft size={14} strokeWidth={2.25} />
          )}
        </button>
      </div>

      {/* Search */}
      <div style={{ padding: "0 0.55rem 0.6rem", flexShrink: 0 }}>
        <button
          onClick={onOpenPalette}
          className="plinth-search"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "0.55rem",
            padding: collapsed ? "0.4rem" : "0.5rem 0.65rem",
            justifyContent: collapsed ? "center" : "flex-start",
            background: "var(--surface)",
            border: "none",
            borderRadius: "10px",
            color: "var(--text-3)",
            fontSize: "0.84rem",
            fontFamily: "inherit",
            cursor: "pointer",
            boxShadow: "var(--tier-1)",
            transition: "transform 0.22s ease, color 0.18s",
            position: "relative",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.color = "var(--text-2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.color = "var(--text-3)";
          }}
        >
          <Search size={14} strokeWidth={2} style={{ flexShrink: 0 }} />
          <span
            style={{
              flex: 1,
              textAlign: "left",
              opacity: collapsed ? 0 : 1,
              transition: "opacity 0.18s",
              pointerEvents: collapsed ? "none" : "auto",
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
          >
            Rechercher…
          </span>
          {collapsed && <FlyoutLabel>Rechercher</FlyoutLabel>}
        </button>
      </div>

      {/* Nav */}
      <nav
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: "0.25rem 0.55rem 0.6rem",
        }}
      >
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
              <NavItem key={item.label} item={item} collapsed={collapsed} />
            ))}
          </div>
        ))}
      </nav>

      {/* Bottom: bell + user */}
      <div
        style={{
          padding: "0.55rem 0.55rem 0.75rem",
          borderTop: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          flexShrink: 0,
        }}
      >
        <Popover
          placement="right-end"
          offset={12}
          trigger={({ open, toggle }) => (
            <button
              onClick={toggle}
              aria-label="Notifications"
              aria-expanded={open}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 36,
                height: 36,
                flexShrink: 0,
                background: open ? "var(--surface-3)" : "var(--surface)",
                border: "none",
                borderRadius: "9px",
                color: "var(--text-2)",
                cursor: "pointer",
                boxShadow: "var(--tier-1)",
                transition: "transform 0.22s ease, background 0.18s",
              }}
              onMouseEnter={(e) => {
                if (!open) e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                if (!open) e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <Bell size={14} strokeWidth={2} />
              <span
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  minWidth: 13,
                  height: 13,
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
                }}
              >
                3
              </span>
            </button>
          )}
        >
          {(close) => <NotificationsContent onClose={close} />}
        </Popover>

        <style>{`
          .plinth-nav-item:hover .plinth-flyout,
          .plinth-search:hover .plinth-flyout {
            opacity: 1 !important;
            transform: translateY(-50%) translateX(0) !important;
          }
        `}</style>

        <Popover
          placement="right-end"
          offset={12}
          trigger={({ open, toggle }) => (
            <button
              onClick={toggle}
              aria-label="Menu utilisateur"
              aria-expanded={open}
              style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: collapsed ? "0.3rem" : "0.3rem 0.5rem",
                justifyContent: collapsed ? "center" : "flex-start",
                background: open ? "var(--surface-3)" : "var(--surface)",
                border: "none",
                borderRadius: "9px",
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: "var(--tier-1)",
                transition: "transform 0.22s ease, background 0.18s",
              }}
              onMouseEnter={(e) => {
                if (!open) e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                if (!open) e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <span
                style={{
                  width: 26,
                  height: 26,
                  background: "linear-gradient(to bottom, var(--text-2), var(--text))",
                  color: "var(--surface)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  flexShrink: 0,
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), 0 1px 2px rgba(0,0,0,0.1)",
                }}
              >
                TM
              </span>
              <span
                style={{
                  flex: 1,
                  minWidth: 0,
                  textAlign: "left",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: "var(--text)",
                  letterSpacing: "-0.005em",
                  opacity: collapsed ? 0 : 1,
                  transition: "opacity 0.18s",
                  pointerEvents: collapsed ? "none" : "auto",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Thomas
              </span>
              {!collapsed && (
                <ChevronDown size={12} strokeWidth={2} color="var(--text-3)" style={{ flexShrink: 0 }} />
              )}
            </button>
          )}
        >
          <UserMenuContent onLogout={onLogout} />
        </Popover>
      </div>
    </aside>
  );
}

function NavItem({ item, collapsed }: { item: NavItemData; collapsed: boolean }) {
  const { Icon } = item;
  const badgeColor =
    item.badgeTone === "danger"
      ? "var(--danger)"
      : item.badgeTone === "warn"
      ? "var(--warn)"
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
        padding: collapsed ? "0.45rem 0.4rem" : "0.45rem 0.55rem",
        justifyContent: collapsed ? "center" : "flex-start",
        background: item.active ? "var(--surface)" : "transparent",
        border: "none",
        borderRadius: "8px",
        fontFamily: "inherit",
        fontSize: "0.84rem",
        fontWeight: item.active ? 600 : 500,
        color: item.active ? "var(--text)" : "var(--text-2)",
        cursor: "pointer",
        textAlign: "left",
        boxShadow: item.active ? "var(--tier-1)" : "none",
        transition: "background 0.18s, color 0.18s",
        margin: "1px 0",
      }}
      onMouseEnter={(e) => {
        if (!item.active) e.currentTarget.style.background = "var(--surface)";
      }}
      onMouseLeave={(e) => {
        if (!item.active) e.currentTarget.style.background = "transparent";
      }}
    >
      <Icon
        size={14}
        strokeWidth={2}
        color={item.active ? "var(--accent)" : "var(--text-3)"}
        style={{ flexShrink: 0 }}
      />
      <span
        style={{
          flex: 1,
          opacity: collapsed ? 0 : 1,
          transition: "opacity 0.18s",
          pointerEvents: collapsed ? "none" : "auto",
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        {item.label}
      </span>
      {item.badge && !collapsed && (
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.66rem",
            fontWeight: 600,
            color: badgeColor,
            padding: "0.05rem 0.4rem",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "100px",
            flexShrink: 0,
          }}
        >
          {item.badge}
        </span>
      )}
      {item.badge && collapsed && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: 5,
            right: 5,
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: badgeColor,
            border: "1.5px solid var(--surface-2)",
          }}
        />
      )}
      {collapsed && <FlyoutLabel>{item.label}{item.badge ? ` · ${item.badge}` : ""}</FlyoutLabel>}
    </button>
  );
}

function FlyoutLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="plinth-flyout"
      style={{
        position: "absolute",
        left: "calc(100% + 10px)",
        top: "50%",
        transform: "translateY(-50%) translateX(-4px)",
        background: "var(--text)",
        color: "var(--surface)",
        padding: "0.3rem 0.6rem",
        borderRadius: "6px",
        fontSize: "0.74rem",
        fontWeight: 500,
        whiteSpace: "nowrap",
        opacity: 0,
        pointerEvents: "none",
        boxShadow: "0 6px 14px -4px rgba(0,0,0,0.18)",
        transition: "opacity 0.16s ease, transform 0.18s ease",
        zIndex: 70,
      }}
    >
      {children}
    </span>
  );
}
