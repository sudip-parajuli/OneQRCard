-- Run this in the Supabase SQL editor for your project.

create table if not exists cards (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  business_name text not null,
  tagline text default '',
  brand_color text default '#085041',
  theme text default 'classic',
  logo_data_url text,
  phone text default '',
  whatsapp text default '',
  website text default '',
  facebook text default '',
  instagram text default '',
  tiktok text default '',
  youtube text default '',
  email text default '',
  plan text default 'basic',
  subdomain text,
  payment_status text default 'pending' check (payment_status in ('pending', 'paid')),
  created_at timestamptz default now()
);

create index if not exists cards_slug_idx on cards (slug);
create index if not exists cards_payment_status_idx on cards (payment_status);

-- Row Level Security
alter table cards enable row level security;

-- All writes/reads from the app go through the service-role key in API
-- routes (lib/supabase.ts -> supabaseAdmin), which bypasses RLS entirely.
-- These policies are a safety net in case the anon key is ever used
-- directly from the browser — they only allow reading *paid* cards,
-- and never allow inserts/updates from the client.

create policy "Public can read paid cards"
  on cards for select
  using (payment_status = 'paid');

-- No insert/update/delete policies are defined for the anon role,
-- so those operations are blocked unless done via the service-role key.
