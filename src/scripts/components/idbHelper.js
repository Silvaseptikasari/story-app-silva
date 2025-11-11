// Minimal IndexedDB helper without external libs
const DB_NAME = 'silva-db';
const DB_VERSION = 1;
const STORE_NAME = 'stories';

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (ev) => {
      const db = ev.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function addStoryLocal(story) {
  const db = await openDb();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const r = store.add(story);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

export async function getStoriesLocal() {
  const db = await openDb();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const r = store.getAll();
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

export async function deleteStoryLocal(id) {
  const db = await openDb();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const r = store.delete(id);
    r.onsuccess = () => res(true);
    r.onerror = () => rej(r.error);
  });
}