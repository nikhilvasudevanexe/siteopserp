-- 00_organisations.sql
-- Multi-tenancy starts here. Every other table references organisations(id).

create extension if not exists "pgcrypto";

-- Shared trigger to keep updated_at honest. Reused by every table that has it.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.organisations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  settings    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger organisations_set_updated_at
  before update on public.organisations
  for each row execute function public.set_updated_at();

alter table public.organisations enable row level security;
