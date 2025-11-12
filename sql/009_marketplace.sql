-- HOTMESS ADD
-- Marketplace partners/offers/clicks/conversions

create table if not exists marketplace_partners (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  logo_url text,
  categories text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists marketplace_offers (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references marketplace_partners(id) on delete cascade,
  code text not null,
  title text not null,
  description text,
  url text not null,
  price_from numeric,
  active boolean default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz default now()
);
create index if not exists marketplace_offers_partner_idx on marketplace_offers(partner_id);

create table if not exists marketplace_clicks (
  id uuid primary key default gen_random_uuid(),
  partner_slug text not null,
  offer_code text not null,
  hmac_valid boolean default false,
  ts timestamptz default now(),
  user_agent text,
  ip text
);

create table if not exists marketplace_conversions (
  id uuid primary key default gen_random_uuid(),
  click_id uuid references marketplace_clicks(id) on delete set null,
  partner_slug text not null,
  offer_code text not null,
  amount numeric,
  currency text,
  ts timestamptz default now()
);
