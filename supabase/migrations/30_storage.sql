-- 30_storage.sql
-- Private storage bucket for attachments. Access is mediated by RLS on
-- storage.objects. Convention: object paths are prefixed with the org id
--   <organisation_id>/<submission_id>/<filename>
-- so the first path segment can be matched against the caller's org.

insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', false)
on conflict (id) do nothing;

create policy attachments_storage_read
  on storage.objects for select
  using (
    bucket_id = 'attachments'
    and (storage.foldername(name))[1] = (public.current_org_id())::text
  );

create policy attachments_storage_insert
  on storage.objects for insert
  with check (
    bucket_id = 'attachments'
    and (storage.foldername(name))[1] = (public.current_org_id())::text
  );
