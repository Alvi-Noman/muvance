import { siteConfig } from '@/config/site';
import { cn } from '@/lib/cn';

/** The Muvance mark: three rising bars. Takes its colour from the text colour. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 552 270"
      className={cn('h-auto shrink-0', className)}
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="8"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M72 105H184L120 262H8Z" />
      <path d="M232 105H344L280 262H168Z" />
      <path d="M433 8H544L440 262H329Z" />
    </svg>
  );
}

/** The mark beside the name, as used in the header and footer. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5 text-neutral-950', className)}>
      <LogoMark className="w-8" />
      <span className="font-logo text-xl font-semibold tracking-[-0.03em]">{siteConfig.name}</span>
    </span>
  );
}
