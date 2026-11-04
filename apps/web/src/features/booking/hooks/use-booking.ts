import { useMutation, useQuery } from '@tanstack/react-query';
import { createBooking, getAvailability } from '../api/booking-api';

export const availabilityKey = ['availability'] as const;

export function useAvailability() {
  return useQuery({
    queryKey: availabilityKey,
    queryFn: getAvailability,
    staleTime: 15_000,
    // Times get booked and freed all the time, so keep them fresh while the page is open.
    refetchInterval: 30_000,
  });
}

export function useCreateBooking() {
  return useMutation({ mutationFn: createBooking });
}
