import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { cn } from '@/lib/cn';

const clock = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Dhaka',
  weekday: 'short',
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

/** Ticks on its own, so the rest of the page doesn't re-render every second. */
function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular-nums">{clock.format(now).replace(',', '')} DHAKA</span>;
}

/** The real connection to the API, checked every 30 seconds. */
export function ApiStatus() {
  const { isError, isPending } = useQuery({
    queryKey: ['health'],
    queryFn: () => api.get<{ status: string }>('/health'),
    refetchInterval: 30_000,
    retry: false,
  });
  const offline = isError;
  return (
    <span className={cn('flex items-center gap-2', offline ? 'text-red-600' : 'text-emerald-700')}>
      <span
        className={cn(
          'size-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]',
          !offline && 'hud-pulse',
        )}
      />
      {isPending ? 'Linking' : offline ? 'API offline' : 'API online'}
    </span>
  );
}

/** Thin readout above each page: where you are, whether the API answers, and the time. */
export function HudStatusBar({ section }: { section: string }) {
  return (
    <div className="hud-label mb-6 hidden items-center justify-between gap-6 border-b border-hud/15 pb-3 text-neutral-400 lg:flex">
      <span>
        Muvance <span className="text-hud">/</span> {section}
      </span>
      <span className="flex items-center gap-6">
        <ApiStatus />
        <Clock />
      </span>
    </div>
  );
}
