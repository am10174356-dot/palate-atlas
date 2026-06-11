// バックアップ(JSON/CSV)・インポート・PDF印刷
import { getAllNotes, getNotesByCategory, putNote } from './db.js';
import { getCategory, CATEGORIES } from '../data/categories.js';
import { escapeHtml, formatDate } from './ui.js';

function today() {
  return new Date().toISOString().slice(0, 10);
}

function download(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function wrapBackup(notes, scope) {
  return JSON.stringify({
    app: 'palate-atlas',
    version: 1,
    scope,
    exportedAt: new Date().toISOString(),
    count: notes.length,
    notes,
  }, null, 2);
}

// ---------- JSON ----------
export async function exportCategoryJson(catId) {
  const notes = await getNotesByCategory(catId);
  download(`${catId}_backup_${today()}.json`, wrapBackup(notes, catId), 'application/json');
  return notes.length;
}

export async function exportMasterJson() {
  const notes = await getAllNotes();
  download(`master_database_${today()}.json`, wrapBackup(notes, 'master'), 'application/json');
  return notes.length;
}

// ---------- CSV ----------
function csvEscape(v) {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function exportCategoryCsv(catId) {
  const cat = getCategory(catId);
  const notes = await getNotesByCategory(catId);
  const headers = ['ID', '日付', '銘柄/製品名', '評価',
    ...cat.fields.map(f => f.label),
    ...cat.sliders.map(s => s.label),
    'フレーバー', '風景コメント', 'メモ', 'AIフィードバック', '風景の解釈', '参考リンク'];
  const rows = notes.map(n => [
    n.id, n.date, n.name, n.rating,
    ...cat.fields.map(f => n.fields?.[f.key] ?? ''),
    ...cat.sliders.map(s => n.sliders?.[s.key] ?? ''),
    (n.flavors || []).join(' / '),
    n.scenery || '', n.memo || '',
    n.aiFeedback?.text || '', n.aiFeedback?.sceneryInterpretation || '',
    (n.links || []).map(l => `${l.title}: ${l.url}`).join(' / '),
  ].map(csvEscape).join(','));
  const csv = '\ufeff' + headers.map(csvEscape).join(',') + '\n' + rows.join('\n');
  download(`${catId}_backup_${today()}.csv`, csv, 'text/csv;charset=utf-8');
  return notes.length;
}

// ---------- インポート ----------
export async function importBackupFile(file) {
  const text = await file.text();
  let data;
  try { data = JSON.parse(text); } catch { throw new Error('JSONとして読み込めませんでした'); }
  const notes = Array.isArray(data) ? data : data.notes;
  if (!Array.isArray(notes)) throw new Error('バックアップ形式が不正です(notes配列がありません)');
  let imported = 0;
  for (const n of notes) {
    if (!n || !n.id || !n.category || !getCategory(n.category)) continue;
    await putNote(n);
    imported++;
  }
  return imported;
}

// ---------- PDF(印刷) ----------
function notePrintHtml(note) {
  const cat = getCategory(note.category);
  const fieldRows = cat.fields
    .filter(f => note.fields?.[f.key])
    .map(f => `<tr><th>${escapeHtml(f.label)}</th><td>${escapeHtml(note.fields[f.key])}</td></tr>`)
    .join('');
  const sliderRows = cat.sliders
    .map(s => `<tr><th>${escapeHtml(s.label)}</th><td>${'●'.repeat(note.sliders?.[s.key] || 0)}${'○'.repeat(5 - (note.sliders?.[s.key] || 0))} (${note.sliders?.[s.key] ?? '-'}/5)</td></tr>`)
    .join('');
  const flavors = (note.flavors || []).map(f => `<span>${escapeHtml(f.replace('>', ' › '))}</span>`).join('');
  return `
  <article class="print-note">
    <div class="p-cat">${escapeHtml(cat.en.toUpperCase())} TASTING NOTE — Palate Atlas</div>
    <h1>${cat.icon} ${escapeHtml(note.name || '(無題)')}</h1>
    <table>
      <tr><th>テイスティング日</th><td>${escapeHtml(formatDate(note.date))}</td></tr>
      <tr><th>総合評価</th><td>${note.rating ? `${(Math.round(note.rating * 10) / 10).toFixed(1)} / 5.0` : '未評価'}</td></tr>
      ${fieldRows}
    </table>
    ${flavors ? `<div class="p-section">フレーバー</div><div class="p-flavors">${flavors}</div>` : ''}
    ${sliderRows ? `<div class="p-section">味わいプロファイル</div><table>${sliderRows}</table>` : ''}
    ${note.scenery ? `<div class="p-section">風景(感じた情景)</div><div class="p-text p-scenery">${escapeHtml(note.scenery)}</div>` : ''}
    ${note.memo ? `<div class="p-section">メモ</div><div class="p-text">${escapeHtml(note.memo)}</div>` : ''}
    ${note.aiFeedback?.text ? `<div class="p-section">${escapeHtml(note.aiFeedback.agent || cat.agent.name)} のフィードバック</div><div class="p-text">${escapeHtml(note.aiFeedback.text)}</div>` : ''}
    ${note.aiFeedback?.sceneryInterpretation ? `<div class="p-section">風景の解釈</div><div class="p-text">${escapeHtml(note.aiFeedback.sceneryInterpretation)}</div>` : ''}
    ${(note.links || []).length ? `<div class="p-section">参考リンク</div><div class="p-text">${note.links.map(l => `・${escapeHtml(l.title)}<br>　${escapeHtml(l.url)}`).join('<br>')}</div>` : ''}
  </article>`;
}

export function printNotes(notes) {
  const area = document.getElementById('print-area');
  area.innerHTML = notes.map(notePrintHtml).join('');
  window.print();
}
