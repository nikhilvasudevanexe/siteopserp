# ADR 0002 — Enforce all permissions at the database with RLS

Status: Accepted · Date: 2026-05-28

## Context

Principle 4 requires that the frontend cannot leak data the database does not
permit. Permissions are per-form (`forms.permissions` jsonb) and per-tenant
(`organisation_id`).

## Decision

Every table has RLS enabled. Policies derive identity from two
`SECURITY DEFINER` helpers — `current_org_id()` and `current_user_role()` —
which read the caller's `public.users` row by `auth.uid()`. Form-level
permissions are evaluated by `form_allows(form_id, action)`.

`SECURITY DEFINER` is required because these helpers query `public.users`, which
itself has RLS; without it the policies would recurse. The helpers are
`stable`, pinned to `search_path = public`, and only ever read the caller's own
row.

## Consequences

- A user cannot read or write another organisation's rows even via direct
  PostgREST calls with their own JWT (satisfies the cross-tenant acceptance
  criterion).
- `audit_log` has a SELECT policy but no write policy; only `SECURITY DEFINER`
  triggers/RPCs can append to it, so the trail is tamper-evident.
- Submission policies are the subtle part: a user may always read/edit their
  **own** unsigned draft; the form's `read`/`submit`/`sign` lists govern
  everything else. These are a strict starting point and expected to be tightened
  as real First Civil workflows land (e.g. crew should not read each other's
  inductions). See `10_rls_policies.sql`.
