import { Video } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState, PageHeader, PageLoader } from '@/components/ui/misc';
import { cn } from '@/lib/cn';
import { RecordingRow } from './RecordingRow';
import { useRecordings } from './recordings-api';

const PAGE_SIZE = 30;
const FILTERS = [
  { value: 'all', label: 'All visits' },
  { value: 'booked', label: 'Booked a call' },
  { value: 'ads', label: 'From Meta ads' },
] as const;
type Filter = (typeof FILTERS)[number]['value'];

export function RecordingsPage() {
  const [params, setParams] = useSearchParams();
  const filter = (FILTERS.find((f) => f.value === params.get('filter'))?.value ?? 'all') as Filter;
  const page = Math.max(1, Number(params.get('page') ?? 1));
  const hideShort = params.get('short') !== 'show';

  const { data, isPending } = useRecordings({
    filter,
    page,
    pageSize: PAGE_SIZE,
    minSeconds: hideShort ? 10 : 0,
  });
  const pages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));

  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value === null) next.delete(key);
      else next.set(key, value);
    }
    if (!('page' in changes)) next.delete('page');
    setParams(next);
  };

  return (
    <>
      <PageHeader
        title="Recordings"
        description="Replays of what people do on your website. Typed text is hidden."
      />

      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-3">
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Show">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              role="tab"
              aria-selected={filter === f.value}
              onClick={() => update({ filter: f.value === 'all' ? null : f.value })}
              className={cn(
                'h-9 rounded-full px-4 text-sm font-medium transition-colors',
                filter === f.value
                  ? 'bg-hud text-void'
                  : 'border border-black/10 text-neutral-600 hover:border-black/30',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-600">
          <input
            type="checkbox"
            className="size-4 accent-neutral-950"
            checked={hideShort}
            onChange={(e) => update({ short: e.target.checked ? null : 'show' })}
          />
          Hide visits under 10 seconds
        </label>
        {data && (
          <span className="text-sm text-neutral-500 sm:ml-auto">
            {data.total} {data.total === 1 ? 'visit' : 'visits'}
          </span>
        )}
      </div>

      <Card>
        {isPending ? (
          <PageLoader />
        ) : !data?.items.length ? (
          <EmptyState
            icon={<Video className="size-5" />}
            title="No recordings yet"
            description={
              filter === 'all'
                ? 'Visits to your website appear here a few seconds after people start browsing.'
                : 'No visits match this filter yet.'
            }
          />
        ) : (
          <ul className="divide-y divide-black/[0.05]">
            {data.items.map((rec) => (
              <RecordingRow key={rec.id} rec={rec} />
            ))}
          </ul>
        )}
      </Card>

      {pages > 1 && (
        <div className="mt-4 flex items-center justify-end gap-3 text-sm text-neutral-500">
          Page {page} of {pages}
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => update({ page: String(page - 1) })}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= pages}
            onClick={() => update({ page: String(page + 1) })}
          >
            Next
          </Button>
        </div>
      )}
    </>
  );
}
