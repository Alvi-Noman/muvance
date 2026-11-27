import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import { errorMessage } from '@/lib/api';
import { continueUrl, useMe } from '@/lib/apps';
import { HomePage } from '@/pages/HomePage';
import { ChoosePasswordPage, SetPasswordPage } from '@/pages/PasswordPages';
import { SignInPage } from '@/pages/SignInPage';
import { Spinner } from '@/ui';
import '@/styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

/** Signed out: sign in. Starting password: choose one. Otherwise: your account (or back to an app). */
function Root() {
  const { data: me, isLoading, error } = useMe();
  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner className="size-6 text-muted" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6 text-center text-sm text-muted">
        {errorMessage(error)}
      </div>
    );
  }
  if (!me) return <SignInPage />;
  if (me.mustChangePassword) return <ChoosePasswordPage me={me} />;
  const next = continueUrl();
  if (next) {
    window.location.replace(next);
    return null;
  }
  return <HomePage me={me} />;
}

const router = createBrowserRouter([
  { path: '/', element: <Root /> },
  { path: '/set-password', element: <SetPasswordPage /> },
  { path: '*', element: <Navigate to="/" replace /> },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
