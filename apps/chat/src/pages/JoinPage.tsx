import { useState, type FormEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import type { ChatInviteInfoDto } from '@muvance/shared';
import { api, errorMessage } from '@/lib/api';
import { keys } from '@/lib/data';
import { Spinner } from '@/components/ui';
import { ErrorNote, inputClass, PrimaryButton, SignInFrame } from './LoginPage';

/** An invite link (or a sign-in link from the team): one click, no password. */
export function JoinPage() {
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const invite = useQuery({
    queryKey: ['invite', token],
    queryFn: () => api.get<ChatInviteInfoDto>(`/invites/${token}`),
    retry: false,
  });
  const [name, setName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const info = invite.data;
  const shownName = name ?? info?.name ?? '';

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.post(`/invites/${token}/accept`, { name: shownName });
      await qc.resetQueries({ queryKey: keys.bootstrap });
      navigate('/', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <SignInFrame
      side={
        <>
          <h1 className="font-serif text-6xl leading-[1.02] tracking-tight">
            Welcome to <em className="text-white/55">Muvance.</em>
          </h1>
          <p className="mt-5 text-white/60">
            Talk with our team directly: updates, files and questions, all in one conversation.
          </p>
        </>
      }
    >
      {invite.isLoading ? (
        <Spinner className="size-6 text-muted" />
      ) : invite.error ? (
        <>
          <h2 className="text-2xl font-semibold tracking-tight">This link doesn't work anymore</h2>
          <p className="mt-2 text-sm text-muted">{errorMessage(invite.error)}</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-6 flex h-11 w-full items-center justify-center rounded-xl bg-ink text-[15px] font-medium text-white hover:bg-black/85"
          >
            Sign in with your email
          </button>
        </>
      ) : info ? (
        <form onSubmit={submit}>
          <h2 className="text-2xl font-semibold tracking-tight">
            {info.existing ? 'Welcome back' : 'Join the conversation'}
          </h2>
          <p className="mt-1.5 text-sm text-muted">
            {info.existing
              ? `Sign in to Muvance Chat as ${info.email}.`
              : `${info.invitedBy} invited you${info.spaceName ? ` to “${info.spaceName}”` : ''}. No password or account needed.`}
          </p>

          {!info.existing && (
            <label className="mt-8 block">
              <span className="text-sm font-medium">Your name</span>
              <input
                value={shownName}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={80}
                autoComplete="name"
                className={inputClass}
              />
              <span className="mt-1.5 block text-xs text-muted">
                What the team sees. You can change it later.
              </span>
            </label>
          )}

          <ErrorNote>{error}</ErrorNote>
          <PrimaryButton busy={busy}>{info.existing ? 'Continue' : 'Join'}</PrimaryButton>
          <p className="mt-5 text-center text-xs text-muted">
            Joining as {info.email}. Next time, sign in with this email: we'll send you a code.
          </p>
        </form>
      ) : null}
    </SignInFrame>
  );
}
