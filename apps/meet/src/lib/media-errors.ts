/** Says why the camera or microphone couldn't start, in words people can act on. */
export function mediaErrorMessage(error: unknown, what: 'camera' | 'microphone') {
  const e = error instanceof Error ? error : new Error(String(error));
  const isWindows = typeof navigator !== 'undefined' && /windows/i.test(navigator.userAgent);
  const isMac = typeof navigator !== 'undefined' && /mac/i.test(navigator.platform);

  if (e.name === 'NotAllowedError' || e.name === 'SecurityError') {
    // Chrome says "Permission denied by system" when Windows or macOS blocks the browser.
    if (/system/i.test(e.message)) {
      if (isWindows) {
        return `Windows is blocking your ${what}. Open Settings → Privacy & security → ${what === 'camera' ? 'Camera' : 'Microphone'}, turn on access, including "Let desktop apps access your ${what}", then reload this page.`;
      }
      if (isMac) {
        return `macOS is blocking your ${what}. Open System Settings → Privacy & Security → ${what === 'camera' ? 'Camera' : 'Microphone'}, allow your browser, then reload this page.`;
      }
      return `Your computer is blocking the browser from using your ${what}. Allow it in your system's privacy settings, then reload.`;
    }
    return `Your browser is blocking the ${what} for this site. Click the icon left of the address (a lock or sliders), set ${what === 'camera' ? 'Camera' : 'Microphone'} to Allow, then reload the page.`;
  }
  if (e.name === 'NotFoundError' || e.name === 'OverconstrainedError') {
    return `No ${what} found. Plug one in (or a headset), then try again.`;
  }
  if (e.name === 'NotReadableError' || e.name === 'AbortError') {
    return `Your ${what} is being used by another app (Zoom, Teams, another tab…). Close it and try again.`;
  }
  return `Couldn't start your ${what} (${e.name || 'error'}: ${e.message}).`;
}

/** A saved device that's gone (unplugged, or ids changed) fails; then the default one is used. */
export function isMissingDevice(error: unknown) {
  const name = (error as Error | undefined)?.name;
  return name === 'OverconstrainedError' || name === 'NotFoundError';
}
