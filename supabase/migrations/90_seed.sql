-- 90_seed.sql
-- Local/dev seed: one test organisation, one admin user, and the First Civil
-- site induction form ready to use. Idempotent so `supabase db reset` is safe.
--
-- NOTE: this inserts directly into auth.users for LOCAL DEV ONLY. In a hosted
-- environment you invite users via Supabase Auth (magic link) and then attach
-- a public.users row. Do not run this seed against production.

-- Fixed UUIDs so the seed is deterministic and re-runnable.
-- org:   11111111-1111-1111-1111-111111111111
-- admin: 22222222-2222-2222-2222-222222222222

insert into public.organisations (id, name, slug)
values ('11111111-1111-1111-1111-111111111111', 'First Civil Construction Pty Ltd', 'first-civil')
on conflict (id) do nothing;

-- Local-dev auth user. Password is 'password' (bcrypt). Magic link is the
-- real path; this exists only so you can also log in locally with a password.
insert into auth.users (
  id, instance_id, aud, role, email,
  encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
)
values (
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'admin@firstcivil.test',
  crypt('password', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{}',
  now(), now()
)
on conflict (id) do nothing;

insert into public.users (id, organisation_id, email, display_name, role)
values (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'admin@firstcivil.test', 'First Civil Admin', 'admin'
)
on conflict (id) do nothing;

-- Real First Civil use case: site induction form.
insert into public.forms (id, organisation_id, slug, name, description, status, created_by, permissions, schema)
values (
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  'site-induction',
  'Site Induction',
  'Mandatory induction completed by every worker before starting on site.',
  'published',
  '22222222-2222-2222-2222-222222222222',
  -- Inductions are sensitive: crew may submit and read their OWN only.
  '{"create":["admin","manager"],"read":["admin","manager","staff"],"submit":["admin","manager","staff","crew"],"sign":["admin","manager"],"modify_after_sign":["admin"],"read_scope":"own"}'::jsonb,
  $${
    "version": 1,
    "fields": [
      { "key": "worker_name", "type": "text", "label": "Worker full name", "required": true },
      { "key": "company", "type": "text", "label": "Company / subcontractor", "required": true },
      { "key": "induction_date", "type": "date", "label": "Induction date", "required": true },
      { "key": "white_card", "type": "checkbox", "label": "Holds a valid White Card", "required": true },
      { "key": "swms_reviewed", "type": "checkbox", "label": "SWMS reviewed and understood", "required": true },
      { "key": "emergency_contact", "type": "text", "label": "Emergency contact (name & phone)", "required": true },
      { "key": "notes", "type": "textarea", "label": "Notes", "required": false },
      { "key": "id_photo", "type": "image", "label": "Photo of ID / White Card", "required": true, "max_count": 2 },
      { "key": "signature", "type": "signature", "label": "Worker signature", "required": true }
    ],
    "ui": { "layout": "single_column", "submit_label": "Complete induction" },
    "logic": []
  }$$::jsonb
)
on conflict (id) do nothing;
