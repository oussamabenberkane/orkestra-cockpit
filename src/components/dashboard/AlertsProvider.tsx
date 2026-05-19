"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { INITIAL_ALERTS, type AlertItem } from "@/lib/alerts-data";

interface AlertsContextValue {
  alerts: AlertItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismiss: (id: string) => void;
  updateEmailDraft: (id: string, draft: { subject: string; body: string }) => void;
  sendAlert: (id: string) => void;
  getAlert: (id: string) => AlertItem | undefined;
}

const AlertsContext = createContext<AlertsContextValue | null>(null);

export function AlertsProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);

  const unreadCount = alerts.filter((a) => !a.read).length;

  const markAsRead = (id: string) =>
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));

  const markAllAsRead = () =>
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));

  const dismiss = (id: string) =>
    setAlerts((prev) => prev.filter((a) => a.id !== id));

  const updateEmailDraft = (id: string, draft: { subject: string; body: string }) =>
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, email: { ...a.email, ...draft } } : a))
    );

  const sendAlert = (id: string) =>
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, read: true, emailSent: true, sentAt: "À l'instant" } : a
      )
    );

  const getAlert = (id: string) => alerts.find((a) => a.id === id);

  return (
    <AlertsContext.Provider
      value={{ alerts, unreadCount, markAsRead, markAllAsRead, dismiss, updateEmailDraft, sendAlert, getAlert }}
    >
      {children}
    </AlertsContext.Provider>
  );
}

export function useAlerts() {
  const ctx = useContext(AlertsContext);
  if (!ctx) throw new Error("useAlerts must be used within AlertsProvider");
  return ctx;
}
