// 共有UIユーティリティ
export function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

export function toast(msg, ms = 2400) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(el._timer);
  el._timer = setTimeout(() => { el.hidden = true; }, ms);
}

export function setHeader(title, { back = false, category = null } = {}) {
  document.getElementById('header-title').textContent = title;
  document.getElementById('back-btn').hidden = !back;
  document.body.dataset.category = category || '';
}

export function setActiveNav(name) {
  document.querySelectorAll('#bottom-nav a').forEach(a => {
    a.classList.toggle('active', a.dataset.nav === name);
  });
}

export function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''));
  if (isNaN(d)) return iso;
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

// 評価(5点満点・小数第一位)の表示
export function formatRating(rating) {
  const r = Number(rating);
  if (!isFinite(r) || r <= 0) return null;
  return (Math.round(r * 10) / 10).toFixed(1);
}

export function ratingHtml(rating, { large = false, bar = false } = {}) {
  const r = formatRating(rating);
  if (r === null) return '<span class="score-unrated">未評価</span>';
  const barHtml = bar ? `<span class="score-bar"><i style="width:${Math.min(100, (Number(r) / 5) * 100)}%"></i></span>` : '';
  return `<span class="score ${large ? 'large' : ''}"><em>${r}</em><span class="score-max">/ 5</span></span>${barHtml}`;
}

// テーマ(ナイト/クラシック)切替
export function initTheme() {
  const btn = document.getElementById('theme-btn');
  const apply = (theme) => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('pa-theme', theme);
    btn.textContent = theme === 'night' ? '☾' : '☀';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'night' ? '#14100c' : '#f4eee1');
  };
  apply(localStorage.getItem('pa-theme') || 'night');
  btn.addEventListener('click', () => {
    apply(document.documentElement.dataset.theme === 'night' ? 'classic' : 'night');
  });
}

// ノートの自由検索(銘柄・産地・フレーバー・風景・メモなどを横断)
export function noteMatches(note, query) {
  if (!query) return true;
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const hay = [
    note.name, note.scenery, note.memo,
    ...(note.flavors || []),
    ...Object.values(note.fields || {}),
    ...(note.links || []).map(l => l.title),
    note.aiFeedback?.text,
  ].filter(Boolean).join(' ').toLowerCase();
  return terms.every(t => hay.includes(t));
}

export function sortByDateDesc(notes) {
  return [...notes].sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.createdAt || 0) - (a.createdAt || 0));
}
