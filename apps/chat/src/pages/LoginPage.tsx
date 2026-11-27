import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Mail } from 'lucide-react';
import type { ChatSignInOptionsDto } from '@muvance/shared';
import { account, accountsUrl, isTeamLogin } from '@/lib/account';
import { api, errorMessage } from '@/lib/api';
import { keys } from '@/lib/data';
import { loadGoogle } from '@/lib/google';
import { LogoMark, Spinner } from '@/components/ui';

/**
 * Signing in to Muvance Chat. Clients (the default) never need a password: Continue with Google,
 * or a 6-digit code by email. The team uses their Muvance account, one step away.
 */

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
              Talk with the Muvance team about your work: updates, files and questions, all in one
              conversation.
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

/** The sign-in pages' frame: the brand panel on computers, the form on its own on phones. */
export function SignInFrame({ side, children }: { side?: ReactNode; children: ReactNode }) {
  return (
    <div className="grid min-h-full lg:grid-cols-[1.05fr_1fr]">
      <BrandSide>{side}</BrandSide>
      <main className="flex items-center justify-center px-5 py-12">
        <div className="animate-fade-up w-full max-w-sm">
          <div className="mb-10 flex items-center gap-2.5 lg:hidden">
            <LogoMark className="w-8" />
            <span className="font-logo text-lg font-semibold tracking-[-0.03em]">Muvance Chat</span>
          </div>
          {children}
        </div>
      </main>
    </div>
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

export const inputClass =
  'mt-1.5 h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[15px] outline-none transition focus:border-ink focus:ring-4 focus:ring-black/5';

export function PrimaryButton({ busy, children }: { busy: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="group mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink text-[15px] font-medium text-white transition hover:bg-black/85 disabled:opacity-60"
    >
      {busy ? <Spinner /> : children}
      {!busy && <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />}
    </button>
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
      {children}
    </p>
  );
}

function BackButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="-ml-1 mb-6 inline-flex items-center gap-1.5 rounded-lg px-1 py-0.5 text-sm text-muted hover:text-ink"
    >
      <ArrowLeft className="size-4" />
      {children}
    </button>
  );
}

type Step =
  | { kind: 'client' }
  | { kind: 'code'; email: string; code?: string }
  | { kind: 'team'; identifier: string; note?: string };

const MODE_KEY = 'mvc-sign-in-as';

/** Teammates who signed in here before see their sign-in first. */
function rememberedStep(): Step {
  try {
    if (localStorage.getItem(MODE_KEY) === 'team') return { kind: 'team', identifier: '' };
  } catch {
    // Storage blocked: start as a client.
  }
  return { kind: 'client' };
}

function remember(mode: 'team' | 'client') {
  try {
    localStorage.setItem(MODE_KEY, mode);
  } catch {
    // Not important.
  }
}

/** The link in the sign-in email: /signin?email=…&code=… */
function codeFromLink() {
  const params = new URLSearchParams(window.location.search);
  const email = params.get('email');
  const code = params.get('code');
  return window.location.pathname === '/signin' && email && code ? { email, code } : null;
}

export function LoginPage() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>(() => {
    const link = codeFromLink();
    return link ? { kind: 'code', ...link } : rememberedStep();
  });

  const signedIn = async () => {
    if (window.location.pathname === '/signin') window.history.replaceState(null, '', '/');
    await queryClient.resetQueries({ queryKey: keys.bootstrap });
  };

  return (
    <SignInFrame>
      {step.kind === 'client' && (
        <ClientStart
          onCode={(email) => setStep({ kind: 'code', email })}
          onTeam={(identifier, note) => {
            remember('team');
            setStep({ kind: 'team', identifier, note });
          }}
          onSignedIn={signedIn}
        />
      )}
      {step.kind === 'code' && (
        <CodeStep
          email={step.email}
          initialCode={step.code}
          onBack={() => setStep({ kind: 'client' })}
          onSignedIn={signedIn}
        />
      )}
      {step.kind === 'team' && (
        <TeamSignIn
          initial={step.identifier}
          note={step.note}
          onBack={() => {
            remember('client');
            setStep({ kind: 'client' });
          }}
          onSignedIn={signedIn}
        />
      )}
    </SignInFrame>
  );
}

function ClientStart({
  onCode,
  onTeam,
  onSignedIn,
}: {
  onCode: (email: string) => void;
  onTeam: (identifier: string, note?: string) => void;
  onSignedIn: () => Promise<void>;
}) {
  const options = useQuery({
    queryKey: ['sign-in-options'],
    queryFn: () => api.get<ChatSignInOptionsDto>('/sign-in-options'),
    staleTime: Infinity,
  });
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const googleClientId = options.data?.googleClientId ?? null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (isTeamLogin(value)) {
      onTeam(value, "That's a Muvance team address: sign in with your Muvance account password.");
      return;
    }
    setBusy(true);
    setError('');
    try {
      await api.post('/login/email', { email: value });
      onCode(value.toLowerCase());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const google = async (credential: string) => {
    setError('');
    try {
      await api.post('/login/google', { credential });
      await onSignedIn();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <>
      <h2 className="text-2xl font-semibold tracking-tight">Sign in to Muvance Chat</h2>
      <p className="mt-1.5 text-sm text-muted">Use the email address Muvance invited.</p>

      {googleClientId && (
        <>
          <GoogleButton clientId={googleClientId} onCredential={google} />
          <div className="my-6 flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-line" />
            or
            <span className="h-px flex-1 bg-line" />
          </div>
        </>
      )}

      <form onSubmit={submit} className={googleClientId ? '' : 'mt-8'}>
        <label className="block">
          <span className="text-sm font-medium">Email</span>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            autoFocus={!googleClientId}
            required
            placeholder="you@company.com"
            className={inputClass}
          />
        </label>
        <ErrorNote>{error}</ErrorNote>
        <PrimaryButton busy={busy}>Continue with email</PrimaryButton>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted">
          <Mail className="size-3.5" />
          We'll email you a code. No password needed.
        </p>
      </form>

      <div className="mt-10 border-t border-line pt-5 text-center text-sm text-muted">
        Muvance team member?{' '}
        <button
          type="button"
          onClick={() => onTeam('')}
          className="font-medium text-ink underline-offset-4 hover:underline"
        >
          Sign in here
        </button>
      </div>
    </>
  );
}

const RESEND_SECONDS = 30;

function CodeStep({
  email,
  initialCode,
  onBack,
  onSignedIn,
}: {
  email: string;
  initialCode?: string;
  onBack: () => void;
  onSignedIn: () => Promise<void>;
}) {
  const [code, setCode] = useState(initialCode ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [wait, setWait] = useState(initialCode ? 0 : RESEND_SECONDS);
  const tried = useRef('');

  useEffect(() => {
    if (wait <= 0) return;
    const timer = window.setTimeout(() => setWait((w) => w - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [wait]);

  const digits = code.replace(/\D/g, '');

  const verify = async (value: string) => {
    if (busy) return;
    tried.current = value;
    setBusy(true);
    setError('');
    try {
      await api.post('/login/code', { email, code: value });
      await onSignedIn();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  // Typing (or pasting) the sixth digit signs in; so does the link in the email.
  useEffect(() => {
    if (digits.length === 6 && tried.current !== digits) void verify(digits);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits]);

  const resend = async () => {
    setError('');
    setNotice('');
    try {
      await api.post('/login/email', { email });
      setCode('');
      tried.current = '';
      setWait(RESEND_SECONDS);
      setNotice('New code sent. Use the latest email.');
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void verify(digits);
      }}
    >
      <BackButton onClick={onBack}>Use a different email</BackButton>
      <h2 className="text-2xl font-semibold tracking-tight">Check your email</h2>
      <p className="mt-1.5 text-sm text-muted">
        We sent a 6-digit code to <span className="font-medium text-ink">{email}</span>. It works
        for 10 minutes.
      </p>
      <label className="mt-8 block">
        <span className="text-sm font-medium">Code</span>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/[^\d ]/g, '').slice(0, 7))}
          autoComplete="one-time-code"
          inputMode="numeric"
          autoFocus
          required
          placeholder="000000"
          className={`${inputClass} text-center font-mono text-2xl tracking-[0.4em] placeholder:text-black/15`}
        />
      </label>
      <ErrorNote>{error}</ErrorNote>
      {notice && !error && <p className="mt-4 text-sm text-emerald-700">{notice}</p>}
      <PrimaryButton busy={busy}>Sign in</PrimaryButton>
      <p className="mt-5 text-center text-sm text-muted">
        Can't find it? Check your spam folder, or{' '}
        {wait > 0 ? (
          <span>send a new one in {wait}s.</span>
        ) : (
          <button
            type="button"
            onClick={() => void resend()}
            className="font-medium text-ink underline-offset-4 hover:underline"
          >
            send a new code.
          </button>
        )}
      </p>
    </form>
  );
}

function TeamSignIn({
  initial,
  note,
  onBack,
  onSignedIn,
}: {
  initial: string;
  note?: string;
  onBack: () => void;
  onSignedIn: () => Promise<void>;
}) {
  const [identifier, setIdentifier] = useState(initial);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const looksUsername = Boolean(identifier) && !identifier.includes('@');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const me = await account.login(identifier.trim(), password);
      // A starting password from an admin: choose your own on the account page first.
      if (me.mustChangePassword) {
        window.location.assign(accountsUrl());
        return;
      }
      await onSignedIn();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <BackButton onClick={onBack}>Client sign-in</BackButton>
      <h2 className="text-2xl font-semibold tracking-tight">Muvance team sign-in</h2>
      <p className="mt-1.5 text-sm text-muted">
        {note ?? 'Your Muvance account: the same as Mail, Meet and the Admin CRM.'}
      </p>

      <label className="mt-8 block">
        <span className="text-sm font-medium">Username</span>
        <div className="mt-1.5 flex h-11 items-center rounded-xl border border-line bg-white pr-3 transition focus-within:border-ink focus-within:ring-4 focus-within:ring-black/5">
          <input
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            autoFocus={!initial}
            required
            placeholder="alvi"
            className="h-full min-w-0 flex-1 rounded-xl bg-transparent px-3.5 text-[15px] outline-none"
          />
          {looksUsername && <span className="text-sm text-muted">@muvance.com</span>}
        </div>
      </label>
      <label className="mt-4 block">
        <span className="text-sm font-medium">Password</span>
        <PasswordInput
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          autoFocus={Boolean(initial)}
        />
      </label>
      <ErrorNote>{error}</ErrorNote>
      <PrimaryButton busy={busy}>Sign in</PrimaryButton>
      <p className="mt-5 text-center text-xs text-muted">
        Forgot your password? Ask an admin for a password link.
      </p>
    </form>
  );
}

/** Google's own "Continue with Google" button (Google Identity Services). */
function GoogleButton({
  clientId,
  onCredential,
}: {
  clientId: string;
  onCredential: (credential: string) => Promise<void>;
}) {
  const box = useRef<HTMLDivElement>(null);
  const callback = useRef(onCredential);
  useEffect(() => {
    callback.current = onCredential;
  });
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadGoogle()
      .then((google) => {
        if (cancelled || !box.current) return;
        google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => void callback.current(response.credential),
          ux_mode: 'popup',
          context: 'signin',
          itp_support: true,
        });
        google.accounts.id.renderButton(box.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'center',
          width: Math.min(400, box.current.offsetWidth),
          // The page is in English.
          locale: 'en',
        });
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  if (failed) return null;
  return <div ref={box} className="mt-8 flex min-h-11 w-full justify-center" />;
}
