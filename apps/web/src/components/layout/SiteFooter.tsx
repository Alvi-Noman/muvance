import type { ReactNode } from 'react';
import { ArrowRight, ArrowUpRight, CalendarCheck } from 'lucide-react';
import { Link } from 'react-router';
import { Logo } from '@/components/brand/Logo';
import { buttonStyles } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/cn';
import { SectionLink } from './SectionLink';
import { BookingLink } from '@/components/ui/BookingLink';

export function SiteFooter({ minimal = false }: { minimal?: boolean }) {
  return (
    <footer className="overflow-hidden pt-24">
      <Container>
        <div
          className={cn(
            'grid gap-12 border-b border-black/10 pb-16 md:grid-cols-2',
            !minimal && 'lg:grid-cols-[1.2fr_0.8fr_1.4fr]',
          )}
        >
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-neutral-500">{siteConfig.tagline}</p>
          </div>

          {!minimal && (
            <FooterColumn title="Explore">
              {siteConfig.nav.map((item) => (
                <FooterLink key={item.href} href={item.href}>
                  {item.label}
                </FooterLink>
              ))}
            </FooterColumn>
          )}

          <FooterContact />
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
        className="-mb-[0.22em] text-center font-logo text-[20vw] leading-none font-semibold tracking-[-0.05em] text-neutral-950/[0.06] select-none"
      >
        {siteConfig.name}
      </p>
    </footer>
  );
}

const CONTACT_STEPS = [
  'Pick a time that suits you',
  'We call you on your number',
  'You leave with a clear plan',
];

/**
 * Where people look for a phone number. There isn't one on purpose: every conversation
 * starts with a booked call, so this says so and points to booking instead.
 */
function FooterContact() {
  return (
    <section
      aria-labelledby="footer-contact"
      className="rounded-3xl border border-black/5 bg-neutral-50 p-6 sm:p-7 md:col-span-2 lg:col-span-1"
    >
      <h2 id="footer-contact" className="text-xs tracking-[0.14em] text-neutral-400 uppercase">
        Contact
      </h2>
      <p className="mt-4 flex items-center gap-2 text-lg font-medium text-neutral-950">
        <CalendarCheck className="size-5 shrink-0" aria-hidden />
        By appointment only
      </p>
      <p className="mt-2 max-w-md text-sm text-pretty text-neutral-500">
        We speak with business owners on booked calls only, so we can study your business first and
        give every call our full attention.
      </p>

      <ol className="mt-5 space-y-2.5 text-sm text-neutral-700">
        {CONTACT_STEPS.map((step, i) => (
          <li key={step} className="flex items-center gap-3">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white text-xs font-medium text-neutral-950 tabular-nums ring-1 ring-black/10">
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>

      <BookingLink className={cn(buttonStyles(), 'mt-6')}>
        Book a call
        <ArrowRight
          className="size-4 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </BookingLink>
    </section>
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
