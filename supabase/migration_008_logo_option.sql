-- Migration 008: Add option to hide logo/initials circle on physical business card layout
alter table cards
  add column if not exists show_logo_on_card boolean default true;
