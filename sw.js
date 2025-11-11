// Basic service worker with app shell caching, dynamic caching for API, and push notification handling.
const CACHE_NAME = 'silva-app-shell-v1';
const RUNTIME_CACHE = 'silva-runtime-v1';
const APP_SHELL = [
  '/',
  '/index.html',
  '/src/styles/styles.css',
  '/src/public/silva.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Fetch: cache-first for app shell, network-first for API requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Simple heuristic: treat requests to /api/ or containing '/stories' as runtime/dynamic
  if (url.pathname.startsWith('/api') || url.pathname.includes('/stories')) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then(async (cache) => {
        try {
          const response = await fetch(request);
          if (response && response.status === 200) {
            cache.put(request, response.clone());
          }
          return response;
        } catch (err) {
          const cached = await cache.match(request);
          return cached || new Response('{"error":"offline"}', {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      })
    );
    return;
  }

  // Default: cache-first
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});

// Push event - show notification with data payload
self.addEventListener('push', (event) => {
  let data = { title: 'New notification', body: 'You have a new message', url: '/' };
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    data.body = event.data ? event.data.text() : data.body;
  }

  const options = {
    body: data.body,
    icon: data.icon || '/src/public/silva.png',
    badge: data.badge || '/src/public/silva.png',
    data: { url: data.url || '/' },
    actions: [
      { action: 'open', title: 'Open' }
    ]
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});\n// ===== FCM Integration (placeholder) =====
// Replace firebaseConfig values below with your Firebase project config if using compat import in SW.
importScripts('https://www.gstatic.com/firebasejs/10.14.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.0/firebase-messaging-compat.js');
try {
  firebase.initializeApp({
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  });
  const messaging = firebase.messaging();
  messaging.onBackgroundMessage(function(payload) {
    console.log('[sw] Received background message ', payload);
    const title = (payload && payload.notification && payload.notification.title) || 'Story Baru!';
    const options = {
      body: (payload && payload.notification && payload.notification.body) || 'Ada cerita baru, cek aplikasimu',
      icon: '/src/public/silva.png',
      data: { url: '/#/stories' }
    };
    self.registration.showNotification(title, options);
  });
} catch (e) {
  console.warn('FCM setup in SW failed (placeholder)', e);
}\n