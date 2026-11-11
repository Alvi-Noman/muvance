import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CopyCheck } from 'lucide-react';
import { toast } from 'sonner';
import type { AvailabilitySettings, WeeklyDay } from '@muvance/shared';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { Field, Input, Select } from '@/components/ui/Field';
import { Spinner } from '@/components/ui/misc';
import { api } from '@/lib/api-client';
import { cn } from '@/lib/cn';
import {
  availabilityKey,
  DAY_NAMES,
  formatMinutes,
  TIMES,
  useAvailabilitySettings,
  type AvailabilityResponse,
} from './booking-settings';

export function BookingHoursCard() {
  const { data } = useAvailabilitySettings();

  if (!data) {
    return (
      <Card className="grid h-64 place-items-center">
        <Spinner />
      </Card>
    );
  }
  // Keyed by the saved values so the form starts fresh after each save.
  return <BookingHoursForm key={JSON.stringify(data.availability)} data={data} />;
}

/** Shows a time in the list even if it was saved off the 30-minute grid (e.g. 11:15). */
const timesWith = (minutes: number) =>
  TIMES.includes(minutes) ? TIMES : [...TIMES, minutes].sort((a, b) => a - b);

function BookingHoursForm({ data }: { data: AvailabilityResponse }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<AvailabilitySettings>(data.availability);

  const save = useMutation({
    mutationFn: (input: AvailabilitySettings) =>
      api.put<AvailabilityResponse>('/settings/availability', input),
    onSuccess: (res) => {
      queryClient.setQueryData(availabilityKey, res);
      toast.success('Booking hours saved. The website uses them right away.');
    },
  });

  const set = <K extends keyof AvailabilitySettings>(key: K, value: AvailabilitySettings[K]) =>
    setForm((f) => ({ ...f, [key]: value }));
  const setDay = (index: number, patch: Partial<WeeklyDay>) =>
    set(
      'weekly',
      form.weekly.map((d, i) => (i === index ? { ...d, ...patch } : d)),
    );
  /** Gives every open day the same hours as this one. */
  const copyToOpenDays = (index: number) => {
    const { firstStart, lastStart } = form.weekly[index]!;
    set(
      'weekly',
      form.weekly.map((d) => (d.open ? { ...d, firstStart, lastStart } : d)),
    );
  };

  const openDays = form.weekly.filter((d) => d.open);
  const invalidDay = form.weekly.some((d) => d.open && d.lastStart < d.firstStart);
  const callsPerWeek = openDays.reduce(
    (sum, d) => sum + Math.floor((d.lastStart - d.firstStart) / form.slotIntervalMinutes) + 1,
    0,
  );
  const dirty = JSON.stringify(form) !== JSON.stringify(data.availability);

  return (
    <Card>
      <CardHeader
        title="Booking hours"
        description={`When people can book calls on the website, each day of the week (${data.hostTimeZone} time).`}
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate(form);
        }}
        className="space-y-5 p-5"
      >
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-neutral-800">
            Weekly hours <span className="font-normal text-neutral-500">(first and last call)</span>
          </legend>
          <ul className="divide-y divide-black/[0.06] rounded-xl border border-black/[0.06]">
            {form.weekly.map((day, i) => {
              const invalid = day.open && day.lastStart < day.firstStart;
              return (
                <li key={DAY_NAMES[i]} className="px-3 py-2.5">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <label className="flex w-32 cursor-pointer items-center gap-2.5 text-sm font-medium text-neutral-800">
                      <input
                        type="checkbox"
                        className="size-4 accent-neutral-950"
                        checked={day.open}
                        onChange={(e) => setDay(i, { open: e.target.checked })}
                      />
                      {DAY_NAMES[i]}
                    </label>
                    {day.open ? (
                      <div className="flex flex-1 items-center gap-2">
                        <Select
                          aria-label={`${DAY_NAMES[i]} first call`}
                          className="h-9 min-w-0 flex-1"
                          value={day.firstStart}
                          onChange={(e) => setDay(i, { firstStart: Number(e.target.value) })}
                        >
                          {timesWith(day.firstStart).map((m) => (
                            <option key={m} value={m}>
                              {formatMinutes(m)}
                            </option>
                          ))}
                        </Select>
                        <span className="text-sm text-neutral-500">to</span>
                        <Select
                          aria-label={`${DAY_NAMES[i]} last call`}
                          aria-invalid={invalid}
                          className="h-9 min-w-0 flex-1"
                          value={day.lastStart}
                          onChange={(e) => setDay(i, { lastStart: Number(e.target.value) })}
                        >
                          {timesWith(day.lastStart).map((m) => (
                            <option key={m} value={m}>
                              {formatMinutes(m)}
                            </option>
                          ))}
                        </Select>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          title="Use these hours on every open day"
                          aria-label={`Use ${DAY_NAMES[i]}'s hours on every open day`}
                          onClick={() => copyToOpenDays(i)}
                        >
                          <CopyCheck className="size-4" aria-hidden />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm text-neutral-400">Closed</span>
                    )}
                  </div>
                  {invalid && (
                    <p className="mt-1.5 text-xs text-red-600">
                      The last call must start after the first.
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </fieldset>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Start times">
            {(p) => (
              <Select
                {...p}
                value={form.slotIntervalMinutes}
                onChange={(e) => set('slotIntervalMinutes', Number(e.target.value) as 30 | 60)}
              >
                <option value={60}>Every hour</option>
                <option value={30}>Every 30 minutes</option>
              </Select>
            )}
          </Field>
          <Field label="Call length (minutes)">
            {(p) => (
              <Input
                {...p}
                type="number"
                min={15}
                max={120}
                step={5}
                value={form.durationMinutes}
                onChange={(e) => set('durationMinutes', Number(e.target.value))}
              />
            )}
          </Field>
          <Field label="Book up to (days ahead)">
            {(p) => (
              <Input
                {...p}
                type="number"
                min={1}
                max={90}
                value={form.daysAhead}
                onChange={(e) => set('daysAhead', Number(e.target.value))}
              />
            )}
          </Field>
          <Field label="Minimum notice (hours)">
            {(p) => (
              <Input
                {...p}
                type="number"
                min={0}
                max={72}
                value={form.minNoticeHours}
                onChange={(e) => set('minNoticeHours', Number(e.target.value))}
              />
            )}
          </Field>
        </div>

        <p
          className={cn(
            'rounded-xl px-4 py-3 text-sm',
            openDays.length ? 'bg-neutral-50 text-neutral-600' : 'bg-red-50 text-red-700',
          )}
        >
          {openDays.length
            ? `Up to ${callsPerWeek} ${callsPerWeek === 1 ? 'call' : 'calls'} a week on ${openDays.length} ${openDays.length === 1 ? 'day' : 'days'}. Already-booked calls are never affected.`
            : 'Open at least one day, or nobody can book.'}
        </p>

        <div className="flex justify-end gap-2">
          {dirty && (
            <Button type="button" variant="ghost" onClick={() => setForm(data.availability)}>
              Discard
            </Button>
          )}
          <Button
            type="submit"
            disabled={!dirty || !openDays.length || invalidDay}
            loading={save.isPending}
          >
            Save booking hours
          </Button>
        </div>
      </form>
    </Card>
  );
}
