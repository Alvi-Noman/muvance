import { useEffect, useSyncExternalStore } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { ChatBootstrapDto, ChatEvent, ChatMessageDto } from '@muvance/shared';
import { keys, patchBootstrap, patchPerson, patchSpace, upsertMessage } from './data';
import { notifyMessage } from './notify';

/* What's on screen ------------------------------------------------------------------------- */

/** The conversation (and thread) open right now, so new messages there don't count as unread. */
export const view = { spaceId: null as string | null, threadId: null as string | null };
export const isWatching = (spaceId: string) =>
  view.spaceId === spaceId && document.visibilityState === 'visible' && document.hasFocus();

/* Who's typing ----------------------------------------------------------------------------- */

type TypingState = Record<string, string[]>; // "spaceId:threadId" -> user ids
let typing: TypingState = {};
const typingTimers = new Map<string, number>();
const typingListeners = new Set<() => void>();
const typingKey = (spaceId: string, threadId: string | null) => `${spaceId}:${threadId ?? ''}`;

function setTyping(key: string, userId: string, on: boolean) {
  const list = typing[key] ?? [];
  const next = on ? [...new Set([...list, userId])] : list.filter((id) => id !== userId);
  if (next.length === list.length && on === list.includes(userId)) return;
  typing = { ...typing, [key]: next };
  typingListeners.forEach((l) => l());
}

function markTyping(spaceId: string, threadId: string | null, userId: string) {
  const key = typingKey(spaceId, threadId);
  setTyping(key, userId, true);
  const timer = `${key}|${userId}`;
  window.clearTimeout(typingTimers.get(timer));
  typingTimers.set(
    timer,
    window.setTimeout(() => setTyping(key, userId, false), 6000),
  );
}

const EMPTY: string[] = [];
export function useTyping(spaceId: string, threadId: string | null) {
  const state = useSyncExternalStore(
    (l) => {
      typingListeners.add(l);
      return () => typingListeners.delete(l);
    },
    () => typing,
  );
  return state[typingKey(spaceId, threadId)] ?? EMPTY;
}

/* The live connection ---------------------------------------------------------------------- */

type ConnectionState = 'connecting' | 'open' | 'lost';
let connection: ConnectionState = 'connecting';
const connectionListeners = new Set<() => void>();
function setConnection(state: ConnectionState) {
  connection = state;
  connectionListeners.forEach((l) => l());
}
export function useConnection() {
  return useSyncExternalStore(
    (l) => {
      connectionListeners.add(l);
      return () => connectionListeners.delete(l);
    },
    () => connection,
  );
}

/**
 * Keeps one live connection to the API while the app is open, and applies what it hears to the
 * cached data: new messages, edits, reactions, typing, who's online, read receipts.
 */
export function useLiveUpdates(meId: string) {
  const qc = useQueryClient();

  useEffect(() => {
    let source: EventSource | null = null;
    let lostOnce = false;
    let retry: number | undefined;

    const onMessage = (message: ChatMessageDto, isNew: boolean) => {
      const data = qc.getQueryData<ChatBootstrapDto>(keys.bootstrap);
      const space = data?.spaces.find((s) => s.id === message.spaceId);
      if (!space) {
        // A conversation we don't know yet (a new DM, or we were just added).
        void qc.invalidateQueries({ queryKey: keys.bootstrap });
        if (isNew && message.authorId !== meId) notifyMessage(qc, message, meId);
        return;
      }
      upsertMessage(qc, message);
      if (!isNew) return;
      const fromOthers = message.authorId !== meId;
      const watching = isWatching(message.spaceId);
      patchSpace(qc, message.spaceId, (s) => ({
        ...s,
        lastMessageAt: message.createdAt,
        lastMessage: { authorId: message.authorId, text: message.text },
        unread: fromOthers && !watching ? s.unread + 1 : s.unread,
        mentioned:
          s.mentioned ||
          (fromOthers &&
            !watching &&
            (message.text.includes(`<@${meId}>`) || message.text.includes('<@all>'))),
      }));
      if (fromOthers && !watching) notifyMessage(qc, message, meId);
    };

    const seen = new Set<string>();
    const handle = (event: ChatEvent) => {
      switch (event.type) {
        case 'message': {
          const m = event.message;
          // The first time we hear of a message id, it's new; later events are edits.
          const isNew =
            !seen.has(m.id) &&
            !m.editedAt &&
            !m.deleted &&
            m.replyCount === 0 &&
            !m.reactions.length &&
            Date.now() - new Date(m.createdAt).getTime() < 120_000 &&
            !alreadyCached(m);
          seen.add(m.id);
          if (seen.size > 5000) seen.clear();
          onMessage(m, isNew);
          break;
        }
        case 'spaces':
          void qc.invalidateQueries({ queryKey: keys.bootstrap });
          break;
        case 'space-removed':
          patchBootstrap(qc, (d) => ({
            ...d,
            spaces: d.spaces.filter((s) => s.id !== event.spaceId),
          }));
          break;
        case 'typing':
          markTyping(event.spaceId, event.threadId, event.userId);
          break;
        case 'presence':
          patchBootstrap(qc, (d) => ({
            ...d,
            people: d.people.map((p) =>
              p.id === event.userId ? { ...p, online: event.online } : p,
            ),
          }));
          break;
        case 'read':
          patchSpace(qc, event.spaceId, (s) => ({
            ...s,
            members: s.members.map((m) =>
              m.userId === event.userId ? { ...m, lastReadAt: event.lastReadAt } : m,
            ),
            ...(event.userId === meId && { unread: 0, mentioned: false }),
          }));
          break;
        case 'person':
          patchPerson(qc, event.person);
          break;
      }
    };

    // Messages already in the cache (e.g. our own, added when sent) aren't new.
    const alreadyCached = (m: ChatMessageDto) => {
      if (m.threadId) {
        return Boolean(
          qc
            .getQueryData<{ replies: ChatMessageDto[] }>(keys.thread(m.threadId))
            ?.replies.some((r) => r.id === m.id),
        );
      }
      const pages = qc.getQueryData<{ pages: { messages: ChatMessageDto[] }[] }>(
        keys.messages(m.spaceId),
      )?.pages;
      return Boolean(pages?.some((p) => p.messages.some((x) => x.id === m.id)));
    };

    const connect = () => {
      source = new EventSource('/api/chat/events', { withCredentials: true });
      source.onopen = () => {
        setConnection('open');
        // Back after a drop: catch up on anything missed.
        if (lostOnce) void qc.invalidateQueries();
      };
      source.onmessage = (e: MessageEvent<string>) => {
        try {
          handle(JSON.parse(e.data) as ChatEvent);
        } catch {
          // Ignore anything unreadable.
        }
      };
      source.onerror = () => {
        lostOnce = true;
        setConnection('lost');
        // EventSource retries by itself unless the server refused (e.g. signed out).
        if (source?.readyState === EventSource.CLOSED) {
          source.close();
          retry = window.setTimeout(connect, 5000);
          void qc.invalidateQueries({ queryKey: keys.bootstrap });
        }
      };
    };
    connect();
    return () => {
      window.clearTimeout(retry);
      source?.close();
    };
  }, [qc, meId]);
}
