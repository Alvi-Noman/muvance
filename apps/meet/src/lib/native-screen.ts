import { Capacitor, registerPlugin, type PluginListenerHandle } from '@capacitor/core';

/** Presenting the phone's screen, which only the Android app can do (apps/meet-app). */
interface ScreenSharePlugin {
  start(options: { url: string; token: string }): Promise<void>;
  stop(): Promise<void>;
  /** The presentation ended outside the page: the notification, the system, or the connection. */
  addListener(event: 'stopped', listener: () => void): Promise<PluginListenerHandle>;
}

/** The app's screen presenting, or null in a browser. */
export const nativeScreen =
  Capacitor.isNativePlatform() && Capacitor.isPluginAvailable('ScreenShare')
    ? registerPlugin<ScreenSharePlugin>('ScreenShare')
    : null;

/** A phone browser that can't present, where the app can. */
export const isAndroidBrowser =
  !nativeScreen && typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);

export const APP_DOWNLOAD_URL = '/downloads/muvance-meet.apk';

/** Error codes the app rejects with. */
export function nativeErrorCode(error: unknown) {
  return (error as { code?: string } | null)?.code;
}
