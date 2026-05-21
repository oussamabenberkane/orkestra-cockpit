"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

const MEMORY_STORAGE_KEY = "orkestra.agent.memories.v1";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: true,
});

export function useAuth() {
  return useContext(AuthContext);
}

async function migrateLocalMemories(userId: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(MEMORY_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as { memories?: unknown[] };
    const items = Array.isArray(parsed.memories) ? parsed.memories : [];
    if (items.length === 0) return;

    // Check if Supabase already has rows for this user — skip if so.
    const { count } = await supabase
      .from("memories")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (count && count > 0) return;

    const rows = (items as Record<string, unknown>[]).map((m) => ({
      id: m.id as string,
      user_id: userId,
      kind: m.kind as string,
      name: m.name as string,
      body: m.body as string,
      target: (m.target as string) ?? null,
      created_at: m.createdAt as number,
      updated_at: m.updatedAt as number,
    }));

    const { error } = await supabase.from("memories").insert(rows);
    if (!error) {
      window.localStorage.removeItem(MEMORY_STORAGE_KEY);
    }
  } catch {
    // Migration failure is non-fatal — local data is not lost.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialise from the current session without waiting for the first event.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === "SIGNED_IN" && session?.user) {
          void migrateLocalMemories(session.user.id);
        }

        if (event === "SIGNED_OUT") {
          router.replace("/login");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
