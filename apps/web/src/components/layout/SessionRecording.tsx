import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { markRecording, startRecording } from '@/lib/session-recorder';

/** Records the visit for replay in the admin, marking each page change. */
export function SessionRecording() {
  const { pathname } = useLocation();

  useEffect(() => {
    // After the page has settled, so recording never slows down the first view.
    const timer = setTimeout(() => void startRecording(), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    markRecording('page', { path: pathname });
  }, [pathname]);

  return null;
}
