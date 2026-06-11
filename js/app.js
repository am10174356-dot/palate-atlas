// ルーティング・画面制御
import * as home from './views/home.js';
import * as list from './views/list.js';
import * as editor from './views/editor.js';
import * as detail from './views/detail.js';
import * as settings from './views/settings.js';
import * as search from './views/search.js';
import { initTheme } from './ui.js';

const app = document.getElementById('app');
initTheme();

const routes = [
  { re: /^#?\/?$/, view: () => home.render(app) },
  { re: /^#\/category\/([\w-]+)$/, view: (m) => list.render(app, { catId: m[1] }) },
  { re: /^#\/new\/([\w-]+)$/, view: (m) => editor.render(app, { catId: m[1] }) },
  { re: /^#\/edit\/([\w.-]+)$/, view: (m) => editor.render(app, { noteId: m[1] }) },
  { re: /^#\/note\/([\w.-]+)$/, view: (m) => detail.render(app, { noteId: m[1] }) },
  { re: /^#\/settings$/, view: () => settings.render(app) },
  { re: /^#\/search$/, view: () => search.render(app) },
];

async function render() {
  const hash = location.hash || '#/';
  for (const r of routes) {
    const m = hash.match(r.re);
    if (m) {
      window.scrollTo(0, 0);
      try {
        await r.view(m);
      } catch (err) {
        console.error(err);
        app.innerHTML = `<div class="empty">画面の表示に失敗しました。<br><span style="font-size:.8rem">${String(err.message || err).replace(/</g, '&lt;')}</span></div>`;
      }
      return;
    }
  }
  location.hash = '#/';
}

window.addEventListener('hashchange', render);
document.getElementById('back-btn').addEventListener('click', () => history.back());
render();
