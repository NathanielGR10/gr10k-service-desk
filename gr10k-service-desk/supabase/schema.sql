-- GR10K Service Desk — database schema
-- Run this once in Supabase: Project -> SQL Editor -> New query -> paste -> Run.

create extension if not exists "pgcrypto";

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  order_number text not null,
  date_opened date not null,
  handler text not null,
  customer text,
  reason text not null check (reason in ('return','exchange','damage','lost','wrong','sizing','delay','other')),
  channel text,
  priority text,
  status text not null default 'open' check (status in ('open','closed')),
  closed_by text,
  date_closed date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tickets_status_idx on public.tickets (status);
create index if not exists tickets_date_opened_idx on public.tickets (date_opened desc);

-- Row Level Security -------------------------------------------------------
alter table public.tickets enable row level security;

-- This app is gated by a shared passcode at the Next.js layer (see middleware.ts),
-- not by per-user Supabase auth — so the anon key itself needs open read/write
-- access to this one table for the app to work. That means anyone who has your
-- Supabase URL + anon key (visible in the deployed app's JS bundle) can read or
-- write this table directly, bypassing the passcode. Keep the passcode private,
-- and if you outgrow this, swap in Supabase Auth and scope these policies to
-- authenticated users instead.
drop policy if exists "Allow read for anon" on public.tickets;
create policy "Allow read for anon" on public.tickets
  for select using (true);

drop policy if exists "Allow insert for anon" on public.tickets;
create policy "Allow insert for anon" on public.tickets
  for insert with check (true);

drop policy if exists "Allow update for anon" on public.tickets;
create policy "Allow update for anon" on public.tickets
  for update using (true) with check (true);

drop policy if exists "Allow delete for anon" on public.tickets;
create policy "Allow delete for anon" on public.tickets
  for delete using (true);

-- Keep updated_at fresh automatically -------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists tickets_set_updated_at on public.tickets;
create trigger tickets_set_updated_at
  before update on public.tickets
  for each row execute function public.set_updated_at();

-- Realtime -------------------------------------------------------------
-- Lets everyone's browser update live as colleagues add/edit/close queries.
-- If this line errors ("already a member"), it's already enabled — ignore it.
-- Otherwise, and if it errors for another reason, enable it manually instead:
-- Supabase dashboard -> Database -> Replication -> supabase_realtime -> toggle "tickets" on.
alter publication supabase_realtime add table public.tickets;
