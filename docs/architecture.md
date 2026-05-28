# BuildForm architecture

BuildForm is the **platform layer**. It knows nothing about any particular
form's meaning — only how to define, render, submit, secure, and audit forms.
Surface products supply the meaning by configuring forms and consuming the SDK.

```
SURFACE LAYER   SiteOps Internal / Finance / Management / Crew
                   │ configure forms, consume the SDK
                   ▼
PLATFORM LAYER  BuildForm  ← this repo
                   • forms engine (schema, validation)
                   • submission lifecycle (draft → submit → sign → lock)
                   • permissions & roles
                   • attachments
                   • audit logging
                   • multi-tenant isolation
                   │ uses
                   ▼
DATA LAYER      Postgres via Supabase (schema, RLS, Storage, Auth)
```

## The contract is the database

The Postgres schema is the source of truth. The frontend is dumb: it renders
schemas and submits data. All business rules live in the database — constraints,
triggers, RLS policies, and RPCs. Anything not in the database does not exist.

### Tables

| Table | Purpose |
| --- | --- |
| `organisations` | Tenant root. Every other row references it. |
| `users` | App users 1:1 with `auth.users`. `role` drives RLS. |
| `forms` | Form definitions (`schema` + `permissions` jsonb). |
| `submissions` | Filled-in forms, with a `form_version` snapshot. |
| `attachments` | Storage pointers + metadata for uploaded files. |
| `audit_log` | Append-only trail, written by triggers. |

## Multi-tenant isolation

Every row carries `organisation_id`. Every RLS policy filters by
`current_org_id()` — a `SECURITY DEFINER` helper that reads the caller's org
from `public.users`. A user can never read or write another tenant's rows, even
by calling PostgREST directly with their own JWT.

## Permissions model

`forms.permissions` is a jsonb map of action → allowed roles:

```json
{ "create": [...], "read": [...], "submit": [...], "sign": [...], "modify_after_sign": [...] }
```

RLS enforces it. `form_allows(form_id, action)` checks the caller's role against
the form's permission list. Submissions additionally let a user read/edit their
**own** unsigned draft regardless of the `read` list, which is the common
field-worker case.

## Submission lifecycle

`draft → submitted → approved / rejected → signed`. Signing sets
`signed_at`/`signed_by`, flips `locked = true`, and from then on a database
trigger rejects any mutation. `modify_after_sign` is reserved for the (admin)
override path, to be wired up when an explicit unlock flow is built.

## Append-only audit

No business row is ever hard-deleted (`deleted_at` soft-delete on submissions).
A generic `write_audit_log()` trigger on every table records insert/update/
delete with before/after snapshots. Read events (e.g. "submission viewed") are
logged via the `log_event` RPC. `audit_log` has a SELECT policy but **no**
insert/update/delete policy, so clients can never tamper with it — only
`SECURITY DEFINER` functions write to it.

## The SDK boundary

Surface products import only from `src/buildform/`:

- `renderForm(schema, data) → HTMLElement` — builds the form DOM; the element
  exposes `.buildform.collect()` for values + attachments + validation.
- `submitForm(formId, data, attachments) → Promise<Submission>` — creates the
  submission, uploads files, records attachment rows.
- `signSubmission(id)` — signs and locks.

Surface code never talks to tables directly for form rendering/submission; it
goes through these functions so the platform can evolve underneath it.
