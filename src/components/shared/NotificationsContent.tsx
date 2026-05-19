"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, ArrowRight } from "lucide-react";
import { useNotifications } from "@/components/dashboard/NotificationsProvider";

export function NotificationsContent({
  onClose,
  bare = false,
}: {
  onClose?: () => void;
  bare?: boolean;
}) {
  const router = useRouter();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const unread = notifications.filter((n) => !n.archived);

  const handleViewAll = () => {
    onClose?.();
    router.push("/alertes");
  };

  const inner = (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.55rem 0.65rem 0.45rem",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <span
            style={{
              fontSize: "0.65rem",
              fontWeight: 700,
              color: "var(--text-2)",
              letterSpacing: "0.04em",
            }}
          >
            Notifications
          </span>
          {unreadCount > 0 && (
            <span
              style={{
                fontSize: "0.52rem",
                fontWeight: 700,
                color: "var(--danger)",
                background: "var(--danger-tint)",
                padding: "0.08rem 0.35rem",
                borderRadius: "100px",
                lineHeight: 1.4,
              }}
            >
              {unreadCount}
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.2rem",
              fontSize: "0.58rem",
              fontWeight: 600,
              color: "var(--text-3)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "0.2rem 0.3rem",
              borderRadius: "5px",
              fontFamily: "inherit",
              transition: "color 0.15s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-3)"; }}
          >
            <Check size={9} strokeWidth={2.5} />
            Tout marquer lu
          </button>
        )}
      </div>

      {/* ── Divider ── */}
      <div
        style={{
          height: 1,
          background: "var(--border)",
          flexShrink: 0,
        }}
      />

      {/* ── List ── */}
      <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        <AnimatePresence initial={false}>
          {unread.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                padding: "2rem 1rem",
                color: "var(--text-4)",
                textAlign: "center",
              }}
            >
              <Bell size={20} strokeWidth={1.5} />
              <span style={{ fontSize: "0.62rem", fontWeight: 500 }}>
                Aucune notification
              </span>
            </motion.div>
          ) : (
            unread.map((n, i) => {
              const Icon = n.Icon;
              return (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: "hidden" }}
                  transition={{
                    layout: { duration: 0.2 },
                    duration: 0.2,
                    delay: i * 0.03,
                  }}
                  style={{
                    position: "relative",
                    display: "grid",
                    gridTemplateColumns: "auto 1fr auto",
                    gap: "0.55rem",
                    alignItems: "flex-start",
                    padding: "0.6rem 0.65rem",
                    borderBottom: i < unread.length - 1 ? "1px solid var(--border)" : "none",
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = "var(--surface-2)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = "transparent";
                  }}
                >
                  {/* Icon bubble */}
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      background: n.iconBg,
                      color: n.iconColor,
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    <Icon size={11} strokeWidth={2} />
                  </span>

                  {/* Text */}
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "0.66rem",
                        fontWeight: 600,
                        color: "var(--text)",
                        lineHeight: 1.25,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        letterSpacing: "-0.005em",
                      }}
                    >
                      {n.title}
                    </div>
                    <div
                      style={{
                        fontSize: "0.58rem",
                        color: "var(--text-3)",
                        lineHeight: 1.35,
                        marginTop: "0.08rem",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {n.desc}
                    </div>
                    <div style={{ fontSize: "0.54rem", color: "var(--text-4)", marginTop: "0.12rem" }}>
                      {n.time}
                    </div>
                  </div>

                  {/* Mark as read */}
                  <button
                    onClick={() => markAsRead(n.id)}
                    title="Marquer comme lu"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 20,
                      height: 20,
                      borderRadius: "5px",
                      background: "transparent",
                      border: "none",
                      color: "var(--text-4)",
                      cursor: "pointer",
                      flexShrink: 0,
                      marginTop: 1,
                      transition: "background 0.15s, color 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--success-tint)";
                      e.currentTarget.style.color = "var(--success)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "var(--text-4)";
                    }}
                  >
                    <Check size={11} strokeWidth={2.5} />
                  </button>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* ── Footer ── */}
      <div
        style={{
          padding: "0.45rem 0.65rem",
          borderTop: "1px solid var(--border)",
          background: "var(--surface-2)",
          display: "flex",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <button
          onClick={handleViewAll}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.25rem",
            fontFamily: "inherit",
            fontSize: "0.62rem",
            fontWeight: 600,
            color: "var(--accent)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "0.2rem 0.4rem",
            borderRadius: "5px",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.75"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >
          Voir toutes les alertes
          <ArrowRight size={10} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );

  if (bare) return inner;

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        boxShadow: "0 24px 60px -16px rgba(15,23,42,0.18), 0 8px 20px -8px rgba(15,23,42,0.08)",
        overflow: "hidden",
        width: "360px",
        maxWidth: "calc(100vw - 2rem)",
      }}
    >
      {inner}
    </div>
  );
}
