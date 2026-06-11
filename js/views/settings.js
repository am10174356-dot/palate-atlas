// 設定 — APIキー / バックアップ(エクスポート・インポート)
import { CATEGORIES } from '../../data/categories.js';
import { getSetting, setSetting, getAllNotes } from '../db.js';
import { escapeHtml, setHeader, setActiveNav, toast } from '../ui.js';
import { exportCategoryJson, exportCategoryCsv, exportMasterJson, importBackupFile } from '../export.js';
import { syncAvailable, currentAccount, signOutAccount, fullSync, lastSyncTime } from '../sync.js';

function accountSectionHtml() {
  if (!syncAvailable()) {
    return `
    <h2 class="section">アカウント・同期</h2>
    <div class="card" style="font-size:.85rem;color:var(--text-dim)">
      同期サーバーが未設定のため、データはこの端末内にのみ保存されています。<br>
      Firebaseプロジェクトを作成して <code>data/sync-config.js</code> に設定を貼り付けると、
      アカウント機能(4桁PINログイン・端末間同期)が有効になります。手順は同フォルダの
      <strong>SETUP-同期サーバー.md</strong> を参照してください。
    </div>`;
  }
  const account = currentAccount();
  if (!account) {
    return `
    <h2 class="section">アカウント・同期</h2>
    <div class="card">
      <p style="font-size:.85rem;color:var(--text-dim);margin-top:0">
        現在「この端末のみ」モードです。アカウントにログインすると、PC・スマホ間で同じデータベースを利用できます。
      </p>
      <button class="btn block" id="goto-login">ログイン / アカウント作成</button>
    </div>`;
  }
  const last = lastSyncTime();
  const lockOn = localStorage.getItem('pa-lock-on') === '1';
  return `
  <h2 class="section">アカウント・同期</h2>
  <div class="card">
    <dl class="detail-kv" style="margin-bottom:12px">
      <dt>アカウントID</dt><dd>${escapeHtml(account)}</dd>
      <dt>最終同期</dt><dd>${last ? last.toLocaleString('ja-JP') : 'まだ同期していません'}</dd>
    </dl>
    <label style="display:flex;align-items:center;gap:10px;font-size:.88rem;margin-bottom:14px">
      <input type="checkbox" id="lock-toggle" ${lockOn ? 'checked' : ''} style="width:auto">
      起動時に4桁PINを要求する
    </label>
    <div class="btn-row" style="margin:0">
      <button class="btn secondary" id="sync-now">↻ 今すぐ同期</button>
      <button class="btn danger" id="sign-out">ログアウト</button>
    </div>
  </div>`;
}

export async function render(app) {
  setHeader('設定');
  setActiveNav('settings');

  const apiKey = await getSetting('apiKey', '');
  const notes = await getAllNotes();
  const counts = {};
  for (const n of notes) counts[n.category] = (counts[n.category] || 0) + 1;

  app.innerHTML = `
    ${accountSectionHtml()}
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

  // アカウント・同期
  app.querySelector('#goto-login')?.addEventListener('click', () => {
    localStorage.removeItem('pa-local-only');
    location.reload();
  });
  app.querySelector('#sync-now')?.addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> 同期中…';
    try {
      await fullSync();
      toast('同期が完了しました');
      render(app);
    } catch (err) {
      toast('同期に失敗しました。通信状態を確認してください。', 4000);
      btn.disabled = false;
      btn.textContent = '↻ 今すぐ同期';
    }
  });
  app.querySelector('#sign-out')?.addEventListener('click', async () => {
    if (!confirm('ログアウトしますか?\nこの端末のノートは残りますが、同期は停止します。')) return;
    try { await signOutAccount(); } catch { /* オフラインでも続行 */ }
    toast('ログアウトしました');
    location.reload();
  });
  app.querySelector('#lock-toggle')?.addEventListener('change', (e) => {
    localStorage.setItem('pa-lock-on', e.target.checked ? '1' : '0');
    toast(e.target.checked ? '起動時にPINを要求します' : '起動時のPIN要求を無効にしました');
  });

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
