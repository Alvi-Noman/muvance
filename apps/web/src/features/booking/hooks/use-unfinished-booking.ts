import { useEffect, useRef } from 'react';
import { env } from '@/config/env';
import { currentRecordingIds } from '@/lib/session-recorder';

/** Same check as the form's phone field. */
const PHONE = /^\+?[\d\s\-().]{7,20}$/;
const SAVE_AFTER_MS = 1200;

/**
 * Saves what someone types into the booking form as they go (once the phone number looks
 * real), so the team can follow up if they never press Book. Booking takes them off the list.
 */
export function useUnfinishedBooking(slot: string | undefined, timeZone: string) {
  const id = useRef(typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : null);
  const pending = useRef<object | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const context = useRef({ slot, timeZone });
  useEffect(() => {
    context.current = { slot, timeZone };
  });

  const send = (leaving = false) => {
    clearTimeout(timer.current);
    const body = pending.current;
    pending.current = null;
    if (!body) return;
    void fetch(`${env.API_URL}/booking-drafts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: leaving,
    }).catch(() => {});
  };

  // Leaving the page, switching apps or closing the form: save straight away.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') send(true);
    };
    const onLeave = () => send(true);
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', onLeave);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', onLeave);
      send(true);
    };
  }, []);

  return {
    onChange(values: Record<string, string>) {
      if (!id.current || !PHONE.test(values.phone?.trim() ?? '')) return;
      pending.current = {
        ...values,
        id: id.current,
        startsAt: context.current.slot,
        timeZone: context.current.timeZone,
        ...currentRecordingIds(),
      };
      clearTimeout(timer.current);
      timer.current = setTimeout(() => send(), SAVE_AFTER_MS);
    },
    /** They pressed Book: nothing left to save. */
    cancel() {
      clearTimeout(timer.current);
      pending.current = null;
    },
  };
}
