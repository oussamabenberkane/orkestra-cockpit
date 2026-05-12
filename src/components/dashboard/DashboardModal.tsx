"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { ModalKey } from "@/lib/types";
import { modalData } from "@/lib/modal-data";

interface DashboardModalProps {
  open: boolean;
  modalKey: ModalKey | null;
  onClose: () => void;
}

export default function DashboardModal({
  open,
  modalKey,
  onClose,
}: DashboardModalProps) {
  const data = modalKey ? modalData[modalKey] : null;

  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent
        style={{
          borderRadius: "16px",
          padding: "1.75rem",
          maxWidth: "480px",
          width: "92vw",
          border: "1px solid #E4E7F0",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif",
        }}
      >
        <DialogHeader>
          <DialogTitle
            style={{
              fontSize: "1rem",
              fontWeight: 800,
              color: "#1E2761",
              marginBottom: "0.25rem",
            }}
          >
            {data.title}
          </DialogTitle>
          <DialogDescription
            style={{
              fontSize: "0.82rem",
              color: "#6B7280",
              lineHeight: 1.6,
            }}
          >
            {data.body}
          </DialogDescription>
        </DialogHeader>

        <div
          style={{
            background: "#F4F6FB",
            borderRadius: "10px",
            padding: "1rem",
            fontSize: "0.78rem",
            color: "#1A1F36",
            lineHeight: 1.8,
            margin: "1rem 0",
            border: "1px solid #E4E7F0",
            whiteSpace: "pre-line",
            fontFamily: "var(--font-mono), 'DM Mono', monospace",
          }}
        >
          {data.data}
        </div>

        <DialogFooter style={{ gap: "0.75rem" }}>
          <button
            onClick={onClose}
            style={{
              padding: "0.45rem 1.1rem",
              borderRadius: "8px",
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer",
              background: "#F4F6FB",
              color: "#6B7280",
              border: "1px solid #E4E7F0",
              fontFamily: "inherit",
              transition: "all 0.15s",
            }}
          >
            Fermer
          </button>
          <button
            style={{
              padding: "0.45rem 1.1rem",
              borderRadius: "8px",
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer",
              background: "#2B3AE8",
              color: "white",
              border: "none",
              fontFamily: "inherit",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#1E2BD4")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#2B3AE8")}
          >
            {data.cta}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
