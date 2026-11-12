import { useEffect, useRef } from 'react';
import rrwebPlayer from 'rrweb-player';
import 'rrweb-player/dist/style.css';
import type { RecordingEvent } from './recordings-api';

/** Controls the parent uses, e.g. to jump to a moment. */
export type PlayerControls = { goto: (offsetMs: number) => void };

const META = 4;
/** Space the player's own controls take below the replay. */
const CONTROLLER_PX = 80;

/** Replays a recorded visit, scaled to fit the available width. */
export function ReplayPlayer({
  events,
  onReady,
}: {
  events: RecordingEvent[];
  onReady?: (controls: PlayerControls) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const onReadyRef = useRef(onReady);
  useEffect(() => {
    onReadyRef.current = onReady;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const meta = events.find((e) => e.type === META)?.data as
      { width: number; height: number } | undefined;
    const ratio = meta?.width ? meta.height / meta.width : 9 / 16;
    const size = () => {
      const width = el.clientWidth;
      const maxHeight = Math.max(240, window.innerHeight * 0.72 - CONTROLLER_PX);
      return { width, height: Math.round(Math.min(width * ratio, maxHeight)) };
    };

    const player = new rrwebPlayer({
      target: el,
      props: {
        // The recorder's events match rrweb's own type; they come back from the API as JSON.
        events: events as never,
        ...size(),
        autoPlay: true,
        skipInactive: true,
        showController: true,
        speedOption: [1, 2, 4, 8],
        mouseTail: { strokeStyle: '#5ce1ff', lineWidth: 2 },
        UNSAFE_replayCanvas: false,
      },
    });
    // Svelte's own methods; the package ships Svelte bundled, without its type definitions.
    const component = player as unknown as {
      $set: (props: { width: number; height: number }) => void;
      $destroy: () => void;
    };
    onReadyRef.current?.({ goto: (offset) => player.goto(offset, true) });

    const resize = new ResizeObserver(() => {
      component.$set(size());
      player.triggerResize();
    });
    resize.observe(el);
    return () => {
      resize.disconnect();
      component.$destroy();
    };
  }, [events]);

  // Dark text on purpose: the player has its own light styling, unlike the admin around it.
  return (
    <div
      ref={ref}
      className="replay w-full overflow-hidden rounded-xl bg-white"
      style={{ color: '#1f2937', colorScheme: 'light' }}
    />
  );
}
