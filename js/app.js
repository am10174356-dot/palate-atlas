// ルーティング・画面制御
import * as home from './views/home.js';
import * as list from './views/list.js';
import * as editor from './views/editor.js';
import * as detail from './views/detail.js';
import * as settings from './views/settings.js';
import * as search from './views/search.js';
import { initTheme } from './ui.js';
import { syncAvailable, initSync, currentAccount } from './sync.js';
import { renderLogin, renderUnlock, lockActive, localOnlyMode } from './views/login.js';

const app = document.getElementById('app');
initTheme();

let authReady = false;
async function ensureAuth() {
  if (authReady) return;
  try { await initSync(); } catch (e) { console.warn('同期初期化に失敗', e); }
  authReady = true;
}

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
  await ensureAuth();
  // 起動時PINロック
  if (lockActive()) {
    document.getElementById('back-btn').hidden = true;
    renderUnlock(app, render);
    return;
  }
  // アカウント機能が有効で未ログインの場合はログイン画面
  if (syncAvailable() && !currentAccount() && !localOnlyMode()) {
    document.getElementById('back-btn').hidden = true;
    renderLogin(app, render);
    return;
  }
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
