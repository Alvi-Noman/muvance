import { CalendarCheck, Monitor, PlayCircle, Smartphone, Tablet } from 'lucide-react';
import { Link } from 'react-router';
import type { RecordingDto } from '@muvance/shared';
import { Badge } from '@/components/ui/misc';
import { cn } from '@/lib/cn';
import { formatDay, formatTime } from '@/lib/format';
import { formatDuration, pageName } from './recordings-api';

const deviceIcons = { mobile: Smartphone, tablet: Tablet, desktop: Monitor };

export function SourceBadge({ source }: { source: RecordingDto['source'] }) {
  return (
    <Badge
      className={cn(source.fromAd ? 'bg-blue-50 text-blue-700' : 'bg-neutral-100 text-neutral-600')}
    >
      {source.label}
      {source.campaign && <span className="font-normal opacity-75">· {source.campaign}</span>}
    </Badge>
  );
}

export function DeviceLabel({ device }: { device: RecordingDto['device'] }) {
  const Icon = deviceIcons[device.type];
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-neutral-500">
      <Icon className="size-4 shrink-0" aria-hidden />
      {device.browser} · {device.os}
    </span>
  );
}

/** One recorded visit in a list; the whole row opens the player. */
export function RecordingRow({ rec, showLead = true }: { rec: RecordingDto; showLead?: boolean }) {
  return (
    <li>
      <Link
        to={`/recordings/${rec.id}`}
        className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-black/[0.03]"
      >
        <PlayCircle className="mt-0.5 size-5 shrink-0 text-hud" aria-hidden />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-medium text-neutral-900">
              {formatDay(rec.startedAt)}, {formatTime(rec.startedAt)}
            </span>
            <span className="text-sm text-neutral-500 tabular-nums">
              {formatDuration(rec.durationMs)}
            </span>
            {rec.visitNumber > 1 && (
              <Badge className="bg-neutral-100 text-neutral-600">Visit {rec.visitNumber}</Badge>
            )}
            {rec.booked && (
              <Badge className="bg-emerald-50 text-emerald-700">
                <CalendarCheck className="size-3" aria-hidden />
                Booked a call
              </Badge>
            )}
          </div>
          <p className="mt-0.5 truncate text-sm text-neutral-600">
            {rec.pages.map(pageName).join(' → ')}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <SourceBadge source={rec.source} />
            <DeviceLabel device={rec.device} />
            {showLead && rec.lead && (
              <span className="text-sm font-medium text-neutral-900">{rec.lead.name}</span>
            )}
          </div>
        </div>
      </Link>
    </li>
  );
}
