"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "lucide-react";
import { NotificationsContent } from "@/components/shared/NotificationsContent";
import { UserMenuContent } from "@/components/shared/UserMenuContent";

type DockTab = "notif" | "profile";

interface FloatingDockProps {
  onLogout: () => void;
  notifCount?: number;
  initials?: string;
}

export function FloatingDock({
  onLogout,
  notifCount = 3,
  initials = "TM",
}: FloatingDockProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<DockTab>("notif");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const openTab = (t: DockTab) => {
    if (open && tab === t) {
      setOpen(false);
    } else {
      setTab(t);
      setOpen(true);
    }
  };

  return (
    <>
      {/* Scrim to catch outside clicks */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 39,
              background: "transparent",
            }}
          />
        )}
      </AnimatePresence>

      <div
        style={{
          position: "fixed",
          bottom: "1.25rem",
          right: "1.25rem",
          zIndex: 40,
        }}
      >
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "absolute",
                bottom: "calc(100% + 0.7rem)",
                right: 0,
                width: 420,
                maxWidth: "calc(100vw - 2rem)",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "14px",
                boxShadow:
                  "0 24px 60px -16px rgba(15,23,42,0.22), 0 8px 20px -8px rgba(15,23,42,0.08)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <DockTabBar
                tab={tab}
                onChange={setTab}
                notifCount={notifCount}
              />
              <div style={{ overflow: "hidden" }}>
                {tab === "notif" ? (
                  <NotificationsContent
                    bare
                    onClose={() => setOpen(false)}
                  />
                ) : (
                  <UserMenuContent bare onLogout={onLogout} />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.15rem",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "100px",
            boxShadow:
              "0 1px 2px rgba(15,23,42,0.04), 0 10px 24px -8px rgba(15,23,42,0.18)",
            padding: "0.3rem 0.35rem",
          }}
        >
          <button
            type="button"
            onClick={() => openTab("notif")}
            aria-label="Notifications"
            aria-expanded={open && tab === "notif"}
            className="dock-btn"
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              background:
                open && tab === "notif" ? "var(--surface-2)" : "transparent",
              border: "none",
              borderRadius: "100px",
              color: "var(--text-2)",
              cursor: "pointer",
              transition: "background 0.15s, color 0.15s",
            }}
          >
            <Bell size={16} strokeWidth={2.25} />
            {notifCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 4,
                  right: 5,
                  minWidth: 14,
                  height: 14,
                  padding: "0 3px",
                  borderRadius: "7px",
                  background: "var(--danger)",
                  color: "#FFFFFF",
                  fontSize: "0.58rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1.5px solid var(--surface)",
                  lineHeight: 1,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {notifCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => openTab("profile")}
            aria-label="Profil"
            aria-expanded={open && tab === "profile"}
            className="dock-btn"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              background:
                open && tab === "profile" ? "var(--surface-2)" : "transparent",
              border: "none",
              borderRadius: "100px",
              cursor: "pointer",
              padding: 0,
              transition: "background 0.15s",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 28,
                height: 28,
                borderRadius: "100px",
                background: "var(--accent)",
                color: "#FFFFFF",
                fontFamily: "var(--font-mono)",
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.02em",
              }}
            >
              {initials}
            </span>
          </button>
        </div>
      </div>

      <style>{`
        .dock-btn:hover {
          background: var(--surface-2) !important;
        }
        .dock-btn:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
        }
      `}</style>
    </>
  );
}

function DockTabBar({
  tab,
  onChange,
  notifCount,
}: {
  tab: DockTab;
  onChange: (t: DockTab) => void;
  notifCount: number;
}) {
  const tabs: { id: DockTab; label: string; badge?: number }[] = [
    { id: "notif", label: "Notifications", badge: notifCount },
    { id: "profile", label: "Profil" },
  ];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.25rem",
        padding: "0.5rem 0.5rem 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {tabs.map((t) => {
        const active = tab === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.55rem 0.85rem 0.65rem",
              background: "transparent",
              border: "none",
              fontFamily: "inherit",
              fontSize: "0.82rem",
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
            {t.label}
            {t.badge !== undefined && t.badge > 0 && (
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                  color: "var(--danger)",
                  background: "var(--danger-tint)",
                  border: "1px solid var(--danger-tint)",
                  padding: "0.05rem 0.35rem",
                  borderRadius: "5px",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {t.badge}
              </span>
            )}
            {active && (
              <motion.span
                layoutId="dock-tab-underline"
                style={{
                  position: "absolute",
                  left: "0.65rem",
                  right: "0.65rem",
                  bottom: -1,
                  height: 2,
                  background: "var(--accent)",
                  borderRadius: "2px",
                }}
                transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
