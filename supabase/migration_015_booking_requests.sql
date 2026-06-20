-- Migration 015: Add booking_requests table
create table if not exists booking_requests (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references cards(id) on delete cascade,
  customer_name text not null,
  customer_phone text not null,
  preferred_datetime text not null,
  service_requested text,
  created_at timestamptz default now()
);

-- Enable RLS and add public insert policy
alter table booking_requests enable row level security;

create policy "Public can insert booking requests" on booking_requests for insert with check (true);

-- Index for performance
create index if not exists booking_requests_card_id_idx on booking_requests (card_id);
