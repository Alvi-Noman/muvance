import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button, buttonStyles } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';
import { PageLoader } from '@/components/ui/misc';
import { errorMessage } from '@/lib/api-client';
import { useAcceptInvite, useInviteInfo } from './auth';

/** Handles both team invites (create account) and password-reset links. */
export function AcceptInvitePage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const navigate = useNavigate();
  const info = useInviteInfo(token);
  const accept = useAcceptInvite();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [mismatch, setMismatch] = useState(false);

  if (!token || info.isError) {
    return (
      <AuthLayout
        title={
          <>
            Link <em>expired.</em>
          </>
        }
        description={info.isError ? errorMessage(info.error) : 'This link is missing its token.'}
      >
        <Link to="/login" className={buttonStyles({ variant: 'secondary' })}>
          Go to sign in
        </Link>
      </AuthLayout>
    );
  }
  if (info.isPending) return <PageLoader />;

  const isReset = info.data.type === 'reset';

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setMismatch(true);
      return;
    }
    setMismatch(false);
    accept.mutate(
      { token, password, ...(isReset ? {} : { name }) },
      { onSuccess: () => navigate('/', { replace: true }) },
    );
  };

  return (
    <AuthLayout
      title={
        isReset ? (
          <>
            Set a new <em>password.</em>
          </>
        ) : (
          <>
            Join the <em>team.</em>
          </>
        )
      }
      description={
        <>
          {isReset ? 'Resetting the password for ' : "You've been invited as "}
          <span className="font-medium text-neutral-900">{info.data.email}</span>.
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        {!isReset && (
          <Field label="Your name">
            {(props) => (
              <Input
                {...props}
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}
          </Field>
        )}
        <Field label="Password" hint="At least 10 characters.">
          {(props) => (
            <Input
              {...props}
              type="password"
              autoComplete="new-password"
              minLength={10}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          )}
        </Field>
        <Field label="Confirm password" error={mismatch ? "Passwords don't match" : undefined}>
          {(props) => (
            <Input
              {...props}
              type="password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          )}
        </Field>
        {accept.isError && (
          <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {errorMessage(accept.error)}
          </p>
        )}
        <Button type="submit" className="w-full" loading={accept.isPending}>
          {isReset ? 'Save password' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  );
}
