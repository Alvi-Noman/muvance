import { useEffect, useSyncExternalStore } from 'react';
import { api } from './api';

/**
 * Push notifications: new messages reach this device even when Muvance Chat is closed (in the
 * browser, the installed app on a phone or computer, and the Android app).
 */

export type PushState = 'unsupported' | 'denied' | 'off' | 'on';

let state: PushState = 'off';
const listeners = new Set<() => void>();
function set(next: PushState) {
  state = next;
  try {
    localStorage.setItem('muvance-chat:push', next);
  } catch {
    // Private mode.
  }
  listeners.forEach((l) => l());
}

export const pushSupported = () =>
  'serviceWorker' in navigator && 'PushManager' in window && typeof Notification !== 'undefined';

/** Whether this device is set to get push notifications (so the page needn't show its own). */
export const pushActive = () => state === 'on';

export function usePushState() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
  );
}

function registration() {
  return navigator.serviceWorker.register('/sw.js');
}

function keyBytes(base64url: string) {
  const padded = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

async function subscribe(pushKey: string) {
  const reg = await registration();
  await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  // A subscription made with another key (e.g. a reset server) can't be used.
  const current = sub?.options.applicationServerKey;
  if (sub && current) {
    const a = new Uint8Array(current);
    const b = keyBytes(pushKey);
    if (a.length !== b.length || a.some((v, i) => v !== b[i])) {
      await sub.unsubscribe();
      sub = null;
    }
  }
  sub ??= await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: keyBytes(pushKey),
  });
  const json = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
  await api.post('/push/subscribe', { endpoint: json.endpoint, keys: json.keys });
}

/** Asks for permission (if needed) and turns push on for this device. */
export async function enablePush(pushKey: string | null) {
  if (!pushSupported() || !pushKey) return set('unsupported');
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return set(permission === 'denied' ? 'denied' : 'off');
  await subscribe(pushKey);
  set('on');
}

export async function disablePush() {
  if (!pushSupported()) return;
  const reg = await navigator.serviceWorker.getRegistration('/');
  const sub = await reg?.pushManager.getSubscription();
  if (sub) {
    await api.post('/push/unsubscribe', { endpoint: sub.endpoint }).catch(() => {});
    await sub.unsubscribe().catch(() => {});
  }
  set('off');
}

/** Called when signing out: this device stops getting this person's messages. */
export async function stopPushForSignOut() {
  try {
    await disablePush();
  } catch {
    // Signing out goes ahead anyway.
  }
}

/**
 * Keeps push in step when the app opens: re-registers this device for whoever is signed in, and
 * turns it on by itself when notifications were already allowed (unless turned off here).
 */
export function usePushSetup(pushKey: string | null, onOpen: (url: string) => void) {
  useEffect(() => {
    if (!pushSupported()) {
      set('unsupported');
      return;
    }
    void registration().catch(() => {});
    let choice: string | null = null;
    try {
      choice = localStorage.getItem('muvance-chat:push');
    } catch {
      // Private mode.
    }
    if (Notification.permission === 'denied') set('denied');
    else if (Notification.permission === 'granted' && pushKey && choice !== 'off') {
      subscribe(pushKey)
        .then(() => set('on'))
        .catch(() => set('off'));
    } else set('off');
  }, [pushKey]);

  // Notification taps, passed on by the service worker.
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const onMessage = (e: MessageEvent<{ type?: string; url?: string }>) => {
      if (e.data?.type === 'open' && e.data.url) onOpen(e.data.url);
    };
    navigator.serviceWorker.addEventListener('message', onMessage);
    return () => navigator.serviceWorker.removeEventListener('message', onMessage);
  }, [onOpen]);
}
