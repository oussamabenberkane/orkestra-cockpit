/**
 * Shared support ticket types. Pure types only — safe to import from both
 * client components and "use server" modules.
 */

export type TicketStatus = "new" | "open" | "in_progress" | "resolved" | "closed";
export type TicketType = "incident" | "request";
export type TicketSender = "user" | "admin";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

/** Fixed category keys (plus "other" + free-text override). Keep in sync with
 *  the values offered by CreateTicketModal. */
export type TicketCategory =
  | "request_new_report"
  | "technical_issue"
  | "feature_request"
  | "billing"
  | "other";

export const CATEGORY_LABELS: Record<TicketCategory, string> = {
  request_new_report: "Nouveau rapport",
  technical_issue: "Problème technique",
  feature_request: "Demande de fonctionnalité",
  billing: "Facturation",
  other: "Autre",
};

export interface TicketAttachment {
  id: string;
  name: string;
  size: number;
  mime: string;
  /** Time-limited signed URL — generated server-side per fetch. */
  url: string;
}

export interface TicketMessage {
  id: string;
  sender: TicketSender;
  senderName: string;
  body: string;
  createdAt: string;
  attachments: TicketAttachment[];
}

export interface SupportTicket {
  id: string;
  type: TicketType;
  category: TicketCategory | string;
  customCategory: string | null;
  status: TicketStatus;
  subject: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

/** Label resolver — handles the "other" + customCategory case. */
export function categoryLabel(
  category: string,
  customCategory?: string | null,
): string {
  if (category === "other" && customCategory) return customCategory;
  if (category in CATEGORY_LABELS) {
    return CATEGORY_LABELS[category as TicketCategory];
  }
  return category;
}
