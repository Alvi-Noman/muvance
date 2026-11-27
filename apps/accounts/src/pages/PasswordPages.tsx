import { useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router';
import type { InviteInfoDto, MeDto } from '@muvance/shared';
import { api, errorMessage } from '@/lib/api';
import { continueUrl, useSetMe } from '@/lib/apps';
import { AuthCard, ErrorNote, PasswordField, Spinner, SubmitButton } from '@/ui';

function checkNew(next: string, again: string) {
  if (next.length < 10) return 'Use at least 10 characters.';
  if (next !== again) return "The passwords don't match.";
  return '';
}

/** Right after signing in with a starting password an admin set. */
export function ChoosePasswordPage({ me }: { me: MeDto }) {
  const setMe = useSetMe();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [again, setAgain] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const problem = checkNew(next, again);
    if (problem) return setError(problem);
    setBusy(true);
    setError('');
    try {
      await api.post('/auth/change-password', { currentPassword: current, newPassword: next });
      const after = continueUrl();
      if (after) {
        window.location.assign(after);
        return;
      }
      setMe(await api.get<MeDto>('/auth/me'));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthCard
      title={`Welcome, ${me.name.split(' ')[0]}`}
      subtitle={`Choose your own password for ${me.address ?? me.email ?? 'your account'}. It's the one you'll use in every Muvance app.`}
    >
      <form onSubmit={submit} className="space-y-4">
        <input
          type="hidden"
          autoComplete="username"
          value={me.address ?? me.email ?? ''}
          readOnly
        />
        <PasswordField
          label="Starting password (from your admin)"
          value={current}
          onChange={setCurrent}
          autoComplete="current-password"
          autoFocus
        />
        <PasswordField
          label="New password"
          value={next}
          onChange={setNext}
          autoComplete="new-password"
          hint="At least 10 characters."
        />
        <PasswordField
          label="Type it again"
          value={again}
          onChange={setAgain}
          autoComplete="new-password"
        />
        {error && <ErrorNote>{error}</ErrorNote>}
        <SubmitButton busy={busy}>Save and continue</SubmitButton>
      </form>
    </AuthCard>
  );
}

/** From an admin's link: a new person choosing their password, or someone resetting theirs. */
export function SetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const navigate = useNavigate();
  const setMe = useSetMe();
  const info = useQuery({
    queryKey: ['invite', token],
    queryFn: () => api.get<InviteInfoDto>(`/auth/invites/${encodeURIComponent(token)}`),
    retry: false,
    enabled: Boolean(token),
  });
  const [next, setNext] = useState('');
  const [again, setAgain] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const problem = checkNew(next, again);
    if (problem) return setError(problem);
    setBusy(true);
    setError('');
    try {
      const me = await api.post<MeDto>('/auth/accept-invite', { token, password: next });
      setMe(me);
      navigate('/', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (!token || info.error) {
    return (
      <AuthCard
        title="This link doesn't work"
        subtitle={
          info.error
            ? errorMessage(info.error)
            : 'It may be incomplete. Ask a Muvance admin for a new one.'
        }
      >
        <a href="/" className="text-sm font-medium text-ink underline">
          Go to sign in
        </a>
      </AuthCard>
    );
  }
  if (info.isLoading || !info.data) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner className="size-6 text-muted" />
      </div>
    );
  }
  return (
    <AuthCard
      title="Choose your password"
      subtitle={`For your Muvance account, ${info.data.email}. You'll use it for every Muvance app (and your phone's mail app).`}
    >
      <form onSubmit={submit} className="space-y-4">
        <input type="hidden" autoComplete="username" value={info.data.email} readOnly />
        <PasswordField
          label="Password"
          value={next}
          onChange={setNext}
          autoComplete="new-password"
          autoFocus
          hint="At least 10 characters."
        />
        <PasswordField
          label="Type it again"
          value={again}
          onChange={setAgain}
          autoComplete="new-password"
        />
        {error && <ErrorNote>{error}</ErrorNote>}
        <SubmitButton busy={busy}>Save and sign in</SubmitButton>
      </form>
    </AuthCard>
  );
}
