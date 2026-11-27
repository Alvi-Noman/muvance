import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import type { MeetRoomDto } from '@muvance/shared';
import { Header } from '@/components/Header';
import { Button, Spinner } from '@/components/ui';
import { api, errorMessage } from '@/lib/api';
import { useSignIn } from '@/lib/auth';
import { parseMeetingCode } from '@/lib/meeting-code';

const isLocal = () =>
  window.location.hostname === 'localhost' || /^[\d.]+$/.test(window.location.hostname);

/** The Muvance account page, coming back here afterwards. */
function accountsUrl() {
  const base = isLocal()
    ? 'http://localhost:5178'
    : `${window.location.protocol}//accounts.${window.location.hostname.split('.').slice(-2).join('.')}`;
  const url = new URL('/', base);
  url.searchParams.set('continue', window.location.href);
  return url.toString();
}

/** Team sign-in with the Muvance account (the same one for every Muvance app). */
export function SignInPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [params] = useSearchParams();
  const signIn = useSignIn();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const me = await signIn.mutateAsync({ identifier, password });
      // A starting password from an admin: choose your own on the account page, then come back.
      if (me.mustChangePassword) {
        window.location.assign(accountsUrl());
        return;
      }
      if (!me.apps.meet) {
        setError(
          "Your Muvance account can't host meetings. Ask an admin, or join with a code as a guest.",
        );
        return;
      }
      const next = params.get('next');
      if (next === 'new') {
        const room = await api.post<MeetRoomDto>('/meet/rooms');
        await queryClient.invalidateQueries({ queryKey: ['my-rooms'] });
        navigate(`/${room.code}`, { replace: true });
        return;
      }
      const code = next ? parseMeetingCode(next) : null;
      navigate(code ? `/${code}` : '/', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <form
          onSubmit={submit}
          className="animate-fade-up w-full max-w-sm rounded-[2rem] border border-white/60 bg-white/70 p-7 shadow-xl shadow-black/5 backdrop-blur"
        >
          <h1 className="font-serif text-4xl">Team sign in</h1>
          <p className="mt-2 text-sm text-neutral-600">
            With your Muvance account (the same for Mail, Chat and the Admin CRM), to start meetings
            and let guests in.
          </p>
          <label className="mt-6 block text-sm font-medium">
            Username or email
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
              autoFocus
              required
              className="mt-1.5 w-full rounded-xl border border-black/15 bg-white px-4 py-3 outline-none focus:border-neutral-950"
            />
          </label>
          <label className="mt-4 block text-sm font-medium">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="mt-1.5 w-full rounded-xl border border-black/15 bg-white px-4 py-3 outline-none focus:border-neutral-950"
            />
          </label>
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          <Button type="submit" className="mt-6 w-full" disabled={signIn.isPending}>
            {signIn.isPending && <Spinner className="size-4" />} Sign in
          </Button>
          <p className="mt-5 text-center text-sm text-neutral-500">
            Joining as a guest?{' '}
            <Link
              to="/"
              className="font-medium text-neutral-950 underline-offset-4 hover:underline"
            >
              Enter a code instead
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}
