import { useEffect, useRef } from 'react';
import { useIsRecording } from '@livekit/components-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { MeetRecordingStateDto } from '@muvance/shared';
import { api, errorMessage } from '@/lib/api';

/**
 * Whether this call is being recorded. LiveKit tells everyone in the call the moment the recorder
 * joins; the API also says who started it.
 */
export function useRecording(code: string, notify?: (text: string) => void) {
  const queryClient = useQueryClient();
  const liveRecording = useIsRecording();
  const state = useQuery({
    queryKey: ['recording', code],
    queryFn: () => api.get<MeetRecordingStateDto>(`/meet/rooms/${code}/recording`),
    refetchInterval: 5000,
  });
  const active = liveRecording || (state.data?.active ?? false);

  // Tell people when recording starts or stops (but not on first load).
  const previous = useRef<boolean | null>(null);
  useEffect(() => {
    if (previous.current !== null && previous.current !== active) {
      notify?.(active ? 'This call is now being recorded' : 'Recording stopped');
    }
    previous.current = active;
  }, [active, notify]);

  const refresh = (data: MeetRecordingStateDto) =>
    queryClient.setQueryData(['recording', code], data);

  const start = useMutation({
    mutationFn: () => api.post<MeetRecordingStateDto>(`/meet/rooms/${code}/recording`),
    onSuccess: refresh,
    onError: (error) => notify?.(errorMessage(error)),
  });
  const stop = useMutation({
    mutationFn: () => api.delete<MeetRecordingStateDto>(`/meet/rooms/${code}/recording`),
    onSuccess: refresh,
    onError: (error) => notify?.(errorMessage(error)),
  });

  return {
    active,
    startedByName: state.data?.startedByName ?? null,
    starting: start.isPending,
    stopping: stop.isPending,
    start: () => start.mutate(),
    stop: () => stop.mutate(),
  };
}
