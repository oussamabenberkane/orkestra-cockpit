"use client";

import { AlertCircle, AlertTriangle, Info, Minus } from "lucide-react";
import { Badge, type BadgeTone } from "./Badge";
import type { TicketPriority } from "@/lib/support-types";

const config: Record<TicketPriority, { label: string; tone: BadgeTone; Icon: typeof Info }> = {
  low:    { label: "Faible", tone: "neutral", Icon: Minus },
  medium: { label: "Moyen",  tone: "info",    Icon: Info },
  high:   { label: "Élevé",  tone: "warn",    Icon: AlertTriangle },
  urgent: { label: "Urgent", tone: "danger",  Icon: AlertCircle },
};

/**
 * Exported for parity with the source reference but intentionally unused on
 * the current Orkestra support page — priority is not yet modelled in the
 * Supabase schema. Kept so a future migration can add a `priority` column
 * and render this without touching the rest of the surface.
 */
export function PriorityBadge({
  priority,
  size = "md",
}: {
  priority: TicketPriority;
  size?: "sm" | "md";
}) {
  const { label, tone, Icon } = config[priority];
  return (
    <Badge tone={tone} size={size} icon={<Icon size={size === "sm" ? 10 : 12} strokeWidth={2.5} />}>
      {label}
    </Badge>
  );
}
