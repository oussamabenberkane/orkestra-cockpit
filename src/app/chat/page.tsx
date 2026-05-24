"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  type ComponentType,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
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
  PanelRightClose,
  PanelRightOpen,
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
  type LucideIcon,
} from "lucide-react";
import { Markdown } from "./markdown";
import type { Memory, MemoryInput, MemoryKind } from "@/agent/memory/types";
import { getMemoryStore, LocalStorageMemoryStore, type MemoryStore } from "@/agent/memory/store";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/dashboard/AuthProvider";
import { loadAgentSettings } from "@/lib/agent-settings";
import { isVoiceInputSupported, startVoiceInput, type VoiceSession } from "./voice-input";
import {
  useAgentConversation,
  type Conversation,
  type Message,
  type ToolCall,
  type ToolResult,
} from "@/components/dashboard/AgentConversationProvider";
import { Sidebar as AppSidebar } from "@/components/dashboard/Sidebar";

/* ─── Plinth tokens — references the dashboard's CSS variables.
 * Keeping the `T` shape lets the rest of this file stay readable while
 * every color/shadow now resolves to the same `var(--*)` tokens the
 * dashboard uses. Theme flips (dark mode, brand change) propagate. */
const T = {
  bg: "var(--bg)",
  surface: "var(--surface)",
  surface2: "var(--surface-2)",
  surface3: "var(--surface-3)",
  border: "var(--border)",
  borderStrong: "var(--border-strong)",
  text: "var(--text)",
  text2: "var(--text-2)",
  text3: "var(--text-3)",
  text4: "var(--text-4)",
  accent: "var(--accent)",
  accent2: "var(--accent-2)",
  accentTint: "var(--accent-tint-2)",   /* 16% — matches the original visual */
  accentTint2: "var(--accent-tint)",    /* 10% */
  success: "var(--success)",
  successTint: "var(--success-tint)",
  warn: "var(--warn)",
  warnTint: "var(--warn-tint)",
  danger: "var(--danger)",
  dangerTint: "var(--danger-tint)",
  info: "var(--info)",
  infoTint: "var(--info-tint)",
  // Elevation system — atomic tokens from globals.css
  tier1: "var(--tier-1)",
  tier2: "var(--tier-2)",
  gradient: "linear-gradient(to bottom, #007AFF, #0062CC)",
  gradientShadow:
    "inset 0 1px 0 rgba(255,255,255,0.25), 0 0 0 1px rgba(0,98,204,0.30), 0 4px 14px -4px rgba(0,122,255,0.40)",
  gradientShadowHover:
    "inset 0 1px 0 rgba(255,255,255,0.25), 0 0 0 1px rgba(0,98,204,0.30), 0 8px 20px -4px rgba(0,122,255,0.50)",
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

// Message / ToolCall / ToolResult / Conversation are now imported from the
// AgentConversationProvider so that /chat and the FloatingDock preview share
// the same shape. The remaining types are page-local.

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

// Persisted sidebar collapse state. Conversation persistence is owned by the
// AgentConversationProvider — only the sidebar preference stays local here.
const SIDEBAR_STATE_KEY = "orkestra.agent-test.sidebar.v1";
/* Desktop collapse preference for the right history+memory rail. Independent
 * of the mobile open/closed drawer state stored under SIDEBAR_STATE_KEY. */
const SIDEBAR_COLLAPSED_KEY = "orkestra.agent-test.sidebar-collapsed.v1";

// Shared with /dashboard so the app-wide sidebar's collapsed preference
// carries across routes.
const APP_SIDEBAR_KEY = "orkestra.sidebar.collapsed";

// Below this width both sidebars become overlay drawers and the chat history
// rail defaults to closed on first visit. Matches /dashboard's mobile
// breakpoint so the two rails feel consistent across routes. Keep this in
// sync with the @media (max-width: 720px) blocks at the bottom of the file.
const SIDEBAR_BREAKPOINT = 720;

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
  // Conversation state (list, active id, in-flight stream, errors, active
  // tool) is now owned by the AgentConversationProvider so the FloatingDock
  // preview on /dashboard and /rapports can read the same thread.
  const {
    conversations,
    activeId,
    active,
    loading,
    error,
    activeTool,
    setActive: setActiveId,
    newConversation: providerNewConversation,
    deleteConversation,
    send: providerSend,
    stop,
    editUserMessage: providerEditUserMessage,
    clearError,
  } = useAgentConversation();

  const router = useRouter();

  /* App-wide left sidebar collapse state — mirrors /dashboard so the
   * preference carries across routes. Hydrated from localStorage after mount. */
  const [appSidebarCollapsed, setAppSidebarCollapsed] = useState(false);
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(APP_SIDEBAR_KEY);
      if (stored === "true") setAppSidebarCollapsed(true);
    } catch {}
  }, []);
  const toggleAppSidebar = useCallback(() => {
    setAppSidebarCollapsed((prev) => {
      const next = !prev;
      try { window.localStorage.setItem(APP_SIDEBAR_KEY, String(next)); } catch {}
      return next;
    });
  }, []);
  const onLogout = useCallback(async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  }, [router]);

  const [input, setInput] = useState("");
  const [health, setHealth] = useState<Health | null>(null);
  // Local UI-side errors (voice input failures, etc.) live next to the
  // provider's stream error. The displayed error prefers the local one.
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const displayedError = voiceError ?? error;
  const clearDisplayedError = useCallback(() => {
    setVoiceError(null);
    clearError();
  }, [clearError]);
  // Default is true for SSR parity; on mount we override from localStorage or,
  // for first visits, from the viewport width (closed below SIDEBAR_BREAKPOINT
  // so mobile doesn't land on a full-screen drawer over a scrim).
  const [sidebarOpen, setSidebarOpen] = useState(true);
  /* Desktop collapsed (slim icon rail) vs expanded (full panel). Mirrors the
   * left shared sidebar's pattern. Hydrated from localStorage after mount. */
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // Becomes true once localStorage has been read. Guards the persist effect
  // so it can't clobber saved data with the default state before rehydration.
  const [hydrated, setHydrated] = useState(false);
  // Tracks whether the layout breakpoint considers us "mobile" (drawer mode).
  // Updated on resize so the sidebar render mode reacts live.
  const [isMobileLayout, setIsMobileLayout] = useState(false);
  // True only while the user is scrolled away from the bottom of the message
  // list. Drives the "scroll to bottom" pill and pauses autoscroll on stream.
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  // Live composer height — used to position the scroll-to-bottom pill exactly
  // above the composer regardless of breakpoint or autogrow state. Static CSS
  // offsets were fragile when the textarea grew. Default ≈ resting composer.
  const [composerHeight, setComposerHeight] = useState(160);
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

  const { user } = useAuth();

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const isFirstScroll = useRef(true);
  // Memoised store handle — starts as the local fallback, replaced with
  // SupabaseMemoryStore once the session resolves.
  const memoryStoreRef = useRef<MemoryStore>(new LocalStorageMemoryStore());
  // Cached agent settings — defaults match runtime defaults, updated from
  // Supabase on mount. Avoids a loading state for non-critical preferences.
  const memoryEnabledRef = useRef(true);
  const modelRef = useRef("mistral-large-latest");
  const temperatureRef = useRef(0.2);

  useEffect(() => {
    fetch("/api/agent")
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  // Conversation rehydration is owned by AgentConversationProvider. We only
  // recover the sidebar preferences here.
  useEffect(() => {
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
    try {
      const stored = window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      if (stored === "true") setSidebarCollapsed(true);
    } catch {}

    setHydrated(true);
  }, []);

  // Persist the sidebar preferences after the user has had a chance to toggle.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(SIDEBAR_STATE_KEY, sidebarOpen ? "open" : "closed");
    } catch {
      // storage disabled — preference degrades to per-session.
    }
  }, [sidebarOpen, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(sidebarCollapsed));
    } catch {}
  }, [sidebarCollapsed, hydrated]);

  /* Single toggle handler — mobile flips the drawer, desktop flips the
   * collapsed (slim-rail) state. Same trigger button can call this from
   * either the topbar or the sidebar's internal chevron. */
  const toggleSidebar = useCallback(() => {
    if (isMobileLayout) {
      setSidebarOpen((v) => !v);
    } else {
      setSidebarCollapsed((v) => !v);
    }
  }, [isMobileLayout]);

  /* Cross-sidebar mobile coordination — when the right history drawer
   * opens, signal the app sidebar (left) to close, and vice versa. */
  useEffect(() => {
    if (!sidebarOpen || !isMobileLayout) return;
    window.dispatchEvent(
      new CustomEvent("orkestra:close-sidebars", { detail: { source: "chat-history" } }),
    );
  }, [sidebarOpen, isMobileLayout]);
  useEffect(() => {
    const onCloseOthers = (e: Event) => {
      const detail = (e as CustomEvent<{ source?: string }>).detail;
      if (detail?.source === "chat-history") return;
      if (isMobileLayout) setSidebarOpen(false);
    };
    window.addEventListener("orkestra:close-sidebars", onCloseOthers);
    return () => window.removeEventListener("orkestra:close-sidebars", onCloseOthers);
  }, [isMobileLayout]);

  /* Lock background scroll when the chat history drawer is open on mobile
   * (same mechanism the app sidebar uses — toggling a class on <html>). */
  useEffect(() => {
    if (!sidebarOpen || !isMobileLayout) return;
    document.documentElement.classList.add("scroll-locked");
    return () => {
      document.documentElement.classList.remove("scroll-locked");
    };
  }, [sidebarOpen, isMobileLayout]);

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

  // Resolve the correct store (Supabase when authenticated, localStorage
  // otherwise) then load the initial memory list.
  useEffect(() => {
    getMemoryStore().then((store) => {
      memoryStoreRef.current = store;
      return store.list();
    }).then(setMemories).catch(() => setMemories([]));
  }, []);

  // Load all agent settings for the current user.
  useEffect(() => {
    if (!user) return;
    loadAgentSettings(user.id)
      .then(({ memoryEnabled, model, temperature }) => {
        memoryEnabledRef.current = memoryEnabled;
        modelRef.current = model;
        temperatureRef.current = temperature;
      })
      .catch(() => {});
  }, [user]);

  // Conversation persistence is owned by AgentConversationProvider — no
  // local persist effect here.

  // Autoscroll on new content — but only if content actually overflows and the
  // user is already pinned to the bottom. Skipping when content fits the
  // viewport keeps the page static for short conversations. The first scroll
  // per conversation uses "instant" so loading a previous chat doesn't animate.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollHeight <= el.clientHeight) return;
    if (!showScrollBottom) {
      const behavior = isFirstScroll.current ? "instant" : "smooth";
      isFirstScroll.current = false;
      el.scrollTo({ top: el.scrollHeight, behavior });
    }
  }, [active.messages, loading, showScrollBottom]);

  // Track distance-from-bottom on the scroll container so we can (a) skip
  // autoscroll while the user is reading earlier turns and (b) reveal the
  // "scroll to bottom" pill. A small slack keeps the pill from flashing on
  // sub-pixel rounding.
  useEffect(() => {
    isFirstScroll.current = true;
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

  // Autogrow textarea.
  //   Empty:  leave `height` unset so CSS `min-height` (88px ≤1024, 90px
  //           desktop) is the single source of truth — kills the "tall on
  //           load" first-paint flash.
  //   Typed:  clamp the inline height to [min, cap], where `min` mirrors
  //           the CSS baseline. Without this floor, some browsers report
  //           `scrollHeight` as the bare content height (~30px for one
  //           character), the inline `height` wins the layout pass before
  //           the CSS `min-height` kicks back in, and the field visibly
  //           shrinks on the first keystroke. Mirrors fix on every
  //           breakpoint so desktop, tablet, and phone all stay stable.
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    if (!input) {
      ta.style.height = "";
      return;
    }
    const compact =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 1024px)").matches;
    const min = compact ? 88 : 90;
    const cap = compact ? 200 : 340;
    ta.style.height = "auto";
    ta.style.height = `${Math.max(min, Math.min(ta.scrollHeight, cap))}px`;
  }, [input]);

  // iOS Safari: when the on-screen keyboard opens, the layout viewport stays
  // at 100dvh but the *visible* viewport shrinks. Without this, the composer
  // gets pushed under the keyboard and dismissing it leaves a grey gap at the
  // bottom while the page settles. Pinning .agent-root to visualViewport
  // keeps the shell glued to whatever the user can actually see.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const vv = window.visualViewport;
    if (!vv) return;
    const root = document.querySelector(".agent-root") as HTMLElement | null;
    if (!root) return;
    const sync = () => {
      root.style.height = `${vv.height}px`;
    };
    sync();
    vv.addEventListener("resize", sync);
    vv.addEventListener("scroll", sync);
    return () => {
      vv.removeEventListener("resize", sync);
      vv.removeEventListener("scroll", sync);
      root.style.height = "";
    };
  }, []);

  // Lock the document while /chat is mounted. iOS Safari's default focus-
  // into-view scrolls the WHOLE document up when the keyboard opens — even
  // though .agent-root is overflow:hidden, html/body still are not, so the
  // user can swipe up and watch the composer slide above the visible area.
  // Pinning html/body to viewport height with overflow:hidden eliminates
  // that escape hatch: only .agent-scroll (the message list) can scroll,
  // and the composer stays anchored above the keyboard.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const html = document.documentElement;
    const body = document.body;
    const prev = {
      htmlOverflow: html.style.overflow,
      htmlHeight: html.style.height,
      bodyOverflow: body.style.overflow,
      bodyHeight: body.style.height,
      bodyOverscroll: body.style.overscrollBehavior,
    };
    html.style.overflow = "hidden";
    html.style.height = "100%";
    body.style.overflow = "hidden";
    body.style.height = "100%";
    body.style.overscrollBehavior = "none";
    return () => {
      html.style.overflow = prev.htmlOverflow;
      html.style.height = prev.htmlHeight;
      body.style.overflow = prev.bodyOverflow;
      body.style.height = prev.bodyHeight;
      body.style.overscrollBehavior = prev.bodyOverscroll;
    };
  }, []);

  // Track the composer wrap's live height so the scroll-to-bottom pill can
  // sit exactly above it regardless of breakpoint, autogrow state, or
  // safe-area insets. ResizeObserver fires on every height change — textarea
  // typing, viewport rotation, address-bar collapse all flow through.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = document.querySelector(
      ".agent-composer-wrap",
    ) as HTMLElement | null;
    if (!el) return;
    const update = () => setComposerHeight(el.offsetHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // When the textarea is focused (keyboard opens on mobile), nudge the
  // message list to its latest turn. Otherwise the visualViewport contraction
  // would leave the user looking at the middle of the conversation instead of
  // the answer they just sent. Runs once per focus, after a tick so the
  // viewport has had time to settle.
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const onFocus = () => {
      window.setTimeout(() => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      }, 220);
    };
    ta.addEventListener("focus", onFocus);
    return () => ta.removeEventListener("focus", onFocus);
  }, []);

  // /chat-local memory observers: after a stream resolves, the
  // AgentConversationProvider may have drained save_memory proposals into the
  // memory store. Refresh `memories` so the sidebar reflects new entries.
  const refreshMemories = useCallback(async () => {
    try {
      const next = await memoryStoreRef.current.list();
      setMemories(next);
    } catch {
      /* swallow — fall back to whatever is in state */
    }
  }, []);

  // `send` wrapper — passes the local memories list (which the provider does
  // not own) and clears the composer immediately on submit. After the stream
  // finishes, refreshMemories picks up any save_memory proposals the provider
  // drained into the store.
  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;
      setInput("");
      await providerSend(trimmed, {
        memories: memoryEnabledRef.current ? memories : [],
        model: modelRef.current,
        temperature: temperatureRef.current,
      });
      await refreshMemories();
    },
    [loading, providerSend, memories, refreshMemories],
  );

  // Keep sendRef pointing at the latest `send` so deferred callers (timers
  // that fire after a state update has produced a new closure) hit the
  // current `active.messages` and `activeId`.
  const sendRef = useRef<(text: string) => Promise<void>>(async () => {});
  useEffect(() => {
    sendRef.current = send;
  }, [send]);

  // Edit & retry — trim the active conversation back to before the user turn,
  // prefill the composer with its content, focus the textarea. The user
  // re-submits via Enter or the send button. Truncation is delegated to the
  // provider; setInput/focus stay local to /chat.
  /* Inline edit-and-resend: truncates the conversation back to just before
   * the edited user message, then resubmits the new text via `send` so the
   * agent re-answers without the user having to retype. The UserMessage
   * bubble owns the editing UX; this handler just performs the action. */
  const editUserMessage = useCallback(
    (idx: number, newText: string) => {
      const msg = active.messages[idx];
      if (!msg || msg.role !== "user" || !msg.id) return;
      const trimmed = newText.trim();
      if (!trimmed) return;
      providerEditUserMessage(msg.id);
      /* Defer so the truncation reducer settles before we append + stream. */
      setTimeout(() => { void send(trimmed); }, 0);
    },
    [active.messages, providerEditUserMessage, send],
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

  const newConversation = useCallback(() => {
    providerNewConversation();
    setInput("");
  }, [providerNewConversation]);

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
  const replaySavedView = useCallback(
    (m: Memory) => {
      providerNewConversation();
      setInput("");
      // Go through sendRef rather than capturing `send` directly: the captured
      // version would close over the pre-replay conversation state. Deferring
      // also lets the provider commit the new active id before send reads it.
      setTimeout(() => sendRef.current(m.body), 0);
    },
    [providerNewConversation],
  );

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
        background: "var(--surface-2)",
        color: "var(--text)",
        fontFamily: "var(--font-sans), system-ui, sans-serif",
        display: "flex",
        overflow: "hidden",
        visibility: hydrated ? "visible" : "hidden",
      }}
    >
      {/* ─── App-wide sidebar (left) — same component as /dashboard ─── */}
      <AppSidebar
        collapsed={appSidebarCollapsed}
        onToggle={toggleAppSidebar}
        onLogout={onLogout}
        onOpenPalette={() => {}}
        onOpenModal={() => router.push("/dashboard")}
      />

      {/* ─── Chat column ─── */}
      <div
        className="agent-column"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          minHeight: 0,
          background: "var(--bg)",
        }}
      >
        <TopBar
          title={active.title}
          hasMessages={active.messages.length > 0}
          loading={loading}
          memoryCount={memories.length}
          memoryDrawerOpen={memoryDrawerOpen}
          onToggleMemoryDrawer={() => setMemoryDrawerOpen((v) => !v)}
          historyOpen={isMobileLayout ? sidebarOpen : !sidebarCollapsed}
          onToggleHistory={toggleSidebar}
        />

        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            minHeight: 0,
            background: "var(--bg)",
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
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "clamp(1.2rem, 2.8vw, 1.6rem)",
                }}>
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
                            ? (newText: string) => editUserMessage(i, newText)
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
                className="agent-scroll-to-bottom"
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
                  /* Anchored 12px above the composer's measured top edge.
                   * `composerHeight` already includes its safe-area padding,
                   * so this offset works for every breakpoint and tracks the
                   * autogrow textarea live via ResizeObserver. */
                  bottom: `${composerHeight + 12}px`,
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
            error={displayedError}
            onClearError={clearDisplayedError}
            onVoiceError={setVoiceError}
            textareaRef={textareaRef}
            model={health?.model}
            memoryCounts={memoryCounts}
          />
        </main>
      </div>

      {/* ─── Chat history (right rail) — own expand/collapse + mobile drawer ─── */}
      <Sidebar
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        conversations={conversations}
        activeId={activeId}
        onSelect={setActiveId}
        onNew={newConversation}
        onDelete={deleteConversation}
        datasetLabel={datasetLabel}
        model={health?.model}
        onCloseMobile={() => setSidebarOpen(false)}
      />

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
        /* History rail width responds to viewport — narrower on tablet, full
           drawer width on mobile so the touch targets stay comfortable. */
        :root, .agent-root { --agent-sidebar-w: 288px; }
        @media (max-width: 1100px) {
          .agent-root { --agent-sidebar-w: 256px; }
        }
        @media (max-width: 720px) {
          .agent-root { --agent-sidebar-w: min(86vw, 320px); }
        }

        /* Mobile drawer — pins to the right edge so it slides in opposite the
           shared app sidebar on the left. Scrim catches taps outside the
           drawer; one-at-a-time coordination with the app sidebar happens via
           the orkestra:close-sidebars custom event. */
        .agent-sidebar-scrim { display: none; }
        @media (max-width: 720px) {
          .agent-sidebar {
            position: fixed !important;
            top: 0;
            bottom: 0;
            right: 0;
            z-index: 50;
            box-shadow: -8px 0 32px rgba(0,0,0,0.16);
            /* Mobile drawer always uses the full var width regardless of the
             * desktop "collapsed" preference. The slim rail is hidden below. */
            width: var(--agent-sidebar-w, 320px) !important;
            /* Slide-in/out animation tied to data-open. Without this rule the
             * drawer is fixed:right:0 with no visibility binding, so clicking
             * the in-drawer close button flips state but nothing moves on
             * screen — the "blocked on expanded" symptom. */
            transition:
              transform 0.26s cubic-bezier(0.22, 1, 0.36, 1),
              box-shadow 0.26s ease !important;
          }
          .agent-sidebar[data-open="false"] {
            transform: translateX(100%);
            box-shadow: none;
            pointer-events: none;
          }
          .agent-sidebar[data-open="true"] {
            transform: translateX(0);
          }
          .agent-sidebar-scrim {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.32);
            backdrop-filter: blur(2px);
            -webkit-backdrop-filter: blur(2px);
            z-index: 49;
          }
          /* Slim rail is desktop-only. On mobile the drawer renders the full
           * content directly. */
          .agent-sidebar-rail { display: none !important; }
          .agent-sidebar-content { display: flex !important; }
        }

        /* Desktop collapse mode — slim icon rail only, full content hidden.
         * !important is required because the rail and content elements set
         * display:flex inline; that wins over a regular CSS rule even
         * inside a media query. */
        @media (min-width: 721px) {
          .agent-sidebar[data-collapsed="true"] .agent-sidebar-content {
            display: none !important;
          }
          .agent-sidebar[data-collapsed="false"] .agent-sidebar-rail {
            display: none !important;
          }
          /* Topbar's history toggle is desktop-redundant once the sidebar
           * carries its own collapse/expand chevron. Keep it for the mobile
           * drawer where the panel itself is hidden when closed. */
          .agent-topbar-history-toggle { display: none !important; }
        }

        /* TopBar — hide the memory label on narrow widths so the chrome stays
           tight; the icon + count badge alone are enough on small screens. */
        @media (max-width: 600px) {
          .agent-memory-trigger-label { display: none !important; }
        }

        /* On mobile, the app sidebar's portaled top clearance bar adds 4.5rem
           of safe top space for the hamburger. Inset our column past that so
           the topbar isn't hidden behind it. */
        @media (max-width: 720px) {
          .agent-column { padding-top: 4.5rem; }
          /* Topbar must drop its stacking context on mobile so the
           * position:fixed children below can escape to body's z-order.
           * Both position:sticky (in some browsers) AND z-index:30 create
           * a context that would trap them at an effective z=30, beneath
           * the clearance bar (z=39). position:static + z-index:auto is
           * the only combo guaranteed to NOT create a stacking context.
           * Sticky isn't needed on mobile anyway — column doesn't scroll. */
          .agent-topbar {
            position: static !important;
            z-index: auto !important;
            padding-right: clamp(0.85rem, 2.5vw, 1.5rem);
          }
          /* Float the topbar's memory + history-toggle pair into the clearance
           * band so they sit on the exact same y as the left hamburger
           * (top:0.75rem). z:46 puts them above the clearance strip (z:39)
           * and the hamburger (z:45), and below the drawer scrim (z:49). */
          .agent-topbar-actions {
            position: fixed !important;
            top: 0.75rem;
            right: 0.75rem;
            z-index: 46;
          }
        }

        /* Composer — focus ring lives on the wrapper via :focus-within so the
           ring follows the textarea, mic, and send button as one cohesive
           field. Keeps the click-zone obvious for keyboard users. */
        .agent-composer { transition: box-shadow 0.2s ease, border-color 0.2s ease; }
        .agent-composer:focus-within {
          /* Soft accent border + 3px halo on focus — replaces the prior heavy
           * 4-layer shadow. Stays consistent with the frosted resting state. */
          border-color: var(--accent) !important;
          box-shadow:
            0 0 0 3px var(--accent-tint),
            0 1px 2px rgba(0,0,0,0.03),
            0 8px 24px -10px rgba(0,0,0,0.08),
            0 20px 48px -24px rgba(0,0,0,0.10);
        }
        /* Desktop composer floor — two-row minimum (~92px card with border).
         * Overridden to 42px by the mobile rule below. */
        textarea.agent-input { min-height: 90px; }
        textarea.agent-input::placeholder { color: ${T.text4}; }
        textarea.agent-input:disabled { cursor: not-allowed; opacity: 0.6; }
        /* Thin primary-accent scrollbar — only visible once content exceeds
         * the textarea's max-height. Firefox uses scrollbar-width/-color;
         * WebKit/Chromium gets the explicit ::-webkit-scrollbar rules.
         *
         * Clipping note: .agent-composer carries the visible rounded border
         * (radius 16px) but no overflow clip, so the textarea's scrollbar
         * was rendering into the curved corner. The 'overflow: hidden' below
         * makes the rounded shape an actual mask — anything that lands in
         * the corner now gets clipped cleanly instead of looking sliced.
         *
         * The thumb's transparent border (with background-clip: content-box)
         * insets the visible bar ~3px from the right edge so it sits inside
         * the curve. The 16px top/bottom track margin keeps the thumb out of
         * the curved corner area entirely, so even with the up/down buttons
         * fully removed there's no visual collision. */
        .agent-composer { overflow: hidden; }
        textarea.agent-input {
          scrollbar-width: thin;
          scrollbar-color: var(--accent) transparent;
        }
        textarea.agent-input::-webkit-scrollbar { width: 10px; }
        textarea.agent-input::-webkit-scrollbar-track {
          background: transparent;
          margin: 12px 0;
        }
        textarea.agent-input::-webkit-scrollbar-thumb {
          background: var(--accent);
          border-radius: 999px;
          border: 3px solid transparent;
          background-clip: content-box;
        }
        textarea.agent-input::-webkit-scrollbar-thumb:hover {
          background: var(--accent-2);
          background-clip: content-box;
        }
        /* Kill the up/down arrow buttons in every shape Chromium hands them
         * out (single-button, double-button, start/end, increment/decrement).
         * One bare ::-webkit-scrollbar-button rule isn't always enough on
         * Windows builds — the slot is still reserved unless every variant
         * is zeroed out. */
        textarea.agent-input::-webkit-scrollbar-button,
        textarea.agent-input::-webkit-scrollbar-button:single-button,
        textarea.agent-input::-webkit-scrollbar-button:vertical:start:decrement,
        textarea.agent-input::-webkit-scrollbar-button:vertical:start:increment,
        textarea.agent-input::-webkit-scrollbar-button:vertical:end:decrement,
        textarea.agent-input::-webkit-scrollbar-button:vertical:end:increment {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
          -webkit-appearance: none !important;
          appearance: none !important;
          background: transparent !important;
        }

        /* Hide the keyboard hint on narrow screens — the kbd glyphs aren't
           useful on touch devices that don't have a real Enter key. */
        @media (max-width: 600px) {
          .agent-composer-hint { font-size: 0.66rem; }
          .agent-composer-hint kbd { display: none; }
        }
        @media (max-width: 420px) {
          .agent-composer-model { display: none !important; }
        }

        /* ─── Mobile shell compaction ───
         * The topbar contributes ~64px between the floating button band and
         * the welcome content, but its only inline content (conversation
         * title) is HIDDEN on the empty/welcome screen. Collapse the topbar
         * to zero on mobile so the eyebrow sits flush against the clearance
         * band. When a conversation has messages, the title grows naturally
         * (~24-32px) — a one-time layout adjustment per navigation, not on
         * load. */
        @media (max-width: 720px) {
          /* Remove min-height:100vh which on iOS Safari (address bar visible)
           * is larger than the dynamic viewport, pushing the composer off-screen.
           * height:100dvh (inline) correctly tracks the visible area.
           *
           * Also lock the column + main so only .agent-scroll can scroll. Without
           * this, iOS Safari's focus-into-view scrolls the whole agent-column
           * past the viewport when the keyboard opens, pushing the composer
           * out of view and leaving a grey strip behind when it closes. The
           * visualViewport effect (in the page component) keeps .agent-root
           * pinned to the visible viewport; these rules make sure nothing
           * between it and .agent-scroll can scroll the layout up. */
          .agent-root {
            min-height: 0 !important;
            overflow: hidden !important;
          }
          .agent-column {
            overflow: hidden !important;
            min-height: 0 !important;
          }
          .agent-column > main {
            overflow: hidden !important;
            min-height: 0 !important;
          }
          .agent-scroll {
            overscroll-behavior: contain !important;
            -webkit-overflow-scrolling: touch;
          }
          .agent-topbar {
            min-height: 0 !important;
            padding-top: 0 !important;
            padding-bottom: 0 !important;
            border-bottom-color: transparent !important;
          }
          /* Scroll container — minimal top space, plus a subtle ~10px gap
           * at the bottom so long conversations don't have their last bubble
           * touching the composer. Small enough that it doesn't reflow short
           * threads. */
          .agent-scroll {
            padding-top: 0.65rem !important;
            padding-bottom: 0.65rem !important;
          }
          /* Welcome itself — no extra top space. */
          .agent-welcome { padding-top: 0 !important; }
        }

        /* ─── Suggestion tiles: centered stack, title slot pre-reserved ───
         * The whole icon + title stack is centered vertically in the tile
         * (justify-content: center). To stop the icon from being LIFTED
         * when a long title wraps to two lines, the title slot reserves a
         * fixed min-height of 2.4em (= two lines of its 1.2 line-height).
         * 1-line titles render at the top of that slot; 2-line titles fill
         * it. Either way, the total stack height is identical across all
         * tiles in a row, so the icon centered position never shifts. */
        @media (max-width: 720px) {
          .agent-welcome-grid {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 0.45rem !important;
          }
          .agent-welcome-grid > button {
            aspect-ratio: 1 / 1;
            min-height: 0 !important;
            padding: 0.5rem 0.4rem !important;
            border-radius: 12px !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            text-align: center !important;
            gap: 0.5rem !important;
            overflow: hidden !important;
          }
          /* Icon row — center the chip, hide the chevron (the SVG sibling
           * of the chip span). */
          .agent-welcome-grid > button > div:first-child {
            justify-content: center !important;
            width: auto !important;
            flex-shrink: 0 !important;
          }
          .agent-welcome-grid > button > div:first-child > svg {
            display: none !important;
          }
          /* Icon chip — bump up so it carries the centered composition. */
          .agent-welcome-grid > button [data-suggest-icon] {
            width: 32px !important;
            height: 32px !important;
            border-radius: 9px !important;
          }
          .agent-welcome-grid > button [data-suggest-icon] svg {
            width: 16px !important;
            height: 16px !important;
          }
          /* Title — fixed 2-line slot. Line-clamp 2 caps any oversized
           * label; min-height 2.4em (= 2 × line-height 1.2) reserves the
           * slot even for 1-line labels so the icon above never shifts. */
          .agent-welcome-grid > button > div:nth-child(2) {
            font-size: 0.76rem !important;
            line-height: 1.2 !important;
            font-weight: 600 !important;
            color: var(--text) !important;
            min-height: 2.4em !important;
            display: -webkit-box !important;
            -webkit-line-clamp: 2 !important;
            -webkit-box-orient: vertical !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            max-width: 100% !important;
          }
          /* Hint row — hidden, title alone is the affordance. */
          .agent-welcome-grid > button > div:nth-child(3) {
            display: none !important;
          }
        }
        @media (max-width: 380px) {
          .agent-welcome-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        /* Helper line above grid hidden on narrow — already implicit from
         * the centered tile labels. */
        @media (max-width: 540px) {
          .agent-welcome-helper { display: none !important; }
        }

        /* ─── Composer: tablet + mobile single-row pill (≤1024px) ───
         * iPad portrait sits between 768 and 1024px; the old layout left it
         * on the desktop two-row composer which felt oversized. This block
         * brings the 44px pill all the way up to the iPad-Pro-portrait edge,
         * matching the .dashboard-hero / .kpi-strip-compact breakpoint
         * convention used elsewhere in the app. The narrower 720px block
         * below overrides this with phone-specific button geometry. */
        @media (max-width: 1024px) {
          textarea.agent-input {
            font-size: 16px !important;     /* prevent iOS auto-zoom on focus */
            /* Two-row baseline (~88px). With the buttons now in their own
             * row beneath the textarea (.agent-composer-actions), the
             * textarea is back to symmetric horizontal padding — text uses
             * the full width without wrapping around button hit-boxes. */
            min-height: 88px !important;
            line-height: 1.4 !important;
            padding: 0.7rem 1rem 0.55rem 1rem !important;
            max-height: 200px !important;
          }
          .agent-composer { border-radius: 12px !important; }
          .agent-composer-meta { display: none !important; }
        }

        /* ─── Composer: standard mobile single-row pill ───
         * Target: ~44px card height (= Apple HIG / Material touch target
         * floor and the dominant mobile-chat-input pattern in ChatGPT,
         * Claude, WhatsApp, iMessage). Auto-grows up to maxHeight on
         * multi-line input. 16px font prevents iOS auto-zoom on focus.
         *
         * Geometry:
         *   textarea: 42px min total (border-box) + 2px card border = ~44px card
         *   action buttons: 32×32 at bottom:4px (3px clearance each side)
         *   wrapper pad: 0.08rem top / 0.45rem bottom + safe area inset */
        @media (max-width: 720px) {
          /* Textarea: slim single-row pill (~44px card, WhatsApp/iMessage style).
           * 16px font prevents iOS auto-zoom; min-height 42px (border-box total)
           * gives a 44px card with 2px border. Action buttons at bottom:4px sit
           * comfortably inside. */
          textarea.agent-input {
            font-size: 16px !important;
            /* Phone matches the tablet baseline — both rely on the new
             * actions row below the textarea for the buttons, so the
             * textarea is plain symmetric padding now. */
            min-height: 88px !important;
            line-height: 1.4 !important;
            padding: 0.65rem 1rem 0.5rem 1rem !important;
            max-height: 180px !important;
            /* Hide the scrollbar entirely on phone — touch scroll handles
             * the overflow naturally, and the rendered scrollbar (plus its
             * end-cap buttons) was too visually noisy at this width.
             * Content still scrolls; only the chrome is gone. */
            scrollbar-width: none !important;
          }
          textarea.agent-input::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
          }
          .agent-composer { border-radius: 12px !important; }
          /* No top gap between grid and composer; safe-area handles bottom. */
          .agent-composer-wrap {
            padding: 0.08rem 0.7rem calc(0.45rem + env(safe-area-inset-bottom, 0px)) !important;
          }
          .agent-composer-meta { display: none !important; }
          /* Action buttons — 32×32 in the dedicated actions row below the
           * textarea. No right/bottom needed since they're flex children. */
          .agent-composer-send,
          .agent-composer-stop,
          .agent-composer-mic {
            width: 32px !important;
            height: 32px !important;
            border-radius: 9px !important;
          }
        }

        /* ─── Tap-to-edit (touch devices) ───
         * The Modifier chip on user bubbles uses opacity:0 + pointer-events:
         * none until hover — which never fires on touch. Force the chip
         * visible/interactive on any pointer that doesn't support hover. */
        @media (hover: none) {
          .agent-edit-trigger {
            opacity: 1 !important;
            pointer-events: auto !important;
          }
        }

        /* Edit card on mobile — tighter padding, hide the kbd-shortcut hint
         * that doesn't apply on touch, bump textarea to 16px. */
        @media (max-width: 540px) {
          .agent-edit-card {
            padding: 0.45rem 0.45rem 0.5rem !important;
            border-radius: 14px !important;
          }
          .agent-edit-input-wrap {
            padding: 0.7rem 0.85rem !important;
            border-radius: 10px !important;
          }
          .agent-edit-textarea {
            font-size: 16px !important;
          }
          .agent-edit-hint { display: none !important; }
          .agent-edit-footer {
            justify-content: flex-end !important;
            padding: 0.05rem 0.2rem 0 !important;
          }
          /* Bump action buttons to the 44pt touch-target floor so a thumb
           * tap lands cleanly without precision pixel-hunting. */
          .agent-edit-footer button {
            min-height: 40px !important;
            padding: 0.55rem 1.05rem !important;
            font-size: 0.85rem !important;
          }
        }

        /* Welcome typography compaction on narrow screens — every saved row
         * here is one we don't need to scroll to reveal the suggestion grid
         * and composer underneath. */
        @media (max-width: 540px) {
          .agent-welcome > h1 {
            font-size: 1.25rem !important;
            margin-bottom: 0.3rem !important;
            line-height: 1.15 !important;
          }
          .agent-welcome > p {
            font-size: 0.82rem !important;
            line-height: 1.4 !important;
            margin-bottom: 0.6rem !important;
          }
          /* The mono eyebrow above the H1 — trim its margin so the heading
           * sits close. */
          .agent-welcome > div:first-of-type {
            margin-bottom: 0.35rem !important;
          }
          /* "Pour démarrer" section bar — compact its margin. */
          .agent-welcome > div:nth-of-type(2) {
            margin-bottom: 0.35rem !important;
          }
        }

        /* On the smallest devices (≤380px / iPhone SE-class) the descriptive
         * paragraph is the lowest-priority text — fold it so the eyebrow +
         * heading + 6 tiles + composer all fit without scroll. */
        @media (max-width: 380px) {
          .agent-welcome > p { display: none !important; }
        }

        /* Message bubbles — give the assistant card a max width and lift the
           user bubble's cap on narrower screens so threads don't feel cramped. */
        @media (max-width: 540px) {
          .agent-scroll [data-user-bubble] { max-width: 92% !important; }
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
          50% { box-shadow: 0 0 0 6px rgba(0,122,255,0.04); }
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
  title,
  hasMessages,
  loading,
  memoryCount,
  memoryDrawerOpen,
  onToggleMemoryDrawer,
  historyOpen,
  onToggleHistory,
}: {
  title: string;
  hasMessages: boolean;
  loading: boolean;
  memoryCount: number;
  memoryDrawerOpen: boolean;
  onToggleMemoryDrawer: () => void;
  historyOpen: boolean;
  onToggleHistory: () => void;
}) {
  // Show the conversation title only when the user is actually inside a
  // conversation — for a fresh "Nouvelle conversation" (no messages yet) the
  // title is generic and would just be visual noise.
  const showTitle = hasMessages;
  return (
    <header
      className="agent-topbar"
      style={{
        /* 64px keeps the memory button + history toggle visually centered at
         * y=32 from the page top, aligning with the left hamburger's center
         * (top:0.75rem + 40/2 = 32) and the right sidebar's collapse toggle. */
        minHeight: 64,
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: "clamp(0.5rem, 1.5vw, 0.75rem)",
        padding: "0.5rem clamp(0.85rem, 2.5vw, 1.5rem)",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        zIndex: 30,
      }}
    >
      <div
        className="agent-topbar-title"
        aria-live="polite"
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          gap: "0.45rem",
          opacity: showTitle ? 1 : 0,
          transition: "opacity 0.18s ease",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: loading ? "var(--accent)" : "var(--text-4)",
            boxShadow: loading ? "0 0 0 4px var(--accent-tint-2)" : "none",
            transition: "background 0.2s, box-shadow 0.2s",
            flexShrink: 0,
            animation: loading ? "agent-pulse 1.4s ease-in-out infinite" : "none",
          }}
        />
        <span
          title={title}
          style={{
            fontSize: "clamp(0.82rem, 2vw, 0.92rem)",
            fontWeight: 600,
            color: "var(--text)",
            letterSpacing: "-0.01em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            minWidth: 0,
          }}
        >
          {title}
        </span>
      </div>

      <div
        className="agent-topbar-actions"
        style={{ display: "flex", alignItems: "center", gap: "0.45rem", flexShrink: 0 }}
      >
        <MemoryButton
          count={memoryCount}
          open={memoryDrawerOpen}
          onToggle={onToggleMemoryDrawer}
        />
        <button
          type="button"
          onClick={onToggleHistory}
          aria-label={historyOpen ? "Fermer l'historique" : "Ouvrir l'historique"}
          aria-expanded={historyOpen}
          className="agent-icon-btn agent-topbar-history-toggle"
          style={{
            /* 40×40 + surface chrome mirrors the left hamburger so the mobile
             * topbar reads as a balanced pair when the drawer is closed. */
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            boxShadow: "var(--tier-1)",
            color: "var(--text)",
            cursor: "pointer",
            flexShrink: 0,
            transition: "background 0.15s, border-color 0.15s, color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--surface-2)";
            e.currentTarget.style.borderColor = "var(--border-strong)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--surface)";
            e.currentTarget.style.borderColor = "var(--border)";
          }}
        >
          {historyOpen ? (
            <PanelRightClose size={18} strokeWidth={2.25} aria-hidden="true" />
          ) : (
            <PanelRightOpen size={18} strokeWidth={2.25} aria-hidden="true" />
          )}
        </button>
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
        /* height:40 + topbar minHeight:64 + alignItems:center anchors the
         * memory pill's center at y=32, identical to the hamburger and the
         * right sidebar's collapse toggle — clean visual symmetry across
         * the page top. */
        height: 40,
        display: "inline-flex",
        alignItems: "center",
        gap: "0.45rem",
        padding: "0 0.85rem 0 0.7rem",
        background: open ? T.accentTint2 : T.surface,
        color: open ? T.accent : T.text2,
        border: "1px solid",
        borderColor: open ? T.accentTint : "var(--border)",
        borderRadius: 100,
        fontFamily: "inherit",
        fontSize: "0.78rem",
        fontWeight: 600,
        letterSpacing: "-0.005em",
        cursor: "pointer",
        boxShadow: T.tier1,
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
      <Brain size={15} strokeWidth={2.25} aria-hidden="true" />
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
  collapsed,
  onToggle,
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
  /** Desktop slim-rail mode. Ignored on mobile (always full drawer width). */
  collapsed: boolean;
  /** Unified toggle: flips drawer on mobile, flips collapsed on desktop. */
  onToggle: () => void;
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
      aria-label="Historique des conversations"
      aria-hidden={!open}
      data-open={open ? "true" : "false"}
      data-collapsed={collapsed ? "true" : "false"}
      style={{
        /* Three width states:
         *   - Mobile drawer: full width via CSS var (slides via transform).
         *   - Desktop collapsed: 56px slim icon rail.
         *   - Desktop expanded: full panel via CSS var.
         * The @media (max-width: 720px) rule forces the var width regardless
         * of `collapsed`, so the mobile drawer always opens to full size. */
        width: collapsed ? 56 : "var(--agent-sidebar-w, 288px)",
        background: "var(--surface-2)",
        borderLeft: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        flexShrink: 0,
        transition:
          "width 0.26s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.26s ease",
      }}
    >
      {/* ─── Slim icon rail (desktop collapsed) — visible only via CSS rule
       *     below at >720px when data-collapsed="true". On mobile the rail
       *     is hidden and the full drawer always renders. */}
      <SidebarSlimRail
        onExpand={onToggle}
        onNew={onNew}
        conversationCount={conversations.length}
      />

      {/* ─── Full content (desktop expanded + mobile drawer) ─── */}
      <div
        className="agent-sidebar-content"
        style={{
          width: "var(--agent-sidebar-w, 288px)",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
            {/* ─── Header row with collapse chevron (desktop only) ───
             *     padding-top 0.75rem mirrors the left hamburger's top:0.75rem
             *     fixed offset; combined with the 40×40 button, the toggle's
             *     center lands at y=32, identical to the hamburger. */}
            <div
              className="agent-sidebar-header"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 0.5rem 0",
              }}
            >
              <button
                type="button"
                onClick={onToggle}
                aria-label="Replier le panneau"
                title="Replier le panneau"
                style={{
                  width: 40,
                  height: 40,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  boxShadow: "var(--tier-1)",
                  color: "var(--text)",
                  cursor: "pointer",
                  flexShrink: 0,
                  transition: "background 0.15s, color 0.15s, border-color 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--surface-2)";
                  e.currentTarget.style.borderColor = "var(--border-strong)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--surface)";
                  e.currentTarget.style.borderColor = "var(--border)";
                }}
              >
                <PanelRightClose size={18} strokeWidth={2.25} aria-hidden="true" />
              </button>
              <span
                style={{
                  fontFamily: "var(--font-mono), ui-monospace, monospace",
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--text-4)",
                  flex: 1,
                  textAlign: "right",
                  paddingRight: "0.25rem",
                }}
              >
                Espace
              </span>
            </div>

            {/* ─── Solid-accent banner CTA (mirrors dashboard action banner) ───
             * Horizontal padding 0.5rem matches the conv list's container so
             * the CTA, search field, and chat rows share a single left edge. */}
            <div style={{ padding: "0.5rem 0.5rem 0.55rem" }}>
              <button
                onClick={() => {
                  onNew();
                  if (typeof window !== "undefined" &&
                      window.matchMedia("(max-width: 720px)").matches) {
                    onCloseMobile();
                  }
                }}
                className="agent-conv-cta"
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.4rem",
                  padding: "0.55rem 0.8rem",
                  background: "var(--accent)",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 10,
                  fontFamily: "inherit",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  letterSpacing: "-0.005em",
                  cursor: "pointer",
                  boxShadow: "0 10px 24px -12px rgba(0,122,255,0.55)",
                  transition: "transform 0.22s ease, box-shadow 0.22s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 14px 30px -12px rgba(0,122,255,0.65)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 10px 24px -12px rgba(0,122,255,0.55)";
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem" }}>
                  <span aria-hidden="true" style={{
                    width: 20, height: 20, borderRadius: 6,
                    background: "rgba(255,255,255,0.18)",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Plus size={12} strokeWidth={2.5} />
                  </span>
                  Nouvelle conversation
                </span>
                <ChevronRight size={12} strokeWidth={2.25} style={{ opacity: 0.7 }} />
              </button>
            </div>

            {/* ─── Search card (tier-1 elevation, accent-tint focus ring) ─── */}
            <div style={{ padding: "0.1rem 0.5rem 0.65rem" }}>
              <div
                className="agent-conv-search"
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  background: "var(--surface)",
                  borderRadius: 10,
                  boxShadow: "var(--tier-1)",
                  transition: "box-shadow 0.18s ease",
                }}
              >
                <Search
                  size={12}
                  strokeWidth={2.25}
                  color="var(--text-4)"
                  style={{ position: "absolute", left: 10, pointerEvents: "none" }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher…"
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.6rem 0.5rem 1.95rem",
                    background: "transparent",
                    border: "none",
                    borderRadius: 10,
                    fontFamily: "inherit",
                    fontSize: "0.8rem",
                    color: "var(--text)",
                    outline: "none",
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
                      color: "var(--text-3)",
                      cursor: "pointer",
                      borderRadius: 6,
                    }}
                  >
                    <X size={11} strokeWidth={2.25} />
                  </button>
                )}
              </div>
            </div>

            {/* ─── Mono eyebrow (matches dashboard section labels) ───
             * Horizontal padding aligns the label to the same left edge as
             * the CTA, search field, and conv rows. */}
            <div
              style={{
                fontFamily: "var(--font-mono), ui-monospace, monospace",
                fontSize: "clamp(0.6rem, 1.7vw, 0.66rem)",
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--text-4)",
                padding: "0.3rem 0.7rem 0.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.45rem",
              }}
            >
              <span>Conversations</span>
              {searchQuery ? (
                <span style={{
                  color: "var(--accent)",
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                  fontVariantNumeric: "tabular-nums",
                }}>
                  · {filteredConvs.length}/{conversations.length}
                </span>
              ) : (
                <span style={{
                  color: "var(--text-3)",
                  fontWeight: 600,
                  fontVariantNumeric: "tabular-nums",
                }}>
                  · {conversations.length}
                </span>
              )}
            </div>

            {/* ─── Flat conversation list (sober, no per-row shadow) ───
             * minHeight:0 lets this flex child shrink below its content
             * height so overflowY:auto actually kicks in; without it the
             * list pushes the memory section + footer past the aside's
             * overflow:hidden boundary and clips them.
             * overscrollBehavior:contain stops the wheel/touch scroll from
             * propagating into the chat area behind when the user hits
             * top/bottom inside the sidebar. */}
            <div className="agent-scroll agent-conv-list" style={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              overscrollBehavior: "contain",
              padding: "0 0.5rem 0.5rem",
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}>
              {filteredConvs.length === 0 ? (
                <div
                  style={{
                    padding: "0.85rem 0.9rem",
                    fontSize: "0.78rem",
                    color: "var(--text-4)",
                    textAlign: "center",
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
                        if (window.matchMedia("(max-width: 720px)").matches) {
                          onCloseMobile();
                        }
                      }}
                      onDelete={() => onDelete(c.id)}
                    />
                  );
                })
              )}

            </div>

            {/* ─── Usage + sync footer (replaces tools/dataset/model strip) ─── */}
            <UsageFooter datasetLabel={datasetLabel} />
      </div>
    </aside>
  );
}

/* Slim icon rail shown when the right sidebar is collapsed on desktop.
 * Visibility is governed by .agent-sidebar[data-collapsed="true"] CSS at
 * >720px. On mobile the rail is hidden and the full drawer always renders. */
function SidebarSlimRail({
  onExpand,
  onNew,
  conversationCount,
}: {
  onExpand: () => void;
  onNew: () => void;
  conversationCount: number;
}) {
  return (
    <div
      className="agent-sidebar-rail"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: 56,
        height: "100%",
        /* padding-top 0.75rem mirrors the left hamburger's top:0.75rem; the
         * 40×40 expand toggle below then centers at y=32, identical to the
         * hamburger and to the in-header collapse button. */
        padding: "0.75rem 0",
        gap: "0.45rem",
      }}
    >
      <SlimRailButton
        Icon={PanelRightOpen}
        label="Déployer le panneau"
        onClick={onExpand}
        variant="panel"
        iconSize={18}
      />
      <SlimRailDivider />
      <SlimRailButton
        Icon={Plus}
        label="Nouvelle conversation"
        onClick={onNew}
        variant="accent"
      />
      <div style={{ height: "0.3rem" }} />
      <SlimRailButton
        Icon={MessageSquare}
        label={`Discussions · ${conversationCount}`}
        onClick={onExpand}
        badge={conversationCount}
      />
    </div>
  );
}

function SlimRailDivider() {
  return (
    <span
      aria-hidden="true"
      style={{
        width: 28,
        height: 1,
        background: "var(--border)",
        margin: "0.15rem 0",
      }}
    />
  );
}

function SlimRailButton({
  Icon,
  label,
  onClick,
  badge,
  variant,
  iconSize = 15,
}: {
  Icon: LucideIcon | ComponentType<{ size?: number; strokeWidth?: number }>;
  label: string;
  onClick: () => void;
  badge?: number;
  /** "panel" matches the left hamburger's 40×40 chrome (surface bg +
   *  border + radius 10 + tier-1 shadow); reserved for the expand-toggle
   *  to anchor visual symmetry with the left sidebar. */
  variant?: "default" | "accent" | "panel";
  /** Override the default 15px glyph — used by the expand-toggle so it
   *  visually matches the left sidebar's 17px chevron. */
  iconSize?: number;
}) {
  const isAccent = variant === "accent";
  const isPanel = variant === "panel";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      style={{
        position: "relative",
        width: isPanel ? 40 : 36,
        height: isPanel ? 40 : 36,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: isAccent
          ? "var(--accent)"
          : isPanel
          ? "var(--surface)"
          : "transparent",
        border: "1px solid",
        borderColor: isAccent
          ? "var(--accent-2)"
          : isPanel
          ? "var(--border)"
          : "transparent",
        borderRadius: isPanel ? 10 : 9,
        color: isAccent
          ? "#FFFFFF"
          : isPanel
          ? "var(--text)"
          : "var(--text-3)",
        cursor: "pointer",
        flexShrink: 0,
        boxShadow: isAccent
          ? "0 4px 12px -4px rgba(0,122,255,0.45)"
          : isPanel
          ? "var(--tier-1)"
          : "none",
        transition:
          "background 0.15s, color 0.15s, border-color 0.15s, transform 0.12s",
      }}
      onMouseEnter={(e) => {
        if (isAccent) return;
        if (isPanel) {
          e.currentTarget.style.background = "var(--surface-2)";
          e.currentTarget.style.borderColor = "var(--border-strong)";
          return;
        }
        e.currentTarget.style.background = "var(--surface)";
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.color = "var(--text)";
      }}
      onMouseLeave={(e) => {
        if (isAccent) return;
        if (isPanel) {
          e.currentTarget.style.background = "var(--surface)";
          e.currentTarget.style.borderColor = "var(--border)";
          return;
        }
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.borderColor = "transparent";
        e.currentTarget.style.color = "var(--text-3)";
      }}
    >
      <Icon size={iconSize} strokeWidth={2.25} />
      {badge !== undefined && badge > 0 && !isAccent && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            top: -3,
            right: -3,
            minWidth: 14,
            height: 14,
            padding: "0 3px",
            background: "var(--accent)",
            color: "#FFFFFF",
            border: "2px solid var(--surface-2)",
            borderRadius: 999,
            fontSize: "0.55rem",
            fontWeight: 700,
            fontFamily: "var(--font-mono), ui-monospace, monospace",
            fontVariantNumeric: "tabular-nums",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
          }}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </button>
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
  /* Sober, flat row — no per-row card, no shadow, no accent rail. Hover and
   * active states use only a soft fill (--surface-3 on hover, --surface on
   * active) so the rail feels editorial rather than tile-heavy. The icon
   * stays small and inline, no chip background. */
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`agent-conv-row${active ? " is-active" : ""}`}
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: "auto minmax(0, 1fr) auto",
        alignItems: "center",
        gap: "0.55rem",
        padding: "0.45rem 0.55rem",
        background:
          active ? "var(--surface)" : hover ? "var(--surface-3)" : "transparent",
        borderRadius: 8,
        cursor: "pointer",
        transition: "background 0.15s ease, color 0.15s ease",
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
        color={active ? "var(--accent)" : "var(--text-3)"}
        style={{ flexShrink: 0 }}
        aria-hidden="true"
      />
      <span
        style={{
          fontSize: "0.82rem",
          color: active ? "var(--text)" : "var(--text-2)",
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
      {/* Reserved-slot pattern: timestamp + trash sit in the same 22-tall
       * area; hover crossfades them so the row never reflows vertically. */}
      <span
        style={{
          position: "relative",
          width: 32,
          height: 22,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "flex-end",
          flexShrink: 0,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            fontSize: "0.66rem",
            fontFamily: "var(--font-mono), ui-monospace, monospace",
            color: "var(--text-4)",
            whiteSpace: "nowrap",
            fontVariantNumeric: "tabular-nums",
            opacity: hover ? 0 : active ? 0.9 : 0.7,
            transition: "opacity 0.15s ease",
            pointerEvents: "none",
          }}
        >
          {relTime(lastTs)}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label="Supprimer la conversation"
          tabIndex={hover ? 0 : -1}
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: 22,
            height: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            border: "none",
            color: "var(--text-4)",
            cursor: "pointer",
            borderRadius: 5,
            opacity: hover ? 1 : 0,
            pointerEvents: hover ? "auto" : "none",
            transition: "opacity 0.15s ease, background 0.12s, color 0.12s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--surface)";
            e.currentTarget.style.color = "var(--danger)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--text-4)";
          }}
        >
          <Trash2 size={11} strokeWidth={2} aria-hidden="true" />
        </button>
      </span>
    </div>
  );
}

/* Usage + sync footer — replaces the old tools/dataset/model strip. Surfaces
 * what's actually operational for the client: monthly question quota with a
 * mini progress bar + last sync of the underlying data sources. Mock counts
 * for now; swap to real quota state when the backend exposes it. */
function UsageFooter({ datasetLabel }: { datasetLabel: string | null }) {
  const used = 47;
  const cap = 500;
  const pct = Math.min(100, (used / cap) * 100);
  /* Read sync intervals from the dataset label when present, otherwise show
   * a sensible default that matches the dashboard's source pills. */
  return (
    <div
      style={{
        padding: "0.75rem 0.85rem calc(0.9rem + env(safe-area-inset-bottom, 0px))",
        display: "flex",
        flexDirection: "column",
        gap: "0.55rem",
        borderTop: "1px solid var(--border)",
      }}
    >
      {/* Quota card */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.4rem",
        padding: "0.6rem 0.7rem 0.65rem",
        background: "var(--surface)",
        borderRadius: 9,
        boxShadow: "var(--tier-1)",
      }}>
        <div style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: "0.5rem",
        }}>
          <span style={{
            fontFamily: "var(--font-mono), ui-monospace, monospace",
            fontSize: "0.58rem",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--text-4)",
          }}>Questions ce mois</span>
          <span style={{
            fontFamily: "var(--font-mono), ui-monospace, monospace",
            fontSize: "0.74rem",
            fontWeight: 600,
            color: "var(--text-2)",
            fontVariantNumeric: "tabular-nums",
          }}>
            <span style={{ color: "var(--accent)" }}>{used}</span>
            <span style={{ color: "var(--text-4)" }}> / {cap}</span>
          </span>
        </div>
        <div aria-hidden="true" style={{
          position: "relative",
          height: 4,
          background: "var(--surface-3)",
          borderRadius: 999,
          overflow: "hidden",
        }}>
          <span style={{
            position: "absolute",
            inset: "0 auto 0 0",
            width: `${pct}%`,
            background: "var(--accent)",
            borderRadius: 999,
            transition: "width 0.4s ease",
          }} />
        </div>
      </div>

      {/* Sync status card */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.5rem 0.7rem",
        background: "var(--surface)",
        borderRadius: 9,
        boxShadow: "var(--tier-1)",
        minWidth: 0,
      }}>
        <span aria-hidden="true" style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "var(--success)",
          boxShadow: "0 0 0 3px var(--success-tint)",
          flexShrink: 0,
        }} />
        <div style={{
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          lineHeight: 1.2,
        }}>
          <span style={{
            fontFamily: "var(--font-mono), ui-monospace, monospace",
            fontSize: "0.58rem",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--text-4)",
          }}>Données à jour</span>
          <span style={{
            fontSize: "0.7rem",
            color: "var(--text-2)",
            fontWeight: 500,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            BrokerStar · 3 min · Odoo · 5 min
          </span>
        </div>
      </div>

      {datasetLabel && (
        <div style={{
          fontSize: "0.62rem",
          color: "var(--text-4)",
          fontFamily: "var(--font-mono), ui-monospace, monospace",
          fontVariantNumeric: "tabular-nums",
          textAlign: "center",
          opacity: 0.8,
        }}>
          {datasetLabel}
        </div>
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
  /* Compact landing — every element scales down enough that on a typical
   * 720–1080px viewport the user sees the eyebrow, heading, paragraph, all
   * three suggestion cards AND the composer below without scrolling. */
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="agent-welcome"
      style={{ paddingTop: "clamp(0.25rem, 1.5vh, 0.85rem)" }}
    >
      {/* ─── Mono eyebrow (dashboard section-label style) ─── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.55rem",
          fontFamily: "var(--font-mono), ui-monospace, monospace",
          fontSize: "clamp(0.58rem, 1.5vw, 0.64rem)",
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--accent)",
          marginBottom: "0.55rem",
        }}
      >
        <span aria-hidden="true" style={{
          width: 16, height: 1,
          background: "var(--accent)",
          opacity: 0.45,
        }} />
        <Sparkles size={11} strokeWidth={2.5} aria-hidden="true" />
        <span>Agent · Helvebroker</span>
      </div>

      {/* ─── Editorial display heading + paragraph (compacted) ─── */}
      <h1
        style={{
          fontSize: "clamp(1.35rem, 3.4vw, 1.85rem)",
          fontWeight: 700,
          letterSpacing: "-0.025em",
          lineHeight: 1.12,
          color: "var(--text)",
          margin: "0 0 0.45rem",
          maxWidth: "24ch",
        }}
      >
        Que voulez-vous savoir sur le cabinet&nbsp;?
      </h1>
      <p
        style={{
          fontSize: "clamp(0.84rem, 1.8vw, 0.92rem)",
          color: "var(--text-3)",
          lineHeight: 1.5,
          margin: "0 0 clamp(0.95rem, 2.2vw, 1.35rem)",
          maxWidth: "60ch",
        }}
      >
        L&apos;agent connaît les <strong style={{ color: "var(--text-2)" }}>50 clients</strong>,{" "}
        <strong style={{ color: "var(--text-2)" }}>189 contrats</strong> et{" "}
        <strong style={{ color: "var(--text-2)" }}>2 518 primes</strong>.
        Chiffres exacts, jamais d&apos;invention.
      </p>

      {/* ─── Tight section bar (no border, no helper line below) ─── */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: "0.6rem",
          marginBottom: "0.55rem",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono), ui-monospace, monospace",
            fontSize: "clamp(0.58rem, 1.5vw, 0.64rem)",
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--text-3)",
          }}
        >
          Pour démarrer
        </div>
        <div
          className="agent-welcome-helper"
          style={{
            fontSize: "0.68rem",
            color: "var(--text-4)",
          }}
        >
          Cliquez une suggestion · ou tapez
        </div>
      </div>

      <div
        className="agent-welcome-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "clamp(0.5rem, 1.3vw, 0.7rem)",
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
        gap: "0.4rem",
        padding: "clamp(0.65rem, 1.8vw, 0.85rem) clamp(0.7rem, 1.9vw, 0.95rem) clamp(0.6rem, 1.6vw, 0.8rem)",
        background: "var(--surface)",
        border: "none",
        borderRadius: 12,
        textAlign: "left",
        fontFamily: "inherit",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        boxShadow: "var(--tier-1)",
        transition: "transform 0.22s ease, box-shadow 0.25s ease",
        color: "inherit",
        position: "relative",
        overflow: "hidden",
        minHeight: 92,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow =
          "var(--tier-2), 0 0 0 4px var(--accent-tint)";
        const icon = e.currentTarget.querySelector(
          "[data-suggest-icon]",
        ) as HTMLElement | null;
        if (icon) icon.style.transform = "rotate(4deg) scale(1.08)";
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "var(--tier-1)";
        const icon = e.currentTarget.querySelector(
          "[data-suggest-icon]",
        ) as HTMLElement | null;
        if (icon) icon.style.transform = "rotate(0) scale(1)";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
        <span
          data-suggest-icon
          style={{
            width: 26,
            height: 26,
            background: "var(--accent-tint-2)",
            color: "var(--accent)",
            borderRadius: 7,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
            transition: "transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          <s.Icon size={13} strokeWidth={2.25} />
        </span>
        <ChevronRight size={12} strokeWidth={2.25} color="var(--text-4)" aria-hidden="true" />
      </div>
      <div
        style={{
          fontSize: "clamp(0.8rem, 1.8vw, 0.88rem)",
          fontWeight: 600,
          color: "var(--text)",
          letterSpacing: "-0.01em",
          lineHeight: 1.25,
        }}
      >
        {s.title}
      </div>
      <div style={{
        fontSize: "clamp(0.68rem, 1.6vw, 0.74rem)",
        color: "var(--text-3)",
        lineHeight: 1.4,
      }}>{s.hint}</div>
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
  onEdit?: (newText: string) => void;
}) {
  const isUser = message.role === "user";
  if (isUser) return <UserMessage message={message} onEdit={onEdit} />;
  return <AssistantMessage message={message} onMemorise={onMemorise} />;
}

/* User message bubble — solid accent chip that shrink-wraps to its content
 * (chip sizing matches Claude's behaviour). Editing is inline: clicking the
 * Modifier button morphs the chip into an in-place textarea with Save /
 * Cancel actions, no jump to the bottom composer. */
function UserMessage({
  message,
  onEdit,
}: {
  message: Message;
  onEdit?: (newText: string) => void;
}) {
  const [hover, setHover] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);
  const editorRef = useRef<HTMLTextAreaElement | null>(null);

  /* Mobile + tablet + any touch-only device: keep the "Modifier" chip
   * permanently visible/interactive. The desktop hover-reveal is fragile on
   * iPad and hybrid laptops where `(hover: none)` doesn't match but `hover`
   * mouse events still never fire — the !important CSS fallback below was
   * not enough on its own. */
  const [alwaysShowEdit, setAlwaysShowEdit] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 1024px), (hover: none)");
    const sync = () => setAlwaysShowEdit(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  /* Focus + autosize on entering edit mode. */
  useEffect(() => {
    if (!editing) return;
    const ta = editorRef.current;
    if (!ta) return;
    ta.focus();
    ta.setSelectionRange(ta.value.length, ta.value.length);
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 320) + "px";
  }, [editing]);

  const canEdit = !!onEdit;
  const trimmedDraft = draft.trim();
  const canSave =
    editing &&
    trimmedDraft.length > 0 &&
    trimmedDraft !== message.content.trim();

  const startEdit = () => {
    setDraft(message.content);
    setEditing(true);
  };
  const cancelEdit = () => {
    setDraft(message.content);
    setEditing(false);
  };
  const saveEdit = () => {
    if (!canSave) return;
    onEdit?.(trimmedDraft);
    setEditing(false);
  };

  const bubbleShadow =
    "inset 0 1px 0 rgba(255,255,255,0.20), 0 0 0 1px rgba(0,98,204,0.25), 0 8px 20px -10px rgba(0,122,255,0.40)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      style={{ display: "flex", justifyContent: "flex-end" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* alignItems: flex-end on the column lets each child (eyebrow row,
       * bubble) hug the right edge while still living in a stable-width
       * track. The track itself never resizes — only the inner chip/editor
       * crossfade — so the view↔edit transition stays flicker-free. */}
      <div
        data-user-bubble
        style={{
          maxWidth: "78%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          minWidth: 0,
          /* Always the editor's target width so the chip mode doesn't
           * collapse the wrapper. The chip uses fit-content + alignSelf
           * = flex-end to stay right-anchored within this wider track. */
          width: "min(640px, 100%)",
        }}
      >
        {/* Eyebrow with Modifier button. Always rendered with a reserved
         * height; we only toggle visibility/opacity in edit mode so the
         * column height stays constant and the chip↔editor crossfade has
         * no vertical reflow to fight. */}
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
            minHeight: 22,
            opacity: editing ? 0 : 1,
            visibility: editing ? "hidden" : "visible",
            transition: "opacity 0.18s ease",
          }}
        >
          {canEdit && !editing && (
            <motion.button
              className="agent-edit-trigger"
              onClick={startEdit}
              aria-label="Modifier et renvoyer"
              title="Modifier et renvoyer"
              /* Always tab-reachable on touch — the @media (hover:none) CSS
               * rule overrides the desktop opacity:0 default to make the
               * chip visible there too. */
              tabIndex={0}
              whileTap={{ scale: 0.94 }}
              transition={{ duration: 0.1 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
                padding: "0.3rem 0.55rem",
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: 7,
                color: T.text3,
                fontFamily: "inherit",
                fontSize: "0.72rem",
                fontWeight: 600,
                cursor: "pointer",
                textTransform: "none",
                letterSpacing: 0,
                /* Min hit area satisfies WCAG/Apple HIG touch target spec on
                 * mobile where the chip is always visible via the
                 * @media (hover:none) override. */
                minHeight: 32,
                opacity: hover || alwaysShowEdit ? 1 : 0,
                pointerEvents: hover || alwaysShowEdit ? "auto" : "none",
                transition: "opacity 0.18s ease, background 0.12s, color 0.12s, border-color 0.12s",
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
              <Pencil size={11} strokeWidth={2.25} />
              Modifier
            </motion.button>
          )}
          <span>Vous</span>
        </div>

        {/* In-place crossfade between view (chip) and edit (nested card).
         *   mode="popLayout" — the exiting element is taken out of flow
         *   so the entering element can mount in the same spot without
         *   waiting. No `layout` prop on the children: we don't want
         *   framer-motion to interpolate the exiting editor's rect toward
         *   the smaller chip — that's what was producing the downward
         *   slide-and-fade. Each element just fades in/out in place. */}
        <AnimatePresence mode="popLayout" initial={false}>
          {!editing && (
            <motion.div
              key="view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background: "var(--accent)",
                color: "#FFFFFF",
                padding: "0.8rem 1.05rem",
                borderRadius: "14px 14px 4px 14px",
                fontSize: "0.92rem",
                lineHeight: 1.55,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                letterSpacing: "-0.005em",
                boxShadow: bubbleShadow,
                width: "fit-content",
                maxWidth: "100%",
                /* Right-anchor: the chip sits on the right edge of its column,
                 * so morphing from/to its position should pivot there. */
                transformOrigin: "top right",
              }}
            >
              {message.content}
            </motion.div>
          )}

          {/* Edit mode — nested two-layer card to match Claude's pattern:
           *   outer  = warm gray container (var(--surface-2)) with soft shadow
           *   inner  = white textarea with a thin accent border (active input)
           *   footer = sits on the warm container surface, no divider line
           * Accent blue is scoped to the inner border + Enregistrer CTA only. */}
          {editing && (
            <motion.div
              key="edit"
              className="agent-edit-card"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background: "var(--surface-2)",
                color: "var(--text)",
                padding: "0.6rem 0.6rem 0.65rem",
                borderRadius: 16,
                border: "1px solid var(--border-strong)",
                boxShadow:
                  "0 1px 2px rgba(0,0,0,0.03), 0 8px 24px -10px rgba(0,0,0,0.08), 0 20px 48px -24px rgba(0,0,0,0.10)",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: "0.55rem",
                transformOrigin: "top right",
              }}
            >
            {/* Inner white textarea card — thin blue border signals "active". */}
            <div
              className="agent-edit-input-wrap"
              style={{
                background: "var(--surface)",
                borderRadius: 12,
                border: "1px solid var(--accent)",
                padding: "0.85rem 1rem",
              }}
            >
              <textarea
                ref={editorRef}
                className="agent-edit-textarea"
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  const ta = e.currentTarget;
                  ta.style.height = "auto";
                  ta.style.height = Math.min(ta.scrollHeight, 320) + "px";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.preventDefault();
                    cancelEdit();
                  } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    saveEdit();
                  }
                }}
                aria-label="Modifier votre message"
                style={{
                  width: "100%",
                  resize: "none",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "var(--text)",
                  fontFamily: "inherit",
                  fontSize: "0.98rem",
                  fontWeight: 500,
                  lineHeight: 1.55,
                  letterSpacing: "-0.005em",
                  padding: 0,
                  minHeight: 28,
                  maxHeight: 320,
                  scrollbarWidth: "none",
                  caretColor: "var(--accent)",
                  display: "block",
                }}
              />
            </div>

            {/* Footer sits on the warm container surface — no divider line. */}
            <div
              className="agent-edit-footer"
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.05rem 0.25rem 0.05rem 0.4rem",
              }}
            >
              <span
                className="agent-edit-hint"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontSize: "0.7rem",
                  color: "var(--text-3)",
                  marginRight: "auto",
                  letterSpacing: 0,
                  textTransform: "none",
                  fontWeight: 400,
                  lineHeight: 1.4,
                }}
              >
                <CircleAlert
                  size={12}
                  strokeWidth={2}
                  color="var(--text-4)"
                  aria-hidden="true"
                  style={{ flexShrink: 0 }}
                />
                <span>
                  Échap pour annuler · ⌘/Ctrl + ↵ pour renvoyer
                </span>
              </span>
              <motion.button
                type="button"
                onClick={cancelEdit}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.12 }}
                style={{
                  padding: "0.45rem 0.95rem",
                  background: "var(--surface)",
                  border: "1px solid var(--border-strong)",
                  borderRadius: 8,
                  color: "var(--text-2)",
                  fontFamily: "inherit",
                  fontSize: "0.78rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "background 0.15s ease, color 0.15s ease, border-color 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--surface-2)";
                  e.currentTarget.style.color = "var(--text)";
                  e.currentTarget.style.borderColor = "var(--text-4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--surface)";
                  e.currentTarget.style.color = "var(--text-2)";
                  e.currentTarget.style.borderColor = "var(--border-strong)";
                }}
              >
                Annuler
              </motion.button>
              <motion.button
                type="button"
                onClick={saveEdit}
                disabled={!canSave}
                whileTap={canSave ? { scale: 0.96 } : undefined}
                transition={{ duration: 0.12 }}
                style={{
                  padding: "0.45rem 1rem",
                  background: canSave ? "var(--accent)" : "var(--surface-3)",
                  border: "1px solid",
                  borderColor: canSave ? "var(--accent-2)" : "var(--border-strong)",
                  borderRadius: 8,
                  color: canSave ? "#FFFFFF" : "var(--text-4)",
                  fontFamily: "inherit",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  cursor: canSave ? "pointer" : "not-allowed",
                  letterSpacing: "-0.005em",
                  boxShadow: canSave
                    ? "0 1px 2px rgba(0,98,204,0.18), 0 4px 12px -4px rgba(0,122,255,0.35)"
                    : "none",
                  transition: "background 0.15s ease, box-shadow 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (!canSave) return;
                  e.currentTarget.style.boxShadow =
                    "0 1px 2px rgba(0,98,204,0.18), 0 8px 18px -6px rgba(0,122,255,0.45)";
                }}
                onMouseLeave={(e) => {
                  if (!canSave) return;
                  e.currentTarget.style.boxShadow =
                    "0 1px 2px rgba(0,98,204,0.18), 0 4px 12px -4px rgba(0,122,255,0.35)";
                }}
              >
                Enregistrer
              </motion.button>
            </div>
          </motion.div>
          )}
        </AnimatePresence>
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
          gap: "0.45rem",
          fontFamily: "var(--font-mono), ui-monospace, monospace",
          fontSize: "clamp(0.6rem, 1.7vw, 0.66rem)",
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--accent)",
        }}
      >
        <Sparkles size={11} strokeWidth={2.5} />
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
          background: "var(--surface)",
          borderRadius: "4px 14px 14px 14px",
          padding: "clamp(0.85rem, 2.2vw, 1.1rem) clamp(0.95rem, 2.4vw, 1.2rem)",
          boxShadow: "var(--tier-1)",
          transition: "box-shadow 0.22s ease",
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
        background: "var(--bg)",
        padding:
          "clamp(0.5rem, 1.5vw, 0.9rem) clamp(0.85rem, 3vw, 2rem) calc(clamp(0.75rem, 2vw, 1rem) + env(safe-area-inset-bottom, 0px))",
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
              /* Two-row layout: textarea on top, action buttons in their own
               * row below. Replaces the previous absolute-positioned buttons
               * that visually overlapped the textarea's bottom-right corner —
               * text can now use the full width without wrapping around the
               * buttons, and the buttons sit in a clear dedicated strip. */
              display: "flex",
              flexDirection: "column",
              background: "var(--surface)",
              /* Hair-thin neutral border. The visual presence comes from the
               * soft, wide drop-shadow (frosted halo) below — not the border. */
              border: "1px solid var(--border-strong)",
              borderRadius: 12,
              transition: "box-shadow 0.2s ease, border-color 0.2s ease",
              /* Soft "frosted" shadow — wide blur radius, low opacity gives
               * the card a faint glow on the sides without darkening below
               * (matches the Claude composer treatment). */
              boxShadow:
                "0 1px 2px rgba(0,0,0,0.03), 0 8px 24px -10px rgba(0,0,0,0.08), 0 20px 48px -24px rgba(0,0,0,0.10)",
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
                fontSize: "0.98rem",
                fontWeight: 500,
                lineHeight: 1.55,
                color: T.text,
                /* Symmetric horizontal padding — no need to reserve the
                 * right side for buttons anymore (they live in their own
                 * row below). Text wraps at the natural right edge. */
                padding: "0.85rem 1.2rem 0.55rem 1.2rem",
                maxHeight: 340,
              }}
            />
            <div
              className="agent-composer-actions"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "0.4rem",
                padding: "0 0.6rem 0.55rem 0.6rem",
              }}
            >
              {voiceSupported && !loading && (
                <button
                  type="button"
                  className="agent-composer-mic"
                  onClick={recording ? stopDictation : startDictation}
                  aria-label={recording ? "Arrêter la dictée" : "Dicter une question"}
                  title={recording ? "Arrêter la dictée" : "Dicter une question"}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    border: "none",
                    background: recording ? T.danger : T.surface,
                    color: recording ? "#FFFFFF" : T.text3,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
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
                  className="agent-composer-stop"
                  onClick={onStop}
                  aria-label="Arrêter la génération"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    border: "none",
                    background: T.danger,
                    color: "#FFFFFF",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
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
                  className="agent-composer-send"
                  disabled={!value.trim()}
                  aria-label="Envoyer"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    border: "none",
                    /* Solid primary accent — the brand blue (--accent /
                     * #007AFF). Replaces the previous to-bottom gradient
                     * so the button reads as a single confident colour
                     * rather than a soft pill. */
                    background: !value.trim() ? T.surface3 : "var(--accent)",
                    color: !value.trim() ? T.text4 : "#FFFFFF",
                    cursor: !value.trim() ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "background 0.15s, transform 0.1s, box-shadow 0.18s",
                    boxShadow: !value.trim()
                      ? "none"
                      : "0 1px 2px rgba(0,98,204,0.20), 0 4px 14px -4px rgba(0,122,255,0.45)",
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
