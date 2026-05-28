"use client";

import { motion } from "framer-motion";
import { Clock, MessageSquare, Inbox } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { TypeBadge } from "./TypeBadge";
import { categoryLabel, type SupportTicket } from "@/lib/support-types";

interface TicketListProps {
  tickets: SupportTicket[];
  onTicketClick: (ticketId: string) => void;
}

export function TicketList({ tickets, onTicketClick }: TicketListProps) {
  if (tickets.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.875rem",
          padding: "3rem 2rem",
          borderRadius: "14px",
          background: "var(--surface-2)",
          color: "var(--text-4)",
          textAlign: "center",
        }}
      >
        <Inbox size={30} strokeWidth={1.5} />
        <div>
          <p
            style={{
              fontSize: "0.88rem",
              fontWeight: 600,
              color: "var(--text-3)",
              margin: "0 0 0.2rem",
            }}
          >
            Aucun ticket pour le moment
          </p>
          <p style={{ fontSize: "0.78rem", color: "var(--text-4)", margin: 0 }}>
            Créez votre premier ticket pour contacter l&apos;équipe support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {tickets.map((ticket, i) => (
        <TicketRow
          key={ticket.id}
          ticket={ticket}
          index={i}
          onClick={() => onTicketClick(ticket.id)}
        />
      ))}
    </div>
  );
}

function TicketRow({
  ticket,
  index,
  onClick,
}: {
  ticket: SupportTicket;
  index: number;
  onClick: () => void;
}) {
  const lastMessage = ticket.messages[ticket.messages.length - 1];
  const messageCount = ticket.messages.length;
  const updated = formatRelative(new Date(ticket.updatedAt));

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: Math.min(index * 0.04, 0.18),
        duration: 0.28,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        textAlign: "left",
        width: "100%",
        cursor: "pointer",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        boxShadow: "var(--tier-1)",
        padding: "1rem 1.1rem",
        font: "inherit",
        color: "inherit",
        transition: "border-color 0.18s, transform 0.18s, box-shadow 0.18s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--border-strong)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Header row: id + category | badges */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "0.5rem 0.75rem",
          marginBottom: "0.55rem",
          flexWrap: "wrap",
          minWidth: 0,
        }}
      >
        <div style={{ minWidth: 0, flex: "1 1 60%" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
              marginBottom: "0.35rem",
              flexWrap: "wrap",
              minWidth: 0,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.66rem",
                fontWeight: 600,
                letterSpacing: "0.04em",
                color: "var(--text-4)",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                padding: "0.14rem 0.45rem",
                borderRadius: "6px",
                maxWidth: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              #{ticket.id}
            </span>
            <span style={{
              fontSize: "0.72rem", color: "var(--text-4)",
              minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {categoryLabel(ticket.category, ticket.customCategory)}
            </span>
          </div>
          <h3
            style={{
              fontSize: "clamp(0.92rem, 3vw, 0.98rem)",
              fontWeight: 700,
              color: "var(--text)",
              margin: 0,
              lineHeight: 1.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              wordBreak: "break-word",
              overflowWrap: "anywhere",
            }}
          >
            {ticket.subject}
          </h3>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexShrink: 0, flexWrap: "wrap" }}>
          <StatusBadge status={ticket.status} size="sm" />
          <TypeBadge type={ticket.type} size="sm" />
        </div>
      </div>

      {/* Preview */}
      {lastMessage && (
        <div
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "11px",
            padding: "0.6rem 0.75rem",
            marginBottom: "0.6rem",
          }}
        >
          <p
            style={{
              fontSize: "0.7rem",
              fontWeight: 600,
              color: "var(--text-4)",
              margin: "0 0 0.2rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {lastMessage.sender === "admin" ? "Équipe support" : "Vous"}
          </p>
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--text-2)",
              margin: 0,
              lineHeight: 1.45,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {lastMessage.body}
          </p>
        </div>
      )}

      {/* Footer: counts + updated */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.3rem 1rem",
          fontSize: "0.72rem",
          color: "var(--text-4)",
          minWidth: 0,
        }}
      >
        <span style={{
          display: "inline-flex", alignItems: "center", gap: "0.3rem",
          whiteSpace: "nowrap",
        }}>
          <MessageSquare size={12} />
          {messageCount} {messageCount === 1 ? "message" : "messages"}
        </span>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: "0.3rem",
          whiteSpace: "nowrap",
        }}>
          <Clock size={12} />
          Mis à jour {updated}
        </span>
      </div>
    </motion.button>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────

function formatRelative(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "à l'instant";
  if (diff < hour) {
    const m = Math.floor(diff / minute);
    return `il y a ${m} min`;
  }
  if (diff < day) {
    const h = Math.floor(diff / hour);
    return `il y a ${h} h`;
  }
  const d = Math.floor(diff / day);
  if (d < 7) return `il y a ${d} j`;
  return new Intl.DateTimeFormat("fr-CH", {
    day: "numeric",
    month: "short",
  }).format(date);
}
