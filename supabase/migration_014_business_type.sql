-- Migration 014: Add business type and sections columns to cards
alter table cards
  add column if not exists business_type text default 'general',
  add column if not exists sections jsonb default '[]'::jsonb,
  add column if not exists section_order text[] default '{}';
