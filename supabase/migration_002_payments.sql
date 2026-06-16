alter table cards
  add column if not exists currency text default 'NPR' check (currency in ('NPR','USD')),
  add column if not exists payment_provider text check (payment_provider in ('esewa','stripe')),
  add column if not exists stripe_session_id text,
  add column if not exists amount_paid integer; -- smallest currency unit (paisa / cents)

create index if not exists cards_stripe_session_idx on cards (stripe_session_id);
