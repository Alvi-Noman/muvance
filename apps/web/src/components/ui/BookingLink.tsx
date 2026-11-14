import type { MouseEvent, ReactNode } from 'react';
import { Link } from 'react-router';
import { siteConfig } from '@/config/site';
import { useBookingTarget } from '@/lib/booking-target';

type BookingLinkProps = {
  className?: string;
  onClick?: () => void;
  children: ReactNode;
};

/**
 * A "Book a call" link. Opens /book, unless the page has its own booking section
 * (see BookingTargetContext), in which case it scrolls smoothly down to it.
 */
export function BookingLink({ className, onClick, children }: BookingLinkProps) {
  const target = useBookingTarget();

  if (!target) {
    return (
      <Link to={siteConfig.bookingHref} onClick={onClick} className={className}>
        {children}
      </Link>
    );
  }

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.();
    const section = document.getElementById(target);
    if (!section) return;
    event.preventDefault();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    section.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    window.history.replaceState(window.history.state, '', `#${target}`);
  };

  return (
    <a href={`#${target}`} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
