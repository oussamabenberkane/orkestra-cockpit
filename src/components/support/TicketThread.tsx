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
      className="support-thread"
      style={{ display: "flex", flexDirection: "column", gap: "1rem", minWidth: 0 }}
    >
      {/* Header card */}
      <div
        className="support-thread-card"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          boxShadow: "var(--tier-2)",
          padding: "clamp(0.9rem, 3vw, 1.1rem) clamp(0.95rem, 3.5vw, 1.25rem)",
          minWidth: 0,
        }}
      >
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", minWidth: 0 }}>
          <button
            type="button"
            onClick={onBack}
            aria-label="Retour à la liste"
            className="support-thread-back"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
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
                fontSize: "clamp(1rem, 4vw, 1.15rem)",
                fontWeight: 700,
                letterSpacing: "-0.022em",
                color: "var(--text)",
                margin: "0 0 0.5rem",
                lineHeight: 1.25,
                overflowWrap: "anywhere",
                wordBreak: "break-word",
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
              className="support-thread-close"
              style={{
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "var(--text-2)",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "9px",
                padding: "0.55rem 0.9rem",
                minHeight: 40,
                cursor: "pointer",
                transition: "background 0.15s, color 0.15s, border-color 0.15s",
                whiteSpace: "nowrap",
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
          minWidth: 0,
        }}
      >
        <div
          style={{
            padding: "clamp(0.75rem, 2.5vw, 1rem)",
            maxHeight: "clamp(360px, 65vh, 620px)",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "0.55rem",
            minWidth: 0,
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
          className="support-reply-card"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            boxShadow: "var(--tier-1)",
            padding: "clamp(0.85rem, 3vw, 1.1rem)",
            display: "flex",
            flexDirection: "column",
            gap: "0.8rem",
            minWidth: 0,
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

          <div className="support-reply-footer">
            <label className="support-reply-attach">
              <Upload size={14} strokeWidth={2.25} />
              <span className="support-reply-attach__full">Joindre un fichier</span>
              <span className="support-reply-attach__short">Joindre</span>
              <input
                type="file"
                multiple
                style={{ display: "none" }}
                onChange={(e) => handleFiles(e.target.files)}
                accept="image/*,.pdf,.doc,.docx,.txt,.log"
              />
            </label>

            <button
              type="button"
              onClick={handleSend}
              disabled={busy || (!body.trim() && attachments.length === 0)}
              className="support-reply-submit cta-primary"
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.985)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <Send size={14} strokeWidth={2.25} />
              {busy ? "Envoi…" : "Envoyer"}
            </button>
          </div>

          <style jsx>{`
            .support-reply-footer {
              display: flex;
              gap: 0.5rem;
              align-items: stretch;
              min-width: 0;
            }
            .support-reply-attach {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              gap: 0.45rem;
              flex: 1 1 auto;
              min-width: 0;
              font-size: 0.82rem;
              font-weight: 600;
              color: var(--text-2);
              background: var(--surface-2);
              border: 1px solid var(--border);
              border-radius: 10px;
              padding: 0.6rem 0.9rem;
              min-height: 44px;
              cursor: pointer;
              transition: background 0.15s, color 0.15s, border-color 0.15s;
              white-space: nowrap;
              user-select: none;
            }
            .support-reply-attach:hover {
              background: var(--accent-tint);
              color: var(--accent);
              border-color: var(--accent-tint-2);
            }
            .support-reply-attach__short { display: none; }

            .support-reply-submit {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              gap: 0.45rem;
              flex: 0 0 auto;
              font-family: inherit;
              font-size: 0.85rem;
              font-weight: 600;
              color: #fff;
              background: linear-gradient(180deg, var(--accent) 0%, var(--accent-2) 100%);
              border: 1px solid var(--accent-2);
              border-radius: 10px;
              padding: 0.6rem 1.25rem;
              min-height: 44px;
              cursor: pointer;
              box-shadow:
                inset 0 1px 0 rgba(255,255,255,0.22),
                0 1px 2px rgba(0,98,204,0.22),
                0 8px 18px -8px rgba(0,122,255,0.5);
              transition: transform 0.15s, opacity 0.15s, box-shadow 0.2s;
              white-space: nowrap;
            }
            .support-reply-submit:disabled {
              opacity: 0.55;
              cursor: wait;
            }

            /* Narrow phones — keep both on the same row by shortening
               the attach label and tightening padding. */
            @media (max-width: 420px) {
              .support-reply-attach__full { display: none; }
              .support-reply-attach__short { display: inline; }
              .support-reply-attach { padding: 0.5rem 0.7rem; gap: 0.35rem; }
              .support-reply-submit { padding: 0.55rem 0.95rem; }
            }
          `}</style>
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
      className="support-msg"
      style={{
        display: "flex",
        gap: "0.5rem",
        flexDirection: isOwn ? "row-reverse" : "row",
        minWidth: 0,
        alignItems: "flex-end",
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: 26,
          height: 26,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: isOwn ? "var(--accent-tint)" : "var(--surface-3)",
          color: isOwn ? "var(--accent)" : "var(--text-3)",
          marginBottom: 2,
        }}
        aria-hidden
      >
        {isOwn ? <User size={12} strokeWidth={2.25} /> : <Headphones size={12} strokeWidth={2.25} />}
      </div>

      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: isOwn ? "flex-end" : "flex-start",
          gap: "0.2rem",
          maxWidth: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            fontSize: "0.62rem",
            color: "var(--text-4)",
            padding: "0 0.4rem",
          }}
        >
          <span style={{ fontWeight: 600, color: "var(--text-3)" }}>
            {isOwn ? currentUserName : message.senderName}
          </span>
          <span style={{ opacity: 0.5 }}>·</span>
          <span>{formatShort(new Date(message.createdAt))}</span>
        </div>

        <div
          style={{
            maxWidth: "min(78%, 100%)",
            padding: "0.5rem 0.7rem",
            borderRadius: "14px",
            background: isOwn
              ? "linear-gradient(180deg, var(--accent) 0%, var(--accent-2) 100%)"
              : "var(--surface-2)",
            color: isOwn ? "#fff" : "var(--text)",
            border: isOwn ? "1px solid var(--accent-2)" : "1px solid var(--border)",
            borderBottomRightRadius: isOwn ? 4 : 14,
            borderBottomLeftRadius: isOwn ? 14 : 4,
            fontSize: "0.78rem",
            lineHeight: 1.45,
            wordBreak: "break-word",
            overflowWrap: "anywhere",
            whiteSpace: "pre-wrap",
            minWidth: 0,
            boxShadow: isOwn
              ? "inset 0 1px 0 rgba(255,255,255,0.18), 0 1px 2px rgba(0,98,204,0.2), 0 4px 10px -4px rgba(0,122,255,0.32)"
              : "var(--tier-1)",
          }}
        >
          {message.body}

          {message.attachments.length > 0 && (
            <div
              style={{
                marginTop: "0.45rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.3rem",
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
                    gap: "0.4rem",
                    fontSize: "0.7rem",
                    padding: "0.3rem 0.45rem",
                    borderRadius: "7px",
                    background: isOwn ? "rgba(255,255,255,0.18)" : "var(--surface)",
                    border: isOwn
                      ? "1px solid rgba(255,255,255,0.26)"
                      : "1px solid var(--border)",
                    color: isOwn ? "#fff" : "var(--text-2)",
                    textDecoration: "none",
                  }}
                >
                  <FileText size={11} />
                  <span style={{
                    flex: 1, overflow: "hidden", textOverflow: "ellipsis",
                    whiteSpace: "nowrap", minWidth: 0,
                  }}>
                    {a.name}
                  </span>
                  <Download size={11} />
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

/** Compact chat-style timestamp: "14:32" for today, "12 mai 14:32" otherwise. */
function formatShort(date: Date): string {
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  if (sameDay) {
    return new Intl.DateTimeFormat("fr-CH", { hour: "2-digit", minute: "2-digit" }).format(date);
  }
  return new Intl.DateTimeFormat("fr-CH", {
    day: "numeric",
    month: "short",
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
