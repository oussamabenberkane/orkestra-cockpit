// Next.js Route Handler — POST /api/agent
//
// POST body (streaming, for the eventual chat UI):
//   { "messages": [{ "role": "user", "content": "Quel est le ratio de sinistralité cyber ?" }] }
//   → text/event-stream compatible with `useChat()` from `@ai-sdk/react`.
//
// POST body with `?mode=once` (one-shot, easier to curl):
//   { "messages": [...] }
//   → JSON { text, toolCalls, toolResults, finishReason, usage }
//
// POST body with `?stream=text` (plain text/event-stream of tokens only):
//   { "messages": [...] }
//   → text/plain stream of the assistant's answer. No tool-call metadata —
//     server-side `[agent]` logs cover that. Used by the in-house
//     /agent-test page since the installed @ai-sdk/react@3 doesn't speak
//     the AI SDK v4 data-stream protocol that toDataStreamResponse emits.
//
// GET /api/agent  → health/smoke check (no LLM call).

import type { NextRequest } from "next/server";
import { runAgentStream, runAgentOnce } from "@/agent/runtime";
import { loadDataset } from "@/agent/data/loader";
import type { Memory } from "@/agent/memory/types";
import { AGENT_META_SENTINEL, type AgentMetaTrailer } from "@/agent/protocol";

export const runtime = "nodejs"; // sql.js loads its wasm via node:fs — keep off edge.

// Upper bound on the request body. A normal turn (history + memories) is a
// few KB; the cap is a generous defensive ceiling so an honest oversized
// payload returns 413 instead of pinning the process while `req.json()`
// buffers it. Only the Content-Length header is checked here — that catches
// every standard HTTP client. A chunked-encoding caller could bypass this
// (no Content-Length) and is left for the real WAF + auth that lands with
// the Postgres/Odoo migration.
const MAX_BODY_BYTES = 1 * 1024 * 1024; // 1 MB

export async function GET() {
  // Smoke check: does the dataset load from Supabase? Counts only — no
  // secrets, no LLM call.
  try {
    const ds = await loadDataset();
    return Response.json({
      ok: true,
      dataset: {
        clients: ds.clients.length,
        compagnies: ds.compagnies.length,
        contrats: ds.contrats.length,
        primes: ds.primes.length,
        prospects: ds.prospects.length,
        renouvellements: ds.renouvellements.length,
        sinistres: ds.sinistres.length,
      },
      model: process.env.AGENT_MODEL ?? "mistral-large-latest",
      has_api_key: Boolean(
        process.env.MISTRAL_API_KEY &&
          process.env.MISTRAL_API_KEY !== "your-mistral-api-key-here",
      ),
      // --- Gemini variant (kept for quick rollback) ---
      // model: process.env.AGENT_MODEL ?? "gemini-2.0-flash",
      // has_api_key: Boolean(
      //   process.env.GOOGLE_GENERATIVE_AI_API_KEY &&
      //     process.env.GOOGLE_GENERATIVE_AI_API_KEY !== "your-gemini-api-key-here",
      // ),
    });
  } catch (err) {
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const contentLength = req.headers.get("content-length");
  if (contentLength !== null && Number(contentLength) > MAX_BODY_BYTES) {
    return Response.json(
      { error: `Request body too large (max ${MAX_BODY_BYTES} bytes).` },
      { status: 413 },
    );
  }

  let body: { messages?: unknown; memories?: unknown; model?: unknown; temperature?: unknown } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return Response.json(
      { error: "Body must include a non-empty `messages` array (AI SDK CoreMessage[])." },
      { status: 400 },
    );
  }

  const memories = Array.isArray(body.memories)
    ? (body.memories as Memory[])
    : undefined;

  const model = typeof body.model === "string" && body.model ? body.model : undefined;
  const temperature =
    typeof body.temperature === "number" &&
    body.temperature >= 0 &&
    body.temperature <= 1
      ? body.temperature
      : undefined;

  const params = new URL(req.url).searchParams;
  const mode = params.get("mode");
  const stream = params.get("stream");

  try {
    if (mode === "once") {
      const result = await runAgentOnce({
        messages: body.messages as never,
        signal: req.signal,
        memories,
        model,
        temperature,
      });
      return Response.json(result);
    }
    if (stream === "events") {
      const result = runAgentStream({
        messages: body.messages as never,
        signal: req.signal,
        memories,
        model,
        temperature,
      });
      const encoder = new TextEncoder();
      const readable = new ReadableStream<Uint8Array>({
        async start(controller) {
          const emit = (obj: unknown) => {
            controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
          };
          try {
            const reader = result.fullStream.getReader();
            while (true) {
              const { value, done } = await reader.read();
              if (done) break;
              if (!value) continue;
              switch (value.type) {
                case "text-delta":
                  emit({ t: "text", d: value.textDelta });
                  break;
                case "tool-call":
                  emit({
                    t: "tool-call",
                    toolCallId: value.toolCallId,
                    toolName: value.toolName,
                    args: value.args,
                  });
                  break;
                case "tool-result":
                  emit({
                    t: "tool-result",
                    toolCallId: value.toolCallId,
                    toolName: value.toolName,
                    result: value.result,
                  });
                  break;
                case "step-finish":
                  emit({
                    t: "step-finish",
                    finishReason: value.finishReason,
                    usage: value.usage,
                  });
                  break;
                case "finish":
                  emit({
                    t: "finish",
                    finishReason: value.finishReason,
                    usage: value.usage,
                  });
                  break;
                case "error":
                  emit({
                    t: "error",
                    message:
                      value.error instanceof Error
                        ? value.error.message
                        : String(value.error),
                  });
                  break;
                // text-start / text-end / reasoning / others — ignored for v1.
              }
            }
          } catch (err) {
            console.error(
              "[agent] stream=events aborted/errored",
              err instanceof Error ? err.message : err,
            );
            try {
              emit({
                t: "error",
                message: err instanceof Error ? err.message : String(err),
              });
            } catch {
              /* ignore */
            }
          } finally {
            controller.close();
          }
        },
      });
      return new Response(readable, {
        headers: {
          "Content-Type": "application/x-ndjson; charset=utf-8",
          "Cache-Control": "no-store",
        },
      });
    }
    if (stream === "text") {
      // Plain-text token stream, then a sentinel + JSON trailer carrying
      // tool-call metadata and token usage (see src/agent/protocol.ts).
      // `result.toolCalls` is only the final step, so tool calls are
      // collected from `result.steps` across the whole multi-step run.
      const result = runAgentStream({
        messages: body.messages as never,
        signal: req.signal,
        memories,
        model,
        temperature,
      });
      const encoder = new TextEncoder();
      const readable = new ReadableStream<Uint8Array>({
        async start(controller) {
          try {
            const reader = result.textStream.getReader();
            while (true) {
              const { value, done } = await reader.read();
              if (done) break;
              if (value) controller.enqueue(encoder.encode(value));
            }
            const [steps, usage, finishReason] = await Promise.all([
              result.steps,
              result.usage,
              result.finishReason,
            ]);
            const trailer: AgentMetaTrailer = {
              toolCalls: steps.flatMap((s) =>
                s.toolCalls.map((tc) => ({
                  toolName: tc.toolName,
                  args: tc.args,
                  toolCallId: tc.toolCallId,
                })),
              ),
              toolResults: steps.flatMap((s) =>
                s.toolResults.map((tr) => ({
                  toolName: tr.toolName,
                  result: tr.result,
                  toolCallId: tr.toolCallId,
                })),
              ),
              usage,
              finishReason,
            };
            controller.enqueue(
              encoder.encode(AGENT_META_SENTINEL + JSON.stringify(trailer)),
            );
          } catch (err) {
            // Stream aborted or errored mid-flight (timeout, client
            // disconnect, provider failure). Whatever text already streamed
            // stays put; we just close without a trailer.
            console.error(
              "[agent] stream=text aborted/errored",
              err instanceof Error ? err.message : err,
            );
          } finally {
            controller.close();
          }
        },
      });
      return new Response(readable, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store",
        },
      });
    }
    // Default: streaming response, AI SDK -> useChat()-compatible.
    const result = runAgentStream({
      messages: body.messages as never,
      signal: req.signal,
      memories,
      model,
      temperature,
    });
    return result.toDataStreamResponse();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 500 });
  }
}
