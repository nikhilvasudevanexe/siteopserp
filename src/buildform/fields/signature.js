import { el } from '../../lib/dom.js';

// Touch/mouse signature captured on a <canvas>. getValue returns an array with
// a single PNG File so it flows through the same attachment path as images.

export function signature(field, _value) {
  const canvas = el('canvas', { class: 'signature-pad', width: 600, height: 200 });
  const ctx = canvas.getContext('2d');
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#111';

  let drawing = false;
  let dirty = false;

  function pos(e) {
    const rect = canvas.getBoundingClientRect();
    const p = e.touches ? e.touches[0] : e;
    return {
      x: (p.clientX - rect.left) * (canvas.width / rect.width),
      y: (p.clientY - rect.top) * (canvas.height / rect.height),
    };
  }
  function start(e) { drawing = true; dirty = true; const { x, y } = pos(e); ctx.beginPath(); ctx.moveTo(x, y); e.preventDefault(); }
  function move(e) { if (!drawing) return; const { x, y } = pos(e); ctx.lineTo(x, y); ctx.stroke(); e.preventDefault(); }
  function end() { drawing = false; }

  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', move);
  window.addEventListener('mouseup', end);
  canvas.addEventListener('touchstart', start, { passive: false });
  canvas.addEventListener('touchmove', move, { passive: false });
  canvas.addEventListener('touchend', end);

  const clearBtn = el('button', {
    type: 'button', class: 'btn-secondary',
    onclick: () => { ctx.clearRect(0, 0, canvas.width, canvas.height); dirty = false; },
  }, 'Clear');

  const wrap = el('div', { class: 'field' }, [
    el('label', { class: 'field-label' },
      [field.label || field.key, field.required ? el('span', { class: 'req' }, ' *') : null]),
    canvas, el('div', { class: 'signature-actions' }, clearBtn),
    el('div', { class: 'field-error', dataset: { errorFor: field.key } }),
  ]);

  function getValue() {
    if (!dirty) return [];
    const dataUrl = canvas.toDataURL('image/png');
    const bytes = atob(dataUrl.split(',')[1]);
    const buf = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) buf[i] = bytes.charCodeAt(i);
    return [new File([buf], `${field.key}.png`, { type: 'image/png' })];
  }

  return { element: wrap, isAttachment: true, getValue };
}
