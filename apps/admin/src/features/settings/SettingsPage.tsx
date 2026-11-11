import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { roleLabels } from '@muvance/shared';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { Field, Input } from '@/components/ui/Field';
import { PageHeader } from '@/components/ui/misc';
import { Can } from '@/features/auth/RequireAuth';
import { useChangePassword, useCurrentUser, useUpdateProfile } from '@/features/auth/auth';
import { errorMessage } from '@/lib/api-client';
import { BlockedTimesCard } from './BlockedTimesCard';
import { BookingHoursCard } from './BookingHoursCard';

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
          <div className="space-y-6">
            <BookingHoursCard />
            <BlockedTimesCard />
          </div>
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
