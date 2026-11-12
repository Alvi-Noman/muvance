import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Hourglass, MessageCircle, Phone, PlayCircle, Trash2, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import type { UnfinishedBookingDto } from '@muvance/shared';
import { Button, buttonStyles } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge, EmptyState, PageHeader, PageLoader } from '@/components/ui/misc';
import { Can } from '@/features/auth/RequireAuth';
import { api, errorMessage } from '@/lib/api-client';
import { formatDateTime, formatRelative, websiteLabel, websiteUrl } from '@/lib/format';

const queryKey = ['unfinished-bookings'] as const;

/** WhatsApp wants the number with country code; Bangladeshi numbers often come without it. */
function whatsappLink(phone: string) {
  const digits = phone.replace(/\D/g, '');
  const full = /^01\d{9}$/.test(digits) ? `88${digits}` : digits;
  return `https://wa.me/${full}`;
}

export function UnfinishedBookingsPage() {
  const { data, isPending } = useQuery({
    queryKey,
    queryFn: () =>
      api.get<{ items: UnfinishedBookingDto[]; total: number }>('/unfinished-bookings'),
    // New ones arrive while people browse, so keep the list fresh.
    refetchInterval: 60_000,
  });

  return (
    <>
      <PageHeader
        title="Unfinished bookings"
        description="People who started the booking form and typed their phone number, but never pressed Book. Anyone who books later drops off this list."
      />
      <Card>
        {isPending ? (
          <PageLoader />
        ) : !data?.items.length ? (
          <EmptyState
            icon={<Hourglass className="size-5" />}
            title="No unfinished bookings"
            description="When someone fills in the booking form but leaves before booking, they appear here."
          />
        ) : (
          <ul className="divide-y divide-black/[0.05]">
            {data.items.map((item) => (
              <UnfinishedRow key={item.id} item={item} />
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}

function UnfinishedRow({ item }: { item: UnfinishedBookingDto }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const refresh = () => queryClient.invalidateQueries({ queryKey });

  const add = useMutation({
    mutationFn: () => api.post<{ leadId: string }>(`/unfinished-bookings/${item.id}/add-to-leads`),
    onSuccess: ({ leadId }) => {
      void refresh();
      void queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success(item.existingLead ? 'Matched to their existing lead' : 'Added to leads', {
        action: { label: 'Open', onClick: () => void navigate(`/leads/${leadId}`) },
      });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
  const remove = useMutation({
    mutationFn: () => api.delete(`/unfinished-bookings/${item.id}`),
    onSuccess: () => {
      void refresh();
      toast.success('Removed from the list');
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const tel = `tel:${item.phone.replace(/[^\d+]/g, '')}`;
  const details = [
    item.businessName,
    item.monthlySales && `Monthly sales: ${item.monthlySales}`,
  ].filter(Boolean);

  return (
    <li className="px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-medium text-neutral-900">
              {item.name || <span className="text-neutral-500">No name typed</span>}
            </span>
            <a href={tel} className="text-sm font-medium text-hud tabular-nums hover:underline">
              {item.phone}
            </a>
            {item.existingLead && (
              <Link to={`/leads/${item.existingLead.id}`}>
                <Badge className="bg-amber-50 text-amber-700 hover:underline">
                  Already a lead: {item.existingLead.name}
                </Badge>
              </Link>
            )}
          </div>
          {(details.length > 0 || item.website) && (
            <p className="mt-1 text-sm text-neutral-600">
              {details.join(' · ')}
              {item.website && (
                <>
                  {details.length > 0 && ' · '}
                  <a
                    href={websiteUrl(item.website) ?? undefined}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline"
                  >
                    {websiteLabel(item.website)}
                  </a>
                </>
              )}
            </p>
          )}
          {item.message && <p className="mt-1 text-sm text-neutral-500 italic">“{item.message}”</p>}
          <p className="mt-1.5 text-xs text-neutral-500">
            {item.startsAt && <>Picked {formatDateTime(item.startsAt)} · </>}
            Left {formatRelative(item.updatedAt)}
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
            <Button size="sm" loading={add.isPending} onClick={() => add.mutate()}>
              <UserPlus className="size-3.5" aria-hidden />
              {item.existingLead ? 'Done, matched' : 'Add to leads'}
            </Button>
            <Button
              size="icon"
              variant="danger-ghost"
              aria-label={`Remove ${item.name || item.phone}`}
              title="Remove from the list"
              loading={remove.isPending}
              onClick={() =>
                confirm('Remove this from the list? This cannot be undone.') && remove.mutate()
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
