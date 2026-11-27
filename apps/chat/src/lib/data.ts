import { useMemo } from 'react';
import {
  useInfiniteQuery,
  useQuery,
  type InfiniteData,
  type QueryClient,
} from '@tanstack/react-query';
import type {
  ChatBootstrapDto,
  ChatMessageDto,
  ChatMessagePage,
  ChatPersonDto,
  ChatSpaceDto,
  ChatThreadDto,
} from '@muvance/shared';
import { api } from './api';

export const keys = {
  bootstrap: ['bootstrap'] as const,
  messages: (spaceId: string) => ['messages', spaceId] as const,
  thread: (rootId: string) => ['thread', rootId] as const,
  pins: (spaceId: string) => ['pins', spaceId] as const,
  shared: (spaceId: string, kind: string) => ['shared', spaceId, kind] as const,
  saved: ['saved'] as const,
};

export function useBootstrap(enabled = true) {
  return useQuery({
    queryKey: keys.bootstrap,
    queryFn: () => api.get<ChatBootstrapDto>('/bootstrap'),
    enabled,
    staleTime: 60_000,
  });
}

/** The signed-in app's data. Only used below the point where it has loaded. */
export function useChat() {
  const { data } = useBootstrap();
  const people = useMemo(() => new Map(data?.people.map((p) => [p.id, p]) ?? []), [data?.people]);
  const savedIds = useMemo(() => new Set(data?.savedIds ?? []), [data?.savedIds]);
  if (!data) throw new Error('useChat before the chat loaded');
  return { me: data.me, spaces: data.spaces, people, savedIds, pushKey: data.pushKey };
}

export const UNKNOWN_PERSON: ChatPersonDto = {
  id: '',
  kind: 'guest',
  name: 'Former member',
  email: '',
  company: null,
  avatarUrl: null,
  online: false,
  status: 'removed',
  customStatus: null,
  dnd: false,
};

export function personOf(people: Map<string, ChatPersonDto>, id: string) {
  return people.get(id) ?? { ...UNKNOWN_PERSON, id };
}

/** The other person in a direct message. */
export function dmPartner(space: ChatSpaceDto, meId: string, people: Map<string, ChatPersonDto>) {
  const other = space.members.find((m) => m.userId !== meId)?.userId ?? meId;
  return personOf(people, other);
}

export function spaceTitle(space: ChatSpaceDto, meId: string, people: Map<string, ChatPersonDto>) {
  return space.kind === 'dm' ? dmPartner(space, meId, people).name : space.name;
}

export function hasGuests(space: ChatSpaceDto, people: Map<string, ChatPersonDto>) {
  return space.members.some((m) => people.get(m.userId)?.kind === 'guest');
}

export function useMessages(spaceId: string) {
  return useInfiniteQuery({
    queryKey: keys.messages(spaceId),
    queryFn: ({ pageParam }) =>
      api.get<ChatMessagePage>(
        `/spaces/${spaceId}/messages${pageParam ? `?before=${pageParam}` : ''}`,
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => (last.hasMore ? (last.messages[0]?.id ?? null) : null),
    staleTime: Infinity,
  });
}

/** Oldest first. Pages are newest first, each oldest-to-newest inside. */
export function flattenPages(data: InfiniteData<ChatMessagePage> | undefined) {
  return data ? [...data.pages].reverse().flatMap((p) => p.messages) : [];
}

export function useThread(rootId: string | null) {
  return useQuery({
    queryKey: keys.thread(rootId ?? ''),
    queryFn: () => api.get<ChatThreadDto>(`/messages/${rootId}/thread`),
    enabled: Boolean(rootId),
    staleTime: Infinity,
  });
}

export function usePins(spaceId: string) {
  return useQuery({
    queryKey: keys.pins(spaceId),
    queryFn: () => api.get<{ messages: ChatMessageDto[] }>(`/spaces/${spaceId}/pins`),
    staleTime: 30_000,
  });
}

/* Cache updates ------------------------------------------------------------------------------ */

/** Puts a new or changed message into the conversation (or its thread), wherever it's cached. */
export function upsertMessage(qc: QueryClient, message: ChatMessageDto) {
  if (!message.threadId) {
    qc.setQueryData<InfiniteData<ChatMessagePage>>(keys.messages(message.spaceId), (data) => {
      if (!data) return data;
      let found = false;
      const pages = data.pages.map((p) => ({
        ...p,
        messages: p.messages.map((m) => {
          if (m.id !== message.id) return m;
          found = true;
          return message;
        }),
      }));
      if (!found && pages[0]) {
        pages[0] = { ...pages[0], messages: [...pages[0].messages, message] };
      }
      return { ...data, pages };
    });
    qc.setQueryData<ChatThreadDto>(keys.thread(message.id), (t) =>
      t ? { ...t, root: message } : t,
    );
    // Pinned or un-pinned: the conversation's pinned list changes.
    qc.setQueryData<{ messages: ChatMessageDto[] }>(keys.pins(message.spaceId), (d) => {
      if (!d) return d;
      const others = d.messages.filter((m) => m.id !== message.id);
      return {
        messages: message.pinned && !message.deleted ? [message, ...others] : others,
      };
    });
  } else {
    qc.setQueryData<ChatThreadDto>(keys.thread(message.threadId), (t) => {
      if (!t) return t;
      const exists = t.replies.some((r) => r.id === message.id);
      return {
        ...t,
        replies: exists
          ? t.replies.map((r) => (r.id === message.id ? message : r))
          : [...t.replies, message],
      };
    });
  }
}

export function patchBootstrap(qc: QueryClient, fn: (d: ChatBootstrapDto) => ChatBootstrapDto) {
  qc.setQueryData<ChatBootstrapDto>(keys.bootstrap, (d) => (d ? fn(d) : d));
}

export function setSaved(qc: QueryClient, id: string, saved: boolean) {
  patchBootstrap(qc, (d) => ({
    ...d,
    savedIds: saved
      ? [id, ...d.savedIds.filter((x) => x !== id)]
      : d.savedIds.filter((x) => x !== id),
  }));
  void qc.invalidateQueries({ queryKey: keys.saved });
}

export function patchSpace(qc: QueryClient, id: string, fn: (s: ChatSpaceDto) => ChatSpaceDto) {
  patchBootstrap(qc, (d) => ({ ...d, spaces: d.spaces.map((s) => (s.id === id ? fn(s) : s)) }));
}

export function patchPerson(qc: QueryClient, person: ChatPersonDto) {
  patchBootstrap(qc, (d) => {
    const exists = d.people.some((p) => p.id === person.id);
    return {
      ...d,
      me: d.me.id === person.id ? { ...d.me, ...person } : d.me,
      people: exists
        ? d.people.map((p) => (p.id === person.id ? { ...p, ...person } : p))
        : [...d.people, person],
    };
  });
}
