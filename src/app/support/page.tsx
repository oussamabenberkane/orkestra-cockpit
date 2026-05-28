"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LifeBuoy, MessageSquarePlus, Search, X, Check, ChevronDown } from "lucide-react";
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
  const [search, setSearch] = useState("");

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
    const q = search.trim().toLowerCase();
    return tickets.filter((t) => {
      if (statusFilter.length > 0 && !statusFilter.includes(t.status)) return false;
      if (typeFilter !== null && t.type !== typeFilter) return false;
      if (q) {
        const lastBody = t.messages?.[t.messages.length - 1]?.body ?? "";
        const haystack = `${t.subject} ${t.id} ${lastBody}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [tickets, search, statusFilter, typeFilter]);

  /** Counts per status / per type — shown next to each dropdown option. */
  const statusCounts = useMemo(() => {
    const counts: Record<TicketStatus, number> = {
      new: 0, open: 0, in_progress: 0, resolved: 0, closed: 0,
    };
    for (const t of tickets ?? []) counts[t.status] = (counts[t.status] ?? 0) + 1;
    return counts;
  }, [tickets]);
  const typeCounts = useMemo(() => {
    const counts: Record<TicketType, number> = { incident: 0, request: 0 };
    for (const t of tickets ?? []) counts[t.type] = (counts[t.type] ?? 0) + 1;
    return counts;
  }, [tickets]);

  const hasFilters = statusFilter.length > 0 || typeFilter !== null || search.trim() !== "";

  const toggleStatus = (s: TicketStatus) =>
    setStatusFilter((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  const setType = (t: TicketType | null) => setTypeFilter(t);
  const clearFilters = () => {
    setStatusFilter([]);
    setTypeFilter(null);
    setSearch("");
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
            {/* Toolbar — search + status dropdown + type dropdown, all one row */}
            <div className="support-toolbar" role="search">
              <div className="support-search">
                <Search size={15} strokeWidth={2.25} className="support-search__icon" aria-hidden />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher par sujet, ID ou contenu…"
                  className="support-search__input"
                  aria-label="Rechercher dans les tickets"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Effacer la recherche"
                    className="support-search__clear"
                  >
                    <X size={13} strokeWidth={2.5} />
                  </button>
                )}
              </div>

              <Dropdown
                label="Statut"
                multi
                values={statusFilter}
                options={STATUSES.map((s) => ({
                  value: s, label: STATUS_LABEL[s], count: statusCounts[s] ?? 0,
                }))}
                onToggle={(v) => toggleStatus(v as TicketStatus)}
                onClear={() => setStatusFilter([])}
              />

              <Dropdown
                label="Type"
                multi={false}
                values={typeFilter ? [typeFilter] : []}
                options={TYPES.map((t) => ({
                  value: t, label: TYPE_LABEL[t], count: typeCounts[t] ?? 0,
                }))}
                onToggle={(v) => setType(typeFilter === v ? null : (v as TicketType))}
                onClear={() => setType(null)}
                alignRight
              />

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="support-clear-btn"
                  aria-label="Effacer tous les filtres"
                >
                  <X size={13} strokeWidth={2.5} />
                  <span className="support-clear-btn__label">Tout effacer</span>
                </button>
              )}
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
        /* ── Toolbar: search bar + 2 dropdowns + clear ────────────────────── */
        .support-toolbar {
          display: flex;
          align-items: stretch;
          gap: 0.55rem;
          min-width: 0;
        }

        /* Search */
        .support-search {
          position: relative;
          flex: 1 1 240px;
          min-width: 0;
          display: flex;
          align-items: center;
        }
        .support-search__icon {
          position: absolute;
          left: 0.85rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-4);
          pointer-events: none;
        }
        .support-search__input {
          width: 100%;
          height: 40px;
          padding: 0 2.4rem 0 2.45rem;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 10px;
          font-family: inherit;
          font-size: 0.86rem;
          color: var(--text);
          outline: none;
          box-shadow: var(--tier-1);
          transition: border-color 0.15s, box-shadow 0.18s;
        }
        .support-search__input::placeholder { color: var(--text-4); }
        .support-search__input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-tint), var(--tier-1);
        }
        .support-search__clear {
          position: absolute;
          right: 0.4rem;
          top: 50%;
          transform: translateY(-50%);
          width: 26px;
          height: 26px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: var(--text-4);
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .support-search__clear:hover {
          background: var(--surface-3);
          color: var(--text-2);
        }

        /* Dropdown root */
        .s-dd { position: relative; flex: 0 0 auto; min-width: 0; }

        /* Trigger button */
        .s-dd__trigger {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          height: 40px;
          padding: 0 0.85rem;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 10px;
          font-family: inherit;
          font-size: 0.84rem;
          font-weight: 500;
          color: var(--text-2);
          box-shadow: var(--tier-1);
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s, box-shadow 0.18s;
          white-space: nowrap;
        }
        .s-dd__trigger:hover {
          background: var(--surface-2);
          border-color: var(--border-strong);
        }
        .s-dd__trigger.is-active {
          background: var(--accent-tint);
          border-color: var(--accent-tint-2);
          color: var(--accent);
          font-weight: 600;
        }
        .s-dd__trigger.is-open {
          box-shadow: 0 0 0 3px var(--accent-tint), var(--tier-1);
          border-color: var(--accent);
        }
        .s-dd__caret {
          display: inline-flex;
          opacity: 0.55;
          transition: transform 0.18s ease;
        }
        .s-dd__trigger.is-open .s-dd__caret { transform: rotate(180deg); }
        .s-dd__trigger-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          background: var(--accent-tint-2);
          color: var(--accent);
          border-radius: 100px;
          font-family: var(--font-mono);
          font-size: 0.62rem;
          font-weight: 700;
          line-height: 1;
        }

        /* Menu — sizes to its content with the trigger's width as a floor,
           so a wide trigger never sits above a narrower menu and a short
           trigger doesn't get a pointlessly wide popover. */
        .s-dd__menu {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          z-index: 60;
          width: max-content;
          min-width: 100%;
          max-width: min(260px, calc(100vw - 24px));
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          box-shadow: var(--tier-2);
          padding: 0.3rem;
          overflow: hidden;
        }
        .s-dd--right .s-dd__menu { left: auto; right: 0; }
        .s-dd__menu-scroll {
          max-height: min(60vh, 320px);
          overflow-y: auto;
          padding: 0.05rem;
        }
        .s-dd__option {
          display: grid;
          align-items: center;
          gap: 0.55rem;
          width: 100%;
          padding: 0.5rem 0.6rem;
          background: transparent;
          border: none;
          border-radius: 8px;
          font-family: inherit;
          font-size: 0.84rem;
          font-weight: 500;
          color: var(--text-2);
          text-align: left;
          cursor: pointer;
          transition: background 0.12s;
        }
        /* Multi-select: leading checkbox column. */
        .s-dd__option--multi {
          grid-template-columns: 18px minmax(0, 1fr) auto;
        }
        /* Single-select: no checkbox — label sits flush-left. */
        .s-dd__option--single {
          grid-template-columns: minmax(0, 1fr) auto;
        }
        .s-dd__option:hover { background: var(--surface-2); }
        .s-dd__option.is-active {
          color: var(--accent);
          font-weight: 600;
          background: var(--accent-tint);
        }
        .s-dd__check {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
        }
        .s-dd__check--empty {
          width: 14px;
          height: 14px;
          border: 1.5px solid var(--border-strong);
          border-radius: 4px;
          background: var(--surface);
        }
        .s-dd__option.is-active .s-dd__check--empty {
          border-color: var(--accent);
          background: var(--accent);
        }
        .s-dd__count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 22px;
          height: 20px;
          padding: 0 6px;
          background: var(--accent-tint);
          color: var(--accent);
          border-radius: 100px;
          font-family: var(--font-mono);
          font-size: 0.66rem;
          font-weight: 700;
          line-height: 1;
          font-variant-numeric: tabular-nums;
        }
        /* On the active row, bump the badge tint so it still reads against
           the row's blue background. Same hue, just one step deeper. */
        .s-dd__option.is-active .s-dd__count {
          background: var(--accent-tint-2);
        }
        .s-dd__option-label {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .s-dd__divider {
          height: 1px;
          background: var(--border);
          margin: 0.25rem 0.15rem;
        }
        .s-dd__reset {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          width: 100%;
          padding: 0.5rem 0.6rem;
          background: transparent;
          border: none;
          border-radius: 8px;
          font-family: inherit;
          font-size: 0.78rem;
          font-weight: 500;
          color: var(--text-3);
          cursor: pointer;
          gap: 0.45rem;
          transition: background 0.12s, color 0.12s;
        }
        .s-dd__reset:hover {
          background: var(--danger-tint);
          color: var(--danger);
        }
        .s-dd__overlay {
          position: fixed;
          inset: 0;
          z-index: 59;
          background: transparent;
        }

        /* Clear button (toolbar-level) */
        .support-clear-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          height: 40px;
          padding: 0 0.75rem;
          background: transparent;
          border: 1px dashed var(--border-strong);
          border-radius: 10px;
          font-family: inherit;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-3);
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
        }
        .support-clear-btn:hover {
          background: var(--danger-tint);
          color: var(--danger);
          border-color: var(--danger);
        }

        /* Mobile — search takes the full first row; dropdowns + clear wrap below. */
        @media (max-width: 640px) {
          .support-toolbar { flex-wrap: wrap; }
          .support-search { flex: 1 1 100%; }
          .s-dd { flex: 1 1 auto; }
          .s-dd__trigger { width: 100%; justify-content: space-between; }
        }
        @media (max-width: 420px) {
          .support-clear-btn__label { display: none; }
        }

        /* Touch target floor on mobile / touch devices. */
        @media (max-width: 720px), (hover: none) {
          .support-search__input { height: 44px; font-size: 16px; }
          .s-dd__trigger { height: 44px; }
          .support-clear-btn { height: 44px; }
          .s-dd__option { padding: 0.65rem 0.6rem; }
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

interface DropdownOption {
  value: string;
  label: string;
  count: number;
}

interface DropdownProps {
  label: string;
  /** Currently selected values (always an array — single-select wraps in [v]). */
  values: string[];
  options: DropdownOption[];
  /** True = checkboxes (multi-select); false = single-select. */
  multi: boolean;
  onToggle: (value: string) => void;
  onClear: () => void;
  /** Anchor the menu to the right edge (avoid right-side viewport spill). */
  alignRight?: boolean;
}

/**
 * Custom-styled dropdown filter with per-option count badges.
 *
 * - Multi-select mode renders a checkbox in front of each option; clicking
 *   toggles the value.
 * - Single-select mode renders a check icon only for the active value.
 * - Click-outside / Escape close the menu.
 */
function Dropdown({
  label,
  values,
  options,
  multi,
  onToggle,
  onClear,
  alignRight,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const isActive = values.length > 0;

  // Close on Escape, restore focus.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Trigger label: shows the selection summary when active, the field name otherwise.
  const triggerText =
    !isActive
      ? label
      : multi
        ? values.length === 1
          ? options.find((o) => o.value === values[0])?.label ?? label
          : `${label} · ${values.length}`
        : options.find((o) => o.value === values[0])?.label ?? label;

  return (
    <div className={`s-dd ${alignRight ? "s-dd--right" : ""}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`s-dd__trigger ${isActive ? "is-active" : ""} ${open ? "is-open" : ""}`}
      >
        <span>{triggerText}</span>
        {multi && values.length > 1 && (
          <span className="s-dd__trigger-count">{values.length}</span>
        )}
        <ChevronDown size={13} strokeWidth={2.5} className="s-dd__caret" aria-hidden />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="s-dd__overlay" onClick={() => setOpen(false)} aria-hidden />
            <motion.div
              role="listbox"
              aria-multiselectable={multi}
              initial={{ opacity: 0, y: 4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.97 }}
              transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
              className="s-dd__menu"
            >
              <div className="s-dd__menu-scroll">
                {options.map((opt) => {
                  const active = values.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => {
                        onToggle(opt.value);
                        if (!multi) setOpen(false);
                      }}
                      className={`s-dd__option ${multi ? "s-dd__option--multi" : "s-dd__option--single"} ${active ? "is-active" : ""}`}
                    >
                      {multi && (
                        <span className="s-dd__check" aria-hidden>
                          <span className="s-dd__check--empty">
                            {active && <Check size={10} strokeWidth={3.5} color="#fff" />}
                          </span>
                        </span>
                      )}
                      <span className="s-dd__option-label">{opt.label}</span>
                      {opt.count >= 1 ? (
                        <span className="s-dd__count">{opt.count}</span>
                      ) : (
                        <span aria-hidden />
                      )}
                    </button>
                  );
                })}

                {isActive && (
                  <>
                    <div className="s-dd__divider" aria-hidden />
                    <button
                      type="button"
                      className="s-dd__reset"
                      onClick={() => {
                        onClear();
                        setOpen(false);
                      }}
                    >
                      <X size={12} strokeWidth={2.5} />
                      Réinitialiser
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
