-- Migration 007: Add team cards columns
alter table cards
  add column if not exists parent_id uuid references cards(id) on delete cascade,
  add column if not exists member_name text,
  add column if not exists member_role text;

create index if not exists cards_parent_id_idx on cards (parent_id);
