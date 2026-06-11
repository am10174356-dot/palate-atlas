// ログイン / 新規アカウント作成 / PINロック解除 画面
import { escapeHtml, toast } from '../ui.js';
import { signIn, signUp, signOutAccount, validAccountId, validPin } from '../sync.js';

// ---- PINハッシュ(端末ロック用) ----
export async function hashPin(pin) {
  const data = new TextEncoder().encode(`palate-atlas:${pin}`);
  if (crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', data);
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // 非セキュアコンテキスト(file://等)用フォールバック
  let h = 0;
  for (const b of data) h = (h * 31 + b) >>> 0;
  return 'x' + h.toString(16);
}

export function lockActive() {
  return localStorage.getItem('pa-lock-on') === '1'
    && !!localStorage.getItem('pa-lock-hash')
    && sessionStorage.getItem('pa-unlocked') !== '1';
}

export function localOnlyMode() {
  return localStorage.getItem('pa-local-only') === '1';
}

function pinField(id) {
  return `<input type="password" id="${id}" class="pin-input" inputmode="numeric" pattern="\\d{4}"
    maxlength="4" placeholder="••••" autocomplete="off">`;
}

// ---- PINロック解除(起動時) ----
export function renderUnlock(app, onDone) {
  document.body.classList.add('locked');
  const account = localStorage.getItem('pa-account-id');
  app.innerHTML = `
    <div class="login-wrap">
      <div class="login-brand">Palate Atlas</div>
      <div class="login-sub">${account ? escapeHtml(account) : 'おかえりなさい'}</div>
      <div class="login-card card">
        <label class="field"><span>4桁のPINを入力</span>${pinField('unlock-pin')}</label>
        <button class="btn block" id="unlock-btn">ロック解除</button>
      </div>
      <button class="login-link" id="unlock-signout">別のアカウントでログインし直す</button>
    </div>`;

  const pinInput = app.querySelector('#unlock-pin');
  pinInput.focus();

  async function tryUnlock() {
    const pin = pinInput.value.trim();
    if (!validPin(pin)) { toast('4桁の数字を入力してください'); return; }
    const hash = await hashPin(pin);
    if (hash === localStorage.getItem('pa-lock-hash')) {
      sessionStorage.setItem('pa-unlocked', '1');
      document.body.classList.remove('locked');
      onDone();
    } else {
      toast('PINが違います');
      pinInput.value = '';
      pinInput.focus();
    }
  }
  app.querySelector('#unlock-btn').addEventListener('click', tryUnlock);
  pinInput.addEventListener('keydown', e => { if (e.key === 'Enter') tryUnlock(); });
  pinInput.addEventListener('input', () => { if (pinInput.value.length === 4) tryUnlock(); });

  app.querySelector('#unlock-signout').addEventListener('click', async () => {
    if (!confirm('ログアウトして別のアカウントでログインしますか?\n(この端末の未同期データは残ります)')) return;
    try { await signOutAccount(); } catch { /* オフラインでも続行 */ }
    localStorage.removeItem('pa-lock-hash');
    localStorage.removeItem('pa-lock-on');
    document.body.classList.remove('locked');
    onDone();
  });
}

// ---- ログイン / 新規アカウント作成 ----
export function renderLogin(app, onDone) {
  document.body.classList.add('locked');
  let mode = 'signin'; // signin | signup

  function draw() {
    app.innerHTML = `
      <div class="login-wrap">
        <div class="login-brand">Palate Atlas</div>
        <div class="login-sub">テイスティングノート &amp; フレーバートレーニング</div>
        <div class="login-tabs">
          <button class="${mode === 'signin' ? 'active' : ''}" data-mode="signin">ログイン</button>
          <button class="${mode === 'signup' ? 'active' : ''}" data-mode="signup">新規アカウント作成</button>
        </div>
        <div class="login-card card">
          <label class="field"><span>アカウントID(半角英数字とハイフン、3〜20文字)</span>
            <input type="text" id="login-id" autocapitalize="off" autocomplete="username"
              placeholder="例: akira-tasting" value="${escapeHtml(localStorage.getItem('pa-account-id') || '')}">
          </label>
          <label class="field"><span>4桁のPIN${mode === 'signup' ? '(忘れないものを設定)' : ''}</span>${pinField('login-pin')}</label>
          ${mode === 'signup' ? `<label class="field"><span>PINをもう一度入力</span>${pinField('login-pin2')}</label>` : ''}
          <button class="btn block" id="login-btn">${mode === 'signin' ? 'ログイン' : 'アカウントを作成'}</button>
          <p class="login-note">${mode === 'signin'
            ? '同じアカウントIDとPINでログインすれば、PC・スマホどちらでも同じノートが使えます。'
            : 'アカウントを作成すると、この端末のノートが自動でアカウントに紐づき、他の端末からも同じデータベースを利用できます。'}</p>
        </div>
        <button class="login-link" id="local-only">アカウントを使わず、この端末だけで使う</button>
      </div>`;

    app.querySelectorAll('.login-tabs button').forEach(b => {
      b.addEventListener('click', () => { mode = b.dataset.mode; draw(); });
    });

    const idInput = app.querySelector('#login-id');
    const pinInput = app.querySelector('#login-pin');
    const btn = app.querySelector('#login-btn');

    async function submit() {
      const id = idInput.value.trim().toLowerCase();
      const pin = pinInput.value.trim();
      if (!validAccountId(id)) { toast('アカウントIDは半角英数字とハイフン3〜20文字で入力してください', 3500); return; }
      if (!validPin(pin)) { toast('PINは4桁の数字で入力してください'); return; }
      if (mode === 'signup') {
        const pin2 = app.querySelector('#login-pin2').value.trim();
        if (pin !== pin2) { toast('PINが一致しません'); return; }
      }
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> ' + (mode === 'signin' ? 'ログイン中…' : '作成中…(初回同期を含みます)');
      try {
        if (mode === 'signin') await signIn(id, pin);
        else await signUp(id, pin);
        // 起動時PINロックを有効化
        localStorage.setItem('pa-lock-hash', await hashPin(pin));
        localStorage.setItem('pa-lock-on', '1');
        sessionStorage.setItem('pa-unlocked', '1');
        localStorage.removeItem('pa-local-only');
        document.body.classList.remove('locked');
        toast(mode === 'signin' ? 'ログインしました。同期済みです。' : 'アカウントを作成しました');
        onDone();
      } catch (err) {
        toast(err.message, 4500);
        btn.disabled = false;
        btn.textContent = mode === 'signin' ? 'ログイン' : 'アカウントを作成';
      }
    }
    btn.addEventListener('click', submit);
    app.querySelectorAll('#login-pin, #login-pin2, #login-id').forEach(el => {
      el.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
    });

    app.querySelector('#local-only').addEventListener('click', () => {
      localStorage.setItem('pa-local-only', '1');
      document.body.classList.remove('locked');
      onDone();
    });
  }
  draw();
}
