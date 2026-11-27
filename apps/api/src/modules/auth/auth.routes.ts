import { Router } from 'express';
import {
  acceptInviteSchema,
  changePasswordSchema,
  loginSchema,
  mailAvatarSchema,
  updateProfileSchema,
} from '@muvance/shared';
import { collections } from '@/db/client';
import type { UserDoc } from '@/db/types';
import { toObjectId } from '@/lib/object-id';
import { currentSession, currentUser, requireAuth, requireSession } from '@/middlewares/auth';
import { loginLimiter } from '@/middlewares/rate-limit';
import { validateBody } from '@/middlewares/validate';
import { mailService } from '@/modules/mail/mail.service';
import { sendAvatar } from '@/modules/mail/send-avatar';
import { toMeDto } from '@/modules/team/team.mappers';
import { HttpError } from '@/utils/http-error';
import { mailboxOf } from './account';
import { authService } from './auth.service';
import { SESSION_COOKIE, sessionsService } from './sessions.service';

/** Muvance accounts: one sign-in for the Admin CRM, Mail, Chat and Meet. */
export const authRouter = Router();

const meOf = async (user: UserDoc) => toMeDto(user, await mailboxOf(user));

authRouter.post('/login', loginLimiter, validateBody(loginSchema), async (req, res) => {
  const user = await authService.login(req.body, req, res);
  res.json(await meOf(user));
});

authRouter.post('/logout', async (req, res) => {
  await sessionsService.destroy(req.cookies?.[SESSION_COOKIE], res);
  res.status(204).end();
});

authRouter.get('/me', requireSession, async (req, res) => {
  res.json(await meOf(currentUser(req)));
});

authRouter.patch('/me', requireAuth, validateBody(updateProfileSchema), async (req, res) => {
  const user = await authService.updateProfile(currentUser(req), req.body);
  res.json(await meOf(user));
});

/** Your picture (shown in every app): kept on your mailbox, so mail recipients see it too. */
authRouter.put('/me/avatar', requireAuth, validateBody(mailAvatarSchema), async (req, res) => {
  const user = currentUser(req);
  if (!user.mailAccountId) {
    throw HttpError.badRequest('Pictures need a Muvance mailbox. Ask an admin for one.');
  }
  await mailService.setAvatar({ _id: user.mailAccountId }, req.body.image as string);
  res.json(await meOf(user));
});

authRouter.delete('/me/avatar', requireAuth, async (req, res) => {
  const user = currentUser(req);
  if (user.mailAccountId) await mailService.setAvatar({ _id: user.mailAccountId }, null);
  res.json(await meOf(user));
});

authRouter.get('/avatars/:id', requireSession, async (req, res) => {
  const user = await collections
    .users()
    .findOne(
      { _id: toObjectId(String(req.params.id), 'Person') },
      { projection: { mailAccountId: 1 } },
    );
  if (!user?.mailAccountId) throw HttpError.notFound('No picture');
  sendAvatar(res, await mailService.avatar({ _id: user.mailAccountId }));
});

/** Signs out on every device (every app). */
authRouter.post('/logout-everywhere', requireSession, async (req, res) => {
  await sessionsService.destroyAllForUser(currentUser(req)._id);
  await sessionsService.destroy(req.cookies?.[SESSION_COOKIE], res);
  res.status(204).end();
});

authRouter.post(
  '/change-password',
  requireSession,
  validateBody(changePasswordSchema),
  async (req, res) => {
    await authService.changePassword(
      currentUser(req),
      req.body,
      currentSession(req),
      req.cookies?.[SESSION_COOKIE],
    );
    res.status(204).end();
  },
);

/** Public: what an invite/reset link is for (shown before the person sets a password). */
authRouter.get('/invites/:token', loginLimiter, async (req, res) => {
  res.json(await authService.getInviteInfo(String(req.params.token)));
});

authRouter.post(
  '/accept-invite',
  loginLimiter,
  validateBody(acceptInviteSchema),
  async (req, res) => {
    const user = await authService.acceptInvite(req.body, req, res);
    res.json(await meOf(user));
  },
);
