"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Send,
  Upload,
  Download,
  X,
  FileText,
  User,
  Headphones,
} from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { TypeBadge } from "./TypeBadge";
import { Textarea } from "./FormControls";
import { categoryLabel, type SupportTicket, type TicketMessage } from "@/lib/support-types";

interface TicketThreadProps {
  ticket: SupportTicket;
  currentUserName: string;
  onBack: () => void;
  onSendMessage: (body: string, attachments: File[]) => Promise<void> | void;
  onCloseTicket?: (ticketId: string) => Promise<void> | void;
  /** When true, the reply form disables send and shows progress. */
  busy?: boolean;
}

export function TicketThread({
  ticket,
  currentUserName,
  onBack,
  onSendMessage,
  onCloseTicket,
  busy = false,
}: TicketThreadProps) {
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousMessageCountRef = useRef(ticket.messages.length);

  // Reset scroll tracker when ticket changes.
  useEffect(() => {
    previousMessageCountRef.current = ticket.messages.length;
  }, [ticket.id]);

  // Scroll to bottom only when a NEW message lands.
  useEffect(() => {
    if (ticket.messages.length > previousMessageCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    previousMessageCountRef.current = ticket.messages.length;
  }, [ticket.messages.length]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const valid = Array.from(files).filter((f) => f.size <= 10 * 1024 * 1024);
    setAttachments((prev) => [...prev, ...valid]);
  };

  const handleSend = async () => {
    if (busy) return;
    const trimmed = body.trim();
    if (!trimmed && attachments.length === 0) return;
    await onSendMessage(trimmed, attachments);
    setBody("");
    setAttachments([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      void handleSend();
    }
  };

  const isClosed = ticket.status === "closed";
  const canClose = !isClosed && !!onCloseTicket;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
    >
      {/* Header card */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          boxShadow: "var(--tier-2)",
          padding: "1.1rem 1.25rem",
        }}
      >
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
          <button
            type="button"
            onClick={onBack}
            aria-label="Retour à la liste"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: "8px",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--text-2)",
              cursor: "pointer",
              flexShrink: 0,
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--surface-3)";
              e.currentTarget.style.color = "var(--text)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--surface-2)";
              e.currentTarget.style.color = "var(--text-2)";
            }}
          >
            <ArrowLeft size={16} />
          </button>

          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.45rem",
                marginBottom: "0.4rem",
                flexWrap: "wrap",
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
                }}
              >
                #{ticket.id}
              </span>
              <span style={{ fontSize: "0.72rem", color: "var(--text-4)" }}>
                {categoryLabel(ticket.category, ticket.customCategory)}
              </span>
            </div>
            <h2
              style={{
                fontSize: "1.15rem",
                fontWeight: 700,
                letterSpacing: "-0.022em",
                color: "var(--text)",
                margin: "0 0 0.5rem",
                lineHeight: 1.25,
                overflowWrap: "break-word",
              }}
            >
              {ticket.subject}
            </h2>
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              <StatusBadge status={ticket.status} />
              <TypeBadge type={ticket.type} />
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "0.75rem",
            marginTop: "1rem",
            paddingTop: "0.8rem",
            borderTop: "1px solid var(--border)",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>
            Créé le {formatLong(new Date(ticket.createdAt))}
          </span>
          {canClose && (
            <button
              type="button"
              onClick={() => onCloseTicket?.(ticket.id)}
              style={{
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "var(--text-2)",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "9px",
                padding: "0.45rem 0.85rem",
                cursor: "pointer",
                transition: "background 0.15s, color 0.15s, border-color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--danger-tint)";
                e.currentTarget.style.color = "var(--danger)";
                e.currentTarget.style.borderColor = "transparent";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--surface)";
                e.currentTarget.style.color = "var(--text-2)";
                e.currentTarget.style.borderColor = "var(--border)";
              }}
            >
              Fermer le ticket
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          boxShadow: "var(--tier-1)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "1.1rem",
            maxHeight: 560,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "0.85rem",
          }}
        >
          {ticket.messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              isOwn={m.sender === "user"}
              currentUserName={currentUserName}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Reply card */}
      {!isClosed ? (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            boxShadow: "var(--tier-1)",
            padding: "1.1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.8rem",
          }}
        >
          <h3
            style={{
              fontSize: "0.92rem",
              fontWeight: 700,
              color: "var(--text)",
              margin: 0,
            }}
          >
            Répondre
          </h3>

          <Textarea
            placeholder="Écrivez votre message…"
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          {attachments.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {attachments.map((file, idx) => (
                <FileChip
                  key={idx}
                  file={file}
                  onRemove={() =>
                    setAttachments((prev) => prev.filter((_, i) => i !== idx))
                  }
                />
              ))}
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "var(--text-2)",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: "9px",
                padding: "0.5rem 0.85rem",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-3)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
            >
              <Upload size={14} />
              Joindre un fichier
              <input
                type="file"
                multiple
                style={{ display: "none" }}
                onChange={(e) => handleFiles(e.target.files)}
                accept="image/*,.pdf,.doc,.docx,.txt,.log"
              />
            </label>

            <div
              style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}
            >
              <span style={{ fontSize: "0.7rem", color: "var(--text-4)" }}>
                <kbd
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.65rem",
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: "4px",
                    padding: "0.05rem 0.35rem",
                    marginRight: 2,
                  }}
                >
                  Ctrl
                </kbd>
                +
                <kbd
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.65rem",
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: "4px",
                    padding: "0.05rem 0.35rem",
                    marginLeft: 2,
                  }}
                >
                  Entrée
                </kbd>{" "}
                pour envoyer
              </span>
              <button
                type="button"
                onClick={handleSend}
                disabled={busy || (!body.trim() && attachments.length === 0)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "#fff",
                  background:
                    "linear-gradient(180deg, var(--accent) 0%, var(--accent-2) 100%)",
                  border: "1px solid var(--accent-2)",
                  borderRadius: "9px",
                  padding: "0.55rem 1.05rem",
                  cursor: busy ? "wait" : "pointer",
                  opacity:
                    busy || (!body.trim() && attachments.length === 0) ? 0.55 : 1,
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.2), 0 1px 2px rgba(88,86,214,0.22), 0 6px 16px -8px rgba(88,86,214,0.5)",
                  transition: "opacity 0.15s, transform 0.15s",
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.985)")}
                onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <Send size={13} />
                {busy ? "Envoi…" : "Envoyer"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            padding: "1.5rem",
            textAlign: "center",
            color: "var(--text-3)",
            fontSize: "0.85rem",
          }}
        >
          Ce ticket est fermé. Créez un nouveau ticket si vous avez besoin d&apos;aide.
        </div>
      )}
    </motion.div>
  );
}

// ── Pieces ────────────────────────────────────────────────────────────────

function MessageBubble({
  message,
  isOwn,
  currentUserName,
}: {
  message: TicketMessage;
  isOwn: boolean;
  currentUserName: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: "0.6rem",
        flexDirection: isOwn ? "row-reverse" : "row",
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: 32,
          height: 32,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: isOwn ? "var(--accent-tint)" : "var(--info-tint)",
          color: isOwn ? "var(--accent)" : "var(--info)",
        }}
      >
        {isOwn ? <User size={14} /> : <Headphones size={14} />}
      </div>

      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: isOwn ? "flex-end" : "flex-start",
          gap: "0.25rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.45rem",
            fontSize: "0.7rem",
            color: "var(--text-3)",
          }}
        >
          <span style={{ fontWeight: 700, color: "var(--text-2)" }}>
            {isOwn ? currentUserName : message.senderName}
          </span>
          <span style={{ color: "var(--text-4)" }}>·</span>
          <span>{formatLong(new Date(message.createdAt))}</span>
        </div>

        <div
          style={{
            maxWidth: "85%",
            padding: "0.7rem 0.9rem",
            borderRadius: "12px",
            background: isOwn
              ? "linear-gradient(180deg, var(--accent) 0%, var(--accent-2) 100%)"
              : "var(--surface-2)",
            color: isOwn ? "#fff" : "var(--text)",
            border: isOwn ? "1px solid var(--accent-2)" : "1px solid var(--border)",
            borderTopRightRadius: isOwn ? 4 : 12,
            borderTopLeftRadius: isOwn ? 12 : 4,
            fontSize: "0.85rem",
            lineHeight: 1.5,
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
            boxShadow: isOwn
              ? "inset 0 1px 0 rgba(255,255,255,0.15), 0 1px 2px rgba(88,86,214,0.18)"
              : "none",
          }}
        >
          {message.body}

          {message.attachments.length > 0 && (
            <div
              style={{
                marginTop: "0.55rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.35rem",
              }}
            >
              {message.attachments.map((a) => (
                <a
                  key={a.id}
                  href={a.url}
                  target="_blank"
                  rel="noreferrer"
                  download={a.name}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.45rem",
                    fontSize: "0.75rem",
                    padding: "0.35rem 0.5rem",
                    borderRadius: "8px",
                    background: isOwn ? "rgba(255,255,255,0.16)" : "var(--surface)",
                    border: isOwn
                      ? "1px solid rgba(255,255,255,0.25)"
                      : "1px solid var(--border)",
                    color: isOwn ? "#fff" : "var(--text-2)",
                    textDecoration: "none",
                  }}
                >
                  <FileText size={12} />
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
                    {a.name}
                  </span>
                  <Download size={12} />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FileChip({ file, onRemove }: { file: File; onRemove: () => void }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.55rem",
        padding: "0.5rem 0.75rem",
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        borderRadius: "11px",
      }}
    >
      <FileText size={14} color="var(--accent)" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "var(--text)",
            margin: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {file.name}
        </p>
        <p style={{ fontSize: "0.68rem", color: "var(--text-4)", margin: 0 }}>
          {formatFileSize(file.size)}
        </p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Supprimer ${file.name}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 24,
          height: 24,
          borderRadius: "6px",
          background: "transparent",
          border: "none",
          color: "var(--text-4)",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--danger-tint)";
          e.currentTarget.style.color = "var(--danger)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "var(--text-4)";
        }}
      >
        <X size={12} />
      </button>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────

function formatLong(date: Date): string {
  return new Intl.DateTimeFormat("fr-CH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 o";
  const k = 1024;
  const sizes = ["o", "Ko", "Mo", "Go"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
}
