import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { SignInPage } from '@/pages/SignInPage';
import '@/styles/globals.css';

// The call itself (LiveKit) is large, so it only loads when someone opens a meeting link.
const MeetingPage = lazy(() =>
  import('@/pages/MeetingPage').then((m) => ({ default: m.MeetingPage })),
);

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/signin', element: <SignInPage /> },
  {
    path: '/:code',
    element: (
      <Suspense fallback={null}>
        <MeetingPage />
      </Suspense>
    ),
  },
  { path: '*', element: <NotFoundPage /> },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
