-- 04_attachments.sql
-- Metadata for files held in Supabase Storage. The bytes live in Storage;
-- this table only records the pointer + metadata.

create table public.attachments (
  id              uuid primary key default gen_random_uuid(),
  submission_id   uuid not null references public.submissions(id),
  -- Denormalised from the submission for cheap RLS filtering.
  organisation_id uuid not null references public.organisations(id),
  field_key       text not null,
  storage_path    text not null,
  mime_type       text,
  size_bytes      bigint,
  uploaded_by     uuid references public.users(id),
  uploaded_at     timestamptz not null default now()
);

create index attachments_submission_id_idx on public.attachments(submission_id);
create index attachments_organisation_id_idx on public.attachments(organisation_id);

alter table public.attachments enable row level security;
