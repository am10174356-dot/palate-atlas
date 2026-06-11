// 設定 — APIキー / バックアップ(エクスポート・インポート)
import { CATEGORIES } from '../../data/categories.js';
import { getSetting, setSetting, getAllNotes } from '../db.js';
import { escapeHtml, setHeader, setActiveNav, toast } from '../ui.js';
import { exportCategoryJson, exportCategoryCsv, exportMasterJson, importBackupFile } from '../export.js';

export async function render(app) {
  setHeader('設定');
  setActiveNav('settings');

  const apiKey = await getSetting('apiKey', '');
  const notes = await getAllNotes();
  const counts = {};
  for (const n of notes) counts[n.category] = (counts[n.category] || 0) + 1;

  app.innerHTML = `
    <h2 class="section">AIエージェント(Claude API)</h2>
    <div class="card">
      <p style="font-size:.85rem;color:var(--text-dim);margin-top:0">
        AIフィードバックと銘柄リサーチには Anthropic APIキーが必要です。
        キーはこの端末のブラウザ内にのみ保存され、外部には送信されません(API呼び出しを除く)。
        個人利用を前提とした設計です。キーは
        <a href="https://console.anthropic.com/" target="_blank" rel="noopener" style="color:var(--accent)">console.anthropic.com</a>
        で取得できます。
      </p>
      <label class="field"><span>Anthropic APIキー</span>
        <input type="password" id="api-key" value="${escapeHtml(apiKey)}" placeholder="sk-ant-...">
      </label>
      <button class="btn block" id="save-key">APIキーを保存</button>
      <div style="margin-top:12px;font-size:.8rem;color:var(--text-dim)">
        担当エージェント: ${CATEGORIES.map(c => `${c.icon} ${escapeHtml(c.agent.name)}`).join(' / ')}
      </div>
    </div>

    <h2 class="section">バックアップ(エクスポート)</h2>
    <div class="card">
      <p style="font-size:.85rem;color:var(--text-dim);margin-top:0">
        カテゴリごとのバックアップ(JSON / CSV)と、全データ統合のマスターデータベース(JSON)を書き出せます。
        書き出したファイルは OneDrive などに保管してください。
      </p>
      ${CATEGORIES.map(c => `
        <div class="btn-row" style="margin-top:8px;align-items:center">
          <span style="flex:2;min-width:120px;font-size:.9rem">${c.icon} ${escapeHtml(c.name)} <span style="color:var(--text-dim)">(${counts[c.id] || 0}件)</span></span>
          <button class="btn small secondary" data-exp-json="${c.id}">JSON</button>
          <button class="btn small secondary" data-exp-csv="${c.id}">CSV</button>
        </div>`).join('')}
      <div style="border-top:1px solid var(--border);margin:14px 0"></div>
      <button class="btn block" id="exp-master">📦 マスターデータベースを書き出す(全${notes.length}件)</button>
    </div>

    <h2 class="section">復元(インポート)</h2>
    <div class="card">
      <p style="font-size:.85rem;color:var(--text-dim);margin-top:0">
        書き出したバックアップJSON(カテゴリ別・マスターどちらも可)を読み込んで復元します。同じIDのノートは上書きされます。
      </p>
      <input type="file" id="import-file" accept=".json,application/json" style="font-size:.85rem">
      <div class="btn-row"><button class="btn block secondary" id="import-btn">読み込んで復元</button></div>
    </div>

    <h2 class="section">このアプリについて</h2>
    <div class="card" style="font-size:.85rem;color:var(--text-dim)">
      <strong style="color:var(--text)">Palate Atlas</strong> — テイスティングノート &amp; フレーバートレーニング<br>
      データはこの端末のブラウザ(IndexedDB)に保存されます。端末やブラウザを変える場合は、マスターデータベースを書き出して新しい端末で復元してください。<br>
      iPhoneでは共有メニューから「ホーム画面に追加」するとアプリとして使えます。
    </div>
  `;

  app.querySelector('#save-key').addEventListener('click', async () => {
    const v = app.querySelector('#api-key').value.trim();
    await setSetting('apiKey', v);
    toast(v ? 'APIキーを保存しました' : 'APIキーを削除しました');
  });

  app.querySelectorAll('[data-exp-json]').forEach(b => b.addEventListener('click', async () => {
    const n = await exportCategoryJson(b.dataset.expJson);
    toast(`${n}件をJSONで書き出しました`);
  }));
  app.querySelectorAll('[data-exp-csv]').forEach(b => b.addEventListener('click', async () => {
    const n = await exportCategoryCsv(b.dataset.expCsv);
    toast(`${n}件をCSVで書き出しました`);
  }));
  app.querySelector('#exp-master').addEventListener('click', async () => {
    const n = await exportMasterJson();
    toast(`マスターDB(${n}件)を書き出しました`);
  });

  app.querySelector('#import-btn').addEventListener('click', async () => {
    const file = app.querySelector('#import-file').files[0];
    if (!file) { toast('ファイルを選択してください'); return; }
    try {
      const n = await importBackupFile(file);
      toast(`${n}件を復元しました`);
      render(app);
    } catch (err) {
      toast(err.message, 4000);
    }
  });
}
