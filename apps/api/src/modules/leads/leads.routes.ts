import { Router } from 'express';
import {
  bulkUpdateLeadsSchema,
  createActivitySchema,
  createLeadSchema,
  leadListQuerySchema,
  scheduleMeetingSchema,
  updateLeadSchema,
} from '@muvance/shared';
import { currentUser, requirePermission } from '@/middlewares/auth';
import { validateBody, validateQuery } from '@/middlewares/validate';
import { leadsService } from './leads.service';

/** Mounted behind `requireAuth`. */
export const leadsRouter = Router();

/** Byte-order mark so Excel opens UTF-8 (e.g. Bangla names) correctly. */
const UTF8_BOM = String.fromCharCode(0xfeff);

const canRead = requirePermission('leads:read');
const canWrite = requirePermission('leads:write');

leadsRouter.get('/', canRead, validateQuery(leadListQuerySchema), async (req, res) => {
  res.json(await leadsService.list(res.locals.query, currentUser(req)));
});

leadsRouter.get(
  '/export.csv',
  requirePermission('leads:export'),
  validateQuery(leadListQuerySchema),
  async (req, res) => {
    const csv = await leadsService.exportCsv(res.locals.query, currentUser(req));
    const date = new Date().toISOString().slice(0, 10);
    res
      .type('text/csv; charset=utf-8')
      .attachment(`muvance-leads-${date}.csv`)
      .send(UTF8_BOM + csv);
  },
);

leadsRouter.get('/tags', canRead, async (_req, res) => {
  res.json(await leadsService.tags());
});

leadsRouter.post('/', canWrite, validateBody(createLeadSchema), async (req, res) => {
  res.status(201).json(await leadsService.create(req.body, currentUser(req)));
});

leadsRouter.post('/bulk', canWrite, validateBody(bulkUpdateLeadsSchema), async (req, res) => {
  res.json(await leadsService.bulkUpdate(req.body, currentUser(req)));
});

leadsRouter.get('/:id', canRead, async (req, res) => {
  res.json(await leadsService.detail(String(req.params.id)));
});

leadsRouter.patch('/:id', canWrite, validateBody(updateLeadSchema), async (req, res) => {
  res.json(await leadsService.update(String(req.params.id), req.body, currentUser(req)));
});

leadsRouter.delete('/:id', requirePermission('leads:delete'), async (req, res) => {
  await leadsService.remove(String(req.params.id));
  res.status(204).end();
});

leadsRouter.post(
  '/:id/activities',
  canWrite,
  validateBody(createActivitySchema),
  async (req, res) => {
    res
      .status(201)
      .json(await leadsService.addActivity(String(req.params.id), req.body, currentUser(req)));
  },
);

leadsRouter.post(
  '/:id/meetings',
  canWrite,
  validateBody(scheduleMeetingSchema),
  async (req, res) => {
    res
      .status(201)
      .json(await leadsService.scheduleMeeting(String(req.params.id), req.body, currentUser(req)));
  },
);
