import { Router } from 'express';
import { requireApp, requireAuth } from '@/middlewares/auth';
import {
  applicationsRouter,
  applicationUploadRouter,
} from '@/modules/applications/applications.routes';
import { authRouter } from '@/modules/auth/auth.routes';
import { availabilityRouter, bookingsRouter } from '@/modules/bookings/bookings.routes';
import { dashboardRouter } from '@/modules/dashboard/dashboard.routes';
import { devicesRouter } from '@/modules/devices/devices.routes';
import { healthRouter } from '@/modules/health/health.routes';
import { leadsRouter } from '@/modules/leads/leads.routes';
import { metaRouter } from '@/modules/meta/meta.routes';
import { recordingsRouter, recordingUploadRouter } from '@/modules/recordings/recordings.routes';
import { unfinishedRouter, unfinishedUploadRouter } from '@/modules/unfinished/unfinished.routes';
import { mailAccountsRouter, mailAddressesRouter } from '@/modules/mail/mail.routes';
import { webmailRouter } from '@/modules/webmail/webmail.routes';
import { chatRouter } from '@/modules/chat/chat.routes';
import { callRecordingsRouter } from '@/modules/meet/call-recordings.routes';
import { meetRouter } from '@/modules/meet/meet.routes';
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
apiRouter.use('/applications', applicationUploadRouter);
// Video meetings: public for guests with the link; each route checks sign-in where needed.
apiRouter.use('/meet', meetRouter);
// Muvance Mail (mail.muvance.com): Muvance accounts with Mail.
apiRouter.use('/webmail', webmailRouter);
// Muvance Chat (chat.muvance.com): Muvance accounts with Chat, and invited clients.
apiRouter.use('/chat', chatRouter);

// Admin CRM: Muvance accounts with the Admin CRM; each route also checks role permissions.
const admin = [requireAuth, requireApp('admin')];
apiRouter.use('/dashboard', admin, dashboardRouter);
apiRouter.use('/devices', admin, devicesRouter);
apiRouter.use('/leads', admin, leadsRouter);
apiRouter.use('/meetings', admin, meetingsRouter);
apiRouter.use('/call-recordings', admin, callRecordingsRouter);
apiRouter.use('/mail-accounts', admin, mailAccountsRouter);
apiRouter.use('/mail-addresses', admin, mailAddressesRouter);
apiRouter.use('/recordings', admin, recordingsRouter);
apiRouter.use('/unfinished-bookings', admin, unfinishedRouter);
apiRouter.use('/admin/applications', admin, applicationsRouter);
apiRouter.use('/team', admin, teamRouter);
apiRouter.use('/settings', admin, settingsRouter);
