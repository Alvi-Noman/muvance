import { useLayoutEffect, useRef, useState } from 'react';
import {
  isTrackReference,
  useTracks,
  type TrackReferenceOrPlaceholder,
} from '@livekit/components-react';
import { RoomEvent, Track } from 'livekit-client';
import { cn } from '@/lib/cn';
import { trackKey, useCall } from './call-context';
import { Tile } from './Tile';

const GAP = 8;

/** Picks the column count that makes 16:9 tiles as big as possible in the space, like Meet. */
function gridSize(count: number, width: number, height: number) {
  let best = { cols: 1, w: 0, h: 0 };
  for (let cols = 1; cols <= count; cols++) {
    const rows = Math.ceil(count / cols);
    const maxW = (width - GAP * (cols - 1)) / cols;
    const maxH = (height - GAP * (rows - 1)) / rows;
    const w = Math.min(maxW, (maxH * 16) / 9);
    if (w > best.w) best = { cols, w, h: (w * 9) / 16 };
  }
  return best;
}

function useSize() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, ...size };
}

function keyOf(ref: TrackReferenceOrPlaceholder) {
  return trackKey(ref.participant.identity, ref.source);
}

export function Stage() {
  const { prefs, pinned } = useCall();
  const { ref, width, height } = useSize();

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    {
      onlySubscribed: false,
      updateOnlyOn: [
        RoomEvent.ParticipantConnected,
        RoomEvent.ParticipantDisconnected,
        RoomEvent.TrackPublished,
        RoomEvent.TrackUnpublished,
        RoomEvent.LocalTrackPublished,
        RoomEvent.LocalTrackUnpublished,
        RoomEvent.TrackSubscribed,
        RoomEvent.TrackUnsubscribed,
        RoomEvent.ActiveSpeakersChanged,
      ],
    },
  );

  // Cameras: others first in the order they joined, you last (as Meet does).
  const cameras = tracks
    .filter((t) => t.source === Track.Source.Camera)
    .sort((a, b) => {
      if (a.participant.isLocal !== b.participant.isLocal) return a.participant.isLocal ? 1 : -1;
      return (a.participant.joinedAt?.getTime() ?? 0) - (b.participant.joinedAt?.getTime() ?? 0);
    });
  const screens = tracks.filter(
    (t) => t.source === Track.Source.ScreenShare && isTrackReference(t),
  );
  const alone = cameras.length <= 1;
  const visibleCameras =
    prefs.hideSelf && !alone ? cameras.filter((t) => !t.participant.isLocal) : cameras;

  // Who's shown large: whoever is pinned, otherwise a presentation (someone else's first).
  const all = [...screens, ...cameras];
  const focus =
    (pinned && all.find((t) => keyOf(t) === pinned)) ||
    screens.find((t) => !t.participant.isLocal) ||
    screens[0] ||
    null;

  if (focus) {
    const others = [...screens, ...visibleCameras].filter((t) => keyOf(t) !== keyOf(focus));
    return (
      <div className="flex min-w-0 flex-1 flex-col gap-2 lg:flex-row">
        <div className="relative min-h-0 flex-1">
          <Tile trackRef={focus} large className="absolute inset-0" />
        </div>
        {others.length > 0 && (
          <div className="flex shrink-0 gap-2 overflow-x-auto lg:w-64 lg:flex-col lg:overflow-x-visible lg:overflow-y-auto">
            {others.map((t) => (
              <Tile
                key={keyOf(t)}
                trackRef={t}
                small
                className="aspect-video h-24 shrink-0 sm:h-32 lg:h-auto lg:w-full"
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Two people: the other person fills the screen, you're a small picture in the corner.
  const remote = cameras.filter((t) => !t.participant.isLocal);
  const local = cameras.find((t) => t.participant.isLocal);
  if (remote.length === 1 && local && remote[0]) {
    return (
      <div className="relative min-w-0 flex-1">
        <Tile trackRef={remote[0]} large className="absolute inset-0" />
        {!prefs.hideSelf && (
          <Tile
            trackRef={local}
            small
            className="absolute right-3 bottom-3 z-10 aspect-video w-32 shadow-2xl shadow-black/50 ring-1 ring-white/10 sm:w-56"
          />
        )}
      </div>
    );
  }

  const grid = gridSize(Math.max(visibleCameras.length, 1), width, height);
  return (
    <div ref={ref} className="relative min-w-0 flex-1">
      <div
        className="absolute inset-0 flex flex-wrap content-center items-center justify-center"
        style={{ gap: GAP }}
      >
        {width > 0 &&
          visibleCameras.map((t) => (
            <Tile
              key={keyOf(t)}
              trackRef={t}
              large={visibleCameras.length === 1}
              className={cn('shrink-0')}
              style={{ width: grid.w, height: grid.h }}
            />
          ))}
      </div>
    </div>
  );
}
