import { useMemo, useRef } from 'react';
import { ArrowLeft, CalendarCheck, Clock, FileText, MousePointerClick, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState, PageLoader, Spinner } from '@/components/ui/misc';
import { Can } from '@/features/auth/RequireAuth';
import { ApiClientError, errorMessage } from '@/lib/api-client';
import { formatDateTime } from '@/lib/format';
import { DeviceLabel, SourceBadge } from './RecordingRow';
import { ReplayPlayer, type PlayerControls } from './ReplayPlayer';
import {
  formatDuration,
  pageName,
  useDeleteRecording,
  useRecording,
  useRecordingEvents,
  type RecordingEvent,
} from './recordings-api';

const CUSTOM = 5;

type Moment = { offset: number; label: string; icon: typeof FileText };

/** The labelled moments the website adds while recording: page changes and booking steps. */
function momentsOf(events: RecordingEvent[]): Moment[] {
  const start = events[0]?.timestamp ?? 0;
  const moments: Moment[] = [];
  for (const e of events) {
    if (e.type !== CUSTOM) continue;
    const { tag, payload } = e.data as { tag: string; payload: { path?: string } };
    const offset = Math.max(0, e.timestamp - start);
    if (tag === 'page' && payload.path) {
      // Each reload also repeats the current page: list it once.
      if (moments.at(-1)?.label !== `Opened ${pageName(payload.path)}`) {
        moments.push({ offset, label: `Opened ${pageName(payload.path)}`, icon: FileText });
      }
    } else if (tag === 'picked-time') {
      moments.push({ offset, label: 'Picked a time', icon: MousePointerClick });
    } else if (tag === 'booked') {
      moments.push({ offset, label: 'Booked a call', icon: CalendarCheck });
    }
  }
  return moments;
}

export function RecordingPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const rec = useRecording(id);
  const events = useRecordingEvents(id);
  const remove = useDeleteRecording();
  const controls = useRef<PlayerControls>(null);
  const moments = useMemo(() => momentsOf(events.data ?? []), [events.data]);

  if (rec.isPending) return <PageLoader />;
  if (rec.error || !rec.data) {
    const notFound = rec.error instanceof ApiClientError && rec.error.status === 404;
    return (
      <EmptyState
        title={notFound ? 'Recording not found' : "Couldn't load this recording"}
        description={notFound ? 'It may have been deleted or expired.' : 'Please try again.'}
        action={
          <Link to="/recordings" className="text-sm font-medium underline-offset-4 hover:underline">
            Back to recordings
          </Link>
        }
      />
    );
  }

  const r = rec.data;
  const playable = (events.data?.length ?? 0) >= 2;

  return (
    <>
      <Link
        to="/recordings"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Recordings
      </Link>

      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl leading-tight tracking-wide sm:text-3xl">
            {r.lead ? r.lead.name : 'Anonymous visitor'}
            {r.visitNumber > 1 && (
              <span className="text-neutral-500"> · visit {r.visitNumber}</span>
            )}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-neutral-500">
            <span>{formatDateTime(r.startedAt)}</span>
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Clock className="size-3.5" aria-hidden />
              {formatDuration(r.durationMs)}
            </span>
            <SourceBadge source={r.source} />
            <DeviceLabel device={r.device} />
          </div>
        </div>
        <div className="flex gap-2">
          {r.lead && (
            <Link
              to={`/leads/${r.lead.id}`}
              className="inline-flex h-10 items-center rounded-xl border border-hud/30 px-4 text-sm font-semibold hover:border-hud/70"
            >
              Open lead
            </Link>
          )}
          <Can permission="leads:delete">
            <Button
              variant="danger-ghost"
              loading={remove.isPending}
              onClick={() =>
                confirm('Delete this recording? This cannot be undone.') &&
                remove.mutate(r.id, {
                  onSuccess: () => {
                    toast.success('Recording deleted');
                    void navigate('/recordings');
                  },
                  onError: (error) => toast.error(errorMessage(error)),
                })
              }
            >
              <Trash2 className="size-4" aria-hidden />
              Delete
            </Button>
          </Can>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <Card className="min-w-0 p-3 sm:p-4">
          {events.isPending ? (
            <div className="grid h-80 place-items-center">
              <Spinner />
            </div>
          ) : !playable ? (
            <EmptyState
              title="Nothing to replay"
              description={
                events.isError
                  ? "Couldn't load the recording. Please try again."
                  : 'This visit ended before anything was recorded.'
              }
            />
          ) : (
            <ReplayPlayer
              events={events.data!}
              onReady={(c) => {
                controls.current = c;
              }}
            />
          )}
        </Card>

        <Card className="h-fit">
          <CardHeader title="Moments" description="Click one to jump there." />
          {moments.length ? (
            <ul className="p-2">
              {moments.map((m, i) => (
                <li key={i}>
                  <button
                    type="button"
                    disabled={!playable}
                    onClick={() => controls.current?.goto(m.offset)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-black/[0.04]"
                  >
                    <span className="w-12 shrink-0 text-neutral-500 tabular-nums">
                      {formatDuration(m.offset)}
                    </span>
                    <m.icon className="size-4 shrink-0 text-hud" aria-hidden />
                    <span className="text-neutral-800">{m.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-4 text-sm text-neutral-500">
              Pages visited: {r.pages.map(pageName).join(' → ')}
            </p>
          )}
        </Card>
      </div>
    </>
  );
}
