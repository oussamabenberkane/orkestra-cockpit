// Store interface + browser-only LocalStorage impl for memories.
//
// Mirrors the `DatabaseAdapter` pattern in `src/agent/data/db.ts`: the
// agent code depends on the interface, not the engine. When auth +
// Postgres land, add a `PostgresMemoryStore` and swap the factory — every
// call site keeps working.

import { supabase } from "@/lib/supabase";
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

/** Supabase-backed implementation. Requires an active session. */
export class SupabaseMemoryStore implements MemoryStore {
  private async getUserId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("SupabaseMemoryStore: no active session");
    return user.id;
  }

  async list(): Promise<Memory[]> {
    const userId = await this.getUserId();
    const { data, error } = await supabase
      .from("memories")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => ({
      id: row.id as string,
      kind: row.kind as Memory["kind"],
      name: row.name as string,
      body: row.body as string,
      target: row.target as string | undefined,
      createdAt: row.created_at as number,
      updatedAt: row.updated_at as number,
    }));
  }

  async save(input: MemoryInput): Promise<Memory> {
    const userId = await this.getUserId();
    const now = Date.now();
    const row = {
      id: genId(),
      user_id: userId,
      kind: input.kind,
      name: input.name.trim(),
      body: input.body.trim(),
      target: input.target?.trim() ?? null,
      created_at: now,
      updated_at: now,
    };
    const { error } = await supabase.from("memories").insert(row);
    if (error) throw new Error(error.message);
    return {
      id: row.id,
      kind: row.kind,
      name: row.name,
      body: row.body,
      target: row.target ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async update(id: string, patch: Partial<MemoryInput>): Promise<Memory> {
    const userId = await this.getUserId();
    const { data: existing, error: fetchError } = await supabase
      .from("memories")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();
    if (fetchError || !existing) throw new Error(`Memory not found: ${id}`);

    const updated = {
      kind: patch.kind ?? existing.kind,
      name: patch.name?.trim() ?? existing.name,
      body: patch.body?.trim() ?? existing.body,
      target: patch.target === undefined ? existing.target : (patch.target.trim() || null),
      updated_at: Date.now(),
    };
    const { error } = await supabase
      .from("memories")
      .update(updated)
      .eq("id", id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return {
      id,
      kind: updated.kind,
      name: updated.name,
      body: updated.body,
      target: updated.target ?? undefined,
      createdAt: existing.created_at as number,
      updatedAt: updated.updated_at,
    };
  }

  async remove(id: string): Promise<void> {
    const userId = await this.getUserId();
    const { error } = await supabase
      .from("memories")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
  }
}

let cached: MemoryStore | null = null;
let cachedSessionId: string | null = null;

/** Singleton accessor used by the chat page. Returns SupabaseMemoryStore when
 *  a session is active, falling back to LocalStorageMemoryStore otherwise. */
export async function getMemoryStore(): Promise<MemoryStore> {
  const { data: { session } } = await supabase.auth.getSession();
  const sessionId = session?.user?.id ?? null;

  if (sessionId !== cachedSessionId) {
    // Session changed — invalidate the cache.
    cached = null;
    cachedSessionId = sessionId;
  }

  if (!cached) {
    cached = sessionId ? new SupabaseMemoryStore() : new LocalStorageMemoryStore();
  }
  return cached;
}
