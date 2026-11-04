import { useEffect, useRef, useState } from 'react';

/**
 * Returns `inView: true` once the element has scrolled into the viewport (it stays true).
 * Elements already scrolled past (e.g. after jumping to an anchor further down) also count
 * as seen, so they're never left hidden when the visitor scrolls back up.
 */
export function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const reveal = () => {
      setInView(true);
      observer.disconnect();
      window.removeEventListener('hashchange', checkPassed);
    };
    const checkPassed = () => {
      if (el.getBoundingClientRect().top < window.innerHeight) reveal();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry && (entry.isIntersecting || entry.boundingClientRect.top < 0)) reveal();
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    observer.observe(el);
    // An instant anchor jump can skip straight past an element without it ever intersecting.
    window.addEventListener('hashchange', checkPassed);

    return () => {
      observer.disconnect();
      window.removeEventListener('hashchange', checkPassed);
    };
  }, []);

  return { ref, inView };
}
