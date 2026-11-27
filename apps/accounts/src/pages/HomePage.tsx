import { useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Camera,
  Check,
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  MessageSquareText,
  Video,
} from 'lucide-react';
import { appLabels, muvanceApps, type MeDto, type MuvanceApp } from '@muvance/shared';
import { api, errorMessage } from '@/lib/api';
import { appUrl, useSetMe } from '@/lib/apps';
import { squareAvatar } from '@/lib/avatar-image';
import { cn } from '@/lib/cn';
import { ErrorNote, LogoMark, PasswordField, Spinner } from '@/ui';

/** What each app is, for the person using it. */
const ABOUT: Record<MuvanceApp, string> = {
  admin: 'Leads, bookings, meetings and the team.',
  mail: 'Your @muvance.com email.',
  chat: 'Talk with the team and clients.',
  meet: 'Video meetings with anyone.',
};

const APP_LOOK: Record<MuvanceApp, { icon: ReactNode; tone: string }> = {
  admin: { icon: <LayoutDashboard />, tone: 'bg-neutral-900 text-white' },
  mail: { icon: <Mail />, tone: 'bg-[#e8f0ff] text-[#2f5bff]' },
  chat: { icon: <MessageSquareText />, tone: 'bg-[#2f5bff] text-white' },
  meet: { icon: <Video />, tone: 'bg-emerald-100 text-emerald-700' },
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}

/** Your Muvance account: your apps, your details, your password. */
export function HomePage({ me }: { me: MeDto }) {
  const setMe = useSetMe();
  const qc = useQueryClient();

  const signOut = async (everywhere: boolean) => {
    if (everywhere && !window.confirm('Sign out on every device and in every Muvance app?')) return;
    await api.post(everywhere ? '/auth/logout-everywhere' : '/auth/logout').catch(() => {});
    qc.clear();
    setMe(null);
  };

  return (
    <div className="min-h-dvh">
      <header className="flex h-16 items-center gap-2.5 px-4 sm:px-8">
        <span className="inline-flex size-9 items-center justify-center rounded-xl bg-ink text-white">
          <LogoMark className="w-5" />
        </span>
        <span className="font-logo text-lg font-semibold tracking-[-0.03em]">Muvance</span>
        <span className="text-lg text-muted">Account</span>
        <button
          type="button"
          onClick={() => void signOut(false)}
          className="ml-auto inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-sm font-medium text-muted transition hover:bg-black/5 hover:text-ink"
        >
          <LogOut className="size-4" /> Sign out
        </button>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-6 pb-16 sm:px-8">
        <section className="animate-fade-up flex flex-col items-center text-center">
          <Picture me={me} />
          <h1 className="mt-4 font-serif text-4xl tracking-tight sm:text-5xl">
            Welcome, {me.name.split(' ')[0]}
          </h1>
          <p className="mt-2 text-muted">{me.address ?? me.email}</p>
        </section>

        <section className="mt-10">
          <h2 className="mb-3 text-sm font-semibold tracking-wide text-muted uppercase">
            Your apps
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {muvanceApps.map((app) => {
              const on = me.apps[app];
              const look = APP_LOOK[app];
              const body = (
                <>
                  <span
                    className={cn(
                      'inline-flex size-12 shrink-0 items-center justify-center rounded-2xl [&_svg]:size-6',
                      on ? look.tone : 'bg-neutral-100 text-neutral-400',
                    )}
                  >
                    {look.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{appLabels[app]}</span>
                    <span className="block text-sm text-muted">
                      {on ? ABOUT[app] : 'Not part of your account. Ask an admin.'}
                    </span>
                  </span>
                </>
              );
              return on ? (
                <a
                  key={app}
                  href={appUrl(app)}
                  className="flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-line transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {body}
                </a>
              ) : (
                <div
                  key={app}
                  className="flex items-center gap-4 rounded-2xl bg-white/50 p-4 opacity-70 ring-1 ring-line"
                >
                  {body}
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-2">
          <NameCard me={me} />
          <PasswordCard />
        </section>

        <section className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-5 ring-1 ring-line">
          <div>
            <p className="font-medium">Signed in somewhere you shouldn't be?</p>
            <p className="text-sm text-muted">Sign out on every device, in every Muvance app.</p>
          </div>
          <button
            type="button"
            onClick={() => void signOut(true)}
            className="h-10 rounded-xl border border-line px-4 text-sm font-medium transition hover:bg-black/[0.03]"
          >
            Sign out everywhere
          </button>
        </section>
      </main>
    </div>
  );
}

function Picture({ me }: { me: MeDto }) {
  const setMe = useSetMe();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const canChange = Boolean(me.apps.mail && me.address);

  const choose = async (file: File) => {
    setBusy(true);
    setError('');
    try {
      setMe(await api.put<MeDto>('/auth/me/avatar', { image: await squareAvatar(file) }));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        disabled={!canChange || busy}
        onClick={() => input.current?.click()}
        className="group relative size-24 overflow-hidden rounded-full bg-[#e8f0ff] text-3xl font-semibold text-[#2f5bff] ring-4 ring-white"
        aria-label="Change your picture"
      >
        {me.avatarUrl ? (
          <img src={me.avatarUrl} alt="" className="size-full object-cover" />
        ) : (
          <span className="flex size-full items-center justify-center">{initials(me.name)}</span>
        )}
        {canChange && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition group-hover:opacity-100">
            {busy ? <Spinner /> : <Camera className="size-6" />}
          </span>
        )}
      </button>
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void choose(file);
          e.target.value = '';
        }}
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function NameCard({ me }: { me: MeDto }) {
  const setMe = useSetMe();
  const [name, setName] = useState(me.name);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      setMe(await api.patch<MeDto>('/auth/me', { name }));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-line">
      <div>
        <p className="font-medium">Your details</p>
        <p className="text-sm text-muted">Shown in every app, and on your email.</p>
      </div>
      <label className="block">
        <span className="text-sm font-medium">Name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={100}
          className="mt-1.5 h-11 w-full rounded-xl border border-line px-3.5 outline-none focus:border-ink"
        />
      </label>
      <div className="text-sm">
        <span className="text-muted">Username</span>{' '}
        <span className="font-medium">{me.username ?? '—'}</span>
      </div>
      {error && <ErrorNote>{error}</ErrorNote>}
      <button
        type="submit"
        disabled={busy || name.trim() === me.name}
        className="inline-flex h-10 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-medium text-white disabled:opacity-40"
      >
        {saved ? <Check className="size-4" /> : null}
        {saved ? 'Saved' : 'Save'}
      </button>
    </form>
  );
}

function PasswordCard() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (next.length < 10) return setError('Use at least 10 characters.');
    setBusy(true);
    setError('');
    try {
      await api.post('/auth/change-password', { currentPassword: current, newPassword: next });
      setCurrent('');
      setNext('');
      setDone(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-line">
      <div>
        <p className="flex items-center gap-2 font-medium">
          <Lock className="size-4" /> Password
        </p>
        <p className="text-sm text-muted">
          One password for every app and your phone's mail app. Changing it signs you out on your
          other devices.
        </p>
      </div>
      <PasswordField
        label="Current password"
        value={current}
        onChange={setCurrent}
        autoComplete="current-password"
      />
      <PasswordField
        label="New password"
        value={next}
        onChange={(v) => {
          setNext(v);
          setDone(false);
        }}
        autoComplete="new-password"
        hint="At least 10 characters."
      />
      {error && <ErrorNote>{error}</ErrorNote>}
      {done && (
        <p className="rounded-xl bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-800">
          Password changed everywhere.
        </p>
      )}
      <button
        type="submit"
        disabled={busy || !current || !next}
        className="inline-flex h-10 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-medium text-white disabled:opacity-40"
      >
        {busy && <Spinner />}
        Change password
      </button>
    </form>
  );
}
