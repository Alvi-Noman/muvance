import { useState, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Eye, EyeOff, Lock } from 'lucide-react';
import { api, errorMessage } from '@/lib/api';
import { LogoMark, Spinner } from '@/components/ui';

export function LoginPage() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.post('/login', { email, password });
      await queryClient.invalidateQueries({ queryKey: ['me'] });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-full lg:grid-cols-[1.05fr_1fr]">
      {/* Brand side */}
      <aside className="relative hidden overflow-hidden bg-ink text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="flex items-center gap-2.5">
          <LogoMark className="w-8" />
          <span className="font-logo text-lg font-semibold tracking-[-0.03em]">Muvance</span>
        </div>
        <div className="relative z-10 max-w-md">
          <h1 className="font-serif text-6xl leading-[1.02] tracking-tight">
            Your inbox, <em className="text-white/55">calmly</em> in order.
          </h1>
          <p className="mt-5 text-white/60">
            Team email for Muvance. Fast to read, quick to write, and private by default.
          </p>
        </div>
        <p className="relative z-10 text-sm text-white/40">mail.muvance.com</p>
        {/* Decorative message cards */}
        <div className="pointer-events-none absolute top-24 -right-16 w-[420px] rotate-[-6deg] space-y-3 opacity-90">
          {[
            ['Proposal for Q1 growth', 'Here is the plan we discussed on the call…'],
            ['Invoice INV-0042', 'Thanks for the quick turnaround this month.'],
            ['Creative review', 'Version 3 looks great. Two small notes…'],
          ].map(([title, body], i) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur"
              style={{ marginLeft: i * 28 }}
            >
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-accent" />
                <p className="text-sm font-medium">{title}</p>
              </div>
              <p className="mt-1 text-sm text-white/50">{body}</p>
            </div>
          ))}
        </div>
      </aside>

      {/* Form side */}
      <main className="flex items-center justify-center px-5 py-12">
        <form onSubmit={submit} className="animate-fade-up w-full max-w-sm">
          <div className="mb-10 flex items-center gap-2.5 lg:hidden">
            <LogoMark className="w-8" />
            <span className="font-logo text-lg font-semibold tracking-[-0.03em]">Muvance Mail</span>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">Sign in to your inbox</h2>
          <p className="mt-1.5 text-sm text-muted">Use your @muvance.com address.</p>

          <label className="mt-8 block">
            <span className="text-sm font-medium">Email</span>
            <div className="mt-1.5 flex h-11 items-center rounded-xl border border-line bg-white pr-3 transition focus-within:border-ink focus-within:ring-4 focus-within:ring-black/5">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                autoFocus
                required
                placeholder="you"
                className="h-full min-w-0 flex-1 rounded-xl bg-transparent px-3.5 text-[15px] outline-none"
              />
              {!email.includes('@') && <span className="text-sm text-muted">@muvance.com</span>}
            </div>
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-medium">Password</span>
            <div className="mt-1.5 flex h-11 items-center rounded-xl border border-line bg-white pr-1.5 transition focus-within:border-ink focus-within:ring-4 focus-within:ring-black/5">
              <input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
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

          <p className="mt-8 flex items-center gap-2 text-xs text-muted">
            <Lock className="size-3.5" /> Forgot your password? Ask a Muvance admin to reset it.
          </p>
        </form>
      </main>
    </div>
  );
}
