import { Router } from 'express';
import { applicationInputSchema, applicationStatusSchema } from '@muvance/shared';
import { requirePermission } from '@/middlewares/auth';
import { applicationLimiter } from '@/middlewares/rate-limit';
import { validateBody } from '@/middlewares/validate';
import { metaService } from '@/modules/meta/meta.service';
import { isBot } from '@/modules/recordings/recordings.service';
import { applicationsService } from './applications.service';

/** Public: the website's invest and training forms. */
export const applicationUploadRouter = Router();
applicationUploadRouter.post(
  '/',
  applicationLimiter,
  validateBody(applicationInputSchema),
  async (req, res) => {
    // Bots get the same answer but nothing is saved.
    if (!isBot(req.get('user-agent'))) {
      await applicationsService.create(req.body);
      // Not awaited: the visitor shouldn't wait on Meta.
      void metaService.trackApplication(req, req.body);
    }
    res.status(201).json({ ok: true });
  },
);

/** Admin. Mounted behind `requireAuth`. */
export const applicationsRouter = Router();

applicationsRouter.get('/', requirePermission('leads:read'), async (_req, res) => {
  res.json(await applicationsService.list());
});

applicationsRouter.patch(
  '/:id',
  requirePermission('leads:write'),
  validateBody(applicationStatusSchema),
  async (req, res) => {
    res.json(await applicationsService.setStatus(String(req.params.id), req.body.status));
  },
);

applicationsRouter.delete('/:id', requirePermission('leads:delete'), async (req, res) => {
  await applicationsService.remove(String(req.params.id));
  res.status(204).end();
});
