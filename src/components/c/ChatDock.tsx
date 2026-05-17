"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type RefObject,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowUp, X, Square } from "lucide-react";
import { Markdown } from "@/app/agent-test/markdown";
import { AGENT_META_SENTINEL } from "@/agent/protocol";
import { useChatDock } from "./ChatDockContext";

type Role = "user" | "assistant";

interface Message {
  id: string;
  role: Role;
  content: string;
  streaming?: boolean;
}

const EXAMPLES = [
  "Quels sont les renouvellements urgents dans les 30 prochains jours ?",
  "Top 3 clients par CA de primes encaissées en 2025.",
  "Quel est le ratio de sinistralité sur la branche cyber ?",
];

export default function ChatDock() {
  const { open, pendingSeed, openDock, closeDock, consumeSeed } = useChatDock();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      // Abort any in-flight stream before starting a new one.
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const userMsg: Message = {
        id: `u-${Date.now()}`,
        role: "user",
        content: trimmed,
      };
      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: "",
        streaming: true,
      };

      // Build the wire payload from the *previous* messages + this user turn.
      // We mirror /agent-test: keep history compact, only role + content.
      const wireMessages = [...messages, userMsg].map(({ role, content }) => ({
        role,
        content,
      }));

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setInput("");
      setStreaming(true);

      try {
        const res = await fetch("/api/agent?stream=text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: wireMessages }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          throw new Error(`Agent error (${res.status})`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        let truncated = false;

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (!truncated) {
            acc += decoder.decode(value, { stream: true });
            const idx = acc.indexOf(AGENT_META_SENTINEL);
            if (idx >= 0) {
              acc = acc.slice(0, idx);
              truncated = true;
            }
            const snapshot = acc;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsg.id ? { ...m, content: snapshot } : m,
              ),
            );
          }
          // After the sentinel we ignore the JSON trailer — "answer only" mode.
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        const msg = err instanceof Error ? err.message : String(err);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? { ...m, content: `⚠️ ${msg}`, streaming: false }
              : m,
          ),
        );
      } finally {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id ? { ...m, streaming: false } : m,
          ),
        );
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [messages],
  );

  // Keep a ref to the latest sendMessage so the seed effect doesn't need it
  // in its dep array (which would re-fire on every message change).
  const sendMessageRef = useRef(sendMessage);
  useLayoutEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  // When a card pushes a seed question while the dock is open, auto-send it.
  useEffect(() => {
    if (!open || !pendingSeed) return;
    const seed = consumeSeed();
    if (seed) void sendMessageRef.current(seed);
  }, [open, pendingSeed, consumeSeed]);

  // Auto-scroll to latest content.
  useEffect(() => {
    if (!open) return;
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [open, messages]);

  // Focus the input when the dock opens (unless we're streaming a seed reply).
  useEffect(() => {
    if (open && !streaming) {
      const t = setTimeout(() => inputRef.current?.focus(), 220);
      return () => clearTimeout(t);
    }
  }, [open, streaming]);

  const stop = () => {
    abortRef.current?.abort();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (streaming) return;
    void sendMessage(input);
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!streaming) void sendMessage(input);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 60,
        fontFamily: "var(--font-sans), system-ui, sans-serif",
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {open ? (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{
              width: "min(420px, calc(100vw - 32px))",
              height: "min(620px, calc(100vh - 48px))",
              background: "var(--surface)",
              borderRadius: 18,
              boxShadow: "var(--tier-2)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              transformOrigin: "bottom right",
            }}
          >
            <Header onClose={closeDock} streaming={streaming} />
            <Body
              ref={bodyRef}
              messages={messages}
              onPickExample={(q) => void sendMessage(q)}
            />
            <Composer
              inputRef={inputRef}
              value={input}
              onChange={setInput}
              onSubmit={handleSubmit}
              onKey={handleKey}
              streaming={streaming}
              onStop={stop}
            />
          </motion.div>
        ) : (
          <motion.button
            key="pill"
            type="button"
            onClick={() => openDock()}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.18 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            aria-label="Ouvrir l'assistant Orkestra"
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              border: "none",
              cursor: "pointer",
              background: "linear-gradient(to bottom, var(--accent), var(--accent-2))",
              color: "#FFFFFF",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.25), 0 0 0 1px rgba(68,65,200,0.30), 0 8px 22px -6px rgba(88,86,214,0.55)",
              transition: "box-shadow 0.22s ease",
              fontFamily: "inherit",
            }}
          >
            <Sparkles size={22} strokeWidth={2} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Header ───────────────────────────────────────────────────────── */

function Header({ onClose, streaming }: { onClose: () => void; streaming: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.7rem",
        padding: "0.85rem 0.95rem",
        background:
          "linear-gradient(to right, var(--accent-tint), transparent 70%), var(--surface)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <span
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          background: "linear-gradient(to bottom, var(--accent), var(--accent-2))",
          color: "#FFFFFF",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)",
          flexShrink: 0,
        }}
      >
        <Sparkles size={15} strokeWidth={2} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "0.92rem",
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
              background: streaming ? "var(--warn)" : "var(--success)",
              boxShadow: streaming
                ? "0 0 0 3px rgba(255,159,10,0.18)"
                : "0 0 0 3px rgba(52,168,83,0.18)",
              transition: "background 0.2s, box-shadow 0.2s",
            }}
          />
          {streaming ? "Réflexion en cours…" : "BrokerStar + Odoo"}
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer"
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
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
        <X size={14} strokeWidth={2.25} />
      </button>
    </div>
  );
}

/* ─── Body ─────────────────────────────────────────────────────────── */

interface BodyProps {
  messages: Message[];
  onPickExample: (q: string) => void;
}

const Body = forwardRef<HTMLDivElement, BodyProps>(function Body(
  { messages, onPickExample },
  ref,
) {
  return (
    <div
      ref={ref}
      style={{
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
        padding: "1rem 0.95rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.85rem",
        background: "var(--surface-2)",
      }}
    >
      {messages.length === 0 ? (
        <EmptyState onPickExample={onPickExample} />
      ) : (
        messages.map((m) => <Bubble key={m.id} message={m} />)
      )}
    </div>
  );
});

function EmptyState({ onPickExample }: { onPickExample: (q: string) => void }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.65rem",
        padding: "0.5rem 0.25rem",
      }}
    >
      <div
        style={{
          fontSize: "0.82rem",
          color: "var(--text-2)",
          lineHeight: 1.5,
        }}
      >
        Bonjour Thomas. Pose-moi une question sur le cabinet — clients, contrats, sinistres, renouvellements.
      </div>
      <div
        style={{
          fontSize: "0.66rem",
          fontWeight: 600,
          color: "var(--text-4)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          marginTop: "0.35rem",
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
              padding: "0.55rem 0.7rem",
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

function Bubble({ message }: { message: Message }) {
  if (message.role === "user") {
    return (
      <div
        style={{
          alignSelf: "flex-end",
          maxWidth: "85%",
          background: "var(--accent-tint)",
          color: "var(--text)",
          padding: "0.55rem 0.8rem",
          borderRadius: "14px 14px 4px 14px",
          fontSize: "0.86rem",
          lineHeight: 1.45,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {message.content}
      </div>
    );
  }

  const showThinkingDots = message.streaming && message.content.length === 0;

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
      <div style={{ flex: 1, minWidth: 0 }}>
        {showThinkingDots ? (
          <ThinkingDots />
        ) : (
          <Markdown source={message.content} />
        )}
        {message.streaming && message.content.length > 0 && (
          <span
            aria-hidden
            style={{
              display: "inline-block",
              width: 7,
              height: 14,
              marginLeft: 2,
              verticalAlign: -2,
              background: "var(--accent)",
              animation: "orkestra-caret 1s steps(2) infinite",
            }}
          />
        )}
      </div>
      <style>{`
        @keyframes orkestra-caret {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes orkestra-dot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
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
        padding: "0.35rem 0",
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
            animation: `orkestra-dot 1.1s ${i * 0.16}s infinite ease-in-out`,
          }}
        />
      ))}
    </span>
  );
}

/* ─── Composer ─────────────────────────────────────────────────────── */

interface ComposerProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (e: FormEvent) => void;
  onKey: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  streaming: boolean;
  onStop: () => void;
  inputRef: RefObject<HTMLTextAreaElement | null>;
}

function Composer({
  value,
  onChange,
  onSubmit,
  onKey,
  streaming,
  onStop,
  inputRef,
}: ComposerProps) {
  const canSend = value.trim().length > 0 && !streaming;
  return (
    <form
      onSubmit={onSubmit}
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: "0.5rem",
        padding: "0.7rem 0.75rem 0.85rem",
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
          padding: "0.55rem 0.7rem",
          fontFamily: "inherit",
          fontSize: "0.88rem",
          color: "var(--text)",
          outline: "none",
          maxHeight: 120,
          lineHeight: 1.4,
          boxShadow: "inset 0 0 0 1px var(--border)",
        }}
      />
      {streaming ? (
        <button
          type="button"
          onClick={onStop}
          aria-label="Arrêter"
          style={{
            width: 36,
            height: 36,
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
          <Square size={13} strokeWidth={2.5} fill="#FFFFFF" />
        </button>
      ) : (
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Envoyer"
          style={{
            width: 36,
            height: 36,
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
          <ArrowUp size={15} strokeWidth={2.25} />
        </button>
      )}
    </form>
  );
}
