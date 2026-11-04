import type { ReactNode } from 'react';
import { useInView } from '@/hooks/use-in-view';
import { cn } from '@/lib/cn';

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Delay in ms, for staggering items in a list. */
  delay?: number;
  /** Render without the scroll animation, for content that must always be visible. */
  disabled?: boolean;
};

/** Fades and lifts its children in when they scroll into view. */
export function Reveal({ disabled, ...props }: RevealProps) {
  if (disabled) return <div className={props.className}>{props.children}</div>;
  return <AnimatedReveal {...props} />;
}

function AnimatedReveal({ children, className, delay = 0 }: Omit<RevealProps, 'disabled'>) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        'transition duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
        inView
          ? 'translate-y-0 opacity-100'
          : 'translate-y-8 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100',
        className,
      )}
    >
      {children}
    </div>
  );
}
