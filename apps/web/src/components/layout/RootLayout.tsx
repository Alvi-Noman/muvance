import { Outlet, ScrollRestoration } from 'react-router';
import { MetaPageViews } from './MetaPageViews';
import { SessionRecording } from './SessionRecording';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

/** `minimal` is for ad landing pages: no menu links, so visitors stay on the page. */
export function RootLayout({ minimal = false }: { minimal?: boolean }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader minimal={minimal} />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter minimal={minimal} />
      <MetaPageViews />
      <SessionRecording />
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
