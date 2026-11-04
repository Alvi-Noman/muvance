import { useState } from 'react';
import { CalendarDays, Phone } from 'lucide-react';
import { Link } from 'react-router';
import type { MeetingDto } from '@muvance/shared';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState, PageHeader, Spinner } from '@/components/ui/misc';
import { useCan } from '@/features/auth/auth';
import { useMeetings, useUpdateMeeting } from '@/features/leads/leads-api';
import { MeetingStatusBadge, MeetingTypeBadge } from '@/features/leads/stage-badges';
import { cn } from '@/lib/cn';
import { formatDayHeading, formatTime } from '@/lib/format';

/** Groups meetings under their (local) day. */
function byDay(meetings: MeetingDto[]) {
  const groups = new Map<string, MeetingDto[]>();
  for (const m of meetings) {
    const key = new Date(m.startsAt).toDateString();
    groups.set(key, [...(groups.get(key) ?? []), m]);
  }
  return [...groups.values()];
}

export function MeetingsPage() {
  const [range, setRange] = useState<'upcoming' | 'past'>('upcoming');
  const { data, isPending } = useMeetings(range);
  const canWrite = useCan('leads:write');
  const update = useUpdateMeeting();

  return (
    <>
      <PageHeader
        title="Meetings"
        description="Discovery calls (booked on the website) and the proposal meetings you schedule."
        actions={
          <div className="flex rounded-xl bg-black/5 p-1 text-sm font-medium" role="tablist">
            {(['upcoming', 'past'] as const).map((r) => (
              <button
                key={r}
                type="button"
                role="tab"
                aria-selected={range === r}
                onClick={() => setRange(r)}
                className={cn(
                  'rounded-lg px-4 py-1.5 capitalize transition-colors',
                  range === r ? 'bg-white shadow-sm' : 'text-neutral-500 hover:text-neutral-900',
                )}
              >
                {r}
              </button>
            ))}
          </div>
        }
      />

      {isPending ? (
        <div className="grid h-64 place-items-center">
          <Spinner />
        </div>
      ) : !data?.length ? (
        <Card>
          <EmptyState
            icon={<CalendarDays className="size-5" />}
            title={range === 'upcoming' ? 'No upcoming calls' : 'No past calls yet'}
            description={
              range === 'upcoming' ? 'New bookings from the website will show up here.' : undefined
            }
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {byDay(data).map((day) => (
            <section key={day[0]!.id}>
              <h2 className="mb-2 text-sm font-semibold text-neutral-500">
                {formatDayHeading(day[0]!.startsAt)}
              </h2>
              <Card className="divide-y divide-black/[0.05]">
                {day.map((m) => (
                  <div
                    key={m.id}
                    className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center"
                  >
                    <div className="w-28 shrink-0 text-sm">
                      <p className="font-semibold tabular-nums">{formatTime(m.startsAt)}</p>
                      <p className="text-xs text-neutral-400">to {formatTime(m.endsAt)}</p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2">
                        <Link to={`/leads/${m.leadId}`} className="font-medium hover:underline">
                          {m.lead?.name ?? 'Deleted lead'}
                        </Link>
                        <MeetingTypeBadge type={m.type} />
                      </p>
                      <p className="flex flex-wrap items-center gap-x-3 text-sm text-neutral-500">
                        {m.lead?.businessName && <span>{m.lead.businessName}</span>}
                        {m.lead && (
                          <a
                            href={`tel:${m.lead.phone.replace(/[^\d+]/g, '')}`}
                            className="inline-flex items-center gap-1 hover:text-neutral-900"
                          >
                            <Phone className="size-3.5" aria-hidden />
                            {m.lead.phone}
                          </a>
                        )}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <MeetingStatusBadge status={m.status} />
                      {/* A finished proposal still waiting for its yes/no. */}
                      {m.type === 'proposal' &&
                        m.status !== 'scheduled' &&
                        m.lead?.stage === 'proposal_booked' && (
                          <Link
                            to={`/leads/${m.leadId}`}
                            className="text-sm font-medium text-orange-700 underline-offset-4 hover:underline"
                          >
                            Record their answer →
                          </Link>
                        )}
                      {canWrite && m.status === 'scheduled' && (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => update.mutate({ id: m.id, status: 'completed' })}
                          >
                            Completed
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => update.mutate({ id: m.id, status: 'no_show' })}
                          >
                            No-show
                          </Button>
                          <Button
                            size="sm"
                            variant="danger-ghost"
                            onClick={() =>
                              confirm('Cancel this call? The time slot will open up for others.') &&
                              update.mutate({ id: m.id, status: 'cancelled' })
                            }
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </Card>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
