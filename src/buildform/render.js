import { el, clear } from '../lib/dom.js';
import { parseSchema, validate } from './schema.js';
import { FIELD_FACTORIES } from './fields/index.js';

// renderForm(formSchema, existingData) -> HTMLElement
//
// Part of the BuildForm SDK. Surface products call this to turn a form schema
// into a live DOM element. The returned element exposes:
//   .buildform.collect()  -> { data, attachments, errors, ok }
// so the caller can read values and validation without re-walking the DOM.

export function renderForm(formSchema, existingData = {}) {
  const schema = parseSchema(formSchema);
  const controls = new Map(); // field key -> { field, getValue, isAttachment }

  const form = el('form', { class: `bf-form layout-${schema.ui.layout || 'single_column'}` });
  form.addEventListener('submit', (e) => e.preventDefault());

  for (const field of schema.fields) {
    const factory = FIELD_FACTORIES[field.type];
    if (!factory) continue; // unknown types were already rejected by parseSchema
    const control = factory(field, existingData[field.key]);
    controls.set(field.key, { field, ...control });
    form.append(control.element);
  }

  // Read all field values, split scalars (data) from files (attachments), and
  // run validation. Surface code and submitForm() both use this.
  function collect() {
    const data = {};
    const attachments = [];
    for (const [key, control] of controls) {
      const value = control.getValue();
      if (control.isAttachment) {
        for (const fileObj of value) attachments.push({ fieldKey: key, file: fileObj });
      } else {
        data[key] = value;
      }
    }
    const { ok, errors } = validate(schema, { ...data, ...attachmentPresence(controls) });
    showErrors(form, errors);
    return { data, attachments, errors, ok };
  }

  form.buildform = { schema, collect };
  return form;
}

// Required validation for attachment fields needs to know whether files were
// picked. Build a presence map the validator can check like any other value.
function attachmentPresence(controls) {
  const presence = {};
  for (const [key, control] of controls) {
    if (control.isAttachment) presence[key] = control.getValue();
  }
  return presence;
}

function showErrors(form, errors) {
  for (const node of form.querySelectorAll('[data-error-for]')) {
    const key = node.dataset.errorFor;
    clear(node).append(errors[key] || '');
    node.parentElement?.classList.toggle('has-error', Boolean(errors[key]));
  }
}
