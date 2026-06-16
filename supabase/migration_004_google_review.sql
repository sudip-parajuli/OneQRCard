alter table cards
  add column if not exists google_review text default '';
