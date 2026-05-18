"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUp,
  Plus,
  MessageSquare,
  Trash2,
  Sparkles,
  Calendar,
  Building2,
  TrendingUp,
  AlertTriangle,
  GitCompareArrows,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Database,
  Wrench,
  Cpu,
  CircleCheck,
  CircleAlert,
  PanelLeftClose,
  PanelLeftOpen,
  BookmarkPlus,
  Bookmark,
  Eye,
  StickyNote,
  Settings2,
  X,
  Pencil,
  Copy,
  Check,
  Search,
  Mic,
  MicOff,
  Brain,
} from "lucide-react";
import { Markdown } from "./markdown";
import type { Memory, MemoryInput, MemoryKind } from "@/agent/memory/types";
import { getMemoryStore } from "@/agent/memory/store";
import { isVoiceInputSupported, startVoiceInput, type VoiceSession } from "./voice-input";

/* ─── Plinth tokens (matches /c design language) ─── */
const T = {
  bg: "#F5F5F7",
  surface: "#FFFFFF",
  surface2: "#FBFBFD",
  surface3: "#F2F2F4",
  border: "rgba(0,0,0,0.06)",
  borderStrong: "rgba(0,0,0,0.10)",
  text: "#1D1D1F",
  text2: "#424245",
  text3: "#6E6E73",
  text4: "#86868B",
  accent: "#5856D6",
  accent2: "#4441C8",
  accentTint: "rgba(88,86,214,0.16)",
  accentTint2: "rgba(88,86,214,0.10)",
  success: "#34A853",
  successTint: "rgba(52,168,83,0.10)",
  warn: "#FF9F0A",
  warnTint: "rgba(255,159,10,0.10)",
  danger: "#FF3B30",
  dangerTint: "rgba(255,59,48,0.10)",
  info: "#007AFF",
  infoTint: "rgba(0,122,255,0.10)",
  // Elevation system (Plinth tier-1 / tier-2)
  tier1:
    "inset 0 1px 0 rgba(255,255,255,1), 0 0 0 1px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.05), 0 6px 16px -10px rgba(0,0,0,0.12)",
  tier2:
    "inset 0 1px 0 rgba(255,255,255,1), 0 0 0 1px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.06), 0 16px 32px -12px rgba(0,0,0,0.18)",
  gradient: "linear-gradient(to bottom, #5856D6, #4441C8)",
  gradientShadow:
    "inset 0 1px 0 rgba(255,255,255,0.25), 0 0 0 1px rgba(68,65,200,0.30), 0 4px 14px -4px rgba(88,86,214,0.40)",
  gradientShadowHover:
    "inset 0 1px 0 rgba(255,255,255,0.25), 0 0 0 1px rgba(68,65,200,0.30), 0 8px 20px -4px rgba(88,86,214,0.50)",
};

/* ─── shared per-message action button style ─── */

const actionPillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.3rem",
  padding: "0.25rem 0.55rem",
  background: T.surface,
  border: "none",
  borderRadius: 7,
  fontFamily: "inherit",
  fontSize: "0.68rem",
  fontWeight: 600,
  color: T.text3,
  cursor: "pointer",
  textTransform: "none",
  letterSpacing: 0,
  boxShadow: T.tier1,
  transition: "color 0.15s, transform 0.18s ease",
};

function actionPillHoverIn(e: React.MouseEvent<HTMLButtonElement>) {
  e.currentTarget.style.color = T.accent;
  e.currentTarget.style.transform = "translateY(-1px)";
}
function actionPillHoverOut(e: React.MouseEvent<HTMLButtonElement>) {
  e.currentTarget.style.color = T.text3;
  e.currentTarget.style.transform = "translateY(0)";
}

/* ─── types ─── */

type ToolCall = { toolName: string; args: unknown; toolCallId?: string };
type ToolResult = { toolName: string; result: unknown; toolCallId?: string };
type Message = {
  role: "user" | "assistant";
  content: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
  finishReason?: string;
  usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number };
  ts?: number;
};

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
};

type Health = {
  dataset?: Record<string, number>;
  model?: string;
  has_api_key?: boolean;
};

const SUGGESTIONS: {
  title: string;
  hint: string;
  prompt: string;
  Icon: typeof BarChart3;
}[] = [
  {
    title: "KPI consolidés",
    hint: "Aperçu exécutif du cabinet",
    prompt: "Donne-moi les KPI consolidés du cabinet.",
    Icon: BarChart3,
  },
  {
    title: "Sinistralité par branche",
    hint: "Loss ratio détaillé",
    prompt: "Quel est le ratio de sinistralité par branche ?",
    Icon: AlertTriangle,
  },
  {
    title: "Renouvellements urgents",
    hint: "Échéances dans 30 jours",
    prompt: "Liste les renouvellements à échéance dans 30 jours.",
    Icon: Calendar,
  },
  {
    title: "Profil client",
    hint: "Vue 360° d'un dossier",
    prompt: "Profil du client CLT001.",
    Icon: Building2,
  },
  {
    title: "Courtier le plus rentable",
    hint: "Classement des portefeuilles",
    prompt: "Quel courtier a le portefeuille le plus rentable ?",
    Icon: TrendingUp,
  },
  {
    title: "AXA vs Zurich",
    hint: "Comparaison de compagnies",
    prompt: "Compare la performance des compagnies AXA et Zurich.",
    Icon: GitCompareArrows,
  },
];

/* ─── Helpers ─── */

// localStorage key for persisted conversations. Bump the suffix if the
// Conversation/Message shape ever changes in a breaking way.
const STORAGE_KEY = "orkestra.agent-test.conversations.v1";

// Persisted sidebar collapse state. Independent from STORAGE_KEY so a
// conversation-schema bump doesn't reset the layout preference.
const SIDEBAR_STATE_KEY = "orkestra.agent-test.sidebar.v1";

// Below this width the sidebar becomes an overlay drawer and defaults to
// closed on first visit. Keep this in sync with the @media breakpoint at the
// bottom of the file.
const SIDEBAR_BREAKPOINT = 820;

const nowId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// French label shown in the live activity indicator while a tool is
// running. Falls back to the raw tool name if a label isn't mapped.
const TOOL_LABELS: Record<string, string> = {
  get_dashboard_kpis: "Calcul des KPI consolidés",
  get_revenue_summary: "Synthèse du chiffre d'affaires",
  get_sinistralite_ratio: "Calcul du ratio de sinistralité",
  get_pipeline_summary: "Analyse du pipeline commercial",
  get_client: "Recherche du client",
  get_contrat: "Recherche du contrat",
  query_database: "Requête sur la base",
  save_memory: "Enregistrement d'un souvenir",
};
function toolLabel(name: string): string {
  return TOOL_LABELS[name] ?? name.replace(/_/g, " ");
}

// Event types the server emits on `?stream=events` (one JSON object per
// line). The schema is small on purpose — see the matching server side in
// src/app/api/agent/route.ts.
type AgentEvent =
  | { t: "text"; d: string }
  | { t: "tool-call"; toolCallId?: string; toolName: string; args: unknown }
  | { t: "tool-result"; toolCallId?: string; toolName: string; result: unknown }
  | { t: "step-finish"; finishReason?: string; usage?: unknown }
  | { t: "finish"; finishReason?: string; usage?: unknown }
  | { t: "error"; message: string };

function deriveTitle(msg: string): string {
  const t = msg.trim().replace(/\s+/g, " ");
  return t.length > 48 ? t.slice(0, 46) + "…" : t;
}

function fmt(n?: number): string {
  if (n == null) return "—";
  return n.toLocaleString("fr-CH");
}

/* ─── page ─── */

export default function AgentTestPage() {
  const [conversations, setConversations] = useState<Conversation[]>(() => [
    {
      id: nowId(),
      title: "Nouvelle conversation",
      messages: [],
      createdAt: Date.now(),
    },
  ]);
  const [activeId, setActiveId] = useState(conversations[0].id);
  const active = conversations.find((c) => c.id === activeId) ?? conversations[0];

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<Health | null>(null);
  // Default is true for SSR parity; on mount we override from localStorage or,
  // for first visits, from the viewport width (closed below SIDEBAR_BREAKPOINT
  // so mobile doesn't land on a full-screen drawer over a scrim).
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // Becomes true once localStorage has been read. Guards the persist effect
  // so it can't clobber saved data with the default state before rehydration.
  const [hydrated, setHydrated] = useState(false);
  // Tracks whether the layout breakpoint considers us "mobile" (drawer mode).
  // Updated on resize so the sidebar render mode reacts live.
  const [isMobileLayout, setIsMobileLayout] = useState(false);
  // True only while the user is scrolled away from the bottom of the message
  // list. Drives the "scroll to bottom" pill and pauses autoscroll on stream.
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  // Memory has graduated out of the sidebar into its own on-demand drawer
  // (right side on desktop, bottom sheet on mobile). The TopBar pill toggles
  // it; the dialog handlers below still drive create/edit independently.
  const [memoryDrawerOpen, setMemoryDrawerOpen] = useState(false);

  // User-scoped memories. The browser is the source of truth; we read them
  // on mount, mirror in state for rendering, and pass them on every POST so
  // the server injects them into the system prompt. The store is a thin
  // localStorage wrapper today; swap to a Postgres-backed adapter later
  // without touching this page (see src/agent/memory/store.ts).
  const [memories, setMemories] = useState<Memory[]>([]);
  // Save dialog state — when set, the dialog is open and prefilled.
  const [memoryDraft, setMemoryDraft] = useState<MemoryInput | null>(null);
  // When set, the memory dialog opens in edit mode bound to this existing
  // memory's id. Mutually exclusive with `memoryDraft` (create mode), but we
  // store both so the dialog can open transparently in either path.
  const [editingMemoryId, setEditingMemoryId] = useState<string | null>(null);
  // Tool currently running on the server, surfaced live in the activity
  // indicator. Cleared when a result arrives or when the stream ends.
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  // Controller for the in-flight /api/agent request, so the stop button can
  // abort it. Null whenever no request is streaming.
  const abortRef = useRef<AbortController | null>(null);
  // Memoised store handle — singleton inside the module, but keeping it on
  // a ref makes the dependency surface explicit for callbacks.
  const memoryStoreRef = useRef(getMemoryStore());
  // Mirror of the latest `send` for deferred callers (e.g. replaySavedView's
  // setTimeout). `send` is a useCallback that closes over `active.messages`;
  // capturing it directly in a timer would freeze it at the pre-defer state.
  const sendRef = useRef<(text: string) => Promise<void>>(async () => {});

  useEffect(() => {
    fetch("/api/agent")
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  // Rehydrate conversations from localStorage on mount. Done in an effect
  // (not a lazy useState initializer) so server and client render the same
  // initial markup — no hydration mismatch.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          conversations?: Conversation[];
          activeId?: string;
        };
        if (parsed.conversations && parsed.conversations.length > 0) {
          setConversations(parsed.conversations);
          const target = parsed.conversations.some(
            (c) => c.id === parsed.activeId,
          )
            ? parsed.activeId!
            : parsed.conversations[0].id;
          setActiveId(target);
        }
      }
    } catch {
      // Corrupt or unavailable storage — fall back to the fresh conversation.
    }

    // Sidebar state — explicit user preference wins; otherwise default by
    // viewport (closed below the breakpoint so mobile lands on the chat
    // rather than a full-screen drawer).
    const mobile = window.innerWidth < SIDEBAR_BREAKPOINT;
    setIsMobileLayout(mobile);
    try {
      const stored = window.localStorage.getItem(SIDEBAR_STATE_KEY);
      if (stored === "open") setSidebarOpen(true);
      else if (stored === "closed") setSidebarOpen(false);
      else setSidebarOpen(!mobile);
    } catch {
      setSidebarOpen(!mobile);
    }

    setHydrated(true);
  }, []);

  // Persist the sidebar preference after the user has had a chance to toggle.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(SIDEBAR_STATE_KEY, sidebarOpen ? "open" : "closed");
    } catch {
      // storage disabled — preference degrades to per-session.
    }
  }, [sidebarOpen, hydrated]);

  // Keep `isMobileLayout` reactive so the drawer styling/scrim toggle correctly
  // when the user rotates a tablet or resizes a desktop window. The matchMedia
  // listener avoids a window-resize spam.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(`(max-width: ${SIDEBAR_BREAKPOINT - 1}px)`);
    const sync = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobileLayout(e.matches);
    };
    sync(mql);
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  // Load memories on mount. Persistence inside the store is synchronous
  // (writes to localStorage on each save/update/remove), so we only need
  // to mirror reads here.
  useEffect(() => {
    memoryStoreRef.current
      .list()
      .then(setMemories)
      .catch(() => setMemories([]));
  }, []);

  // Persist conversations whenever they change (after the initial rehydrate).
  // Tool results can be large (a SQL query may return up to 1000 rows), so
  // they are stripped from the persisted copy — the answer text, tool-call
  // args and usage are what's worth keeping across reloads, and dropping
  // results keeps us comfortably under the storage quota.
  useEffect(() => {
    if (!hydrated) return;
    try {
      const slim: Conversation[] = conversations.map((c) => ({
        ...c,
        messages: c.messages.map((m) => ({
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

  // Autoscroll on new content — but only if the user is already pinned to the
  // bottom. The `showScrollBottom` flag (set by the scroll listener below) is
  // the source of truth: when the user has scrolled up to re-read context,
  // suppress the smooth scroll so we don't yank them back.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (!showScrollBottom) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [active.messages, loading, showScrollBottom]);

  // Track distance-from-bottom on the scroll container so we can (a) skip
  // autoscroll while the user is reading earlier turns and (b) reveal the
  // "scroll to bottom" pill. A small slack keeps the pill from flashing on
  // sub-pixel rounding.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowScrollBottom(distance > 120);
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [activeId]);

  // autogrow textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 220) + "px";
  }, [input]);

  const updateActive = useCallback(
    (mut: (c: Conversation) => Conversation) => {
      setConversations((prev) =>
        prev.map((c) => (c.id === activeId ? mut(c) : c)),
      );
    },
    [activeId],
  );

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: Message = { role: "user", content: trimmed, ts: Date.now() };
      const nextMessages = [...active.messages, userMsg];

      updateActive((c) => ({
        ...c,
        messages: nextMessages,
        title: c.messages.length === 0 ? deriveTitle(trimmed) : c.title,
      }));
      setInput("");
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
            // Volatile block of the system prompt — see B in the v1 plan.
            // Empty array is fine; the server treats it as "no memory section".
            memories,
          }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(data?.error ?? `HTTP ${res.status}`);
        }

        // NDJSON stream — one JSON object per line.
        // We accumulate state (text, tool calls/results, usage, finish reason)
        // as events arrive, push live updates to the bubble, and apply final
        // metadata once the stream completes. The activeTool indicator is
        // set on tool-call and cleared on the matching tool-result (or when
        // the next text delta arrives).
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
              { role: "assistant", content: "", ts: Date.now() },
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
              // save_memory proposals are applied to the local store after the
              // stream completes — batching keeps the sidebar update tidy.
              if (ev.toolName === "save_memory") {
                const r = ev.result as
                  | { ok?: boolean; memory_proposal?: MemoryInput }
                  | undefined;
                if (r?.ok && r.memory_proposal) memoryProposals.push(r.memory_proposal);
              }
              return;
            case "step-finish":
              // A step finished — clearing the active tool here gives a tiny
              // breather between "calling X" and "calling Y" in the UI.
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
        // Flush any trailing partial line (rare, but the decoder may have
        // buffered the last few bytes without a terminating newline).
        const tail = buffer + decoder.decode();
        if (tail.trim()) {
          try {
            handleEvent(JSON.parse(tail) as AgentEvent);
          } catch {
            /* ignore */
          }
        }

        setActiveTool(null);

        // Apply the final text and the accumulated tool/usage metadata to the
        // last assistant message (creating the bubble if no text ever streamed,
        // e.g. tool-only refusals).
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
                { role: "assistant", content: "_(interrompu)_", ts: Date.now() },
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
        // dropping these silently would be a UX lie.
        if (memoryProposals.length > 0) {
          const store = memoryStoreRef.current;
          const saved: Memory[] = [];
          for (const p of memoryProposals) {
            try {
              saved.push(await store.save(p));
            } catch {
              /* swallow — keep going on the others */
            }
          }
          if (saved.length > 0) setMemories((prev) => [...prev, ...saved]);
        }
      }
    },
    [active.messages, loading, updateActive, memories],
  );

  // Keep sendRef pointing at the latest `send` so deferred callers (timers
  // that fire after a state update has produced a new closure) hit the
  // current `active.messages` and `activeId`.
  useEffect(() => {
    sendRef.current = send;
  }, [send]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  // Edit & retry — trim the active conversation back to before the user turn
  // at `idx`, prefill the composer with its content, focus the textarea. The
  // user re-submits via Enter or the send button.
  const editUserMessage = useCallback(
    (idx: number) => {
      const msg = active.messages[idx];
      if (!msg || msg.role !== "user") return;
      setInput(msg.content);
      updateActive((c) => ({ ...c, messages: c.messages.slice(0, idx) }));
      setError(null);
      // Defer focus so the textarea exists post-render and autogrow kicks in.
      setTimeout(() => textareaRef.current?.focus(), 0);
    },
    [active.messages, updateActive],
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const newConversation = () => {
    const id = nowId();
    setConversations((prev) => [
      { id, title: "Nouvelle conversation", messages: [], createdAt: Date.now() },
      ...prev,
    ]);
    setActiveId(id);
    setError(null);
    setInput("");
  };

  const deleteConversation = (id: string) => {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (next.length === 0) {
        const fresh: Conversation = {
          id: nowId(),
          title: "Nouvelle conversation",
          messages: [],
          createdAt: Date.now(),
        };
        setActiveId(fresh.id);
        return [fresh];
      }
      if (id === activeId) setActiveId(next[0].id);
      return next;
    });
  };

  const datasetLabel = useMemo(() => {
    if (!health?.dataset) return null;
    const total = Object.values(health.dataset).reduce((a, b) => a + b, 0);
    return `${fmt(total)} lignes · ${Object.keys(health.dataset).length} tables`;
  }, [health]);

  // ─── memory mutations (all routed through the store, then mirrored in state) ───

  const saveMemoryFromUi = useCallback(async (input: MemoryInput) => {
    const m = await memoryStoreRef.current.save(input);
    setMemories((prev) => [...prev, m]);
    setMemoryDraft(null);
    setEditingMemoryId(null);
  }, []);

  const updateMemoryFromUi = useCallback(
    async (id: string, patch: MemoryInput) => {
      const m = await memoryStoreRef.current.update(id, patch);
      setMemories((prev) => prev.map((x) => (x.id === id ? m : x)));
      setMemoryDraft(null);
      setEditingMemoryId(null);
    },
    [],
  );

  const deleteMemory = useCallback(async (id: string) => {
    await memoryStoreRef.current.remove(id);
    setMemories((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const openMemoryForEdit = useCallback((m: Memory) => {
    setEditingMemoryId(m.id);
    setMemoryDraft({
      kind: m.kind,
      name: m.name,
      body: m.body,
      target: m.target,
    });
  }, []);

  const closeMemoryDialog = useCallback(() => {
    setMemoryDraft(null);
    setEditingMemoryId(null);
  }, []);

  // Replay a saved view as the first turn of a fresh conversation. The body
  // of a `saved-view` memory holds the French question to fire.
  const replaySavedView = useCallback((m: Memory) => {
    const id = nowId();
    setConversations((prev) => [
      { id, title: deriveTitle(m.body), messages: [], createdAt: Date.now() },
      ...prev,
    ]);
    setActiveId(id);
    setError(null);
    setInput("");
    // Go through sendRef rather than capturing `send` directly: the captured
    // version would close over the pre-replay `active.messages` / `activeId`
    // and write the user message to the previous conversation.
    setTimeout(() => sendRef.current(m.body), 0);
  }, []);

  const memoryCounts = useMemo(() => {
    const c = { preference: 0, watch: 0, "saved-view": 0, note: 0 } as Record<
      MemoryKind,
      number
    >;
    for (const m of memories) c[m.kind] = (c[m.kind] ?? 0) + 1;
    return c;
  }, [memories]);

  return (
    <div
      className="agent-root"
      style={{
        minHeight: "100vh",
        height: "100dvh",
        background: T.bg,
        color: T.text,
        fontFamily: "var(--font-sans), system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        visibility: hydrated ? "visible" : "hidden",
      }}
    >
      <TopBar
        health={health}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        title={active.title}
        hasMessages={active.messages.length > 0}
        loading={loading}
        memoryCount={memories.length}
        memoryDrawerOpen={memoryDrawerOpen}
        onToggleMemoryDrawer={() => setMemoryDrawerOpen((v) => !v)}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          minHeight: 0,
        }}
      >
        <Sidebar
          open={sidebarOpen}
          conversations={conversations}
          activeId={activeId}
          onSelect={setActiveId}
          onNew={newConversation}
          onDelete={deleteConversation}
          datasetLabel={datasetLabel}
          model={health?.model}
          onCloseMobile={() => setSidebarOpen(false)}
        />

        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            background: T.bg,
            position: "relative",
          }}
        >
          <div
            ref={scrollRef}
            className="agent-scroll"
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "clamp(1rem, 3vw, 2.25rem) clamp(0.85rem, 3vw, 2.25rem)",
            }}
          >
            <div style={{ maxWidth: 820, margin: "0 auto" }}>
              {active.messages.length === 0 && !loading ? (
                <Welcome onPick={send} loading={loading} />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>
                  <AnimatePresence initial={false}>
                    {active.messages.map((m, i) => (
                      <MessageBubble
                        key={`${activeId}-${i}`}
                        message={m}
                        onMemorise={
                          m.role === "assistant"
                            ? () =>
                                setMemoryDraft({
                                  kind: "note",
                                  name: deriveTitle(m.content).replace(/…$/, ""),
                                  body: m.content
                                    .replace(/\s+/g, " ")
                                    .trim()
                                    .slice(0, 240),
                                })
                            : undefined
                        }
                        onEdit={
                          m.role === "user" && !loading
                            ? () => editUserMessage(i)
                            : undefined
                        }
                      />
                    ))}
                  </AnimatePresence>
                  {loading &&
                    active.messages[active.messages.length - 1]?.role !==
                      "assistant" && <ThinkingIndicator activeTool={activeTool} />}
                </div>
              )}
            </div>
          </div>

          <AnimatePresence>
            {showScrollBottom && (
              <motion.button
                key="scroll-to-bottom"
                initial={{ opacity: 0, y: 8, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.92 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => {
                  const el = scrollRef.current;
                  if (!el) return;
                  el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
                }}
                aria-label="Revenir au dernier message"
                title="Revenir au dernier message"
                style={{
                  position: "absolute",
                  bottom: "calc(env(safe-area-inset-bottom, 0px) + 92px)",
                  right: "clamp(1rem, 3vw, 2rem)",
                  width: 36,
                  height: 36,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: T.surface,
                  color: T.text2,
                  border: "none",
                  borderRadius: "50%",
                  cursor: "pointer",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,1), 0 0 0 1px rgba(0,0,0,0.06), 0 6px 18px -6px rgba(0,0,0,0.20)",
                  zIndex: 20,
                  transition: "transform 0.18s ease, color 0.18s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.color = T.accent;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.color = T.text2;
                }}
              >
                <ChevronDown size={16} strokeWidth={2.25} aria-hidden="true" />
              </motion.button>
            )}
          </AnimatePresence>

          <Composer
            value={input}
            onChange={setInput}
            onSubmit={onSubmit}
            onKeyDown={onKeyDown}
            onStop={stop}
            loading={loading}
            error={error}
            onClearError={() => setError(null)}
            onVoiceError={setError}
            textareaRef={textareaRef}
            model={health?.model}
            memoryCounts={memoryCounts}
          />
        </main>
      </div>

      <AnimatePresence>
        {memoryDrawerOpen && (
          <MemoryDrawer
            key="memory-drawer"
            memories={memories}
            isMobile={isMobileLayout}
            onClose={() => setMemoryDrawerOpen(false)}
            onReplaySavedView={(m) => {
              setMemoryDrawerOpen(false);
              replaySavedView(m);
            }}
            onDeleteMemory={deleteMemory}
            onOpenMemory={(m) => {
              openMemoryForEdit(m);
            }}
            onNewMemory={() => {
              setEditingMemoryId(null);
              setMemoryDraft({ kind: "preference", name: "", body: "" });
            }}
          />
        )}
        {memoryDraft && (
          <MemoryDialog
            draft={memoryDraft}
            editingId={editingMemoryId}
            onChange={setMemoryDraft}
            onClose={closeMemoryDialog}
            onSubmit={saveMemoryFromUi}
            onUpdate={updateMemoryFromUi}
            onDelete={(id) => {
              void deleteMemory(id);
              closeMemoryDialog();
            }}
            onReplay={(m) => {
              closeMemoryDialog();
              replaySavedView(m);
            }}
            currentMemory={
              editingMemoryId
                ? memories.find((m) => m.id === editingMemoryId) ?? null
                : null
            }
          />
        )}
        {sidebarOpen && isMobileLayout && (
          <motion.div
            key="sidebar-scrim"
            className="agent-sidebar-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <style>{`
        /* Sidebar width responds to viewport — narrower on tablet, full
           drawer width on mobile so the touch targets stay comfortable. */
        :root, .agent-root { --agent-sidebar-w: 268px; }
        @media (max-width: 1100px) {
          .agent-root { --agent-sidebar-w: 244px; }
        }
        @media (max-width: 820px) {
          .agent-root { --agent-sidebar-w: min(86vw, 320px); }
        }

        /* Mobile drawer + scrim. The sidebar lives below the topbar so the
           hamburger toggle is always reachable. Scrim sits one z-index below
           the drawer so a tap closes it without intercepting drawer clicks. */
        .agent-sidebar-scrim { display: none; }
        @media (max-width: 820px) {
          .agent-sidebar {
            position: fixed !important;
            top: 56px;
            bottom: 0;
            left: 0;
            z-index: 40;
            box-shadow: 8px 0 32px rgba(0,0,0,0.16);
          }
          .agent-sidebar-scrim {
            display: block;
            position: fixed;
            inset: 56px 0 0 0;
            background: rgba(0,0,0,0.32);
            backdrop-filter: blur(2px);
            -webkit-backdrop-filter: blur(2px);
            z-index: 39;
          }
        }

        /* TopBar — collapse the brand text and centre title on narrow widths
           so the hamburger + model chip stay legible without overflow. */
        @media (max-width: 720px) {
          .agent-topbar-brand-text { display: none !important; }
        }
        @media (max-width: 600px) {
          .agent-memory-trigger-label { display: none !important; }
        }
        @media (max-width: 540px) {
          .agent-topbar-title { display: none !important; }
        }
        @media (max-width: 460px) {
          .agent-topbar-brand { display: none !important; }
        }

        /* Composer — focus ring lives on the wrapper via :focus-within so the
           ring follows the textarea, mic, and send button as one cohesive
           field. Keeps the click-zone obvious for keyboard users. */
        .agent-composer { transition: box-shadow 0.2s ease; }
        .agent-composer:focus-within {
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,1),
            0 0 0 1px rgba(0,0,0,0.04),
            0 1px 2px rgba(0,0,0,0.05),
            0 6px 16px -10px rgba(0,0,0,0.12),
            0 0 0 4px ${T.accentTint2};
        }
        textarea.agent-input::placeholder { color: ${T.text4}; }
        textarea.agent-input:disabled { cursor: not-allowed; opacity: 0.6; }

        /* Hide the keyboard hint on narrow screens — the kbd glyphs aren't
           useful on touch devices that don't have a real Enter key. */
        @media (max-width: 600px) {
          .agent-composer-hint { font-size: 0.66rem; }
          .agent-composer-hint kbd { display: none; }
        }
        @media (max-width: 420px) {
          .agent-composer-model { display: none !important; }
        }

        /* Welcome — let the suggestion grid breathe down through breakpoints
           rather than relying on auto-fill, which produces awkward 2.5-column
           layouts at intermediate widths. */
        @media (max-width: 900px) {
          .agent-welcome-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 540px) {
          .agent-welcome-grid { grid-template-columns: 1fr !important; }
        }

        /* Message bubbles — give the assistant card a max width and lift the
           user bubble's cap on narrower screens so threads don't feel cramped. */
        @media (max-width: 540px) {
          .agent-scroll [data-user-bubble] { max-width: 88% !important; }
        }

        /* Subtle, brand-consistent focus ring for keyboard users across all
           agent surface controls (sidebar rows, action pills, buttons). */
        .agent-root :focus-visible {
          outline: 2px solid ${T.accent};
          outline-offset: 2px;
          border-radius: inherit;
        }
        .agent-root .agent-input:focus-visible { outline: none; }

        /* Custom scrollbars — match the Plinth aesthetic, light on idle so
           they don't fight the surface color. */
        .agent-scroll::-webkit-scrollbar { width: 10px; height: 10px; }
        .agent-scroll::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.08);
          border-radius: 8px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
        .agent-scroll::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.18); background-clip: content-box; border: 2px solid transparent; }
        .agent-scroll::-webkit-scrollbar-track { background: transparent; }

        /* Live status dot pulse in the TopBar — stays subtle so it reads as
           "loading" without becoming an attention sink. */
        @keyframes agent-pulse {
          0%, 100% { box-shadow: 0 0 0 4px ${T.accentTint2}; }
          50% { box-shadow: 0 0 0 6px rgba(88,86,214,0.04); }
        }

        /* Respect prefers-reduced-motion — strip our motion-heavy moments. */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.001ms !important;
            transition-duration: 0.001ms !important;
          }
        }
      `}</style>
    </div>
  );
}

/* ─── topbar ─── */

function TopBar({
  health,
  sidebarOpen,
  onToggleSidebar,
  title,
  hasMessages,
  loading,
  memoryCount,
  memoryDrawerOpen,
  onToggleMemoryDrawer,
}: {
  health: Health | null;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  title: string;
  hasMessages: boolean;
  loading: boolean;
  memoryCount: number;
  memoryDrawerOpen: boolean;
  onToggleMemoryDrawer: () => void;
}) {
  // Show the conversation title in the center slot only when the user is
  // actually inside a conversation — for a fresh "Nouvelle conversation"
  // (no messages yet) the title is generic and would just be visual noise.
  const showTitle = hasMessages;
  return (
    <header
      className="agent-topbar"
      style={{
        height: 56,
        background: T.surface,
        borderBottom: `1px solid ${T.border}`,
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0 clamp(0.75rem, 2vw, 1.5rem)",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        zIndex: 30,
      }}
    >
      <button
        onClick={onToggleSidebar}
        aria-label={sidebarOpen ? "Fermer la sidebar" : "Ouvrir la sidebar"}
        aria-expanded={sidebarOpen}
        className="agent-icon-btn"
        style={{
          width: 36,
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
          border: `1px solid transparent`,
          borderRadius: 9,
          color: T.text3,
          cursor: "pointer",
          flexShrink: 0,
          transition: "background 0.15s, border-color 0.15s, color 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = T.surface3;
          e.currentTarget.style.borderColor = T.border;
          e.currentTarget.style.color = T.text2;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.borderColor = "transparent";
          e.currentTarget.style.color = T.text3;
        }}
      >
        {sidebarOpen ? (
          <PanelLeftClose size={16} strokeWidth={2} aria-hidden="true" />
        ) : (
          <PanelLeftOpen size={16} strokeWidth={2} aria-hidden="true" />
        )}
      </button>

      <div
        className="agent-topbar-brand"
        style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexShrink: 0 }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 28,
            height: 28,
            background: T.gradient,
            color: "#FFFFFF",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.62rem",
            fontWeight: 700,
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.30), 0 0 0 1px rgba(68,65,200,0.20), 0 2px 6px -2px rgba(88,86,214,0.40)",
            letterSpacing: "0.02em",
            flexShrink: 0,
          }}
        >
          CMA
        </span>
        <div
          className="agent-topbar-brand-text"
          style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}
        >
          <span
            style={{
              fontSize: "0.9rem",
              fontWeight: 600,
              letterSpacing: "-0.015em",
              color: T.text,
            }}
          >
            Cabinet Müller
          </span>
          <span
            style={{
              fontSize: "0.62rem",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: T.text4,
            }}
          >
            Agent · Conversation
          </span>
        </div>
      </div>

      <div
        className="agent-topbar-title"
        aria-live="polite"
        style={{
          flex: 1,
          minWidth: 0,
          display: showTitle ? "flex" : "none",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.45rem",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: loading ? T.accent : T.text4,
            boxShadow: loading ? `0 0 0 4px ${T.accentTint2}` : "none",
            transition: "background 0.2s, box-shadow 0.2s",
            flexShrink: 0,
            animation: loading ? "agent-pulse 1.4s ease-in-out infinite" : "none",
          }}
        />
        <span
          title={title}
          style={{
            fontSize: "0.84rem",
            fontWeight: 500,
            color: T.text2,
            letterSpacing: "-0.005em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "min(48ch, 100%)",
          }}
        >
          {title}
        </span>
      </div>

      {!showTitle && <div style={{ flex: 1 }} />}

      <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", flexShrink: 0 }}>
        <MemoryButton
          count={memoryCount}
          open={memoryDrawerOpen}
          onToggle={onToggleMemoryDrawer}
        />
        <ModelChip
          model={health?.model}
          hasKey={health?.has_api_key}
          rows={health?.dataset}
        />
      </div>
    </header>
  );
}

function MemoryButton({
  count,
  open,
  onToggle,
}: {
  count: number;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={open ? "Fermer la mémoire" : "Ouvrir la mémoire"}
      aria-expanded={open}
      title="Mémoire de l'agent"
      className="agent-memory-trigger"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.45rem",
        padding: "0.4rem 0.7rem 0.4rem 0.6rem",
        background: open ? T.accentTint2 : T.surface,
        color: open ? T.accent : T.text2,
        border: "none",
        borderRadius: 100,
        fontFamily: "inherit",
        fontSize: "0.74rem",
        fontWeight: 600,
        letterSpacing: "-0.005em",
        cursor: "pointer",
        boxShadow: open
          ? `inset 0 0 0 1px ${T.accentTint}, ${T.tier1}`
          : T.tier1,
        transition: "transform 0.18s ease, background 0.18s ease, color 0.18s ease",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        if (!open) e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <Brain size={13} strokeWidth={2.25} aria-hidden="true" />
      <span className="agent-memory-trigger-label">Mémoire</span>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: 18,
          height: 18,
          padding: "0 0.32rem",
          background: count > 0
            ? (open ? T.accent : T.accentTint)
            : T.surface3,
          color: count > 0 ? (open ? "#FFFFFF" : T.accent) : T.text4,
          borderRadius: 100,
          fontSize: "0.62rem",
          fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1,
          letterSpacing: 0,
          transition: "background 0.18s, color 0.18s",
        }}
      >
        {count}
      </span>
    </button>
  );
}

function ModelChip({
  model,
  hasKey,
  rows,
}: {
  model?: string;
  hasKey?: boolean;
  rows?: Record<string, number>;
}) {
  const [open, setOpen] = useState(false);
  const total = rows ? Object.values(rows).reduce((a, b) => a + b, 0) : 0;
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.55rem",
          padding: "0.45rem 0.75rem",
          background: T.surface,
          border: "none",
          borderRadius: 100,
          fontSize: "0.74rem",
          fontWeight: 500,
          color: T.text2,
          cursor: "pointer",
          fontFamily: "inherit",
          boxShadow: T.tier1,
          transition: "transform 0.18s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: hasKey ? T.success : T.danger,
            boxShadow: hasKey ? `0 0 0 3px ${T.successTint}` : "none",
          }}
        />
        <Cpu size={11} strokeWidth={2.25} color={T.text3} />
        <span
          style={{
            fontFamily: "var(--font-mono), ui-monospace, monospace",
            fontSize: "0.72rem",
            color: T.text,
          }}
        >
          {model ?? "…"}
        </span>
        <ChevronDown size={11} strokeWidth={2.5} color={T.text4} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              onClick={() => setOpen(false)}
              style={{ position: "fixed", inset: 0, zIndex: 40 }}
            />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                zIndex: 50,
                minWidth: 260,
                background: T.surface,
                borderRadius: 12,
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,1), 0 0 0 1px rgba(0,0,0,0.06), 0 12px 36px -10px rgba(0,0,0,0.22)",
                padding: "0.85rem 0.95rem",
              }}
            >
              <Row label="Modèle" value={model ?? "(non défini)"} mono />
              <Row
                label="Clé API"
                value={hasKey ? "ok" : "manquante"}
                tone={hasKey ? "good" : "danger"}
              />
              <Row label="Endpoint" value="POST /api/agent?stream=text" mono small />
              <div
                style={{
                  marginTop: "0.6rem",
                  paddingTop: "0.6rem",
                  borderTop: `1px solid ${T.border}`,
                }}
              >
                <div
                  style={{
                    fontSize: "0.62rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: T.text4,
                    marginBottom: "0.4rem",
                  }}
                >
                  Dataset · {fmt(total)} lignes
                </div>
                {rows &&
                  Object.entries(rows).map(([k, v]) => (
                    <div
                      key={k}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.74rem",
                        padding: "0.15rem 0",
                        color: T.text2,
                      }}
                    >
                      <span>{k}</span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono), ui-monospace, monospace",
                          color: T.text3,
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {fmt(v)}
                      </span>
                    </div>
                  ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  small,
  tone,
}: {
  label: string;
  value: string;
  mono?: boolean;
  small?: boolean;
  tone?: "good" | "danger";
}) {
  const color =
    tone === "good" ? T.success : tone === "danger" ? T.danger : T.text2;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "0.75rem",
        fontSize: small ? "0.7rem" : "0.78rem",
        padding: "0.18rem 0",
      }}
    >
      <span style={{ color: T.text3 }}>{label}</span>
      <span
        style={{
          color,
          fontWeight: tone ? 600 : 500,
          fontFamily: mono ? "var(--font-mono), ui-monospace, monospace" : "inherit",
          textAlign: "right",
        }}
      >
        {value}
      </span>
    </div>
  );
}

/* ─── sidebar ─── */

function Sidebar({
  open,
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  datasetLabel,
  model,
  onCloseMobile,
}: {
  open: boolean;
  conversations: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  datasetLabel: string | null;
  model?: string;
  onCloseMobile: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const filteredConvs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => {
      if (c.title.toLowerCase().includes(q)) return true;
      return c.messages.some((m) => m.content.toLowerCase().includes(q));
    });
  }, [conversations, searchQuery]);
  return (
    <aside
      className="agent-sidebar"
      aria-label="Historique et mémoire"
      aria-hidden={!open}
      data-open={open ? "true" : "false"}
      style={{
        // Width animates via CSS so the responsive variable (per breakpoint)
        // is respected without re-mounting the element. The inner content
        // div keeps its full width while the outer rail collapses, so the
        // labels don't reflow during the transition.
        width: open ? "var(--agent-sidebar-w, 268px)" : 0,
        background: T.surface2,
        borderRight: open ? `1px solid ${T.border}` : "1px solid transparent",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        flexShrink: 0,
        transition:
          "width 0.26s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.26s ease",
      }}
    >
      <div
        style={{
          width: "var(--agent-sidebar-w, 268px)",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
            <div style={{ padding: "1rem 0.85rem 0.6rem" }}>
              <button
                onClick={() => {
                  onNew();
                  // On mobile, the drawer overlays the chat — auto-close so the
                  // user immediately lands on the fresh empty thread.
                  if (typeof window !== "undefined" &&
                      window.matchMedia("(max-width: 820px)").matches) {
                    onCloseMobile();
                  }
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  padding: "0.6rem 0.75rem",
                  background: T.gradient,
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 10,
                  fontFamily: "inherit",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  letterSpacing: "-0.005em",
                  cursor: "pointer",
                  boxShadow: T.gradientShadow,
                  transition: "transform 0.22s ease, box-shadow 0.22s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = T.gradientShadowHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = T.gradientShadow;
                }}
              >
                <Plus size={14} strokeWidth={2.5} />
                Nouvelle conversation
              </button>
            </div>

            <div style={{ padding: "0.1rem 0.85rem 0.5rem" }}>
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Search
                  size={12}
                  strokeWidth={2.25}
                  color={T.text4}
                  style={{ position: "absolute", left: 9, pointerEvents: "none" }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher…"
                  style={{
                    width: "100%",
                    padding: "0.45rem 0.6rem 0.45rem 1.85rem",
                    background: T.surface,
                    border: "none",
                    borderRadius: 10,
                    fontFamily: "inherit",
                    fontSize: "0.8rem",
                    color: T.text,
                    outline: "none",
                    boxShadow: T.tier1,
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    aria-label="Effacer la recherche"
                    style={{
                      position: "absolute",
                      right: 4,
                      width: 22,
                      height: 22,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "transparent",
                      border: "none",
                      color: T.text3,
                      cursor: "pointer",
                      borderRadius: 4,
                    }}
                  >
                    <X size={11} strokeWidth={2.25} />
                  </button>
                )}
              </div>
            </div>

            <div
              style={{
                fontSize: "0.62rem",
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: T.text4,
                padding: "0.1rem 1rem 0.35rem",
              }}
            >
              Conversations
              {searchQuery && (
                <span style={{ color: T.text3, fontWeight: 500, marginLeft: "0.4rem" }}>
                  · {filteredConvs.length}/{conversations.length}
                </span>
              )}
            </div>

            <div className="agent-scroll" style={{ flex: 1, overflowY: "auto", padding: "0 0.5rem 0.5rem" }}>
              {filteredConvs.length === 0 ? (
                <div
                  style={{
                    padding: "0.6rem 0.7rem",
                    fontSize: "0.74rem",
                    color: T.text4,
                  }}
                >
                  Aucune conversation ne correspond.
                </div>
              ) : (
                filteredConvs.map((c) => {
                  const isActive = c.id === activeId;
                  return (
                    <ConvRow
                      key={c.id}
                      conv={c}
                      active={isActive}
                      onSelect={() => {
                        onSelect(c.id);
                        if (window.matchMedia("(max-width: 820px)").matches) {
                          onCloseMobile();
                        }
                      }}
                      onDelete={() => onDelete(c.id)}
                    />
                  );
                })
              )}

            </div>

            <div
              style={{
                padding: "0.75rem 0.9rem calc(0.75rem + env(safe-area-inset-bottom, 0px))",
                display: "flex",
                flexDirection: "column",
                gap: "0.35rem",
                background:
                  "linear-gradient(to right, transparent, rgba(0,0,0,0.06) 12%, rgba(0,0,0,0.06) 88%, transparent) top / 100% 1px no-repeat",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  fontSize: "0.7rem",
                  color: T.text3,
                }}
              >
                <Wrench size={11} strokeWidth={2.25} color={T.accent} aria-hidden="true" />
                <span style={{ fontWeight: 600, color: T.text2 }}>8 outils</span>
                <span style={{ color: T.text4 }}>· KPI · lookups · SQL · mémoire</span>
              </div>
              {datasetLabel && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.45rem",
                    fontSize: "0.7rem",
                    color: T.text3,
                  }}
                >
                  <Database size={11} strokeWidth={2.25} color={T.text4} aria-hidden="true" />
                  <span style={{ fontVariantNumeric: "tabular-nums" }}>{datasetLabel}</span>
                </div>
              )}
              {model && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.45rem",
                    fontSize: "0.68rem",
                    color: T.text3,
                    fontFamily: "var(--font-mono), ui-monospace, monospace",
                  }}
                >
                  <Cpu size={11} strokeWidth={2.25} color={T.text4} aria-hidden="true" />
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      minWidth: 0,
                    }}
                  >
                    {model}
                  </span>
                </div>
              )}
            </div>
      </div>
    </aside>
  );
}

// Coarse relative-time formatter for the conversation list. Avoids pulling
// in Intl.RelativeTimeFormat for four buckets that all fit in a one-liner.
function relTime(ts?: number): string {
  if (!ts) return "";
  const diff = Date.now() - ts;
  if (diff < 60_000) return "à l'instant";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} h`;
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)} j`;
  return new Date(ts).toLocaleDateString("fr-CH", { day: "2-digit", month: "2-digit" });
}

function ConvRow({
  conv,
  active,
  onSelect,
  onDelete,
}: {
  conv: Conversation;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const [hover, setHover] = useState(false);
  // The last meaningful timestamp on the conversation — falls back to its
  // creation moment for empty / very fresh threads.
  const lastTs =
    conv.messages.length > 0
      ? conv.messages[conv.messages.length - 1].ts ?? conv.createdAt
      : conv.createdAt;
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        alignItems: "center",
        gap: "0.55rem",
        padding: "0.5rem 0.6rem",
        background: active ? T.surface : hover ? T.surface : "transparent",
        borderRadius: 9,
        marginBottom: 2,
        cursor: "pointer",
        boxShadow: active ? T.tier1 : "none",
        transition: "background 0.15s, box-shadow 0.18s",
      }}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      aria-current={active ? "true" : undefined}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <MessageSquare
        size={13}
        strokeWidth={2}
        color={active ? T.accent : T.text3}
        style={{ flexShrink: 0 }}
        aria-hidden="true"
      />
      <span
        style={{
          fontSize: "0.82rem",
          color: active ? T.text : T.text2,
          fontWeight: active ? 600 : 500,
          letterSpacing: "-0.005em",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          minWidth: 0,
        }}
      >
        {conv.title}
      </span>
      {hover ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label="Supprimer la conversation"
          style={{
            width: 22,
            height: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            border: "none",
            color: T.text4,
            cursor: "pointer",
            borderRadius: 5,
            transition: "background 0.12s, color 0.12s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = T.surface;
            e.currentTarget.style.color = T.danger;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = T.text4;
          }}
        >
          <Trash2 size={11} strokeWidth={2} aria-hidden="true" />
        </button>
      ) : (
        <span
          aria-hidden="true"
          style={{
            fontSize: "0.66rem",
            fontFamily: "var(--font-mono), ui-monospace, monospace",
            color: T.text4,
            whiteSpace: "nowrap",
            fontVariantNumeric: "tabular-nums",
            opacity: active ? 0.85 : 0.7,
          }}
        >
          {relTime(lastTs)}
        </span>
      )}
    </div>
  );
}

/* ─── memory panel ─── */

const KIND_META: Record<
  MemoryKind,
  { label: string; Icon: typeof Bookmark; color: string }
> = {
  preference: { label: "Préférences", Icon: Settings2, color: T.accent },
  watch: { label: "Suivis", Icon: Eye, color: T.info },
  "saved-view": { label: "Vues", Icon: Bookmark, color: T.accent2 },
  note: { label: "Notes", Icon: StickyNote, color: T.warn },
};

const MEMORY_KIND_ORDER: MemoryKind[] = [
  "preference",
  "watch",
  "saved-view",
  "note",
];

function MemoryPanel({
  memories,
  onReplaySavedView,
  onDeleteMemory,
  onOpenMemory,
  onNewMemory,
  hideHeader = false,
}: {
  memories: Memory[];
  onReplaySavedView: (m: Memory) => void;
  onDeleteMemory: (id: string) => void;
  onOpenMemory: (m: Memory) => void;
  onNewMemory: () => void;
  hideHeader?: boolean;
}) {
  const grouped = useMemo(() => {
    const map = new Map<MemoryKind, Memory[]>();
    for (const m of memories) {
      const arr = map.get(m.kind) ?? [];
      arr.push(m);
      map.set(m.kind, arr);
    }
    return map;
  }, [memories]);

  return (
    <div
      style={{
        marginTop: hideHeader ? 0 : "0.6rem",
        borderTop: hideHeader ? "none" : `1px solid ${T.border}`,
      }}
    >
      {!hideHeader && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.7rem 0.5rem 0.35rem",
          }}
        >
          <span
            style={{
              fontSize: "0.62rem",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: T.text4,
            }}
          >
            Mémoire
          </span>
          <button
            onClick={onNewMemory}
            aria-label="Ajouter un souvenir"
            title="Ajouter un souvenir"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              background: "transparent",
              border: "none",
              color: T.text3,
              fontFamily: "inherit",
              fontSize: "0.7rem",
              cursor: "pointer",
              padding: "0.2rem 0.35rem",
              borderRadius: 5,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = T.surface3;
              e.currentTarget.style.color = T.accent;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = T.text3;
            }}
          >
            <Plus size={11} strokeWidth={2.5} />
            Ajouter
          </button>
        </div>
      )}

      {memories.length === 0 ? (
        <div
          style={{
            padding: "0.35rem 0.6rem 0.6rem",
            fontSize: "0.72rem",
            color: T.text4,
            lineHeight: 1.45,
          }}
        >
          Aucun souvenir. Demande à l&apos;agent « retiens que… » ou clique
          sur <strong style={{ color: T.text3 }}>Mémoriser</strong> sur une
          réponse.
        </div>
      ) : (
        MEMORY_KIND_ORDER.map((kind) => {
          const items = grouped.get(kind);
          if (!items || items.length === 0) return null;
          const { label, Icon, color } = KIND_META[kind];
          return (
            <div key={kind} style={{ padding: "0.2rem 0 0.35rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.2rem 0.6rem",
                  fontSize: "0.66rem",
                  fontWeight: 600,
                  color,
                }}
              >
                <Icon size={11} strokeWidth={2.25} />
                {label}
                <span style={{ color: T.text4, fontWeight: 500 }}>
                  · {items.length}
                </span>
              </div>
              {items.map((m) => (
                <MemoryRow
                  key={m.id}
                  memory={m}
                  onOpen={() => onOpenMemory(m)}
                  onReplay={
                    m.kind === "saved-view"
                      ? () => onReplaySavedView(m)
                      : undefined
                  }
                  onDelete={() => onDeleteMemory(m.id)}
                />
              ))}
            </div>
          );
        })
      )}
    </div>
  );
}

function MemoryRow({
  memory,
  onOpen,
  onReplay,
  onDelete,
}: {
  memory: Memory;
  onOpen: () => void;
  onReplay?: () => void;
  onDelete: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onOpen}
      title={`${memory.name} — cliquez pour ouvrir`}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        alignItems: "start",
        gap: "0.35rem",
        padding: "0.5rem 0.6rem",
        margin: "0 0 2px",
        background: hover ? T.surface : "transparent",
        borderRadius: 9,
        cursor: "pointer",
        boxShadow: hover ? T.tier1 : "none",
        transition: "background 0.15s, box-shadow 0.18s",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: "0.78rem",
            fontWeight: 600,
            color: T.text,
            letterSpacing: "-0.005em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {memory.name}
          {memory.target && (
            <span
              style={{
                marginLeft: "0.35rem",
                fontFamily: "var(--font-mono), ui-monospace, monospace",
                fontSize: "0.66rem",
                color: T.accent,
                background: T.accentTint2,
                padding: "0.05rem 0.35rem",
                borderRadius: 4,
                fontWeight: 500,
              }}
            >
              {memory.target}
            </span>
          )}
        </div>
        <div
          style={{
            fontSize: "0.72rem",
            color: T.text3,
            lineHeight: 1.4,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            marginTop: 2,
          }}
        >
          {memory.body}
        </div>
      </div>
      <div
        style={{
          display: hover ? "inline-flex" : "none",
          gap: 2,
          alignItems: "center",
        }}
      >
        {onReplay && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReplay();
            }}
            aria-label="Rejouer cette vue"
            title="Rejouer cette vue"
            style={memoryActionIconStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = T.accent;
              e.currentTarget.style.background = T.accentTint2;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = T.text3;
              e.currentTarget.style.background = "transparent";
            }}
          >
            <Bookmark size={11} strokeWidth={2.25} />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label="Supprimer ce souvenir"
          title="Supprimer ce souvenir"
          style={memoryActionIconStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = T.danger;
            e.currentTarget.style.background = T.dangerTint;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = T.text3;
            e.currentTarget.style.background = "transparent";
          }}
        >
          <Trash2 size={11} strokeWidth={2.25} />
        </button>
      </div>
    </div>
  );
}

const memoryActionIconStyle: React.CSSProperties = {
  width: 22,
  height: 22,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "transparent",
  border: "none",
  color: T.text3,
  cursor: "pointer",
  borderRadius: 6,
  transition: "color 0.15s, background 0.15s",
};

/* ─── memory drawer (right rail on desktop, bottom sheet on mobile) ─── */

function MemoryDrawer({
  memories,
  isMobile,
  onClose,
  onReplaySavedView,
  onDeleteMemory,
  onOpenMemory,
  onNewMemory,
}: {
  memories: Memory[];
  isMobile: boolean;
  onClose: () => void;
  onReplaySavedView: (m: Memory) => void;
  onDeleteMemory: (id: string) => void;
  onOpenMemory: (m: Memory) => void;
  onNewMemory: () => void;
}) {
  // Esc closes the drawer. Scoped to the drawer's lifetime so it doesn't
  // intercept Esc when other modals are layered on top. We type the listener
  // as `globalThis.KeyboardEvent` because the file already imports React's
  // synthetic `KeyboardEvent` for composer handlers and that shadows the DOM
  // type at this scope.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lock body scroll while the drawer is open so the page underneath doesn't
  // rubber-band on mobile.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <>
      <motion.div
        key="memory-scrim"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(29,29,31,0.32)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          zIndex: 55,
        }}
      />
      <motion.aside
        key="memory-drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Mémoire de l'agent"
        initial={isMobile ? { y: "100%" } : { x: "100%" }}
        animate={isMobile ? { y: 0 } : { x: 0 }}
        exit={isMobile ? { y: "100%" } : { x: "100%" }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "fixed",
          ...(isMobile
            ? {
                left: 0,
                right: 0,
                bottom: 0,
                top: "auto",
                width: "100%",
                maxHeight: "85vh",
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
              }
            : {
                top: 0,
                bottom: 0,
                right: 0,
                left: "auto",
                width: "min(400px, 92vw)",
                height: "100vh",
              }),
          background: T.surface,
          boxShadow: isMobile
            ? "0 -12px 32px -8px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,1)"
            : "-12px 0 32px -8px rgba(0,0,0,0.18), inset 1px 0 0 rgba(255,255,255,1)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          zIndex: 56,
          paddingBottom: isMobile ? "env(safe-area-inset-bottom, 0px)" : 0,
        }}
      >
        {isMobile && (
          <div
            aria-hidden="true"
            style={{
              display: "flex",
              justifyContent: "center",
              paddingTop: 8,
              flexShrink: 0,
            }}
          >
            <span
              style={{
                width: 38,
                height: 4,
                borderRadius: 100,
                background: T.surface3,
              }}
            />
          </div>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.6rem",
            padding: "0.9rem 1.05rem 0.75rem",
            borderBottom: `1px solid ${T.border}`,
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", minWidth: 0 }}>
            <span
              aria-hidden="true"
              style={{
                width: 30,
                height: 30,
                background: T.accentTint,
                color: T.accent,
                borderRadius: 9,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
                flexShrink: 0,
              }}
            >
              <Brain size={15} strokeWidth={2.25} />
            </span>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15, minWidth: 0 }}>
              <span
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: T.text,
                  letterSpacing: "-0.01em",
                }}
              >
                Mémoire de l&apos;agent
              </span>
              <span
                style={{
                  fontSize: "0.66rem",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: T.text4,
                }}
              >
                {memories.length} souvenir{memories.length > 1 ? "s" : ""}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <button
              type="button"
              onClick={onNewMemory}
              aria-label="Nouveau souvenir"
              title="Nouveau souvenir"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.45rem 0.7rem",
                background: T.gradient,
                color: "#FFFFFF",
                border: "none",
                borderRadius: 9,
                fontFamily: "inherit",
                fontSize: "0.78rem",
                fontWeight: 600,
                letterSpacing: "-0.005em",
                cursor: "pointer",
                boxShadow: T.gradientShadow,
                transition: "transform 0.18s ease, box-shadow 0.18s ease",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = T.gradientShadowHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = T.gradientShadow;
              }}
            >
              <Plus size={12} strokeWidth={2.5} aria-hidden="true" />
              Nouveau
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              style={{
                width: 32,
                height: 32,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: T.surface,
                border: "none",
                color: T.text3,
                cursor: "pointer",
                borderRadius: 9,
                boxShadow: T.tier1,
                transition: "transform 0.18s ease, color 0.18s ease",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.color = T.text;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.color = T.text3;
              }}
            >
              <X size={14} strokeWidth={2.25} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div
          className="agent-scroll"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "0.5rem 0.5rem 0.85rem",
          }}
        >
          {memories.length === 0 ? (
            <div
              style={{
                padding: "1.5rem 1rem 1.25rem",
                textAlign: "center",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  width: 48,
                  height: 48,
                  margin: "0 auto 0.85rem",
                  background: T.surface2,
                  color: T.text4,
                  borderRadius: 14,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: T.tier1,
                }}
              >
                <Brain size={20} strokeWidth={2} />
              </div>
              <div
                style={{
                  fontSize: "0.92rem",
                  fontWeight: 600,
                  color: T.text,
                  letterSpacing: "-0.01em",
                  marginBottom: "0.35rem",
                }}
              >
                Aucun souvenir
              </div>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: T.text3,
                  lineHeight: 1.5,
                  margin: "0 auto 1rem",
                  maxWidth: "32ch",
                }}
              >
                Dites à l&apos;agent <em style={{ color: T.text2, fontStyle: "normal" }}>« retiens que… »</em> ou
                cliquez sur <strong style={{ color: T.text2, fontWeight: 600 }}>Mémoriser</strong> sur
                une réponse pour bâtir le contexte qu&apos;il garde en tête.
              </p>
              <button
                type="button"
                onClick={onNewMemory}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.45rem 0.85rem",
                  background: T.surface,
                  color: T.accent,
                  border: "none",
                  borderRadius: 9,
                  fontFamily: "inherit",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: T.tier1,
                  transition: "transform 0.18s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-1px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                <Plus size={12} strokeWidth={2.5} aria-hidden="true" />
                Créer le premier
              </button>
            </div>
          ) : (
            <MemoryPanel
              memories={memories}
              onReplaySavedView={onReplaySavedView}
              onDeleteMemory={onDeleteMemory}
              onOpenMemory={onOpenMemory}
              onNewMemory={onNewMemory}
              hideHeader
            />
          )}
        </div>
      </motion.aside>
    </>
  );
}

/* ─── memory dialog (create + edit + view) ─── */

function MemoryDialog({
  draft,
  editingId,
  currentMemory,
  onChange,
  onClose,
  onSubmit,
  onUpdate,
  onDelete,
  onReplay,
}: {
  draft: MemoryInput;
  editingId: string | null;
  currentMemory: Memory | null;
  onChange: (d: MemoryInput) => void;
  onClose: () => void;
  onSubmit: (d: MemoryInput) => Promise<void> | void;
  onUpdate: (id: string, d: MemoryInput) => Promise<void> | void;
  onDelete: (id: string) => void;
  onReplay: (m: Memory) => void;
}) {
  const isEdit = editingId !== null;
  const canSave = draft.name.trim().length > 0 && draft.body.trim().length > 0;
  const headerMeta = isEdit && currentMemory
    ? KIND_META[currentMemory.kind]
    : KIND_META[draft.kind];
  const HeaderIcon = isEdit ? headerMeta.Icon : BookmarkPlus;
  const headerColor = isEdit ? headerMeta.color : T.accent;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(29,29,31,0.35)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 60,
        padding: "1rem",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.20, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 520,
          background: T.surface,
          borderRadius: 16,
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,1), 0 0 0 1px rgba(0,0,0,0.06), 0 24px 60px -16px rgba(0,0,0,0.30)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1rem 1.15rem 0.85rem",
            borderBottom: `1px solid ${T.border}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span
              style={{
                width: 28,
                height: 28,
                background: `${headerColor}1A`,
                color: headerColor,
                borderRadius: 8,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
              }}
            >
              <HeaderIcon size={14} strokeWidth={2.25} />
            </span>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
              <span style={{ fontSize: "0.95rem", fontWeight: 600, color: T.text, letterSpacing: "-0.01em" }}>
                {isEdit ? draft.name || "Souvenir" : "Nouveau souvenir"}
              </span>
              <span
                style={{
                  fontSize: "0.66rem",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: T.text4,
                }}
              >
                {isEdit ? "Modification" : "Création"} · {KIND_META[draft.kind].label}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            style={{
              width: 30,
              height: 30,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: T.surface,
              border: "none",
              color: T.text3,
              cursor: "pointer",
              borderRadius: 8,
              boxShadow: T.tier1,
              transition: "transform 0.18s ease, color 0.18s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.color = T.text;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.color = T.text3;
            }}
          >
            <X size={14} strokeWidth={2.25} />
          </button>
        </div>

        <div style={{ padding: "1rem 1.15rem 1.15rem" }}>
          <div style={{ marginBottom: "0.85rem" }}>
            <Label>Type</Label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "0.4rem",
                marginTop: "0.35rem",
              }}
            >
              {MEMORY_KIND_ORDER.map((k) => {
                const { label, Icon, color } = KIND_META[k];
                const selected = draft.kind === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => onChange({ ...draft, kind: k })}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "0.3rem",
                      padding: "0.6rem 0.4rem",
                      borderRadius: 10,
                      background: selected ? T.surface : T.surface2,
                      border: "none",
                      color: selected ? color : T.text2,
                      fontSize: "0.7rem",
                      fontFamily: "inherit",
                      fontWeight: selected ? 600 : 500,
                      cursor: "pointer",
                      boxShadow: selected
                        ? `inset 0 0 0 1.5px ${color}, ${T.tier1}`
                        : "inset 0 0 0 1px rgba(0,0,0,0.05)",
                      transition: "box-shadow 0.18s, background 0.18s, color 0.18s",
                    }}
                  >
                    <Icon size={13} strokeWidth={2.25} />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: "0.85rem" }}>
            <Label>Libellé</Label>
            <input
              type="text"
              value={draft.name}
              onChange={(e) => onChange({ ...draft, name: e.target.value })}
              placeholder="ex. Vaudoise en premier"
              maxLength={60}
              style={inputStyle}
            />
          </div>

          {draft.kind === "watch" && (
            <div style={{ marginBottom: "0.85rem" }}>
              <Label>Identifiant suivi (optionnel)</Label>
              <input
                type="text"
                value={draft.target ?? ""}
                onChange={(e) => onChange({ ...draft, target: e.target.value })}
                placeholder="CLT042 · POL1234 · SIN012"
                maxLength={20}
                style={{
                  ...inputStyle,
                  fontFamily: "var(--font-mono), ui-monospace, monospace",
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: "0.85rem" }}>
            <Label>Contenu</Label>
            <textarea
              value={draft.body}
              onChange={(e) => onChange({ ...draft, body: e.target.value })}
              placeholder="Décris en une phrase ce que l'agent doit retenir…"
              maxLength={280}
              rows={3}
              style={{
                ...inputStyle,
                resize: "vertical",
                minHeight: 72,
                lineHeight: 1.5,
              }}
            />
            <div
              style={{
                fontSize: "0.66rem",
                color: T.text4,
                textAlign: "right",
                marginTop: 4,
              }}
            >
              {draft.body.length}/280
            </div>
          </div>

          {isEdit && currentMemory && (
            <div
              style={{
                display: "flex",
                gap: "1rem",
                fontSize: "0.7rem",
                color: T.text4,
                marginBottom: "0.85rem",
                fontFamily: "var(--font-mono), ui-monospace, monospace",
              }}
            >
              <span>Créé · {new Date(currentMemory.createdAt).toLocaleDateString("fr-CH")}</span>
              {currentMemory.updatedAt !== currentMemory.createdAt && (
                <span>
                  Maj · {new Date(currentMemory.updatedAt).toLocaleDateString("fr-CH")}
                </span>
              )}
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "0.5rem",
              marginTop: "1rem",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", gap: "0.4rem" }}>
              {isEdit && currentMemory && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Supprimer ce souvenir ?")) {
                      onDelete(currentMemory.id);
                    }
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.55rem 0.85rem",
                    background: T.surface,
                    border: "none",
                    borderRadius: 9,
                    fontFamily: "inherit",
                    fontSize: "0.8rem",
                    color: T.danger,
                    fontWeight: 500,
                    cursor: "pointer",
                    boxShadow: T.tier1,
                    transition: "transform 0.18s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  <Trash2 size={12} strokeWidth={2.25} />
                  Supprimer
                </button>
              )}
              {isEdit && currentMemory?.kind === "saved-view" && (
                <button
                  type="button"
                  onClick={() => onReplay(currentMemory)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.55rem 0.85rem",
                    background: T.surface,
                    border: "none",
                    borderRadius: 9,
                    fontFamily: "inherit",
                    fontSize: "0.8rem",
                    color: T.accent,
                    fontWeight: 500,
                    cursor: "pointer",
                    boxShadow: T.tier1,
                    transition: "transform 0.18s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  <Bookmark size={12} strokeWidth={2.25} />
                  Rejouer
                </button>
              )}
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "0.55rem 0.9rem",
                  background: T.surface,
                  border: "none",
                  borderRadius: 9,
                  fontFamily: "inherit",
                  fontSize: "0.82rem",
                  color: T.text2,
                  fontWeight: 500,
                  cursor: "pointer",
                  boxShadow: T.tier1,
                  transition: "transform 0.18s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={!canSave}
                onClick={() => {
                  if (isEdit && editingId) onUpdate(editingId, draft);
                  else onSubmit(draft);
                }}
                style={{
                  padding: "0.55rem 1.1rem",
                  background: canSave ? T.gradient : T.surface3,
                  border: "none",
                  borderRadius: 9,
                  color: canSave ? "#FFFFFF" : T.text4,
                  fontFamily: "inherit",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  letterSpacing: "-0.005em",
                  cursor: canSave ? "pointer" : "not-allowed",
                  boxShadow: canSave ? T.gradientShadow : "none",
                  transition: "transform 0.18s ease, box-shadow 0.18s ease",
                }}
                onMouseEnter={(e) => {
                  if (!canSave) return;
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = T.gradientShadowHover;
                }}
                onMouseLeave={(e) => {
                  if (!canSave) return;
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = T.gradientShadow;
                }}
              >
                {isEdit ? "Enregistrer" : "Créer"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: "0.66rem",
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: T.text3,
      }}
    >
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.6rem 0.75rem",
  marginTop: "0.35rem",
  background: T.surface2,
  border: `1px solid ${T.border}`,
  borderRadius: 9,
  fontFamily: "inherit",
  fontSize: "0.86rem",
  color: T.text,
  outline: "none",
  transition: "border-color 0.18s, box-shadow 0.18s, background 0.18s",
};

/* ─── welcome ─── */

function Welcome({
  onPick,
  loading,
}: {
  onPick: (text: string) => void;
  loading: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="agent-welcome"
      style={{ paddingTop: "clamp(0.5rem, 4vh, 2.5rem)" }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          fontSize: "0.66rem",
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: T.accent,
          background: T.surface,
          padding: "0.3rem 0.7rem 0.3rem 0.55rem",
          borderRadius: 100,
          marginBottom: "1rem",
          boxShadow: T.tier1,
        }}
      >
        <Sparkles size={11} strokeWidth={2.25} aria-hidden="true" />
        Agent Cabinet Müller
      </div>
      <h1
        style={{
          fontSize: "clamp(1.65rem, 3.2vw, 2.25rem)",
          fontWeight: 700,
          letterSpacing: "-0.028em",
          lineHeight: 1.12,
          color: T.text,
          margin: "0 0 0.55rem",
          maxWidth: "22ch",
        }}
      >
        Que voulez-vous savoir sur le cabinet&nbsp;?
      </h1>
      <p
        style={{
          fontSize: "0.98rem",
          color: T.text3,
          lineHeight: 1.55,
          margin: "0 0 1.8rem",
          maxWidth: "58ch",
        }}
      >
        L&apos;agent connaît les <strong style={{ color: T.text2 }}>50 clients</strong>,{" "}
        <strong style={{ color: T.text2 }}>189 contrats</strong> et{" "}
        <strong style={{ color: T.text2 }}>2 518 primes</strong>.
        Chiffres exacts, jamais d&apos;invention.
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: "0.75rem",
          marginBottom: "0.65rem",
        }}
      >
        <div
          style={{
            fontSize: "0.64rem",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: T.text4,
          }}
        >
          Pour démarrer
        </div>
        <div
          style={{
            fontSize: "0.66rem",
            color: T.text4,
          }}
        >
          Cliquez sur une suggestion · ou tapez votre question
        </div>
      </div>

      <div
        className="agent-welcome-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "0.7rem",
        }}
      >
        {SUGGESTIONS.map((s, i) => (
          <SuggestionCard key={s.title} s={s} index={i} disabled={loading} onPick={onPick} />
        ))}
      </div>
    </motion.div>
  );
}

function SuggestionCard({
  s,
  index,
  disabled,
  onPick,
}: {
  s: (typeof SUGGESTIONS)[number];
  index: number;
  disabled: boolean;
  onPick: (text: string) => void;
}) {
  return (
    <motion.button
      onClick={() => onPick(s.prompt)}
      disabled={disabled}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + index * 0.04, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ scale: 0.985 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: "0.5rem",
        padding: "0.95rem 1rem 0.85rem",
        background: T.surface,
        border: "none",
        borderRadius: 14,
        textAlign: "left",
        fontFamily: "inherit",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        boxShadow: T.tier1,
        transition: "transform 0.22s ease, box-shadow 0.22s ease",
        color: "inherit",
        position: "relative",
        overflow: "hidden",
        minHeight: 112,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = `${T.tier2}, 0 0 0 4px ${T.accentTint2}`;
        const icon = e.currentTarget.querySelector(
          "[data-suggest-icon]",
        ) as HTMLElement | null;
        if (icon) icon.style.transform = "rotate(3deg) scale(1.06)";
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = T.tier1;
        const icon = e.currentTarget.querySelector(
          "[data-suggest-icon]",
        ) as HTMLElement | null;
        if (icon) icon.style.transform = "rotate(0) scale(1)";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.6rem" }}>
        <span
          data-suggest-icon
          style={{
            width: 30,
            height: 30,
            background: T.accentTint,
            color: T.accent,
            borderRadius: 9,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
            transition: "transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          <s.Icon size={14} strokeWidth={2.25} />
        </span>
        <ChevronRight size={13} strokeWidth={2.25} color={T.text4} aria-hidden="true" />
      </div>
      <div
        style={{
          fontSize: "0.92rem",
          fontWeight: 600,
          color: T.text,
          letterSpacing: "-0.01em",
          lineHeight: 1.25,
        }}
      >
        {s.title}
      </div>
      <div style={{ fontSize: "0.76rem", color: T.text3, lineHeight: 1.4 }}>{s.hint}</div>
    </motion.button>
  );
}

/* ─── messages ─── */

function MessageBubble({
  message,
  onMemorise,
  onEdit,
}: {
  message: Message;
  onMemorise?: () => void;
  onEdit?: () => void;
}) {
  const isUser = message.role === "user";
  if (isUser) return <UserMessage message={message} onEdit={onEdit} />;
  return <AssistantMessage message={message} onMemorise={onMemorise} />;
}

function UserMessage({
  message,
  onEdit,
}: {
  message: Message;
  onEdit?: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      style={{ display: "flex", justifyContent: "flex-end" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div data-user-bubble style={{ maxWidth: "78%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "0.4rem",
            fontSize: "0.62rem",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: T.text4,
            marginBottom: "0.35rem",
          }}
        >
          {onEdit && hover && (
            <button
              onClick={onEdit}
              aria-label="Modifier et renvoyer"
              title="Modifier et renvoyer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                padding: "0.15rem 0.4rem",
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: 5,
                color: T.text3,
                fontFamily: "inherit",
                fontSize: "0.65rem",
                fontWeight: 600,
                cursor: "pointer",
                textTransform: "none",
                letterSpacing: 0,
                transition: "background 0.12s, color 0.12s, border-color 0.12s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = T.accentTint2;
                e.currentTarget.style.color = T.accent;
                e.currentTarget.style.borderColor = T.accentTint;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = T.surface;
                e.currentTarget.style.color = T.text3;
                e.currentTarget.style.borderColor = T.border;
              }}
            >
              <Pencil size={10} strokeWidth={2.25} />
              Modifier
            </button>
          )}
          <span>Vous</span>
        </div>
        <div
          style={{
            background: T.gradient,
            color: "#FFFFFF",
            padding: "0.8rem 1.05rem",
            borderRadius: "14px 14px 4px 14px",
            fontSize: "0.92rem",
            lineHeight: 1.55,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            letterSpacing: "-0.005em",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.20), 0 0 0 1px rgba(68,65,200,0.25), 0 8px 20px -10px rgba(88,86,214,0.40)",
          }}
        >
          {message.content}
        </div>
      </div>
    </motion.div>
  );
}

function AssistantMessage({
  message,
  onMemorise,
}: {
  message: Message;
  onMemorise?: () => void;
}) {
  const tools = message.toolCalls ?? [];
  // Hide the action row on placeholder/empty bubbles (a streaming bubble
  // that hasn't received its first chunk yet, the "(réponse vide)" marker,
  // or the bare "(interrompu)" marker emitted when abort fires before any
  // text streams). Bubbles with real text + an "(interrompu)" suffix still
  // pass — there's content worth copying.
  const trimmedContent = message.content.trim();
  const hasContent =
    trimmedContent.length >= 8 &&
    trimmedContent !== "_(réponse vide)_" &&
    trimmedContent !== "_(interrompu)_" &&
    trimmedContent !== "…(interrompu)";
  const canMemorise = onMemorise && hasContent;
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    if (!hasContent) return;
    navigator.clipboard
      .writeText(message.content)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {
        // Clipboard permission denied / unavailable — no-op rather than alarm.
      });
  }, [hasContent, message.content]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: "100%" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          fontSize: "0.62rem",
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: T.accent,
        }}
      >
        <Sparkles size={10} strokeWidth={2.5} />
        Agent
        {hasContent && (
          <div
            style={{
              marginLeft: "auto",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
            }}
          >
            <button
              onClick={handleCopy}
              aria-label="Copier la réponse"
              title="Copier la réponse"
              style={actionPillStyle}
              onMouseEnter={actionPillHoverIn}
              onMouseLeave={actionPillHoverOut}
            >
              {copied ? (
                <>
                  <Check size={11} strokeWidth={2.5} />
                  Copié
                </>
              ) : (
                <>
                  <Copy size={11} strokeWidth={2.25} />
                  Copier
                </>
              )}
            </button>
            {canMemorise && (
              <button
                onClick={onMemorise}
                aria-label="Mémoriser cette réponse"
                title="Mémoriser cette réponse"
                style={actionPillStyle}
                onMouseEnter={actionPillHoverIn}
                onMouseLeave={actionPillHoverOut}
              >
                <BookmarkPlus size={11} strokeWidth={2.25} />
                Mémoriser
              </button>
            )}
          </div>
        )}
      </div>
      <div
        style={{
          background: T.surface,
          borderRadius: "4px 14px 14px 14px",
          padding: "1rem 1.15rem",
          boxShadow: T.tier1,
        }}
      >
        <Markdown source={message.content} />
      </div>
      {tools.length > 0 && (
        <ToolPanel toolCalls={tools} toolResults={message.toolResults ?? []} />
      )}
      {(message.usage || message.finishReason) && (
        <div
          style={{
            fontSize: "0.66rem",
            color: T.text4,
            fontFamily: "var(--font-mono), ui-monospace, monospace",
            display: "flex",
            gap: "0.85rem",
          }}
        >
          {message.finishReason && <span>finish · {message.finishReason}</span>}
          {message.usage?.totalTokens != null && (
            <span>
              tokens · {message.usage.promptTokens ?? "?"}↑ {message.usage.completionTokens ?? "?"}↓{" "}
              {message.usage.totalTokens}=
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}

function ToolPanel({
  toolCalls,
  toolResults,
}: {
  toolCalls: ToolCall[];
  toolResults: ToolResult[];
}) {
  const [open, setOpen] = useState(false);
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  // Distinct tool names with counts
  const counts = toolCalls.reduce<Record<string, number>>((acc, t) => {
    acc[t.toolName] = (acc[t.toolName] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.45rem",
          padding: "0.35rem 0.6rem",
          background: T.surface,
          border: "none",
          borderRadius: 8,
          fontFamily: "inherit",
          fontSize: "0.72rem",
          fontWeight: 500,
          color: T.text2,
          cursor: "pointer",
          boxShadow: T.tier1,
          transition: "transform 0.18s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
      >
        <Wrench size={11} strokeWidth={2.25} color={T.accent} />
        <span>{toolCalls.length} appel{toolCalls.length > 1 ? "s" : ""} d&apos;outil</span>
        <div style={{ display: "flex", gap: "0.25rem", marginLeft: "0.2rem" }}>
          {Object.entries(counts).slice(0, 3).map(([name, n]) => (
            <span
              key={name}
              style={{
                fontFamily: "var(--font-mono), ui-monospace, monospace",
                fontSize: "0.66rem",
                color: T.accent,
                background: T.accentTint2,
                padding: "0.1rem 0.4rem",
                borderRadius: 4,
              }}
            >
              {name}
              {n > 1 && <span style={{ opacity: 0.7 }}>×{n}</span>}
            </span>
          ))}
          {Object.keys(counts).length > 3 && (
            <span
              style={{
                fontSize: "0.66rem",
                color: T.text3,
                padding: "0.1rem 0.3rem",
              }}
            >
              +{Object.keys(counts).length - 3}
            </span>
          )}
        </div>
        {open ? (
          <ChevronDown size={11} strokeWidth={2.5} color={T.text3} />
        ) : (
          <ChevronRight size={11} strokeWidth={2.5} color={T.text3} />
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                marginTop: "0.5rem",
                background: T.surface,
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: T.tier1,
              }}
            >
              {toolCalls.map((tc, i) => {
                const r = toolResults.find((x) => x.toolCallId === tc.toolCallId);
                const isOpen = openIdx === i;
                const errored =
                  r &&
                  typeof r.result === "object" &&
                  r.result !== null &&
                  "error" in (r.result as Record<string, unknown>);
                return (
                  <div
                    key={i}
                    style={{
                      borderTop: i === 0 ? "none" : `1px solid ${T.border}`,
                    }}
                  >
                    <button
                      onClick={() => setOpenIdx(isOpen ? null : i)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                        padding: "0.6rem 0.85rem",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        textAlign: "left",
                      }}
                    >
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 4,
                          background: errored ? "#FEE2E2" : T.accentTint2,
                          color: errored ? T.danger : T.accent,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {errored ? (
                          <CircleAlert size={10} strokeWidth={2.5} />
                        ) : (
                          <CircleCheck size={10} strokeWidth={2.5} />
                        )}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono), ui-monospace, monospace",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          color: T.text,
                        }}
                      >
                        {tc.toolName}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono), ui-monospace, monospace",
                          fontSize: "0.7rem",
                          color: T.text4,
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {compactArgs(tc.args)}
                      </span>
                      <ChevronRight
                        size={11}
                        strokeWidth={2.5}
                        color={T.text4}
                        style={{
                          transform: isOpen ? "rotate(90deg)" : "none",
                          transition: "transform 0.18s",
                        }}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                          style={{ overflow: "hidden" }}
                        >
                          <div
                            style={{
                              padding: "0 0.85rem 0.75rem",
                              display: "flex",
                              flexDirection: "column",
                              gap: "0.5rem",
                            }}
                          >
                            <Block label="Arguments" data={tc.args} />
                            {r && <Block label="Résultat" data={r.result} />}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function compactArgs(args: unknown): string {
  if (!args || typeof args !== "object") return "";
  const entries = Object.entries(args as Record<string, unknown>).filter(
    ([, v]) => v !== undefined && v !== null && v !== "",
  );
  if (entries.length === 0) return "()";
  const compact = entries
    .slice(0, 3)
    .map(([k, v]) => {
      if (typeof v === "string" && v.length > 40) {
        return `${k}="${v.slice(0, 38)}…"`;
      }
      return `${k}=${typeof v === "string" ? `"${v}"` : JSON.stringify(v)}`;
    })
    .join(" ");
  return entries.length > 3 ? `${compact} …` : compact;
}

function Block({ label, data }: { label: string; data: unknown }) {
  return (
    <div>
      <div
        style={{
          fontSize: "0.6rem",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: T.text4,
          marginBottom: "0.25rem",
        }}
      >
        {label}
      </div>
      <pre
        style={{
          margin: 0,
          padding: "0.55rem 0.7rem",
          background: T.surface3,
          border: `1px solid ${T.border}`,
          borderRadius: 6,
          fontFamily: "var(--font-mono), ui-monospace, monospace",
          fontSize: "0.72rem",
          color: T.text2,
          maxHeight: 260,
          overflow: "auto",
          lineHeight: 1.45,
        }}
      >
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

/* ─── thinking ─── */

function ThinkingIndicator({ activeTool }: { activeTool: string | null }) {
  const label = activeTool ? toolLabel(activeTool) + "…" : "L'agent interroge la donnée…";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          fontSize: "0.62rem",
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: T.accent,
        }}
      >
        <Sparkles size={10} strokeWidth={2.5} />
        Agent
      </div>
      <div
        style={{
          background: T.surface,
          borderRadius: "4px 14px 14px 14px",
          padding: "0.85rem 1.05rem",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.6rem",
          width: "fit-content",
          boxShadow: T.tier1,
        }}
      >
        <Dots />
        {activeTool ? (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.78rem",
              color: T.text2,
            }}
          >
            <Wrench size={11} strokeWidth={2.25} color={T.accent} />
            <AnimatePresence mode="wait">
              <motion.span
                key={activeTool}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.15 }}
              >
                {label}
              </motion.span>
            </AnimatePresence>
          </span>
        ) : (
          <span style={{ fontSize: "0.78rem", color: T.text3 }}>{label}</span>
        )}
      </div>
    </motion.div>
  );
}

function Dots() {
  return (
    <div style={{ display: "inline-flex", gap: 3 }}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            delay: i * 0.12,
            ease: "easeInOut",
          }}
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: T.accent,
          }}
        />
      ))}
    </div>
  );
}

/* ─── composer ─── */

function Composer({
  value,
  onChange,
  onSubmit,
  onKeyDown,
  onStop,
  loading,
  error,
  onClearError,
  onVoiceError,
  textareaRef,
  model,
  memoryCounts,
}: {
  value: string;
  onChange: (s: string) => void;
  onSubmit: (e: FormEvent) => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  onStop: () => void;
  loading: boolean;
  error: string | null;
  onClearError: () => void;
  onVoiceError?: (msg: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  model?: string;
  memoryCounts: Record<MemoryKind, number>;
}) {
  const injectedMemories =
    memoryCounts.preference + memoryCounts.watch + memoryCounts.note;
  const savedViews = memoryCounts["saved-view"];

  // Voice input — feature-detect once on mount so the button doesn't appear
  // in unsupported browsers (Firefox without an extension, older Safari).
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [recording, setRecording] = useState(false);
  const sessionRef = useRef<VoiceSession | null>(null);
  // Capture the text already in the textarea when recording starts, so the
  // user can dictate to append to (not replace) what they already typed.
  const dictationBaseRef = useRef<string>("");
  useEffect(() => setVoiceSupported(isVoiceInputSupported()), []);

  const stopDictation = useCallback(() => {
    sessionRef.current?.stop();
    sessionRef.current = null;
    setRecording(false);
  }, []);

  const startDictation = useCallback(() => {
    if (recording || loading) return;
    dictationBaseRef.current = value;
    try {
      const session = startVoiceInput({
        onTranscript: (transcript) => {
          const base = dictationBaseRef.current;
          const sep = base && !/\s$/.test(base) ? " " : "";
          onChange(base + sep + transcript);
        },
        onEnd: () => {
          sessionRef.current = null;
          setRecording(false);
          setTimeout(() => textareaRef.current?.focus(), 0);
        },
        onError: (err) => {
          // Surface only user-actionable errors. `no-speech` and `aborted`
          // fire during normal use (silence, user-initiated stop) and would
          // otherwise spam the banner.
          if (err === "not-allowed" || err === "service-not-allowed") {
            onVoiceError?.(
              "Le navigateur a refusé l'accès au micro. Vérifiez les permissions du site.",
            );
          } else if (err === "audio-capture") {
            onVoiceError?.("Aucun micro détecté.");
          } else if (err === "network") {
            onVoiceError?.(
              "Le service de reconnaissance vocale n'a pas répondu.",
            );
          }
        },
      });
      sessionRef.current = session;
      setRecording(true);
    } catch {
      setRecording(false);
    }
  }, [recording, loading, value, onChange, textareaRef, onVoiceError]);

  // Safety: stop dictation if the component unmounts mid-session.
  useEffect(() => () => sessionRef.current?.stop(), []);
  // Stop dictation as soon as a request starts streaming — keeping the mic
  // open while the agent is answering would be confusing.
  useEffect(() => {
    if (loading && sessionRef.current) stopDictation();
  }, [loading, stopDictation]);
  return (
    <div
      className="agent-composer-wrap"
      style={{
        borderTop: `1px solid ${T.border}`,
        background: T.bg,
        padding: "0.75rem clamp(0.85rem, 3vw, 2rem) calc(0.85rem + env(safe-area-inset-bottom, 0px))",
        flexShrink: 0,
      }}
    >
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        {error && (
          <div
            role="alert"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.78rem",
              padding: "0.55rem 0.8rem",
              background: T.surface,
              color: T.danger,
              borderRadius: 10,
              marginBottom: "0.55rem",
              boxShadow: `inset 0 0 0 1px ${T.danger}26, ${T.tier1}`,
            }}
          >
            <CircleAlert size={13} strokeWidth={2.25} aria-hidden="true" />
            <strong style={{ fontWeight: 600 }}>Erreur</strong>
            <span style={{ flex: 1, color: T.text2, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>{error}</span>
            <button
              onClick={onClearError}
              aria-label="Fermer l'erreur"
              style={{
                background: "transparent",
                border: "none",
                color: T.danger,
                cursor: "pointer",
                fontSize: "0.78rem",
                fontFamily: "inherit",
                padding: "0.15rem 0.3rem",
                borderRadius: 4,
                fontWeight: 500,
                flexShrink: 0,
              }}
            >
              fermer
            </button>
          </div>
        )}
        <form onSubmit={onSubmit}>
          <div
            className="agent-composer"
            style={{
              position: "relative",
              background: T.surface,
              border: "none",
              borderRadius: 14,
              transition: "box-shadow 0.2s ease",
              boxShadow: T.tier1,
            }}
          >
            <textarea
              ref={textareaRef}
              className="agent-input"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Posez une question en français…"
              disabled={loading}
              rows={1}
              aria-label="Message à l'agent"
              style={{
                width: "100%",
                resize: "none",
                background: "transparent",
                border: "none",
                outline: "none",
                fontFamily: "inherit",
                fontSize: "0.95rem",
                lineHeight: 1.5,
                color: T.text,
                padding: voiceSupported
                  ? "0.8rem 5.4rem 0.8rem 1rem"
                  : "0.8rem 3.4rem 0.8rem 1rem",
                maxHeight: 220,
                minHeight: 46,
              }}
            />
            {voiceSupported && !loading && (
              <button
                type="button"
                onClick={recording ? stopDictation : startDictation}
                aria-label={recording ? "Arrêter la dictée" : "Dicter une question"}
                title={recording ? "Arrêter la dictée" : "Dicter une question"}
                style={{
                  position: "absolute",
                  right: 48,
                  bottom: 8,
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  border: "none",
                  background: recording ? T.danger : T.surface,
                  color: recording ? "#FFFFFF" : T.text3,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: recording
                    ? "0 0 0 1px rgba(255,59,48,0.45), 0 4px 14px -4px rgba(255,59,48,0.40)"
                    : T.tier1,
                  transition: "background 0.15s, color 0.15s, box-shadow 0.18s",
                }}
                onMouseEnter={(e) => {
                  if (recording) return;
                  e.currentTarget.style.color = T.accent;
                }}
                onMouseLeave={(e) => {
                  if (recording) return;
                  e.currentTarget.style.color = T.text3;
                }}
              >
                {recording ? (
                  <motion.span
                    animate={{ scale: [1, 1.18, 1] }}
                    transition={{ repeat: Infinity, duration: 1.1 }}
                    style={{ display: "inline-flex" }}
                  >
                    <MicOff size={15} strokeWidth={2.25} />
                  </motion.span>
                ) : (
                  <Mic size={15} strokeWidth={2.25} />
                )}
              </button>
            )}
            {loading ? (
              <button
                type="button"
                onClick={onStop}
                aria-label="Arrêter la génération"
                style={{
                  position: "absolute",
                  right: 8,
                  bottom: 8,
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  border: "none",
                  background: T.danger,
                  color: "#FFFFFF",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.15s, transform 0.1s",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.25), 0 0 0 1px rgba(255,59,48,0.30), 0 4px 14px -4px rgba(255,59,48,0.40)",
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = "scale(0.94)";
                }}
                onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    background: "#FFFFFF",
                  }}
                />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!value.trim()}
                aria-label="Envoyer"
                style={{
                  position: "absolute",
                  right: 8,
                  bottom: 8,
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  border: "none",
                  background: !value.trim() ? T.surface3 : T.gradient,
                  color: !value.trim() ? T.text4 : "#FFFFFF",
                  cursor: !value.trim() ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.15s, transform 0.1s, box-shadow 0.18s",
                  boxShadow: !value.trim() ? "none" : T.gradientShadow,
                }}
                onMouseDown={(e) => {
                  if (value.trim())
                    e.currentTarget.style.transform = "scale(0.94)";
                }}
                onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                <ArrowUp size={15} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </form>
        <div
          className="agent-composer-meta"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "0.45rem",
            fontSize: "0.68rem",
            color: T.text4,
            gap: "0.6rem",
          }}
        >
          <span
            className="agent-composer-hint"
            style={{
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <kbd
                style={{
                  fontFamily: "var(--font-mono), ui-monospace, monospace",
                  fontSize: "0.62rem",
                  padding: "0.05rem 0.35rem",
                  borderRadius: 4,
                  background: T.surface,
                  color: T.text3,
                  boxShadow: `inset 0 0 0 1px ${T.border}`,
                }}
              >
                ↵
              </kbd>
              envoyer
            </span>
            <span style={{ color: T.text4 }}>·</span>
            <span
              aria-hidden="true"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <kbd
                style={{
                  fontFamily: "var(--font-mono), ui-monospace, monospace",
                  fontSize: "0.62rem",
                  padding: "0.05rem 0.35rem",
                  borderRadius: 4,
                  background: T.surface,
                  color: T.text3,
                  boxShadow: `inset 0 0 0 1px ${T.border}`,
                }}
              >
                ⇧↵
              </kbd>
              nouvelle ligne
            </span>
            {(injectedMemories > 0 || savedViews > 0) && (
              <>
                <span style={{ color: T.text4 }}>·</span>
                <span style={{ color: T.text3 }}>
                  {injectedMemories > 0 && (
                    <>
                      {injectedMemories} souvenir{injectedMemories > 1 ? "s" : ""}
                    </>
                  )}
                  {injectedMemories > 0 && savedViews > 0 && " · "}
                  {savedViews > 0 && (
                    <>
                      {savedViews} vue{savedViews > 1 ? "s" : ""}
                    </>
                  )}
                </span>
              </>
            )}
          </span>
          {model && (
            <span
              className="agent-composer-model"
              style={{
                fontFamily: "var(--font-mono), ui-monospace, monospace",
                whiteSpace: "nowrap",
              }}
            >
              {model}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
