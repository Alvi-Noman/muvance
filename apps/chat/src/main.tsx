import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import { account, accountsUrl } from '@/lib/account';
import { ApiClientError, errorMessage, setSignedOutHandler } from '@/lib/api';
import { keys, useBootstrap } from '@/lib/data';
import { ChatApp } from '@/pages/ChatApp';
import { JoinPage } from '@/pages/JoinPage';
import { LoginPage } from '@/pages/LoginPage';
import { Button, Spinner, ToastProvider } from '@/components/ui';
import '@/styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (count, error) =>
        !(error instanceof ApiClientError && [401, 403, 404].includes(error.status)) && count < 2,
      refetchOnWindowFocus: false,
    },
  },
});

/** The chat when signed in, the sign-in page otherwise. */
function Root() {
  const qc = useQueryClient();
  const { data, error, isLoading, refetch } = useBootstrap();

  useEffect(() => {
    setSignedOutHandler(() => {
      // Only when a sign-in ends: a visitor who isn't signed in already sees the sign-in page
      // (resetting then would ask again, get another 401, and never stop).
      if (!qc.getQueryData(keys.bootstrap)) return;
      qc.clear();
      void qc.resetQueries({ queryKey: keys.bootstrap });
    });
  }, [qc]);

  if (error instanceof ApiClientError && error.status === 401) return <LoginPage />;
  if (error instanceof ApiClientError && error.status === 403) {
    return <NoChatAccess message={error.message} />;
  }
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="size-6 text-muted" />
      </div>
    );
  }
  if (!data) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="font-medium">Muvance Chat couldn't load</p>
        <p className="text-sm text-muted">{errorMessage(error)}</p>
        <Button variant="secondary" onClick={() => void refetch()}>
          Try again
        </Button>
      </div>
    );
  }
  // The sign-in email's link, opened while already signed in.
  if (window.location.pathname === '/signin') return <Navigate to="/" replace />;
  return <ChatApp />;
}

/** A Muvance account without Chat (or still on a starting password). */
function NoChatAccess({ message }: { message: string }) {
  const qc = useQueryClient();
  const choosePassword = /password/i.test(message);
  useEffect(() => {
    if (choosePassword) window.location.assign(accountsUrl());
  }, [choosePassword]);
  if (choosePassword) return null;
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-lg font-semibold">Chat isn't part of your Muvance account</p>
      <p className="max-w-sm text-sm text-muted">{message}</p>
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
              .then(() => qc.resetQueries({ queryKey: keys.bootstrap }))
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
  { path: '/c/:spaceId', element: <Root /> },
  { path: '/saved', element: <Root /> },
  { path: '/join/:token', element: <JoinPage /> },
  { path: '/signin', element: <Root /> },
  { path: '*', element: <Navigate to="/" replace /> },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </QueryClientProvider>
  </StrictMode>,
);
