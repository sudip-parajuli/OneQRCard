-- Migration: Add location_url column to cards table
-- Run this in your Supabase SQL Editor:

alter table cards
  add column if not exists location_url text default '';
