-- Migration 016: Add qr_customization column to cards table
alter table cards add column if not exists qr_customization jsonb default '{"dotStyle": "square", "cornerStyle": "square", "logoEnabled": true}'::jsonb;
