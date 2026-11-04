import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Plus, Search, Users, UserX, X } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import {
  leadSorts,
  openStages,
  type LeadDto,
  type LeadListQuery,
  type LeadStage,
  type LostReason,
} from '@muvance/shared';
import { Button, buttonStyles } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Field';
import { Avatar, EmptyState, PageHeader, Spinner } from '@/components/ui/misc';
import { Can } from '@/features/auth/RequireAuth';
import { useCan } from '@/features/auth/auth';
import { api, toQuery } from '@/lib/api-client';
import { cn } from '@/lib/cn';
import {
  formatDate,
  formatDay,
  formatTakaShort,
  formatTime,
  websiteLabel,
  websiteUrl,
} from '@/lib/format';
import { LeadFormModal } from './LeadFormModal';
import { LostReasonModal } from './LostReasonModal';
import { useAssignable, useBulkUpdate, useLeads, useMoveLead, useTags } from './leads-api';
import { StageBadge } from './stage-badges';
import { stageOptions } from './stages';

const sortLabels: Record<(typeof leadSorts)[number], string> = {
  '-createdAt': 'Newest first',
  createdAt: 'Oldest first',
  '-lastActivityAt': 'Recent activity',
  name: 'Name (A–Z)',
  '-revenue': 'Highest revenue',
};

const PAGE_SIZE = 25;

export function LeadsPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const canWrite = useCan('leads:write');
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLosing, setBulkLosing] = useState(false);
  const [disqualifying, setDisqualifying] = useState<LeadDto | null>(null);

  // Filters live in the URL, so views are shareable and survive refreshes.
  const query: LeadListQuery = {
    q: params.get('q') ?? undefined,
    stage: (params.get('stage') as LeadStage) || undefined,
    // The main list is your working list. Lost leads are under the Lost stage, and in search.
    excludeLost: params.get('stage') || params.get('q') ? undefined : 'true',
    assignee: params.get('assignee') ?? undefined,
    tag: params.get('tag') ?? undefined,
    sort: (params.get('sort') as LeadListQuery['sort']) || '-createdAt',
    page: Number(params.get('page') ?? 1),
    pageSize: PAGE_SIZE,
  };
  const leads = useLeads(query);
  const assignable = useAssignable();
  const tags = useTags();
  const bulk = useBulkUpdate();
  const move = useMoveLead();

  const [search, setSearch] = useState(query.q ?? '');
  useEffect(() => {
    const id = setTimeout(() => {
      if ((query.q ?? '') !== search) update({ q: search || null });
    }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function update(changes: Record<string, string | null>) {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    if (!('page' in changes)) next.delete('page');
    setParams(next, { replace: true });
    setSelected(new Set());
  }

  const items = leads.data?.items ?? [];
  const total = leads.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const filtered = !!(query.q || query.stage || query.assignee || query.tag);
  const allSelected = items.length > 0 && items.every((l) => selected.has(l.id));

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const runBulk = (change: {
    stage?: LeadStage;
    lostReason?: LostReason;
    assigneeId?: string | null;
  }) =>
    bulk.mutate(
      { ids: [...selected], ...change },
      {
        onSuccess: ({ updated }) => {
          toast.success(`Updated ${updated} lead${updated === 1 ? '' : 's'}`);
          setSelected(new Set());
        },
      },
    );

  return (
    <>
      <PageHeader
        title="Leads"
        description={
          leads.data
            ? `${total} ${total === 1 ? 'lead' : 'leads'}${filtered ? ' match your filters' : ''}`
            : ' '
        }
        actions={
          <>
            <Can permission="leads:export">
              <a
                href={api.url(
                  `/leads/export.csv${toQuery({ ...query, page: undefined, pageSize: undefined })}`,
                )}
                className={buttonStyles({ variant: 'secondary' })}
              >
                <Download className="size-4" aria-hidden />
                Export CSV
              </a>
            </Can>
            <Can permission="leads:write">
              <Button onClick={() => setAdding(true)}>
                <Plus className="size-4" aria-hidden />
                Add lead
              </Button>
            </Can>
          </>
        }
      />

      {/* Filters */}
      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_repeat(4,minmax(0,11rem))]">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-neutral-400"
            aria-hidden
          />
          <Input
            aria-label="Search leads"
            placeholder="Search name, business, phone, website…"
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          aria-label="Stage"
          value={query.stage ?? ''}
          onChange={(e) => update({ stage: e.target.value || null })}
        >
          <option value="">Active leads</option>
          {stageOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Assignee"
          value={query.assignee ?? ''}
          onChange={(e) => update({ assignee: e.target.value || null })}
        >
          <option value="">Anyone</option>
          <option value="me">Assigned to me</option>
          <option value="unassigned">Unassigned</option>
          {assignable.data?.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Tag"
          value={query.tag ?? ''}
          onChange={(e) => update({ tag: e.target.value || null })}
        >
          <option value="">All tags</option>
          {tags.data?.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Sort"
          value={query.sort}
          onChange={(e) => update({ sort: e.target.value })}
        >
          {leadSorts.map((s) => (
            <option key={s} value={s}>
              {sortLabels[s]}
            </option>
          ))}
        </Select>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && canWrite && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl bg-neutral-950 px-4 py-2.5 text-sm text-white">
          <span className="mr-2 font-medium">{selected.size} selected</span>
          <select
            aria-label="Move selected to stage"
            className="h-8 rounded-lg bg-white/10 px-2 text-sm"
            value=""
            onChange={(e) => {
              const stage = e.target.value as LeadStage | '';
              if (stage === 'lost') setBulkLosing(true);
              else if (stage) runBulk({ stage });
            }}
          >
            <option value="">Move to stage…</option>
            {stageOptions.map((o) => (
              <option key={o.value} value={o.value} className="text-neutral-900">
                {o.label}
              </option>
            ))}
          </select>
          <select
            aria-label="Assign selected"
            className="h-8 rounded-lg bg-white/10 px-2 text-sm"
            value=""
            onChange={(e) =>
              e.target.value &&
              runBulk({ assigneeId: e.target.value === 'none' ? null : e.target.value })
            }
          >
            <option value="">Assign to…</option>
            <option value="none" className="text-neutral-900">
              Unassigned
            </option>
            {assignable.data?.map((u) => (
              <option key={u.id} value={u.id} className="text-neutral-900">
                {u.name}
              </option>
            ))}
          </select>
          {bulk.isPending && <Spinner className="size-4 text-white" />}
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="ml-auto grid size-7 place-items-center rounded-lg hover:bg-white/10"
            aria-label="Clear selection"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      <Card className="overflow-hidden">
        {leads.isPending ? (
          <div className="grid h-64 place-items-center">
            <Spinner />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Users className="size-5" />}
            title={filtered ? 'No leads match these filters' : 'No leads yet'}
            description={
              filtered
                ? 'Try a different search or clear the filters.'
                : 'New bookings from the website will appear here.'
            }
            action={
              filtered && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearch('');
                    setParams({});
                  }}
                >
                  Clear filters
                </Button>
              )
            }
          />
        ) : (
          <>
            {/* Desktop table */}
            <table
              className={cn(
                'hidden w-full text-sm md:table',
                leads.isPlaceholderData && 'opacity-60',
              )}
            >
              <thead>
                <tr className="border-b border-black/[0.06] text-left text-xs font-medium text-neutral-500">
                  {canWrite && (
                    <th className="w-10 py-3 pl-5">
                      <input
                        type="checkbox"
                        aria-label="Select all on this page"
                        className="size-4 accent-neutral-950"
                        checked={allSelected}
                        onChange={() =>
                          setSelected(allSelected ? new Set() : new Set(items.map((l) => l.id)))
                        }
                      />
                    </th>
                  )}
                  <th className={cn('py-3 pr-4', !canWrite && 'pl-5')}>Lead</th>
                  <th className="py-3 pr-4">Website</th>
                  <th className="py-3 pr-4">Monthly sales</th>
                  <th className="py-3 pr-4">Stage</th>
                  <th className="py-3 pr-4">Call time</th>
                  <th className="hidden py-3 pr-4 lg:table-cell">Phone</th>
                  <th className="hidden py-3 pr-4 2xl:table-cell">Owner</th>
                  <th className={cn('hidden py-3 lg:table-cell', canWrite ? 'pr-2' : 'pr-5')}>
                    Booked on
                  </th>
                  {canWrite && (
                    <th className="w-10 py-3 pr-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {items.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => navigate(`/leads/${lead.id}`)}
                    className={cn(
                      'cursor-pointer border-b border-black/[0.04] transition-colors last:border-0 hover:bg-neutral-50',
                      selected.has(lead.id) && 'bg-neutral-50',
                    )}
                  >
                    {canWrite && (
                      <td className="py-3 pl-5" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          aria-label={`Select ${lead.name}`}
                          className="size-4 accent-neutral-950"
                          checked={selected.has(lead.id)}
                          onChange={() => toggle(lead.id)}
                        />
                      </td>
                    )}
                    <td className={cn('py-3 pr-4', !canWrite && 'pl-5')}>
                      <Link
                        to={`/leads/${lead.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-medium hover:underline"
                      >
                        {lead.name}
                      </Link>
                      <p className="text-xs text-neutral-500">{lead.businessName || '—'}</p>
                    </td>
                    <td className="max-w-40 py-3 pr-4">
                      <WebsiteLink website={lead.website} />
                    </td>
                    <td className="max-w-40 truncate py-3 pr-4 text-neutral-700">
                      <MonthlySales lead={lead} />
                    </td>
                    <td className="py-3 pr-4">
                      <StageBadge stage={lead.stage} />
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap text-neutral-700">
                      {lead.nextMeetingAt ? (
                        <>
                          <p className="font-medium tabular-nums">
                            {formatTime(lead.nextMeetingAt)}
                            {lead.nextMeetingType === 'proposal' && (
                              <span className="ml-1.5 rounded-md bg-neutral-950 px-1.5 py-0.5 text-[10px] font-medium text-white">
                                Proposal
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {formatDay(lead.nextMeetingAt)}
                          </p>
                        </>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>
                    <td className="hidden py-3 pr-4 whitespace-nowrap text-neutral-600 tabular-nums lg:table-cell">
                      {lead.phone}
                    </td>
                    <td className="hidden py-3 pr-4 2xl:table-cell">
                      {lead.assignee ? (
                        <span className="flex items-center gap-2">
                          <Avatar name={lead.assignee.name} className="size-6 text-[10px]" />
                          <span className="truncate text-neutral-700">{lead.assignee.name}</span>
                        </span>
                      ) : (
                        <span className="text-neutral-400">Unassigned</span>
                      )}
                    </td>
                    <td
                      className={cn(
                        'hidden py-3 whitespace-nowrap lg:table-cell',
                        canWrite ? 'pr-2' : 'pr-5',
                      )}
                    >
                      <p className="text-neutral-700">{formatDate(lead.createdAt)}</p>
                      <p className="text-xs text-neutral-500 tabular-nums">
                        {formatTime(lead.createdAt)}
                      </p>
                    </td>
                    {canWrite && (
                      <td className="py-3 pr-3" onClick={(e) => e.stopPropagation()}>
                        <DisqualifyButton lead={lead} onClick={() => setDisqualifying(lead)} />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <ul className="divide-y divide-black/[0.05] md:hidden">
              {items.map((lead) => (
                <li key={lead.id} className="relative">
                  <Link to={`/leads/${lead.id}`} className="block px-4 py-3.5 hover:bg-neutral-50">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{lead.name}</p>
                        <p className="truncate text-xs text-neutral-500">
                          {lead.businessName || 'No business name'} · {lead.phone}
                        </p>
                      </div>
                      <StageBadge stage={lead.stage} />
                    </div>
                    <dl className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-1.5 pr-9 text-xs">
                      <div className="min-w-0">
                        <dt className="text-neutral-400">Monthly sales</dt>
                        <dd className="truncate text-neutral-700">
                          <MonthlySales lead={lead} />
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-neutral-400">Website</dt>
                        <dd className="truncate text-neutral-700">
                          {lead.website ? websiteLabel(lead.website) : '—'}
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-neutral-400">
                          {lead.nextMeetingType === 'proposal' ? 'Proposal' : 'Call time'}
                        </dt>
                        <dd className="font-medium text-neutral-700">
                          {lead.nextMeetingAt
                            ? `${formatTime(lead.nextMeetingAt)} · ${formatDay(lead.nextMeetingAt)}`
                            : '—'}
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-neutral-400">Booked on</dt>
                        <dd className="text-neutral-700">
                          {formatDate(lead.createdAt)}, {formatTime(lead.createdAt)}
                        </dd>
                      </div>
                    </dl>
                  </Link>
                  {canWrite && (
                    <DisqualifyButton
                      lead={lead}
                      onClick={() => setDisqualifying(lead)}
                      className="absolute right-3 bottom-3"
                    />
                  )}
                </li>
              ))}
            </ul>

            {pages > 1 && (
              <div className="flex items-center justify-between border-t border-black/[0.06] px-5 py-3 text-sm text-neutral-500">
                <span>
                  Page {query.page} of {pages}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={query.page! <= 1}
                    onClick={() => update({ page: String(query.page! - 1) })}
                  >
                    <ChevronLeft className="size-4" aria-hidden />
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={query.page! >= pages}
                    onClick={() => update({ page: String(query.page! + 1) })}
                  >
                    Next
                    <ChevronRight className="size-4" aria-hidden />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      <LeadFormModal open={adding} onClose={() => setAdding(false)} />
      <LostReasonModal
        open={!!disqualifying}
        title={disqualifying ? `Disqualify ${disqualifying.name}?` : undefined}
        description={
          disqualifying?.nextMeetingAt
            ? 'They move to Lost and leave this list. Their booked time opens up on the website for someone else.'
            : 'They move to Lost and leave this list.'
        }
        confirmLabel="Disqualify"
        onClose={() => setDisqualifying(null)}
        onConfirm={(lostReason, lostNote) => {
          if (!disqualifying) return;
          const { id, name, nextMeetingAt } = disqualifying;
          move.mutate({ id, stage: 'lost', lostReason, lostNote });
          toast.success(
            nextMeetingAt
              ? `${name} disqualified. Their time is open again.`
              : `${name} disqualified.`,
          );
          setDisqualifying(null);
        }}
      />
      <LostReasonModal
        open={bulkLosing}
        count={selected.size}
        loading={bulk.isPending}
        onClose={() => setBulkLosing(false)}
        onConfirm={(lostReason) => {
          runBulk({ stage: 'lost', lostReason });
          setBulkLosing(false);
        }}
      />
    </>
  );
}

/** What they wrote on the booking form (e.g. "50 lac taka"), or the discovery figure if empty. */
function MonthlySales({ lead }: { lead: LeadDto }) {
  if (lead.monthlySales.trim()) return <span title={lead.monthlySales}>{lead.monthlySales}</span>;
  if (lead.discovery.monthlyRevenue != null) {
    return <>৳{formatTakaShort(lead.discovery.monthlyRevenue)}</>;
  }
  return <span className="text-neutral-400">—</span>;
}

function WebsiteLink({ website }: { website: string }) {
  const href = websiteUrl(website);
  if (!href) return <span className="text-neutral-400">—</span>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      title={href}
      className="block truncate text-neutral-700 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-700"
    >
      {websiteLabel(website)}
    </a>
  );
}

/** Row shortcut: disqualify an underqualified lead, which also frees their booked time. */
function DisqualifyButton({
  lead,
  onClick,
  className,
}: {
  lead: LeadDto;
  onClick: () => void;
  className?: string;
}) {
  if (!openStages.includes(lead.stage)) return null;
  return (
    <button
      type="button"
      title="Disqualify"
      aria-label={`Disqualify ${lead.name}`}
      onClick={onClick}
      className={cn(
        'grid size-8 place-items-center rounded-lg text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:outline-none',
        className,
      )}
    >
      <UserX className="size-4" aria-hidden />
    </button>
  );
}
