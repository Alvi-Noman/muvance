import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  ActivityDto,
  BulkUpdateLeadsInput,
  CreateActivityInput,
  CreateLeadInput,
  DashboardDto,
  LeadDetailDto,
  LeadDto,
  LeadListDto,
  LeadListQuery,
  MeetingDto,
  LostReason,
  MeetingStatus,
  ScheduleMeetingInput,
  UpdateLeadInput,
} from '@muvance/shared';
import { api, toQuery } from '@/lib/api-client';

export const keys = {
  leads: ['leads'] as const,
  list: (query: LeadListQuery) => ['leads', 'list', query] as const,
  detail: (id: string) => ['leads', 'detail', id] as const,
  tags: ['leads', 'tags'] as const,
  meetings: ['meetings'] as const,
  dashboard: ['dashboard'] as const,
};

export function useLeads(query: LeadListQuery) {
  return useQuery({
    queryKey: keys.list(query),
    queryFn: () => api.get<LeadListDto>(`/leads${toQuery(query)}`),
    placeholderData: keepPreviousData,
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: () => api.get<LeadDetailDto>(`/leads/${id}`),
  });
}

export function useTags() {
  return useQuery({ queryKey: keys.tags, queryFn: () => api.get<string[]>('/leads/tags') });
}

export function useDashboard() {
  return useQuery({
    queryKey: keys.dashboard,
    queryFn: () => api.get<DashboardDto>('/dashboard'),
    refetchInterval: 60_000,
  });
}

export function useMeetings(range: 'upcoming' | 'past') {
  return useQuery({
    queryKey: [...keys.meetings, range],
    queryFn: () => api.get<MeetingDto[]>(`/meetings${toQuery({ range })}`),
    refetchInterval: 60_000,
  });
}

/** After any lead change, refresh everything that shows leads. */
function useInvalidateLeads() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: keys.leads }),
      queryClient.invalidateQueries({ queryKey: keys.meetings }),
      queryClient.invalidateQueries({ queryKey: keys.dashboard }),
    ]);
}

export function useCreateLead() {
  const invalidate = useInvalidateLeads();
  return useMutation({
    mutationFn: (input: CreateLeadInput) => api.post<LeadDto>('/leads', input),
    onSuccess: invalidate,
  });
}

export function useUpdateLead(id: string) {
  const invalidate = useInvalidateLeads();
  return useMutation({
    mutationFn: (input: UpdateLeadInput) => api.patch<LeadDto>(`/leads/${id}`, input),
    onSuccess: invalidate,
  });
}

/** Stage change for the pipeline board, applied optimistically so cards move instantly. */
export function useMoveLead() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateLeads();
  return useMutation({
    mutationFn: ({
      id,
      stage,
      lostReason,
      lostNote,
    }: {
      id: string;
      stage: LeadDto['stage'];
      lostReason?: LostReason;
      lostNote?: string;
    }) => api.patch<LeadDto>(`/leads/${id}`, { stage, lostReason, lostNote }),
    onMutate: async ({ id, stage }) => {
      await queryClient.cancelQueries({ queryKey: keys.leads });
      const snapshot = queryClient.getQueriesData<LeadListDto>({ queryKey: ['leads', 'list'] });
      // Move the card between the per-stage lists the board shows.
      const lead = snapshot.flatMap(([, data]) => data?.items ?? []).find((l) => l.id === id);
      if (lead) {
        for (const [key, data] of snapshot) {
          if (!data) continue;
          const query = key[2] as LeadListQuery;
          let items = data.items.filter((l) => l.id !== id);
          if (query.stage === stage) items = [{ ...lead, stage }, ...items];
          queryClient.setQueryData<LeadListDto>(key, {
            ...data,
            items,
            total: data.total + (items.length - data.items.length),
          });
        }
      }
      return { snapshot };
    },
    onError: (_error, _vars, context) => {
      for (const [key, data] of context?.snapshot ?? []) queryClient.setQueryData(key, data);
    },
    onSettled: invalidate,
  });
}

export function useBulkUpdate() {
  const invalidate = useInvalidateLeads();
  return useMutation({
    mutationFn: (input: BulkUpdateLeadsInput) =>
      api.post<{ updated: number }>('/leads/bulk', input),
    onSuccess: invalidate,
  });
}

export function useDeleteLead() {
  const invalidate = useInvalidateLeads();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/leads/${id}`),
    onSuccess: invalidate,
  });
}

export function useAddActivity(leadId: string) {
  const invalidate = useInvalidateLeads();
  return useMutation({
    mutationFn: (input: CreateActivityInput) =>
      api.post<ActivityDto>(`/leads/${leadId}/activities`, input),
    onSuccess: invalidate,
  });
}

export function useUpdateMeeting() {
  const invalidate = useInvalidateLeads();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: MeetingStatus }) =>
      api.patch<MeetingDto>(`/meetings/${id}`, { status }),
    onSuccess: invalidate,
  });
}

export function useScheduleMeeting(leadId: string) {
  const invalidate = useInvalidateLeads();
  return useMutation({
    mutationFn: (input: ScheduleMeetingInput) =>
      api.post<MeetingDto>(`/leads/${leadId}/meetings`, input),
    onSuccess: invalidate,
    onError: () => {}, // Shown inline in the dialog.
  });
}
