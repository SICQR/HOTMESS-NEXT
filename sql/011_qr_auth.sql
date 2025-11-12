-- HOTMESS ADD
-- Future: QR-based auth tokens

create table if not exists qr_auth_tokens (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  user_id uuid,
  status text default 'pending',
  created_at timestamptz default now(),
  completed_at timestamptz
);
