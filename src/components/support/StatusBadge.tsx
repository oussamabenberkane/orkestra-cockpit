"use client";

import { Circle, Clock, Play, CheckCircle, XCircle } from "lucide-react";
import { Badge, type BadgeTone } from "./Badge";
import type { TicketStatus } from "@/lib/support-types";

const config: Record<TicketStatus, { label: string; tone: BadgeTone; Icon: typeof Circle }> = {
  new:         { label: "Nouveau",   tone: "accent",  Icon: Circle },
  open:        { label: "Ouvert",    tone: "info",    Icon: Clock },
  in_progress: { label: "En cours",  tone: "warn",    Icon: Play },
  resolved:    { label: "Résolu",    tone: "success", Icon: CheckCircle },
  closed:      { label: "Fermé",     tone: "neutral", Icon: XCircle },
};

export function StatusBadge({
  status,
  size = "md",
}: {
  status: TicketStatus;
  size?: "sm" | "md";
}) {
  const { label, tone, Icon } = config[status];
  return (
    <Badge tone={tone} size={size} icon={<Icon size={size === "sm" ? 10 : 12} strokeWidth={2.5} />}>
      {label}
    </Badge>
  );
}
