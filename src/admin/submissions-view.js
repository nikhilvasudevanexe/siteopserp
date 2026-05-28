import { el, clear } from '../lib/dom.js';
import { supabase, STORAGE_BUCKET } from '../lib/supabase.js';
import { signSubmission, reviewSubmission, unlockSubmission } from '../buildform/submit.js';
import { getCurrentUser } from '../lib/auth.js';
import { errorBox } from './forms-list.js';

// Table of submissions for one form.
export async function submissionsView(container, formId) {
  const { data: form, error: fErr } = await supabase
    .from('forms').select('id, name, schema').eq('id', formId).single();
  if (fErr) { clear(container).append(errorBox(fErr)); return; }

  const { data, error } = await supabase
    .from('submissions')
    .select('id, status, submitted_by, created_at, signed_at')
    .eq('form_id', formId)
    .order('created_at', { ascending: false });
  if (error) { clear(container).append(errorBox(error)); return; }

  clear(container).append(
    el('h1', {}, `Submissions: ${form.name}`),
    el('div', { class: 'toolbar' }, el('a', { class: 'btn-link', href: '#/forms' }, '← Forms')),
  );

  if (!data.length) { container.append(el('p', { class: 'muted' }, 'No submissions yet.')); return; }

  const rows = data.map((s) => el('tr', {}, [
    el('td', {}, el('a', { href: `#/submissions/${s.id}` }, s.id.slice(0, 8))),
    el('td', {}, el('span', { class: `badge badge-${s.status}` }, s.status)),
    el('td', {}, new Date(s.created_at).toLocaleString()),
    el('td', {}, s.signed_at ? new Date(s.signed_at).toLocaleString() : '—'),
  ]));
  container.append(el('table', { class: 'table' }, [
    el('thead', {}, el('tr', {}, ['ID', 'Status', 'Created', 'Signed'].map((h) => el('th', {}, h)))),
    el('tbody', {}, rows),
  ]));
}

// One submission: field values + attachments. Logs a "submission.viewed" audit
// event so reads are auditable (acceptance criterion).
export async function submissionDetail(container, submissionId) {
  const { data: sub, error } = await supabase
    .from('submissions').select('*, forms(name, schema, permissions)').eq('id', submissionId).single();
  if (error) { clear(container).append(errorBox(error)); return; }

  const me = await getCurrentUser();

  await supabase.rpc('log_event', {
    p_action: 'submission.viewed', p_target_table: 'submissions',
    p_target_id: submissionId, p_metadata: {},
  });

  const { data: atts } = await supabase
    .from('attachments').select('*').eq('submission_id', submissionId);

  const schema = sub.forms.schema;
  const fieldRows = schema.fields.map((f) => el('tr', {}, [
    el('th', {}, f.label || f.key),
    el('td', {}, renderValue(f, sub.data[f.key], atts || [])),
  ]));

  const status = el('div', { class: 'form-status' });

  clear(container).append(
    el('h1', {}, `Submission ${sub.id.slice(0, 8)}`),
    el('div', { class: 'toolbar' }, [
      el('a', { class: 'btn-link', href: `#/forms/${sub.form_id}/submissions` }, '← Submissions'),
      el('span', { class: `badge badge-${sub.status}` }, sub.status),
      sub.locked ? el('span', { class: 'badge badge-locked' }, 'locked') : null,
    ]),
    el('table', { class: 'table table-kv' }, el('tbody', {}, fieldRows)),
    el('p', { class: 'muted' }, `Form version at submission: v${sub.form_version}`),
    lifecycleActions(container, sub, me, status),
    status,
  );
}

// Action bar driven by the form's permission config. The RPCs re-check
// permission server-side; these buttons only avoid showing actions the role
// plainly can't take. On success we re-render the detail view.
function lifecycleActions(container, sub, me, status) {
  const perms = sub.forms.permissions || {};
  const can = (action) => (perms[action] || []).includes(me?.role);
  const buttons = [];

  const run = (fn) => async () => {
    status.replaceChildren();
    try {
      await fn();
      submissionDetail(container, sub.id);
    } catch (e) {
      status.append(errorBox(e));
    }
  };

  if (!sub.locked && can('sign')) {
    if (sub.status !== 'approved') {
      buttons.push(el('button', { class: 'btn', onclick: run(() => reviewSubmission(sub.id, 'approved')) }, 'Approve'));
    }
    if (sub.status !== 'rejected') {
      buttons.push(el('button', { class: 'btn', onclick: run(() => reviewSubmission(sub.id, 'rejected')) }, 'Reject'));
    }
    buttons.push(el('button', { class: 'btn btn-primary', onclick: run(() => signSubmission(sub.id)) }, 'Sign & lock'));
  }
  if (sub.locked && can('modify_after_sign')) {
    buttons.push(el('button', {
      class: 'btn-secondary',
      onclick: run(() => {
        const reason = window.prompt('Reason for unlocking this signed submission?');
        if (reason == null) throw new Error('Unlock cancelled');
        return unlockSubmission(sub.id, reason);
      }),
    }, 'Unlock'));
  }

  return buttons.length ? el('div', { class: 'toolbar' }, buttons) : null;
}

function renderValue(field, value, attachments) {
  const isAttachment = ['image', 'file', 'signature'].includes(field.type);
  if (isAttachment) {
    const mine = attachments.filter((a) => a.field_key === field.key);
    if (!mine.length) return '—';
    return el('div', { class: 'attachments' }, mine.map((a) => attachmentNode(field, a)));
  }
  if (field.type === 'checkbox') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.join(', ') || '—';
  return value == null || value === '' ? '—' : String(value);
}

function attachmentNode(field, att) {
  const link = el('a', { class: 'btn-link', target: '_blank', href: '#' }, 'view');
  // Signed URL: the bucket is private, so we mint a short-lived URL on demand.
  supabase.storage.from(STORAGE_BUCKET).createSignedUrl(att.storage_path, 3600).then(({ data }) => {
    if (!data) return;
    link.href = data.signedUrl;
    if (field.type === 'image' || field.type === 'signature') {
      link.replaceChildren(el('img', { class: 'thumb', src: data.signedUrl }));
    }
  });
  return el('span', { class: 'attachment' }, link);
}
