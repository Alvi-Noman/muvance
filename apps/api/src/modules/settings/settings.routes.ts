import { Router } from 'express';
import { availabilitySettingsSchema, blockedTimeInputSchema } from '@muvance/shared';
import { hostTimeZone } from '@/config/booking';
import { currentUser, requirePermission } from '@/middlewares/auth';
import { validateBody } from '@/middlewares/validate';
import { toObjectId } from '@/lib/object-id';
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

/** Dates and times nobody can book on the website (holidays, other commitments…). */
settingsRouter.get('/blocked-times', async (_req, res) => {
  res.json({ blockedTimes: await settingsService.listBlockedTimes() });
});

settingsRouter.post(
  '/blocked-times',
  requirePermission('settings:manage'),
  validateBody(blockedTimeInputSchema),
  async (req, res) => {
    res.status(201).json(await settingsService.addBlockedTime(req.body, currentUser(req)));
  },
);

settingsRouter.delete(
  '/blocked-times/:id',
  requirePermission('settings:manage'),
  async (req, res) => {
    await settingsService.removeBlockedTime(toObjectId(String(req.params.id), 'Blocked time'));
    res.status(204).end();
  },
);
