import { el, clear } from '../lib/dom.js';
import { supabase } from '../lib/supabase.js';

// Lists every form the current user is permitted to see in their org.
export async function formsList(container) {
  clear(container).append(el('h1', {}, 'Forms'),
    el('div', { class: 'toolbar' }, el('a', { class: 'btn', href: '#/forms/new' }, 'New form')));

  const { data, error } = await supabase
    .from('forms')
    .select('id, slug, name, status, version, updated_at')
    .order('updated_at', { ascending: false });

  if (error) { container.append(errorBox(error)); return; }
  if (!data.length) { container.append(el('p', { class: 'muted' }, 'No forms yet.')); return; }

  const rows = data.map((f) => el('tr', {}, [
    el('td', {}, el('a', { href: `#/forms/${f.id}` }, f.name)),
    el('td', {}, el('code', {}, f.slug)),
    el('td', {}, el('span', { class: `badge badge-${f.status}` }, f.status)),
    el('td', {}, `v${f.version}`),
    el('td', {}, [
      el('a', { class: 'btn-link', href: `#/forms/${f.id}/fill` }, 'Fill'),
      ' · ',
      el('a', { class: 'btn-link', href: `#/forms/${f.id}/submissions` }, 'Submissions'),
    ]),
  ]));

  container.append(el('table', { class: 'table' }, [
    el('thead', {}, el('tr', {}, ['Name', 'Slug', 'Status', 'Version', ''].map((h) => el('th', {}, h)))),
    el('tbody', {}, rows),
  ]));
}

export function errorBox(error) {
  return el('div', { class: 'error-box' }, error.message || String(error));
}
