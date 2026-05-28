"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LifeBuoy, MessageSquarePlus, Filter, X, Check } from "lucide-react";
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
        className="support-header-row"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", minWidth: 0, flex: 1 }}>
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
          <div style={{ minWidth: 0 }}>
            <h1
              style={{
                fontSize: "clamp(1.1rem, 4.5vw, 1.3rem)",
                fontWeight: 700,
                letterSpacing: "-0.022em",
                color: "var(--text)",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Centre de support
            </h1>
            <p style={{
              fontSize: "clamp(0.72rem, 2.4vw, 0.78rem)",
              color: "var(--text-3)",
              margin: 0,
            }}>
              Contactez l&apos;équipe Malyz ou suivez vos tickets en cours.
            </p>
          </div>
        </div>

        {!selectedTicket && (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="support-new-ticket-btn cta-primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "#fff",
              background:
                "linear-gradient(180deg, var(--accent) 0%, var(--accent-2) 100%)",
              border: "1px solid var(--accent-2)",
              borderRadius: "10px",
              padding: "0.65rem 1.1rem",
              minHeight: 44,
              cursor: "pointer",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.22), 0 1px 2px rgba(0,98,204,0.25), 0 8px 18px -8px rgba(0,122,255,0.55)",
              transition: "transform 0.15s, box-shadow 0.18s",
              whiteSpace: "nowrap",
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.985)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <MessageSquarePlus size={15} strokeWidth={2.25} />
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
            {/* KPI strip — three compact squares, always on one row */}
            <div className="support-stats">
              <StatCard label="Ouverts" value={stats.open} tone="accent" />
              <StatCard label="En cours" value={stats.inProgress} tone="warn" />
              <StatCard label="Résolus" value={stats.resolved} tone="success" />
            </div>

            {/* Filters — refined card with chip rails */}
            <div className="support-filters-card">
              <div className="support-filters-header">
                <div className="support-filters-title">
                  <span className="support-filters-icon" aria-hidden>
                    <Filter size={13} strokeWidth={2.25} />
                  </span>
                  <span>Filtres</span>
                  {hasFilters && (
                    <span className="support-filters-count">
                      {statusFilter.length + (typeFilter ? 1 : 0)}
                    </span>
                  )}
                </div>
                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="support-clear-btn"
                    aria-label="Effacer tous les filtres"
                  >
                    <X size={12} strokeWidth={2.5} />
                    Tout effacer
                  </button>
                )}
              </div>

              <div className="support-filters-rails">
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

      {/* Design tokens + responsive helpers */}
      <style jsx global>{`
        /* ── Stats squares — 3 in a row at ALL widths ────────────────────── */
        .support-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: clamp(0.45rem, 1.5vw, 0.75rem);
        }
        .support-stat-square {
          position: relative;
          aspect-ratio: 1 / 1;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 14px;
          box-shadow: var(--tier-1);
          padding: clamp(0.55rem, 2.5vw, 0.9rem);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: clamp(0.25rem, 1vw, 0.45rem);
          text-align: center;
          min-width: 0;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .support-stat-square:hover {
          transform: translateY(-1px);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,1),
            0 0 0 1px rgba(0,0,0,0.05),
            0 2px 4px rgba(0,0,0,0.05),
            0 10px 24px -10px rgba(0,0,0,0.14);
        }
        .support-stat-square__bar {
          position: absolute;
          top: 0;
          left: 14%;
          right: 14%;
          height: 3px;
          border-radius: 0 0 100px 100px;
          opacity: 0.85;
        }
        .support-stat-square__value {
          font-family: var(--font-mono);
          font-weight: 700;
          color: var(--text);
          font-variant-numeric: tabular-nums;
          font-size: clamp(1.55rem, 8vw, 2.1rem);
          line-height: 1;
          letter-spacing: -0.04em;
        }
        .support-stat-square__label {
          font-size: clamp(0.55rem, 1.9vw, 0.62rem);
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 0.14rem 0.55rem;
          border-radius: 100px;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* ── Filters card — refined chip rails ───────────────────────────── */
        .support-filters-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          box-shadow: var(--tier-1);
          padding: clamp(0.85rem, 3vw, 1.1rem) clamp(0.95rem, 3.5vw, 1.2rem);
        }
        .support-filters-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          margin-bottom: 0.95rem;
        }
        .support-filters-title {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.005em;
        }
        .support-filters-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          border-radius: 7px;
          background: var(--accent-tint);
          color: var(--accent);
        }
        .support-filters-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          background: var(--accent);
          color: #fff;
          border-radius: 100px;
          font-family: var(--font-mono);
          font-size: 0.62rem;
          font-weight: 700;
          line-height: 1;
        }
        .support-clear-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.74rem;
          font-weight: 600;
          color: var(--text-3);
          background: transparent;
          border: none;
          border-radius: 7px;
          padding: 0.35rem 0.55rem;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.15s, color 0.15s;
        }
        .support-clear-btn:hover {
          background: var(--danger-tint);
          color: var(--danger);
        }
        .support-filters-rails {
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
        }
        .support-filter-row {
          display: grid;
          grid-template-columns: 70px minmax(0, 1fr);
          align-items: center;
          gap: 0.65rem;
          min-width: 0;
        }
        .support-filter-row__label {
          font-size: 0.66rem;
          font-weight: 700;
          color: var(--text-4);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .support-filter-row__chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
          min-width: 0;
        }
        .support-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-family: inherit;
          font-size: 0.76rem;
          font-weight: 500;
          color: var(--text-2);
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 0.4rem 0.7rem;
          min-height: 34px;
          cursor: pointer;
          transition: background 0.15s, color 0.15s, border-color 0.15s, box-shadow 0.15s;
          white-space: nowrap;
          box-shadow: var(--tier-1);
        }
        .support-chip:hover {
          border-color: var(--border-strong);
          background: var(--surface-2);
        }
        .support-chip.is-active {
          color: var(--accent);
          font-weight: 600;
          background: var(--accent-tint);
          border-color: var(--accent-tint-2);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.6), 0 0 0 1px rgba(0,122,255,0.18);
        }
        .support-chip__check {
          color: var(--accent);
        }

        /* Stack labels above chips on narrow tablets/phones — keep things readable. */
        @media (max-width: 640px) {
          .support-filter-row {
            grid-template-columns: minmax(0, 1fr);
            gap: 0.4rem;
          }
        }

        /* Touch target floor on mobile / touch devices. */
        @media (max-width: 720px), (hover: none) {
          .support-chip { min-height: 40px; }
          .support-clear-btn { min-height: 40px; }
        }

        /* ── Header row ──────────────────────────────────────────────────── */
        @media (max-width: 480px) {
          .support-new-ticket-btn { width: 100%; justify-content: center; }
          .support-header-row { row-gap: 0.5rem !important; }
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
    <div className="support-stat-square">
      <span
        className="support-stat-square__bar"
        aria-hidden
        style={{ background: palette.fg }}
      />
      <span className="support-stat-square__value">{value}</span>
      <span
        className="support-stat-square__label"
        style={{ color: palette.fg, background: palette.bg }}
      >
        {label}
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
    <div className="support-filter-row">
      <span className="support-filter-row__label">{label}</span>
      <div className="support-filter-row__chips">
        {options.map((opt) => {
          const active = isActive(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onToggle(opt.value)}
              aria-pressed={active}
              className={`support-chip ${active ? "is-active" : ""}`}
            >
              {active && (
                <Check size={11} strokeWidth={3} className="support-chip__check" aria-hidden />
              )}
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
