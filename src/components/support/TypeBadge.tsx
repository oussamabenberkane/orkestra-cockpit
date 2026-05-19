"use client";

import { AlertCircle, FileText } from "lucide-react";
import { Badge, type BadgeTone } from "./Badge";
import type { TicketType } from "@/lib/support-types";

const config: Record<TicketType, { label: string; tone: BadgeTone; Icon: typeof AlertCircle }> = {
  incident: { label: "Incident", tone: "danger", Icon: AlertCircle },
  request:  { label: "Demande",  tone: "info",   Icon: FileText },
};

export function TypeBadge({
  type,
  size = "md",
}: {
  type: TicketType;
  size?: "sm" | "md";
}) {
  const { label, tone, Icon } = config[type];
  return (
    <Badge tone={tone} size={size} icon={<Icon size={size === "sm" ? 10 : 12} strokeWidth={2.5} />}>
      {label}
    </Badge>
  );
}
