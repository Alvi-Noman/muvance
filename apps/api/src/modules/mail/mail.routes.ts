import express, { Router } from 'express';
import {
  createMailAccountSchema,
  mailPasswordSchema,
  setMailPasswordSchema,
  updateMailAccountSchema,
} from '@muvance/shared';
import { currentUser, requirePermission } from '@/middlewares/auth';
import { loginLimiter } from '@/middlewares/rate-limit';
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

/**
 * Public: webmail's "change password" (Roundcube's password plugin, httpapi driver). It posts a
 * form with user, curpass and newpass and expects the body "ok". Rate-limited like sign-in.
 */
export const mailPasswordRouter = Router();

mailPasswordRouter.post(
  '/',
  loginLimiter,
  express.urlencoded({ extended: false, limit: '4kb' }),
  async (req, res) => {
    const { user, curpass, newpass } = req.body as Record<string, unknown>;
    if (typeof user !== 'string' || typeof curpass !== 'string' || typeof newpass !== 'string') {
      res.status(400).type('text/plain').send('missing fields');
      return;
    }
    const valid = mailPasswordSchema.safeParse(newpass);
    if (!valid.success) {
      res.status(400).type('text/plain').send('weak password');
      return;
    }
    const changed = await mailService.changeOwnPassword(user, curpass, newpass);
    // A wrong current password must fail the change (Roundcube then shows an error).
    res
      .status(changed ? 200 : 403)
      .type('text/plain')
      .send(changed ? 'ok' : 'wrong password');
  },
);
