import { Outlet, ScrollRestoration } from 'react-router';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

export function RootLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
      {/* Start each new page at the top (or its #section), and restore position on back/forward.
          Fresh page loads all share the key "default", so key those by URL instead. */}
      <ScrollRestoration
        getKey={(location) =>
          location.key === 'default' ? `${location.pathname}${location.hash}` : location.key
        }
      />
    </div>
  );
}
