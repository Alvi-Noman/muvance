import { useLayoutEffect, useRef, useState } from 'react';

type Size = { width: number | 'auto'; height: number | 'auto' };

/** Tracks an element's rendered size, so a wrapper can animate to it. */
export function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState<Size>({ width: 'auto', height: 'auto' });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const box = entry?.borderBoxSize[0];
      setSize({
        width: box?.inlineSize ?? el.offsetWidth,
        height: box?.blockSize ?? el.offsetHeight,
      });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, ...size };
}
