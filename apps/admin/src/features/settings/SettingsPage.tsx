import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { roleLabels, type AvailabilitySettings } from '@muvance/shared';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { Field, Input, Select } from '@/components/ui/Field';
import { PageHeader, Spinner } from '@/components/ui/misc';
import { Can } from '@/features/auth/RequireAuth';
import { useChangePassword, useCurrentUser, useUpdateProfile } from '@/features/auth/auth';
import { api, errorMessage } from '@/lib/api-client';
import { cn } from '@/lib/cn';
import { formatHour } from '@/lib/format';

export function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <ProfileCard />
          <PasswordCard />
        </div>
        <Can permission="settings:manage">
          <AvailabilityCard />
        </Can>
      </div>
    </>
  );
}

function ProfileCard() {
  const me = useCurrentUser();
  const update = useUpdateProfile();
  const [name, setName] = useState(me.name);
  const [username, setUsername] = useState(me.username ?? '');
  const changed = name !== me.name || username.trim() !== (me.username ?? '');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    update.mutate(
      { name, username: username.trim() || null },
      { onSuccess: () => toast.success('Profile saved') },
    );
  };

  return (
    <Card>
      <CardHeader
        title="Your profile"
        description={[me.email, roleLabels[me.role]].filter(Boolean).join(' · ')}
      />
      <form onSubmit={submit} className="space-y-4 p-5">
        <Field label="Name">
          {(p) => <Input {...p} required value={name} onChange={(e) => setName(e.target.value)} />}
        </Field>
        <Field
          label="Username"
          hint={
            me.email
              ? 'Optional. Sign in with this or your email.'
              : 'You sign in with this. Letters, numbers, dots, dashes and underscores.'
          }
        >
          {(p) => (
            <Input
              {...p}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              required={!me.email}
              minLength={3}
              maxLength={30}
              pattern="[a-zA-Z0-9][a-zA-Z0-9._-]*"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          )}
        </Field>
        <div className="flex justify-end">
          <Button type="submit" disabled={!changed || !name.trim()} loading={update.isPending}>
            Save
          </Button>
        </div>
      </form>
    </Card>
  );
}

function PasswordCard() {
  const change = useChangePassword();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    change.mutate(
      { currentPassword: current, newPassword: next },
      {
        onSuccess: () => {
          toast.success('Password changed. Other devices were signed out.');
          setCurrent('');
          setNext('');
        },
      },
    );
  };

  return (
    <Card>
      <CardHeader title="Password" description="Changing it signs you out on other devices." />
      <form onSubmit={submit} className="space-y-4 p-5">
        <Field label="Current password">
          {(p) => (
            <Input
              {...p}
              type="password"
              autoComplete="current-password"
              required
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
          )}
        </Field>
        <Field label="New password" hint="At least 10 characters.">
          {(p) => (
            <Input
              {...p}
              type="password"
              autoComplete="new-password"
              minLength={10}
              required
              value={next}
              onChange={(e) => setNext(e.target.value)}
            />
          )}
        </Field>
        {change.isError && (
          <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {errorMessage(change.error)}
          </p>
        )}
        <div className="flex justify-end">
          <Button type="submit" loading={change.isPending}>
            Change password
          </Button>
        </div>
      </form>
    </Card>
  );
}

type AvailabilityResponse = { availability: AvailabilitySettings; hostTimeZone: string };
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, h) => h);

function AvailabilityCard() {
  const { data } = useQuery({
    queryKey: ['settings', 'availability'],
    queryFn: () => api.get<AvailabilityResponse>('/settings/availability'),
  });

  if (!data) {
    return (
      <Card className="grid h-64 place-items-center">
        <Spinner />
      </Card>
    );
  }
  // Keyed by the saved values so the form starts fresh after each save.
  return <AvailabilityForm key={JSON.stringify(data.availability)} data={data} />;
}

function AvailabilityForm({ data }: { data: AvailabilityResponse }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<AvailabilitySettings>(data.availability);

  const save = useMutation({
    mutationFn: (input: AvailabilitySettings) =>
      api.put<AvailabilityResponse>('/settings/availability', input),
    onSuccess: (res) => {
      queryClient.setQueryData(['settings', 'availability'], res);
      toast.success('Booking hours saved. The website uses them right away.');
    },
  });

  const set = <K extends keyof AvailabilitySettings>(key: K, value: AvailabilitySettings[K]) =>
    setForm((f) => ({ ...f, [key]: value }));
  const slotsPerDay =
    form.lastStartHour >= form.firstStartHour
      ? Math.floor(((form.lastStartHour - form.firstStartHour) * 60) / form.slotIntervalMinutes) + 1
      : 0;
  const dirty = JSON.stringify(form) !== JSON.stringify(data.availability);

  return (
    <Card>
      <CardHeader
        title="Booking hours"
        description={`When people can book calls on the website (${data.hostTimeZone} time).`}
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate(form);
        }}
        className="space-y-5 p-5"
      >
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-neutral-800">Days</legend>
          <div className="flex flex-wrap gap-1.5">
            {DAYS.map((day, i) => {
              const on = form.workingDays.includes(i);
              return (
                <button
                  key={day}
                  type="button"
                  aria-pressed={on}
                  onClick={() =>
                    set(
                      'workingDays',
                      on ? form.workingDays.filter((d) => d !== i) : [...form.workingDays, i],
                    )
                  }
                  className={cn(
                    'h-9 w-12 rounded-lg text-sm font-medium transition-colors',
                    on
                      ? 'bg-neutral-950 text-white'
                      : 'border border-black/10 bg-white text-neutral-500 hover:border-black/30',
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="grid grid-cols-2 gap-3">
          <Field label="First call">
            {(p) => (
              <Select
                {...p}
                value={form.firstStartHour}
                onChange={(e) => set('firstStartHour', Number(e.target.value))}
              >
                {HOURS.map((h) => (
                  <option key={h} value={h}>
                    {formatHour(h)}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field
            label="Last call"
            error={
              form.lastStartHour < form.firstStartHour ? 'Must be after the first call' : undefined
            }
          >
            {(p) => (
              <Select
                {...p}
                value={form.lastStartHour}
                onChange={(e) => set('lastStartHour', Number(e.target.value))}
              >
                {HOURS.map((h) => (
                  <option key={h} value={h}>
                    {formatHour(h)}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Start times">
            {(p) => (
              <Select
                {...p}
                value={form.slotIntervalMinutes}
                onChange={(e) => set('slotIntervalMinutes', Number(e.target.value) as 30 | 60)}
              >
                <option value={60}>On the hour</option>
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

        <p className="rounded-xl bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
          {slotsPerDay} {slotsPerDay === 1 ? 'call' : 'calls'} a day, from{' '}
          {formatHour(form.firstStartHour)} to {formatHour(form.lastStartHour)} on{' '}
          {form.workingDays.length} {form.workingDays.length === 1 ? 'day' : 'days'} a week.
          Already-booked calls are never affected.
        </p>

        <div className="flex justify-end gap-2">
          {dirty && (
            <Button variant="ghost" onClick={() => setForm(data.availability)}>
              Discard
            </Button>
          )}
          <Button
            type="submit"
            disabled={
              !dirty || !form.workingDays.length || form.lastStartHour < form.firstStartHour
            }
            loading={save.isPending}
          >
            Save booking hours
          </Button>
        </div>
      </form>
    </Card>
  );
}
