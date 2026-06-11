// ホーム — カテゴリカード + 最近のノート
import { CATEGORIES, getCategory } from '../../data/categories.js';
import { getAllNotes } from '../db.js';
import { escapeHtml, setHeader, setActiveNav, formatDate, ratingHtml, sortByDateDesc } from '../ui.js';

export async function render(app) {
  setHeader('Palate Atlas');
  setActiveNav('home');

  const notes = await getAllNotes();
  const counts = {};
  for (const n of notes) counts[n.category] = (counts[n.category] || 0) + 1;

  const cards = CATEGORIES.map(c => `
    <a class="cat-card" href="#/category/${c.id}">
      <span class="cat-bar" style="background:${c.color}"></span>
      <div class="cat-icon">${c.icon}</div>
      <div class="cat-name">${escapeHtml(c.name)}</div>
      <div class="cat-en">${escapeHtml(c.en)}</div>
      <div class="cat-count">${counts[c.id] || 0}件</div>
    </a>`).join('');

  const recent = sortByDateDesc(notes).slice(0, 5);
  const recentHtml = recent.length
    ? recent.map(n => noteItemHtml(n)).join('')
    : `<div class="empty"><div class="big">🍷🥃☕</div>最初のテイスティングを記録しましょう。<br>上のカテゴリから始められます。</div>`;

  app.innerHTML = `
    <h2 class="section">カテゴリ</h2>
    <div class="cat-grid">${cards}</div>
    <h2 class="section">最近のテイスティング</h2>
    ${recentHtml}
  `;
}

export function noteItemHtml(n) {
  const cat = getCategory(n.category);
  const flavors = (n.flavors || []).slice(0, 4)
    .map(f => `<span class="chip">${escapeHtml(f.split('>').pop())}</span>`).join('');
  return `
  <a class="card tappable note-item" href="#/note/${n.id}">
    <div class="ni-head">
      <span class="ni-name">${cat.icon} ${escapeHtml(n.name || '(無題)')}</span>
      <span class="ni-date">${formatDate(n.date)}</span>
    </div>
    <div class="ni-sub"><span>${escapeHtml(cat.name)}${subInfo(n, cat)}</span>${ratingHtml(n.rating)}</div>
    ${flavors ? `<div class="ni-flavors">${flavors}</div>` : ''}
  </a>`;
}

function subInfo(n, cat) {
  const keys = ['producer', 'distillery', 'brewery', 'roaster', 'region', 'country', 'prefecture', 'kind', 'origin'];
  for (const k of keys) {
    if (n.fields?.[k]) return ` · ${escapeHtml(n.fields[k])}`;
  }
  return '';
}
