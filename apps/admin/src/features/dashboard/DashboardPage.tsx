import type { ReactNode } from 'react';
import {
  ArrowRight,
  CalendarDays,
  ClipboardCheck,
  Handshake,
  Percent,
  Sparkles,
  Users,
} from 'lucide-react';
import { Link } from 'react-router';
import {
  leadStageLabels,
  leadStages,
  lostReasonLabels,
  lostReasons,
  type DashboardDto,
} from '@muvance/shared';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState, PageLoader } from '@/components/ui/misc';
import { useCurrentUser } from '@/features/auth/auth';
import { useDashboard } from '@/features/leads/leads-api';
import { MeetingTypeBadge } from '@/features/leads/stage-badges';
import { stageStyles } from '@/features/leads/stages';
import { cn } from '@/lib/cn';
import { formatDay, formatNumber, formatRate, formatRelative, formatTime } from '@/lib/format';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function Stat({
  label,
  value,
  icon,
  to,
  tone,
  hint,
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  to?: string;
  tone?: string;
  hint?: string;
}) {
  const body = (
    <Card className={cn('h-full p-5 transition-shadow', to && 'hover:shadow-md')}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-neutral-500">{label}</p>
        <span
          className={cn(
            'grid size-8 shrink-0 place-items-center rounded-lg bg-neutral-100 text-neutral-600',
            tone,
          )}
        >
          {icon}
        </span>
      </div>
      <p className="mt-3 font-serif text-4xl leading-none tabular-nums">{value}</p>
      {hint && <p className="mt-2 text-xs text-neutral-500">{hint}</p>}
    </Card>
  );
  return to ? <Link to={to}>{body}</Link> : body;
}

/** The three conversion steps of the process, side by side. */
function Funnel({ totals }: { totals: DashboardDto['totals'] }) {
  const rates = [
    { label: 'Show-up rate', value: totals.showUpRate, hint: 'Discovery calls attended' },
    {
      label: 'Proposal rate',
      value: totals.proposalRate,
      hint: 'Discoveries that reached a proposal',
    },
    { label: 'Close rate', value: totals.closeRate, hint: 'Proposals that said yes' },
  ];
  return (
    <Card className="grid divide-y divide-black/[0.06] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      {rates.map((r, i) => (
        <div key={r.label} className="flex items-center gap-4 p-5">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-neutral-950 text-xs font-semibold text-white">
            {i + 1}
          </span>
          <div>
            <p className="text-sm text-neutral-500">{r.label}</p>
            <p className="font-serif text-3xl leading-tight tabular-nums">{formatRate(r.value)}</p>
            <p className="text-xs text-neutral-400">{r.hint}</p>
          </div>
        </div>
      ))}
    </Card>
  );
}

export function DashboardPage() {
  const me = useCurrentUser();
  const { data, isPending } = useDashboard();
  if (isPending || !data) return <PageLoader />;

  const { totals, byStage, lostReasons: lost, upcoming, recentActivity } = data;
  const maxStage = Math.max(1, ...leadStages.map((s) => byStage[s]));
  const totalLost = lostReasons.reduce((sum, r) => sum + lost[r], 0);

  return (
    <>
      <div className="mb-8">
        <h1 className="font-serif text-4xl leading-none tracking-tight sm:text-5xl">
          {greeting()}, <em>{me.name.split(' ')[0]}.</em>
        </h1>
        <p className="mt-2 text-sm text-neutral-500">Here&apos;s where your leads stand.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <Stat
          label="Total leads"
          value={formatNumber(totals.leads)}
          icon={<Users className="size-4" />}
          to="/leads"
        />
        <Stat
          label="New this week"
          value={formatNumber(totals.newThisWeek)}
          icon={<Sparkles className="size-4" />}
          tone="bg-sky-50 text-sky-700"
        />
        <Stat
          label="Upcoming meetings"
          value={formatNumber(totals.upcomingMeetings)}
          icon={<CalendarDays className="size-4" />}
          to="/meetings"
          tone="bg-violet-50 text-violet-700"
        />
        <Stat
          label="Waiting on the team"
          value={formatNumber(totals.inReview)}
          icon={<ClipboardCheck className="size-4" />}
          to="/pipeline"
          tone={totals.inReview ? 'bg-amber-50 text-amber-700' : undefined}
          hint="Discovery done or in review"
        />
        <Stat
          label="Clients won"
          value={formatNumber(totals.clients)}
          icon={<Handshake className="size-4" />}
          to="/leads?stage=won"
          tone="bg-emerald-50 text-emerald-700"
        />
        <Stat
          label="Avg. share"
          value={totals.avgCommission == null ? '–' : `${Number(totals.avgCommission.toFixed(1))}%`}
          icon={<Percent className="size-4" />}
          hint="Agreed with won clients"
        />
      </div>

      <div className="mt-3">
        <Funnel totals={totals} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader
            title="Upcoming meetings"
            action={
              <Link
                to="/meetings"
                className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900"
              >
                View all <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            }
          />
          {upcoming.length === 0 ? (
            <EmptyState
              title="No upcoming meetings"
              description="New bookings from the website will appear here."
            />
          ) : (
            <ul className="divide-y divide-black/[0.05]">
              {upcoming.map((m) => (
                <li key={m.id}>
                  <Link
                    to={`/leads/${m.leadId}`}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-neutral-50"
                  >
                    <div className="w-24 shrink-0 text-sm">
                      <p className="font-semibold">{formatDay(m.startsAt)}</p>
                      <p className="text-neutral-500 tabular-nums">{formatTime(m.startsAt)}</p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{m.lead?.name ?? 'Deleted lead'}</p>
                      <p className="truncate text-sm text-neutral-500">
                        {m.lead?.businessName || m.lead?.phone}
                      </p>
                    </div>
                    <MeetingTypeBadge type={m.type} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Pipeline"
              action={
                <Link
                  to="/pipeline"
                  className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900"
                >
                  Open board <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              }
            />
            <ul className="space-y-3.5 p-5">
              {leadStages.map((stage) => (
                <li key={stage}>
                  <Link to={`/leads?stage=${stage}`} className="group block">
                    <div className="mb-1.5 flex justify-between text-sm">
                      <span className="text-neutral-700 group-hover:text-neutral-950">
                        {leadStageLabels[stage]}
                      </span>
                      <span className="font-medium tabular-nums">{byStage[stage]}</span>
                    </div>
                    <div className="h-2 rounded-full bg-neutral-100">
                      <div
                        className={cn(
                          'h-full rounded-full transition-[width] duration-700',
                          stageStyles[stage].bar,
                        )}
                        style={{ width: `${(byStage[stage] / maxStage) * 100}%` }}
                      />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader
              title="Why leads are lost"
              description={totalLost ? `${totalLost} lost in total` : undefined}
            />
            {totalLost === 0 ? (
              <EmptyState title="No lost leads yet" className="py-8" />
            ) : (
              <ul className="space-y-2.5 p-5 text-sm">
                {lostReasons
                  .filter((r) => lost[r] > 0)
                  .sort((a, b) => lost[b] - lost[a])
                  .map((r) => (
                    <li key={r} className="flex items-center gap-3">
                      <span className="w-44 shrink-0 text-neutral-700">{lostReasonLabels[r]}</span>
                      <span className="h-2 flex-1 rounded-full bg-neutral-100">
                        <span
                          className="block h-full rounded-full bg-neutral-400"
                          style={{ width: `${(lost[r] / totalLost) * 100}%` }}
                        />
                      </span>
                      <span className="w-6 text-right font-medium tabular-nums">{lost[r]}</span>
                    </li>
                  ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader title="Recent activity" />
        {recentActivity.length === 0 ? (
          <EmptyState title="Nothing yet" />
        ) : (
          <ul className="divide-y divide-black/[0.05]">
            {recentActivity.map((a) => (
              <li key={a.id}>
                <Link
                  to={`/leads/${a.leadId}`}
                  className="flex items-start justify-between gap-4 px-5 py-3 hover:bg-neutral-50"
                >
                  <p className="min-w-0 text-sm">
                    <span className="font-medium">{a.actor?.name ?? 'Website'}</span>
                    <span className="text-neutral-500"> on </span>
                    <span className="font-medium">{a.leadName}</span>
                    <span className="block truncate text-neutral-500">{a.body}</span>
                  </p>
                  <span className="shrink-0 text-xs text-neutral-400">
                    {formatRelative(a.createdAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
