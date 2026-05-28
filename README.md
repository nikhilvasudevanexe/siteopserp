# SiteOps BuildForm

The **platform layer** of the SiteOps product suite: a configurable forms
engine (schema, submissions, permissions, attachments, audit) that the surface
products — SiteOps Internal, Finance, Management, and Crew — consume via an SDK.

> This repo builds the platform **only**. Surface UIs are separate builds.

Launch customer: First Civil Construction Pty Ltd (Sydney, Australia).

## Stack

| Layer | Technology |
| --- | --- |
| Database | PostgreSQL via Supabase (Sydney) |
| API | Supabase PostgREST + custom RPCs |
| Auth | Supabase Auth (magic link) |
| Storage | Supabase Storage |
| Frontend | Vanilla JS + Vite (no framework) |
| Edge logic | TypeScript (Supabase Edge Functions) |
| Hosting | Vercel |

## Architectural principles

1. Configuration over code.
2. Database as source of truth.
3. Append-only audit (soft-delete only).
4. Permissions enforced at the database (RLS).
5. Multi-tenant from day one (`organisation_id` on every row).
6. Solo-maintainable.
7. Frontend dumb, backend smart.

See [`docs/architecture.md`](docs/architecture.md) for detail.

## Project layout

```
supabase/migrations/   Forward-only SQL migrations (tables, RLS, triggers, seed)
src/lib/               Supabase client + auth helpers
src/buildform/         The SDK: schema, renderForm(), submitForm(), field types
src/admin/             Minimal admin UI (forms list, editor, submissions, fill)
docs/                  Architecture, schema spec, ADRs
```

## Local setup (target: < 30 minutes)

Prereqs: Node 18+, [Supabase CLI](https://supabase.com/docs/guides/cli), Docker.

```bash
# 1. Install deps
npm install

# 2. Start the local Supabase stack (Postgres, Auth, Storage, Studio)
supabase start

# 3. Apply all migrations + seed
supabase db reset

# 4. Configure the frontend
cp .env.example .env
#   Fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from `supabase status`

# 5. Run the admin UI
npm run dev
```

Open http://localhost:5173.

### Seeded login

The seed creates First Civil + an admin and a published **Site Induction** form.

- Magic link is the primary path (email shows in the local Inbucket at the URL
  from `supabase status`).
- For convenience the seed also sets a password (`password`) on
  `admin@firstcivil.test` so you can sign in directly during local dev.

### End-to-end demo

1. Sign in as the admin.
2. Open **Forms → Site Induction → Fill**.
3. Complete the fields, attach an ID photo, sign, submit.
4. The submission opens in the detail view with values + viewable photo.
5. **Forms → Site Induction → Submissions** lists it; admins can view the
   `audit_log` (form created/published, submission created/viewed) in Supabase
   Studio.

## Using the SDK from a surface product

```js
import { renderForm, submitForm } from 'siteops-buildform';

const formEl = renderForm(form.schema, existingData);
document.body.append(formEl);

document.querySelector('#submit').onclick = async () => {
  const { data, attachments, ok } = formEl.buildform.collect();
  if (ok) await submitForm(form.id, data, attachments);
};
```

## Deploying

Push migrations with `supabase db push` against the hosted project, deploy the
frontend to Vercel, and set the same `VITE_*` env vars in Vercel.
