import { el, clear } from '../lib/dom.js';
import { supabase } from '../lib/supabase.js';
import { parseSchema } from '../buildform/schema.js';
import { errorBox } from './forms-list.js';

const TEMPLATE = {
  version: 1,
  fields: [{ key: 'example', type: 'text', label: 'Example field', required: true }],
  ui: { layout: 'single_column', submit_label: 'Submit' },
  logic: [],
};

// Create or edit a form. Schema is edited as raw JSON for now — the visual
// builder is a later sprint. Validates the schema before saving.
export async function formEditor(container, formId) {
  const isNew = !formId || formId === 'new';
  let form = {
    name: '', slug: '', description: '', status: 'draft',
    schema: TEMPLATE,
    permissions: {
      create: ['admin', 'manager'], read: ['admin', 'manager', 'staff'],
      submit: ['admin', 'manager', 'staff', 'crew'], sign: ['admin', 'manager'],
      modify_after_sign: ['admin'],
    },
  };

  if (!isNew) {
    const { data, error } = await supabase.from('forms').select('*').eq('id', formId).single();
    if (error) { clear(container).append(errorBox(error)); return; }
    form = data;
  }

  const nameInput = el('input', { class: 'input', value: form.name, placeholder: 'Site Induction' });
  const slugInput = el('input', { class: 'input', value: form.slug, placeholder: 'site-induction' });
  const descInput = el('input', { class: 'input', value: form.description ?? '' });
  const schemaInput = el('textarea', { class: 'input code', rows: 20 }, JSON.stringify(form.schema, null, 2));
  const permsInput = el('textarea', { class: 'input code', rows: 8 }, JSON.stringify(form.permissions, null, 2));
  const status = el('div', { class: 'form-status' });

  async function save(publish) {
    status.replaceChildren();
    let schema, permissions;
    try {
      schema = parseSchema(JSON.parse(schemaInput.value));
      permissions = JSON.parse(permsInput.value);
    } catch (e) {
      status.append(errorBox(e));
      return;
    }
    const payload = {
      name: nameInput.value.trim(),
      slug: slugInput.value.trim(),
      description: descInput.value.trim() || null,
      schema, permissions,
      status: publish ? 'published' : form.status === 'archived' ? 'archived' : 'draft',
    };

    let result;
    if (isNew) {
      const { data: me } = await supabase.auth.getUser();
      const { data: u } = await supabase.from('users').select('organisation_id').eq('id', me.user.id).single();
      result = await supabase.from('forms')
        .insert({ ...payload, organisation_id: u.organisation_id, created_by: me.user.id })
        .select().single();
    } else {
      result = await supabase.from('forms').update(payload).eq('id', formId).select().single();
    }
    if (result.error) { status.append(errorBox(result.error)); return; }
    window.location.hash = `#/forms/${result.data.id}`;
  }

  async function archive() {
    const { error } = await supabase.from('forms').update({ status: 'archived' }).eq('id', formId);
    if (error) { status.append(errorBox(error)); return; }
    window.location.hash = '#/forms';
  }

  clear(container).append(
    el('h1', {}, isNew ? 'New form' : `Edit: ${form.name}`),
    field('Name', nameInput),
    field('Slug (unique per org)', slugInput),
    field('Description', descInput),
    field('Schema (JSON)', schemaInput),
    field('Permissions (JSON)', permsInput),
    status,
    el('div', { class: 'toolbar' }, [
      el('button', { class: 'btn', onclick: () => save(false) }, 'Save draft'),
      el('button', { class: 'btn btn-primary', onclick: () => save(true) }, 'Save & publish'),
      isNew ? null : el('button', { class: 'btn-secondary', onclick: archive }, 'Archive'),
      el('a', { class: 'btn-link', href: '#/forms' }, 'Cancel'),
    ]),
  );
}

function field(label, control) {
  return el('div', { class: 'field' }, [el('label', { class: 'field-label' }, label), control]);
}
