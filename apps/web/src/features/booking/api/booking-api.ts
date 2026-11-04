import type { Availability, CreateBookingInput } from '@muvance/shared';
import { apiClient } from '@/lib/api-client';

export type CreatedBooking = { id: string; startsAt: string; endsAt: string };

export const getAvailability = () => apiClient.get<Availability>('/availability');

export const createBooking = (input: CreateBookingInput) =>
  apiClient.post<CreatedBooking>('/bookings', input);
