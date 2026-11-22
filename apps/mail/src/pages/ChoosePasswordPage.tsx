import { useState, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Check, Eye, EyeOff, KeyRound } from 'lucide-react';
import type { WebmailMeDto } from '@muvance/shared';
import { api, errorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import { LogoMark, Spinner } from '@/components/ui';

/**
 * First sign-in (or after an admin reset): the person replaces the password they were given
 * with one only they know, before seeing their inbox.
 */
export function ChoosePasswordPage({ me }: { me: WebmailMeDto }) {
  const queryClient = useQueryClient();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const rules = [
    { ok: password.length >= 10, text: 'At least 10 characters' },
    { ok: /[a-zA-Z]/.test(password) && /\d/.test(password), text: 'Letters and numbers' },
    { ok: !!password && password === confirm, text: 'Both passwords match' },
  ];
  const valid = rules.every((r) => r.ok);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setBusy(true);
    setError('');
    try {
      await api.post('/password', { next: password });
      await queryClient.invalidateQueries({ queryKey: ['me'] });
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  const signOut = async () => {
    await api.post('/logout').catch(() => {});
    queryClient.setQueryData(['me'], null);
  };

  const field =
    'flex h-11 items-center rounded-xl border border-line bg-white pr-1.5 transition focus-within:border-ink focus-within:ring-4 focus-within:ring-black/5';

  return (
    <main className="flex min-h-full items-center justify-center px-5 py-12">
      <form onSubmit={submit} className="animate-fade-up w-full max-w-sm">
        <div className="mb-10 flex items-center gap-2.5">
          <LogoMark className="w-8" />
          <span className="font-logo text-lg font-semibold tracking-[-0.03em]">Muvance Mail</span>
        </div>
        <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-line">
          <KeyRound className="size-5" />
        </span>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">Choose your own password</h1>
        <p className="mt-1.5 text-sm text-muted">
          Welcome, {me.displayName}. Replace the password you were given with one only you know.
          You'll use it for <span className="font-medium text-ink">{me.address}</span>.
        </p>

        <label className="mt-8 block">
          <span className="text-sm font-medium">New password</span>
          <div className={cn(field, 'mt-1.5')}>
            <input
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              autoFocus
              className="h-full min-w-0 flex-1 rounded-xl bg-transparent px-3.5 text-[15px] outline-none"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="rounded-lg p-2 text-muted hover:bg-black/5 hover:text-ink"
              aria-label={show ? 'Hide password' : 'Show password'}
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </label>
        <label className="mt-4 block">
          <span className="text-sm font-medium">Type it again</span>
          <div className={cn(field, 'mt-1.5')}>
            <input
              type={show ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              className="h-full min-w-0 flex-1 rounded-xl bg-transparent px-3.5 text-[15px] outline-none"
            />
          </div>
        </label>

        <ul className="mt-4 space-y-1.5">
          {rules.map((r) => (
            <li
              key={r.text}
              className={cn(
                'flex items-center gap-2 text-sm',
                r.ok ? 'text-[#18794e]' : 'text-muted',
              )}
            >
              <span
                className={cn(
                  'inline-flex size-4 items-center justify-center rounded-full',
                  r.ok ? 'bg-[#e7f5ee]' : 'bg-black/[0.05]',
                )}
              >
                {r.ok && <Check className="size-3" />}
              </span>
              {r.text}
            </li>
          ))}
        </ul>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <button
          type="submit"
          disabled={!valid || busy}
          className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink text-[15px] font-medium text-white transition hover:bg-black/85 disabled:opacity-40"
        >
          {busy ? <Spinner /> : 'Save and open my inbox'}
        </button>
        <button
          type="button"
          onClick={() => void signOut()}
          className="mt-3 w-full text-center text-sm text-muted hover:text-ink"
        >
          Sign out
        </button>
      </form>
    </main>
  );
}
