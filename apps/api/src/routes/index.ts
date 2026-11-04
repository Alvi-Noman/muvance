import { Router } from 'express';
import { requireAuth } from '@/middlewares/auth';
import { authRouter } from '@/modules/auth/auth.routes';
import { availabilityRouter, bookingsRouter } from '@/modules/bookings/bookings.routes';
import { dashboardRouter } from '@/modules/dashboard/dashboard.routes';
import { healthRouter } from '@/modules/health/health.routes';
import { leadsRouter } from '@/modules/leads/leads.routes';
import { meetingsRouter } from '@/modules/meetings/meetings.routes';
import { settingsRouter } from '@/modules/settings/settings.routes';
import { teamRouter } from '@/modules/team/team.routes';

export const apiRouter = Router();

// Public
apiRouter.use('/health', healthRouter);
apiRouter.use('/availability', availabilityRouter);
apiRouter.use('/bookings', bookingsRouter);
apiRouter.use('/auth', authRouter);

// Admin (signed-in users; each route also checks role permissions)
apiRouter.use('/dashboard', requireAuth, dashboardRouter);
apiRouter.use('/leads', requireAuth, leadsRouter);
apiRouter.use('/meetings', requireAuth, meetingsRouter);
apiRouter.use('/team', requireAuth, teamRouter);
apiRouter.use('/settings', requireAuth, settingsRouter);
