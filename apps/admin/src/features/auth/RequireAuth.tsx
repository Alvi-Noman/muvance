import type { ReactNode } from 'react';
import type { Permission } from '@muvance/shared';
import { Navigate, useLocation } from 'react-router';
import { Button } from '@/components/ui/Button';
import { EmptyState, PageLoader } from '@/components/ui/misc';
import { accountsUrl } from '@/lib/accounts';
import { useLogout, useMe } from './auth';
import { SetPasswordPage } from './SetPasswordPage';

/** Sends signed-out visitors to /login (and back here afterwards). */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { data: me, isPending, isError } = useMe();
  const location = useLocation();

  if (isPending) return <PageLoader />;
  if (isError) {
    return (
      <EmptyState
        className="min-h-dvh justify-center"
        title="Can't reach the server"
        description="Check your connection and refresh the page."
      />
    );
  }
  if (!me) {
    const next = location.pathname + location.search;
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
  }
  if (me.mustChangePassword) return <SetPasswordPage />;
  if (!me.apps.admin) return <NoAdminAccess name={me.name} />;
  return children;
}

/** Signed in, but this Muvance account doesn't include the Admin CRM. */
function NoAdminAccess({ name }: { name: string }) {
  const logout = useLogout();
  return (
    <EmptyState
      className="min-h-dvh justify-center"
      title={`Hi ${name.split(' ')[0]}, the Admin CRM isn't part of your account`}
      description="Your Muvance account works for your other apps. Ask an owner or admin if you need the Admin CRM."
      action={
        <div className="flex flex-wrap justify-center gap-2">
          <a href={accountsUrl()}>
            <Button>Your Muvance account</Button>
          </a>
          <Button variant="secondary" onClick={() => logout.mutate()}>
            Sign in as someone else
          </Button>
        </div>
      }
    />
  );
}

/** Renders children only when the signed-in user has `permission`. */
export function Can({
  permission,
  children,
  fallback = null,
}: {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { data: me } = useMe();
  return me?.permissions.includes(permission) ? children : fallback;
}

/** Route guard for whole pages that need a permission. */
export function RequirePermission({
  permission,
  children,
}: {
  permission: Permission;
  children: ReactNode;
}) {
  return (
    <Can
      permission={permission}
      fallback={
        <EmptyState
          title="You don't have access to this page"
          description="Ask an owner or admin if you need it."
        />
      }
    >
      {children}
    </Can>
  );
}
