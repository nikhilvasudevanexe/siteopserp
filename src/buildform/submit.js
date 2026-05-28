import { supabase, STORAGE_BUCKET } from '../lib/supabase.js';

// submitForm(formId, data, attachments, opts) -> Promise<Submission>
//
// Part of the BuildForm SDK. Creates a submission row, uploads attachment files
// to Storage, and records attachment metadata. RLS enforces who is allowed to
// do this; this function does not re-check permissions client-side.
//
//   attachments: [{ fieldKey, file }]
//   opts.status: 'draft' | 'submitted' (default 'submitted')

export async function submitForm(formId, data, attachments = [], opts = {}) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) throw new Error('Not signed in');

  const me = await loadMe(auth.user.id);

  // Snapshot the form version so this submission always renders against the
  // schema it was filled out under, even if the form changes later.
  const { data: form, error: formErr } = await supabase
    .from('forms')
    .select('id, organisation_id, version')
    .eq('id', formId)
    .single();
  if (formErr) throw formErr;

  const { data: submission, error: subErr } = await supabase
    .from('submissions')
    .insert({
      form_id: form.id,
      form_version: form.version,
      organisation_id: form.organisation_id,
      data,
      status: opts.status || 'submitted',
      submitted_by: me.id,
    })
    .select()
    .single();
  if (subErr) throw subErr;

  for (const { fieldKey, file } of attachments) {
    await uploadAttachment(form.organisation_id, submission.id, me.id, fieldKey, file);
  }

  return submission;
}

async function loadMe(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('id, organisation_id')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

// Path convention: <org>/<submission>/<field>-<rand>.<ext>. The leading org
// segment is what the Storage RLS policy matches against.
async function uploadAttachment(orgId, submissionId, userId, fieldKey, file) {
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
  const rand = crypto.randomUUID().slice(0, 8);
  const path = `${orgId}/${submissionId}/${fieldKey}-${rand}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (upErr) throw upErr;

  const { error: rowErr } = await supabase.from('attachments').insert({
    submission_id: submissionId,
    organisation_id: orgId,
    field_key: fieldKey,
    storage_path: path,
    mime_type: file.type,
    size_bytes: file.size,
    uploaded_by: userId,
  });
  if (rowErr) throw rowErr;
}

// Sign a submission and lock it. modify_after_sign permission governs any later
// change; RLS + the locked trigger enforce immutability after this.
export async function signSubmission(submissionId) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) throw new Error('Not signed in');

  const { data, error } = await supabase
    .from('submissions')
    .update({ status: 'signed', signed_at: new Date().toISOString(), signed_by: auth.user.id, locked: true })
    .eq('id', submissionId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
