-- Migration 010: Add custom links field for Business plan users
alter table cards
  add column if not exists custom_links jsonb default '[]'::jsonb;
