import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/cn';

type RiskNoteProps = {
  /** Use "dark" on dark sections so the text stays readable. */
  tone?: 'light' | 'dark';
  className?: string;
};

/** The risk-reversal line shown under "Book a call" buttons. */
export function RiskNote({ tone = 'light', className }: RiskNoteProps) {
  return (
    <p
      className={cn(
        'flex items-center gap-1.5 text-xs sm:text-sm',
        tone === 'light' ? 'text-neutral-500' : 'text-neutral-400',
        className,
      )}
    >
      <ShieldCheck
        className={cn(
          'size-4 shrink-0',
          tone === 'light' ? 'text-emerald-600' : 'text-emerald-400',
        )}
        aria-hidden
      />
      <span>
        <strong
          className={cn('font-semibold', tone === 'light' ? 'text-neutral-900' : 'text-white')}
        >
          0% risk.
        </strong>{' '}
        Hit your sales target first. Then we get paid.
      </span>
    </p>
  );
}
