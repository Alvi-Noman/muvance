import { Router } from 'express';
import { availabilitySettingsSchema } from '@muvance/shared';
import { hostTimeZone } from '@/config/booking';
import { currentUser, requirePermission } from '@/middlewares/auth';
import { validateBody } from '@/middlewares/validate';
import { settingsService } from './settings.service';

/** Mounted behind `requireAuth`. */
export const settingsRouter = Router();

settingsRouter.get('/availability', async (_req, res) => {
  res.json({
    availability: await settingsService.getAvailability(),
    hostTimeZone: hostTimeZone.name,
  });
});

settingsRouter.put(
  '/availability',
  requirePermission('settings:manage'),
  validateBody(availabilitySettingsSchema),
  async (req, res) => {
    res.json({
      availability: await settingsService.updateAvailability(req.body, currentUser(req)),
      hostTimeZone: hostTimeZone.name,
    });
  },
);
