"use client";

// FloatingDock — a chat-preview pill that morphs into a 420×354 panel and
// reads the same conversation state as /chat via AgentConversationProvider.
//
// Visual reference: the avatar+bell dock from commit ca8b321
// (`src/components/b/FloatingDock.tsx`) — same outer container, same spring,
// same shadow stack. The PILL CONTENT and PANEL CONTENT swap to a chat
// preview surface, but the morph geometry is verbatim.

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import Link from "next/link";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { ArrowUp, Sparkles, Square, X } from "lucide-react";
import { Markdown } from "@/app/chat/markdown";
import {
  useAgentConversation,
  type Message,
} from "@/components/dashboard/AgentConversationProvider";

const PILL_W = 84;
const PILL_H = 48;
const PANEL_W = 420;
const PANEL_H = 354;

const dockSpring = {
  type: "spring" as const,
  stiffness: 280,
  damping: 26,
  mass: 1,
};

const EXAMPLES = [
  "Quels sont les renouvellements urgents dans les 30 prochains jours ?",
  "Top 3 clients par CA de primes encaissées en 2025.",
  "Quel est le ratio de sinistralité sur la branche cyber ?",
];

export function FloatingDock() {
  const { active, loading, send, stop } = useAgentConversation();

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // ESC closes the panel — matches the reference dock's behaviour.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Autoscroll to the bottom on new messages or on open. The dock is a
  // preview, not a full reader, so we always pin to the latest turn.
  useEffect(() => {
    if (!open) return;
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [open, active.messages, loading]);

  // Focus the composer when the panel opens, but not while a stream is in
  // flight (the textarea is disabled then).
  useEffect(() => {
    if (open && !loading) {
      const t = setTimeout(() => inputRef.current?.focus(), 220);
      return () => clearTimeout(t);
    }
  }, [open, loading]);

  const submit = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;
      setInput("");
      await send(trimmed);
    },
    [send, loading],
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void submit(input);
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void submit(input);
    }
  };

  // Filter the conversation down to the user/assistant turns. Tool calls and
  // tool results live in the full /chat view; the dock keeps things light.
  const previewMessages = active.messages.filter(
    (m) => m.role === "user" || m.role === "assistant",
  );

  return (
    <LayoutGroup id="dock">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 39,
              background: "transparent",
            }}
          />
        )}
      </AnimatePresence>

      <motion.div
        animate={{
          width: open ? PANEL_W : PILL_W,
          height: open ? PANEL_H : PILL_H,
          borderRadius: open ? 14 : 100,
        }}
        transition={dockSpring}
        style={{
          position: "fixed",
          bottom: "1.25rem",
          right: "1.25rem",
          zIndex: 40,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          boxShadow:
            "0 1px 2px rgba(15,23,42,0.04), 0 14px 32px -10px rgba(15,23,42,0.22)",
          overflow: "hidden",
          transformOrigin: "bottom right",
          fontFamily: "var(--font-sans), system-ui, sans-serif",
        }}
      >
        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Ouvrir l'assistant Orkestra"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              borderRadius: 100,
              color: "var(--accent)",
              transition: "background 0.15s",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--surface-2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <Sparkles size={22} strokeWidth={2} aria-hidden="true" />
          </button>
        )}

        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: { delay: 0.12, duration: 0.18, ease: [0.22, 1, 0.36, 1] },
            }}
            exit={{ opacity: 0, transition: { duration: 0.08 } }}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
          >
            <DockHeader loading={loading} onClose={() => setOpen(false)} />
            <DockBody
              ref={bodyRef}
              messages={previewMessages}
              loading={loading}
              onPickExample={(q) => void submit(q)}
            />
            <DockComposer
              inputRef={inputRef}
              value={input}
              onChange={setInput}
              onSubmit={onSubmit}
              onKey={onKeyDown}
              loading={loading}
              onStop={stop}
            />
          </motion.div>
        )}
      </motion.div>
    </LayoutGroup>
  );
}

export default FloatingDock;

/* ───────────────────────── Header ───────────────────────── */

function DockHeader({
  loading,
  onClose,
}: {
  loading: boolean;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        flex: "0 0 auto",
        height: 52,
        display: "flex",
        alignItems: "center",
        gap: "0.6rem",
        padding: "0 0.85rem",
        background:
          "linear-gradient(to right, var(--accent-tint), transparent 70%), var(--surface)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <span
        style={{
          width: 30,
          height: 30,
          borderRadius: 9,
          background: "linear-gradient(to bottom, var(--accent), var(--accent-2))",
          color: "#FFFFFF",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)",
          flexShrink: 0,
        }}
      >
        <Sparkles size={14} strokeWidth={2} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "0.9rem",
            fontWeight: 600,
            color: "var(--text)",
            letterSpacing: "-0.01em",
            lineHeight: 1.15,
          }}
        >
          Orkestra IA
        </div>
        <div
          style={{
            fontSize: "0.7rem",
            color: "var(--text-3)",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
            marginTop: 1,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: loading ? "var(--warn)" : "var(--success)",
              boxShadow: loading
                ? "0 0 0 3px rgba(255,159,10,0.18)"
                : "0 0 0 3px rgba(52,168,83,0.18)",
              transition: "background 0.2s, box-shadow 0.2s",
            }}
          />
          {loading ? "Réflexion en cours…" : "BrokerStar + Odoo"}
        </div>
      </div>
      <Link
        href="/chat"
        style={{
          fontSize: "0.72rem",
          fontWeight: 600,
          color: "var(--accent)",
          textDecoration: "none",
          padding: "0.25rem 0.45rem",
          borderRadius: 7,
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.background =
            "var(--accent-tint)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
        }}
      >
        Ouvrir →
      </Link>
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer"
        style={{
          width: 26,
          height: 26,
          borderRadius: 7,
          border: "none",
          background: "transparent",
          color: "var(--text-3)",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.15s, color 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--surface-3)";
          e.currentTarget.style.color = "var(--text-2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "var(--text-3)";
        }}
      >
        <X size={13} strokeWidth={2.25} />
      </button>
    </div>
  );
}

/* ───────────────────────── Body ───────────────────────── */

interface BodyProps {
  messages: Message[];
  loading: boolean;
  onPickExample: (q: string) => void;
}

const DockBody = forwardRef<HTMLDivElement, BodyProps>(function DockBody(
  { messages, loading, onPickExample },
  ref,
) {
  const lastIdx = messages.length - 1;
  const last = lastIdx >= 0 ? messages[lastIdx] : null;
  // Whether the latest assistant message is mid-stream (empty content while
  // loading → render the 3-dot pulse; non-empty while loading → blinking
  // caret after the text). Mirrors /chat's bubble streaming affordances.
  const lastAssistantStreaming =
    loading && last?.role === "assistant";
  return (
    <div
      ref={ref}
      style={{
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
        padding: "0.9rem 0.9rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.8rem",
        background: "var(--surface-2)",
      }}
    >
      {messages.length === 0 ? (
        <EmptyState onPickExample={onPickExample} />
      ) : (
        messages.map((m, i) => (
          <Bubble
            key={m.id ?? `${m.role}-${i}`}
            message={m}
            streaming={lastAssistantStreaming && i === lastIdx}
          />
        ))
      )}
      {loading && last?.role !== "assistant" && <PendingDots />}
      <style>{`
        @keyframes fdock-caret { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes fdock-dot { 0%,80%,100% { transform: scale(0.6); opacity: 0.4 } 40% { transform: scale(1); opacity: 1 } }
      `}</style>
    </div>
  );
});

function EmptyState({
  onPickExample,
}: {
  onPickExample: (q: string) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.55rem",
        padding: "0.25rem 0.15rem",
      }}
    >
      <div
        style={{
          fontSize: "0.82rem",
          color: "var(--text-2)",
          lineHeight: 1.5,
        }}
      >
        Bonjour Thomas. Pose-moi une question sur le cabinet — clients, contrats,
        sinistres, renouvellements.
      </div>
      <div
        style={{
          fontSize: "0.66rem",
          fontWeight: 600,
          color: "var(--text-4)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          marginTop: "0.3rem",
        }}
      >
        Exemples
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        {EXAMPLES.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onPickExample(q)}
            style={{
              textAlign: "left",
              fontFamily: "inherit",
              fontSize: "0.8rem",
              color: "var(--text-2)",
              background: "var(--surface)",
              border: "none",
              borderRadius: 10,
              padding: "0.5rem 0.7rem",
              cursor: "pointer",
              boxShadow: "var(--tier-1)",
              transition: "transform 0.18s, box-shadow 0.18s",
              lineHeight: 1.4,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "var(--tier-2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "var(--tier-1)";
            }}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

function Bubble({
  message,
  streaming,
}: {
  message: Message;
  streaming: boolean;
}) {
  if (message.role === "user") {
    return (
      <div
        style={{
          alignSelf: "flex-end",
          maxWidth: "85%",
          background: "var(--accent-tint)",
          color: "var(--text)",
          padding: "0.5rem 0.75rem",
          borderRadius: "14px 14px 4px 14px",
          fontSize: "0.85rem",
          lineHeight: 1.45,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {message.content}
      </div>
    );
  }

  const showThinkingDots = streaming && message.content.length === 0;

  return (
    <div
      style={{
        alignSelf: "flex-start",
        maxWidth: "100%",
        width: "100%",
        display: "flex",
        gap: "0.55rem",
      }}
    >
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: 7,
          background: "linear-gradient(to bottom, var(--accent), var(--accent-2))",
          color: "#FFFFFF",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: 2,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)",
        }}
      >
        <Sparkles size={11} strokeWidth={2.25} />
      </span>
      <div style={{ flex: 1, minWidth: 0, fontSize: "0.86rem" }}>
        {showThinkingDots ? (
          <ThinkingDots />
        ) : (
          <Markdown source={message.content} />
        )}
        {streaming && message.content.length > 0 && (
          <span
            aria-hidden
            style={{
              display: "inline-block",
              width: 7,
              height: 13,
              marginLeft: 2,
              verticalAlign: -2,
              background: "var(--accent)",
              animation: "fdock-caret 1s steps(2) infinite",
            }}
          />
        )}
      </div>
    </div>
  );
}

function ThinkingDots() {
  return (
    <span
      style={{
        display: "inline-flex",
        gap: 4,
        alignItems: "center",
        padding: "0.3rem 0",
      }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--accent)",
            animation: `fdock-dot 1.1s ${i * 0.16}s infinite ease-in-out`,
          }}
        />
      ))}
    </span>
  );
}

// Rendered between the last (user) message and the not-yet-appended
// assistant bubble while we wait for the first text chunk.
function PendingDots() {
  return (
    <div
      style={{
        alignSelf: "flex-start",
        display: "flex",
        gap: "0.55rem",
        alignItems: "center",
      }}
    >
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: 7,
          background: "linear-gradient(to bottom, var(--accent), var(--accent-2))",
          color: "#FFFFFF",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)",
        }}
      >
        <Sparkles size={11} strokeWidth={2.25} />
      </span>
      <ThinkingDots />
    </div>
  );
}

/* ───────────────────────── Composer ───────────────────────── */

interface ComposerProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (e: FormEvent) => void;
  onKey: (e: ReactKeyboardEvent<HTMLTextAreaElement>) => void;
  loading: boolean;
  onStop: () => void;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
}

function DockComposer({
  value,
  onChange,
  onSubmit,
  onKey,
  loading,
  onStop,
  inputRef,
}: ComposerProps) {
  const canSend = value.trim().length > 0 && !loading;
  return (
    <form
      onSubmit={onSubmit}
      style={{
        flex: "0 0 auto",
        height: 54,
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0 0.75rem",
        borderTop: "1px solid var(--border)",
        background: "var(--surface)",
      }}
    >
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKey}
        rows={1}
        placeholder="Pose une question…"
        style={{
          flex: 1,
          resize: "none",
          background: "var(--surface-2)",
          border: "none",
          borderRadius: 10,
          padding: "0.5rem 0.7rem",
          fontFamily: "inherit",
          fontSize: "0.86rem",
          color: "var(--text)",
          outline: "none",
          maxHeight: 80,
          lineHeight: 1.4,
          boxShadow: "inset 0 0 0 1px var(--border)",
        }}
      />
      {loading ? (
        <button
          type="button"
          onClick={onStop}
          aria-label="Arrêter"
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            background: "var(--danger)",
            color: "#FFFFFF",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontFamily: "inherit",
          }}
        >
          <Square size={12} strokeWidth={2.5} fill="#FFFFFF" />
        </button>
      ) : (
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Envoyer"
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            border: "none",
            cursor: canSend ? "pointer" : "default",
            background: canSend
              ? "linear-gradient(to bottom, var(--accent), var(--accent-2))"
              : "var(--surface-3)",
            color: canSend ? "#FFFFFF" : "var(--text-4)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "background 0.18s, color 0.18s",
            boxShadow: canSend
              ? "inset 0 1px 0 rgba(255,255,255,0.25), 0 0 0 1px rgba(68,65,200,0.30), 0 4px 12px -4px rgba(88,86,214,0.40)"
              : "none",
            fontFamily: "inherit",
          }}
        >
          <ArrowUp size={14} strokeWidth={2.25} />
        </button>
      )}
    </form>
  );
}
