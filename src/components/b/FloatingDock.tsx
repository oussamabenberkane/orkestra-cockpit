"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

const PILL_W = 92;
const PILL_H = 48;
const PANEL_W = 420;
const PANEL_H = 420;
const TAB_BAR_H = 52;

// Pill geometry — geometric centers of each half
const PILL_HALF_CX_LEFT = PILL_W / 4; // 23
const PILL_HALF_CX_RIGHT = (PILL_W * 3) / 4; // 69
const PILL_CY = PILL_H / 2; // 24

// Icon sizes
const AVATAR_PILL = 22;
const AVATAR_PANEL = 18;
const BELL_PILL = 16;
const BELL_PANEL = 16;

// Tab bar geometry
const TAB_BAR_CY = TAB_BAR_H / 2; // 26
const TAB_BAR_PAD_X = 14;

// Panel tab order: Profile LEFT, Notifications RIGHT
const AVATAR_PANEL_CX = TAB_BAR_PAD_X + AVATAR_PANEL / 2; // 23
const BELL_PANEL_CX = PANEL_W / 2 + TAB_BAR_PAD_X + BELL_PANEL / 2; // 234

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

  // Pill icon positions — TM on left half, Bell on right half (matches tab order)
  // For left-anchored, mirror.
  const avatarPillCX = isLeft ? PILL_HALF_CX_RIGHT : PILL_HALF_CX_LEFT;
  const bellPillCX = isLeft ? PILL_HALF_CX_LEFT : PILL_HALF_CX_RIGHT;

  // Top-left of each icon container (centers minus half size)
  const avatarPillX = avatarPillCX - AVATAR_PILL / 2; // 12 (right-anchored)
  const avatarPillY = PILL_CY - AVATAR_PILL / 2; // 13
  const bellPillX = bellPillCX - BELL_PILL / 2; // 61
  const bellPillY = PILL_CY - BELL_PILL / 2; // 16

  // Panel icon positions (independent of anchor — panel content layout is fixed)
  const avatarPanelX = AVATAR_PANEL_CX - AVATAR_PANEL / 2; // 14
  const avatarPanelY = TAB_BAR_CY - AVATAR_PANEL / 2; // 17
  const bellPanelX = BELL_PANEL_CX - BELL_PANEL / 2; // 226
  const bellPanelY = TAB_BAR_CY - BELL_PANEL / 2; // 18

  const dockSpring = {
    type: "spring" as const,
    stiffness: 280,
    damping: 26,
    mass: 1,
  };

  return (
    <>
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
        layout={false}
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
        {/* Pill click-targets — invisible buttons that sit over the persistent icons */}
        <button
          type="button"
          onClick={() => openTab("profile")}
          aria-label="Profil"
          aria-expanded={open && tab === "profile"}
          className="dock-pill-btn"
          style={{
            position: "absolute",
            left: isLeft ? PILL_W / 2 - 2 : 6,
            top: 6,
            width: PILL_W / 2 - 4,
            height: PILL_H - 12,
            background: "transparent",
            border: "none",
            borderRadius: 100,
            cursor: open ? "default" : "pointer",
            padding: 0,
            opacity: open ? 0 : 1,
            pointerEvents: open ? "none" : "auto",
            transition: "background 0.15s, opacity 0.18s",
          }}
        />
        <button
          type="button"
          onClick={() => openTab("notif")}
          aria-label="Notifications"
          aria-expanded={open && tab === "notif"}
          className="dock-pill-btn"
          style={{
            position: "absolute",
            left: isLeft ? 6 : PILL_W / 2 - 2,
            top: 6,
            width: PILL_W / 2 - 4,
            height: PILL_H - 12,
            background: "transparent",
            border: "none",
            borderRadius: 100,
            cursor: open ? "default" : "pointer",
            padding: 0,
            opacity: open ? 0 : 1,
            pointerEvents: open ? "none" : "auto",
            transition: "background 0.15s, opacity 0.18s",
          }}
        />

        {/* TM avatar — persistent, morphs pill ↔ tab */}
        <motion.div
          animate={{
            x: open ? avatarPanelX - avatarPillX : 0,
            y: open ? avatarPanelY - avatarPillY : 0,
          }}
          transition={dockSpring}
          style={{
            position: "absolute",
            left: avatarPillX,
            top: avatarPillY,
            width: AVATAR_PILL,
            height: AVATAR_PILL,
            pointerEvents: "none",
            zIndex: 2,
          }}
        >
          <motion.div
            animate={{ scale: open ? AVATAR_PANEL / AVATAR_PILL : 1 }}
            transition={dockSpring}
            style={{
              width: AVATAR_PILL,
              height: AVATAR_PILL,
              borderRadius: "100px",
              background: "var(--accent)",
              color: "#FFFFFF",
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.02em",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transformOrigin: "top left",
            }}
          >
            {initials}
          </motion.div>
        </motion.div>

        {/* Bell — persistent, morphs pill ↔ tab */}
        <motion.div
          animate={{
            x: open ? bellPanelX - bellPillX : 0,
            y: open ? bellPanelY - bellPillY : 0,
          }}
          transition={dockSpring}
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
                top: -4,
                right: -6,
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

        {/* Panel content */}
        <AnimatePresence>
          {open && (
            <motion.div
              key="panel"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: {
                  delay: 0.18,
                  duration: 0.18,
                  ease: [0.22, 1, 0.36, 1],
                },
              }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <DockTabBar tab={tab} onChange={setTab} notifCount={notifCount} />
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
        </AnimatePresence>
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
    { id: "profile", label: "Profil" },
    { id: "notif", label: "Notifications", badge: notifCount },
  ];

  return (
    <div
      style={{
        height: TAB_BAR_H,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        alignItems: "center",
        padding: "0.4rem 0.45rem 0.4rem",
        borderBottom: "1px solid var(--border)",
        flexShrink: 0,
        gap: "0.25rem",
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
              gap: "0.45rem",
              padding: "0.4rem 0.55rem 0.4rem 1.95rem",
              height: TAB_BAR_H - 8,
              background: "transparent",
              border: "none",
              borderRadius: "8px",
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
            <span style={{ position: "relative", zIndex: 1 }}>{t.label}</span>
            {t.badge !== undefined && t.badge > 0 && (
              <span
                style={{
                  position: "relative",
                  zIndex: 1,
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
          </button>
        );
      })}
    </div>
  );
}
