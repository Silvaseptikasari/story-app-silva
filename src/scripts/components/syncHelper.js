import { showToast } from './toast.js';
// src/scripts/components/syncHelper.js
import { getStoriesLocal, deleteStoryLocal } from "./idbHelper.js";

const API_BASE = "https://story-api.dicoding.dev/v1";

async function sendStoryToServer(story) {
  try {
    // If story.photo is a dataURL, convert to Blob and use FormData (server expects multipart/form-data)
    let headers = {};
    let body;
    if (story.photo && story.photo.startsWith('data:')) {
      // Convert dataURL to blob
      const res = await fetch(story.photo);
      const blob = await res.blob();
      const form = new FormData();
      form.append('photo', blob, story.photoName || 'photo.png');
      form.append('description', story.description || story.title || '');
      if (story.lat) form.append('lat', story.lat);
      if (story.lon) form.append('lon', story.lon);
      body = form;
      // don't set Content-Type header for FormData
    } else {
      // Send JSON body (server may reject if expects multipart)
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify({
        description: story.description || story.title || '',
        lat: story.lat,
        lon: story.lon
      });
    }

    const token = localStorage.getItem('token') || ''; // if project stores token as localStorage token
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const resp = await fetch(`${API_BASE}/stories`, {
      method: 'POST',
      headers,
      body
    });
    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`Server responded ${resp.status}: ${txt}`);
    }
    return await resp.json();
  } catch (err) {
    console.warn('sendStoryToServer failed', err);
    throw err;
  }
}

export async function syncLocalStories(progressCb) {
  const local = await getStoriesLocal();
  const results = [];
  for (const item of local) {
    try {
      if (progressCb) progressCb(item);
      await sendStoryToServer(item);
      // assume item has id (indexeddb key); if not, try using item._id
      const id = item.id || item._id || item.localId;
      if (id) await deleteStoryLocal(id);
      results.push({ item, status: 'synced' });
      try { showToast('Story berhasil disinkronkan', 'success'); } catch(e) { console.error(e); }
    } catch (e) {
      results.push({ item, status: 'failed', error: String(e) });
      try { showToast('Gagal menyinkronkan story', 'error'); } catch(e2) { console.error(e2); }
    }
  }
  return results;
}