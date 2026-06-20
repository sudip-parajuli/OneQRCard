-- Migration 017: About section upgrades (bio + new social media links)
alter table cards add column if not exists bio text default '';
alter table cards add column if not exists viber text default '';
alter table cards add column if not exists x_twitter text default '';
alter table cards add column if not exists threads text default '';
alter table cards add column if not exists linkedin text default '';
alter table cards add column if not exists telegram text default '';
