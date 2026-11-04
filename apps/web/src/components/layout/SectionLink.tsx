import type { MouseEvent, ReactNode } from 'react';
import { Link, useLocation } from 'react-router';

type SectionLinkProps = {
  /** A home page section, e.g. "/#promise". */
  href: string;
  className?: string;
  onClick?: () => void;
  children: ReactNode;
};

/**
 * Links to a section of the home page. On the home page it scrolls there smoothly;
 * from any other page it navigates home and the router jumps to the section.
 */
export function SectionLink({ href, className, onClick, children }: SectionLinkProps) {
  const { pathname } = useLocation();
  const [path = '/', id = ''] = href.split('#');

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.();
    const target = document.getElementById(id);
    if (pathname !== path || !target) return; // let the router navigate
    event.preventDefault();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    window.history.pushState(window.history.state, '', `#${id}`);
  };

  return (
    <Link to={href} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}
