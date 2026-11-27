import { useState, type FormEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { chatPasswordSchema, type ChatInviteInfoDto } from '@muvance/shared';
import { api, errorMessage } from '@/lib/api';
import { keys } from '@/lib/data';
import { LogoMark, Spinner } from '@/components/ui';
import { BrandSide, PasswordInput } from './LoginPage';

/** Where an invited client (or one resetting their password) chooses their password. */
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
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const shownName = name ?? invite.data?.name ?? '';

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const check = chatPasswordSchema.safeParse(password);
    if (!check.success) return setError(check.error.issues[0]!.message);
    if (password !== confirm) return setError("The passwords don't match.");
    setBusy(true);
    try {
      await api.post(`/invites/${token}/accept`, { name: shownName, password });
      await qc.resetQueries({ queryKey: keys.bootstrap });
      navigate('/', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const info = invite.data;
  return (
    <div className="grid min-h-full lg:grid-cols-[1.05fr_1fr]">
      <BrandSide>
        <h1 className="font-serif text-6xl leading-[1.02] tracking-tight">
          Welcome to <em className="text-white/55">Muvance.</em>
        </h1>
        <p className="mt-5 text-white/60">
          Talk with our team directly: updates, files and questions, all in one conversation.
        </p>
      </BrandSide>
      <main className="flex items-center justify-center px-5 py-12">
        <div className="animate-fade-up w-full max-w-sm">
          <div className="mb-10 flex items-center gap-2.5 lg:hidden">
            <LogoMark className="w-8" />
            <span className="font-logo text-lg font-semibold tracking-[-0.03em]">Muvance Chat</span>
          </div>
          {invite.isLoading ? (
            <Spinner className="size-6 text-muted" />
          ) : invite.error ? (
            <>
              <h2 className="text-2xl font-semibold tracking-tight">This link doesn't work</h2>
              <p className="mt-2 text-sm text-muted">{errorMessage(invite.error)}</p>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="mt-6 text-sm font-medium text-accent hover:underline"
              >
                Go to sign in
              </button>
            </>
          ) : info ? (
            <form onSubmit={submit}>
              <h2 className="text-2xl font-semibold tracking-tight">
                {info.existing ? 'Choose a new password' : 'Join the conversation'}
              </h2>
              <p className="mt-1.5 text-sm text-muted">
                {info.existing
                  ? `For ${info.email}.`
                  : `${info.invitedBy} invited you${info.spaceName ? ` to “${info.spaceName}”` : ''}. Choose a password to sign in with ${info.email}.`}
              </p>

              <label className="mt-8 block">
                <span className="text-sm font-medium">Your name</span>
                <input
                  value={shownName}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={80}
                  autoComplete="name"
                  className="mt-1.5 h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[15px] outline-none transition focus:border-ink focus:ring-4 focus:ring-black/5"
                />
              </label>
              <label className="mt-4 block">
                <span className="text-sm font-medium">Password</span>
                <PasswordInput
                  value={password}
                  onChange={setPassword}
                  autoComplete="new-password"
                />
                <span className="mt-1.5 block text-xs text-muted">At least 8 characters.</span>
              </label>
              <label className="mt-4 block">
                <span className="text-sm font-medium">Type it again</span>
                <PasswordInput value={confirm} onChange={setConfirm} autoComplete="new-password" />
              </label>
              <input type="hidden" autoComplete="username" value={info.email} readOnly />

              {error && (
                <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
              )}
              <button
                type="submit"
                disabled={busy}
                className="group mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink text-[15px] font-medium text-white transition hover:bg-black/85 disabled:opacity-60"
              >
                {busy ? <Spinner /> : info.existing ? 'Save and sign in' : 'Join'}
                {!busy && <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />}
              </button>
            </form>
          ) : null}
        </div>
      </main>
    </div>
  );
}
