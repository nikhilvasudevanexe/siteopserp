-- 20_audit_triggers.sql
-- Generic audit trigger. Attached to every business table. Writes one
-- append-only row per insert/update/delete. SECURITY DEFINER so it can write
-- to audit_log even though clients have no insert policy there.

create or replace function public.write_audit_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org      uuid;
  v_target   uuid;
  v_action   text;
  v_before   jsonb;
  v_after    jsonb;
begin
  if tg_op = 'DELETE' then
    v_before := to_jsonb(old);
    v_after  := null;
    v_org    := (v_before ->> 'organisation_id')::uuid;
    v_target := (v_before ->> 'id')::uuid;
  elsif tg_op = 'UPDATE' then
    v_before := to_jsonb(old);
    v_after  := to_jsonb(new);
    v_org    := (v_after ->> 'organisation_id')::uuid;
    v_target := (v_after ->> 'id')::uuid;
  else -- INSERT
    v_before := null;
    v_after  := to_jsonb(new);
    v_org    := (v_after ->> 'organisation_id')::uuid;
    v_target := (v_after ->> 'id')::uuid;
  end if;

  -- e.g. "submission.updated", "form.created"
  v_action := tg_argv[0] || '.' || lower(tg_op);

  insert into public.audit_log (
    organisation_id, actor_id, action, target_table, target_id, before, after
  ) values (
    v_org, auth.uid(), v_action, tg_table_name, v_target, v_before, v_after
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger forms_audit
  after insert or update or delete on public.forms
  for each row execute function public.write_audit_log('form');

create trigger submissions_audit
  after insert or update or delete on public.submissions
  for each row execute function public.write_audit_log('submission');

create trigger attachments_audit
  after insert or update or delete on public.attachments
  for each row execute function public.write_audit_log('attachment');

create trigger users_audit
  after insert or update or delete on public.users
  for each row execute function public.write_audit_log('user');

create trigger organisations_audit
  after insert or update or delete on public.organisations
  for each row execute function public.write_audit_log('organisation');

-- Explicit audit entry for events that are reads (not table writes), e.g.
-- "submission viewed". Surface/admin code calls this RPC. SECURITY DEFINER so
-- it can append even though there is no client insert policy on audit_log.
create or replace function public.log_event(
  p_action text,
  p_target_table text,
  p_target_id uuid,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_log (
    organisation_id, actor_id, action, target_table, target_id, metadata
  ) values (
    public.current_org_id(), auth.uid(), p_action, p_target_table, p_target_id, p_metadata
  );
end;
$$;
