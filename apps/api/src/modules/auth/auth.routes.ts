import { Router } from 'express';
import {
  acceptInviteSchema,
  changePasswordSchema,
  loginSchema,
  updateProfileSchema,
} from '@muvance/shared';
import { currentUser, requireAuth } from '@/middlewares/auth';
import { loginLimiter } from '@/middlewares/rate-limit';
import { validateBody } from '@/middlewares/validate';
import { toMeDto } from '@/modules/team/team.mappers';
import { authService } from './auth.service';
import { SESSION_COOKIE, sessionsService } from './sessions.service';

export const authRouter = Router();

authRouter.post('/login', loginLimiter, validateBody(loginSchema), async (req, res) => {
  const user = await authService.login(req.body, req, res);
  res.json(toMeDto(user));
});

authRouter.post('/logout', async (req, res) => {
  await sessionsService.destroy(req.cookies?.[SESSION_COOKIE], res);
  res.status(204).end();
});

authRouter.get('/me', requireAuth, (req, res) => {
  res.json(toMeDto(currentUser(req)));
});

authRouter.patch('/me', requireAuth, validateBody(updateProfileSchema), async (req, res) => {
  const user = await authService.updateProfile(currentUser(req), req.body);
  res.json(toMeDto(user));
});

authRouter.post(
  '/change-password',
  requireAuth,
  validateBody(changePasswordSchema),
  async (req, res) => {
    await authService.changePassword(currentUser(req), req.body, req.cookies?.[SESSION_COOKIE]);
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
    res.json(toMeDto(user));
  },
);
