import { Router } from 'express';
import {
  createMailAccountSchema,
  mailAvatarSchema,
  setMailPasswordSchema,
  updateMailAccountSchema,
} from '@muvance/shared';
import { currentUser, requirePermission } from '@/middlewares/auth';
import { validateBody } from '@/middlewares/validate';
import { toObjectId } from '@/lib/object-id';
import { mailService, toMailAccountDto } from './mail.service';
import { sendAvatar } from './send-avatar';

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

mailAccountsRouter.get('/:id/avatar', async (req, res) => {
  sendAvatar(
    res,
    await mailService.avatar({ _id: toObjectId(String(req.params.id), 'Email account') }),
  );
});

mailAccountsRouter.put('/:id/avatar', validateBody(mailAvatarSchema), async (req, res) => {
  const id = toObjectId(String(req.params.id), 'Email account');
  await mailService.setAvatar({ _id: id }, req.body.image as string);
  res.json(toMailAccountDto(await mailService.get(id)));
});

mailAccountsRouter.delete('/:id/avatar', async (req, res) => {
  const id = toObjectId(String(req.params.id), 'Email account');
  await mailService.setAvatar({ _id: id }, null);
  res.json(toMailAccountDto(await mailService.get(id)));
});
