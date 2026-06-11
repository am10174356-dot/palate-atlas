// ノート作成・編集フォーム
import { getCategory } from '../../data/categories.js';
import { getNote, putNote, uid } from '../db.js';
import { escapeHtml, setHeader, setActiveNav, toast } from '../ui.js';
import { renderFlavorPicker } from '../wheel.js';

function fieldHtml(f, value) {
  const v = value ?? '';
  let input;
  if (f.type === 'select') {
    const opts = ['<option value="">— 選択 —</option>',
      ...f.options.map(o => `<option value="${escapeHtml(o)}" ${o === v ? 'selected' : ''}>${escapeHtml(o)}</option>`)];
    input = `<select name="f_${f.key}">${opts.join('')}</select>`;
  } else if (f.type === 'textarea') {
    input = `<textarea name="f_${f.key}" placeholder="${escapeHtml(f.placeholder || '')}">${escapeHtml(v)}</textarea>`;
  } else {
    input = `<input type="${f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}"
      name="f_${f.key}" value="${escapeHtml(v)}" placeholder="${escapeHtml(f.placeholder || '')}"
      ${f.step ? `step="${f.step}"` : ''} ${f.type === 'number' ? 'inputmode="decimal"' : ''}>`;
  }
  return `<label class="field ${f.wide || f.type === 'textarea' ? 'wide' : ''}"><span>${escapeHtml(f.label)}</span>${input}</label>`;
}

export async function render(app, { catId, noteId }) {
  let note = null;
  if (noteId) {
    note = await getNote(noteId);
    if (!note) { location.hash = '#/'; return; }
    catId = note.category;
  }
  const cat = getCategory(catId);
  if (!cat) { location.hash = '#/'; return; }

  setHeader(note ? 'ノートを編集' : `${cat.name}を記録`, { back: true, category: cat.id });
  setActiveNav('home');

  const selectedFlavors = new Set(note?.flavors || []);
  const sliders = { ...(note?.sliders || {}) };
  for (const s of cat.sliders) sliders[s.key] = sliders[s.key] ?? 3;

  app.innerHTML = `
    <form id="note-form" autocomplete="off">
      <h2 class="section">基本情報</h2>
      <div class="card">
        <div class="field-grid">
          <label class="field wide"><span>銘柄 / 製品名 *</span>
            <input type="text" name="name" value="${escapeHtml(note?.name || '')}" placeholder="例: ${cat.id === 'cascalate' ? 'カスカレート 試作3号' : '銘柄名を入力'}" required>
          </label>
          <label class="field"><span>テイスティング日</span>
            <input type="date" name="date" value="${escapeHtml(note?.date || new Date().toISOString().slice(0, 10))}">
          </label>
          <label class="field"><span>総合評価(5点満点・小数第一位まで)</span>
            <div class="rating-field">
              <input type="number" name="rating" min="0" max="5" step="0.1" inputmode="decimal"
                placeholder="例: 4.5" value="${note?.rating ? (Math.round(note.rating * 10) / 10).toFixed(1) : ''}">
              <span class="rf-max">/ 5.0</span>
            </div>
          </label>
          ${cat.fields.map(f => fieldHtml(f, note?.fields?.[f.key])).join('')}
        </div>
      </div>

      <h2 class="section">フレーバーホイール</h2>
      <div class="card" id="flavor-picker"></div>

      <h2 class="section">味わいプロファイル</h2>
      <div class="card">
        ${cat.sliders.map(s => `
          <div class="slider-row">
            <span class="sl-label">${escapeHtml(s.label)}</span>
            <input type="range" min="1" max="5" step="1" value="${sliders[s.key]}" data-slider="${s.key}">
            <span class="sl-val" id="slv-${s.key}">${sliders[s.key]}</span>
          </div>`).join('')}
      </div>

      <h2 class="section">風景 — この一杯から浮かんだ情景</h2>
      <div class="card">
        <textarea name="scenery" placeholder="例: 雨上がりの森の中、苔むした切り株に木漏れ日が差している…">${escapeHtml(note?.scenery || '')}</textarea>
      </div>

      <h2 class="section">メモ</h2>
      <div class="card">
        <textarea name="memo" placeholder="その他、気づいたこと">${escapeHtml(note?.memo || '')}</textarea>
      </div>

      <div class="btn-row">
        <button type="submit" class="btn block">保存する</button>
      </div>
    </form>
  `;

  // スライダー
  app.querySelectorAll('input[type="range"]').forEach(r => {
    r.addEventListener('input', () => {
      sliders[r.dataset.slider] = Number(r.value);
      app.querySelector(`#slv-${r.dataset.slider}`).textContent = r.value;
    });
  });

  // フレーバーホイール
  renderFlavorPicker(app.querySelector('#flavor-picker'), cat, selectedFlavors);

  // 保存
  app.querySelector('#note-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const fields = {};
    for (const f of cat.fields) {
      const v = String(fd.get(`f_${f.key}`) || '').trim();
      if (v) fields[f.key] = v;
    }
    // 評価: 0〜5に収め、小数第一位に丸める
    let rating = parseFloat(fd.get('rating'));
    rating = isFinite(rating) ? Math.round(Math.min(5, Math.max(0, rating)) * 10) / 10 : 0;
    const now = Date.now();
    const saved = {
      id: note?.id || uid(),
      category: cat.id,
      name: String(fd.get('name') || '').trim(),
      date: String(fd.get('date') || ''),
      rating,
      fields,
      flavors: [...selectedFlavors],
      sliders,
      scenery: String(fd.get('scenery') || '').trim(),
      memo: String(fd.get('memo') || '').trim(),
      aiFeedback: note?.aiFeedback || null,
      links: note?.links || [],
      createdAt: note?.createdAt || now,
      updatedAt: now,
    };
    await putNote(saved);
    toast('保存しました');
    location.hash = `#/note/${saved.id}`;
  });
}
