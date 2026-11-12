import { Router } from 'express';
import { createBookingSchema } from '@muvance/shared';
import { bookingLimiter } from '@/middlewares/rate-limit';
import { validateBody } from '@/middlewares/validate';
import { logger } from '@/lib/logger';
import { metaService } from '@/modules/meta/meta.service';
import { recordingsService } from '@/modules/recordings/recordings.service';
import { unfinishedService } from '@/modules/unfinished/unfinished.service';
import { bookingsService } from './bookings.service';

/** Public endpoints used by the website's booking page. */
export const availabilityRouter = Router();
availabilityRouter.get('/', async (_req, res) => {
  res.set('Cache-Control', 'no-store').json(await bookingsService.getAvailability());
});

export const bookingsRouter = Router();
bookingsRouter.post('/', bookingLimiter, validateBody(createBookingSchema), async (req, res) => {
  const { leadId, booking } = await bookingsService.create(req.body);
  // Not awaited: the visitor shouldn't wait on Meta.
  void metaService.trackBooking(req, req.body);
  await recordingsService
    .linkToLead(leadId, req.body.visitorId, req.body.recordingId)
    .catch((error: unknown) => logger.warn({ err: error }, 'Could not link recordings to lead'));
  // They finished after all: take them off the unfinished list.
  await unfinishedService
    .markBooked(leadId, req.body.phone, req.body.visitorId)
    .catch((error: unknown) => logger.warn({ err: error }, 'Could not update unfinished bookings'));
  res.status(201).json(booking);
});
