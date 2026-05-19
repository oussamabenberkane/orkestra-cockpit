"use server";

import { supabaseServer as supabase } from "./supabase-server";
import type {
  SupportTicket,
  TicketMessage,
  TicketAttachment,
  TicketStatus,
  TicketType,
} from "./support-types";

const BUCKET = "support-attachments";
const SIGNED_URL_TTL_SECONDS = 3600; // 1 hour

// ── Row shapes from Postgres ──────────────────────────────────────────────

type TicketRow = {
  id: string;
  type: TicketType;
  category: string;
  custom_category: string | null;
  status: TicketStatus;
  subject: string;
  user_name: string;
  created_at: string;
  updated_at: string;
};

type MessageRow = {
  id: string;
  ticket_id: string;
  sender: "user" | "admin";
  sender_name: string;
  body: string;
  created_at: string;
};

type AttachmentRow = {
  id: string;
  message_id: string;
  name: string;
  size: number;
  mime: string;
  storage_path: string;
};

// ── Mappers ────────────────────────────────────────────────────────────────

function mapTicket(row: TicketRow, messages: TicketMessage[]): SupportTicket {
  return {
    id: row.id,
    type: row.type,
    category: row.category,
    customCategory: row.custom_category,
    status: row.status,
    subject: row.subject,
    userName: row.user_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    messages,
  };
}

async function signAttachment(row: AttachmentRow): Promise<TicketAttachment> {
  const { data } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(row.storage_path, SIGNED_URL_TTL_SECONDS);
  return {
    id: row.id,
    name: row.name,
    size: row.size,
    mime: row.mime,
    url: data?.signedUrl ?? "#",
  };
}

// ── Reads ──────────────────────────────────────────────────────────────────

export async function listTickets(): Promise<SupportTicket[]> {
  const { data: tickets, error: ticketsErr } = await supabase
    .from("support_tickets")
    .select("*")
    .order("updated_at", { ascending: false });

  if (ticketsErr || !tickets) return [];

  const ids = tickets.map((t) => t.id);
  if (ids.length === 0) return [];

  const { data: messages } = await supabase
    .from("support_messages")
    .select("*")
    .in("ticket_id", ids)
    .order("created_at", { ascending: true });

  const msgIds = (messages ?? []).map((m) => m.id);
  const { data: attachments } =
    msgIds.length > 0
      ? await supabase
          .from("support_attachments")
          .select("*")
          .in("message_id", msgIds)
      : { data: [] as AttachmentRow[] };

  const attachmentsByMsg = new Map<string, AttachmentRow[]>();
  for (const a of (attachments ?? []) as AttachmentRow[]) {
    const arr = attachmentsByMsg.get(a.message_id) ?? [];
    arr.push(a);
    attachmentsByMsg.set(a.message_id, arr);
  }

  const signedByMsg = new Map<string, TicketAttachment[]>();
  for (const [msgId, rows] of attachmentsByMsg) {
    signedByMsg.set(msgId, await Promise.all(rows.map(signAttachment)));
  }

  const messagesByTicket = new Map<string, TicketMessage[]>();
  for (const m of (messages ?? []) as MessageRow[]) {
    const arr = messagesByTicket.get(m.ticket_id) ?? [];
    arr.push({
      id: m.id,
      sender: m.sender,
      senderName: m.sender_name,
      body: m.body,
      createdAt: m.created_at,
      attachments: signedByMsg.get(m.id) ?? [],
    });
    messagesByTicket.set(m.ticket_id, arr);
  }

  return (tickets as TicketRow[]).map((t) =>
    mapTicket(t, messagesByTicket.get(t.id) ?? []),
  );
}

export async function getTicket(id: string): Promise<SupportTicket | null> {
  const { data: ticket } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("id", id)
    .single();
  if (!ticket) return null;

  const { data: messages } = await supabase
    .from("support_messages")
    .select("*")
    .eq("ticket_id", id)
    .order("created_at", { ascending: true });

  const msgIds = (messages ?? []).map((m) => m.id);
  const { data: attachments } =
    msgIds.length > 0
      ? await supabase
          .from("support_attachments")
          .select("*")
          .in("message_id", msgIds)
      : { data: [] as AttachmentRow[] };

  const attachmentsByMsg = new Map<string, AttachmentRow[]>();
  for (const a of (attachments ?? []) as AttachmentRow[]) {
    const arr = attachmentsByMsg.get(a.message_id) ?? [];
    arr.push(a);
    attachmentsByMsg.set(a.message_id, arr);
  }

  const signedByMsg = new Map<string, TicketAttachment[]>();
  for (const [msgId, rows] of attachmentsByMsg) {
    signedByMsg.set(msgId, await Promise.all(rows.map(signAttachment)));
  }

  const mapped: TicketMessage[] = (messages ?? []).map((m: MessageRow) => ({
    id: m.id,
    sender: m.sender,
    senderName: m.sender_name,
    body: m.body,
    createdAt: m.created_at,
    attachments: signedByMsg.get(m.id) ?? [],
  }));

  return mapTicket(ticket as TicketRow, mapped);
}

// ── Writes ────────────────────────────────────────────────────────────────

/**
 * Generate the next TKT-XXX id. Races are possible (no advisory lock); the
 * unique-PK constraint will reject a duplicate and the action will surface the
 * error. For a demo this is acceptable. Production would use a sequence.
 */
async function nextTicketId(): Promise<string> {
  const { data } = await supabase
    .from("support_tickets")
    .select("id")
    .order("id", { ascending: false })
    .limit(1);
  const last = data?.[0]?.id as string | undefined;
  const n = last ? parseInt(last.split("-")[1] ?? "0", 10) : 0;
  return `TKT-${String(Number.isFinite(n) ? n + 1 : 1).padStart(3, "0")}`;
}

async function uploadAttachments(
  ticketId: string,
  messageId: string,
  files: File[],
): Promise<void> {
  for (const file of files) {
    if (!file || file.size === 0) continue;
    const safeName = file.name.replace(/[^\w.\-]+/g, "_");
    const path = `${ticketId}/${messageId}/${safeName}`;
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
    if (upErr) {
      throw new Error(`Échec de l'upload du fichier ${file.name}: ${upErr.message}`);
    }
    const { error: insErr } = await supabase.from("support_attachments").insert({
      message_id: messageId,
      name: file.name,
      size: file.size,
      mime: file.type || "application/octet-stream",
      storage_path: path,
    });
    if (insErr) throw new Error(insErr.message);
  }
}

export async function createTicket(formData: FormData): Promise<SupportTicket> {
  const type = String(formData.get("type") ?? "incident") as TicketType;
  const category = String(formData.get("category") ?? "technical_issue");
  const customCategory =
    (formData.get("customCategory")?.toString() ?? "").trim() || null;
  const subject = String(formData.get("subject") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const userName = String(formData.get("userName") ?? "Utilisateur").trim();

  if (!subject) throw new Error("Le sujet est requis.");
  if (!description) throw new Error("La description est requise.");

  const ticketId = await nextTicketId();

  const { error: tErr } = await supabase.from("support_tickets").insert({
    id: ticketId,
    type,
    category,
    custom_category: customCategory,
    status: "new",
    subject,
    user_name: userName,
  });
  if (tErr) throw new Error(tErr.message);

  const { data: msg, error: mErr } = await supabase
    .from("support_messages")
    .insert({
      ticket_id: ticketId,
      sender: "user",
      sender_name: userName,
      body: description,
    })
    .select("id")
    .single();
  if (mErr || !msg) throw new Error(mErr?.message ?? "Insertion du message échouée.");

  const files = formData.getAll("attachments").filter((v): v is File => v instanceof File);
  await uploadAttachments(ticketId, msg.id as string, files);

  const created = await getTicket(ticketId);
  if (!created) throw new Error("Ticket créé mais introuvable.");
  return created;
}

export async function replyToTicket(
  ticketId: string,
  formData: FormData,
): Promise<SupportTicket> {
  const body = String(formData.get("body") ?? "").trim();
  const userName = String(formData.get("userName") ?? "Utilisateur").trim();
  const files = formData.getAll("attachments").filter((v): v is File => v instanceof File);

  if (!body && files.length === 0) {
    throw new Error("Saisissez un message ou ajoutez une pièce jointe.");
  }

  const { data: msg, error: mErr } = await supabase
    .from("support_messages")
    .insert({
      ticket_id: ticketId,
      sender: "user",
      sender_name: userName,
      body,
    })
    .select("id")
    .single();
  if (mErr || !msg) throw new Error(mErr?.message ?? "Insertion du message échouée.");

  await uploadAttachments(ticketId, msg.id as string, files);

  // Bump updated_at and transition new → open. Other statuses are preserved.
  const { data: current } = await supabase
    .from("support_tickets")
    .select("status")
    .eq("id", ticketId)
    .single();
  const nextStatus: TicketStatus =
    current?.status === "new" ? "open" : (current?.status as TicketStatus);

  await supabase
    .from("support_tickets")
    .update({ status: nextStatus, updated_at: new Date().toISOString() })
    .eq("id", ticketId);

  const refreshed = await getTicket(ticketId);
  if (!refreshed) throw new Error("Ticket introuvable après la réponse.");
  return refreshed;
}

export async function closeTicket(ticketId: string): Promise<SupportTicket> {
  await supabase
    .from("support_tickets")
    .update({ status: "closed", updated_at: new Date().toISOString() })
    .eq("id", ticketId);
  const refreshed = await getTicket(ticketId);
  if (!refreshed) throw new Error("Ticket introuvable après la fermeture.");
  return refreshed;
}
