import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { MeDto, MuvanceApp } from '@muvance/shared';
import { api, ApiClientError } from './api';

const isLocal = () =>
  window.location.hostname === 'localhost' || /^[\d.]+$/.test(window.location.hostname);
const domain = () => window.location.hostname.split('.').slice(-2).join('.');

/** Where each Muvance app lives. */
export function appUrl(app: MuvanceApp) {
  if (isLocal()) {
    const ports: Record<MuvanceApp, number> = { admin: 5174, mail: 5176, chat: 5177, meet: 5175 };
    return `http://localhost:${ports[app]}/`;
  }
  return `${window.location.protocol}//${app}.${domain()}/`;
}

/**
 * Where to go after signing in: `?continue=` when it's one of our own apps (never anywhere else),
 * otherwise this page.
 */
export function continueUrl() {
  const raw = new URLSearchParams(window.location.search).get('continue');
  if (!raw) return null;
  try {
    const url = new URL(raw);
    const ours = isLocal()
      ? url.hostname === 'localhost'
      : url.protocol === 'https:' &&
        (url.hostname === domain() || url.hostname.endsWith(`.${domain()}`));
    return ours ? url.toString() : null;
  } catch {
    return null;
  }
}

export const meKey = ['me'] as const;

/** The signed-in Muvance account, or null. */
export function useMe() {
  return useQuery({
    queryKey: meKey,
    queryFn: async () => {
      try {
        return await api.get<MeDto>('/auth/me');
      } catch (error) {
        if (error instanceof ApiClientError && error.status === 401) return null;
        throw error;
      }
    },
    staleTime: 60_000,
  });
}

export function useSetMe() {
  const qc = useQueryClient();
  return (me: MeDto | null) => qc.setQueryData(meKey, me);
}
