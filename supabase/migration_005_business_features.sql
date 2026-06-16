-- Migration 005: Add background image and downloadable card layouts for Business tier
alter table cards
  add column if not exists background_data_url text,
  add column if not exists card_layout text default 'classic' check (card_layout in ('classic', 'modern_dark', 'minimal_light'));
