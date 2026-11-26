type LockableOrientation = ScreenOrientation & { lock?: (o: 'landscape') => Promise<void> };
type IosVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void };

/** Shows an element full screen, turned sideways on phones that allow it. */
export function enterFullscreen(el: HTMLElement | null) {
  if (!el) return;
  if (document.fullscreenEnabled && el.requestFullscreen) {
    void el
      .requestFullscreen()
      .then(() => (screen.orientation as LockableOrientation | undefined)?.lock?.('landscape'))
      .catch(() => {});
    return;
  }
  // iPhones only allow a video itself to go full screen.
  (el.querySelector('video') as IosVideo | null)?.webkitEnterFullscreen?.();
}

export function exitFullscreen() {
  if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
}
