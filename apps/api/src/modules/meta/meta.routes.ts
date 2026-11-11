import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { metaBrowserEventSchema } from '@muvance/shared';
import { isTest } from '@/config/env';
import { validateBody } from '@/middlewares/validate';
import { metaService } from './meta.service';

/** Plenty for real browsing; stops one visitor flooding the ad account with fake page views. */
const eventsLimiter = rateLimit({
  windowMs: 10 * 60_000,
  limit: 60,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: () => isTest,
});

/** Public: the website reports Pixel events here so the API can send Meta a server copy. */
export const metaRouter = Router();
metaRouter.post('/events', eventsLimiter, validateBody(metaBrowserEventSchema), (req, res) => {
  // Not awaited: the visitor never waits on Meta.
  void metaService.trackBrowserEvent(req, req.body);
  res.status(204).end();
});
