import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { meetingTypeLabels, type MeetingType } from '@muvance/shared';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { errorMessage } from '@/lib/api-client';
import { cn } from '@/lib/cn';
import { formatDateTime } from '@/lib/format';
import { useScheduleMeeting } from './leads-api';

type ScheduleMeetingModalProps = {
  leadId: string;
  leadName: string;
  open: boolean;
  onClose: () => void;
  defaultType?: MeetingType;
};

const pad = (n: number) => String(n).padStart(2, '0');
const toDateValue = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** You pick the time yourself (it doesn't have to match the website's booking hours). */
export function ScheduleMeetingModal({
  leadId,
  leadName,
  open,
  onClose,
  defaultType = 'proposal',
}: ScheduleMeetingModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Schedule a meeting"
      description={`With ${leadName}. Times are in your own time zone.`}
    >
      {open && <ScheduleForm key={defaultType} {...{ leadId, onClose, defaultType }} />}
    </Modal>
  );
}

function ScheduleForm({
  leadId,
  onClose,
  defaultType,
}: {
  leadId: string;
  onClose: () => void;
  defaultType: MeetingType;
}) {
  const schedule = useScheduleMeeting(leadId);
  // Read the clock once, when the form opens (not on every render).
  const [today] = useState(() => toDateValue(new Date()));
  const [type, setType] = useState<MeetingType>(defaultType);
  const [date, setDate] = useState(() => toDateValue(new Date(Date.now() + 24 * 60 * 60_000)));
  const [time, setTime] = useState('11:00');
  const [duration, setDuration] = useState(30);

  const startsAt = date && time ? new Date(`${date}T${time}`) : null;
  const valid = !!startsAt && !Number.isNaN(startsAt.getTime());

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    schedule.mutate(
      { type, startsAt: startsAt!.toISOString(), durationMinutes: duration },
      {
        onSuccess: () => {
          toast.success(`${meetingTypeLabels[type]} scheduled`);
          onClose();
        },
      },
    );
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-neutral-800">Meeting</legend>
        <div className="grid grid-cols-2 gap-2">
          {(['proposal', 'discovery'] as const).map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={type === t}
              onClick={() => setType(t)}
              className={cn(
                'rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors',
                type === t
                  ? 'border-neutral-950 bg-neutral-950 text-white'
                  : 'border-black/10 hover:border-black/25',
              )}
            >
              {meetingTypeLabels[t]}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Date">
          {(p) => (
            <Input
              {...p}
              type="date"
              required
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          )}
        </Field>
        <Field label="Time">
          {(p) => (
            <Input
              {...p}
              type="time"
              required
              step={300}
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          )}
        </Field>
      </div>
      <Field label="Length">
        {(p) => (
          <Select {...p} value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
            {[30, 45, 60, 90].map((m) => (
              <option key={m} value={m}>
                {m} minutes
              </option>
            ))}
          </Select>
        )}
      </Field>
      {valid && (
        <p className="rounded-xl bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
          {meetingTypeLabels[type]} on{' '}
          <span className="font-medium text-neutral-900">
            {formatDateTime(startsAt!.toISOString())}
          </span>
          .{type === 'proposal' && ' The lead moves to "Proposal booked".'}
        </p>
      )}
      {schedule.isError && (
        <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {errorMessage(schedule.error)}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={!valid} loading={schedule.isPending}>
          Schedule
        </Button>
      </div>
    </form>
  );
}
