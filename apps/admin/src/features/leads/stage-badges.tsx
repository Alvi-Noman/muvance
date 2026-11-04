import {
  leadStageLabels,
  meetingStatusLabels,
  type LeadStage,
  type MeetingStatus,
  type MeetingType,
} from '@muvance/shared';
import { Badge } from '@/components/ui/misc';
import { cn } from '@/lib/cn';
import { meetingStyles, meetingTypeStyles, stageStyles } from './stages';

export function StageBadge({ stage, className }: { stage: LeadStage; className?: string }) {
  return (
    <Badge className={cn(stageStyles[stage].badge, className)}>
      <span className={cn('size-1.5 rounded-full', stageStyles[stage].dot)} />
      {leadStageLabels[stage]}
    </Badge>
  );
}

export function MeetingStatusBadge({ status }: { status: MeetingStatus }) {
  return <Badge className={meetingStyles[status]}>{meetingStatusLabels[status]}</Badge>;
}

export function MeetingTypeBadge({ type }: { type: MeetingType }) {
  return (
    <Badge className={meetingTypeStyles[type]}>
      {type === 'proposal' ? 'Proposal' : 'Discovery'}
    </Badge>
  );
}
