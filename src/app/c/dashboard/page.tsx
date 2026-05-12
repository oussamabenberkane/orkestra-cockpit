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
import AtriumModal from "@/components/c/AtriumModal";
import { Sparkline } from "@/components/shared/Sparkline";

const kpis = [
  {
    label: "CA mensuel",
    value: "92 400",
    unit: "CHF",
    trend: "+12%",
    spark: [62, 64, 70, 68, 72, 78, 80, 82, 86, 88, 92, 92],
    combined: true,
  },
  {
    label: "Rétention",
    value: "87",
    unit: "%",
    trend: "+3 pt",
    spark: [81, 82, 83, 83, 84, 85, 85, 86, 86, 87, 87, 87],
    combined: false,
  },
  {
    label: "Contrats actifs",
    value: "189",
    unit: "",
    trend: "+4 J-30",
    spark: [182, 183, 184, 184, 185, 186, 186, 187, 188, 188, 189, 189],
    combined: false,
  },
  {
    label: "Marge nette",
    value: "68",
    unit: "%",
    trend: "+4 pt",
    spark: [55, 58, 60, 62, 63, 64, 64, 66, 67, 67, 68, 68],
    combined: true,
  },
  {
    label: "Alertes",
    value: "5",
    unit: "",
    trend: "3 urgentes",
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
};

const tiles: TileEntry[] = [
  {
    Icon: Target, iconColor: "var(--accent)", iconBg: "var(--accent-tint)",
    title: "Prospection", metric: "18", unit: "%",
    caption: "Taux de conversion · 12 prospects",
    alert: "3 relances dues", alertTone: "warn",
    sources: ["BrokerStar"], modalKey: "prospection",
  },
  {
    Icon: FolderArchive, iconColor: "var(--info)", iconBg: "var(--info-tint)",
    title: "Portefeuille", metric: "189", unit: "",
    caption: "Contrats · 85 K CHF de primes",
    alert: "4 renouv. J-30", alertTone: "neutral",
    sources: ["BrokerStar"], modalKey: "portefeuille",
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
    alert: "2 impayés · 3 200 CHF", alertTone: "warn",
    sources: ["BrokerStar", "Odoo"], modalKey: "finance",
  },
  {
    Icon: Globe, iconColor: "var(--accent)", iconBg: "var(--accent-tint)",
    title: "Vue d'ensemble", metric: "68", unit: "%",
    caption: "Marge consolidée · vision combinée",
    alert: "+4 pt vs marché CH", alertTone: "good",
    sources: ["BrokerStar", "Odoo"], modalKey: "vue360",
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
    source: "BrokerStar",
    time: "il y a 12 min",
  },
  {
    Icon: AlertCircle, iconColor: "var(--warn)", iconBg: "var(--warn-tint)",
    name: "Agent · Impayé Rossi SA",
    desc: "Relance préparée — 1 800 CHF, 67 jours",
    source: "Odoo",
    time: "il y a 28 min",
  },
  {
    Icon: FileText, iconColor: "var(--accent)", iconBg: "var(--accent-tint)",
    name: "Agent · Rapport direction",
    desc: "Synthèse mensuelle BrokerStar + Odoo prête",
    source: "Combiné",
    time: "il y a 1 h",
    modalKey: "rapport" as ModalKey,
  },
];

export default function DashboardPageC() {
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
            background: "rgba(10,10,10,0.4)",
            zIndex: 40,
            backdropFilter: "blur(2px)",
          }}
          className="atrium-backdrop"
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <TopBar
          onLogout={() => router.push("/")}
          onToggleSidebar={() => setSidebarOpen((o) => !o)}
        />

        <main
          style={{
            flex: 1,
            padding: "clamp(1.25rem, 2.5vw, 2rem) clamp(1.25rem, 2.5vw, 2rem) 3rem",
          }}
        >
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
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
                    fontSize: "1.5rem",
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
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
                  Mardi 12 mai 2026 · 14:32 CEST · 5 courtiers
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
                    borderRadius: "6px",
                  }}
                >
                  <Circle size={5} strokeWidth={0} fill="var(--info)" />
                  BrokerStar · 3 min
                </span>
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
                    borderRadius: "6px",
                  }}
                >
                  <Circle size={5} strokeWidth={0} fill="#7C3AED" />
                  Odoo · 5 min
                </span>
              </div>
            </div>

            <div
              className="atrium-kpis"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                overflow: "hidden",
                marginBottom: "1.5rem",
              }}
            >
              {kpis.map((k, i) => (
                <KPICell key={k.label} kpi={k} isLast={i === kpis.length - 1} />
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.45 }}
            style={{ marginBottom: "1.5rem" }}
          >
            <SectionHeader
              title="Domaines"
              count="6"
              action="Voir tous"
            />
            <div
              className="atrium-tiles"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "0.65rem",
              }}
            >
              {tiles.map((t) => (
                <TileCard key={t.title} tile={t} onOpen={open} />
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.45 }}
          >
            <SectionHeader
              title="Boîte de réception"
              count="3"
              subtitle="Agents IA — actions préparées cette nuit"
            />
            <AgentInbox onOpen={open} />
          </motion.section>

          <Footer />
        </main>
      </div>

      <AtriumModal open={modalKey !== null} modalKey={modalKey} onClose={close} />

      <style>{`
        @media (max-width: 1280px) {
          .atrium-kpis { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 960px) {
          .atrium-tiles { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 800px) {
          .atrium-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            z-index: 50;
            transform: translateX(-100%);
            transition: transform 0.25s ease;
          }
          .atrium-sidebar.open { transform: translateX(0); box-shadow: 4px 0 24px rgba(10,10,10,0.18); }
          .atrium-hamburger { display: inline-flex !important; }
        }
        @media (max-width: 600px) {
          .atrium-kpis { grid-template-columns: repeat(2, 1fr) !important; }
          .atrium-tiles { grid-template-columns: 1fr !important; }
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
      className={`atrium-sidebar${isOpen ? " open" : ""}`}
      style={{
        width: 248,
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
      {/* Workspace */}
      <div style={{ padding: "0.85rem 0.75rem 0.5rem", flexShrink: 0 }}>
        <button
          onClick={onClose}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.35rem 0.45rem",
            background: "transparent",
            border: "1px solid transparent",
            borderRadius: "6px",
            cursor: "pointer",
            fontFamily: "inherit",
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
          <span
            style={{
              width: 22,
              height: 22,
              background: "var(--text)",
              color: "var(--surface)",
              borderRadius: "5px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.6rem",
              fontWeight: 700,
            }}
          >
            CMA
          </span>
          <span
            style={{
              flex: 1,
              textAlign: "left",
              fontSize: "0.82rem",
              fontWeight: 600,
              color: "var(--text)",
              letterSpacing: "-0.005em",
            }}
          >
            Cabinet Müller
          </span>
          <ChevronDown size={13} strokeWidth={2} color="var(--text-3)" />
        </button>
      </div>

      <div style={{ padding: "0 0.6rem", flexShrink: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.45rem",
            padding: "0.35rem 0.55rem",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            fontSize: "0.78rem",
            color: "var(--text-3)",
            cursor: "text",
          }}
        >
          <Search size={12} strokeWidth={2} />
          <span style={{ flex: 1 }}>Rechercher…</span>
          <kbd
            style={{
              fontFamily: "var(--font-geist-mono)",
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

      <nav
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "0.5rem 0.6rem 0.6rem",
        }}
      >
        {sections.map((section) => (
          <div key={section.title} style={{ marginTop: "1rem" }}>
            <div
              style={{
                padding: "0 0.55rem 0.35rem",
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
          gap: "0.5rem",
        }}
      >
        <span
          style={{
            width: 26,
            height: 26,
            background: "var(--text)",
            color: "var(--surface)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.65rem",
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          TM
        </span>
        <div style={{ flex: 1, minWidth: 0, lineHeight: 1.2 }}>
          <div
            style={{
              fontSize: "0.78rem",
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
            thomas@muller.ch
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
        padding: "0.4rem 0.55rem",
        background: item.active ? "var(--surface)" : "transparent",
        border: item.active ? "1px solid var(--border)" : "1px solid transparent",
        borderRadius: "6px",
        fontFamily: "inherit",
        fontSize: "0.82rem",
        fontWeight: item.active ? 600 : 500,
        color: item.active ? "var(--text)" : "var(--text-2)",
        cursor: "pointer",
        textAlign: "left",
        boxShadow: item.active ? "0 1px 2px rgba(10,10,10,0.04)" : "none",
        transition: "background 0.15s, color 0.15s",
      }}
      onMouseEnter={(e) => {
        if (!item.active) e.currentTarget.style.background = "var(--surface)";
      }}
      onMouseLeave={(e) => {
        if (!item.active) e.currentTarget.style.background = "transparent";
      }}
    >
      <Icon size={14} strokeWidth={2} color={item.active ? "var(--accent)" : "var(--text-3)"} />
      <span style={{ flex: 1 }}>{item.label}</span>
      {item.badge && (
        <span
          style={{
            fontFamily: "var(--font-geist-mono)",
            fontSize: "0.68rem",
            fontWeight: 600,
            color: badgeColor,
            padding: "0.05rem 0.35rem",
            background: "var(--surface)",
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
        height: 48,
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 clamp(1rem, 2vw, 1.5rem)",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
        <button
          onClick={onToggleSidebar}
          aria-label="Menu"
          className="atrium-hamburger"
          style={{
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            color: "var(--text-2)",
            cursor: "pointer",
          }}
        >
          ☰
        </button>
        <span
          style={{
            fontSize: "0.82rem",
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
            width: 28,
            height: 28,
            background: "transparent",
            border: "1px solid transparent",
            borderRadius: "6px",
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
        width: 28,
        height: 28,
        background: "transparent",
        border: "1px solid transparent",
        borderRadius: "6px",
        color: "var(--text-2)",
        cursor: "pointer",
        transition: "background 0.15s, border-color 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--surface-2)";
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
            minWidth: 12,
            height: 12,
            padding: "0 3px",
            borderRadius: "6px",
            background: "var(--danger)",
            color: "#FFFFFF",
            fontSize: "0.55rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1.5px solid var(--surface)",
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function KPICell({
  kpi,
  isLast,
}: {
  kpi: {
    label: string;
    value: string;
    unit: string;
    trend: string;
    spark: number[];
    combined: boolean;
    danger?: boolean;
  };
  isLast: boolean;
}) {
  const color = kpi.danger ? "var(--danger)" : "var(--text)";
  const trendColor = kpi.danger ? "var(--danger)" : "var(--success)";
  return (
    <div
      style={{
        padding: "0.85rem 1rem",
        borderRight: isLast ? "none" : "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        gap: "0.35rem",
      }}
    >
      <div
        style={{
          fontSize: "0.74rem",
          fontWeight: 500,
          color: "var(--text-3)",
          display: "flex",
          alignItems: "center",
          gap: "0.3rem",
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
              padding: "0.05rem 0.25rem",
              borderRadius: "3px",
              letterSpacing: "0.04em",
            }}
          >
            ⊕
          </span>
        )}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "0.25rem",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-geist-mono)",
            fontSize: "1.45rem",
            fontWeight: 500,
            letterSpacing: "-0.025em",
            color,
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {kpi.value}
        </span>
        {kpi.unit && (
          <span
            style={{
              fontSize: "0.78rem",
              color: "var(--text-3)",
            }}
          >
            {kpi.unit}
          </span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
        <span
          style={{
            fontSize: "0.7rem",
            fontWeight: 600,
            color: trendColor,
          }}
        >
          {kpi.trend}
        </span>
        <span style={{ flex: 1 }}>
          <Sparkline
            data={kpi.spark}
            width={80}
            height={16}
            stroke={trendColor}
            strokeWidth={1.4}
          />
        </span>
      </div>
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
        marginBottom: "0.65rem",
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: "0.6rem" }}>
        <h2
          style={{
            fontSize: "0.96rem",
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
              fontFamily: "var(--font-geist-mono)",
              fontSize: "0.72rem",
              fontWeight: 600,
              color: "var(--text-3)",
              padding: "0.1rem 0.4rem",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "100px",
            }}
          >
            {count}
          </span>
        )}
        {subtitle && (
          <span style={{ fontSize: "0.78rem", color: "var(--text-3)" }}>
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
            fontSize: "0.78rem",
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
        borderRadius: "10px",
        padding: "0.85rem 0.9rem 0.8rem",
        textAlign: "left",
        fontFamily: "inherit",
        color: "inherit",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: "0.6rem",
        transition: "background 0.15s, border-color 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--surface-2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--surface)";
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
          <span
            style={{
              width: 22,
              height: 22,
              background: tile.iconBg,
              color: tile.iconColor,
              borderRadius: "5px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon size={12} strokeWidth={2} />
          </span>
          <span
            style={{
              fontSize: "0.86rem",
              fontWeight: 600,
              color: "var(--text)",
              letterSpacing: "-0.005em",
            }}
          >
            {tile.title}
          </span>
        </div>
        <span
          style={{
            fontFamily: "var(--font-geist-mono)",
            fontSize: "0.62rem",
            color: "var(--text-4)",
          }}
        >
          {tile.sources.length === 1 ? tile.sources[0] : "⊕"}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "0.5rem",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-geist-mono)",
            fontSize: "1.55rem",
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
      </div>

      <div
        style={{
          fontSize: "0.74rem",
          color: "var(--text-3)",
          lineHeight: 1.4,
        }}
      >
        {tile.caption}
      </div>

      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.3rem",
          fontSize: "0.7rem",
          fontWeight: 600,
          color: alertColor,
          marginTop: "auto",
        }}
      >
        <Circle size={5} strokeWidth={0} fill="currentColor" />
        {tile.alert}
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
        borderRadius: "10px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "0.55rem 1rem",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface-2)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "0.5rem",
          fontFamily: "var(--font-geist-mono)",
          fontSize: "0.7rem",
          color: "var(--text-3)",
          letterSpacing: "0.02em",
        }}
      >
        <div style={{ display: "flex", gap: "1.5rem" }}>
          <span>Agent</span>
          <span>État</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <button
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              padding: "0.2rem 0.5rem",
              fontFamily: "var(--font-geist)",
              fontSize: "0.72rem",
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
        padding: "0.7rem 1rem",
        borderBottom: isLast ? "none" : "1px solid var(--border)",
        opacity: done !== "none" ? 0.4 : 1,
        transition: "opacity 0.25s, background 0.15s",
      }}
    >
      <span
        style={{
          width: 26,
          height: 26,
          background: agent.iconBg,
          color: agent.iconColor,
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={13} strokeWidth={2} />
      </span>
      <div>
        <div
          style={{
            fontSize: "0.84rem",
            fontWeight: 600,
            color: "var(--text)",
            letterSpacing: "-0.005em",
          }}
        >
          {agent.name}
        </div>
        <div
          style={{
            fontSize: "0.75rem",
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
            padding: "0.35rem 0.6rem",
            background: done === "none" ? "var(--accent)" : "transparent",
            color: done === "none" ? "#FFFFFF" : "var(--text-3)",
            border: `1px solid ${done === "none" ? "var(--accent)" : "var(--border)"}`,
            borderRadius: "6px",
            fontFamily: "inherit",
            fontSize: "0.74rem",
            fontWeight: 600,
            cursor: done === "none" ? "pointer" : "default",
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
            width: 28,
            padding: "0.35rem",
            background: "var(--surface)",
            color: "var(--text-3)",
            border: "1px solid var(--border)",
            borderRadius: "6px",
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
        paddingTop: "1rem",
        borderTop: "1px solid var(--border)",
        display: "flex",
        justifyContent: "space-between",
        gap: "1rem",
        fontFamily: "var(--font-geist-mono)",
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
