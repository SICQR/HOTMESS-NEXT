-- Core tables
create extension if not exists pgcrypto;

create table if not exists users_public (
  id uuid primary key default gen_random_uuid(),
  handle text unique,
  city text,
  tier text default 'base',
  created_at timestamptz default now()
);

create table if not exists affiliates (
  id text primary key,
  display_name text,
  city text,
  tier text default 'base',
  wallet text,
  created_at timestamptz default now()
);

create table if not exists rooms (
  id text primary key,
  city text,
  title text,
  tg_room_id text,
  public boolean default true,
  created_at timestamptz default now()
);

create table if not exists scans (
  id uuid primary key default gen_random_uuid(),
  ts timestamptz default now(),
  city text,
  surface text,
  affiliate_id text references affiliates(id),
  room_id text references rooms(id),
  ip_hash text,
  ua text,
  sig_ok boolean default false
);

create table if not exists clicks (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid references scans(id),
  ts timestamptz default now(),
  partner text check (partner in ('uber','ubereats','radio','shop','vendor')),
  url text,
  click_id text unique
);

create table if not exists conversions (
  id uuid primary key default gen_random_uuid(),
  click_id text references clicks(click_id),
  ts timestamptz default now(),
  payout_gross numeric,
  net_after_fee numeric,
  status text,
  city text,
  affiliate_id text references affiliates(id)
);

create table if not exists checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users_public(id),
  ts timestamptz default now(),
  mood text check (mood in ('ok','shaky','need_help')),
  notes text
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  ts timestamptz default now(),
  room_id text references rooms(id),
  template_id text,
  sent_count int default 0,
  clicks int default 0
);

create table if not exists escalations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users_public(id),
  ts timestamptz default now(),
  type text,
  outcome text
);
