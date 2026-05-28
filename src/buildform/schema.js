// Form schema parsing and validation. The schema is the contract; this module
// is the single place that understands its shape.

export const FIELD_TYPES = [
  'text', 'textarea', 'number', 'select', 'multiselect',
  'checkbox', 'date', 'time', 'datetime', 'image', 'file', 'signature',
];

// Field types whose value is one or more uploaded files rather than a scalar.
export const ATTACHMENT_TYPES = new Set(['image', 'file', 'signature']);

// Parse a raw schema (object or JSON string) into a normalised shape.
// Throws on anything structurally invalid so bad schemas fail loudly.
export function parseSchema(raw) {
  const schema = typeof raw === 'string' ? JSON.parse(raw) : raw;
  if (!schema || typeof schema !== 'object') throw new Error('Schema must be an object');
  if (!Array.isArray(schema.fields)) throw new Error('Schema.fields must be an array');

  const seen = new Set();
  for (const field of schema.fields) {
    if (!field.key) throw new Error('Every field needs a key');
    if (seen.has(field.key)) throw new Error(`Duplicate field key: ${field.key}`);
    seen.add(field.key);
    if (!FIELD_TYPES.includes(field.type)) {
      throw new Error(`Unknown field type "${field.type}" on field "${field.key}"`);
    }
  }

  return {
    version: schema.version ?? 1,
    fields: schema.fields,
    ui: schema.ui ?? {},
    logic: schema.logic ?? [],
  };
}

// Validate a data object against a schema. Returns { ok, errors } where errors
// is keyed by field key. Mirrors what the DB constraints would reject, so the
// frontend can give friendly feedback before submitting.
export function validate(schema, data) {
  const errors = {};
  for (const field of schema.fields) {
    const value = data[field.key];
    const empty = value == null || value === '' ||
      (Array.isArray(value) && value.length === 0);

    if (field.required && empty) {
      errors[field.key] = 'Required';
      continue;
    }
    if (empty) continue;

    if (field.type === 'number' && field.validation) {
      const num = Number(value);
      if (Number.isNaN(num)) errors[field.key] = 'Must be a number';
      else if (field.validation.min != null && num < field.validation.min) {
        errors[field.key] = `Must be at least ${field.validation.min}`;
      } else if (field.validation.max != null && num > field.validation.max) {
        errors[field.key] = `Must be at most ${field.validation.max}`;
      }
    }
  }
  return { ok: Object.keys(errors).length === 0, errors };
}
