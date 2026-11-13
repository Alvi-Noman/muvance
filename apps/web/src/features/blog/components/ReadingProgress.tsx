import { useEffect, useRef, type RefObject } from 'react';

/** A thin bar across the top of the screen that fills as you read the article. */
export function ReadingProgress({ target }: { target: RefObject<HTMLElement | null> }) {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = target.current;
      if (!el || !bar.current) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const done = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 1;
      bar.current.style.transform = `scaleX(${done})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [target]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-40 h-[3px]" aria-hidden>
      <div
        ref={bar}
        className="h-full origin-left bg-gradient-to-r from-emerald-500 to-neutral-950"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  );
}
