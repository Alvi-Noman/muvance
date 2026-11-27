import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import { account, accountsUrl } from '@/lib/account';
import { setSignedOutHandler } from '@/lib/api';
import { useMe } from '@/lib/queries';
import { MailApp } from '@/pages/MailApp';
import { LoginPage } from '@/pages/LoginPage';
import { Button, Spinner } from '@/components/ui';
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
  if (me === 'choose-password') {
    window.location.assign(accountsUrl());
    return null;
  }
  if (me === 'no-mail') return <NoMailbox />;
  return <MailApp me={me} />;
}

/** Signed in with a Muvance account that has no mailbox. */
function NoMailbox() {
  const qc = useQueryClient();
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-lg font-semibold">Your Muvance account doesn't have a mailbox</p>
      <p className="max-w-sm text-sm text-muted">
        Ask a Muvance admin to switch Mail on for you. Your other apps work as usual.
      </p>
      <div className="mt-2 flex gap-2">
        <a href={accountsUrl()}>
          <Button>Your Muvance account</Button>
        </a>
        <Button
          variant="secondary"
          onClick={() =>
            void account
              .logout()
              .catch(() => {})
              .then(() => qc.setQueryData(['me'], null))
          }
        >
          Sign in as someone else
        </Button>
      </div>
    </div>
  );
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
