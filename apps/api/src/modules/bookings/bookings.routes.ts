import { Router } from 'express';
import { createBookingSchema } from '@muvance/shared';
import { bookingLimiter } from '@/middlewares/rate-limit';
import { validateBody } from '@/middlewares/validate';
import { bookingsService } from './bookings.service';

/** Public endpoints used by the website's booking page. */
export const availabilityRouter = Router();
availabilityRouter.get('/', async (_req, res) => {
  res.set('Cache-Control', 'no-store').json(await bookingsService.getAvailability());
});

export const bookingsRouter = Router();
bookingsRouter.post('/', bookingLimiter, validateBody(createBookingSchema), async (req, res) => {
  res.status(201).json(await bookingsService.create(req.body));
});
