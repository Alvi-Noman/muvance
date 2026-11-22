import { Router } from 'express';
import {
  createMailAccountSchema,
  setMailPasswordSchema,
  updateMailAccountSchema,
} from '@muvance/shared';
import { currentUser, requirePermission } from '@/middlewares/auth';
import { validateBody } from '@/middlewares/validate';
import { toObjectId } from '@/lib/object-id';
import { mailService, toMailAccountDto } from './mail.service';

/** Admin: team email accounts. Mounted behind `requireAuth`; owners and admins only. */
export const mailAccountsRouter = Router();
mailAccountsRouter.use(requirePermission('team:manage'));

mailAccountsRouter.get('/', async (_req, res) => {
  res.json(await mailService.list());
});

mailAccountsRouter.post('/', validateBody(createMailAccountSchema), async (req, res) => {
  const doc = await mailService.create(req.body, currentUser(req));
  res.status(201).json(toMailAccountDto(doc));
});

mailAccountsRouter.patch('/:id', validateBody(updateMailAccountSchema), async (req, res) => {
  const doc = await mailService.update(
    toObjectId(String(req.params.id), 'Email account'),
    req.body,
  );
  res.json(toMailAccountDto(doc));
});

mailAccountsRouter.post('/:id/password', validateBody(setMailPasswordSchema), async (req, res) => {
  await mailService.setPassword(
    toObjectId(String(req.params.id), 'Email account'),
    req.body.password as string,
  );
  res.status(204).end();
});

mailAccountsRouter.delete('/:id', async (req, res) => {
  await mailService.remove(toObjectId(String(req.params.id), 'Email account'));
  res.status(204).end();
});
