import { Router } from 'express';
import { requireAuth } from '@/middlewares/auth';
import { authRouter } from '@/modules/auth/auth.routes';
import { availabilityRouter, bookingsRouter } from '@/modules/bookings/bookings.routes';
import { dashboardRouter } from '@/modules/dashboard/dashboard.routes';
import { devicesRouter } from '@/modules/devices/devices.routes';
import { healthRouter } from '@/modules/health/health.routes';
import { leadsRouter } from '@/modules/leads/leads.routes';
import { metaRouter } from '@/modules/meta/meta.routes';
import { recordingsRouter, recordingUploadRouter } from '@/modules/recordings/recordings.routes';
import { unfinishedRouter, unfinishedUploadRouter } from '@/modules/unfinished/unfinished.routes';
import { meetingsRouter } from '@/modules/meetings/meetings.routes';
import { settingsRouter } from '@/modules/settings/settings.routes';
import { teamRouter } from '@/modules/team/team.routes';

export const apiRouter = Router();

// Public
apiRouter.use('/health', healthRouter);
apiRouter.use('/availability', availabilityRouter);
apiRouter.use('/bookings', bookingsRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/meta', metaRouter);
apiRouter.use('/visits', recordingUploadRouter);
apiRouter.use('/booking-drafts', unfinishedUploadRouter);

// Admin (signed-in users; each route also checks role permissions)
apiRouter.use('/dashboard', requireAuth, dashboardRouter);
apiRouter.use('/devices', requireAuth, devicesRouter);
apiRouter.use('/leads', requireAuth, leadsRouter);
apiRouter.use('/meetings', requireAuth, meetingsRouter);
apiRouter.use('/recordings', requireAuth, recordingsRouter);
apiRouter.use('/unfinished-bookings', requireAuth, unfinishedRouter);
apiRouter.use('/team', requireAuth, teamRouter);
apiRouter.use('/settings', requireAuth, settingsRouter);
