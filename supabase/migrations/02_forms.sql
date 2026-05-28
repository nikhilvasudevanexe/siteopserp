-- 02_forms.sql
-- Form definitions. The `schema` jsonb is the heart of BuildForm.

create type public.form_status as enum ('draft', 'published', 'archived');

create table public.forms (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id),
  slug            text not null,
  name            text not null,
  description     text,
  schema          jsonb not null default '{"version":1,"fields":[],"ui":{},"logic":[]}'::jsonb,
  permissions     jsonb not null default '{"create":["admin","manager"],"read":["admin","manager","staff"],"submit":["admin","manager","staff","crew"],"sign":["admin","manager"],"modify_after_sign":["admin"]}'::jsonb,
  status          public.form_status not null default 'draft',
  version         integer not null default 1,
  created_by      uuid references public.users(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  -- Slug is unique per organisation, not globally.
  unique (organisation_id, slug)
);

create index forms_organisation_id_idx on public.forms(organisation_id);
create index forms_status_idx on public.forms(organisation_id, status);

create trigger forms_set_updated_at
  before update on public.forms
  for each row execute function public.set_updated_at();

-- Bump version whenever the schema actually changes. Submissions snapshot
-- this number so old submissions keep rendering against their original schema.
create or replace function public.forms_bump_version()
returns trigger
language plpgsql
as $$
begin
  if new.schema is distinct from old.schema then
    new.version = old.version + 1;
  end if;
  return new;
end;
$$;

create trigger forms_bump_version
  before update on public.forms
  for each row execute function public.forms_bump_version();

-- Helper: does this form's permissions config allow `action` for the
-- current user's role? Used by submissions RLS.
create or replace function public.form_allows(p_form_id uuid, p_action text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select (f.permissions -> p_action) ? (public.current_user_role())::text
     from public.forms f
     where f.id = p_form_id
       and f.organisation_id = public.current_org_id()),
    false
  );
$$;

alter table public.forms enable row level security;
