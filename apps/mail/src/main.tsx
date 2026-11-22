import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import { setSignedOutHandler } from '@/lib/api';
import { useMe } from '@/lib/queries';
import { MailApp } from '@/pages/MailApp';
import { ChoosePasswordPage } from '@/pages/ChoosePasswordPage';
import { LoginPage } from '@/pages/LoginPage';
import { Spinner } from '@/components/ui';
import '@/styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: true } },
});

/** Shows the mailbox when signed in, the login page otherwise. */
function Root() {
  const qc = useQueryClient();
  const { data: me, isLoading } = useMe();

  useEffect(() => {
    setSignedOutHandler(() => qc.setQueryData(['me'], null));
  }, [qc]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="size-6 text-muted" />
      </div>
    );
  }
  if (!me) return <LoginPage />;
  if (me.mustChangePassword) return <ChoosePasswordPage me={me} />;
  return <MailApp me={me} />;
}

const router = createBrowserRouter([
  { path: '/', element: <Root /> },
  { path: '*', element: <Navigate to="/" replace /> },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
