import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Inbox, MessageCircle, Phone, PlayCircle, Trash2 } from 'lucide-react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import {
  applicationStatuses,
  applicationStatusLabels,
  applicationTypeLabels,
  type ApplicationDto,
  type ApplicationStatus,
  type ApplicationType,
} from '@muvance/shared';
import { Button, buttonStyles } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge, EmptyState, PageHeader, PageLoader } from '@/components/ui/misc';
import { Can } from '@/features/auth/RequireAuth';
import { api, errorMessage } from '@/lib/api-client';
import { formatDateTime, formatRelative, websiteLabel, websiteUrl } from '@/lib/format';

const queryKey = ['applications'] as const;

/** WhatsApp wants the number with country code; Bangladeshi numbers often come without it. */
function whatsappLink(phone: string) {
  const digits = phone.replace(/\D/g, '');
  const full = /^01\d{9}$/.test(digits) ? `88${digits}` : digits;
  return `https://wa.me/${full}`;
}

const typeTone: Record<ApplicationType, string> = {
  investment: 'bg-emerald-50 text-emerald-700',
  training: 'bg-violet-50 text-violet-700',
};

const statusTone: Record<ApplicationStatus, string> = {
  new: 'bg-sky-50 text-sky-700',
  contacted: 'bg-amber-50 text-amber-700',
  closed: 'bg-neutral-100 text-neutral-600',
};

type Filter = 'all' | ApplicationType;
const FILTERS: Filter[] = ['all', 'investment', 'training'];

/** Investment and training applications sent from the website's own forms. */
export function ApplicationsPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const { data, isPending } = useQuery({
    queryKey,
    queryFn: () => api.get<{ items: ApplicationDto[]; total: number }>('/admin/applications'),
    // New ones arrive while people browse, so keep the list fresh.
    refetchInterval: 60_000,
  });

  const all = data?.items ?? [];
  const matches = (type: Filter) => (item: ApplicationDto) => type === 'all' || item.type === type;
  const items = all.filter(matches(filter));

  return (
    <>
      <PageHeader
        title="Applications"
        description="Businesses asking us to invest in them, and people who want to join the training program. Sent from muvance.com/invest and muvance.com/training."
      />

      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Show">
        {FILTERS.map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={filter === key}
            onClick={() => setFilter(key)}
            className={buttonStyles({
              variant: filter === key ? 'primary' : 'secondary',
              size: 'sm',
            })}
          >
            {key === 'all' ? 'All' : applicationTypeLabels[key]}
            <span className="tabular-nums opacity-70">{all.filter(matches(key)).length}</span>
          </button>
        ))}
      </div>

      <Card>
        {isPending ? (
          <PageLoader />
        ) : !items.length ? (
          <EmptyState
            icon={<Inbox className="size-5" />}
            title="No applications yet"
            description="When someone sends the invest or training form on the website, it appears here."
          />
        ) : (
          <ul className="divide-y divide-black/[0.05]">
            {items.map((item) => (
              <ApplicationRow key={item.id} item={item} />
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}

function ApplicationRow({ item }: { item: ApplicationDto }) {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey });

  const setStatus = useMutation({
    mutationFn: (status: ApplicationStatus) =>
      api.patch<ApplicationDto>(`/admin/applications/${item.id}`, { status }),
    onSuccess: () => void refresh(),
    onError: (error) => toast.error(errorMessage(error)),
  });
  const remove = useMutation({
    mutationFn: () => api.delete(`/admin/applications/${item.id}`),
    onSuccess: () => {
      void refresh();
      toast.success('Application deleted');
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const tel = `tel:${item.phone.replace(/[^\d+]/g, '')}`;

  return (
    <li className="px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-medium text-neutral-900">{item.name}</span>
            <a href={tel} className="text-sm font-medium text-hud tabular-nums hover:underline">
              {item.phone}
            </a>
            <Badge className={typeTone[item.type]}>{applicationTypeLabels[item.type]}</Badge>
            <Badge className={statusTone[item.status]}>
              {applicationStatusLabels[item.status]}
            </Badge>
          </div>

          <dl className="mt-2 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-[max-content_1fr]">
            {item.details.map((detail) => (
              <div key={detail.label} className="contents">
                <dt className="text-neutral-500">{detail.label}</dt>
                <dd className="whitespace-pre-line text-neutral-800">
                  {detail.href ? (
                    <a
                      href={websiteUrl(detail.href) ?? undefined}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                    >
                      {websiteLabel(detail.value)}
                    </a>
                  ) : (
                    detail.value
                  )}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-2 text-xs text-neutral-500" title={formatDateTime(item.createdAt)}>
            Sent {formatRelative(item.createdAt)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <a href={tel} className={buttonStyles({ variant: 'secondary', size: 'sm' })}>
            <Phone className="size-3.5" aria-hidden />
            Call
          </a>
          <a
            href={whatsappLink(item.phone)}
            target="_blank"
            rel="noreferrer"
            className={buttonStyles({ variant: 'secondary', size: 'sm' })}
          >
            <MessageCircle className="size-3.5" aria-hidden />
            WhatsApp
          </a>
          {item.recordingId && (
            <Link
              to={`/recordings/${item.recordingId}`}
              className={buttonStyles({ variant: 'secondary', size: 'sm' })}
            >
              <PlayCircle className="size-3.5" aria-hidden />
              Watch visit
            </Link>
          )}
          <Can permission="leads:write">
            <select
              aria-label="Status"
              value={item.status}
              disabled={setStatus.isPending}
              onChange={(event) => setStatus.mutate(event.target.value as ApplicationStatus)}
              className="h-8 rounded-lg border border-black/10 bg-white px-2 text-sm"
            >
              {applicationStatuses.map((status) => (
                <option key={status} value={status}>
                  {applicationStatusLabels[status]}
                </option>
              ))}
            </select>
          </Can>
          <Can permission="leads:delete">
            <Button
              size="icon"
              variant="danger-ghost"
              aria-label={`Delete the application from ${item.name}`}
              title="Delete"
              loading={remove.isPending}
              onClick={() =>
                confirm('Delete this application? This cannot be undone.') && remove.mutate()
              }
            >
              <Trash2 className="size-4" aria-hidden />
            </Button>
          </Can>
        </div>
      </div>
    </li>
  );
}
