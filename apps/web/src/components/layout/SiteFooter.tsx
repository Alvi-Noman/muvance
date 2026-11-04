import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router';
import { Container } from '@/components/ui/Container';
import { siteConfig } from '@/config/site';
import { SectionLink } from './SectionLink';

export function SiteFooter() {
  return (
    <footer className="overflow-hidden pt-24">
      <Container>
        <div className="grid gap-12 border-b border-black/10 pb-16 md:grid-cols-[2fr_1fr_1fr]">
          <div>
            <p className="text-xl font-semibold tracking-tight">{siteConfig.name}</p>
            <p className="mt-3 max-w-xs text-sm text-neutral-500">{siteConfig.tagline}</p>
          </div>

          <FooterColumn title="Explore">
            {siteConfig.nav.map((item) => (
              <FooterLink key={item.href} href={item.href}>
                {item.label}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Contact">
            <FooterLink href={siteConfig.bookingHref}>Book a call</FooterLink>
          </FooterColumn>
        </div>

        <div className="flex flex-col gap-2 py-8 text-sm text-neutral-500 sm:flex-row sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <p>Meta ads, done properly.</p>
        </div>
      </Container>

      {/* Oversized wordmark, cropped at the bottom edge */}
      <p
        aria-hidden
        className="-mb-[0.22em] text-center font-serif text-[24vw] leading-none tracking-[-0.04em] text-neutral-950/[0.06] select-none"
      >
        {siteConfig.name}
      </p>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-xs tracking-[0.14em] text-neutral-400 uppercase">{title}</p>
      <ul className="mt-4 space-y-3 text-sm">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  external,
  children,
}: {
  href: string;
  external?: boolean;
  children: ReactNode;
}) {
  const className =
    'inline-flex items-center gap-1 text-neutral-700 transition hover:text-neutral-950';
  // Home sections scroll smoothly, in-app pages (e.g. /book) use the router, the rest stay <a>.
  const isPage = href.startsWith('/') && !href.includes('#');
  const isSection = href.startsWith('/#');

  return (
    <li>
      {isSection ? (
        <SectionLink href={href} className={className}>
          {children}
        </SectionLink>
      ) : isPage ? (
        <Link to={href} className={className}>
          {children}
        </Link>
      ) : (
        <a
          href={href}
          {...(external && { target: '_blank', rel: 'noreferrer' })}
          className={className}
        >
          {children}
          {external && <ArrowUpRight className="size-3.5" aria-hidden />}
        </a>
      )}
    </li>
  );
}
