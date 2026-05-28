-- 01_users.sql
-- Application users, linked 1:1 with Supabase auth.users.
-- The `role` column drives every RLS policy in the system.

create type public.user_role as enum ('admin', 'manager', 'staff', 'crew');

create table public.users (
  id              uuid primary key references auth.users(id) on delete cascade,
  organisation_id uuid not null references public.organisations(id),
  email           text not null,
  display_name    text,
  role            public.user_role not null default 'crew',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index users_organisation_id_idx on public.users(organisation_id);

create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

alter table public.users enable row level security;

-- Helpers used by every RLS policy. SECURITY DEFINER so they can read
-- public.users without tripping that table's own RLS (which would recurse).
create or replace function public.current_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organisation_id from public.users where id = auth.uid();
$$;

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid();
$$;
