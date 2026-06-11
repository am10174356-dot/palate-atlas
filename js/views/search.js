// 横断検索 — 全カテゴリのノートを対象
import { getAllNotes } from '../db.js';
import { setHeader, setActiveNav, noteMatches, sortByDateDesc } from '../ui.js';
import { noteItemHtml } from './home.js';

export async function render(app) {
  setHeader('検索');
  setActiveNav('search');

  const notes = sortByDateDesc(await getAllNotes());

  app.innerHTML = `
    <label class="field">
      <input type="search" id="global-search" placeholder="全カテゴリから検索(銘柄・産地・フレーバー・風景…)" autocomplete="off" autofocus>
    </label>
    <div id="search-body"></div>
  `;

  const body = app.querySelector('#search-body');
  const input = app.querySelector('#global-search');

  function renderResults() {
    const q = input.value.trim();
    if (!q) {
      body.innerHTML = `<div class="empty"><div class="big">🔍</div>キーワードを入力すると、<br>全${notes.length}件のノートから横断検索します。</div>`;
      return;
    }
    const hits = notes.filter(n => noteMatches(n, q));
    body.innerHTML = hits.length
      ? `<h2 class="section">${hits.length}件ヒット</h2>` + hits.map(noteItemHtml).join('')
      : `<div class="empty">「${q.replace(/</g, '&lt;')}」に該当するノートはありません</div>`;
  }
  input.addEventListener('input', renderResults);
  renderResults();
  input.focus();
}
