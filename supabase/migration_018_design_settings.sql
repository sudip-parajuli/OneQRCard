-- Migration 018: Add design_settings column to cards table
alter table cards add column if not exists design_settings jsonb default '{"vibe": null, "bg_texture": "none", "embossed_effect": false, "alignment": "center", "default_nav_tab": null, "animation": "none"}'::jsonb;
