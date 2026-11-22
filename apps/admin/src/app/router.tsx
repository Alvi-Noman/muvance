import { createBrowserRouter } from 'react-router';
import { AppShell } from '@/components/layout/AppShell';
import { EmptyState } from '@/components/ui/misc';
import { RequireAuth, RequirePermission } from '@/features/auth/RequireAuth';

// Pages are lazy-loaded so each one ships as its own chunk.
export const router = createBrowserRouter([
  {
    path: '/login',
    lazy: () => import('@/features/auth/LoginPage').then((m) => ({ Component: m.LoginPage })),
  },
  {
    path: '/accept-invite',
    lazy: () =>
      import('@/features/auth/AcceptInvitePage').then((m) => ({ Component: m.AcceptInvitePage })),
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        lazy: () =>
          import('@/features/dashboard/DashboardPage').then((m) => ({
            Component: m.DashboardPage,
          })),
      },
      {
        path: 'leads',
        lazy: () => import('@/features/leads/LeadsPage').then((m) => ({ Component: m.LeadsPage })),
      },
      {
        path: 'leads/:id',
        lazy: () =>
          import('@/features/leads/LeadDetailPage').then((m) => ({ Component: m.LeadDetailPage })),
      },
      {
        path: 'pipeline',
        lazy: () =>
          import('@/features/leads/PipelinePage').then((m) => ({ Component: m.PipelinePage })),
      },
      {
        path: 'meetings',
        lazy: () =>
          import('@/features/meetings/MeetingsPage').then((m) => ({ Component: m.MeetingsPage })),
      },
      {
        path: 'unfinished',
        lazy: () =>
          import('@/features/unfinished/UnfinishedBookingsPage').then((m) => ({
            Component: m.UnfinishedBookingsPage,
          })),
      },
      {
        path: 'applications',
        lazy: () =>
          import('@/features/applications/ApplicationsPage').then((m) => ({
            Component: m.ApplicationsPage,
          })),
      },
      {
        path: 'recordings',
        lazy: () =>
          import('@/features/recordings/RecordingsPage').then((m) => ({
            Component: m.RecordingsPage,
          })),
      },
      {
        path: 'recordings/:id',
        lazy: () =>
          import('@/features/recordings/RecordingPage').then((m) => ({
            Component: m.RecordingPage,
          })),
      },
      {
        path: 'call-recordings',
        lazy: () =>
          import('@/features/call-recordings/CallRecordingsPage').then((m) => ({
            Component: m.CallRecordingsPage,
          })),
      },
      {
        path: 'invoice',
        lazy: () =>
          import('@/features/documents/InvoicePage').then((m) => ({
            Component: () => (
              <RequirePermission permission="settings:manage">
                <m.InvoicePage />
              </RequirePermission>
            ),
          })),
      },
      {
        path: 'offer-letter',
        lazy: () =>
          import('@/features/documents/OfferLetterPage').then((m) => ({
            Component: () => (
              <RequirePermission permission="settings:manage">
                <m.OfferLetterPage />
              </RequirePermission>
            ),
          })),
      },
      {
        path: 'email',
        lazy: () =>
          import('@/features/email/EmailAccountsPage').then((m) => ({
            Component: () => (
              <RequirePermission permission="team:manage">
                <m.EmailAccountsPage />
              </RequirePermission>
            ),
          })),
      },
      {
        path: 'team',
        lazy: () =>
          import('@/features/team/TeamPage').then((m) => ({
            Component: () => (
              <RequirePermission permission="team:manage">
                <m.TeamPage />
              </RequirePermission>
            ),
          })),
      },
      {
        path: 'settings',
        lazy: () =>
          import('@/features/settings/SettingsPage').then((m) => ({ Component: m.SettingsPage })),
      },
      {
        path: '*',
        element: (
          <EmptyState title="Page not found" description="Check the address and try again." />
        ),
      },
    ],
  },
]);
