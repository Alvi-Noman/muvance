import { Sparkle } from 'lucide-react';
import { cn } from '@/lib/cn';

const RADIUS = 38;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function RotatingBadge({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn('relative size-28', className)} aria-hidden>
      <svg viewBox="0 0 100 100" className="size-full motion-safe:animate-spin-slow">
        <defs>
          <path
            id="badge-circle"
            d={`M50,50 m-${RADIUS},0 a${RADIUS},${RADIUS} 0 1,1 ${RADIUS * 2},0 a${RADIUS},${RADIUS} 0 1,1 -${RADIUS * 2},0`}
          />
        </defs>
        <text className="fill-neutral-700 text-[8px] font-medium uppercase">
          <textPath href="#badge-circle" textLength={CIRCUMFERENCE - 4} lengthAdjust="spacing">
            {text}
          </textPath>
        </text>
      </svg>
      <Sparkle className="absolute inset-0 m-auto size-6 fill-neutral-900 text-neutral-900" />
    </div>
  );
}
