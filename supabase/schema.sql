-- Run this in the Supabase SQL editor for your project to set up the database.

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
  payment_status text default 'pending' check (payment_status in ('pending', 'paid', 'pending_verification')),
  created_at timestamptz default now(),
  
  -- From Migration 002: Payments
  currency text default 'NPR' check (currency in ('NPR', 'USD')),
  payment_provider text check (payment_provider in ('esewa', 'stripe')),
  stripe_session_id text,
  amount_paid integer,
  
  -- From Migration 003: Owner Authentication
  owner_email text,
  
  -- From Migration 004: Google Reviews
  google_review text default '',
  
  -- From Migration 005: Custom Background and Layouts
  background_data_url text,
  card_layout text default 'classic' check (card_layout in ('classic', 'modern_dark', 'minimal_light')),
  
  -- From Migration 006: Custom Text Color
  text_color text,
  
  -- From Migration 007: Team Cards Feature
  parent_id uuid references cards(id) on delete cascade,
  member_name text,
  member_role text,
  
  -- From Migration 008: Hide Logo Option
  show_logo_on_card boolean default true,
  
  -- From Migration 009: Personal payment verification fields
  txn_id text,
  sender_wallet text
);

-- Indexes
create index if not exists cards_slug_idx on cards (slug);
create index if not exists cards_payment_status_idx on cards (payment_status);
create index if not exists cards_stripe_session_idx on cards (stripe_session_id);
create index if not exists cards_owner_email_idx on cards (owner_email);
create index if not exists cards_parent_id_idx on cards (parent_id);

-- Row Level Security
alter table cards enable row level security;

-- Policies
create policy "Public can read paid cards"
  on cards for select
  using (payment_status = 'paid');

create policy "Owners can view their own cards"
  on cards for select
  using (auth.jwt() ->> 'email' = owner_email);

create policy "Owners can update their own cards"
  on cards for update
  using (auth.jwt() ->> 'email' = owner_email);
