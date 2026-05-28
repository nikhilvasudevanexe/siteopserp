import { el, clear } from './lib/dom.js';
import { getCurrentUser, signInWithMagicLink, signOut, onAuthChange } from './lib/auth.js';
import { formsList } from './admin/forms-list.js';
import { formEditor } from './admin/form-editor.js';
import { submissionsView, submissionDetail } from './admin/submissions-view.js';
import { formFill } from './admin/form-fill.js';

const app = document.getElementById('app');
const nav = document.getElementById('nav');
const currentUserLabel = document.getElementById('current-user');

document.getElementById('sign-out').addEventListener('click', async () => {
  await signOut();
  window.location.hash = '';
});

// Hash router. Each route is [pattern, handler]; handlers receive captured ids.
const routes = [
  [/^#\/forms\/new$/, () => formEditor(app, 'new')],
  [/^#\/forms\/([0-9a-f-]+)\/fill$/, (id) => formFill(app, id)],
  [/^#\/forms\/([0-9a-f-]+)\/submissions$/, (id) => submissionsView(app, id)],
  [/^#\/forms\/([0-9a-f-]+)\/edit$/, (id) => formEditor(app, id)],
  [/^#\/forms\/([0-9a-f-]+)$/, (id) => formEditor(app, id)],
  [/^#\/submissions\/([0-9a-f-]+)$/, (id) => submissionDetail(app, id)],
  [/^#\/forms$/, () => formsList(app)],
];

async function route() {
  const user = await getCurrentUser();
  if (!user) { renderSignIn(); return; }

  nav.hidden = false;
  currentUserLabel.textContent = `${user.display_name || user.email} · ${user.role}`;

  const hash = window.location.hash || '#/forms';
  for (const [pattern, handler] of routes) {
    const match = hash.match(pattern);
    if (match) { await handler(...match.slice(1)); return; }
  }
  window.location.hash = '#/forms';
}

function renderSignIn() {
  nav.hidden = true;
  const email = el('input', { class: 'input', type: 'email', placeholder: 'you@firstcivil.test' });
  const status = el('div', { class: 'form-status' });
  clear(app).append(el('div', { class: 'signin' }, [
    el('h1', {}, 'Sign in'),
    el('p', { class: 'muted' }, 'We will email you a magic link.'),
    email,
    el('button', {
      class: 'btn btn-primary',
      onclick: async () => {
        try {
          await signInWithMagicLink(email.value.trim());
          clear(status).append(el('p', { class: 'success' }, 'Check your email for the sign-in link.'));
        } catch (e) {
          clear(status).append(el('div', { class: 'error-box' }, e.message));
        }
      },
    }, 'Send magic link'),
    status,
  ]));
}

window.addEventListener('hashchange', route);
onAuthChange(() => route());
route();
