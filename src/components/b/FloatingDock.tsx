"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Bell } from "lucide-react";
import { NotificationsListB } from "@/components/b/NotificationsListB";
import { UserMenuB } from "@/components/b/UserMenuB";

type DockTab = "profile" | "notif";
type DockAnchor = "bottom-right" | "bottom-left";

interface FloatingDockProps {
  onLogout: () => void;
  notifCount?: number;
  initials?: string;
  anchor?: DockAnchor;
}

const PILL_W = 84;
const PILL_H = 48;
const PANEL_W = 420;
const PANEL_H = 354;
const TAB_BAR_H = 44;

const AVATAR_PILL = 22;
const AVATAR_PANEL = 18;
const BELL_PILL = 16;
const BELL_PANEL = 14;

export function FloatingDock({
  onLogout,
  notifCount = 3,
  initials = "TM",
  anchor = "bottom-right",
}: FloatingDockProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<DockTab>("profile");

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

  const isLeft = anchor === "bottom-left";

  // Pill icon positions — geometric center of each half
  const avatarPillCX = isLeft ? (PILL_W * 3) / 4 : PILL_W / 4; // right-anchored: 21
  const bellPillCX = isLeft ? PILL_W / 4 : (PILL_W * 3) / 4; // right-anchored: 63
  const pillCY = PILL_H / 2; // 24

  const avatarPillX = avatarPillCX - AVATAR_PILL / 2; // 10
  const avatarPillY = pillCY - AVATAR_PILL / 2; // 13
  const bellPillX = bellPillCX - BELL_PILL / 2; // 55
  const bellPillY = pillCY - BELL_PILL / 2; // 16

  const dockSpring = {
    type: "spring" as const,
    stiffness: 280,
    damping: 26,
    mass: 1,
  };
  const iconSpring = {
    type: "spring" as const,
    stiffness: 320,
    damping: 28,
    mass: 0.9,
  };

  return (
    <LayoutGroup id="dock">
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

      <motion.div
        animate={{
          width: open ? PANEL_W : PILL_W,
          height: open ? PANEL_H : PILL_H,
          borderRadius: open ? 14 : 100,
        }}
        transition={dockSpring}
        style={{
          position: "fixed",
          bottom: "1.25rem",
          ...(isLeft ? { left: "1.25rem" } : { right: "1.25rem" }),
          zIndex: 40,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          boxShadow:
            "0 1px 2px rgba(15,23,42,0.04), 0 14px 32px -10px rgba(15,23,42,0.22)",
          overflow: "hidden",
          transformOrigin: isLeft ? "bottom left" : "bottom right",
        }}
      >
        {/* Pill state — click halves + absolute-positioned icons */}
        {!open && (
          <>
            <button
              type="button"
              onClick={() => openTab("profile")}
              aria-label="Profil"
              className="dock-pill-btn"
              style={{
                position: "absolute",
                left: isLeft ? PILL_W / 2 - 2 : 4,
                top: 4,
                width: PILL_W / 2 - 2,
                height: PILL_H - 8,
                background: "transparent",
                border: "none",
                borderRadius: 100,
                cursor: "pointer",
                padding: 0,
                transition: "background 0.15s",
                zIndex: 1,
              }}
            />
            <button
              type="button"
              onClick={() => openTab("notif")}
              aria-label="Notifications"
              className="dock-pill-btn"
              style={{
                position: "absolute",
                left: isLeft ? 4 : PILL_W / 2,
                top: 4,
                width: PILL_W / 2 - 2,
                height: PILL_H - 8,
                background: "transparent",
                border: "none",
                borderRadius: 100,
                cursor: "pointer",
                padding: 0,
                transition: "background 0.15s",
                zIndex: 1,
              }}
            />

            <motion.div
              layoutId="dock-avatar"
              transition={iconSpring}
              style={{
                position: "absolute",
                left: avatarPillX,
                top: avatarPillY,
                width: AVATAR_PILL,
                height: AVATAR_PILL,
                borderRadius: "100px",
                background: "var(--accent)",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
                zIndex: 2,
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                letterSpacing: "0.02em",
              }}
            >
              <motion.span layout="position" style={{ fontSize: "0.7rem", lineHeight: 1 }}>
                {initials}
              </motion.span>
            </motion.div>

            <motion.div
              layoutId="dock-bell"
              transition={iconSpring}
              style={{
                position: "absolute",
                left: bellPillX,
                top: bellPillY,
                width: BELL_PILL,
                height: BELL_PILL,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-2)",
                pointerEvents: "none",
                zIndex: 2,
              }}
            >
              <Bell size={BELL_PILL} strokeWidth={2.25} />
              {notifCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -5,
                    right: -7,
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
                    fontVariantNumeric: "tabular-nums",
                    lineHeight: 1,
                  }}
                >
                  {notifCount}
                </span>
              )}
            </motion.div>
          </>
        )}

        {/* Panel state — tab bar + content */}
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: {
                delay: 0.12,
                duration: 0.18,
                ease: [0.22, 1, 0.36, 1],
              },
            }}
            exit={{ opacity: 0, transition: { duration: 0.08 } }}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <DockTabBar
              tab={tab}
              onChange={setTab}
              iconSpring={iconSpring}
            />
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 4 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.22,
                  ease: [0.22, 1, 0.36, 1],
                },
              }}
              style={{
                flex: 1,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
              }}
            >
              {tab === "profile" ? (
                <UserMenuB onLogout={onLogout} />
              ) : (
                <NotificationsListB />
              )}
            </motion.div>
          </motion.div>
        )}
      </motion.div>

      <style>{`
        .dock-pill-btn:hover {
          background: var(--surface-2);
        }
        .dock-pill-btn:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
        }
      `}</style>
    </LayoutGroup>
  );
}

function DockTabBar({
  tab,
  onChange,
  iconSpring,
}: {
  tab: DockTab;
  onChange: (t: DockTab) => void;
  iconSpring: object;
}) {
  const tabs: { id: DockTab; label: string }[] = [
    { id: "profile", label: "Profil" },
    { id: "notif", label: "Notifications" },
  ];

  return (
    <div
      style={{
        height: TAB_BAR_H,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        alignItems: "center",
        padding: "0.3rem 0.35rem",
        gap: "0.2rem",
        borderBottom: "1px solid var(--border)",
        flexShrink: 0,
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
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              height: TAB_BAR_H - 6,
              background: "transparent",
              border: "none",
              borderRadius: "8px",
              fontFamily: "inherit",
              fontSize: "0.78rem",
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
                layoutId="dock-active-tab-bg"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "var(--surface-2)",
                  borderRadius: "8px",
                  zIndex: 0,
                }}
                transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
            {t.id === "profile" ? (
              <motion.div
                layoutId="dock-avatar"
                transition={iconSpring}
                style={{
                  position: "relative",
                  zIndex: 1,
                  width: AVATAR_PANEL,
                  height: AVATAR_PANEL,
                  borderRadius: "100px",
                  background: "var(--accent)",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                  flexShrink: 0,
                }}
              >
                <motion.span layout="position" style={{ fontSize: "0.58rem", lineHeight: 1 }}>
                  TM
                </motion.span>
              </motion.div>
            ) : (
              <motion.div
                layoutId="dock-bell"
                transition={iconSpring}
                style={{
                  position: "relative",
                  zIndex: 1,
                  width: BELL_PANEL,
                  height: BELL_PANEL,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: active ? "var(--text)" : "var(--text-3)",
                  flexShrink: 0,
                }}
              >
                <Bell size={BELL_PANEL} strokeWidth={2.25} />
              </motion.div>
            )}
            <span style={{ position: "relative", zIndex: 1 }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
