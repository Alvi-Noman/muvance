import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarOff, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { BlockedTime, BlockedTimeInput } from '@muvance/shared';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { Field, Input, Select } from '@/components/ui/Field';
import { Spinner } from '@/components/ui/misc';
import { api, errorMessage } from '@/lib/api-client';
import {
  blockedTimesKey,
  formatDateKey,
  formatMinutes,
  TIMES,
  todayIn,
  useAvailabilitySettings,
  useBlockedTimes,
} from './booking-settings';

/** End times: 30-minute steps up to midnight. */
const END_TIMES = [...TIMES.slice(1), 1440];

const describeDates = (b: Pick<BlockedTime, 'startDate' | 'endDate'>) =>
  b.startDate === b.endDate
    ? formatDateKey(b.startDate)
    : `${formatDateKey(b.startDate)} – ${formatDateKey(b.endDate)}`;

const describeTimes = (b: Pick<BlockedTime, 'from' | 'to' | 'startDate' | 'endDate'>) =>
  b.from === null || b.to === null
    ? b.startDate === b.endDate
      ? 'Whole day'
      : 'Whole days'
    : `${formatMinutes(b.from)} – ${formatMinutes(b.to)}${b.startDate === b.endDate ? '' : ' each day'}`;

export function BlockedTimesCard() {
  const timeZone = useAvailabilitySettings().data?.hostTimeZone ?? 'Asia/Dhaka';
  const blocked = useBlockedTimes();
  const queryClient = useQueryClient();

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/settings/blocked-times/${id}`),
    onSuccess: () => toast.success('Unblocked. People can book that time again.'),
    onError: (error) => toast.error(errorMessage(error)),
    onSettled: () => queryClient.invalidateQueries({ queryKey: blockedTimesKey }),
  });

  return (
    <Card>
      <CardHeader
        title="Blocked times"
        description={`Days or hours nobody can book, on top of the weekly hours (${timeZone} time).`}
      />
      <BlockForm timeZone={timeZone} />

      <div className="border-t border-black/[0.06] p-5">
        <h3 className="mb-3 text-sm font-medium text-neutral-800">Upcoming</h3>
        {blocked.isPending ? (
          <div className="grid h-16 place-items-center">
            <Spinner />
          </div>
        ) : !blocked.data?.length ? (
          <p className="flex items-center gap-2 rounded-xl bg-neutral-50 px-4 py-3 text-sm text-neutral-500">
            <CalendarOff className="size-4" aria-hidden />
            Nothing blocked. The weekly hours apply every week.
          </p>
        ) : (
          <ul className="divide-y divide-black/[0.06] rounded-xl border border-black/[0.06]">
            {blocked.data.map((b) => (
              <li key={b.id} className="flex items-center gap-3 px-3 py-2.5">
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-medium text-neutral-900">{describeDates(b)}</p>
                  <p className="text-neutral-500">
                    {describeTimes(b)}
                    {b.note && <span> · {b.note}</span>}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="danger-ghost"
                  size="icon"
                  aria-label={`Unblock ${describeDates(b)}`}
                  title="Unblock"
                  loading={remove.isPending && remove.variables === b.id}
                  onClick={() => remove.mutate(b.id)}
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}

function BlockForm({ timeZone }: { timeZone: string }) {
  const queryClient = useQueryClient();
  const today = todayIn(timeZone);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [wholeDay, setWholeDay] = useState(true);
  const [from, setFrom] = useState(14 * 60);
  const [to, setTo] = useState(16 * 60);
  const [note, setNote] = useState('');

  const add = useMutation({
    mutationFn: (input: BlockedTimeInput) =>
      api.post<{ blockedTime: BlockedTime; alreadyBooked: number }>(
        '/settings/blocked-times',
        input,
      ),
    onSuccess: ({ alreadyBooked }) => {
      void queryClient.invalidateQueries({ queryKey: blockedTimesKey });
      toast.success('Blocked. Nobody can book that time on the website.');
      if (alreadyBooked) {
        toast.warning(
          `${alreadyBooked} ${alreadyBooked === 1 ? 'call was' : 'calls were'} already booked in that time and ${alreadyBooked === 1 ? 'is' : 'are'} kept. Reschedule from Meetings if needed.`,
          { duration: 10_000 },
        );
      }
      setNote('');
    },
  });

  const endBeforeStart = endDate < startDate;
  const timesInvalid = !wholeDay && to <= from;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    add.mutate({
      startDate,
      endDate,
      from: wholeDay ? null : from,
      to: wholeDay ? null : to,
      note,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4 p-5">
      <div className="grid grid-cols-2 gap-3">
        <Field label="From date">
          {(p) => (
            <Input
              {...p}
              type="date"
              required
              min={today}
              value={startDate}
              onChange={(e) => {
                const value = e.target.value;
                setStartDate(value);
                // Keep the range valid: a single day unless they pick a later end.
                if (value && (endDate < value || endDate === startDate)) setEndDate(value);
              }}
            />
          )}
        </Field>
        <Field label="To date" error={endBeforeStart ? 'Must be on or after the start' : undefined}>
          {(p) => (
            <Input
              {...p}
              type="date"
              required
              min={startDate}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          )}
        </Field>
      </div>

      <label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm font-medium text-neutral-800">
        <input
          type="checkbox"
          className="size-4 accent-neutral-950"
          checked={wholeDay}
          onChange={(e) => setWholeDay(e.target.checked)}
        />
        Whole day
      </label>

      {!wholeDay && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="From">
            {(p) => (
              <Select {...p} value={from} onChange={(e) => setFrom(Number(e.target.value))}>
                {TIMES.map((m) => (
                  <option key={m} value={m}>
                    {formatMinutes(m)}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Until" error={timesInvalid ? 'Must be after the start time' : undefined}>
            {(p) => (
              <Select {...p} value={to} onChange={(e) => setTo(Number(e.target.value))}>
                {END_TIMES.map((m) => (
                  <option key={m} value={m}>
                    {formatMinutes(m)}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>
      )}

      <Field label="Note" hint="Optional, only the team sees it. E.g. Holiday, Team meeting.">
        {(p) => (
          <Input {...p} maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} />
        )}
      </Field>

      {add.isError && (
        <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {errorMessage(add.error)}
        </p>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={!startDate || !endDate || endBeforeStart || timesInvalid}
          loading={add.isPending}
        >
          Block this time
        </Button>
      </div>
    </form>
  );
}
