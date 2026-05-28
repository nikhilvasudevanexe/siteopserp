import { el } from '../../lib/dom.js';

// image + file. getValue returns an array of File objects. submitForm() is
// responsible for uploading them to Storage and recording attachment rows;
// the field itself never touches the network.

function uploadField(accept) {
  return (field, _value) => {
    const max = field.max_count ?? (field.type === 'image' ? 1 : 1);
    const multiple = max > 1;
    const input = el('input', {
      id: field.key, class: 'input', type: 'file', accept,
      multiple, capture: field.type === 'image' ? 'environment' : undefined,
    });
    const preview = el('div', { class: 'upload-preview' });

    input.addEventListener('change', () => {
      preview.replaceChildren();
      const files = [...input.files].slice(0, max);
      for (const f of files) {
        preview.append(field.type === 'image'
          ? el('img', { class: 'thumb', src: URL.createObjectURL(f) })
          : el('span', { class: 'file-chip' }, f.name));
      }
    });

    const wrap = el('div', { class: 'field' }, [
      el('label', { class: 'field-label', htmlFor: field.key },
        [field.label || field.key, field.required ? el('span', { class: 'req' }, ' *') : null]),
      input, preview,
      el('div', { class: 'field-error', dataset: { errorFor: field.key } }),
    ]);

    return {
      element: wrap,
      isAttachment: true,
      getValue: () => [...input.files].slice(0, max),
    };
  };
}

export const image = uploadField('image/*');
export const file = uploadField('.pdf,.doc,.docx,application/pdf');
