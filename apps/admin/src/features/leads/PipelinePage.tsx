import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { CalendarClock } from 'lucide-react';
import { Link } from 'react-router';
import { leadStageLabels, leadStages, type LeadDto, type LeadStage } from '@muvance/shared';
import { Avatar, PageHeader, Spinner } from '@/components/ui/misc';
import { useCan } from '@/features/auth/auth';
import { cn } from '@/lib/cn';
import { formatDay, formatTakaShort, formatTime } from '@/lib/format';
import { useLeads, useMoveLead } from './leads-api';
import { LostReasonModal } from './LostReasonModal';
import { stageStyles } from './stages';

export function PipelinePage() {
  const canWrite = useCan('leads:write');
  const move = useMoveLead();
  const [dragging, setDragging] = useState<LeadDto | null>(null);
  // A card dropped on Lost waits here until a reason is chosen.
  const [losing, setLosing] = useState<LeadDto | null>(null);
  const sensors = useSensors(
    // A small distance threshold so clicks still open the lead.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  const onDragStart = (e: DragStartEvent) => setDragging(e.active.data.current?.lead ?? null);
  const onDragEnd = (e: DragEndEvent) => {
    setDragging(null);
    const lead = e.active.data.current?.lead as LeadDto | undefined;
    const stage = e.over?.id as LeadStage | undefined;
    if (!lead || !stage || stage === lead.stage) return;
    if (stage === 'lost') setLosing(lead);
    else move.mutate({ id: lead.id, stage });
  };

  return (
    <>
      <PageHeader
        title="Pipeline"
        description={
          canWrite
            ? 'Drag leads between stages. Revenue is per month; % is your agreed share.'
            : 'Leads by stage.'
        }
      />
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={() => setDragging(null)}
      >
        {/* Scrolls sideways on small screens. */}
        <div className="-mx-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
          <div className="grid min-w-[72rem] grid-cols-6 gap-3">
            {leadStages.map((stage) => (
              <Column key={stage} stage={stage} draggable={canWrite} />
            ))}
          </div>
        </div>
        <LostReasonModal
          open={!!losing}
          onClose={() => setLosing(null)}
          onConfirm={(lostReason) => {
            if (losing) move.mutate({ id: losing.id, stage: 'lost', lostReason });
            setLosing(null);
          }}
        />
        <DragOverlay dropAnimation={null}>
          {dragging && <LeadCard lead={dragging} overlay />}
        </DragOverlay>
      </DndContext>
    </>
  );
}

function Column({ stage, draggable }: { stage: LeadStage; draggable: boolean }) {
  const { data, isPending } = useLeads({ stage, sort: '-lastActivityAt', page: 1, pageSize: 200 });
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const leads = data?.items ?? [];

  return (
    <section
      ref={setNodeRef}
      aria-label={leadStageLabels[stage]}
      className={cn(
        'flex max-h-[calc(100dvh-14rem)] min-h-64 flex-col rounded-2xl bg-black/[0.035] transition-colors',
        isOver && 'bg-black/[0.07] ring-2 ring-neutral-950/10',
      )}
    >
      <header className="flex items-center justify-between gap-2 px-3 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <span className={cn('size-2 rounded-full', stageStyles[stage].dot)} />
          <h2 className="text-sm font-semibold">{leadStageLabels[stage]}</h2>
          <span className="rounded-full bg-white px-1.5 text-xs font-medium text-neutral-500">
            {data?.total ?? '–'}
          </span>
        </div>
      </header>
      <div className="flex-1 space-y-2 overflow-y-auto px-2 pb-2">
        {isPending ? (
          <div className="grid h-24 place-items-center">
            <Spinner className="size-4" />
          </div>
        ) : leads.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-neutral-400">No leads</p>
        ) : (
          leads.map((lead) => <DraggableCard key={lead.id} lead={lead} disabled={!draggable} />)
        )}
      </div>
    </section>
  );
}

function DraggableCard({ lead, disabled }: { lead: LeadDto; disabled: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: lead.id,
    data: { lead },
    disabled,
  });
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className={cn(isDragging && 'opacity-30')}>
      <LeadCard lead={lead} />
    </div>
  );
}

function LeadCard({ lead, overlay }: { lead: LeadDto; overlay?: boolean }) {
  const revenue = lead.discovery.monthlyRevenue;
  const percent = lead.offer.commissionPercent;
  return (
    <Link
      to={`/leads/${lead.id}`}
      draggable={false}
      className={cn(
        'block rounded-xl border border-black/[0.06] bg-white p-3 text-sm shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-md',
        overlay && 'rotate-2 cursor-grabbing shadow-xl',
      )}
    >
      <p className="truncate font-medium">{lead.name}</p>
      <p className="truncate text-xs text-neutral-500">{lead.businessName || lead.phone}</p>
      {lead.nextMeetingAt && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-sky-700">
          <CalendarClock className="size-3.5" aria-hidden />
          {lead.nextMeetingType === 'proposal' ? 'Proposal ' : ''}
          {formatDay(lead.nextMeetingAt)}, {formatTime(lead.nextMeetingAt)}
        </p>
      )}
      {(lead.assignee || revenue != null || percent != null) && (
        <div className="mt-2.5 flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-neutral-700 tabular-nums">
            {revenue != null && `৳${formatTakaShort(revenue)}/mo`}
            {revenue != null && percent != null && ' · '}
            {percent != null && `${percent}%`}
          </span>
          {lead.assignee && <Avatar name={lead.assignee.name} className="size-5 text-[9px]" />}
        </div>
      )}
    </Link>
  );
}
