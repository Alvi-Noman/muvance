import { Router } from 'express';
import { createBookingSchema } from '@muvance/shared';
import { bookingLimiter } from '@/middlewares/rate-limit';
import { validateBody } from '@/middlewares/validate';
import { metaService } from '@/modules/meta/meta.service';
import { bookingsService } from './bookings.service';

/** Public endpoints used by the website's booking page. */
export const availabilityRouter = Router();
availabilityRouter.get('/', async (_req, res) => {
  res.set('Cache-Control', 'no-store').json(await bookingsService.getAvailability());
});

export const bookingsRouter = Router();
bookingsRouter.post('/', bookingLimiter, validateBody(createBookingSchema), async (req, res) => {
  const booking = await bookingsService.create(req.body);
  // Not awaited: the visitor shouldn't wait on Meta.
  void metaService.trackBooking(req, req.body);
  res.status(201).json(booking);
});
