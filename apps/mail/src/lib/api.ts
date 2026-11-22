import type { ApiError } from '@muvance/shared';

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

/** Called when the server says the sign-in has ended, so the app can show the login page. */
let onSignedOut: (() => void) | null = null;
export function setSignedOutHandler(handler: () => void) {
  onSignedOut = handler;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api/webmail${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
      credentials: 'include',
    });
  } catch {
    throw new ApiClientError(0, "You're offline. Check your connection.");
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiError | null;
    if (res.status === 401 && !path.startsWith('/login')) onSignedOut?.();
    throw new ApiClientError(res.status, body?.error.message ?? 'Something went wrong');
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(data ?? {}) }),
  put: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(data ?? {}) }),
};

export function attachmentUrl(folder: string, uid: number, index: number, inline = false) {
  const q = new URLSearchParams({ folder });
  if (inline) q.set('inline', '1');
  return `/api/webmail/messages/${uid}/attachments/${index}?${q}`;
}

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong';
}
