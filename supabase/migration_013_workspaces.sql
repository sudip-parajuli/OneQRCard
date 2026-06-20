-- Migration 013: Add workspaces table and link cards
create table if not exists workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_email text not null,
  plan text default 'basic' check (plan in ('basic', 'pro', 'business')),
  card_limit integer default 1,
  payment_status text default 'pending' check (payment_status in ('pending', 'paid', 'pending_verification')),
  created_at timestamptz default now()
);

-- Link Cards to Workspaces
alter table cards add column if not exists workspace_id uuid references workspaces(id) on delete set null;
alter table cards add column if not exists is_primary boolean default false;
alter table cards add column if not exists opening_hours jsonb;

-- Lead Capture, Feedback and Scan Tables (for Phase 4)
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references cards(id) on delete cascade,
  name text not null,
  phone text not null,
  message text,
  created_at timestamptz default now()
);

create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references cards(id) on delete cascade,
  rating text check (rating in ('happy', 'unhappy')),
  comments text,
  created_at timestamptz default now()
);

create table if not exists scans (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references cards(id) on delete cascade,
  scanned_at timestamptz default now()
);

-- Enable RLS
alter table workspaces enable row level security;
alter table leads enable row level security;
alter table feedback enable row level security;
alter table scans enable row level security;

-- Add RLS Policies
create policy "Owners can view their own workspaces" on workspaces for select using (auth.jwt() ->> 'email' = owner_email);
create policy "Owners can update their own workspaces" on workspaces for update using (auth.jwt() ->> 'email' = owner_email);
create policy "Public can insert leads" on leads for insert with check (true);
create policy "Public can insert feedback" on feedback for insert with check (true);
create policy "Public can insert scans" on scans for insert with check (true);

-- Indexes
create index if not exists cards_workspace_id_idx on cards (workspace_id);
create index if not exists workspaces_owner_email_idx on workspaces (owner_email);
create index if not exists leads_card_id_idx on leads (card_id);
create index if not exists feedback_card_id_idx on feedback (card_id);
create index if not exists scans_card_id_idx on scans (card_id);
