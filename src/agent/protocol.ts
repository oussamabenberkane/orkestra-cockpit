// Wire protocol shared by the `/api/agent?stream=text` endpoint and the
// in-house /agent-test client.
//
// The response body is the assistant's answer streamed as plain text, then —
// once generation finishes — this sentinel followed by a single JSON object
// (`AgentMetaTrailer`) carrying tool-call metadata and token usage.
//
// The sentinel is wrapped in NUL characters (built via String.fromCharCode so
// the source file stays plain ASCII). A NUL never appears in model output or
// in JSON-escaped tool results, so the sentinel can never collide with the
// answer body — and the first NUL alone marks where the trailer begins.
//
// Kept in its own import-free module so both the server route and the client
// component can share it without the client bundling the agent runtime.

const NUL = String.fromCharCode(0);

export const AGENT_META_SENTINEL = `${NUL}__ORKESTRA_AGENT_META__${NUL}`;

export interface AgentMetaTrailer {
  toolCalls: { toolName: string; args: unknown; toolCallId?: string }[];
  toolResults: { toolName: string; result: unknown; toolCallId?: string }[];
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  finishReason?: string;
}
