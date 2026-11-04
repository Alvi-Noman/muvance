import { rateLimit } from 'express-rate-limit';
import { isTest } from '@/config/env';

const message = {
  error: { message: 'Too many attempts. Please wait a few minutes and try again.' },
};

/** Slows down password guessing: 10 failed sign-ins per 15 minutes per IP. */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message,
  skip: () => isTest,
});

/** Stops spam bookings from the public website: 10 per hour per IP. */
export const bookingLimiter = rateLimit({
  windowMs: 60 * 60_000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message,
  skip: () => isTest,
});

/** A general ceiling for the whole API. */
export const apiLimiter = rateLimit({
  windowMs: 60_000,
  limit: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message,
  skip: () => isTest,
});
