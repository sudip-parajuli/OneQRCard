-- Migration 009: Add personal payment verification fields
alter table cards drop constraint if exists cards_payment_status_check;
alter table cards add constraint cards_payment_status_check check (payment_status in ('pending', 'paid', 'pending_verification'));

alter table cards
  add column if not exists txn_id text,
  add column if not exists sender_wallet text;
