import type { ApiError, ChatAttachmentDto } from '@muvance/shared';

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

/** Called when the server says the sign-in has ended, so the app can show the sign-in page. */
let onSignedOut: (() => void) | null = null;
export function setSignedOutHandler(handler: () => void) {
  onSignedOut = handler;
}

const PUBLIC = ['/login', '/invites/'];

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api/chat${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
      credentials: 'include',
    });
  } catch {
    throw new ApiClientError(0, "You're offline. Check your connection.");
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiError | null;
    if (res.status === 401 && !PUBLIC.some((p) => path.startsWith(p))) onSignedOut?.();
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
  patch: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(data ?? {}) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

/** What the app works out about a file before sending it. */
export interface FileMeta {
  width?: number;
  height?: number;
  durationMs?: number;
  voice?: boolean;
  waveform?: number[];
}

/** Uploads one file to a conversation, reporting progress (0–1). */
export function uploadFile(
  spaceId: string,
  file: File,
  meta: FileMeta | null,
  onProgress: (fraction: number) => void,
  signal?: AbortSignal,
) {
  return new Promise<ChatAttachmentDto>((resolve, reject) => {
    const q = new URLSearchParams({ name: file.name || 'file' });
    if (meta?.width && meta.height) {
      q.set('width', String(Math.round(meta.width)));
      q.set('height', String(Math.round(meta.height)));
    }
    if (meta?.durationMs) q.set('duration', String(Math.round(meta.durationMs)));
    if (meta?.voice) q.set('voice', '1');
    if (meta?.waveform?.length) q.set('waveform', meta.waveform.join(','));
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `/api/chat/spaces/${spaceId}/files?${q}`);
    xhr.withCredentials = true;
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText) as ChatAttachmentDto);
        return;
      }
      let message = xhr.status === 413 ? 'That file is too large (100 MB at most).' : '';
      try {
        message ||= (JSON.parse(xhr.responseText) as ApiError).error.message;
      } catch {
        message ||= "Couldn't upload the file.";
      }
      reject(new ApiClientError(xhr.status, message));
    };
    xhr.onerror = () => reject(new ApiClientError(0, "Couldn't upload: you seem to be offline."));
    xhr.onabort = () => reject(new ApiClientError(0, 'Upload cancelled'));
    signal?.addEventListener('abort', () => xhr.abort());
    xhr.send(file);
  });
}

export const fileUrl = (id: string, download = false) =>
  `/api/chat/files/${id}${download ? '?download=1' : ''}`;

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong';
}
