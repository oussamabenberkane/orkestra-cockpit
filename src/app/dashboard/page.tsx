"use client";

import { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import Sidebar from "@/components/dashboard/Sidebar";
import KPIRow from "@/components/dashboard/KPIRow";
import CombinedBanner from "@/components/dashboard/CombinedBanner";
import TilesGrid from "@/components/dashboard/TilesGrid";
import AgentsSection from "@/components/dashboard/AgentsSection";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import DashboardModal from "@/components/dashboard/DashboardModal";
import SettingsModal from "@/components/dashboard/SettingsModal";
import type { ModalKey } from "@/lib/types";

export default function DashboardPage() {
  const [modalKey, setModalKey] = useState<ModalKey | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openModal = (key: ModalKey) => setModalKey(key);
  const closeModal = () => setModalKey(null);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <DashboardHeader
        onOpenSettings={() => setSettingsOpen(true)}
        onToggleSidebar={() => setSidebarOpen((o) => !o)}
      />

      <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              zIndex: 40,
              backdropFilter: "blur(2px)",
            }}
          />
        )}

        <Sidebar
          onOpenSettings={() => setSettingsOpen(true)}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main
          className="dashboard-main-padding"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1.25rem 1.5rem",
            background: "#F4F6FB",
          }}
        >
          {/* Page header */}
          <div className="page-header-row">
            <div>
              <h1
                style={{
                  fontSize: "1.3rem",
                  fontWeight: 800,
                  color: "#1E2761",
                  letterSpacing: "-0.3px",
                }}
              >
                Bonjour Thomas 👋 — Vue globale
              </h1>
              <p style={{ fontSize: "0.78rem", color: "#6B7280", marginTop: "2px" }}>
                Données consolidées en temps réel — BrokerStar + Odoo
              </p>
            </div>
            <div className="source-pills-row">
              <span
                style={{
                  background: "#EFF6FF",
                  color: "#2563EB",
                  border: "1px solid #BFDBFE",
                  borderRadius: "20px",
                  padding: "0.25rem 0.65rem",
                  fontSize: "0.68rem",
                  fontWeight: 600,
                }}
              >
                ● BrokerStar
              </span>
              <span
                style={{
                  background: "#F5F3FF",
                  color: "#7C3AED",
                  border: "1px solid #DDD6FE",
                  borderRadius: "20px",
                  padding: "0.25rem 0.65rem",
                  fontSize: "0.68rem",
                  fontWeight: 600,
                }}
              >
                ● Odoo
              </span>
              <span
                style={{
                  background: "#ECFDF5",
                  color: "#10B981",
                  border: "1px solid #A7F3D0",
                  borderRadius: "20px",
                  padding: "0.25rem 0.65rem",
                  fontSize: "0.68rem",
                  fontWeight: 600,
                }}
              >
                ⊕ Combiné
              </span>
            </div>
          </div>

          <KPIRow />
          <CombinedBanner />
          <TilesGrid onOpenModal={openModal} />
          <AgentsSection onOpenModal={openModal} />
        </main>
      </div>

      <DashboardFooter />

      <DashboardModal
        open={modalKey !== null}
        modalKey={modalKey}
        onClose={closeModal}
      />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
