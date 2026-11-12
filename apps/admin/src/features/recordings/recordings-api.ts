import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { RecordingDto, RecordingListQuery } from '@muvance/shared';
import { api, toQuery } from '@/lib/api-client';

export type RecordingEvent = { type: number; timestamp: number; data?: unknown };

export const useRecordings = (query: RecordingListQuery) =>
  useQuery({
    queryKey: ['recordings', query],
    queryFn: () =>
      api.get<{ items: RecordingDto[]; total: number }>(`/recordings${toQuery(query)}`),
    placeholderData: (previous) => previous,
  });

export const useRecording = (id: string) =>
  useQuery({
    queryKey: ['recordings', 'one', id],
    queryFn: () => api.get<RecordingDto>(`/recordings/${id}`),
  });

export const useRecordingEvents = (id: string) =>
  useQuery({
    queryKey: ['recordings', 'events', id],
    queryFn: () => api.get<RecordingEvent[]>(`/recordings/${id}/events`),
    // Recordings never change once watched, and can be large: keep them while open.
    staleTime: Infinity,
  });

export function useDeleteRecording() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/recordings/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recordings'] }),
  });
}

const PAGE_NAMES: Record<string, string> = {
  '/': 'Home',
  '/book': 'Booking page',
  '/thank-you': 'Thank-you page',
};
export const pageName = (path: string) => PAGE_NAMES[path] ?? path;

/** 42000 -> "0:42", 3_725_000 -> "1:02:05". */
export function formatDuration(ms: number) {
  const total = Math.round(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}
