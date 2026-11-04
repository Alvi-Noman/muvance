import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiClientError, errorMessage } from './api-client';

export const meKey = ['auth', 'me'] as const;

/** A 401 anywhere means the session ended: clear the cached user so the app shows sign-in. */
function handleAuthError(error: unknown) {
  if (error instanceof ApiClientError && error.status === 401) {
    queryClient.setQueryData(meKey, null);
    return true;
  }
  return false;
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleAuthError }),
  mutationCache: new MutationCache({
    // Mutations without their own onError get a toast, so failures are never silent.
    onError: (error, _vars, _result, mutation) => {
      if (handleAuthError(error) || mutation.options.onError) return;
      toast.error(errorMessage(error));
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (count, error) =>
        !(error instanceof ApiClientError && error.status < 500) && count < 2,
    },
  },
});
