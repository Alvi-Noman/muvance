import { useState, type FormEvent, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Eye, EyeOff, Lock } from 'lucide-react';
import { account, accountsUrl, isTeamLogin } from '@/lib/account';
import { api, errorMessage } from '@/lib/api';
import { keys } from '@/lib/data';
import { LogoMark, Spinner } from '@/components/ui';

/** The dark brand panel beside sign-in forms. */
export function BrandSide({ children }: { children?: ReactNode }) {
  return (
    <aside className="relative hidden overflow-hidden bg-ink text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
      <div className="flex items-center gap-2.5">
        <LogoMark className="w-8" />
        <span className="font-logo text-lg font-semibold tracking-[-0.03em]">Muvance</span>
      </div>
      <div className="relative z-10 max-w-md">
        {children ?? (
          <>
            <h1 className="font-serif text-6xl leading-[1.02] tracking-tight">
              Every conversation, <em className="text-white/55">in one place.</em>
            </h1>
            <p className="mt-5 text-white/60">
              Muvance Chat is where our team and our clients talk: spaces for each project, direct
              messages, files and threads.
            </p>
          </>
        )}
      </div>
      <p className="relative z-10 text-sm text-white/40">chat.muvance.com</p>
      {/* Decorative chat bubbles */}
      <div className="pointer-events-none absolute top-24 -right-10 w-[400px] rotate-[-5deg] space-y-3 opacity-90">
        {[
          ['Sara', 'The new ad set is live. CPA is down 18% 🎉', 'left'],
          ['You', 'Amazing! Sharing the report with the client now.', 'right'],
          ['Rafi (Client)', 'Thanks team, this looks great 🙏', 'left'],
        ].map(([who, text, side]) => (
          <div key={text} className={side === 'right' ? 'flex justify-end pr-10' : 'flex'}>
            <div
              className={
                side === 'right'
                  ? 'max-w-[300px] rounded-2xl rounded-br-md bg-accent px-4 py-3'
                  : 'max-w-[300px] rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.07] px-4 py-3 backdrop-blur'
              }
            >
              <p className="text-xs font-medium text-white/60">{who}</p>
              <p className="mt-0.5 text-sm">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

export function PasswordInput({
  value,
  onChange,
  autoComplete,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  autoFocus?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="mt-1.5 flex h-11 items-center rounded-xl border border-line bg-white pr-1.5 transition focus-within:border-ink focus-within:ring-4 focus-within:ring-black/5">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        required
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
  );
}

export function LoginPage() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const looksTeam = !email.includes('@');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (isTeamLogin(email)) {
        const me = await account.login(email, password);
        // A starting password from an admin: choose your own on the account page first.
        if (me.mustChangePassword) {
          window.location.assign(accountsUrl());
          return;
        }
      } else {
        await api.post('/login', { email, password });
      }
      await queryClient.resetQueries({ queryKey: keys.bootstrap });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-full lg:grid-cols-[1.05fr_1fr]">
      <BrandSide />
      <main className="flex items-center justify-center px-5 py-12">
        <form onSubmit={submit} className="animate-fade-up w-full max-w-sm">
          <div className="mb-10 flex items-center gap-2.5 lg:hidden">
            <LogoMark className="w-8" />
            <span className="font-logo text-lg font-semibold tracking-[-0.03em]">Muvance Chat</span>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">Sign in to Muvance Chat</h2>
          <p className="mt-1.5 text-sm text-muted">
            Team: your Muvance account (the same for Mail, Meet and the Admin CRM). Clients: the
            email you were invited with.
          </p>

          <label className="mt-8 block">
            <span className="text-sm font-medium">Username or email</span>
            <div className="mt-1.5 flex h-11 items-center rounded-xl border border-line bg-white pr-3 transition focus-within:border-ink focus-within:ring-4 focus-within:ring-black/5">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                autoFocus
                required
                placeholder="you@company.com"
                className="h-full min-w-0 flex-1 rounded-xl bg-transparent px-3.5 text-[15px] outline-none"
              />
              {looksTeam && email && <span className="text-sm text-muted">@muvance.com</span>}
            </div>
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-medium">Password</span>
            <PasswordInput
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
            />
          </label>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="group mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink text-[15px] font-medium text-white transition hover:bg-black/85 disabled:opacity-60"
          >
            {busy ? <Spinner /> : 'Sign in'}
            {!busy && <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />}
          </button>

          <p className="mt-8 flex items-start gap-2 text-xs leading-relaxed text-muted">
            <Lock className="mt-0.5 size-3.5 shrink-0" />
            <span>
              The team signs in with their Muvance account password. Clients who forgot theirs: ask
              your Muvance contact for a new sign-in link.
            </span>
          </p>
        </form>
      </main>
    </div>
  );
}
