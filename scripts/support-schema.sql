-- ============================================================================
-- Orkestra Cockpit — Support ticket system schema
--
-- HOW TO RUN
--   1. Open Supabase Studio → SQL editor for project `jadehnrmhmsvznsiyquo`.
--   2. Paste this file verbatim into a new query and click Run.
--   3. Create the storage bucket separately by running, from the repo root:
--          node scripts/support-create-bucket.mjs
--      (the JS SDK is the cleanest way to create a private bucket — it can't
--      be expressed in plain SQL).
--
-- This script is idempotent on the enum side (drop+create wrapped in a do
-- block guarded by typtypeof checks would be heavier than it's worth for a
-- demo) — re-running will fail on the enum CREATEs if they already exist.
-- Re-run the table CREATE blocks only after dropping the prior tables, or
-- edit by hand. For a clean reset, see the bottom of this file.
-- ============================================================================

-- ── Enums ──────────────────────────────────────────────────────────────────
create type ticket_status as enum ('new','open','in_progress','resolved','closed');
create type ticket_type   as enum ('incident','request');
create type ticket_sender as enum ('user','admin');

-- ── Tickets ────────────────────────────────────────────────────────────────
create table support_tickets (
  id              text primary key,                 -- 'TKT-001' style, generated app-side
  type            ticket_type not null,
  category        text not null,                    -- 'request_new_report' | 'technical_issue' | …
  custom_category text,
  status          ticket_status not null default 'new',
  subject         text not null,
  user_id         uuid,                             -- nullable until auth lands
  user_name       text not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── Messages ───────────────────────────────────────────────────────────────
create table support_messages (
  id          uuid primary key default gen_random_uuid(),
  ticket_id   text not null references support_tickets(id) on delete cascade,
  sender      ticket_sender not null,
  sender_name text not null,
  body        text not null,
  created_at  timestamptz not null default now()
);

-- ── Attachments ────────────────────────────────────────────────────────────
create table support_attachments (
  id           uuid primary key default gen_random_uuid(),
  message_id   uuid not null references support_messages(id) on delete cascade,
  name         text not null,
  size         bigint not null,
  mime         text not null,
  storage_path text not null                        -- path in 'support-attachments' bucket
);

-- ── Indexes ────────────────────────────────────────────────────────────────
create index support_messages_ticket_created_idx
  on support_messages (ticket_id, created_at);

create index support_tickets_updated_at_desc_idx
  on support_tickets (updated_at desc);

-- ── RLS ────────────────────────────────────────────────────────────────────
-- TODO: enable RLS once auth lands. The rest of this demo runs with RLS off
-- (see /alertes, /dashboard) so the anon key can read freely and the service
-- role key writes from server actions. When auth is added, write policies
-- keyed off auth.uid() = user_id for read; admin role for write.
--
-- alter table support_tickets     enable row level security;
-- alter table support_messages    enable row level security;
-- alter table support_attachments enable row level security;

-- ============================================================================
-- CLEAN RESET (uncomment to wipe and re-create from scratch)
--
--   drop table if exists support_attachments cascade;
--   drop table if exists support_messages    cascade;
--   drop table if exists support_tickets     cascade;
--   drop type  if exists ticket_sender;
--   drop type  if exists ticket_type;
--   drop type  if exists ticket_status;
-- ============================================================================
