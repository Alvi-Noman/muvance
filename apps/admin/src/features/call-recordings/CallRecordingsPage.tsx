import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Clapperboard, Download, Play, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  callRecordingStatusLabels,
  type CallRecordingDto,
  type CallRecordingStatus,
} from '@muvance/shared';
import { Button, buttonStyles } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Badge, EmptyState, PageHeader, PageLoader } from '@/components/ui/misc';
import { Can } from '@/features/auth/RequireAuth';
import { api, errorMessage } from '@/lib/api-client';
import { formatDateTime, formatRelative } from '@/lib/format';

const queryKey = ['call-recordings'] as const;

const statusTone: Record<CallRecordingStatus, string> = {
  recording: 'bg-red-50 text-red-700',
  processing: 'bg-amber-50 text-amber-700',
  ready: 'bg-emerald-50 text-emerald-700',
  failed: 'bg-neutral-100 text-neutral-600',
};

function formatDuration(sec: number | null) {
  if (sec == null) return null;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h ? `${h}h ${m}m` : m ? `${m}m ${s}s` : `${s}s`;
}

function formatSize(bytes: number | null) {
  if (bytes == null) return null;
  return bytes >= 1024 ** 3
    ? `${(bytes / 1024 ** 3).toFixed(1)} GB`
    : `${Math.max(1, Math.round(bytes / 1024 ** 2))} MB`;
}

/** Recorded meetings from meet.muvance.com. */
export function CallRecordingsPage() {
  const [playing, setPlaying] = useState<CallRecordingDto | null>(null);
  const { data, isPending } = useQuery({
    queryKey,
    queryFn: () => api.get<CallRecordingDto[]>('/call-recordings'),
    // Recordings in progress finish while the page is open.
    refetchInterval: (query) =>
      query.state.data?.some((r) => r.status === 'recording' || r.status === 'processing')
        ? 10_000
        : 60_000,
  });
  const items = data ?? [];

  return (
    <>
      <PageHeader
        title="Call recordings"
        description="Meetings recorded on meet.muvance.com. A host starts recording from the ⋮ menu in a call. Recordings are deleted automatically after 6 months."
      />
      <Card>
        {isPending ? (
          <PageLoader />
        ) : !items.length ? (
          <EmptyState
            icon={<Clapperboard className="size-5" />}
            title="No call recordings yet"
            description="In a meeting, open ⋮ → Record this call. The recording appears here once the call ends or recording stops."
          />
        ) : (
          <ul className="divide-y divide-black/[0.05]">
            {items.map((item) => (
              <RecordingRow key={item.id} item={item} onPlay={() => setPlaying(item)} />
            ))}
          </ul>
        )}
      </Card>

      <Modal
        open={!!playing}
        onClose={() => setPlaying(null)}
        title={playing?.title || playing?.code || 'Recording'}
        description={playing ? formatDateTime(playing.startedAt) : undefined}
        className="max-w-4xl"
      >
        {playing && (
          <video
            key={playing.id}
            src={api.url(`/call-recordings/${playing.id}/file`)}
            controls
            autoPlay
            playsInline
            className="aspect-video w-full rounded-xl bg-black"
          />
        )}
      </Modal>
    </>
  );
}

function RecordingRow({ item, onPlay }: { item: CallRecordingDto; onPlay: () => void }) {
  const queryClient = useQueryClient();
  const remove = useMutation({
    mutationFn: () => api.delete(`/call-recordings/${item.id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
      toast.success('Recording deleted');
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
  const ready = item.status === 'ready';
  const details = [
    formatDuration(item.durationSec),
    formatSize(item.sizeBytes),
    `recorded by ${item.startedByName}`,
  ].filter(Boolean);

  return (
    <li className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 px-5 py-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-medium text-neutral-900">{item.title || 'Meeting'}</span>
          <span className="text-sm text-neutral-500 tabular-nums">{item.code}</span>
          <Badge className={statusTone[item.status]}>
            {callRecordingStatusLabels[item.status]}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-neutral-600" title={formatDateTime(item.startedAt)}>
          {formatRelative(item.startedAt)} · {details.join(' · ')}
        </p>
        {item.error && <p className="mt-1 text-sm text-red-600">{item.error}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <Button size="sm" onClick={onPlay} disabled={!ready}>
          <Play className="size-3.5" aria-hidden /> Watch
        </Button>
        {ready && (
          <a
            href={api.url(`/call-recordings/${item.id}/file?download=1`)}
            className={buttonStyles({ variant: 'secondary', size: 'sm' })}
          >
            <Download className="size-3.5" aria-hidden /> Download
          </a>
        )}
        <Can permission="leads:delete">
          <Button
            size="sm"
            variant="danger-ghost"
            aria-label="Delete recording"
            disabled={remove.isPending}
            onClick={() => {
              if (window.confirm('Delete this recording? This cannot be undone.')) remove.mutate();
            }}
          >
            <Trash2 className="size-3.5" aria-hidden />
          </Button>
        </Can>
      </div>
    </li>
  );
}
