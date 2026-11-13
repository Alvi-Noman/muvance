import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { BlogPost } from '../types';

/** The reading line: a chapter is "current" once its heading passes this point. */
const READING_LINE = 0.3;

/**
 * Tracks which chapter is being read. It looks the chapters up on every scroll, so it works
 * even though the article text loads a moment after the page (and the table of contents).
 */
function useActiveSection(toc: BlogPost['toc']) {
  const [active, setActive] = useState(toc[0]?.id ?? '');
  // While a click-triggered smooth scroll runs, keep the clicked chapter highlighted.
  const lockUntil = useRef(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      if (performance.now() < lockUntil.current) return;
      const line = window.innerHeight * READING_LINE;
      let current = toc[0]?.id ?? '';
      for (const { id } of toc) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      // At the very bottom of the page, the last chapter is the one being read.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = toc[toc.length - 1]?.id ?? current;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [toc]);

  const select = (id: string) => {
    lockUntil.current = performance.now() + 900;
    setActive(id);
    jump(id);
  };

  return { active, select };
}

function jump(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  window.history.replaceState(window.history.state, '', `#${id}`);
}

/** Sticky chapter list for wide screens. */
export function TableOfContents({ toc }: { toc: BlogPost['toc'] }) {
  const { active, select } = useActiveSection(toc);
  const listRef = useRef<HTMLOListElement>(null);
  const [marker, setMarker] = useState({ top: 0, height: 0 });

  // Size the moving marker to the active link, whatever its height (long labels wrap).
  useLayoutEffect(() => {
    const link = listRef.current?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    if (link) setMarker({ top: link.offsetTop, height: link.offsetHeight });
  }, [active]);

  return (
    <nav aria-label="Contents" className="text-sm">
      <p className="text-xs font-medium tracking-[0.14em] text-neutral-500 uppercase">
        In this article
      </p>
      <ol ref={listRef} className="relative mt-4 border-l border-black/10">
        <span
          className="absolute -left-px w-0.5 rounded-full bg-neutral-950 transition-all duration-300"
          style={{ top: marker.top, height: marker.height }}
          aria-hidden
        />
        {toc.map((item, i) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              data-id={item.id}
              onClick={(e) => {
                e.preventDefault();
                select(item.id);
              }}
              aria-current={active === item.id ? 'location' : undefined}
              className={cn(
                'flex gap-3 rounded-r-lg py-1.5 pl-4 leading-snug transition-colors focus-visible:bg-black/5 focus-visible:outline-none',
                active === item.id ? 'text-neutral-950' : 'text-neutral-500 hover:text-neutral-800',
              )}
            >
              <span className="w-5 shrink-0 font-mono text-xs tabular-nums opacity-60">
                {String(i + 1).padStart(2, '0')}
              </span>
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Collapsible chapter list for phones, shown above the article. */
export function MobileContents({ toc }: { toc: BlogPost['toc'] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-3xl border border-white/80 bg-white/70 shadow-[0_24px_60px_-32px_rgba(0,0,0,0.25)] backdrop-blur lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-5 py-4 text-sm font-medium"
      >
        In this article · {toc.length} chapters
        <ChevronDown
          className={cn('size-4 transition-transform', open && 'rotate-180')}
          aria-hidden
        />
      </button>
      {open && (
        <ol className="px-5 pb-4 text-sm">
          {toc.map((item, i) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  setOpen(false);
                  // Wait a frame so the list has collapsed before measuring the scroll target.
                  requestAnimationFrame(() => jump(item.id));
                }}
                className="flex gap-3 py-2 text-neutral-600"
              >
                <span className="w-5 shrink-0 font-mono text-xs opacity-60">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {item.label}
              </a>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
