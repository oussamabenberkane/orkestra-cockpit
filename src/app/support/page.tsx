"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LifeBuoy, Plus, Filter, X } from "lucide-react";
import { AppShell } from "@/components/dashboard/AppShell";
import { TicketList } from "@/components/support/TicketList";
import { TicketThread } from "@/components/support/TicketThread";
import {
  CreateTicketModal,
  type TicketFormData,
} from "@/components/support/CreateTicketModal";
import {
  createTicket,
  listTickets,
  replyToTicket,
  closeTicket,
} from "@/lib/support-data";
import type {
  SupportTicket,
  TicketCategory,
  TicketStatus,
  TicketType,
} from "@/lib/support-types";

const STATUSES: TicketStatus[] = ["new", "open", "in_progress", "resolved", "closed"];
const STATUS_LABEL: Record<TicketStatus, string> = {
  new: "Nouveau",
  open: "Ouvert",
  in_progress: "En cours",
  resolved: "Résolu",
  closed: "Fermé",
};
const TYPES: TicketType[] = ["incident", "request"];
const TYPE_LABEL: Record<TicketType, string> = {
  incident: "Incident",
  request: "Demande",
};

// Placeholder until auth lands.
const CURRENT_USER_NAME = "Helvebroker";

export default function SupportPage() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <SupportContent />
      </Suspense>
    </AppShell>
  );
}

function SupportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tickets, setTickets] = useState<SupportTicket[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [busyThread, setBusyThread] = useState(false);

  const [statusFilter, setStatusFilter] = useState<TicketStatus[]>([]);
  const [typeFilter, setTypeFilter] = useState<TicketType | null>(null);

  // Auto-open modal from `?new=1[&type=…&category=…]`. Clears the param so a
  // refresh doesn't reopen the modal.
  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setCreateOpen(true);
      const url = new URL(window.location.href);
      url.searchParams.delete("new");
      // type/category survive as initial values inside the modal; clear them
      // here so refreshing the cleared URL is idempotent.
      url.searchParams.delete("type");
      url.searchParams.delete("category");
      router.replace(`${url.pathname}${url.search}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initialType = (searchParams.get("type") as TicketType | null) ?? undefined;
  const initialCategory =
    (searchParams.get("category") as TicketCategory | null) ?? undefined;

  // Initial load.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await listTickets();
        if (!cancelled) {
          setTickets(rows);
          setLoadError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(
            e instanceof Error ? e.message : "Impossible de charger les tickets.",
          );
          setTickets([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedTicket = useMemo(
    () => tickets?.find((t) => t.id === selectedTicketId) ?? null,
    [tickets, selectedTicketId],
  );

  const filtered = useMemo(() => {
    if (!tickets) return [];
    return tickets.filter((t) => {
      const statusOk = statusFilter.length === 0 || statusFilter.includes(t.status);
      const typeOk = typeFilter === null || t.type === typeFilter;
      return statusOk && typeOk;
    });
  }, [tickets, statusFilter, typeFilter]);

  const stats = useMemo(() => {
    const list = tickets ?? [];
    return {
      open: list.filter((t) => t.status !== "closed" && t.status !== "resolved").length,
      inProgress: list.filter((t) => t.status === "in_progress").length,
      resolved: list.filter((t) => t.status === "resolved").length,
    };
  }, [tickets]);

  const hasFilters = statusFilter.length > 0 || typeFilter !== null;

  const toggleStatus = (s: TicketStatus) =>
    setStatusFilter((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  const toggleType = (t: TicketType) =>
    setTypeFilter((prev) => (prev === t ? null : t));
  const clearFilters = () => {
    setStatusFilter([]);
    setTypeFilter(null);
  };

  // ── Server-action handlers ──────────────────────────────────────────────

  const handleCreate = useCallback(
    async (data: TicketFormData) => {
      setCreating(true);
      try {
        const fd = new FormData();
        fd.append("type", data.type);
        fd.append("category", data.category);
        if (data.customCategory) fd.append("customCategory", data.customCategory);
        fd.append("subject", data.subject);
        fd.append("description", data.description);
        fd.append("userName", CURRENT_USER_NAME);
        for (const file of data.attachments) fd.append("attachments", file);

        const created = await createTicket(fd);
        setTickets((prev) => (prev ? [created, ...prev] : [created]));
        setCreateOpen(false);
        // Open the new ticket after a tick so the modal close animation runs first.
        setTimeout(() => setSelectedTicketId(created.id), 250);
      } catch (e) {
        alert(e instanceof Error ? e.message : "Création du ticket impossible.");
      } finally {
        setCreating(false);
      }
    },
    [],
  );

  const handleReply = useCallback(
    async (ticketId: string, body: string, attachments: File[]) => {
      setBusyThread(true);
      try {
        const fd = new FormData();
        fd.append("body", body);
        fd.append("userName", CURRENT_USER_NAME);
        for (const f of attachments) fd.append("attachments", f);
        const updated = await replyToTicket(ticketId, fd);
        setTickets((prev) =>
          (prev ?? []).map((t) => (t.id === ticketId ? updated : t)),
        );
      } catch (e) {
        alert(e instanceof Error ? e.message : "Envoi du message impossible.");
      } finally {
        setBusyThread(false);
      }
    },
    [],
  );

  const handleClose = useCallback(async (ticketId: string) => {
    setBusyThread(true);
    try {
      const updated = await closeTicket(ticketId);
      setTickets((prev) =>
        (prev ?? []).map((t) => (t.id === ticketId ? updated : t)),
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : "Fermeture du ticket impossible.");
    } finally {
      setBusyThread(false);
    }
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.375rem" }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 42,
              height: 42,
              borderRadius: "11px",
              background: "var(--accent-tint)",
              color: "var(--accent)",
              flexShrink: 0,
            }}
          >
            <LifeBuoy size={20} strokeWidth={2.5} />
          </span>
          <div>
            <h1
              style={{
                fontSize: "1.3rem",
                fontWeight: 700,
                letterSpacing: "-0.022em",
                color: "var(--text)",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Centre de support
            </h1>
            <p style={{ fontSize: "0.78rem", color: "var(--text-3)", margin: 0 }}>
              Contactez l&apos;équipe Malyz ou suivez vos tickets en cours.
            </p>
          </div>
        </div>

        {!selectedTicket && (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem",
              fontSize: "0.82rem",
              fontWeight: 600,
              color: "#fff",
              background:
                "linear-gradient(180deg, var(--accent) 0%, var(--accent-2) 100%)",
              border: "1px solid var(--accent-2)",
              borderRadius: "10px",
              padding: "0.55rem 1.05rem",
              cursor: "pointer",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.2), 0 1px 2px rgba(88,86,214,0.22), 0 6px 16px -8px rgba(88,86,214,0.5)",
              transition: "transform 0.15s",
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.985)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <Plus size={14} />
            Nouveau ticket
          </button>
        )}
      </motion.div>

      {/* Thread view vs list view */}
      <AnimatePresence mode="wait">
        {selectedTicket ? (
          <motion.div
            key="thread"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <TicketThread
              ticket={selectedTicket}
              currentUserName={CURRENT_USER_NAME}
              busy={busyThread}
              onBack={() => setSelectedTicketId(null)}
              onSendMessage={(body, atts) =>
                handleReply(selectedTicket.id, body, atts)
              }
              onCloseTicket={(id) => handleClose(id)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}
          >
            {/* KPI strip */}
            <div className="support-stats">
              <StatCard label="Tickets ouverts" value={stats.open} tone="accent" />
              <StatCard label="En cours" value={stats.inProgress} tone="warn" />
              <StatCard label="Résolus" value={stats.resolved} tone="success" />
            </div>

            {/* Filters */}
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "16px",
                boxShadow: "var(--tier-1)",
                padding: "1rem 1.1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "0.85rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    color: "var(--text-2)",
                  }}
                >
                  <Filter size={14} color="var(--text-3)" />
                  <span
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      color: "var(--text)",
                    }}
                  >
                    Filtres
                  </span>
                </div>
                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      fontSize: "0.74rem",
                      fontWeight: 600,
                      color: "var(--accent)",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <X size={12} />
                    Tout effacer
                  </button>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <FilterRow
                  label="Statut"
                  options={STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] }))}
                  isActive={(v) => statusFilter.includes(v as TicketStatus)}
                  onToggle={(v) => toggleStatus(v as TicketStatus)}
                />
                <FilterRow
                  label="Type"
                  options={TYPES.map((t) => ({ value: t, label: TYPE_LABEL[t] }))}
                  isActive={(v) => typeFilter === v}
                  onToggle={(v) => toggleType(v as TicketType)}
                />
              </div>
            </div>

            {/* List */}
            <div>
              <h2
                style={{
                  fontSize: "0.92rem",
                  fontWeight: 700,
                  color: "var(--text)",
                  margin: "0 0 0.75rem",
                }}
              >
                Vos tickets
                {hasFilters && tickets && (
                  <span
                    style={{
                      marginLeft: "0.5rem",
                      fontSize: "0.8rem",
                      fontWeight: 500,
                      color: "var(--text-3)",
                    }}
                  >
                    ({filtered.length} sur {tickets.length})
                  </span>
                )}
              </h2>

              {loading ? (
                <div
                  style={{
                    padding: "2.5rem 1.5rem",
                    textAlign: "center",
                    color: "var(--text-4)",
                    background: "var(--surface-2)",
                    borderRadius: "14px",
                  }}
                >
                  Chargement…
                </div>
              ) : loadError ? (
                <div
                  style={{
                    padding: "1.25rem 1.5rem",
                    background: "var(--danger-tint)",
                    color: "var(--danger)",
                    borderRadius: "14px",
                    fontSize: "0.85rem",
                    lineHeight: 1.5,
                  }}
                >
                  {loadError}
                </div>
              ) : (
                <TicketList tickets={filtered} onTicketClick={setSelectedTicketId} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CreateTicketModal
        isOpen={isCreateOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        initialType={initialType}
        initialCategory={initialCategory}
        busy={creating}
      />

      {/* Responsive helpers */}
      <style jsx global>{`
        .support-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.75rem;
        }
        @media (max-width: 640px) {
          .support-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

// ── Pieces ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "accent" | "warn" | "success";
}) {
  const palette =
    tone === "accent"
      ? { fg: "var(--accent)", bg: "var(--accent-tint)" }
      : tone === "warn"
        ? { fg: "var(--warn)", bg: "var(--warn-tint)" }
        : { fg: "var(--success)", bg: "var(--success-tint)" };

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        boxShadow: "var(--tier-1)",
        padding: "0.95rem 1.1rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.4rem",
      }}
    >
      <span
        style={{
          fontSize: "0.62rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: palette.fg,
          background: palette.bg,
          padding: "0.16rem 0.5rem",
          borderRadius: "100px",
          alignSelf: "flex-start",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "1.55rem",
          fontWeight: 700,
          color: "var(--text)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function FilterRow({
  label,
  options,
  isActive,
  onToggle,
}: {
  label: string;
  options: { value: string; label: string }[];
  isActive: (v: string) => boolean;
  onToggle: (v: string) => void;
}) {
  return (
    <div>
      <span
        style={{
          display: "block",
          fontSize: "0.7rem",
          fontWeight: 700,
          color: "var(--text-3)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          marginBottom: "0.45rem",
        }}
      >
        {label}
      </span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
        {options.map((opt) => {
          const active = isActive(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onToggle(opt.value)}
              style={{
                fontSize: "0.78rem",
                fontWeight: 600,
                padding: "0.4rem 0.85rem",
                borderRadius: "11px",
                cursor: "pointer",
                border: active
                  ? "1px solid var(--accent-2)"
                  : "1px solid var(--border)",
                background: active
                  ? "linear-gradient(180deg, var(--accent) 0%, var(--accent-2) 100%)"
                  : "var(--surface)",
                color: active ? "#fff" : "var(--text-2)",
                boxShadow: active ? "var(--tier-press)" : "var(--tier-1)",
                transition: "background 0.15s, color 0.15s, border-color 0.15s",
                fontFamily: "inherit",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
