import { Router } from 'express';
import { inviteUserSchema, updateUserSchema } from '@muvance/shared';
import { currentUser, requirePermission } from '@/middlewares/auth';
import { validateBody } from '@/middlewares/validate';
import { teamService } from './team.service';

/** Mounted behind `requireAuth`. */
export const teamRouter = Router();

// Anyone signed in can see who leads can be assigned to.
teamRouter.get('/assignable', async (_req, res) => {
  res.json(await teamService.assignable());
});

teamRouter.use(requirePermission('team:manage'));

teamRouter.get('/', async (_req, res) => {
  res.json(await teamService.list());
});

teamRouter.post('/invites', validateBody(inviteUserSchema), async (req, res) => {
  res.status(201).json(await teamService.invite(currentUser(req), req.body));
});

teamRouter.delete('/invites/:id', async (req, res) => {
  await teamService.revokeInvite(currentUser(req), String(req.params.id));
  res.status(204).end();
});

teamRouter.patch('/:id', validateBody(updateUserSchema), async (req, res) => {
  res.json(await teamService.update(currentUser(req), String(req.params.id), req.body));
});

teamRouter.post('/:id/reset-link', async (req, res) => {
  res.status(201).json(await teamService.resetLink(currentUser(req), String(req.params.id)));
});
