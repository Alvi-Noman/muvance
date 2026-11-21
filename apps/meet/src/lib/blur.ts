import type { LocalVideoTrack } from 'livekit-client';
import type { BlurLevel } from './prefs';

const radius: Record<Exclude<BlurLevel, 'off'>, number> = { light: 6, strong: 18 };

/** The blur library is large (it runs a small AI model), so it only loads when someone uses it. */
const load = () => import('@livekit/track-processors');

export async function blurSupported() {
  try {
    const { supportsBackgroundProcessors } = await load();
    return supportsBackgroundProcessors();
  } catch {
    return false;
  }
}

/** Blurs (or un-blurs) the background behind the person on a camera track. */
export async function applyBlur(track: LocalVideoTrack, level: BlurLevel) {
  const { BackgroundProcessor, supportsBackgroundProcessors } = await load();
  if (!supportsBackgroundProcessors()) return;
  const current = track.getProcessor() as
    | {
        switchTo?: (
          o: { mode: 'background-blur'; blurRadius: number } | { mode: 'disabled' },
        ) => Promise<void>;
      }
    | undefined;

  if (level === 'off') {
    if (current) await track.stopProcessor();
    return;
  }
  if (current?.switchTo) {
    await current.switchTo({ mode: 'background-blur', blurRadius: radius[level] });
  } else {
    await track.setProcessor(
      BackgroundProcessor({ mode: 'background-blur', blurRadius: radius[level] }),
    );
  }
}
