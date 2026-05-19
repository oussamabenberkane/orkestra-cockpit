"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ModalKey } from "@/lib/types";
import { Sidebar } from "@/components/dashboard/Sidebar";
import DashboardModal from "@/components/dashboard/DashboardModal";
import { CommandPalette } from "@/components/shared/CommandPalette";
import { supabase } from "@/lib/supabase";

const SIDEBAR_KEY = "orkestra.sidebar.collapsed";

interface AppShellProps {
  children: React.ReactNode;
  /** Override the default <main> styling — for pages that need a different max-width or padding. */
  mainStyle?: React.CSSProperties;
}

/**
 * Shared chrome wrapper for every in-app page:
 *  - Persisted, collapsible left Sidebar with category-coloured icons.
 *  - Global command palette (⌘K).
 *  - Global DashboardModal driven by ModalKey state — opens from sidebar Métier
 *    items, command palette, and any child component that calls the surface
 *    via context-less mounting (pages render their own tile grids that pass an
 *    onOpen handler down).
 *
 * Pages that need the dashboard modal trigger inside their own content can
 * call the `useDashboardModal` hook (TODO) — for now they pass a callback
 * back up via a render-prop pattern or duplicate the modal state. Most pages
 * just need the shell + chrome and don't trigger modals themselves; this
 * shell covers the sidebar/palette case end-to-end.
 */
export function AppShell({ children, mainStyle }: AppShellProps) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [modalKey, setModalKey] = useState<ModalKey | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number | undefined>(undefined);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_KEY);
      if (stored === "true") setCollapsed(true);
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    void supabase
      .from("alertes")
      .select("*", { count: "exact", head: true })
      .eq("lu", false)
      .then(({ count }) => { if (count !== null) setUnreadCount(count); });
  }, []);

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem(SIDEBAR_KEY, String(next)); } catch {}
      return next;
    });
  };

  const openModal = (key: ModalKey) => setModalKey(key);
  const closeModal = () => setModalKey(null);
  /** Smart CTA defaults — modals with a related route navigate; others just close. */
  const handleModalAction = (key: ModalKey) => {
    if (key === "rapport" || key === "vue360") router.push("/rapports");
  };
  // Use replace so the back stack doesn't preserve the protected page.
  const onLogout = () => router.replace("/login");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
        display: "flex",
        visibility: hydrated ? "visible" : "hidden",
      }}
    >
      <Sidebar
        collapsed={collapsed}
        onToggle={toggleSidebar}
        onLogout={onLogout}
        onOpenPalette={() => setPaletteOpen(true)}
        onOpenModal={openModal}
        serverUnreadCount={unreadCount}
      />

      <main
        className="app-main"
        style={{
          flex: 1,
          minWidth: 0,
          padding: "clamp(1.75rem, 3vw, 2.5rem) clamp(1.25rem, 3vw, 2.5rem) 3rem",
          maxWidth: "1240px",
          marginInline: "auto",
          width: "100%",
          ...mainStyle,
        }}
      >
        {children}
      </main>

      <DashboardModal
        open={modalKey !== null}
        modalKey={modalKey}
        onClose={closeModal}
        onAction={handleModalAction}
      />

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onOpenModal={openModal}
        onLogout={onLogout}
      />
    </div>
  );
}
