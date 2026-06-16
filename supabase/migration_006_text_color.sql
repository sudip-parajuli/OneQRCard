-- Migration 006: Add custom text color for paid plans
alter table cards
  add column if not exists text_color text;
