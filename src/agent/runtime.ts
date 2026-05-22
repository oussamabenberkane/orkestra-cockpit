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

const DEFAULT_MODEL_ID = process.env.AGENT_MODEL ?? "mistral-large-latest";
const DEFAULT_TEMPERATURE = 0.2;
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

function getModel(modelId?: string) {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey || apiKey === "your-mistral-api-key-here") {
    throw new Error(
      "MISTRAL_API_KEY is not set. Add it to .env.local — see .env.example.",
    );
  }
  const mistral = createMistral({ apiKey });
  return mistral(modelId ?? DEFAULT_MODEL_ID);

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
  messages: CoreMessage[];
  signal?: AbortSignal;
  memories?: Memory[];
  /** Override the model. Defaults to AGENT_MODEL env var → mistral-large-latest. */
  model?: string;
  /** Override the temperature (0–1). Defaults to 0.2. */
  temperature?: number;
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

export function runAgentStream({ messages, signal, memories, model, temperature }: AgentRunInput) {
  return streamText({
    model: getModel(model),
    system: buildSystemPrompt({ memories }),
    messages,
    tools: agentTools,
    maxSteps: 8,
    temperature: temperature ?? DEFAULT_TEMPERATURE,
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

export async function runAgentOnce({ messages, signal, memories, model, temperature }: AgentRunInput) {
  const result = await generateText({
    model: getModel(model),
    system: buildSystemPrompt({ memories }),
    messages,
    tools: agentTools,
    maxSteps: 8,
    temperature: temperature ?? DEFAULT_TEMPERATURE,
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
