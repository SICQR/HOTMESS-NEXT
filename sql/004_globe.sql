-- Globe metrics and QR issuance tables + upsert RPCs

-- Table: globe_city_metrics
create table if not exists public.globe_city_metrics (
  id bigserial primary key,
  city text not null,
  country text not null,
  lat double precision not null,
  lng double precision not null,
  listeners integer not null default 0,
  ts timestamptz not null default now()
);
create index if not exists globe_city_metrics_ts_idx on public.globe_city_metrics(ts);

-- Function: globe_upsert_snapshot(points jsonb)
create or replace function public.globe_upsert_snapshot(points jsonb)
returns void
language plpgsql
as $$
declare
  p jsonb;
  v_ts timestamptz := now();
begin
  for p in select * from jsonb_array_elements(points)
  loop
    insert into public.globe_city_metrics (city, country, lat, lng, listeners, ts)
    values (
      coalesce(p->>'city','Unknown'),
      coalesce(p->>'country',''),
      (p->>'lat')::double precision,
      (p->>'lng')::double precision,
      coalesce((p->>'listeners')::int,0),
      v_ts
    );
  end loop;
end;
$$;

-- Table: beacon_issuances
create table if not exists public.beacon_issuances (
  id uuid primary key,
  intent text not null,
  issued_at timestamptz not null default now(),
  expires_at timestamptz not null,
  ttl_seconds int not null,
  ip text,
  user_agent text
);
create index if not exists beacon_issuances_issued_at_idx on public.beacon_issuances(issued_at);
