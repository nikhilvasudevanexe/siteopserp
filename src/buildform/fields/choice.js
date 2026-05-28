import { el } from '../../lib/dom.js';
import { supabase } from '../../lib/supabase.js';

// select + multiselect. Options come either inline (field.options) or from a
// lookup table (field.options_source = { type:'lookup', table:'plant_register' }).

function fieldWrap(field, control) {
  return el('div', { class: 'field' }, [
    el('label', { class: 'field-label', htmlFor: field.key },
      [field.label || field.key, field.required ? el('span', { class: 'req' }, ' *') : null]),
    control,
    el('div', { class: 'field-error', dataset: { errorFor: field.key } }),
  ]);
}

async function resolveOptions(field) {
  if (Array.isArray(field.options)) {
    return field.options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  }
  const src = field.options_source;
  if (src?.type === 'lookup' && src.table) {
    // Lookup tables are org-scoped via RLS like everything else.
    const valueCol = src.value_column || 'id';
    const labelCol = src.label_column || 'name';
    const { data, error } = await supabase.from(src.table).select(`${valueCol}, ${labelCol}`);
    if (error) throw error;
    return (data || []).map((row) => ({ value: row[valueCol], label: row[labelCol] }));
  }
  return [];
}

export function select(field, value) {
  const sel = el('select', { id: field.key, class: 'input' });
  sel.append(el('option', { value: '' }, '— select —'));
  resolveOptions(field).then((opts) => {
    for (const o of opts) {
      sel.append(el('option', { value: o.value, selected: String(value) === String(o.value) }, o.label));
    }
  });
  return { element: fieldWrap(field, sel), getValue: () => sel.value || null };
}

export function multiselect(field, value) {
  const selected = new Set((value || []).map(String));
  const box = el('div', { class: 'input multiselect' });
  resolveOptions(field).then((opts) => {
    for (const o of opts) {
      const cb = el('input', { type: 'checkbox', value: o.value, checked: selected.has(String(o.value)) });
      box.append(el('label', { class: 'multiselect-option' }, [cb, ' ', o.label]));
    }
  });
  return {
    element: fieldWrap(field, box),
    getValue: () => [...box.querySelectorAll('input:checked')].map((i) => i.value),
  };
}
