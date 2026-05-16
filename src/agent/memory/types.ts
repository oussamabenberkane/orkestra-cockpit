// User-scoped memory for the agent. Memories are explicit ("the user said
// 'retiens que…'" or used the explicit save action in the UI). Auto-extraction
// is deliberately out of scope for v1 — see the plan in
// .claude/plans/we-re-going-to-be-splendid-goose.md.

export type MemoryKind = "preference" | "watch" | "saved-view" | "note";

export interface Memory {
  id: string;
  kind: MemoryKind;
  name: string;
  body: string;
  /** Optional entity id this memory is about, e.g. "CLT042" for kind: "watch". */
  target?: string;
  createdAt: number;
  updatedAt: number;
}

/** What `save_memory` accepts — id/timestamps are assigned by the store. */
export interface MemoryInput {
  kind: MemoryKind;
  name: string;
  body: string;
  target?: string;
}
