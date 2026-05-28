-- 40_submission_read_scope.sql
-- Tighten submission visibility. Previously any role in a form's `read` list
-- could read every submission of that form. Some forms (e.g. site inductions)
-- are sensitive: a worker should see their own, but not their colleagues'.
--
-- New per-form knob: permissions.read_scope
--   "all" (default) -> `read` roles see every submission for the form
--   "own"           -> even `read` roles see only submissions they submitted
-- The submitter can always read their own submission regardless of scope.

create or replace function public.form_read_scope(p_form_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(f.permissions ->> 'read_scope', 'all')
  from public.forms f
  where f.id = p_form_id
    and f.organisation_id = public.current_org_id();
$$;

-- Forward-only: drop and recreate the affected policies with scope awareness.
drop policy if exists submissions_select_permitted on public.submissions;
create policy submissions_select_permitted
  on public.submissions for select
  using (
    organisation_id = public.current_org_id()
    and deleted_at is null
    and (
      submitted_by = auth.uid()
      or (public.form_allows(form_id, 'read') and public.form_read_scope(form_id) = 'all')
    )
  );

drop policy if exists attachments_select_same_org on public.attachments;
create policy attachments_select_same_org
  on public.attachments for select
  using (
    organisation_id = public.current_org_id()
    and exists (
      select 1 from public.submissions s
      where s.id = attachments.submission_id
        and s.deleted_at is null
        and (
          s.submitted_by = auth.uid()
          or (public.form_allows(s.form_id, 'read') and public.form_read_scope(s.form_id) = 'all')
        )
    )
  );
