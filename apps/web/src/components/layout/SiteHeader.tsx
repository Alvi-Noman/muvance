import { useEffect, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { Link } from 'react-router';
import { siteConfig } from '@/config/site';
import { SectionLink } from './SectionLink';
import { cn } from '@/lib/cn';

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    // Anchor jumps (e.g. "Book a call") don't always emit a scroll event, so re-check on hash change.
    window.addEventListener('hashchange', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('hashchange', onScroll);
    };
  }, []);

  // Close the mobile menu on Escape or when the viewport grows past the mobile breakpoint.
  useEffect(() => {
    if (!menuOpen) return;
    const desktop = window.matchMedia('(min-width: 768px)');
    const close = () => setMenuOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    desktop.addEventListener('change', close);
    return () => {
      window.removeEventListener('keydown', onKey);
      desktop.removeEventListener('change', close);
    };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        'sticky top-0 z-30 transition-colors duration-300',
        scrolled && 'border-b border-black/5 bg-canvas/90 backdrop-blur-xl',
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-8">
        <Link to="/" className="text-xl font-semibold tracking-tight">
          {siteConfig.name}
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1 rounded-full border border-black/5 bg-white/60 p-1 shadow-sm backdrop-blur">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <SectionLink
                  href={item.href}
                  className="block rounded-full px-4 py-1.5 text-sm text-neutral-700 transition hover:bg-white hover:text-neutral-950 hover:shadow-sm"
                >
                  {item.label}
                </SectionLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to={siteConfig.bookingHref}
            className="hidden items-center gap-1.5 rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 sm:inline-flex"
          >
            Book a call
            <ArrowUpRight className="size-4" aria-hidden />
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="grid size-10 place-items-center rounded-full border border-black/10 bg-white/70 backdrop-blur transition hover:bg-white md:hidden"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={cn(
          'absolute inset-x-4 top-full origin-top rounded-3xl border border-black/5 bg-white/90 p-2 shadow-xl shadow-black/10 backdrop-blur-xl transition duration-200 md:hidden',
          menuOpen ? 'scale-100 opacity-100' : 'pointer-events-none invisible scale-95 opacity-0',
        )}
      >
        <nav aria-label="Mobile">
          <ul>
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <SectionLink
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-2xl px-4 py-3 text-base text-neutral-800 transition hover:bg-neutral-100"
                >
                  {item.label}
                </SectionLink>
              </li>
            ))}
          </ul>
        </nav>
        <Link
          to={siteConfig.bookingHref}
          onClick={() => setMenuOpen(false)}
          className="mt-2 flex items-center justify-center gap-1.5 rounded-2xl bg-neutral-950 px-5 py-3.5 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          Book a call
          <ArrowUpRight className="size-4" aria-hidden />
        </Link>
      </div>
    </header>
  );
}
