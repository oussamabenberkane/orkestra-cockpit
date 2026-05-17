// Agent runtime — provider-agnostic wrapper around the Vercel AI SDK.
//
// Today: Mistral (mistral-large-latest) via @ai-sdk/mistral.
// Previously: Gemini via @ai-sdk/google — kept commented below in case we
// switch back. Tools and prompt are reused across providers.

import { createMistral } from "@ai-sdk/mistral";
// import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText, generateText, type CoreMessage } from "ai";
import { buildSystemPrompt } from "./context/system-prompt";
import type { Memory } from "./memory/types";
import { agentTools } from "./tools";

const MODEL_ID = process.env.AGENT_MODEL ?? "mistral-large-latest";
// const MODEL_ID = process.env.AGENT_MODEL ?? "gemini-2.0-flash";

// Hard ceiling on a single agent run. The target is a true hang (a dead
// connection that never responds) — legitimate multi-step runs finish in a
// few seconds, so this is a safety net, not a tight budget. Bump it if
// complex SQL self-correction ever bumps against it.
const AGENT_TIMEOUT_MS = 45_000;

// Transient errors (provider 5xx, network blips, "service tier capacity
// exceeded" bursts) are retried by the AI SDK with exponential backoff.
// Bumped from 2 → 4 so a heavy multi-step KPI question (~5-7 Mistral calls)
// can ride out a short rate-limit window instead of failing the whole run.
const AGENT_MAX_RETRIES = 4;

// Combine the optional caller signal (the HTTP request signal) with an
// internal timeout so every LLM call is bounded even if the client never
// disconnects.
function withTimeout(signal?: AbortSignal): AbortSignal {
  const timeout = AbortSignal.timeout(AGENT_TIMEOUT_MS);
  return signal ? AbortSignal.any([signal, timeout]) : timeout;
}

// Lazily build the provider so importing this module is cheap and doesn't crash
// when the key is absent (e.g. during typecheck or unit tests).
function getModel() {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey || apiKey === "your-mistral-api-key-here") {
    throw new Error(
      "MISTRAL_API_KEY is not set. Add it to .env.local — see .env.example.",
    );
  }
  const mistral = createMistral({ apiKey });
  return mistral(MODEL_ID);

  // --- Gemini variant (kept for quick rollback) ---
  // const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  // if (!apiKey || apiKey === "your-gemini-api-key-here") {
  //   throw new Error(
  //     "GOOGLE_GENERATIVE_AI_API_KEY is not set. Add it to .env.local — see .env.example.",
  //   );
  // }
  // const google = createGoogleGenerativeAI({ apiKey });
  // return google(MODEL_ID);
}

export interface AgentRunInput {
  // Full message history sent by the client. The system prompt is injected
  // here, so callers should NOT include one themselves.
  messages: CoreMessage[];
  // Optional caller abort signal — typically the HTTP request signal, so a
  // client disconnect (or the /agent-test stop button) cancels generation.
  // Always combined with an internal timeout via `withTimeout`.
  signal?: AbortSignal;
  // Optional user-scoped memories injected at the end of the system prompt.
  // The browser is the source of truth; the route forwards what the page
  // sends. Empty/undefined ⇒ no memory section.
  memories?: Memory[];
}

// Per-step logger — one line per LLM round-trip. Tracks elapsed time so we
// can spot which step actually costs (tool call vs. final synthesis) and
// surfaces token usage when the provider reports it.
type StepEvent = {
  toolCalls?: ReadonlyArray<{ toolName?: string } | undefined> | null;
  usage?: unknown;
  finishReason?: unknown;
};

function createStepLogger() {
  let lastTs = Date.now();
  let index = 0;
  return (event: StepEvent) => {
    try {
      const now = Date.now();
      const durationMs = now - lastTs;
      lastTs = now;
      const tools = Array.isArray(event?.toolCalls)
        ? event.toolCalls
            .map((c) => c?.toolName)
            .filter((n): n is string => typeof n === "string")
        : [];
      console.info("[agent]", {
        step: index,
        durationMs,
        tools,
        usage: event?.usage ?? null,
        finishReason: event?.finishReason ?? null,
      });
      index += 1;
    } catch {
      // never crash the run on a logging glitch
    }
  };
}

// Streamed response — what the future chat UI will consume via @ai-sdk/react.
export function runAgentStream({ messages, signal, memories }: AgentRunInput) {
  return streamText({
    model: getModel(),
    system: buildSystemPrompt({ memories }),
    messages,
    tools: agentTools,
    // Multi-step: the LLM may call several tools before answering. Cap at 8
    // — typical questions need 1-3 calls, SQL self-correct rarely exceeds 2
    // retries. Bumped down from 16 to bound cost on degenerate loops.
    maxSteps: 8,
    temperature: 0.2,
    maxRetries: AGENT_MAX_RETRIES,
    abortSignal: withTimeout(signal),
    onStepFinish: createStepLogger(),
    onError: ({ error }) => {
      console.error(
        "[agent] stream error",
        error instanceof Error ? error.message : error,
      );
    },
  });
}

// One-shot non-streaming variant — handy for smoke tests and server-side use
// where you just want the final text.
export async function runAgentOnce({ messages, signal, memories }: AgentRunInput) {
  const result = await generateText({
    model: getModel(),
    system: buildSystemPrompt({ memories }),
    messages,
    tools: agentTools,
    maxSteps: 8,
    temperature: 0.2,
    maxRetries: AGENT_MAX_RETRIES,
    abortSignal: withTimeout(signal),
    onStepFinish: createStepLogger(),
  });
  return {
    text: result.text,
    toolCalls: result.toolCalls,
    toolResults: result.toolResults,
    finishReason: result.finishReason,
    usage: result.usage,
  };
}
