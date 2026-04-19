create extension if not exists pgcrypto;

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  name text not null,
  signal integer not null check (signal >= 0),
  status text not null,
  title text not null,
  latitude double precision,
  longitude double precision,
  altitude double precision,
  accuracy double precision,
  battery_level double precision,
  city text,
  country text,
  fingerprint text,
  client_id text not null,
  metadata jsonb not null default '[]'::jsonb
);

create unique index if not exists submissions_client_id_key
  on public.submissions (client_id);

create unique index if not exists submissions_fingerprint_key
  on public.submissions (fingerprint)
  where fingerprint is not null;

create index if not exists submissions_signal_created_at_idx
  on public.submissions (signal desc, created_at asc);

grant usage on schema public to anon, authenticated;
grant select, insert on public.submissions to anon, authenticated;

alter table public.submissions enable row level security;

drop policy if exists "Public read leaderboard" on public.submissions;
create policy "Public read leaderboard"
  on public.submissions
  for select
  to anon
  using (true);

drop policy if exists "Public insert submission" on public.submissions;
create policy "Public insert submission"
  on public.submissions
  for insert
  to anon
  with check (true);
