// GLADYNS Push Notification Service Worker Logic
// Handles background push events and notification clicks (Imported into main PWA SW)

// Handle push events from server (Web Push API)
self.addEventListener('push', (event) => {
  let data = { title: 'GLADYNS', body: 'You have a new notification.', icon: '/pwa-192x192.png', tag: 'gladyns' };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch (e) {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: data.tag || 'gladyns',
      vibrate: [200, 100, 200],
      requireInteraction: false,
      data: data,
    })
  );
});

// Handle notification clicks — open the app and navigate to orders page
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/#orders';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If the app is already open, focus it and navigate
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          if ('navigate' in client) {
            return client.navigate(targetUrl);
          }
          return;
        }
      }
      // Otherwise open a new window directly to targetUrl
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
