// Shared agent conversation types used by `/chat`, the FloatingDock preview,
// and the AgentConversationProvider. Kept in its own module so neither
// surface has to depend on the other.

export type ToolCall = {
  toolName: string;
  args: unknown;
  toolCallId?: string;
};

export type ToolResult = {
  toolName: string;
  result: unknown;
  toolCallId?: string;
};

export type Message = {
  /** Stable per-message id used by `editUserMessage` to address turns
   *  without index drift. Optional only because legacy localStorage data
   *  predates the field; the provider backfills on rehydration. */
  id?: string;
  role: "user" | "assistant";
  content: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
  finishReason?: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  ts?: number;
};

export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
};

// Event types the server emits on `?stream=events` — one JSON object per
// line. Matches the schema in src/app/api/agent/route.ts.
export type AgentEvent =
  | { t: "text"; d: string }
  | { t: "tool-call"; toolCallId?: string; toolName: string; args: unknown }
  | { t: "tool-result"; toolCallId?: string; toolName: string; result: unknown }
  | { t: "step-finish"; finishReason?: string; usage?: unknown }
  | { t: "finish"; finishReason?: string; usage?: unknown }
  | { t: "error"; message: string };
