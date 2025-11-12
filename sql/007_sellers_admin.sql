-- Additional constraints and admin access for sellers

-- 1) Case-insensitive uniqueness on email
create unique index if not exists sellers_email_lower_idx on public.sellers ((lower(email)));

-- 2) Optional IP column for rate limiting/auditing
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'sellers' and column_name = 'submitted_ip'
  ) then
    alter table public.sellers add column submitted_ip inet;
  end if;
end $$;

-- 3) Allow authenticated users to read submissions (admin dashboards)
create policy if not exists sellers_select_auth on public.sellers
  for select
  to authenticated
  using (true);

-- 4) Helpful indexes
create index if not exists sellers_created_at_idx on public.sellers (created_at desc);
