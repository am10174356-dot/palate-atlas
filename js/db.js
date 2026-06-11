// IndexedDB ラッパ — notes / settings の2ストア
const DB_NAME = 'palate-atlas';
const DB_VER = 1;

let _db = null;

function openDB() {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('notes')) {
        const store = db.createObjectStore('notes', { keyPath: 'id' });
        store.createIndex('category', 'category', { unique: false });
        store.createIndex('date', 'date', { unique: false });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };
    req.onsuccess = () => { _db = req.result; resolve(_db); };
    req.onerror = () => reject(req.error);
  });
}

function tx(storeName, mode, fn) {
  return openDB().then(db => new Promise((resolve, reject) => {
    const t = db.transaction(storeName, mode);
    const store = t.objectStore(storeName);
    const result = fn(store);
    t.oncomplete = () => resolve(result && 'result' in result ? result.result : undefined);
    t.onerror = () => reject(t.error);
  }));
}

export function uid() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

// 同期モジュールがローカル変更を検知するためのイベントバス
// 'note-put' (detail: note) / 'note-delete' (detail: id)
export const dbEvents = new EventTarget();

export async function getAllNotes() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction('notes').objectStore('notes').getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function getNotesByCategory(category) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction('notes').objectStore('notes').index('category').getAll(category);
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function getNote(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction('notes').objectStore('notes').get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

// silent: true は同期処理からの書き込み(イベントを発火させない)
export async function putNote(note, { silent = false } = {}) {
  await tx('notes', 'readwrite', store => store.put(note));
  if (!silent) dbEvents.dispatchEvent(new CustomEvent('note-put', { detail: note }));
}

export async function deleteNote(id, { silent = false } = {}) {
  await tx('notes', 'readwrite', store => store.delete(id));
  if (!silent) dbEvents.dispatchEvent(new CustomEvent('note-delete', { detail: id }));
}

export async function getSetting(key, fallback = null) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction('settings').objectStore('settings').get(key);
    req.onsuccess = () => resolve(req.result ? req.result.value : fallback);
    req.onerror = () => reject(req.error);
  });
}

export function setSetting(key, value) {
  return tx('settings', 'readwrite', store => store.put({ key, value }));
}
