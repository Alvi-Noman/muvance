import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { trackEvent } from '@/lib/meta-pixel';

/**
 * Sends a Meta PageView on the first load and whenever the page changes. Jumping to a section
 * of the same page (/#faq) isn't a new page view.
 */
export function MetaPageViews() {
  const { pathname } = useLocation();
  const lastPath = useRef<string>(undefined);

  useEffect(() => {
    // Once per page (StrictMode runs effects twice in development).
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    trackEvent('PageView');
    if (pathname === '/book') trackEvent('ViewContent');
  }, [pathname]);

  return null;
}
