# ADR 0001 — Store form schema and submission data as jsonb

Status: Accepted · Date: 2026-05-28

## Context

A form's fields vary per form and per organisation, and surface products must be
able to define new forms purely as configuration (Principle 1). Two options:

1. Relational: `fields` and `field_values` tables, one row per field.
2. Document: `forms.schema` and `submissions.data` as jsonb.

## Decision

Use jsonb for both `forms.schema` and `submissions.data`.

## Consequences

- New field types and forms are configuration, not migrations — exactly what the
  platform promises.
- `submissions.data` is keyed by field `key`, paired with a `form_version`
  snapshot so old submissions still render against the schema they were created
  under even after the form changes.
- Trade-off: we lose per-field DB constraints. Validation lives in `schema.js`
  (frontend) and can be enforced by RPC/trigger later if a form needs hard DB
  guarantees. Acceptable for v1; revisit if reporting needs strong typing.
- Attachments are kept relational (their own table) because they need
  independent RLS, storage pointers, and lifecycle.
