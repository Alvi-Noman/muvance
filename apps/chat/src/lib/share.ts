/**
 * "Share to Muvance Chat": what another app shared (photos, files, a link), waiting in the service
 * worker's cache until the person picks a conversation.
 */

export interface SharedItems {
  text: string;
  files: File[];
}

const CACHE = 'muvance-share';

export async function takeShared(): Promise<SharedItems | null> {
  if (!('caches' in window)) return null;
  try {
    const cache = await caches.open(CACHE);
    const metaRes = await cache.match('/shared/meta');
    if (!metaRes) return null;
    const meta = (await metaRes.json()) as {
      text: string;
      files: { key: string; name: string; type: string }[];
    };
    const files: File[] = [];
    for (const f of meta.files) {
      const res = await cache.match(f.key);
      if (res) files.push(new File([await res.blob()], f.name || 'file', { type: f.type }));
    }
    for (const key of await cache.keys()) await cache.delete(key);
    return meta.text || files.length ? { text: meta.text, files } : null;
  } catch {
    return null;
  }
}

/** Handed from the share picker to the conversation's message box. */
let pending: (SharedItems & { spaceId: string }) | null = null;
export function setPendingShare(items: SharedItems & { spaceId: string }) {
  pending = items;
}
export function takePendingShare(spaceId: string) {
  if (pending?.spaceId !== spaceId) return null;
  const items = pending;
  pending = null;
  return items;
}
