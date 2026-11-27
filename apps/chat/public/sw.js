/* Muvance Chat's service worker: push notifications, and "Share to Muvance Chat" from the phone. */
/* global self, URL, caches, Response */

const SHARE_CACHE = 'muvance-share';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

/** A new message. Skipped when you're already looking at that conversation. */
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: 'Muvance Chat', body: event.data ? event.data.text() : '' };
  }
  event.waitUntil(
    (async () => {
      const url = data.spaceId ? `/c/${data.spaceId}` : '/';
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      const watching = windows.some(
        (c) => c.focused && c.visibilityState === 'visible' && new URL(c.url).pathname === url,
      );
      if (watching) return;
      await self.registration.showNotification(data.title || 'Muvance Chat', {
        body: data.body || '',
        tag: data.tag || undefined,
        renotify: Boolean(data.tag),
        icon: data.icon || '/icons/icon-192.png',
        badge: '/icons/badge-96.png',
        timestamp: Date.now(),
        data: { url },
      });
      if ('setAppBadge' in self.navigator) self.navigator.setAppBadge().catch(() => {});
    })(),
  );
});

/** Opens the conversation: in a Muvance Chat window that's already open, if there is one. */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      const open = windows.find((c) => new URL(c.url).origin === self.location.origin);
      if (open) {
        await open.focus();
        open.postMessage({ type: 'open', url });
        return;
      }
      await self.clients.openWindow(url);
    })(),
  );
});

/** Things shared from other apps (photos, files, links) wait here until the app picks them up. */
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'POST' || url.pathname !== '/share') return;
  event.respondWith(
    (async () => {
      try {
        const form = await event.request.formData();
        const cache = await caches.open(SHARE_CACHE);
        for (const key of await cache.keys()) await cache.delete(key);
        const files = form.getAll('files').filter((f) => typeof f !== 'string');
        const text = [form.get('title'), form.get('text'), form.get('url')]
          .filter((v) => typeof v === 'string' && v.trim())
          .join('\n');
        const meta = { text, files: [] };
        for (let i = 0; i < files.length && i < 10; i++) {
          const f = files[i];
          meta.files.push({ key: `/shared/${i}`, name: f.name, type: f.type });
          await cache.put(
            `/shared/${i}`,
            new Response(f, { headers: { 'Content-Type': f.type || 'application/octet-stream' } }),
          );
        }
        await cache.put('/shared/meta', new Response(JSON.stringify(meta)));
      } catch {
        // Nothing usable was shared: just open the app.
      }
      return Response.redirect('/?shared=1', 303);
    })(),
  );
});
