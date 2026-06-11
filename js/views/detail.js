// ノート詳細 — AIフィードバック / 参考リンク / PDF / 編集・削除
import { getCategory } from '../../data/categories.js';
import { getNote, putNote, deleteNote } from '../db.js';
import { escapeHtml, setHeader, setActiveNav, toast, formatDate, ratingHtml } from '../ui.js';
import { generateFeedback, researchLinks } from '../ai.js';
import { printNotes } from '../export.js';

export async function render(app, { noteId }) {
  let note = await getNote(noteId);
  if (!note) { location.hash = '#/'; return; }
  const cat = getCategory(note.category);
  setHeader(note.name || '(無題)', { back: true, category: cat.id });
  setActiveNav('home');

  function draw() {
    const fieldRows = cat.fields
      .filter(f => note.fields?.[f.key])
      .map(f => `<dt>${escapeHtml(f.label)}</dt><dd>${escapeHtml(note.fields[f.key])}</dd>`)
      .join('');

    const sliderRows = cat.sliders.map(s => `
      <div class="slider-row">
        <span class="sl-label">${escapeHtml(s.label)}</span>
        <input type="range" min="1" max="5" value="${note.sliders?.[s.key] ?? 3}" disabled>
        <span class="sl-val">${note.sliders?.[s.key] ?? '-'}</span>
      </div>`).join('');

    const flavors = (note.flavors || [])
      .map(f => `<span class="chip accent">${escapeHtml(f.replace('>', ' › '))}</span>`).join('');

    const fb = note.aiFeedback;
    const aiSection = fb?.text ? `
      <div class="ai-box">${escapeHtml(fb.text)}</div>
      ${fb.sceneryInterpretation ? `
        <h2 class="section">風景の解釈</h2>
        <div class="ai-box scenery-box">${escapeHtml(fb.sceneryInterpretation)}</div>` : ''}
      <div class="ai-meta">by ${escapeHtml(fb.agent || cat.agent.name)} · ${new Date(fb.createdAt).toLocaleString('ja-JP')}</div>
      <div class="btn-row"><button class="btn small secondary" id="ai-btn">↻ フィードバックを再生成</button></div>`
      : `<p style="color:var(--text-dim);font-size:.88rem">${escapeHtml(cat.agent.name)}(${escapeHtml(cat.agent.title)})が、一般的な基準との対比で中立的なフィードバックを返します。風景コメントの解釈も行います。</p>
      <button class="btn block" id="ai-btn">✦ ${escapeHtml(cat.agent.name)} のフィードバックを受ける</button>`;

    const links = (note.links || []).length
      ? `<div class="link-list">${note.links.map(l =>
          `<a href="${escapeHtml(l.url)}" target="_blank" rel="noopener noreferrer">🔗 ${escapeHtml(l.title)}</a>`).join('')}</div>
        <div class="btn-row"><button class="btn small secondary" id="research-btn">↻ リンクを再取得</button></div>`
      : `<p style="color:var(--text-dim);font-size:.88rem">この銘柄についての他者のテイスティングレビューや解説記事をWebから自動収集します。</p>
        <button class="btn block secondary" id="research-btn">🔎 関連記事をリサーチ</button>`;

    app.innerHTML = `
      <div class="card">
        <div class="ni-head">
          <span class="ni-name" style="font-size:1.15rem">${cat.icon} ${escapeHtml(note.name || '(無題)')}</span>
          <span class="ni-date">${formatDate(note.date)}</span>
        </div>
        <div style="margin:6px 0 12px">${ratingHtml(note.rating, { large: true, bar: true })}</div>
        <dl class="detail-kv">${fieldRows}</dl>
      </div>

      ${flavors ? `<h2 class="section">フレーバー</h2><div class="card"><div class="flavor-chips">${flavors}</div></div>` : ''}

      <h2 class="section">味わいプロファイル</h2>
      <div class="card">${sliderRows}</div>

      ${note.scenery ? `<h2 class="section">風景</h2><div class="card"><div class="scenery-box">${escapeHtml(note.scenery)}</div></div>` : ''}
      ${note.memo ? `<h2 class="section">メモ</h2><div class="card" style="white-space:pre-wrap">${escapeHtml(note.memo)}</div>` : ''}

      <h2 class="section">✦ ${escapeHtml(cat.agent.name)} のフィードバック</h2>
      <div class="card" id="ai-card">${aiSection}</div>

      <h2 class="section">参考リンク(他者のテイスティング)</h2>
      <div class="card" id="links-card">${links}</div>

      <div class="btn-row">
        <a class="btn secondary" href="#/edit/${note.id}">✏ 編集</a>
        <button class="btn secondary" id="pdf-btn">🖨 PDF出力</button>
        <button class="btn danger" id="del-btn">🗑 削除</button>
      </div>
    `;

    // AIフィードバック
    const aiBtn = app.querySelector('#ai-btn');
    if (aiBtn) aiBtn.addEventListener('click', async () => {
      aiBtn.disabled = true;
      aiBtn.innerHTML = '<span class="spinner"></span> 生成中…(10〜30秒)';
      try {
        note.aiFeedback = await generateFeedback(note, cat);
        note.updatedAt = Date.now();
        await putNote(note);
        toast('フィードバックを受け取りました');
        draw();
      } catch (err) {
        toast(err.message, 4000);
        if (err.noKey) location.hash = '#/settings';
        else draw();
      }
    });

    // Webリサーチ
    const rsBtn = app.querySelector('#research-btn');
    if (rsBtn) rsBtn.addEventListener('click', async () => {
      rsBtn.disabled = true;
      rsBtn.innerHTML = '<span class="spinner"></span> リサーチ中…(10〜40秒)';
      try {
        const links = await researchLinks(note, cat);
        if (!links.length) { toast('参考になるページが見つかりませんでした', 3500); draw(); return; }
        note.links = links;
        note.updatedAt = Date.now();
        await putNote(note);
        toast(`${links.length}件のリンクを保存しました`);
        draw();
      } catch (err) {
        toast(err.message, 4000);
        if (err.noKey) location.hash = '#/settings';
        else draw();
      }
    });

    // PDF
    app.querySelector('#pdf-btn').addEventListener('click', () => printNotes([note]));

    // 削除
    app.querySelector('#del-btn').addEventListener('click', async () => {
      if (!confirm(`「${note.name || '(無題)'}」を削除しますか?この操作は取り消せません。`)) return;
      await deleteNote(note.id);
      toast('削除しました');
      location.hash = `#/category/${cat.id}`;
    });
  }

  draw();
}
