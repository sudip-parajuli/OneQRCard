alter table cards
  add column if not exists owner_email text;

create index if not exists cards_owner_email_idx on cards (owner_email);

-- Enable RLS (if not already enabled)
alter table cards enable row level security;

-- Policy for reading cards (either public paid card or own card)
create policy "Owners can view their own cards"
  on cards for select
  using (auth.jwt() ->> 'email' = owner_email);

-- Policy for updating own cards
create policy "Owners can update their own cards"
  on cards for update
  using (auth.jwt() ->> 'email' = owner_email);
