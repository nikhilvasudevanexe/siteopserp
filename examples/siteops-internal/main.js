// SiteOps Internal — surface-layer demo.
//
// This is NOT part of the platform. It shows how a surface product consumes the
// BuildForm SDK: it picks a form, renders it, and submits it. The surface owns
// the page, the chrome, and *which* form to show; BuildForm owns the form
// behaviour, validation, attachments, permissions, and audit.
//
// In a real surface product the import would be the published package:
//   import { renderForm, submitForm } from 'siteops-buildform';
// Here we import from source so the example runs inside this repo.

import { renderForm, submitForm } from '../../src/buildform/index.js';
import { supabase } from '../../src/lib/supabase.js';

const root = document.getElementById('surface');

// The surface decides which form to render. It only needs the form's slug.
const FORM_SLUG = 'site-induction';

async function main() {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session) {
    root.textContent = 'Sign in via the BuildForm admin app first (this demo reuses its session).';
    return;
  }

  // Fetch the published form definition. RLS guarantees we only get a form our
  // org and role are permitted to see.
  const { data: form, error } = await supabase
    .from('forms')
    .select('id, name, schema')
    .eq('slug', FORM_SLUG)
    .eq('status', 'published')
    .single();

  if (error || !form) {
    root.textContent = `Could not load form "${FORM_SLUG}": ${error?.message || 'not found'}`;
    return;
  }

  // Hand the schema to the SDK. Everything below is the surface's own UI.
  const formEl = renderForm(form.schema, {});
  const message = document.createElement('p');

  const submitBtn = document.createElement('button');
  submitBtn.className = 'btn btn-primary';
  submitBtn.textContent = form.schema.ui?.submit_label || 'Submit';
  submitBtn.onclick = async () => {
    message.textContent = '';
    const { data, attachments, ok } = formEl.buildform.collect();
    if (!ok) { message.textContent = 'Please fix the highlighted fields.'; return; }
    submitBtn.disabled = true;
    try {
      const submission = await submitForm(form.id, data, attachments);
      message.className = 'success';
      message.textContent = `Submitted ✓ (id ${submission.id.slice(0, 8)})`;
    } catch (e) {
      message.className = 'error-box';
      message.textContent = e.message;
      submitBtn.disabled = false;
    }
  };

  root.replaceChildren();
  const heading = document.createElement('h1');
  heading.textContent = form.name;
  root.append(heading, formEl, submitBtn, message);
}

main();
