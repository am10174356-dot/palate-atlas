// アカウント同期 — Firebase (Auth + Firestore) を同期サーバーとして使用
// FIREBASE_CONFIG が null の場合は完全にオフ(端末内保存のみ)
import { FIREBASE_CONFIG } from '../data/sync-config.js';
import { getAllNotes, putNote, deleteNote, dbEvents } from './db.js';

const SDK = 'https://www.gstatic.com/firebasejs/10.12.2';
const EMAIL_DOMAIN = 'palate-atlas-sync.app'; // アカウントIDを内部的にメール形式へ変換するためのダミードメイン

let fb = null;        // { auth, db, fs: firestoreモジュール }
let user = null;      // Firebaseユーザー
let syncing = false;
let lastFullSync = 0;

export function syncAvailable() {
  return !!FIREBASE_CONFIG;
}

export function currentAccount() {
  return user ? (localStorage.getItem('pa-account-id') || 'account') : null;
}

export function lastSyncTime() {
  const t = Number(localStorage.getItem('pa-last-sync'));
  return t ? new Date(t) : null;
}

function accountToEmail(id) {
  return `${id}@${EMAIL_DOMAIN}`;
}

function accountToPassword(id, pin) {
  return `PA!${pin}!${id}`;
}

export function validAccountId(id) {
  return /^[a-z0-9-]{3,20}$/.test(id);
}

export function validPin(pin) {
  return /^\d{4}$/.test(pin);
}

// Firestoreはundefinedを受け付けないため、素のJSONに正規化
function clean(obj) {
  return JSON.parse(JSON.stringify(obj));
}

async function loadFirebase() {
  if (fb) return fb;
  const [appMod, authMod, fsMod] = await Promise.all([
    import(`${SDK}/firebase-app.js`),
    import(`${SDK}/firebase-auth.js`),
    import(`${SDK}/firebase-firestore.js`),
  ]);
  const app = appMod.initializeApp(FIREBASE_CONFIG);
  fb = { auth: authMod.getAuth(app), db: fsMod.getFirestore(app), authMod, fs: fsMod };
  return fb;
}

// 起動時に呼ぶ。保持されているログインセッションを復元する。
export async function initSync() {
  if (!syncAvailable()) return null;
  const { auth, authMod } = await loadFirebase();
  user = await new Promise(resolve => {
    const unsub = authMod.onAuthStateChanged(auth, u => { unsub(); resolve(u); });
  });
  if (user) startAutoSync();
  return user;
}

function friendlyAuthError(err) {
  const code = err?.code || '';
  if (code.includes('email-already-in-use')) return 'このアカウントIDは既に使われています。別のIDにするか、ログインしてください。';
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) return 'アカウントIDまたはPINが違います。';
  if (code.includes('too-many-requests')) return '試行回数が多すぎます。しばらく待ってからお試しください。';
  if (code.includes('network-request-failed')) return '通信に失敗しました。ネットワーク接続を確認してください。';
  if (code.includes('api-key-not-valid') || code.includes('invalid-api-key')) return '同期サーバーの設定(data/sync-config.js)が正しくありません。設定値を確認してください。';
  return `エラー: ${err?.message || err}`;
}

export async function signUp(accountId, pin) {
  const { auth, authMod } = await loadFirebase();
  try {
    const cred = await authMod.createUserWithEmailAndPassword(auth, accountToEmail(accountId), accountToPassword(accountId, pin));
    user = cred.user;
  } catch (err) {
    throw new Error(friendlyAuthError(err));
  }
  localStorage.setItem('pa-account-id', accountId);
  await fullSync().catch(() => {});
  startAutoSync();
  return user;
}

export async function signIn(accountId, pin) {
  const { auth, authMod } = await loadFirebase();
  try {
    const cred = await authMod.signInWithEmailAndPassword(auth, accountToEmail(accountId), accountToPassword(accountId, pin));
    user = cred.user;
  } catch (err) {
    throw new Error(friendlyAuthError(err));
  }
  localStorage.setItem('pa-account-id', accountId);
  await fullSync().catch(() => {});
  startAutoSync();
  return user;
}

export async function signOutAccount() {
  if (!fb) await loadFirebase();
  await fb.authMod.signOut(fb.auth);
  user = null;
  localStorage.removeItem('pa-account-id');
  localStorage.removeItem('pa-lock-hash');
  localStorage.removeItem('pa-lock-on');
  sessionStorage.removeItem('pa-unlocked');
}

function noteDoc(id) {
  return fb.fs.doc(fb.db, 'users', user.uid, 'notes', id);
}

async function pushNote(note) {
  if (!user) return;
  try { await fb.fs.setDoc(noteDoc(note.id), clean(note)); } catch (e) { console.warn('sync push失敗', e); }
}

async function pushDelete(id) {
  if (!user) return;
  try { await fb.fs.setDoc(noteDoc(id), { id, deleted: true, updatedAt: Date.now() }); } catch (e) { console.warn('sync delete失敗', e); }
}

// 双方向マージ: updatedAt の新しい方を採用。削除はトゥームストーンで伝搬。
export async function fullSync() {
  if (!user || syncing) return false;
  syncing = true;
  try {
    const snap = await fb.fs.getDocs(fb.fs.collection(fb.db, 'users', user.uid, 'notes'));
    const remote = new Map();
    snap.forEach(d => remote.set(d.id, d.data()));
    const local = await getAllNotes();
    const localMap = new Map(local.map(n => [n.id, n]));
    const pushes = [];

    for (const [id, r] of remote) {
      const l = localMap.get(id);
      const rTime = r.updatedAt || 0;
      const lTime = l?.updatedAt || 0;
      if (r.deleted) {
        if (l && lTime <= rTime) await deleteNote(id, { silent: true });
        else if (l) pushes.push(l); // ローカルの方が新しい → 復活させる
      } else if (!l || rTime > lTime) {
        await putNote(r, { silent: true });
      } else if (lTime > rTime) {
        pushes.push(l);
      }
    }
    for (const l of local) {
      if (!remote.has(l.id)) pushes.push(l);
    }
    for (const n of pushes) await fb.fs.setDoc(noteDoc(n.id), clean(n));

    lastFullSync = Date.now();
    localStorage.setItem('pa-last-sync', String(lastFullSync));
    return true;
  } finally {
    syncing = false;
  }
}

let autoStarted = false;
function startAutoSync() {
  if (autoStarted || !user) return;
  autoStarted = true;
  // ローカル変更を即時プッシュ
  dbEvents.addEventListener('note-put', e => pushNote(e.detail));
  dbEvents.addEventListener('note-delete', e => pushDelete(e.detail));
  // アプリに戻ってきた時・オンライン復帰時に取り込み(60秒スロットル)
  const maybeSync = () => {
    if (Date.now() - lastFullSync > 60_000) fullSync().catch(() => {});
  };
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') maybeSync();
  });
  window.addEventListener('online', maybeSync);
}
