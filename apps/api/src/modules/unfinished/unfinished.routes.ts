import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { clientIdSchema, unfinishedBookingInputSchema } from '@muvance/shared';
import { isTest } from '@/config/env';
import { currentUser, requirePermission } from '@/middlewares/auth';
import { validateBody } from '@/middlewares/validate';
import { isBot } from '@/modules/recordings/recordings.service';
import { HttpError } from '@/utils/http-error';
import { unfinishedService } from './unfinished.service';

const draftId = (raw: unknown) => {
  const parsed = clientIdSchema.safeParse(raw);
  if (!parsed.success) throw HttpError.notFound('That unfinished booking is no longer on the list');
  return parsed.data;
};

/** Public: the booking form saves what's typed as it goes. */
export const unfinishedUploadRouter = Router();
unfinishedUploadRouter.post(
  '/',
  rateLimit({
    windowMs: 10 * 60_000,
    limit: 120,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skip: () => isTest,
  }),
  validateBody(unfinishedBookingInputSchema),
  async (req, res) => {
    if (!isBot(req.get('user-agent'))) await unfinishedService.save(req.body);
    res.status(204).end();
  },
);

/** Admin. Mounted behind `requireAuth`. */
export const unfinishedRouter = Router();

unfinishedRouter.get('/', requirePermission('leads:read'), async (_req, res) => {
  res.json(await unfinishedService.list());
});

unfinishedRouter.post('/:id/add-to-leads', requirePermission('leads:write'), async (req, res) => {
  res.json(await unfinishedService.addToLeads(draftId(req.params.id), currentUser(req)));
});

unfinishedRouter.delete('/:id', requirePermission('leads:write'), async (req, res) => {
  await unfinishedService.remove(draftId(req.params.id));
  res.status(204).end();
});
