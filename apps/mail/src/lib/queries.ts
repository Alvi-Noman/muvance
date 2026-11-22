import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  WebmailFolderDto,
  WebmailMeDto,
  WebmailMessage,
  WebmailMessageList,
  WebmailTeamAvatars,
} from '@muvance/shared';
import { api, ApiClientError } from './api';

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        return await api.get<WebmailMeDto>('/me');
      } catch (error) {
        if (error instanceof ApiClientError && error.status === 401) return null;
        throw error;
      }
    },
    staleTime: 5 * 60_000,
  });
}

/** Teammates' profile pictures by email address (changes rarely). */
export function useTeamAvatars() {
  return useQuery({
    queryKey: ['team-avatars'],
    queryFn: () => api.get<WebmailTeamAvatars>('/team-avatars'),
    staleTime: 5 * 60_000,
  });
}

export function useFolders() {
  return useQuery({
    queryKey: ['folders'],
    queryFn: () => api.get<WebmailFolderDto[]>('/folders'),
    refetchInterval: 20_000,
  });
}

export function useMessages(folder: string, q: string) {
  return useInfiniteQuery({
    queryKey: ['messages', folder, q],
    queryFn: ({ pageParam }) =>
      api.get<WebmailMessageList>(
        `/messages?${new URLSearchParams({ folder, q, page: String(pageParam) })}`,
      ),
    initialPageParam: 0,
    getNextPageParam: (last) => last.nextPage,
    refetchInterval: 20_000,
  });
}

export function useMessage(folder: string, uid: number | null) {
  return useQuery({
    queryKey: ['message', folder, uid],
    queryFn: () => api.get<WebmailMessage>(`/messages/${uid}?${new URLSearchParams({ folder })}`),
    enabled: uid != null,
    staleTime: 5 * 60_000,
  });
}

/** Refreshes the lists and counts after something changed. */
export function useRefresh() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['messages'] });
    void queryClient.invalidateQueries({ queryKey: ['folders'] });
  };
}

export function useMessageActions(folder: string) {
  const refresh = useRefresh();
  const queryClient = useQueryClient();
  const patchList = (uids: number[], patch: { seen?: boolean; flagged?: boolean }) => {
    queryClient.setQueriesData<{ pages: WebmailMessageList[] }>(
      { queryKey: ['messages', folder] },
      (data) =>
        data && {
          ...data,
          pages: data.pages.map((p) => ({
            ...p,
            messages: p.messages.map((m) => (uids.includes(m.uid) ? { ...m, ...patch } : m)),
          })),
        },
    );
  };
  const removeFromList = (uids: number[]) => {
    queryClient.setQueriesData<{ pages: WebmailMessageList[] }>(
      { queryKey: ['messages', folder] },
      (data) =>
        data && {
          ...data,
          pages: data.pages.map((p) => ({
            ...p,
            messages: p.messages.filter((m) => !uids.includes(m.uid)),
          })),
        },
    );
  };

  const flags = useMutation({
    mutationFn: (v: { uids: number[]; seen?: boolean; flagged?: boolean }) =>
      api.post('/messages/flags', { folder, ...v }),
    onMutate: ({ uids, ...patch }) => patchList(uids, patch),
    onSettled: refresh,
  });
  const move = useMutation({
    mutationFn: (v: { uids: number[]; to: string }) => api.post('/messages/move', { folder, ...v }),
    onMutate: ({ uids }) => removeFromList(uids),
    onSettled: refresh,
  });
  const remove = useMutation({
    mutationFn: (uids: number[]) => api.post('/messages/delete', { folder, uids }),
    onMutate: (uids) => removeFromList(uids),
    onSettled: refresh,
  });
  return { flags, move, remove };
}

export type { WebmailMessage };
