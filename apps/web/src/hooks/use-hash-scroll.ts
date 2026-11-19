import { useEffect } from 'react';

/**
 * On first render, jumps to the section named in the address (e.g. /services#website-cro),
 * since lazily loaded pages render after the browser's own jump would have happened.
 */
export function useHashScroll() {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'instant' });
  }, []);
}
