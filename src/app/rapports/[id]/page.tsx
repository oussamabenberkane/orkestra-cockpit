"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BarChart3, Clock, Circle } from "lucide-react";
import Link from "next/link";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { FloatingDock } from "@/components/dashboard/FloatingDock";

const SIDEBAR_KEY = "orkestra.sidebar.collapsed";

export default function RapportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem(SIDEBAR_KEY);
      if (s === "true") setCollapsed(true);
    } catch {}
    setHydrated(true);
  }, []);

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem(SIDEBAR_KEY, String(next)); } catch {}
      return next;
    });
  };

  const title = id
    ? id.split("-").slice(1).join(" ").replace(/(^\w|\s\w)/g, (m) => m.toUpperCase())
    : "Rapport";

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)", color: "var(--text)",
      display: "flex", visibility: hydrated ? "visible" : "hidden",
    }}>
      <Sidebar
        collapsed={collapsed}
        onToggle={toggleSidebar}
        onLogout={async () => { const { supabase } = await import("@/lib/supabase"); await supabase.auth.signOut(); router.replace("/login"); }}
        onOpenPalette={() => {}}
      />

      <main className="app-main" style={{
        flex: 1, minWidth: 0,
        padding: "clamp(2rem, 4vw, 3rem) clamp(1.5rem, 3vw, 2.5rem) 4rem",
        maxWidth: "900px", marginInline: "auto", width: "100%",
      }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            href="/rapports"
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.4rem",
              fontSize: "0.82rem", fontWeight: 500, color: "var(--text-3)",
              textDecoration: "none", marginBottom: "1.5rem",
              transition: "color 0.18s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-3)")}
          >
            <ArrowLeft size={14} strokeWidth={2} />
            Retour aux rapports
          </Link>

          <div style={{
            background: "var(--surface)", borderRadius: "16px",
            padding: "2rem 2rem 2.5rem", boxShadow: "var(--tier-2)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "1rem" }}>
              <span style={{
                width: 36, height: 36,
                background: "var(--accent-tint)", color: "var(--accent)",
                borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
              }}>
                <BarChart3 size={18} strokeWidth={2} />
              </span>
              <div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
                  Rapport
                </div>
                <h1 style={{
                  fontSize: "1.35rem", fontWeight: 600, letterSpacing: "-0.02em",
                  color: "var(--text)", margin: 0,
                }}>
                  {title}
                </h1>
              </div>
            </div>

            <div style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              fontSize: "0.78rem", color: "var(--text-4)", marginBottom: "2rem",
            }}>
              <Clock size={12} strokeWidth={2} />
              Dernière mise à jour : 15 mai 2026
              <Circle size={3} strokeWidth={0} fill="currentColor" style={{ margin: "0 0.15rem" }} />
              <span style={{ color: "var(--accent)", fontWeight: 600 }}>ID : {id}</span>
            </div>

            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              padding: "3rem 1rem", textAlign: "center", gap: "0.5rem",
              background: "var(--surface-2)", borderRadius: "12px",
              border: "1px dashed var(--border-strong)",
            }}>
              <div style={{ fontSize: "0.92rem", color: "var(--text-3)", lineHeight: 1.6 }}>
                Le contenu détaillé de ce rapport sera disponible<br />
                une fois les titres validés par l&apos;administrateur.
              </div>
              <div style={{
                marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--text-4)",
                fontFamily: "var(--font-mono)",
              }}>
                Rapport ID: {id}
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <FloatingDock />
    </div>
  );
}
