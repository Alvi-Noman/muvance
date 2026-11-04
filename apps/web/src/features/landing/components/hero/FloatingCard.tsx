import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type FloatingCardProps = {
  children: ReactNode;
  /** Position and rotation classes. Rotation lives on the wrapper so it doesn't fight the float animation. */
  className?: string;
  /** Offsets the float cycle so multiple cards don't bob in sync. */
  floatDelay?: string;
};

export function FloatingCard({ children, className, floatDelay = '0s' }: FloatingCardProps) {
  return (
    <div className={cn('animate-fade-up [animation-delay:600ms]', className)}>
      <div
        className="w-56 rounded-[28px] border border-white/80 bg-white/70 p-5 text-left shadow-[0_24px_60px_-24px_rgba(0,0,0,0.25)] backdrop-blur-md motion-safe:animate-float"
        style={{ animationDelay: floatDelay }}
      >
        {children}
      </div>
    </div>
  );
}
