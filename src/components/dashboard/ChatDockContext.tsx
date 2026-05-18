"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface ChatDockController {
  open: boolean;
  pendingSeed: string | null;
  openDock: (seed?: string) => void;
  closeDock: () => void;
  consumeSeed: () => string | null;
}

const ChatDockContext = createContext<ChatDockController | null>(null);

export function ChatDockProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [pendingSeed, setPendingSeed] = useState<string | null>(null);

  const openDock = useCallback((seed?: string) => {
    setOpen(true);
    if (seed) setPendingSeed(seed);
  }, []);

  const closeDock = useCallback(() => setOpen(false), []);

  const consumeSeed = useCallback(() => {
    const s = pendingSeed;
    setPendingSeed(null);
    return s;
  }, [pendingSeed]);

  return (
    <ChatDockContext.Provider
      value={{ open, pendingSeed, openDock, closeDock, consumeSeed }}
    >
      {children}
    </ChatDockContext.Provider>
  );
}

export function useChatDock() {
  const ctx = useContext(ChatDockContext);
  if (!ctx) throw new Error("useChatDock must be used inside <ChatDockProvider>");
  return ctx;
}
