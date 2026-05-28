# Form schema specification

`forms.schema` is a jsonb document. It is the heart of BuildForm.

```json
{
  "version": 1,
  "fields": [ /* see below */ ],
  "ui": { "layout": "single_column", "submit_label": "Submit" },
  "logic": []
}
```

- `version` — schema-format version (bumped by the team, distinct from
  `forms.version` which auto-increments on every schema change).
- `fields` — ordered array of field definitions.
- `ui` — presentation hints (`layout`, `submit_label`).
- `logic` — reserved for conditional/computed rules (v2; empty for now).

## Field definition

```json
{
  "key": "litres",
  "type": "number",
  "label": "Litres",
  "required": true,
  "validation": { "min": 1, "max": 9999 }
}
```

| Property | Notes |
| --- | --- |
| `key` | Unique within the form. Used as the data + attachment key. |
| `type` | One of the supported types below. |
| `label` | Human label. Falls back to `key`. |
| `required` | Boolean. |
| `validation` | Type-specific (`min`/`max`/`step` for numbers). |
| `options` / `options_source` | For `select` / `multiselect`. |
| `max_count` | For `image` (1..N uploads). |

## Supported field types (v1)

| Type | Notes |
| --- | --- |
| `text` | Single-line. |
| `textarea` | Multi-line. |
| `number` | Integer/decimal; `min`/`max`/`step`. |
| `select` | Single-select; inline `options` or `options_source` lookup. |
| `multiselect` | Multiple selection. |
| `checkbox` | Boolean. |
| `date` / `time` / `datetime` | Pickers. |
| `image` | Photo upload, 1..N (`max_count`). |
| `file` | PDF / doc upload. |
| `signature` | Canvas signature, stored as a PNG attachment. |

## Options sources

Inline:

```json
{ "key": "status", "type": "select", "options": ["Open", "Closed"] }
```

Lookup (org-scoped table, read via RLS):

```json
{
  "key": "machine_id", "type": "select",
  "options_source": { "type": "lookup", "table": "plant_register",
                      "value_column": "id", "label_column": "name" }
}
```

## Attachment fields

`image`, `file`, and `signature` produce files rather than scalar values.
`renderForm().buildform.collect()` returns them separately as
`attachments: [{ fieldKey, file }]`, and `submitForm()` uploads them to Storage
under `<org>/<submission>/<field>-<rand>.<ext>` and records an `attachments`
row per file.

## Not yet (v2)

Conditional fields, computed fields, and repeatable groups are intentionally not
implemented. `logic` stays empty until then.
