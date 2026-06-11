// カテゴリ別ノート一覧 + 検索/絞り込み
import { getCategory } from '../../data/categories.js';
import { getNotesByCategory } from '../db.js';
import { escapeHtml, setHeader, setActiveNav, noteMatches, sortByDateDesc } from '../ui.js';
import { noteItemHtml } from './home.js';
import { printNotes } from '../export.js';

export async function render(app, { catId }) {
  const cat = getCategory(catId);
  if (!cat) { location.hash = '#/'; return; }
  setHeader(`${cat.icon} ${cat.name}`, { back: true, category: cat.id });
  setActiveNav('home');

  const notes = sortByDateDesc(await getNotesByCategory(catId));

  app.innerHTML = `
    <label class="field">
      <input type="search" id="list-search" placeholder="銘柄・産地・フレーバー・風景などで検索" autocomplete="off">
    </label>
    <div class="btn-row" style="margin:0 0 14px">
      <a class="btn" href="#/new/${cat.id}">＋ 新しいテイスティング</a>
      <button class="btn secondary" id="print-all" ${notes.length ? '' : 'disabled'}>🖨 全件PDF</button>
    </div>
    <div id="list-body"></div>
    <a class="fab" href="#/new/${cat.id}" aria-label="新規作成">＋</a>
  `;

  const body = app.querySelector('#list-body');
  const searchInput = app.querySelector('#list-search');

  function renderList() {
    const q = searchInput.value.trim();
    const filtered = notes.filter(n => noteMatches(n, q));
    body.innerHTML = filtered.length
      ? filtered.map(noteItemHtml).join('')
      : `<div class="empty"><div class="big">${cat.icon}</div>${q ? '該当するノートがありません' : 'まだ記録がありません。<br>「＋ 新しいテイスティング」から始めましょう。'}</div>`;
  }
  searchInput.addEventListener('input', renderList);
  renderList();

  app.querySelector('#print-all').addEventListener('click', () => {
    const q = searchInput.value.trim();
    printNotes(notes.filter(n => noteMatches(n, q)));
  });
}
