// Store interface + browser-only LocalStorage impl for memories.
//
// Mirrors the `DatabaseAdapter` pattern in `src/agent/data/db.ts`: the
// agent code depends on the interface, not the engine. When auth +
// Postgres land, add a `PostgresMemoryStore` and swap the factory — every
// call site keeps working.

import type { Memory, MemoryInput } from "./types";

const STORAGE_KEY = "orkestra.agent.memories.v1";

export interface MemoryStore {
  list(): Promise<Memory[]>;
  save(input: MemoryInput): Promise<Memory>;
  update(id: string, patch: Partial<MemoryInput>): Promise<Memory>;
  remove(id: string): Promise<void>;
}

function genId(): string {
  return `mem_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Browser-only implementation backed by `window.localStorage`. Safe to import
 * server-side (guards on `typeof window`); calls become no-ops there. The
 * server route never instantiates this — only the chat page does.
 */
export class LocalStorageMemoryStore implements MemoryStore {
  private read(): Memory[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as { memories?: Memory[] };
      return Array.isArray(parsed.memories) ? parsed.memories : [];
    } catch {
      // Corrupt JSON — start fresh rather than crash. Matches the
      // existing conversation-store pattern in /agent-test.
      return [];
    }
  }

  private write(memories: Memory[]): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ memories }));
    } catch {
      // Quota exceeded / storage disabled — fail silently.
    }
  }

  async list(): Promise<Memory[]> {
    return this.read();
  }

  async save(input: MemoryInput): Promise<Memory> {
    const memories = this.read();
    const now = Date.now();
    const memory: Memory = {
      id: genId(),
      kind: input.kind,
      name: input.name.trim(),
      body: input.body.trim(),
      target: input.target?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };
    memories.push(memory);
    this.write(memories);
    return memory;
  }

  async update(id: string, patch: Partial<MemoryInput>): Promise<Memory> {
    const memories = this.read();
    const idx = memories.findIndex((m) => m.id === id);
    if (idx === -1) throw new Error(`Memory not found: ${id}`);
    const current = memories[idx];
    const updated: Memory = {
      ...current,
      kind: patch.kind ?? current.kind,
      name: patch.name?.trim() ?? current.name,
      body: patch.body?.trim() ?? current.body,
      target:
        patch.target === undefined ? current.target : patch.target.trim() || undefined,
      updatedAt: Date.now(),
    };
    memories[idx] = updated;
    this.write(memories);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const memories = this.read().filter((m) => m.id !== id);
    this.write(memories);
  }
}

let cached: MemoryStore | null = null;

/** Singleton accessor used by the chat page. */
export function getMemoryStore(): MemoryStore {
  if (!cached) cached = new LocalStorageMemoryStore();
  return cached;
}
