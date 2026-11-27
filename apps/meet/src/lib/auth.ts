import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { MeDto } from '@muvance/shared';
import { api, ApiClientError } from './api';

/** The signed-in Muvance team member, or null for guests. Uses the same accounts as the admin. */
export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        const me = await api.get<MeDto>('/auth/me');
        // Hosting needs Meet on their Muvance account; anyone else joins as a guest.
        return me.mustChangePassword || !me.apps.meet ? null : me;
      } catch (error) {
        if (error instanceof ApiClientError && error.status === 401) return null;
        throw error;
      }
    },
    staleTime: 5 * 60_000,
  });
}

export function useSignIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { identifier: string; password: string }) =>
      api.post<MeDto>('/auth/login', input),
    onSuccess: (me) =>
      queryClient.setQueryData(['me'], me.mustChangePassword || !me.apps.meet ? null : me),
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<void>('/auth/logout'),
    onSuccess: () => {
      queryClient.setQueryData(['me'], null);
      queryClient.removeQueries({ queryKey: ['my-rooms'] });
    },
  });
}
