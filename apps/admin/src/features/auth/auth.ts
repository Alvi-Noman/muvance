import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  AcceptInviteInput,
  ChangePasswordInput,
  InviteInfoDto,
  LoginInput,
  UpdateProfileInput,
  MeDto,
  Permission,
} from '@muvance/shared';
import { api, ApiClientError } from '@/lib/api-client';
import { meKey } from '@/lib/query-client';

/** The signed-in user, or null when signed out. */
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
    staleTime: 5 * 60_000,
  });
}

/** The signed-in user. Only use inside routes guarded by RequireAuth. */
export function useCurrentUser() {
  const { data } = useMe();
  if (!data) throw new Error('useCurrentUser used outside an authenticated route');
  return data;
}

export function useCan(permission: Permission) {
  const { data } = useMe();
  return !!data?.permissions.includes(permission);
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) => api.post<MeDto>('/auth/login', input),
    onSuccess: (me) => queryClient.setQueryData(meKey, me),
    onError: () => {}, // Shown inline on the form.
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<void>('/auth/logout'),
    onSettled: () => {
      queryClient.clear();
      queryClient.setQueryData(meKey, null);
    },
  });
}

export function useInviteInfo(token: string | null) {
  return useQuery({
    queryKey: ['auth', 'invite', token],
    queryFn: () => api.get<InviteInfoDto>(`/auth/invites/${encodeURIComponent(token!)}`),
    enabled: !!token,
    retry: false,
  });
}

export function useAcceptInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AcceptInviteInput) => api.post<MeDto>('/auth/accept-invite', input),
    onSuccess: (me) => queryClient.setQueryData(meKey, me),
    onError: () => {},
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => api.patch<MeDto>('/auth/me', input),
    onSuccess: (me) => queryClient.setQueryData(meKey, me),
  });
}

export function useChangePassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ChangePasswordInput) => api.post<void>('/auth/change-password', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: meKey }),
    onError: () => {},
  });
}
