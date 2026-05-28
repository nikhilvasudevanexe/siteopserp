# Surface demo — SiteOps Internal

A throwaway example showing how a **surface product** consumes the BuildForm
SDK. It is intentionally outside `src/` because surface products are separate
builds — this just lives in-repo so it can import the SDK from source.

What it demonstrates:

- The surface owns the page and decides **which** form to show (by slug).
- `renderForm(schema, data)` builds the form; `.buildform.collect()` returns
  `{ data, attachments, ok }`.
- `submitForm(formId, data, attachments)` persists it — the surface never talks
  to the `submissions`/`attachments` tables directly.
- RLS still applies: the surface can only load/submit forms its org and role
  permit.

In a real surface product the import is the published package instead of a
relative path:

```js
import { renderForm, submitForm } from 'siteops-buildform';
```

## Run it

The demo reuses the Supabase session created by the admin app, so:

1. Run the admin app (`npm run dev`) and sign in once.
2. Serve this folder pointing Vite at it, e.g.:

   ```bash
   npx vite examples/siteops-internal
   ```

3. Open the printed URL. The seeded **Site Induction** form renders and submits.

Both apps share the same `.env` (`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`).
