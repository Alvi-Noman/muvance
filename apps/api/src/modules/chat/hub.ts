import type { Response } from 'express';
import type { ChatEvent } from '@muvance/shared';

/**
 * Live updates for Muvance Chat, over Server-Sent Events: each open app keeps one connection, and
 * the API pushes new messages, typing and presence to the people they concern. Kept in memory
 * (the API runs as one process).
 */
const clients = new Map<string, Set<Response>>();

function write(res: Response, event: ChatEvent) {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

export const hub = {
  /** Registers a connection; returns true when this person just came online. */
  add(userId: string, res: Response) {
    let set = clients.get(userId);
    const cameOnline = !set;
    if (!set) {
      set = new Set();
      clients.set(userId, set);
    }
    set.add(res);
    return cameOnline;
  },

  /** Removes a connection; returns true when this person just went offline. */
  remove(userId: string, res: Response) {
    const set = clients.get(userId);
    if (!set) return false;
    set.delete(res);
    if (set.size) return false;
    clients.delete(userId);
    return true;
  },

  isOnline(userId: string) {
    return clients.has(userId);
  },

  send(userIds: Iterable<string>, event: ChatEvent, except?: string) {
    for (const id of new Set(userIds)) {
      if (id === except) continue;
      for (const res of clients.get(id) ?? []) write(res, event);
    }
  },

  /** Keeps connections open through proxies that close idle ones. */
  heartbeat() {
    for (const set of clients.values()) for (const res of set) res.write(': ping\n\n');
  },

  closeAll() {
    for (const set of clients.values()) for (const res of set) res.end();
    clients.clear();
  },
};

setInterval(() => hub.heartbeat(), 25_000).unref();
