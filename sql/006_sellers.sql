-- Sellers table for onboarding submissions
create table if not exists public.sellers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  shop_name text not null,
  email text not null,
  product_category text,
  product_description text,
  branding_agreement boolean not null default false
);

alter table public.sellers enable row level security;

-- Allow anonymous insert (adjust as needed for stricter rules)
create policy sellers_insert_anon on public.sellers for insert
  with check (true);

-- Optional: allow read only to authenticated users (commented out)
-- create policy sellers_select_auth on public.sellers for select
--   using (auth.role() = 'authenticated');
