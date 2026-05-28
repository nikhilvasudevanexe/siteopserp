# ADR 0003 — Submission lifecycle via guarded RPCs

Status: Accepted · Date: 2026-05-28

## Context

Sprint 1 let a submitter update their own submission row directly (RLS). That
path also allowed setting `status='signed'` and `locked=true`, which would let a
submitter self-sign and bypass the form's `sign` permission. Privileged
transitions (approve/reject/sign/unlock) need stronger control than column-level
RLS can express.

## Decision

- Privileged changes — status → `approved`/`rejected`/`signed`, locking, and
  signature fields — are forbidden on the direct UPDATE path by a
  `submissions_guard_transitions` trigger.
- They are performed only by `SECURITY DEFINER` RPCs (`review_submission`,
  `sign_submission`, `unlock_submission`) that first check the form's permission
  config, then set a transaction-local flag (`buildform.privileged`) that the
  guard recognises.
- Direct UPDATE remains available for editing an own, unsigned draft's `data`.

## Consequences

- A submitter can edit their draft but cannot sign/approve/lock it; only roles in
  the form's `sign` list can, via the RPCs. `modify_after_sign` gates unlocking.
- The flag defaults to "not privileged" when unset, so any code path that forgets
  to set it is denied rather than allowed (fail closed).
- Unlock reverts to `submitted`, clears the signature, and records the reason in
  the audit log.
- The SDK exposes `signSubmission`, `reviewSubmission`, `unlockSubmission`; the
  frontend never flips these columns itself.
