-- Affiliate + Stripe minimal schema changes

-- Extend beacon_issuances with affiliate metadata
alter table if exists public.beacon_issuances
  add column if not exists affiliate_id text,
  add column if not exists campaign text;

-- Credits table for affiliate payouts (simplified)
create table if not exists public.affiliate_credits (
  id uuid primary key,
  affiliate_id text not null,
  amount_cents integer not null,
  currency text not null default 'usd',
  source text not null, -- e.g., 'stripe:checkout.session.completed'
  created_at timestamptz not null default now()
);
create index if not exists affiliate_credits_affiliate_idx on public.affiliate_credits(affiliate_id);

-- Room tiers table (example for elevation)
create table if not exists public.room_tiers (
  user_id uuid primary key,
  tier text not null,
  updated_at timestamptz not null default now()
);
