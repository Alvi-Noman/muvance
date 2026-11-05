import { Router } from 'express';
import { deviceTokenSchema } from '@muvance/shared';
import { currentUser } from '@/middlewares/auth';
import { validateBody } from '@/middlewares/validate';
import { devicesService } from './devices.service';

/** Mounted behind `requireAuth`. The Android app saves its push token here after signing in. */
export const devicesRouter = Router();

devicesRouter.post('/', validateBody(deviceTokenSchema), async (req, res) => {
  await devicesService.register(currentUser(req), req.body.token);
  res.status(204).end();
});

// A POST, because the token shouldn't end up in access logs as part of a URL.
devicesRouter.post('/unregister', validateBody(deviceTokenSchema), async (req, res) => {
  await devicesService.unregister(currentUser(req), req.body.token);
  res.status(204).end();
});
