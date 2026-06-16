-- Migration 011: Add address field for business cards
alter table cards
  add column if not exists address text default '';
