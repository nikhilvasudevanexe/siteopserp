import { el, clear } from '../lib/dom.js';
import { supabase } from '../lib/supabase.js';
import { renderForm } from '../buildform/render.js';
import { submitForm } from '../buildform/submit.js';
import { errorBox } from './forms-list.js';

// Fill + submit a form using the BuildForm SDK exactly as a surface product
// would. This is the end-to-end demo path.
export async function formFill(container, formId) {
  const { data: form, error } = await supabase
    .from('forms').select('id, name, schema').eq('id', formId).single();
  if (error) { clear(container).append(errorBox(error)); return; }

  const formEl = renderForm(form.schema, {});
  const status = el('div', { class: 'form-status' });
  const submitLabel = form.schema.ui?.submit_label || 'Submit';

  const submitBtn = el('button', { class: 'btn btn-primary', onclick: onSubmit }, submitLabel);

  async function onSubmit() {
    status.replaceChildren();
    const { data, attachments, ok } = formEl.buildform.collect();
    if (!ok) { status.append(el('div', { class: 'error-box' }, 'Please fix the highlighted fields.')); return; }
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';
    try {
      const submission = await submitForm(form.id, data, attachments);
      window.location.hash = `#/submissions/${submission.id}`;
    } catch (e) {
      status.append(errorBox(e));
      submitBtn.disabled = false;
      submitBtn.textContent = submitLabel;
    }
  }

  clear(container).append(
    el('h1', {}, form.name),
    el('div', { class: 'toolbar' }, el('a', { class: 'btn-link', href: '#/forms' }, '← Forms')),
    formEl,
    status,
    el('div', { class: 'toolbar' }, submitBtn),
  );
}
