import { motion } from 'motion/react';
import { cn } from '@/lib/cn';

const EASE = [0.65, 0, 0.35, 1] as const;

/**
 * A hand-drawn arrow from the hero text to the Book a call button. It draws itself once
 * the hero has faded in (instantly for people who prefer reduced motion).
 * Two shapes: a gentle curve on larger screens, a looped one on phones.
 */
export function HeroArrow({ className }: { className?: string }) {
  return (
    <>
      {/* Larger screens: curves in from the left, ending at the button's side. */}
      <Doodle
        viewBox="0 0 120 80"
        line="M8 10 C 20 50, 60 70, 104 60"
        head="M104 60 l-13 -4 M104 60 l-10 9.5"
        className={cn(
          'absolute top-[-32px] right-full mr-1 hidden h-20 w-[120px] sm:block',
          className,
        )}
      />
      {/* Phones: a curlier arrow with a loop, coming in from the left to the button's side. */}
      <Doodle
        viewBox="0 0 80 90"
        line="M14 4 C 4 26, 8 46, 26 50 C 40 53, 42 38, 32 36 C 20 34, 18 58, 34 66 C 46 72, 60 71, 74 68"
        head="M74 68 l-11 -3.5 M74 68 l-8.8 8"
        className={cn(
          'absolute top-[-40px] right-full mr-0.5 h-[90px] w-20 origin-right max-[360px]:scale-[0.8] sm:hidden',
          className,
        )}
      />
    </>
  );
}

function Doodle({
  viewBox,
  line,
  head,
  className,
}: {
  viewBox: string;
  line: string;
  head: string;
  className: string;
}) {
  return (
    <svg
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('pointer-events-none overflow-visible text-neutral-400', className)}
      aria-hidden
    >
      <motion.path
        d={line}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.9, duration: 0.7, ease: EASE }}
      />
      <motion.path
        d={head}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: 1.55, duration: 0.25, ease: 'easeOut' }}
      />
    </svg>
  );
}
