import type { ApiError } from '@muvance/shared';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    credentials: 'include',
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiError | null;
    throw new ApiClientError(
      res.status,
      body?.error.message ?? res.statusText,
      body?.error.details,
    );
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

const send = <T>(method: string, path: string, data?: unknown) =>
  request<T>(path, { method, body: data === undefined ? undefined : JSON.stringify(data) });

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: unknown) => send<T>('POST', path, data),
  put: <T>(path: string, data?: unknown) => send<T>('PUT', path, data),
  patch: <T>(path: string, data?: unknown) => send<T>('PATCH', path, data),
  delete: (path: string) => send<void>('DELETE', path),
  /** Absolute URL for files the browser downloads directly (e.g. CSV export). */
  url: (path: string) => `${API_URL}${path}`,
};

/** Builds "?a=1&b=2", skipping empty values. */
export function toQuery(params: Record<string, string | number | undefined | null>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : '';
}

/** A readable message from any thrown value. */
export const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Something went wrong';
