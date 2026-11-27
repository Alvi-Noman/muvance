import type { ApiError, MeDto } from '@muvance/shared';
import { ApiClientError } from './api';

/**
 * Teammates use their Muvance account (one sign-in for every Muvance app); clients (guests) keep
 * their own chat sign-in.
 */

const isLocal = () =>
  window.location.hostname === 'localhost' || /^[\d.]+$/.test(window.location.hostname);

/** The Muvance account page, coming back here afterwards. */
export function accountsUrl(path = '/') {
  const base = isLocal()
    ? 'http://localhost:5178'
    : `${window.location.protocol}//accounts.${window.location.hostname.split('.').slice(-2).join('.')}`;
  const url = new URL(path, base);
  url.searchParams.set('continue', window.location.origin + '/');
  return url.toString();
}

/** Signing in as the team: a username, or an address at the team's domain. */
export const isTeamLogin = (identifier: string) =>
  !identifier.includes('@') || identifier.trim().toLowerCase().endsWith('@muvance.com');

async function call<T>(path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api/auth${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body ?? {}),
    });
  } catch {
    throw new ApiClientError(0, "You're offline. Check your connection.");
  }
  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as ApiError | null;
    throw new ApiClientError(res.status, err?.error.message ?? 'Something went wrong');
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

export const account = {
  login: (identifier: string, password: string) => call<MeDto>('/login', { identifier, password }),
  logout: () => call<void>('/logout'),
};
