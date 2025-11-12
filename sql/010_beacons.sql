-- HOTMESS ADD
-- Beacons + beacon_events (for QR scans, etc.)

create table if not exists beacons (
  id uuid primary key default gen_random_uuid(),
  intent_id text not null,
  owner_tier text default 'guest',
  created_at timestamptz default now(),
  expires_at timestamptz
);

create table if not exists beacon_events (
  id uuid primary key default gen_random_uuid(),
  beacon_id uuid,
  code text,
  kind text not null, -- e.g., 'scan'
  user_id uuid,
  created_at timestamptz default now()
);
create index if not exists beacon_events_kind_idx on beacon_events(kind);
