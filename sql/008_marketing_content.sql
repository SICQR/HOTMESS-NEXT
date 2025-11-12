-- HOTMESS ADD
-- Marketing content tables (campaigns, promos, djs, blog_posts)
-- Non-destructive: create if not exists

create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  summary text,
  body text,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists promos (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  blurb text,
  body text,
  expires_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists djs (
  id uuid primary key default gen_random_uuid(),
  handle text unique not null,
  name text not null,
  genres text[] default '{}',
  bio text,
  created_at timestamptz default now()
);

create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  body text,
  published_at timestamptz,
  created_at timestamptz default now()
);

-- HOTMESS ADD indexes
create index if not exists blog_posts_published_idx on blog_posts(published_at);
