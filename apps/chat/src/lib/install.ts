import { useSyncExternalStore } from 'react';

/** "Install Muvance Chat" as an app (Chrome and Edge on computers and Android). */

interface InstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: InstallPrompt | null = null;
const listeners = new Set<() => void>();
const changed = () => listeners.forEach((l) => l());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as InstallPrompt;
    changed();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    changed();
  });
}

/** Running as the installed app, or inside the Android app. */
export const isInstalled = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true ||
  document.referrer.startsWith('android-app://');

export const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
export const isAndroid = () => /android/i.test(navigator.userAgent);

export function useCanInstall() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => deferred !== null,
  );
}

export async function install() {
  if (!deferred) return false;
  await deferred.prompt();
  const { outcome } = await deferred.userChoice;
  deferred = null;
  changed();
  return outcome === 'accepted';
}

/** The Android app's download. */
export const ANDROID_APP_URL = '/downloads/muvance-chat.apk';
