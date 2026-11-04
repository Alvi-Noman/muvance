import { useState, type FormEvent } from 'react';
import { Navigate, useSearchParams } from 'react-router';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';
import { PageLoader } from '@/components/ui/misc';
import { errorMessage } from '@/lib/api-client';
import { useLogin, useMe } from './auth';

/** Only allow redirects back to our own pages. */
const safeNext = (next: string | null) =>
  next?.startsWith('/') && !next.startsWith('//') ? next : '/';

export function LoginPage() {
  const [params] = useSearchParams();
  const { data: me, isPending } = useMe();
  const login = useLogin();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  if (isPending) return <PageLoader />;
  if (me) return <Navigate to={safeNext(params.get('next'))} replace />;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    login.mutate({ identifier, password });
  };

  return (
    <AuthLayout
      title={
        <>
          Welcome <em>back.</em>
        </>
      }
      description="Sign in to manage leads and bookings."
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email or username">
          {(props) => (
            <Input
              {...props}
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          )}
        </Field>
        <Field label="Password">
          {(props) => (
            <Input
              {...props}
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          )}
        </Field>
        {login.isError && (
          <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {errorMessage(login.error)}
          </p>
        )}
        <Button type="submit" className="w-full" loading={login.isPending}>
          Sign in
        </Button>
        <p className="text-center text-xs text-neutral-500">
          Forgot your password? Ask an owner or admin for a reset link.
        </p>
      </form>
    </AuthLayout>
  );
}
