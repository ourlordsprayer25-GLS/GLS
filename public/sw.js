// GLADYNS Unified Service Worker for Storefront & Admin PWA
const CACHE_NAME = 'gladyns-pwa-v1';
const CORE_ASSETS = [
  '/',
  '/admin',
  '/manifest-store.webmanifest',
  '/manifest-admin.webmanifest',
  '/favicon.ico',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/assets/logo-icon.png'
];

// Install event — cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

// Activate event — cleanup stale caches & claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event — network first with cache fallback
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Bypass API and dynamic websocket requests
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/events') || url.pathname.startsWith('/@vite')) {
    return;
  }

  // Handle GET requests
  if (event.request.method === 'GET') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If valid response, clone and cache static assets
          if (response.status === 200 && (
            url.pathname.endsWith('.png') ||
            url.pathname.endsWith('.woff2') ||
            url.pathname.endsWith('.ico') ||
            url.pathname.includes('manifest')
          )) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => {
            if (cached) return cached;
            // For navigation requests, fallback to offline index
            if (event.request.mode === 'navigate') {
              if (url.pathname.startsWith('/admin')) {
                return caches.match('/admin') || caches.match('/');
              }
              return caches.match('/');
            }
          });
        })
    );
  }
});

// Import push notifications service worker
try {
  importScripts('/sw-push.js');
} catch (e) {
  console.warn('[ServiceWorker] sw-push.js not loaded:', e);
}
