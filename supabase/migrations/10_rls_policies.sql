-- 10_rls_policies.sql
-- Row-Level Security for every table. Principle: start strict.
-- Every policy filters by organisation_id = current_org_id() so a user can
-- never see or touch another tenant's data, even via direct PostgREST calls.

-- ---------------------------------------------------------------------------
-- organisations: a user can only see their own organisation. No client-side
-- writes — orgs are provisioned out of band (seed / admin tooling).
-- ---------------------------------------------------------------------------
create policy organisations_select_own
  on public.organisations for select
  using (id = public.current_org_id());

-- ---------------------------------------------------------------------------
-- users: everyone in an org can see their colleagues. A user may update their
-- own profile. Only admins may change roles or add/remove users.
-- ---------------------------------------------------------------------------
create policy users_select_same_org
  on public.users for select
  using (organisation_id = public.current_org_id());

create policy users_update_self
  on public.users for update
  using (id = auth.uid())
  with check (id = auth.uid() and organisation_id = public.current_org_id());

create policy users_admin_insert
  on public.users for insert
  with check (
    public.current_user_role() = 'admin'
    and organisation_id = public.current_org_id()
  );

create policy users_admin_update
  on public.users for update
  using (
    public.current_user_role() = 'admin'
    and organisation_id = public.current_org_id()
  );

-- ---------------------------------------------------------------------------
-- forms: scoped to the org. Reads further gated by the form's own read list.
-- Create/update gated by role; the `create` permission list governs authoring.
-- ---------------------------------------------------------------------------
create policy forms_select_permitted
  on public.forms for select
  using (
    organisation_id = public.current_org_id()
    and (
      created_by = auth.uid()
      or (permissions -> 'read') ? (public.current_user_role())::text
      or (permissions -> 'create') ? (public.current_user_role())::text
    )
  );

create policy forms_insert_authors
  on public.forms for insert
  with check (
    organisation_id = public.current_org_id()
    and public.current_user_role() in ('admin', 'manager')
  );

create policy forms_update_authors
  on public.forms for update
  using (
    organisation_id = public.current_org_id()
    and public.current_user_role() in ('admin', 'manager')
  )
  with check (organisation_id = public.current_org_id());

-- ---------------------------------------------------------------------------
-- submissions: the trickiest table.
--   read   -> role in form.read list, OR you submitted it yourself
--   insert -> role in form.submit list, and you stamp yourself as submitter
--   update -> role in form.submit list and it's your own unsigned draft,
--             OR role in form.sign list (approve/sign/reject flow)
-- Locked rows are additionally blocked by a trigger in 03_submissions.sql.
-- ---------------------------------------------------------------------------
create policy submissions_select_permitted
  on public.submissions for select
  using (
    organisation_id = public.current_org_id()
    and deleted_at is null
    and (submitted_by = auth.uid() or public.form_allows(form_id, 'read'))
  );

create policy submissions_insert_submitters
  on public.submissions for insert
  with check (
    organisation_id = public.current_org_id()
    and submitted_by = auth.uid()
    and public.form_allows(form_id, 'submit')
  );

create policy submissions_update_own_draft
  on public.submissions for update
  using (
    organisation_id = public.current_org_id()
    and not locked
    and (
      (submitted_by = auth.uid() and public.form_allows(form_id, 'submit'))
      or public.form_allows(form_id, 'sign')
    )
  )
  with check (organisation_id = public.current_org_id());

-- ---------------------------------------------------------------------------
-- attachments: visible if you can see the parent submission; insertable by
-- the person who can write to that submission.
-- ---------------------------------------------------------------------------
create policy attachments_select_same_org
  on public.attachments for select
  using (
    organisation_id = public.current_org_id()
    and exists (
      select 1 from public.submissions s
      where s.id = attachments.submission_id
        and s.deleted_at is null
        and (s.submitted_by = auth.uid() or public.form_allows(s.form_id, 'read'))
    )
  );

create policy attachments_insert_uploader
  on public.attachments for insert
  with check (
    organisation_id = public.current_org_id()
    and uploaded_by = auth.uid()
    and exists (
      select 1 from public.submissions s
      where s.id = attachments.submission_id
        and s.organisation_id = public.current_org_id()
        and not s.locked
    )
  );

-- ---------------------------------------------------------------------------
-- audit_log: readable by admins/managers within the org. Append-only:
-- no INSERT/UPDATE/DELETE policies exist, so authenticated clients can never
-- write or tamper. Rows arrive solely via SECURITY DEFINER triggers.
-- ---------------------------------------------------------------------------
create policy audit_log_select_privileged
  on public.audit_log for select
  using (
    organisation_id = public.current_org_id()
    and public.current_user_role() in ('admin', 'manager')
  );
