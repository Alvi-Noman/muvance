import {
  leadStageLabels,
  leadStages,
  lostReasonLabels,
  lostReasons,
  type LeadStage,
  type MeetingStatus,
  type MeetingType,
} from '@muvance/shared';

export const stageStyles: Record<LeadStage, { badge: string; dot: string; bar: string }> = {
  discovery_booked: { badge: 'bg-sky-50 text-sky-700', dot: 'bg-sky-500', bar: 'bg-sky-400' },
  discovery_done: {
    badge: 'bg-violet-50 text-violet-700',
    dot: 'bg-violet-500',
    bar: 'bg-violet-400',
  },
  team_review: { badge: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500', bar: 'bg-amber-400' },
  proposal_booked: {
    badge: 'bg-orange-50 text-orange-700',
    dot: 'bg-orange-500',
    bar: 'bg-orange-400',
  },
  won: { badge: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500', bar: 'bg-emerald-500' },
  lost: { badge: 'bg-neutral-100 text-neutral-600', dot: 'bg-neutral-400', bar: 'bg-neutral-300' },
};

export const stageOptions = leadStages.map((stage) => ({
  value: stage,
  label: leadStageLabels[stage],
}));

export const lostReasonOptions = lostReasons.map((reason) => ({
  value: reason,
  label: lostReasonLabels[reason],
}));

export const meetingStyles: Record<MeetingStatus, string> = {
  scheduled: 'bg-sky-50 text-sky-700',
  completed: 'bg-emerald-50 text-emerald-700',
  no_show: 'bg-amber-50 text-amber-700',
  cancelled: 'bg-neutral-100 text-neutral-500',
};

export const meetingTypeStyles: Record<MeetingType, string> = {
  discovery: 'bg-neutral-100 text-neutral-700',
  proposal: 'bg-neutral-950 text-white',
};
