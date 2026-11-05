import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';
import { errorMessage } from '@/lib/api-client';
import { useChangePassword, useLogout } from './auth';

/** Shown after signing in with a starting password. The API blocks everything else until it's done. */
export function SetPasswordPage() {
  const change = useChangePassword();
  const logout = useLogout();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const mismatch = confirm.length > 0 && confirm !== next;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (next !== confirm) return;
    change.mutate(
      { currentPassword: current, newPassword: next },
      { onSuccess: () => toast.success('Your password is set. Welcome!') },
    );
  };

  return (
    <AuthLayout
      title={
        <>
          Create your <em>password.</em>
        </>
      }
      description="You signed in with a starting password. Choose your own to continue."
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Starting password">
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
        <Field label="Confirm new password" error={mismatch ? "Passwords don't match" : undefined}>
          {(p) => (
            <Input
              {...p}
              type="password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          )}
        </Field>
        {change.isError && (
          <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {errorMessage(change.error)}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={mismatch} loading={change.isPending}>
          Set password
        </Button>
        <button
          type="button"
          onClick={() => logout.mutate()}
          className="block w-full text-center text-xs text-neutral-500 hover:text-neutral-950"
        >
          Sign out
        </button>
      </form>
    </AuthLayout>
  );
}
