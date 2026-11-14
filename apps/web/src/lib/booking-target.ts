import { createContext, useContext } from 'react';

/**
 * Where "Book a call" buttons lead. `null` (the default) opens the /book page; a string is the
 * id of a booking section on the current page, e.g. the ad landing page at /growth, so
 * visitors book without leaving it.
 */
export const BookingTargetContext = createContext<string | null>(null);

export const useBookingTarget = () => useContext(BookingTargetContext);
