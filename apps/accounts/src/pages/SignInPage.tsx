import { useState, type FormEvent } from 'react';
import type { MeDto } from '@muvance/shared';
import { api, errorMessage } from '@/lib/api';
import { continueUrl, useSetMe } from '@/lib/apps';
import { AuthCard, ErrorNote, PasswordField, SubmitButton, TextField } from '@/ui';

/** "Sign in with your Muvance account": one sign-in for every Muvance app. */
export function SignInPage() {
  const setMe = useSetMe();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const me = await api.post<MeDto>('/auth/login', { identifier, password });
      const next = continueUrl();
      // Straight back to the app they came from (unless they must choose a password first).
      if (next && !me.mustChangePassword) {
        window.location.assign(next);
        return;
      }
      setMe(me);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthCard
      title="Sign in"
      subtitle="with your Muvance account. One sign-in for the Admin CRM, Mail, Chat and Meet."
    >
      <form onSubmit={submit} className="space-y-4">
        <TextField
          label="Username or email"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          autoFocus
          required
          placeholder="alvi or alvi@muvance.com"
        />
        <PasswordField
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />
        {error && <ErrorNote>{error}</ErrorNote>}
        <SubmitButton busy={busy}>Sign in</SubmitButton>
        <p className="text-center text-xs text-muted">
          Forgot your password? Ask a Muvance admin for a password link.
        </p>
      </form>
    </AuthCard>
  );
}
