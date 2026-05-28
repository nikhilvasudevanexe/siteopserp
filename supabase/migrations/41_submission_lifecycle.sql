-- 41_submission_lifecycle.sql
-- Submission lifecycle as guarded, audited RPCs.
--
-- Problem with the Sprint-1 setup: the submissions UPDATE policy let any
-- submitter edit their own row. Nothing stopped a submitter from setting
-- status='signed' / locked=true themselves, bypassing the `sign` permission.
--
-- Fix: a guard trigger forbids privileged transitions (approved/rejected/signed,
-- locking, signature fields) on the direct UPDATE path. Those transitions are
-- only legal inside the lifecycle RPCs below, which set a transaction-local flag
-- after checking the form's permission config. Direct UPDATE remains available
-- for editing an own unsigned draft's `data`.

create or replace function public.bf_is_privileged()
returns boolean
language sql
stable
as $$
  -- Unset => not privileged. RPCs flip this to 'on' for their own update.
  select coalesce(current_setting('buildform.privileged', true) = 'on', false);
$$;

create or replace function public.submissions_guard_transitions()
returns trigger
language plpgsql
as $$
begin
  if not public.bf_is_privileged() then
    if new.status is distinct from old.status
       and new.status in ('approved', 'rejected', 'signed') then
      raise exception 'status change to % must go through a lifecycle RPC', new.status
        using errcode = 'check_violation';
    end if;
    if new.locked and not old.locked then
      raise exception 'locking a submission must go through sign_submission()'
        using errcode = 'check_violation';
    end if;
    if new.signed_by is distinct from old.signed_by
       or new.signed_at is distinct from old.signed_at then
      raise exception 'signature fields are set by sign_submission() only'
        using errcode = 'check_violation';
    end if;
  end if;
  return new;
end;
$$;

create trigger submissions_guard_transitions
  before update on public.submissions
  for each row execute function public.submissions_guard_transitions();

-- Helper: load a submission within the caller's org or fail loudly.
create or replace function public.bf_require_submission(p_id uuid)
returns public.submissions
language plpgsql
stable
security definer
set search_path = public
as $$
declare r public.submissions;
begin
  select * into r from public.submissions
   where id = p_id and organisation_id = public.current_org_id() and deleted_at is null;
  if not found then
    raise exception 'submission % not found in your organisation', p_id;
  end if;
  return r;
end;
$$;

-- Approve or reject. Requires the form's `sign` permission. Reviewable only
-- while unlocked.
create or replace function public.review_submission(p_id uuid, p_status public.submission_status)
returns public.submissions
language plpgsql
security definer
set search_path = public
as $$
declare r public.submissions;
begin
  if p_status not in ('approved', 'rejected') then
    raise exception 'review_submission only accepts approved or rejected';
  end if;
  r := public.bf_require_submission(p_id);
  if r.locked then raise exception 'submission is locked'; end if;
  if not public.form_allows(r.form_id, 'sign') then
    raise exception 'you are not permitted to review this submission';
  end if;

  perform set_config('buildform.privileged', 'on', true);
  update public.submissions set status = p_status where id = p_id returning * into r;
  perform set_config('buildform.privileged', 'off', true);
  return r;
end;
$$;

-- Sign and lock. Requires the form's `sign` permission. Immutable afterwards.
create or replace function public.sign_submission(p_id uuid)
returns public.submissions
language plpgsql
security definer
set search_path = public
as $$
declare r public.submissions;
begin
  r := public.bf_require_submission(p_id);
  if r.locked then raise exception 'submission is already locked'; end if;
  if not public.form_allows(r.form_id, 'sign') then
    raise exception 'you are not permitted to sign this submission';
  end if;

  perform set_config('buildform.privileged', 'on', true);
  update public.submissions
     set status = 'signed', signed_at = now(), signed_by = auth.uid(), locked = true
   where id = p_id returning * into r;
  perform set_config('buildform.privileged', 'off', true);
  return r;
end;
$$;

-- Unlock a signed submission for correction. Requires `modify_after_sign`
-- (admin by default). Reverts to 'submitted' so it can be edited and re-signed.
-- The reason is recorded in the audit trail.
create or replace function public.unlock_submission(p_id uuid, p_reason text)
returns public.submissions
language plpgsql
security definer
set search_path = public
as $$
declare r public.submissions;
begin
  r := public.bf_require_submission(p_id);
  if not r.locked then raise exception 'submission is not locked'; end if;
  if not public.form_allows(r.form_id, 'modify_after_sign') then
    raise exception 'you are not permitted to unlock this submission';
  end if;

  perform set_config('buildform.privileged', 'on', true);
  update public.submissions
     set status = 'submitted', locked = false, signed_at = null, signed_by = null
   where id = p_id returning * into r;
  perform set_config('buildform.privileged', 'off', true);

  perform public.log_event('submission.unlocked', 'submissions', p_id,
    jsonb_build_object('reason', p_reason));
  return r;
end;
$$;
