"use client";

// Shared conversation state for every agent surface (full-screen /chat,
// the FloatingDock preview on dashboard/rapports). Owns the list of
// conversations, the active id, in-flight stream state, and the localStorage
// rehydration/persistence under `orkestra.agent-test.conversations.v1`.
//
// Memory is NOT owned here — /chat still owns its memory store + drawer and
// passes the current memory list to `send()` on a per-call basis via
// `opts.memories`. That keeps this provider free of any dependency on the
// agent runtime or the memory store.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Memory, MemoryInput } from "@/agent/memory/types";
import { getMemoryStore } from "@/agent/memory/store";
import type {
  AgentEvent,
  Conversation,
  Message,
  ToolCall,
  ToolResult,
} from "./agent-types";

// Re-export shared types from the provider module for ergonomic imports.
export type {
  AgentEvent,
  Conversation,
  Message,
  ToolCall,
  ToolResult,
} from "./agent-types";

// localStorage key for persisted conversations. Bump the suffix if the
// Conversation/Message shape ever changes in a breaking way.
const STORAGE_KEY = "orkestra.agent-test.conversations.v1";

const nowId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

function deriveTitle(msg: string): string {
  const t = msg.trim().replace(/\s+/g, " ");
  return t.length > 48 ? t.slice(0, 46) + "…" : t;
}

function makeMessageId(): string {
  return "m-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function freshConversation(): Conversation {
  return {
    id: nowId(),
    title: "Nouvelle conversation",
    messages: [],
    createdAt: Date.now(),
  };
}

export interface SendOptions {
  memories?: Memory[];
}

export interface AgentConversationContextValue {
  conversations: Conversation[];
  activeId: string;
  active: Conversation;
  loading: boolean;
  error: string | null;
  activeTool: string | null;

  setActive: (id: string) => void;
  newConversation: () => string;
  deleteConversation: (id: string) => void;
  send: (text: string, opts?: SendOptions) => Promise<void>;
  stop: () => void;
  editUserMessage: (messageId: string, newText?: string) => void;
  clearError: () => void;
}

const AgentConversationContext =
  createContext<AgentConversationContextValue | null>(null);

export function AgentConversationProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>(() => [
    freshConversation(),
  ]);
  const [activeId, setActiveId] = useState(conversations[0].id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  // Becomes true once localStorage has been read. Guards the persist effect
  // so it can't clobber saved data with the default state before rehydration.
  const [hydrated, setHydrated] = useState(false);

  // Controller for the in-flight /api/agent request, so the stop button can
  // abort it. Null whenever no request is streaming.
  const abortRef = useRef<AbortController | null>(null);
  // Memory store handle for draining `save_memory` proposals after the stream
  // finishes. Memory state itself lives in the caller (/chat).
  const memoryStoreRef = useRef(getMemoryStore());

  const active =
    conversations.find((c) => c.id === activeId) ?? conversations[0];

  // ── localStorage rehydration ────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          conversations?: Conversation[];
          activeId?: string;
        };
        if (parsed.conversations && parsed.conversations.length > 0) {
          // Backfill message ids for legacy persisted data — required so
          // `editUserMessage(messageId)` can address rehydrated messages.
          const conv = parsed.conversations.map((c) => ({
            ...c,
            messages: c.messages.map((m) =>
              m.id ? m : { ...m, id: makeMessageId() },
            ),
          }));
          setConversations(conv);
          const target = conv.some((c) => c.id === parsed.activeId)
            ? parsed.activeId!
            : conv[0].id;
          setActiveId(target);
        }
      }
    } catch {
      // Corrupt or unavailable storage — fall back to the fresh conversation.
    }
    setHydrated(true);
  }, []);

  // ── localStorage persistence ────────────────────────────────────────────
  useEffect(() => {
    if (!hydrated) return;
    try {
      // Tool results can be large (a SQL query may return up to 1000 rows),
      // so they are stripped from the persisted copy — the answer text,
      // tool-call args and usage are what's worth keeping across reloads,
      // and dropping results keeps us comfortably under the storage quota.
      const slim: Conversation[] = conversations.map((c) => ({
        ...c,
        messages: c.messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          toolCalls: m.toolCalls,
          finishReason: m.finishReason,
          usage: m.usage,
          ts: m.ts,
        })),
      }));
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ conversations: slim, activeId }),
      );
    } catch {
      // Quota exceeded or storage disabled — persistence degrades silently.
    }
  }, [conversations, activeId, hydrated]);

  const updateActive = useCallback(
    (mut: (c: Conversation) => Conversation) => {
      setConversations((prev) =>
        prev.map((c) => (c.id === activeId ? mut(c) : c)),
      );
    },
    [activeId],
  );

  const setActive = useCallback((id: string) => {
    setActiveId(id);
    setError(null);
  }, []);

  const newConversation = useCallback(() => {
    const fresh = freshConversation();
    setConversations((prev) => [fresh, ...prev]);
    setActiveId(fresh.id);
    setError(null);
    return fresh.id;
  }, []);

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const next = prev.filter((c) => c.id !== id);
        if (next.length === 0) {
          const fresh = freshConversation();
          setActiveId(fresh.id);
          return [fresh];
        }
        if (id === activeId) setActiveId(next[0].id);
        return next;
      });
    },
    [activeId],
  );

  const send = useCallback(
    async (text: string, opts?: SendOptions) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: Message = {
        id: makeMessageId(),
        role: "user",
        content: trimmed,
        ts: Date.now(),
      };
      // Capture the current conversation's messages BEFORE we mutate state,
      // so the wire payload matches the actual prompt the model sees.
      const currentActive =
        conversations.find((c) => c.id === activeId) ?? conversations[0];
      const nextMessages = [...currentActive.messages, userMsg];

      updateActive((c) => ({
        ...c,
        messages: nextMessages,
        title: c.messages.length === 0 ? deriveTitle(trimmed) : c.title,
      }));
      setLoading(true);
      setError(null);

      const controller = new AbortController();
      abortRef.current = controller;

      // Hoisted so a save_memory proposal collected before an abort/error is
      // still drained in `finally`. Without this, the agent confirms "noté"
      // but the sidebar silently stays empty.
      const memoryProposals: MemoryInput[] = [];

      try {
        const res = await fetch("/api/agent?stream=events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: nextMessages.map(({ role, content }) => ({ role, content })),
            // Volatile block of the system prompt — the server treats an
            // empty array as "no memory section". Memories are owned by the
            // caller; we just relay them.
            memories: opts?.memories ?? [],
          }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(data?.error ?? `HTTP ${res.status}`);
        }

        // NDJSON stream — one JSON object per line.
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let textAcc = "";
        let placeholderAppended = false;
        const toolCalls: ToolCall[] = [];
        const toolResults: ToolResult[] = [];
        let usage: Message["usage"] = undefined;
        let finishReason: string | undefined;

        const ensureBubble = () => {
          if (placeholderAppended) return;
          placeholderAppended = true;
          updateActive((c) => ({
            ...c,
            messages: [
              ...c.messages,
              {
                id: makeMessageId(),
                role: "assistant",
                content: "",
                ts: Date.now(),
              },
            ],
          }));
        };

        const pushText = (delta: string) => {
          textAcc += delta;
          ensureBubble();
          updateActive((c) => {
            const msgs = c.messages.slice();
            const last = msgs[msgs.length - 1];
            if (last && last.role === "assistant") {
              msgs[msgs.length - 1] = { ...last, content: textAcc };
            }
            return { ...c, messages: msgs };
          });
        };

        const handleEvent = (ev: AgentEvent) => {
          switch (ev.t) {
            case "text":
              setActiveTool(null);
              pushText(ev.d);
              return;
            case "tool-call":
              setActiveTool(ev.toolName);
              toolCalls.push({
                toolName: ev.toolName,
                args: ev.args,
                toolCallId: ev.toolCallId,
              });
              return;
            case "tool-result":
              toolResults.push({
                toolName: ev.toolName,
                result: ev.result,
                toolCallId: ev.toolCallId,
              });
              if (ev.toolName === "save_memory") {
                const r = ev.result as
                  | { ok?: boolean; memory_proposal?: MemoryInput }
                  | undefined;
                if (r?.ok && r.memory_proposal) memoryProposals.push(r.memory_proposal);
              }
              return;
            case "step-finish":
              setActiveTool(null);
              return;
            case "finish":
              if (ev.usage) usage = ev.usage as Message["usage"];
              if (ev.finishReason) finishReason = ev.finishReason;
              return;
            case "error":
              throw new Error(ev.message);
          }
        };

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let nl: number;
          while ((nl = buffer.indexOf("\n")) !== -1) {
            const line = buffer.slice(0, nl);
            buffer = buffer.slice(nl + 1);
            if (!line.trim()) continue;
            let parsed: AgentEvent | null = null;
            try {
              parsed = JSON.parse(line) as AgentEvent;
            } catch {
              continue;
            }
            handleEvent(parsed);
          }
        }
        const tail = buffer + decoder.decode();
        if (tail.trim()) {
          try {
            handleEvent(JSON.parse(tail) as AgentEvent);
          } catch {
            /* ignore */
          }
        }

        setActiveTool(null);

        const displayFinal = textAcc.trim() === "" ? "_(réponse vide)_" : textAcc;
        const trailerFields = {
          toolCalls,
          toolResults,
          ...(usage ? { usage } : {}),
          ...(finishReason ? { finishReason } : {}),
        };

        if (!placeholderAppended) {
          updateActive((c) => ({
            ...c,
            messages: [
              ...c.messages,
              {
                id: makeMessageId(),
                role: "assistant",
                content: displayFinal,
                ts: Date.now(),
                ...trailerFields,
              },
            ],
          }));
        } else {
          updateActive((c) => {
            const msgs = c.messages.slice();
            const last = msgs[msgs.length - 1];
            if (last && last.role === "assistant") {
              msgs[msgs.length - 1] = {
                ...last,
                content: displayFinal,
                ...trailerFields,
              };
            }
            return { ...c, messages: msgs };
          });
        }
      } catch (err) {
        const isAbort =
          typeof err === "object" &&
          err !== null &&
          (err as { name?: string }).name === "AbortError";
        if (isAbort) {
          // Stop button — keep whatever streamed so far, mark it interrupted.
          updateActive((c) => {
            const msgs = c.messages.slice();
            const last = msgs[msgs.length - 1];
            if (last && last.role === "assistant") {
              msgs[msgs.length - 1] = {
                ...last,
                content: (last.content || "").trimEnd() + " …(interrompu)",
              };
              return { ...c, messages: msgs };
            }
            return {
              ...c,
              messages: [
                ...msgs,
                {
                  id: makeMessageId(),
                  role: "assistant",
                  content: "_(interrompu)_",
                  ts: Date.now(),
                },
              ],
            };
          });
        } else {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        abortRef.current = null;
        setActiveTool(null);
        setLoading(false);
        // Drain save_memory proposals regardless of how the stream ended —
        // the agent's confirmation already streamed before any abort, so
        // dropping these silently would be a UX lie. Persistence lives in
        // the memory store; the caller observes the resulting state by
        // reading the store after `send` resolves.
        if (memoryProposals.length > 0) {
          const store = memoryStoreRef.current;
          for (const p of memoryProposals) {
            try {
              await store.save(p);
            } catch {
              /* swallow — keep going on the others */
            }
          }
        }
      }
    },
    [loading, conversations, activeId, updateActive],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  // Trim the active conversation back to before the user message identified
  // by `messageId`. `newText` is advisory — callers (notably /chat) use it
  // to prefill their composer; this method doesn't auto-resubmit.
  const editUserMessage = useCallback(
    (messageId: string, _newText?: string) => {
      void _newText;
      updateActive((c) => {
        const idx = c.messages.findIndex(
          (m) => m.id === messageId && m.role === "user",
        );
        if (idx === -1) return c;
        return { ...c, messages: c.messages.slice(0, idx) };
      });
      setError(null);
    },
    [updateActive],
  );

  const clearError = useCallback(() => setError(null), []);

  return (
    <AgentConversationContext.Provider
      value={{
        conversations,
        activeId,
        active,
        loading,
        error,
        activeTool,
        setActive,
        newConversation,
        deleteConversation,
        send,
        stop,
        editUserMessage,
        clearError,
      }}
    >
      {children}
    </AgentConversationContext.Provider>
  );
}

export function useAgentConversation(): AgentConversationContextValue {
  const ctx = useContext(AgentConversationContext);
  if (!ctx) {
    throw new Error(
      "useAgentConversation must be used inside <AgentConversationProvider>",
    );
  }
  return ctx;
}
