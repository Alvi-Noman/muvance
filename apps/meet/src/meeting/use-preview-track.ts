import { useEffect, useState } from 'react';
import {
  createLocalAudioTrack,
  createLocalVideoTrack,
  type LocalAudioTrack,
  type LocalVideoTrack,
  VideoPresets,
} from 'livekit-client';

type Kind = 'videoinput' | 'audioinput';
type TrackFor<K extends Kind> = K extends 'videoinput' ? LocalVideoTrack : LocalAudioTrack;

/**
 * The lobby's camera or microphone preview. The device is released as soon as it's turned off,
 * switched, or the lobby closes (on joining, the call opens its own).
 */
export function usePreviewTrack<K extends Kind>(kind: K, enabled: boolean, deviceId: string) {
  const key = `${kind}:${deviceId}`;
  const [state, setState] = useState<{
    key: string;
    track: TrackFor<K> | null;
    error: Error | null;
  }>({ key: '', track: null, error: null });

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let created: LocalVideoTrack | LocalAudioTrack | undefined;
    const id = deviceId || undefined;
    const make =
      kind === 'videoinput'
        ? createLocalVideoTrack({ deviceId: id, resolution: VideoPresets.h720.resolution })
        : createLocalAudioTrack({
            deviceId: id,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          });
    make
      .then((track) => {
        if (cancelled) {
          track.stop();
          return;
        }
        created = track;
        setState({ key, track: track as TrackFor<K>, error: null });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            key,
            track: null,
            error: error instanceof Error ? error : new Error(String(error)),
          });
        }
      });
    return () => {
      cancelled = true;
      created?.stop();
    };
  }, [kind, enabled, deviceId, key]);

  const current = enabled && state.key === key;
  return {
    track: current ? state.track : null,
    error: current ? state.error : null,
  };
}
