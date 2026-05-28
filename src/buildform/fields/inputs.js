import { el } from '../../lib/dom.js';

// Scalar inputs: text, textarea, number, checkbox, date, time, datetime.
// Each factory returns { element, getValue }.

function labelled(field, control) {
  const wrap = el('div', { class: 'field' });
  if (field.type !== 'checkbox') {
    wrap.append(el('label', { class: 'field-label', htmlFor: field.key },
      [field.label || field.key, field.required ? el('span', { class: 'req' }, ' *') : null]));
  }
  wrap.append(control);
  wrap.append(el('div', { class: 'field-error', dataset: { errorFor: field.key } }));
  return wrap;
}

export function text(field, value) {
  const input = el('input', { id: field.key, class: 'input', type: 'text', value: value ?? '' });
  return { element: labelled(field, input), getValue: () => input.value.trim() || null };
}

export function textarea(field, value) {
  const input = el('textarea', { id: field.key, class: 'input', rows: 4 }, value ?? '');
  return { element: labelled(field, input), getValue: () => input.value.trim() || null };
}

export function number(field, value) {
  const v = field.validation || {};
  const input = el('input', {
    id: field.key, class: 'input', type: 'number',
    value: value ?? '', min: v.min, max: v.max, step: v.step ?? 'any',
  });
  return {
    element: labelled(field, input),
    getValue: () => (input.value === '' ? null : Number(input.value)),
  };
}

export function checkbox(field, value) {
  const input = el('input', { id: field.key, type: 'checkbox', checked: Boolean(value) });
  const wrap = el('div', { class: 'field field-checkbox' }, [
    el('label', { class: 'field-label-inline' }, [
      input, ' ', field.label || field.key, field.required ? el('span', { class: 'req' }, ' *') : null,
    ]),
    el('div', { class: 'field-error', dataset: { errorFor: field.key } }),
  ]);
  return { element: wrap, getValue: () => input.checked };
}

function dateLike(type) {
  return (field, value) => {
    const input = el('input', { id: field.key, class: 'input', type, value: value ?? '' });
    return { element: labelled(field, input), getValue: () => input.value || null };
  };
}

export const date = dateLike('date');
export const time = dateLike('time');
export const datetime = dateLike('datetime-local');
