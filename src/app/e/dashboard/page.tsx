"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home, BarChart3, Target, FolderArchive, Flame, Wallet, Globe,
  Sparkles, MessageSquare, AlertTriangle, Settings, HelpCircle,
  ChevronDown, ChevronRight, Search, Bell, LogOut, Plus,
  TrendingUp, ArrowUpRight, Check, X, Circle, Mail, AlertCircle, FileText,
} from "lucide-react";
import type { ModalKey } from "@/lib/types";
import OnyxModal from "@/components/e/OnyxModal";
import { Sparkline } from "@/components/shared/Sparkline";
import { CountUp, formatThousands } from "@/components/shared/CountUp";

const kpis = [
  {
    label: "CA mensuel",
    target: 92400,
    format: (n: number) => formatThousands(n),
    unit: "CHF",
    trend: "+12.0%",
    spark: [62, 64, 70, 68, 72, 78, 80, 82, 86, 88, 92, 92],
    combined: true,
  },
  {
    label: "Marge nette",
    target: 68,
    format: (n: number) => String(Math.round(n)),
    unit: "%",
    trend: "+4 pt",
    spark: [55, 58, 60, 62, 63, 64, 64, 66, 67, 67, 68, 68],
    combined: true,
  },
  {
    label: "Cash-flow",
    target: 18,
    format: (n: number) => "+" + Math.round(n),
    unit: "K",
    trend: "stable",
    spark: [4, 6, 8, 7, 10, 12, 11, 14, 15, 16, 17, 18],
    combined: true,
  },
  {
    label: "Rétention",
    target: 87,
    format: (n: number) => String(Math.round(n)),
    unit: "%",
    trend: "+3 pt",
    spark: [81, 82, 83, 83, 84, 85, 85, 86, 86, 87, 87, 87],
    combined: false,
  },
  {
    label: "Alertes",
    target: 5,
    format: (n: number) => String(Math.round(n)),
    unit: "",
    trend: "3 urg.",
    spark: [2, 2, 3, 3, 4, 4, 4, 5, 5, 5, 5, 5],
    combined: false,
    danger: true,
  },
];

type TileEntry = {
  Icon: typeof Target;
  iconColor: string;
  iconBg: string;
  title: string;
  metric: string;
  unit: string;
  caption: string;
  alert: string;
  alertTone: "warn" | "good" | "neutral" | "danger";
  sources: string[];
  modalKey: ModalKey;
  spark?: number[];
};

const tiles: TileEntry[] = [
  {
    Icon: Target, iconColor: "var(--accent)", iconBg: "var(--accent-tint)",
    title: "Prospection", metric: "18", unit: "%",
    caption: "Taux de conversion · 12 prospects",
    alert: "3 relances dues", alertTone: "warn",
    sources: ["BrokerStar"], modalKey: "prospection",
    spark: [10, 12, 11, 14, 14, 15, 16, 17, 17, 18, 18, 18],
  },
  {
    Icon: FolderArchive, iconColor: "var(--info)", iconBg: "var(--info-tint)",
    title: "Portefeuille", metric: "189", unit: "",
    caption: "Contrats · 85 K CHF de primes",
    alert: "4 renouv. J-30", alertTone: "neutral",
    sources: ["BrokerStar"], modalKey: "portefeuille",
    spark: [182, 183, 184, 184, 185, 186, 186, 187, 188, 188, 189, 189],
  },
  {
    Icon: Flame, iconColor: "var(--danger)", iconBg: "var(--danger-tint)",
    title: "Sinistres", metric: "3", unit: "",
    caption: "Ouverts · ratio 12 % CA",
    alert: "SIN-0047 · 68 j", alertTone: "danger",
    sources: ["BrokerStar"], modalKey: "sinistres",
  },
  {
    Icon: Wallet, iconColor: "var(--warn)", iconBg: "var(--warn-tint)",
    title: "Finance", metric: "+18", unit: "K",
    caption: "Cash-flow net · comm. 11.2 K",
    alert: "2 impayés", alertTone: "warn",
    sources: ["BrokerStar", "Odoo"], modalKey: "finance",
    spark: [4, 6, 8, 7, 10, 12, 11, 14, 15, 16, 17, 18],
  },
  {
    Icon: Globe, iconColor: "var(--accent)", iconBg: "var(--accent-tint)",
    title: "Vue d'ensemble", metric: "68", unit: "%",
    caption: "Marge consolidée · vision combinée",
    alert: "+4 pt vs marché", alertTone: "good",
    sources: ["BrokerStar", "Odoo"], modalKey: "vue360",
    spark: [55, 58, 60, 62, 63, 64, 64, 66, 67, 67, 68, 68],
  },
  {
    Icon: Sparkles, iconColor: "var(--accent)", iconBg: "var(--accent-tint)",
    title: "Agents IA", metric: "3", unit: "",
    caption: "Actions préparées · prêtes à valider",
    alert: "Validation requise", alertTone: "neutral",
    sources: ["BrokerStar", "Odoo"], modalKey: "agents",
  },
];

const agents = [
  {
    Icon: Mail, iconColor: "var(--info)", iconBg: "var(--info-tint)",
    name: "Agent · Renouvellement",
    desc: "4 courriers rédigés — échéances J-28",
    source: "BrokerStar", time: "12 min",
  },
  {
    Icon: AlertCircle, iconColor: "var(--warn)", iconBg: "var(--warn-tint)",
    name: "Agent · Impayé Rossi SA",
    desc: "Relance préparée — 1 800 CHF · 67 jours",
    source: "Odoo", time: "28 min",
  },
  {
    Icon: FileText, iconColor: "var(--accent)", iconBg: "var(--accent-tint)",
    name: "Agent · Rapport direction",
    desc: "Synthèse mensuelle BrokerStar + Odoo prête",
    source: "Combiné", time: "1 h",
    modalKey: "rapport" as ModalKey,
  },
];

export default function DashboardPageE() {
  const router = useRouter();
  const [modalKey, setModalKey] = useState<ModalKey | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const open = (k: ModalKey) => setModalKey(k);
  const close = () => setModalKey(null);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
        display: "flex",
      }}
    >
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            zIndex: 40,
            backdropFilter: "blur(4px)",
          }}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {/* Subtle ambient glow at top */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: -60,
            left: "30%",
            right: "20%",
            height: 240,
            background:
              "radial-gradient(60% 70% at 50% 0%, rgba(129,140,248,0.10), transparent 70%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <TopBar
          onLogout={() => router.push("/")}
          onToggleSidebar={() => setSidebarOpen((o) => !o)}
        />

        <main
          style={{
            flex: 1,
            padding: "clamp(1.5rem, 3vw, 2.25rem) clamp(1.25rem, 2.5vw, 2rem) 3rem",
            position: "relative",
            zIndex: 1,
          }}
        >
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: "1rem",
                flexWrap: "wrap",
                marginBottom: "1.25rem",
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: "clamp(1.5rem, 2.5vw, 1.75rem)",
                    fontWeight: 600,
                    letterSpacing: "-0.025em",
                    color: "var(--text)",
                    margin: 0,
                    marginBottom: "0.2rem",
                  }}
                >
                  Bonjour Thomas
                </h1>
                <p
                  style={{
                    fontSize: "0.86rem",
                    color: "var(--text-3)",
                    margin: 0,
                  }}
                >
                  Mardi 12 mai 2026 · 14:32 CEST
                </p>
              </div>
              <div style={{ display: "flex", gap: "0.4rem" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    fontSize: "0.74rem",
                    fontWeight: 500,
                    color: "var(--text-2)",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    padding: "0.3rem 0.55rem",
                    borderRadius: "100px",
                  }}
                >
                  <Circle size={5} strokeWidth={0} fill="var(--success)" />
                  Sync live
                </span>
              </div>
            </div>

            <div
              className="onyx-kpis"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: "0.7rem",
                marginBottom: "1.5rem",
              }}
            >
              {kpis.map((k, i) => (
                <KPICard key={k.label} kpi={k} delay={i * 60} />
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06, duration: 0.5 }}
            style={{ marginBottom: "1.5rem" }}
          >
            <SectionHeader title="Domaines" count="6" action="Tout voir" />
            <div
              className="onyx-tiles"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "0.75rem",
              }}
            >
              {tiles.map((t) => (
                <TileCard key={t.title} tile={t} onOpen={open} />
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <SectionHeader title="Boîte de réception" count="3" subtitle="Agents IA — actions préparées cette nuit" />
            <AgentInbox onOpen={open} />
          </motion.section>

          <Footer />
        </main>
      </div>

      <OnyxModal open={modalKey !== null} modalKey={modalKey} onClose={close} />

      <style>{`
        @media (max-width: 1280px) {
          .onyx-kpis { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 960px) {
          .onyx-tiles { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 800px) {
          .onyx-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            z-index: 50;
            transform: translateX(-100%);
            transition: transform 0.25s ease;
          }
          .onyx-sidebar.open { transform: translateX(0); }
          .onyx-hamburger { display: inline-flex !important; }
        }
        @media (max-width: 600px) {
          .onyx-kpis { grid-template-columns: repeat(2, 1fr) !important; }
          .onyx-tiles { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const sections = [
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
        { Icon: Target, label: "Prospection", badge: "12", badgeTone: "neutral" as const },
        { Icon: FolderArchive, label: "Portefeuille" },
        { Icon: Flame, label: "Sinistres", badge: "3", badgeTone: "danger" as const },
        { Icon: Wallet, label: "Finance", badge: "2", badgeTone: "warn" as const },
        { Icon: Globe, label: "Vue d'ensemble" },
      ],
    },
    {
      title: "Intelligence",
      items: [
        { Icon: MessageSquare, label: "Chat IA", badge: "3", badgeTone: "warn" as const },
        { Icon: AlertTriangle, label: "Alertes", badge: "5", badgeTone: "danger" as const },
        { Icon: Sparkles, label: "Agents", badge: "3", badgeTone: "neutral" as const },
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

  return (
    <aside
      className={`onyx-sidebar${isOpen ? " open" : ""}`}
      style={{
        width: 244,
        flexShrink: 0,
        background: "var(--sidebar-bg)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "0.85rem 0.75rem 0.5rem", flexShrink: 0 }}>
        <button
          onClick={onClose}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "0.55rem",
            padding: "0.4rem 0.5rem",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "background 0.15s, border-color 0.15s",
            boxShadow: "0 0 0 1px var(--inset-highlight) inset",
          }}
        >
          <span
            style={{
              width: 24,
              height: 24,
              background: "var(--accent)",
              color: "#0B0C0F",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.62rem",
              fontWeight: 700,
              boxShadow: "0 0 0 1px var(--inset-highlight) inset, 0 2px 8px -2px rgba(129,140,248,0.5)",
            }}
          >
            CMA
          </span>
          <div
            style={{
              flex: 1,
              textAlign: "left",
              lineHeight: 1.1,
            }}
          >
            <div
              style={{
                fontSize: "0.84rem",
                fontWeight: 600,
                color: "var(--text)",
                letterSpacing: "-0.005em",
              }}
            >
              Cabinet Müller
            </div>
            <div style={{ fontSize: "0.66rem", color: "var(--text-3)" }}>
              5 courtiers
            </div>
          </div>
          <ChevronDown size={13} strokeWidth={2} color="var(--text-3)" />
        </button>
      </div>

      <div style={{ padding: "0 0.75rem", flexShrink: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.45rem",
            padding: "0.4rem 0.6rem",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            fontSize: "0.8rem",
            color: "var(--text-3)",
            cursor: "text",
          }}
        >
          <Search size={13} strokeWidth={2} />
          <span style={{ flex: 1 }}>Rechercher…</span>
          <kbd
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.66rem",
              padding: "0.05rem 0.3rem",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              color: "var(--text-3)",
            }}
          >
            ⌘K
          </kbd>
        </div>
      </div>

      <nav style={{ flex: 1, overflowY: "auto", padding: "0.65rem 0.75rem 0.65rem" }}>
        {sections.map((section) => (
          <div key={section.title} style={{ marginTop: "1rem" }}>
            <div
              style={{
                padding: "0 0.55rem 0.4rem",
                fontSize: "0.66rem",
                fontWeight: 600,
                color: "var(--text-4)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {section.title}
            </div>
            {section.items.map((item) => (
              <NavItem key={item.label} item={item} />
            ))}
          </div>
        ))}
      </nav>

      <div
        style={{
          padding: "0.6rem 0.75rem",
          borderTop: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: "0.55rem",
        }}
      >
        <span
          style={{
            width: 28,
            height: 28,
            background: "var(--surface-2)",
            color: "var(--text)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.66rem",
            fontWeight: 700,
            flexShrink: 0,
            border: "1px solid var(--border)",
          }}
        >
          TM
        </span>
        <div style={{ flex: 1, minWidth: 0, lineHeight: 1.2 }}>
          <div
            style={{
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "var(--text)",
              letterSpacing: "-0.005em",
            }}
          >
            Thomas Müller
          </div>
          <div
            style={{
              fontSize: "0.68rem",
              color: "var(--text-3)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Associé
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavItem({
  item,
}: {
  item: {
    Icon: typeof Home;
    label: string;
    active?: boolean;
    badge?: string;
    badgeTone?: "neutral" | "warn" | "danger";
  };
}) {
  const { Icon } = item;
  const badgeColor =
    item.badgeTone === "danger"
      ? "var(--danger)"
      : item.badgeTone === "warn"
      ? "var(--warn)"
      : "var(--text-3)";
  return (
    <button
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "0.55rem",
        padding: "0.42rem 0.55rem",
        background: item.active ? "var(--surface)" : "transparent",
        border: item.active ? "1px solid var(--border)" : "1px solid transparent",
        borderRadius: "7px",
        fontFamily: "inherit",
        fontSize: "0.84rem",
        fontWeight: item.active ? 600 : 500,
        color: item.active ? "var(--text)" : "var(--text-2)",
        cursor: "pointer",
        textAlign: "left",
        boxShadow: item.active ? "0 0 0 1px var(--inset-highlight) inset" : "none",
        transition: "background 0.15s, color 0.15s",
      }}
      onMouseEnter={(e) => {
        if (!item.active) {
          e.currentTarget.style.background = "var(--surface)";
          e.currentTarget.style.color = "var(--text)";
        }
      }}
      onMouseLeave={(e) => {
        if (!item.active) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "var(--text-2)";
        }
      }}
    >
      <Icon size={14} strokeWidth={2} color={item.active ? "var(--accent)" : "var(--text-3)"} />
      <span style={{ flex: 1 }}>{item.label}</span>
      {item.badge && (
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.68rem",
            fontWeight: 600,
            color: badgeColor,
            padding: "0.05rem 0.4rem",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "100px",
          }}
        >
          {item.badge}
        </span>
      )}
    </button>
  );
}

function TopBar({
  onLogout,
  onToggleSidebar,
}: {
  onLogout: () => void;
  onToggleSidebar: () => void;
}) {
  return (
    <header
      style={{
        height: 52,
        background: "rgba(11,12,15,0.7)",
        backdropFilter: "saturate(150%) blur(10px)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 clamp(1.25rem, 2.5vw, 2rem)",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
        <button
          onClick={onToggleSidebar}
          aria-label="Menu"
          className="onyx-hamburger"
          style={{
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            width: 30,
            height: 30,
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: "7px",
            color: "var(--text-2)",
            cursor: "pointer",
          }}
        >
          ☰
        </button>
        <span
          style={{
            fontSize: "0.84rem",
            color: "var(--text-3)",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          <span>Espace</span>
          <ChevronRight size={12} strokeWidth={2} />
          <span style={{ color: "var(--text)", fontWeight: 500 }}>Accueil</span>
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <IconBtn label="Notifications" badge="5">
          <Bell size={14} strokeWidth={2} />
        </IconBtn>
        <IconBtn label="Aide">
          <HelpCircle size={14} strokeWidth={2} />
        </IconBtn>
        <button
          onClick={onLogout}
          aria-label="Déconnexion"
          title="Déconnexion"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 30,
            height: 30,
            background: "transparent",
            border: "1px solid transparent",
            borderRadius: "7px",
            color: "var(--text-3)",
            cursor: "pointer",
            transition: "color 0.15s, border-color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--danger)";
            e.currentTarget.style.borderColor = "var(--border)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-3)";
            e.currentTarget.style.borderColor = "transparent";
          }}
        >
          <LogOut size={13} strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}

function IconBtn({
  label,
  badge,
  children,
}: {
  label: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-label={label}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        width: 30,
        height: 30,
        background: "transparent",
        border: "1px solid transparent",
        borderRadius: "7px",
        color: "var(--text-2)",
        cursor: "pointer",
        transition: "background 0.15s, border-color 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--surface)";
        e.currentTarget.style.borderColor = "var(--border)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.borderColor = "transparent";
      }}
    >
      {children}
      {badge && (
        <span
          style={{
            position: "absolute",
            top: 2,
            right: 2,
            minWidth: 13,
            height: 13,
            padding: "0 3px",
            borderRadius: "7px",
            background: "var(--danger)",
            color: "#0B0C0F",
            fontSize: "0.56rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1.5px solid var(--bg)",
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function KPICard({
  kpi,
  delay,
}: {
  kpi: typeof kpis[number];
  delay: number;
}) {
  return (
    <div
      className="onyx-kpi"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "11px",
        padding: "0.9rem 0.95rem",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        boxShadow: "0 0 0 1px var(--inset-highlight) inset",
        transition: "border-color 0.22s, box-shadow 0.22s",
      }}
    >
      <div
        style={{
          fontSize: "0.74rem",
          fontWeight: 500,
          color: "var(--text-3)",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.35rem",
        }}
      >
        {kpi.label}
        {kpi.combined && (
          <span
            style={{
              fontSize: "0.55rem",
              fontWeight: 700,
              color: "var(--accent)",
              background: "var(--accent-tint)",
              padding: "0.05rem 0.3rem",
              borderRadius: "3px",
              letterSpacing: "0.04em",
            }}
          >
            ⊕
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: "0.3rem" }}>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "1.7rem",
            fontWeight: 500,
            letterSpacing: "-0.03em",
            color: kpi.danger ? "var(--danger)" : "var(--text)",
            lineHeight: 0.95,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <CountUp value={kpi.target} format={kpi.format} duration={900} delay={delay} />
        </span>
        {kpi.unit && (
          <span style={{ fontSize: "0.74rem", fontWeight: 500, color: "var(--text-3)" }}>
            {kpi.unit}
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.2rem",
            fontSize: "0.7rem",
            fontWeight: 600,
            color: kpi.danger ? "var(--danger)" : "var(--success)",
          }}
        >
          <TrendingUp size={10} strokeWidth={2.5} />
          {kpi.trend}
        </span>
        <span style={{ flex: 1, marginLeft: "0.3rem" }}>
          <Sparkline
            data={kpi.spark}
            width={110}
            height={20}
            stroke={kpi.danger ? "var(--danger)" : "var(--accent)"}
            strokeWidth={1.5}
          />
        </span>
      </div>

      <style>{`
        .onyx-kpi:hover {
          border-color: var(--border-strong);
          box-shadow: 0 0 0 1px var(--inset-highlight) inset, 0 0 0 4px var(--accent-tint), 0 8px 32px -16px rgba(129,140,248,0.18);
        }
      `}</style>
    </div>
  );
}

function SectionHeader({
  title,
  count,
  subtitle,
  action,
}: {
  title: string;
  count?: string;
  subtitle?: string;
  action?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: "1rem",
        marginBottom: "0.7rem",
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: "0.6rem" }}>
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: 600,
            color: "var(--text)",
            letterSpacing: "-0.015em",
            margin: 0,
          }}
        >
          {title}
        </h2>
        {count && (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.72rem",
              fontWeight: 600,
              color: "var(--text-3)",
              padding: "0.08rem 0.4rem",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "100px",
            }}
          >
            {count}
          </span>
        )}
        {subtitle && (
          <span style={{ fontSize: "0.8rem", color: "var(--text-3)" }}>
            {subtitle}
          </span>
        )}
      </div>
      {action && (
        <button
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.25rem",
            fontFamily: "inherit",
            background: "transparent",
            border: "none",
            color: "var(--accent)",
            fontSize: "0.8rem",
            fontWeight: 600,
            cursor: "pointer",
            padding: 0,
          }}
        >
          {action}
          <ArrowUpRight size={12} strokeWidth={2.25} />
        </button>
      )}
    </div>
  );
}

function TileCard({
  tile,
  onOpen,
}: {
  tile: TileEntry;
  onOpen: (k: ModalKey) => void;
}) {
  const { Icon } = tile;
  const alertColor =
    tile.alertTone === "warn"
      ? "var(--warn)"
      : tile.alertTone === "good"
      ? "var(--success)"
      : tile.alertTone === "danger"
      ? "var(--danger)"
      : "var(--text-3)";
  return (
    <button
      onClick={() => onOpen(tile.modalKey)}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "11px",
        padding: "0.95rem 1rem 0.85rem",
        textAlign: "left",
        fontFamily: "inherit",
        color: "inherit",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: "0.7rem",
        boxShadow: "0 0 0 1px var(--inset-highlight) inset",
        transition: "border-color 0.22s, box-shadow 0.22s, transform 0.18s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--border-strong)";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow =
          "0 0 0 1px var(--inset-highlight) inset, 0 12px 32px -16px rgba(129,140,248,0.22)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 0 0 1px var(--inset-highlight) inset";
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span
            style={{
              width: 26,
              height: 26,
              background: tile.iconBg,
              color: tile.iconColor,
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon size={13} strokeWidth={2} />
          </span>
          <span
            style={{
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "var(--text)",
              letterSpacing: "-0.01em",
            }}
          >
            {tile.title}
          </span>
        </div>
        <ArrowUpRight size={13} strokeWidth={2.25} color="var(--text-4)" />
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: "0.7rem" }}>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "1.7rem",
            fontWeight: 500,
            letterSpacing: "-0.03em",
            color: "var(--text)",
            lineHeight: 0.95,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {tile.metric}
          {tile.unit && (
            <span
              style={{
                fontSize: "0.55em",
                color: "var(--text-3)",
                marginLeft: "0.1rem",
                letterSpacing: 0,
              }}
            >
              {tile.unit}
            </span>
          )}
        </span>
        {tile.spark && (
          <div style={{ flex: 1, marginBottom: "0.2rem", opacity: 0.85 }}>
            <Sparkline
              data={tile.spark}
              width={130}
              height={20}
              stroke={tile.iconColor}
              strokeWidth={1.4}
            />
          </div>
        )}
      </div>

      <div
        style={{
          fontSize: "0.78rem",
          color: "var(--text-3)",
          lineHeight: 1.4,
          minHeight: "1.1rem",
        }}
      >
        {tile.caption}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          paddingTop: "0.5rem",
          borderTop: "1px solid var(--border)",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
            fontSize: "0.7rem",
            fontWeight: 600,
            color: alertColor,
          }}
        >
          <Circle size={5} strokeWidth={0} fill="currentColor" />
          {tile.alert}
        </span>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: "0.66rem", color: "var(--text-4)", fontWeight: 500 }}>
          {tile.sources.join(" · ")}
        </span>
      </div>
    </button>
  );
}

function AgentInbox({ onOpen }: { onOpen: (k: ModalKey) => void }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "11px",
        overflow: "hidden",
        boxShadow: "0 0 0 1px var(--inset-highlight) inset",
      }}
    >
      <div
        style={{
          padding: "0.5rem 1rem",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface-2)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "0.5rem",
          fontFamily: "var(--font-mono)",
          fontSize: "0.7rem",
          color: "var(--text-3)",
          letterSpacing: "0.02em",
        }}
      >
        <span>Agent</span>
        <button
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
            padding: "0.2rem 0.55rem",
            fontFamily: "var(--font-sans)",
            fontSize: "0.74rem",
            fontWeight: 500,
            color: "var(--text-2)",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          <Plus size={11} strokeWidth={2.25} />
          Nouvelle action
        </button>
      </div>
      {agents.map((a, i) => (
        <AgentRow
          key={a.name}
          agent={a}
          isLast={i === agents.length - 1}
          onOpen={a.modalKey ? () => onOpen(a.modalKey!) : undefined}
        />
      ))}
    </div>
  );
}

function AgentRow({
  agent,
  isLast,
  onOpen,
}: {
  agent: {
    Icon: typeof Mail;
    iconColor: string;
    iconBg: string;
    name: string;
    desc: string;
    source: string;
    time: string;
  };
  isLast: boolean;
  onOpen?: () => void;
}) {
  const [done, setDone] = useState<"none" | "validated" | "dismissed">("none");
  const { Icon } = agent;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        gap: "0.85rem",
        alignItems: "center",
        padding: "0.8rem 1rem",
        borderBottom: isLast ? "none" : "1px solid var(--border)",
        opacity: done !== "none" ? 0.4 : 1,
        transition: "opacity 0.25s",
      }}
    >
      <span
        style={{
          width: 30,
          height: 30,
          background: agent.iconBg,
          color: agent.iconColor,
          borderRadius: "7px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={14} strokeWidth={2} />
      </span>
      <div>
        <div
          style={{
            fontSize: "0.88rem",
            fontWeight: 600,
            color: "var(--text)",
            letterSpacing: "-0.005em",
          }}
        >
          {agent.name}
        </div>
        <div
          style={{
            fontSize: "0.76rem",
            color: "var(--text-3)",
            marginTop: "0.1rem",
          }}
        >
          {agent.desc} <span style={{ color: "var(--text-4)" }}>· {agent.source} · {agent.time}</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: "0.35rem" }}>
        <button
          onClick={() => {
            setDone("validated");
            onOpen?.();
          }}
          disabled={done !== "none"}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.25rem",
            padding: "0.4rem 0.7rem",
            background: done === "none" ? "var(--accent)" : "transparent",
            color: done === "none" ? "#0B0C0F" : "var(--text-3)",
            border: `1px solid ${done === "none" ? "var(--accent)" : "var(--border)"}`,
            borderRadius: "7px",
            fontFamily: "inherit",
            fontSize: "0.76rem",
            fontWeight: 600,
            cursor: done === "none" ? "pointer" : "default",
            transition: "background 0.15s, box-shadow 0.15s",
            boxShadow: done === "none" ? "0 0 0 0 var(--accent-tint), 0 4px 12px -4px rgba(129,140,248,0.32)" : "none",
          }}
        >
          {done === "validated" && <Check size={11} strokeWidth={2.5} />}
          {done === "validated" ? "Fait" : onOpen ? "Ouvrir" : "Valider"}
        </button>
        <button
          onClick={() => setDone("dismissed")}
          disabled={done !== "none"}
          aria-label="Ignorer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 30,
            padding: "0.4rem",
            background: "var(--surface-2)",
            color: "var(--text-3)",
            border: "1px solid var(--border)",
            borderRadius: "7px",
            cursor: done === "none" ? "pointer" : "default",
          }}
        >
          <X size={11} strokeWidth={2.25} />
        </button>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer
      style={{
        marginTop: "2rem",
        paddingTop: "1.25rem",
        borderTop: "1px solid var(--border)",
        display: "flex",
        justifyContent: "space-between",
        gap: "1rem",
        fontFamily: "var(--font-mono)",
        fontSize: "0.7rem",
        color: "var(--text-3)",
        flexWrap: "wrap",
      }}
    >
      <span>cabinet müller &amp; associés sa · zürich</span>
      <span>sync brokerstar 3m · odoo 5m</span>
      <span>lpd art.16 · infomaniak ch</span>
    </footer>
  );
}
