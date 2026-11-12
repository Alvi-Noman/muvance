import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { VisitorsByHourDto } from '@muvance/shared';
import { Card, CardHeader } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/misc';
import { api } from '@/lib/api-client';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format';

const RANGES = [7, 30] as const;
type Range = (typeof RANGES)[number];

/** 0 -> "12 AM", 13 -> "1 PM". */
const hourLabel = (h: number) => `${((h + 11) % 12) + 1} ${h % 24 < 12 ? 'AM' : 'PM'}`;
/** "8 PM – 11 PM", or "8 – 11 PM" when both ends share AM/PM. */
function hourRange(start: number, length: number) {
  const end = (start + length) % 24;
  const same = start < 12 === end < 12 && end !== 0;
  return same
    ? `${((start + 11) % 12) + 1} – ${hourLabel(end)}`
    : `${hourLabel(start)} – ${hourLabel(end)}`;
}
const percent = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);
const visits = (n: number) => `${formatNumber(n)} ${n === 1 ? 'visit' : 'visits'}`;

/** Parts of the day, in the host's time. Night wraps past midnight. */
const PARTS = [
  { label: 'Morning', start: 6, length: 6 },
  { label: 'Afternoon', start: 12, length: 5 },
  { label: 'Evening', start: 17, length: 4 },
  { label: 'Night', start: 21, length: 9 },
];

const hoursOf = (start: number, length: number) =>
  Array.from({ length }, (_, i) => (start + i) % 24);

export function VisitorsChart() {
  const [days, setDays] = useState<Range>(7);
  const { data, isPending } = useQuery({
    queryKey: ['dashboard', 'visitors', days],
    queryFn: () => api.get<VisitorsByHourDto>(`/dashboard/visitors?days=${days}`),
    placeholderData: (previous) => previous,
  });

  return (
    <Card>
      <CardHeader
        title="Visitors by time of day"
        description={`When people visit your website (${data?.timeZone ?? 'Asia/Dhaka'} time).`}
        action={
          <div
            className="flex rounded-lg border border-black/10 p-0.5"
            role="group"
            aria-label="Period"
          >
            {RANGES.map((r) => (
              <button
                key={r}
                type="button"
                aria-pressed={days === r}
                onClick={() => setDays(r)}
                className={cn(
                  'rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors',
                  days === r ? 'bg-hud text-void' : 'text-neutral-500 hover:text-neutral-900',
                )}
              >
                {r} days
              </button>
            ))}
          </div>
        }
      />
      <div className="p-5">
        {isPending || !data ? (
          <div className="grid h-56 place-items-center">
            <Spinner />
          </div>
        ) : !data.total ? (
          <p className="grid h-40 place-items-center rounded-xl bg-neutral-50 px-6 text-center text-sm text-neutral-500">
            No visits counted in the last {days} days yet. They appear here as people visit the
            website.
          </p>
        ) : (
          <VisitorsBody data={data} />
        )}
      </div>
    </Card>
  );
}

function VisitorsBody({ data }: { data: VisitorsByHourDto }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const { byHour, total, busiest } = data;
  const max = Math.max(...byHour);
  const peakHour = byHour.indexOf(max);
  const busyHours = busiest ? new Set(hoursOf(busiest.startHour, 3)) : new Set<number>();
  const parts = PARTS.map((p) => ({
    ...p,
    count: hoursOf(p.start, p.length).reduce((sum, h) => sum + byHour[h]!, 0),
  }));
  const topPart = Math.max(...parts.map((p) => p.count));

  return (
    <>
      {/* Headline: the answer, before the chart. */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        {busiest && (
          <div>
            <p className="text-xs font-medium tracking-wide text-neutral-500 uppercase">
              Busiest time
            </p>
            <p className="mt-1 text-2xl font-semibold text-neutral-950 tabular-nums">
              {hourRange(busiest.startHour, 3)}
            </p>
            <p className="text-sm text-neutral-500">
              {percent(busiest.count, total)}% of visits ({visits(busiest.count)})
            </p>
          </div>
        )}
        <p className="text-sm text-neutral-500">
          {visits(total)} in the last {data.days} days
        </p>
      </div>

      {/* Bars: one per hour. Recessive grid; the busiest stretch is shaded behind. */}
      <div className="flex gap-2">
        <div className="flex h-44 flex-col justify-between pb-0.5 text-right text-[11px] text-neutral-500 tabular-nums">
          <span>{formatNumber(max)}</span>
          <span>{formatNumber(Math.round(max / 2))}</span>
          <span>0</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="relative h-44">
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
              <span className="border-t border-black/[0.08]" />
              <span className="border-t border-dashed border-black/[0.06]" />
              <span className="border-t border-black/20" />
            </div>
            <div className="absolute inset-0 flex items-end gap-[2px]">
              {byHour.map((count, h) => {
                const active = hovered === h;
                return (
                  <button
                    key={h}
                    type="button"
                    aria-label={`${hourRange(h, 1)}: ${visits(count)}`}
                    onMouseEnter={() => setHovered(h)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(h)}
                    onBlur={() => setHovered(null)}
                    className={cn(
                      // The whole column is the hit target, not just the bar.
                      'relative flex h-full flex-1 items-end justify-center rounded-t-[4px] outline-none',
                      busyHours.has(h) && 'bg-hud/[0.07]',
                    )}
                  >
                    {count > 0 && (
                      <span
                        className={cn(
                          'block w-full max-w-6 rounded-t-[4px] bg-hud transition-opacity',
                          hovered !== null && !active && 'opacity-50',
                        )}
                        style={{ height: `max(${(count / max) * 100}%, 3px)` }}
                      />
                    )}
                    {/* Direct label on the single busiest hour only. */}
                    {h === peakHour && hovered === null && (
                      <span
                        className="absolute left-1/2 -translate-x-1/2 text-[11px] font-semibold text-neutral-900 tabular-nums"
                        style={{ bottom: `calc(${(count / max) * 100}% + 4px)` }}
                      >
                        {formatNumber(count)}
                      </span>
                    )}
                    {active && (
                      <span
                        role="tooltip"
                        className={cn(
                          'absolute z-10 rounded-lg border border-black/15 bg-white px-2.5 py-1.5 text-left text-xs whitespace-nowrap shadow-lg',
                          // Keep the tooltip on screen at the edges.
                          h < 4 ? 'left-0' : h > 19 ? 'right-0' : 'left-1/2 -translate-x-1/2',
                        )}
                        style={{ bottom: `calc(${(count / max) * 100}% + 8px)` }}
                      >
                        <span className="block text-neutral-500">{hourRange(h, 1)}</span>
                        <span className="block font-semibold text-neutral-950 tabular-nums">
                          {visits(count)}
                        </span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          {/* Hour labels: every 3 hours, every 6 on small screens. */}
          {/* Each label hangs centred under its bar without taking up width of its own. */}
          <div className="relative mt-1.5 h-4 text-[11px] text-neutral-500">
            {byHour.map((_, h) =>
              h % 3 === 0 ? (
                <span
                  key={h}
                  className={cn(
                    'absolute top-0 -translate-x-1/2 whitespace-nowrap',
                    h % 6 !== 0 && 'max-sm:hidden',
                  )}
                  style={{ left: `${((h + 0.5) / 24) * 100}%` }}
                >
                  {hourLabel(h).replace(' ', '')}
                </span>
              ) : null,
            )}
          </div>
        </div>
      </div>

      {/* Parts of the day. */}
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {parts.map((p) => {
          const share = percent(p.count, total);
          const top = p.count === topPart && p.count > 0;
          return (
            <div key={p.label} className="rounded-xl bg-neutral-50 px-3.5 py-3">
              <p className="flex items-baseline justify-between gap-2">
                <span
                  className={cn(
                    'text-sm',
                    top ? 'font-semibold text-neutral-950' : 'text-neutral-700',
                  )}
                >
                  {p.label}
                </span>
                <span className="text-sm font-semibold text-neutral-950 tabular-nums">
                  {share}%
                </span>
              </p>
              <p className="text-xs text-neutral-500">{hourRange(p.start, p.length)}</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/[0.08]">
                <div className="h-full rounded-full bg-hud" style={{ width: `${share}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-neutral-500 tabular-nums">{visits(p.count)}</p>
            </div>
          );
        })}
      </div>

      {/* The same numbers as a table, for screen readers. */}
      <table className="sr-only">
        <caption>Visits by hour of the day</caption>
        <thead>
          <tr>
            <th>Hour</th>
            <th>Visits</th>
          </tr>
        </thead>
        <tbody>
          {byHour.map((count, h) => (
            <tr key={h}>
              <td>{hourRange(h, 1)}</td>
              <td>{count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
