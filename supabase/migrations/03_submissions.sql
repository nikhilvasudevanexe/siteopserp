-- 03_submissions.sql
-- Filled-in instances of a form.

create type public.submission_status as enum ('draft', 'submitted', 'approved', 'rejected', 'signed');

create table public.submissions (
  id              uuid primary key default gen_random_uuid(),
  form_id         uuid not null references public.forms(id),
  -- Snapshot of forms.version at submission time so old submissions still
  -- render correctly even after the form schema changes later.
  form_version    integer not null,
  organisation_id uuid not null references public.organisations(id),
  data            jsonb not null default '{}'::jsonb,
  status          public.submission_status not null default 'draft',
  submitted_by    uuid references public.users(id),
  signed_at       timestamptz,
  signed_by       uuid references public.users(id),
  -- When true the submission is immutable (enforced by trigger + RLS).
  locked          boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);

create index submissions_form_id_idx on public.submissions(form_id);
create index submissions_organisation_id_idx on public.submissions(organisation_id);
create index submissions_submitted_by_idx on public.submissions(submitted_by);
-- Most list views want live (non-deleted) rows for one org.
create index submissions_live_idx on public.submissions(organisation_id, form_id)
  where deleted_at is null;

create trigger submissions_set_updated_at
  before update on public.submissions
  for each row execute function public.set_updated_at();

-- A locked submission is immutable except for the lock/sign metadata itself.
-- Belt-and-braces alongside RLS: even an admin update is rejected here.
create or replace function public.submissions_block_locked()
returns trigger
language plpgsql
as $$
begin
  if old.locked then
    raise exception 'submission % is locked and cannot be modified', old.id
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger submissions_block_locked
  before update on public.submissions
  for each row
  when (old.locked is true and new.locked is true)
  execute function public.submissions_block_locked();

alter table public.submissions enable row level security;
