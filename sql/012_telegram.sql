-- HOTMESS ADD
-- Telegram logs audit table
create table if not exists public.telegram_logs (
  id uuid primary key default gen_random_uuid(),
  update_id bigint,
  chat_id bigint,
  user_id bigint,
  message text,
  command text,
  meta jsonb,
  created_at timestamptz default now()
);
create index if not exists idx_telegram_logs_chat on public.telegram_logs(chat_id);
