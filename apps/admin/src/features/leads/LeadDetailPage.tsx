import { useState, type ComponentProps, type FormEvent, type ReactNode } from 'react';
import {
  ArrowLeft,
  ArrowRightLeft,
  CalendarCheck,
  CalendarPlus,
  ExternalLink,
  PartyPopper,
  PencilLine,
  Phone,
  PhoneCall,
  Plus,
  Sparkles,
  StickyNote,
  Trash2,
  UserCheck,
  type LucideIcon,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import {
  lostReasonLabels,
  meetingTypeLabels,
  salesChannelLabels,
  salesChannels,
  type ActivityDto,
  type ActivityType,
  type LeadDto,
  type LeadStage,
  type LostReason,
  type MeetingDto,
  type MeetingType,
  calculateRoas,
  partnerStatusLabels,
  partnerStatuses,
  type ProductDto,
  type SalesChannel,
  isWebsite,
  WEBSITE_ERROR,
} from '@muvance/shared';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { Field, Input, Select, Textarea } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { Avatar, EmptyState, PageLoader } from '@/components/ui/misc';
import { Can } from '@/features/auth/RequireAuth';
import { useCan } from '@/features/auth/auth';
import { ApiClientError } from '@/lib/api-client';
import { cn } from '@/lib/cn';
import {
  formatDate,
  formatDateTime,
  formatDay,
  formatMoney,
  formatRelative,
  formatTakaShort,
  formatTime,
  formatWhen,
  websiteUrl,
} from '@/lib/format';
import {
  useAddActivity,
  useAssignable,
  useDeleteLead,
  useLead,
  useUpdateLead,
  useUpdateMeeting,
} from './leads-api';
import { LostReasonModal } from './LostReasonModal';
import { ScheduleMeetingModal } from './ScheduleMeetingModal';
import { MeetingStatusBadge, MeetingTypeBadge } from './stage-badges';
import { stageOptions, stageStyles } from './stages';
import { fromNumber, toNumber, useSyncedForm } from './use-synced-form';

export function LeadDetailPage() {
  const { id = '' } = useParams();
  const { data, isPending, error } = useLead(id);
  const [schedule, setSchedule] = useState<MeetingType | null>(null);
  const [losing, setLosing] = useState<LostReason | 'pick' | null>(null);

  if (isPending) return <PageLoader />;
  if (error || !data) {
    const notFound = error instanceof ApiClientError && error.status === 404;
    return (
      <EmptyState
        title={notFound ? 'Lead not found' : "Couldn't load this lead"}
        description={notFound ? 'It may have been deleted.' : 'Please try again.'}
        action={
          <Link to="/leads" className="text-sm font-medium underline-offset-4 hover:underline">
            Back to leads
          </Link>
        }
      />
    );
  }

  const { lead, meetings, activities } = data;
  return (
    <>
      <LeadHeader lead={lead} onLose={() => setLosing('pick')} />
      <NextStep
        lead={lead}
        meetings={meetings}
        onSchedule={setSchedule}
        onLose={(reason) => setLosing(reason ?? 'pick')}
      />
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-6">
          <DiscoveryCard lead={lead} />
          <OfferCard lead={lead} />
          <Can permission="leads:write">
            <ActivityComposer leadId={lead.id} />
          </Can>
          <Timeline activities={activities} />
        </div>
        <div className="space-y-6">
          <MeetingsCard meetings={meetings} onSchedule={() => setSchedule('proposal')} />
          <ContactCard lead={lead} />
        </div>
      </div>

      <ScheduleMeetingModal
        leadId={lead.id}
        leadName={lead.name}
        open={!!schedule}
        defaultType={schedule ?? 'proposal'}
        onClose={() => setSchedule(null)}
      />
      <LoseLead lead={lead} state={losing} onClose={() => setLosing(null)} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Header                                                              */
/* ------------------------------------------------------------------ */

function LeadHeader({ lead, onLose }: { lead: LeadDto; onLose: () => void }) {
  const navigate = useNavigate();
  const canWrite = useCan('leads:write');
  const update = useUpdateLead(lead.id);
  const remove = useDeleteLead();
  const assignable = useAssignable();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const website = websiteUrl(lead.website);

  const changeStage = (stage: LeadStage) => {
    if (stage === 'lost') return onLose();
    update.mutate({ stage }, { onSuccess: () => toast.success('Stage updated') });
  };

  return (
    <div className="mb-6">
      <Link
        to="/leads"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900"
      >
        <ArrowLeft className="size-4" aria-hidden />
        All leads
      </Link>
      <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="font-serif text-4xl leading-none tracking-tight sm:text-5xl">
            {lead.name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-neutral-600">
            {lead.businessName && (
              <span className="font-medium text-neutral-800">{lead.businessName}</span>
            )}
            <a
              href={`tel:${lead.phone.replace(/[^\d+]/g, '')}`}
              className="inline-flex items-center gap-1.5 hover:text-neutral-950"
            >
              <Phone className="size-3.5" aria-hidden />
              {lead.phone}
            </a>
            {website && (
              <a
                href={website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-neutral-950"
              >
                {lead.website}
                <ExternalLink className="size-3.5" aria-hidden />
              </a>
            )}
            <span className="text-neutral-400">
              {lead.source === 'website' ? 'Booked on the website' : 'Added manually'} ·{' '}
              {formatRelative(lead.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <span
              aria-hidden
              className={cn(
                'pointer-events-none absolute top-1/2 left-3 size-2 -translate-y-1/2 rounded-full',
                stageStyles[lead.stage].dot,
              )}
            />
            <select
              aria-label="Stage"
              disabled={!canWrite}
              value={lead.stage}
              onChange={(e) => changeStage(e.target.value as LeadStage)}
              className="h-10 cursor-pointer appearance-none rounded-xl border border-black/10 bg-white pr-4 pl-7 text-sm font-medium disabled:cursor-default"
            >
              {stageOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <Select
            aria-label="Owner"
            disabled={!canWrite}
            className="w-44"
            value={lead.assignee?.id ?? ''}
            onChange={(e) =>
              update.mutate(
                { assigneeId: e.target.value || null },
                { onSuccess: () => toast.success('Owner updated') },
              )
            }
          >
            <option value="">Unassigned</option>
            {assignable.data?.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </Select>
          <Can permission="leads:delete">
            <Button
              variant="danger-ghost"
              size="icon"
              aria-label="Delete lead"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="size-4" />
            </Button>
          </Can>
        </div>
      </div>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this lead?"
        description="This also deletes its meetings and timeline, and can't be undone. To close a lead normally, mark it as lost instead."
      >
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={remove.isPending}
            onClick={() =>
              remove.mutate(lead.id, {
                onSuccess: () => {
                  toast.success('Lead deleted');
                  navigate('/leads', { replace: true });
                },
              })
            }
          >
            Delete lead
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function LoseLead({
  lead,
  state,
  onClose,
}: {
  lead: LeadDto;
  state: LostReason | 'pick' | null;
  onClose: () => void;
}) {
  const update = useUpdateLead(lead.id);
  return (
    <LostReasonModal
      open={!!state}
      onClose={onClose}
      defaultReason={state && state !== 'pick' ? state : undefined}
      loading={update.isPending}
      onConfirm={(lostReason, lostNote) =>
        update.mutate(
          { stage: 'lost', lostReason, lostNote },
          {
            onSuccess: () => {
              toast.success('Marked as lost');
              onClose();
            },
          },
        )
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* Next step: guides you through the process                           */
/* ------------------------------------------------------------------ */

const steps: { stage: LeadStage; label: string }[] = [
  { stage: 'discovery_booked', label: 'Discovery call' },
  { stage: 'discovery_done', label: 'Discovery done' },
  { stage: 'team_review', label: 'Team review' },
  { stage: 'proposal_booked', label: 'Proposal' },
  { stage: 'won', label: 'Decision' },
];

function NextStep({
  lead,
  meetings,
  onSchedule,
  onLose,
}: {
  lead: LeadDto;
  meetings: MeetingDto[];
  onSchedule: (type: MeetingType) => void;
  onLose: (reason?: LostReason) => void;
}) {
  const canWrite = useCan('leads:write');
  const update = useUpdateLead(lead.id);
  const updateMeeting = useUpdateMeeting();
  const upcoming = (type: MeetingType) =>
    meetings
      .filter((m) => m.type === type && m.status === 'scheduled')
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0];
  const discovery = upcoming('discovery');
  const proposal = upcoming('proposal');
  const missedDiscovery =
    !discovery && meetings.some((m) => m.type === 'discovery' && m.status === 'no_show');

  const move = (stage: LeadStage, message: string) =>
    update.mutate({ stage }, { onSuccess: () => toast.success(message) });
  const finishProposal = () => {
    if (proposal) updateMeeting.mutate({ id: proposal.id, status: 'completed' });
  };

  let title: ReactNode;
  let body: ReactNode = null;
  let actions: ReactNode = null;

  switch (lead.stage) {
    case 'discovery_booked':
      if (discovery) {
        title = `Discovery call ${formatWhen(discovery.startsAt)} at ${formatTime(discovery.startsAt)}`;
        body = 'After the call, mark it done and fill in the discovery form below.';
        actions = (
          <>
            <Button
              onClick={() =>
                updateMeeting.mutate(
                  { id: discovery.id, status: 'completed' },
                  { onSuccess: () => toast.success('Discovery call done') },
                )
              }
            >
              Mark call done
            </Button>
            <Button
              variant="secondary"
              onClick={() => updateMeeting.mutate({ id: discovery.id, status: 'no_show' })}
            >
              They didn&apos;t show up
            </Button>
          </>
        );
      } else {
        title = missedDiscovery ? 'They missed the discovery call' : 'No discovery call scheduled';
        body = missedDiscovery
          ? 'They can rebook on the website (the lead stays open), or you can schedule a call yourself.'
          : 'Schedule the discovery call, or mark the lead as lost.';
        actions = (
          <>
            <Button onClick={() => onSchedule('discovery')}>Schedule discovery call</Button>
            <Button
              variant="secondary"
              onClick={() => onLose(missedDiscovery ? 'no_show' : undefined)}
            >
              Mark as lost
            </Button>
          </>
        );
      }
      break;
    case 'discovery_done':
      title = 'Fill in the discovery form, then send it to the team';
      body = 'The team uses these numbers to decide the sales target and your percentage.';
      actions = (
        <Button onClick={() => move('team_review', 'Sent to team review')}>
          Send to team review
        </Button>
      );
      break;
    case 'team_review':
      title = 'Agree the offer with the team';
      body =
        'Set the sales target and your percentage in the Offer section, then schedule the proposal meeting.';
      actions = (
        <>
          <Button onClick={() => onSchedule('proposal')}>
            <CalendarPlus className="size-4" aria-hidden />
            Schedule proposal meeting
          </Button>
          <Button variant="secondary" onClick={() => onLose('not_pitched')}>
            Don&apos;t pitch
          </Button>
        </>
      );
      break;
    case 'proposal_booked':
      title = proposal
        ? `Proposal meeting ${formatWhen(proposal.startsAt)} at ${formatTime(proposal.startsAt)}`
        : 'Record their answer';
      body = proposal
        ? 'After the meeting, record their answer.'
        : 'Did they say yes to the offer?';
      actions = (
        <>
          <Button
            className="bg-emerald-600 hover:bg-emerald-500"
            onClick={() => {
              finishProposal();
              move('won', 'Won! They’re now a client');
            }}
          >
            They said yes
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              finishProposal();
              onLose('declined_offer');
            }}
          >
            They said no
          </Button>
          {!proposal && (
            <Button variant="ghost" onClick={() => onSchedule('proposal')}>
              Reschedule
            </Button>
          )}
        </>
      );
      break;
    case 'won':
      title = (
        <span className="inline-flex items-center gap-2">
          <PartyPopper className="size-5 text-emerald-600" aria-hidden />
          Client since {lead.decidedAt ? formatDate(lead.decidedAt) : 'recently'}
        </span>
      );
      body =
        lead.offer.salesTarget != null || lead.offer.commissionPercent != null
          ? `Sales target ${lead.offer.salesTarget != null ? `${formatMoney(lead.offer.salesTarget)}/month` : 'not set'} · ${lead.offer.commissionPercent ?? '–'}% of sales.`
          : 'Add the agreed sales target and percentage in the Offer section.';
      break;
    case 'lost':
      title = `Lost: ${lead.lostReason ? lostReasonLabels[lead.lostReason] : 'no reason given'}`;
      body = (
        <>
          {lead.lostNote && <>“{lead.lostNote}” · </>}
          {lead.decidedAt && `${formatDate(lead.decidedAt)}. `}
          If they book again on the website, the lead re-opens automatically.
        </>
      );
      actions = (
        <Button variant="ghost" onClick={() => move('discovery_booked', 'Lead re-opened')}>
          Re-open lead
        </Button>
      );
      break;
  }

  const current = lead.stage === 'lost' ? -1 : steps.findIndex((s) => s.stage === lead.stage);

  return (
    <Card
      className={cn(
        'overflow-hidden',
        lead.stage === 'won' && 'border-emerald-200',
        lead.stage === 'lost' && 'bg-neutral-50',
      )}
    >
      {lead.stage !== 'lost' && (
        <ol className="flex border-b border-black/[0.06]" aria-label="Progress">
          {steps.map((step, i) => (
            <li
              key={step.stage}
              aria-current={i === current ? 'step' : undefined}
              className={cn(
                'flex-1 border-r border-black/[0.06] px-3 py-2.5 text-center text-xs font-medium last:border-r-0',
                i < current && 'bg-neutral-950/[0.03] text-neutral-500',
                i === current &&
                  (lead.stage === 'won'
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'bg-neutral-950 text-white'),
                i > current && 'text-neutral-400',
              )}
            >
              <span className="hidden sm:inline">{step.label}</span>
              <span className="sm:hidden">{i + 1}</span>
            </li>
          ))}
        </ol>
      )}
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-[0.12em] text-neutral-400 uppercase">
            {lead.stage === 'won' || lead.stage === 'lost' ? 'Outcome' : 'Next step'}
          </p>
          <p className="mt-1 font-semibold">{title}</p>
          {body && <p className="mt-1 text-sm text-neutral-500">{body}</p>}
        </div>
        {canWrite && actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Discovery form & offer                                              */
/* ------------------------------------------------------------------ */

function MoneyField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  const n = toNumber(value);
  const auto = n != null && !Number.isNaN(n) && n > 0 ? `= ${formatTakaShort(n)} taka` : undefined;
  return (
    <Field label={label} hint={hint ?? auto}>
      {(p) => (
        <div className="relative">
          <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-sm text-neutral-400">
            ৳
          </span>
          <Input
            {...p}
            type="number"
            min={0}
            inputMode="numeric"
            className="pl-8"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      )}
    </Field>
  );
}

function SuffixInput({ suffix, ...props }: ComponentProps<typeof Input> & { suffix: string }) {
  return (
    <div className="relative">
      <Input {...props} className="pr-9" />
      <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-sm text-neutral-400">
        {suffix}
      </span>
    </div>
  );
}

function SaveBar({
  dirty,
  onReset,
  loading,
  label = 'Save',
}: {
  dirty: boolean;
  onReset: () => void;
  loading: boolean;
  label?: string;
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      {dirty && <span className="mr-auto text-xs text-amber-700">Unsaved changes</span>}
      {dirty && (
        <Button variant="ghost" onClick={onReset}>
          Discard
        </Button>
      )}
      <Button type="submit" disabled={!dirty} loading={loading}>
        {label}
      </Button>
    </div>
  );
}

type ProductRow = { name: string; purchasePrice: string; sellingPrice: string };
const emptyProduct: ProductRow = { name: '', purchasePrice: '', sellingPrice: '' };

const toProductRows = (products: ProductDto[]): ProductRow[] =>
  products.length
    ? products.map((p) => ({
        name: p.name,
        purchasePrice: fromNumber(p.purchasePrice),
        sellingPrice: fromNumber(p.sellingPrice),
      }))
    : [emptyProduct];

/** Rows with anything filled in, as saved on the lead. */
const fromProductRows = (rows: ProductRow[]): ProductDto[] =>
  rows
    .filter((r) => r.name.trim() || r.purchasePrice.trim() || r.sellingPrice.trim())
    .map((r) => ({
      name: r.name.trim(),
      purchasePrice: toNumber(r.purchasePrice),
      sellingPrice: toNumber(r.sellingPrice),
    }));

/** "Profit ৳700 per sale · 58% margin", once both prices are known. */
function profitHint(row: ProductRow) {
  const buy = toNumber(row.purchasePrice);
  const sell = toNumber(row.sellingPrice);
  if (buy == null || sell == null || Number.isNaN(buy) || Number.isNaN(sell) || sell <= 0) {
    return null;
  }
  const profit = sell - buy;
  return {
    loss: profit < 0,
    text: `${profit < 0 ? 'Loss' : 'Profit'} ${formatMoney(Math.abs(profit))} per sale · ${Math.round((profit / sell) * 100)}% margin`,
  };
}

function ProductsField({
  rows,
  onChange,
  editable,
}: {
  rows: ProductRow[];
  onChange: (rows: ProductRow[]) => void;
  editable: boolean;
}) {
  const setRow = (i: number, patch: Partial<ProductRow>) =>
    onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-neutral-800">Best-selling products</legend>
      <ul className="space-y-3">
        {rows.map((row, i) => {
          const hint = profitHint(row);
          return (
            <li key={i} className="rounded-xl border border-black/[0.07] bg-neutral-50/60 p-3.5">
              <div className="mb-2.5 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">Product {i + 1}</p>
                {editable && rows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onChange(rows.filter((_, j) => j !== i))}
                    aria-label={`Remove product ${i + 1}`}
                    className="grid size-7 place-items-center rounded-lg text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Product name">
                  {(p) => (
                    <Input
                      {...p}
                      placeholder="e.g. Kurti"
                      value={row.name}
                      onChange={(e) => setRow(i, { name: e.target.value })}
                    />
                  )}
                </Field>
                <MoneyField
                  label="Purchasing price"
                  value={row.purchasePrice}
                  onChange={(x) => setRow(i, { purchasePrice: x })}
                  hint=""
                />
                <MoneyField
                  label="Selling price"
                  value={row.sellingPrice}
                  onChange={(x) => setRow(i, { sellingPrice: x })}
                  hint=""
                />
              </div>
              {hint && (
                <p
                  className={cn(
                    'mt-2.5 text-xs font-medium',
                    hint.loss ? 'text-red-600' : 'text-emerald-700',
                  )}
                >
                  {hint.text}
                </p>
              )}
            </li>
          );
        })}
      </ul>
      {editable && (
        <Button
          variant="secondary"
          size="sm"
          className="mt-3"
          onClick={() => onChange([...rows, emptyProduct])}
        >
          <Plus className="size-4" aria-hidden />
          Add product
        </Button>
      )}
    </fieldset>
  );
}

/** One numbered step of the discovery call, in the order you go through them. */
function Step({ n, children }: { n: number; children: ReactNode }) {
  return (
    <li className="flex gap-3 py-5 first:pt-0 sm:gap-4">
      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-neutral-950 text-xs font-semibold text-white tabular-nums">
        {n}
      </span>
      <div className="min-w-0 flex-1 space-y-3">{children}</div>
    </li>
  );
}

const stepLabel = 'text-sm font-medium text-neutral-800';

/** Pick one (or none: clicking the chosen option clears it). */
function ChoicePills<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T | null) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const on = value === o.value;
        return (
          <button
            key={String(o.value)}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? null : o.value)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-sm transition-colors disabled:cursor-default',
              on
                ? 'border-neutral-950 bg-neutral-950 text-white'
                : 'border-black/10 bg-white text-neutral-600 hover:border-black/30',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

const formatRoas = (roas: number) => `${Number(roas.toFixed(2))}X`;

/** Updates as you type ad spend and delivered sales, so you can say the number on the call. */
function RoasResult({ adSpend, delivered }: { adSpend: number | null; delivered: number | null }) {
  const roas = calculateRoas(adSpend, delivered);
  return (
    <div
      aria-live="polite"
      className={cn(
        'rounded-xl p-4',
        roas == null
          ? 'bg-neutral-100 text-neutral-500'
          : 'border border-hud/40 bg-hud/10 text-neutral-950 shadow-[0_0_28px_-8px_rgb(92_225_255/0.6)]',
      )}
    >
      {roas == null ? (
        <p className="text-sm">
          Fill in ad spend and delivered sales, and ROAS is calculated here.
        </p>
      ) : (
        <>
          <p className="font-serif text-5xl leading-none text-hud tabular-nums [text-shadow:0_0_24px_rgb(92_225_255/0.6)]">
            {formatRoas(roas)}
          </p>
          <p className="mt-2 text-xs text-neutral-500 tabular-nums">
            {formatMoney(delivered!)} delivered ÷ {formatMoney(adSpend!)} ad spend
          </p>
        </>
      )}
    </div>
  );
}

function DiscoveryCard({ lead }: { lead: LeadDto }) {
  const canWrite = useCan('leads:write');
  const update = useUpdateLead(lead.id);
  const d = lead.discovery;
  const form = useSyncedForm({
    monthlyRevenue: fromNumber(d.monthlyRevenue),
    targetRevenue: fromNumber(d.targetRevenue),
    targetMonths: d.targetMonths,
    adsRunBy: d.adsRunBy,
    partnerStatus: d.partnerStatus,
    monthlyAdSpend: fromNumber(d.monthlyAdSpend),
    deliveredSales: fromNumber(d.deliveredSales),
    products: toProductRows(d.products),
    productNotes: d.productNotes,
    returnsPerTen: fromNumber(d.returnsPerTen),
    whyAgency: d.whyAgency,
    businessType: d.businessType,
    averageOrderValue: fromNumber(d.averageOrderValue),
    channels: d.channels,
    notes: d.notes,
  });
  const v = form.values;
  const revenue = toNumber(v.monthlyRevenue);
  const target = toNumber(v.targetRevenue);
  const adSpend = toNumber(v.monthlyAdSpend);
  const delivered = toNumber(v.deliveredSales);
  const returns = toNumber(v.returnsPerTen);

  const save = (e: FormEvent) => {
    e.preventDefault();
    update.mutate(
      {
        discovery: {
          monthlyRevenue: revenue,
          targetRevenue: target,
          targetMonths: v.targetMonths,
          adsRunBy: v.adsRunBy,
          partnerStatus: v.partnerStatus,
          monthlyAdSpend: adSpend,
          deliveredSales: delivered,
          products: fromProductRows(v.products),
          productNotes: v.productNotes,
          returnsPerTen: returns,
          whyAgency: v.whyAgency,
          businessType: v.businessType,
          averageOrderValue: toNumber(v.averageOrderValue),
          channels: v.channels,
          notes: v.notes,
        },
      },
      { onSuccess: () => toast.success('Discovery form saved') },
    );
  };

  const toggleChannel = (c: SalesChannel) =>
    form.set(
      'channels',
      v.channels.includes(c) ? v.channels.filter((x) => x !== c) : [...v.channels, c],
    );

  return (
    <Card>
      <CardHeader title="Discovery" description="What you learn on the first call, in order." />
      <form onSubmit={save} className="space-y-5 p-5">
        <fieldset disabled={!canWrite} className="space-y-5">
          <ol className="divide-y divide-black/[0.06]">
            <Step n={1}>
              <MoneyField
                label="Current monthly revenue"
                value={v.monthlyRevenue}
                onChange={(x) => form.set('monthlyRevenue', x)}
              />
            </Step>

            <Step n={2}>
              <MoneyField
                label="Revenue goal"
                value={v.targetRevenue}
                onChange={(x) => form.set('targetRevenue', x)}
                hint={
                  revenue && target && revenue > 0
                    ? `= ${formatTakaShort(target)} taka · ${Number((target / revenue).toFixed(1))}× today`
                    : undefined
                }
              />
              <div>
                <p className={cn(stepLabel, 'mb-2')}>Timeframe</p>
                <ChoicePills
                  label="Timeframe"
                  options={[
                    { value: 3, label: '3 months' },
                    { value: 6, label: '6 months' },
                  ]}
                  value={v.targetMonths}
                  onChange={(x) => form.set('targetMonths', x as 3 | 6 | null)}
                />
              </div>
            </Step>

            <Step n={3}>
              <Field label="Who runs their ads">
                {(p) => (
                  <Input
                    {...p}
                    placeholder="e.g. The owner, a freelancer, an agency"
                    value={v.adsRunBy}
                    onChange={(e) => form.set('adsRunBy', e.target.value)}
                  />
                )}
              </Field>
            </Step>

            <Step n={4}>
              <div>
                <p className={cn(stepLabel, 'mb-2')}>Alone or with a partner</p>
                <ChoicePills
                  label="Alone or with a partner"
                  options={partnerStatuses.map((s) => ({
                    value: s,
                    label: partnerStatusLabels[s],
                  }))}
                  value={v.partnerStatus}
                  onChange={(x) => form.set('partnerStatus', x)}
                />
              </div>
            </Step>

            <Step n={5}>
              <MoneyField
                label="Ad spend, last 30 days"
                value={v.monthlyAdSpend}
                onChange={(x) => form.set('monthlyAdSpend', x)}
                hint={
                  adSpend && revenue && revenue > 0
                    ? `= ${formatTakaShort(adSpend)} taka · ${Math.round((adSpend / revenue) * 100)}% of revenue`
                    : undefined
                }
              />
            </Step>

            <Step n={6}>
              <MoneyField
                label="Delivered sales, last 30 days"
                value={v.deliveredSales}
                onChange={(x) => form.set('deliveredSales', x)}
              />
            </Step>

            <Step n={7}>
              <ProductsField
                rows={v.products}
                onChange={(rows) => form.set('products', rows)}
                editable={canWrite}
              />
              <Field label="Product discussion">
                {(p) => (
                  <Textarea
                    {...p}
                    rows={2}
                    value={v.productNotes}
                    onChange={(e) => form.set('productNotes', e.target.value)}
                  />
                )}
              </Field>
            </Step>

            <Step n={8}>
              <div>
                <p className={cn(stepLabel, 'mb-2')}>ROAS</p>
                <RoasResult adSpend={adSpend} delivered={delivered} />
              </div>
            </Step>

            <Step n={9}>
              <Field
                label="Return parcels out of 10"
                hint={
                  returns != null && returns >= 0 && returns <= 10
                    ? `= ${returns * 10}% returned`
                    : undefined
                }
              >
                {(p) => (
                  <div className="relative">
                    <Input
                      {...p}
                      type="number"
                      min={0}
                      max={10}
                      step={1}
                      inputMode="numeric"
                      className="pr-16"
                      value={v.returnsPerTen}
                      onChange={(e) => form.set('returnsPerTen', e.target.value)}
                    />
                    <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-sm text-neutral-400">
                      out of 10
                    </span>
                  </div>
                )}
              </Field>
            </Step>

            <Step n={10}>
              <Field label="Why they want an agency">
                {(p) => (
                  <Textarea
                    {...p}
                    rows={3}
                    value={v.whyAgency}
                    onChange={(e) => form.set('whyAgency', e.target.value)}
                  />
                )}
              </Field>
            </Step>
          </ol>

          <div className="space-y-4 border-t border-black/[0.06] pt-5">
            <p className="text-sm font-semibold">More details</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="What's the business?">
                {(p) => (
                  <Input
                    {...p}
                    placeholder="e.g. Women's fashion brand"
                    value={v.businessType}
                    onChange={(e) => form.set('businessType', e.target.value)}
                  />
                )}
              </Field>
              <MoneyField
                label="Average order value"
                value={v.averageOrderValue}
                onChange={(x) => form.set('averageOrderValue', x)}
              />
            </div>

            <fieldset>
              <legend className="mb-2 text-sm font-medium text-neutral-800">Where they sell</legend>
              <div className="flex flex-wrap gap-1.5">
                {salesChannels.map((c) => {
                  const on = v.channels.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggleChannel(c)}
                      className={cn(
                        'rounded-full border px-3 py-1.5 text-sm transition-colors disabled:cursor-default',
                        on
                          ? 'border-neutral-950 bg-neutral-950 text-white'
                          : 'border-black/10 bg-white text-neutral-600 hover:border-black/30',
                      )}
                    >
                      {salesChannelLabels[c]}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <Field label="Notes from the call">
              {(p) => (
                <Textarea
                  {...p}
                  rows={4}
                  placeholder="Goals, problems, what's worked before, competitors…"
                  value={v.notes}
                  onChange={(e) => form.set('notes', e.target.value)}
                />
              )}
            </Field>
          </div>
        </fieldset>
        {canWrite && (
          <SaveBar
            dirty={form.dirty}
            onReset={form.reset}
            loading={update.isPending}
            label="Save discovery"
          />
        )}
      </form>
    </Card>
  );
}

function OfferCard({ lead }: { lead: LeadDto }) {
  const canWrite = useCan('leads:write');
  const update = useUpdateLead(lead.id);
  const form = useSyncedForm({
    salesTarget: fromNumber(lead.offer.salesTarget),
    commissionPercent: fromNumber(lead.offer.commissionPercent),
    notes: lead.offer.notes,
  });
  const v = form.values;
  const target = toNumber(v.salesTarget);
  const percent = toNumber(v.commissionPercent);

  const save = (e: FormEvent) => {
    e.preventDefault();
    update.mutate(
      { offer: { salesTarget: target, commissionPercent: percent, notes: v.notes } },
      { onSuccess: () => toast.success('Offer saved') },
    );
  };

  return (
    <Card>
      <CardHeader title="Offer" description="Decided with the team before the proposal meeting." />
      <form onSubmit={save} className="space-y-4 p-5">
        <fieldset disabled={!canWrite} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <MoneyField
              label="Monthly sales target"
              value={v.salesTarget}
              onChange={(x) => form.set('salesTarget', x)}
              hint={
                target
                  ? `= ${formatTakaShort(target)} taka. No fees until they reach it.`
                  : 'No fees until they reach it.'
              }
            />
            <Field label="Your share of sales">
              {(p) => (
                <SuffixInput
                  {...p}
                  suffix="%"
                  type="number"
                  min={0}
                  max={100}
                  step="0.5"
                  inputMode="decimal"
                  value={v.commissionPercent}
                  onChange={(e) => form.set('commissionPercent', e.target.value)}
                />
              )}
            </Field>
          </div>
          {target != null && percent != null && target > 0 && (
            <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              At the target, Muvance earns{' '}
              <span className="font-semibold">{formatMoney((target * percent) / 100)}</span> a
              month.
            </p>
          )}
          <Field label="Team notes" hint="Internal only. The client never sees this.">
            {(p) => (
              <Textarea
                {...p}
                rows={3}
                value={v.notes}
                onChange={(e) => form.set('notes', e.target.value)}
              />
            )}
          </Field>
        </fieldset>
        {canWrite && (
          <SaveBar
            dirty={form.dirty}
            onReset={form.reset}
            loading={update.isPending}
            label="Save offer"
          />
        )}
      </form>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Activity                                                            */
/* ------------------------------------------------------------------ */

function ActivityComposer({ leadId }: { leadId: string }) {
  const add = useAddActivity(leadId);
  const [type, setType] = useState<'note' | 'call'>('note');
  const [body, setBody] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    add.mutate(
      { type, body },
      {
        onSuccess: () => {
          setBody('');
          toast.success(type === 'note' ? 'Note added' : 'Call logged');
        },
      },
    );
  };

  return (
    <Card>
      <form onSubmit={submit} className="p-4">
        <div className="mb-3 flex gap-1" role="tablist">
          {(['note', 'call'] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={type === t}
              onClick={() => setType(t)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                type === t ? 'bg-neutral-950 text-white' : 'text-neutral-500 hover:bg-neutral-100',
              )}
            >
              {t === 'note' ? (
                <StickyNote className="size-3.5" />
              ) : (
                <PhoneCall className="size-3.5" />
              )}
              {t === 'note' ? 'Note' : 'Log a call'}
            </button>
          ))}
        </div>
        <Textarea
          aria-label={type === 'note' ? 'Note' : 'Call summary'}
          rows={3}
          placeholder={type === 'note' ? 'Write a note…' : 'What was discussed?'}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit(e);
          }}
        />
        <div className="mt-3 flex items-center justify-between">
          <span className="hidden text-xs text-neutral-400 sm:inline">Ctrl + Enter to save</span>
          <Button
            type="submit"
            size="sm"
            loading={add.isPending}
            disabled={!body.trim()}
            className="ml-auto"
          >
            {type === 'note' ? 'Add note' : 'Log call'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

const activityIcons: Record<ActivityType, LucideIcon> = {
  created: Sparkles,
  note: StickyNote,
  call: PhoneCall,
  stage_changed: ArrowRightLeft,
  assigned: UserCheck,
  updated: PencilLine,
  meeting_booked: CalendarPlus,
  meeting_updated: CalendarCheck,
};

function Timeline({ activities }: { activities: ActivityDto[] }) {
  return (
    <Card>
      <CardHeader
        title="Activity"
        description={`${activities.length} ${activities.length === 1 ? 'event' : 'events'}`}
      />
      {activities.length === 0 ? (
        <EmptyState title="No activity yet" />
      ) : (
        <ol className="px-5 py-4">
          {activities.map((activity, i) => {
            const Icon = activityIcons[activity.type];
            const isText = activity.type === 'note' || activity.type === 'call';
            return (
              <li key={activity.id} className="relative flex gap-4 pb-6 last:pb-0">
                {i < activities.length - 1 && (
                  <span
                    className="absolute top-9 bottom-0 left-[17px] w-px bg-black/[0.07]"
                    aria-hidden
                  />
                )}
                <span
                  className={cn(
                    'relative grid size-9 shrink-0 place-items-center rounded-full',
                    isText ? 'bg-neutral-950 text-white' : 'bg-neutral-100 text-neutral-500',
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1 pt-1.5">
                  <p className="text-sm">
                    <span className="font-medium">{activity.actor?.name ?? 'Website'}</span>{' '}
                    <span className="text-neutral-400" title={formatDateTime(activity.createdAt)}>
                      · {formatRelative(activity.createdAt)}
                    </span>
                  </p>
                  {isText ? (
                    <div className="mt-2 rounded-xl bg-neutral-50 px-3.5 py-2.5 text-sm whitespace-pre-wrap text-neutral-800">
                      {activity.type === 'call' && (
                        <p className="mb-1 text-xs font-medium text-neutral-500">Call</p>
                      )}
                      {activity.body}
                    </div>
                  ) : (
                    <p className="mt-0.5 text-sm text-neutral-600">{activity.body}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Side column                                                         */
/* ------------------------------------------------------------------ */

function MeetingsCard({
  meetings,
  onSchedule,
}: {
  meetings: MeetingDto[];
  onSchedule: () => void;
}) {
  const canWrite = useCan('leads:write');
  const update = useUpdateMeeting();

  return (
    <Card>
      <CardHeader
        title="Meetings"
        description={meetings.length ? undefined : 'None yet'}
        action={
          canWrite && (
            <Button size="sm" variant="secondary" onClick={onSchedule}>
              <CalendarPlus className="size-3.5" aria-hidden />
              Schedule
            </Button>
          )
        }
      />
      {meetings.length > 0 && (
        <ul className="divide-y divide-black/[0.05]">
          {meetings.map((m) => (
            <li key={m.id} className="px-5 py-3.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 text-sm font-medium">
                    {formatDay(m.startsAt)}
                    <MeetingTypeBadge type={m.type} />
                  </p>
                  <p className="text-sm text-neutral-500">
                    {formatTime(m.startsAt)} – {formatTime(m.endsAt)}
                  </p>
                </div>
                <MeetingStatusBadge status={m.status} />
              </div>
              {canWrite && m.status === 'scheduled' && (
                <div className="mt-3 flex flex-wrap gap-1.5">
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
                      confirm(
                        `Cancel this ${meetingTypeLabels[m.type].toLowerCase()}? The time opens up again.`,
                      ) && update.mutate({ id: m.id, status: 'cancelled' })
                    }
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function ContactCard({ lead }: { lead: LeadDto }) {
  const canWrite = useCan('leads:write');
  const update = useUpdateLead(lead.id);
  const form = useSyncedForm({
    name: lead.name,
    phone: lead.phone,
    businessName: lead.businessName,
    website: lead.website,
    tags: lead.tags.join(', '),
  });
  const v = form.values;
  const [checkWebsite, setCheckWebsite] = useState(false);
  const websiteError =
    checkWebsite && v.website.trim() && !isWebsite(v.website) ? WEBSITE_ERROR : undefined;

  const save = (e: FormEvent) => {
    e.preventDefault();
    setCheckWebsite(true);
    if (v.website.trim() && !isWebsite(v.website)) return;
    update.mutate(
      {
        name: v.name,
        phone: v.phone,
        businessName: v.businessName,
        website: v.website,
        tags: v.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      },
      { onSuccess: () => toast.success('Contact details saved') },
    );
  };

  return (
    <Card>
      <CardHeader title="Contact" />
      <form onSubmit={save} className="space-y-4 p-5">
        <fieldset disabled={!canWrite} className="space-y-4">
          <Field label="Name">
            {(p) => (
              <Input {...p} value={v.name} onChange={(e) => form.set('name', e.target.value)} />
            )}
          </Field>
          <Field label="Phone">
            {(p) => (
              <Input
                {...p}
                type="tel"
                value={v.phone}
                onChange={(e) => form.set('phone', e.target.value)}
              />
            )}
          </Field>
          <Field label="Business name">
            {(p) => (
              <Input
                {...p}
                value={v.businessName}
                onChange={(e) => form.set('businessName', e.target.value)}
              />
            )}
          </Field>
          <Field label="Website" error={websiteError}>
            {(p) => (
              <Input
                {...p}
                inputMode="url"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="yourbrand.com"
                value={v.website}
                onChange={(e) => form.set('website', e.target.value)}
              />
            )}
          </Field>
          <Field label="Tags" hint="Separate with commas, e.g. fashion, referral">
            {(p) => (
              <Input {...p} value={v.tags} onChange={(e) => form.set('tags', e.target.value)} />
            )}
          </Field>
        </fieldset>
        {(lead.monthlySales || lead.message) && (
          <div className="space-y-1 rounded-xl bg-neutral-50 px-3.5 py-3 text-sm">
            <p className="text-xs font-medium text-neutral-500">When they booked</p>
            {lead.monthlySales && <p>Monthly sales: {lead.monthlySales}</p>}
            {lead.message && <p className="text-neutral-600">“{lead.message}”</p>}
          </div>
        )}
        {canWrite && <SaveBar dirty={form.dirty} onReset={form.reset} loading={update.isPending} />}
        {lead.assignee && (
          <p className="flex items-center gap-2 border-t border-black/[0.06] pt-4 text-xs text-neutral-500">
            <Avatar name={lead.assignee.name} className="size-5 text-[9px]" />
            Owned by {lead.assignee.name}
          </p>
        )}
      </form>
    </Card>
  );
}
