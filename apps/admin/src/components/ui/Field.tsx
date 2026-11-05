import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

export const controlStyles =
  'w-full rounded-xl border border-hud/20 bg-void/60 px-3.5 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-hud focus:shadow-[0_0_0_3px_rgb(92_225_255/0.12),0_0_18px_rgb(92_225_255/0.2)] disabled:bg-neutral-50 disabled:text-neutral-500 aria-[invalid=true]:border-red-600';

type FieldProps = {
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  children: (props: {
    id: string;
    'aria-invalid': boolean;
    'aria-describedby'?: string;
  }) => ReactNode;
  className?: string;
};

/** Label + control + error/hint, with ids and aria wired up. */
export function Field({ label, hint, error, children, className }: FieldProps) {
  const id = useId();
  const messageId = `${id}-message`;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-neutral-800">
        {label}
      </label>
      {children({
        id,
        'aria-invalid': !!error,
        'aria-describedby': error || hint ? messageId : undefined,
      })}
      {(error || hint) && (
        <p
          id={messageId}
          className={cn('mt-1.5 text-xs', error ? 'text-red-600' : 'text-neutral-500')}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(controlStyles, 'h-10', className)} {...props} />;
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea ref={ref} className={cn(controlStyles, 'resize-none py-2.5', className)} {...props} />
  );
});

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={cn('relative', className)}>
      <select className={cn(controlStyles, 'h-10 cursor-pointer appearance-none pr-9')} {...props}>
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-neutral-400"
        aria-hidden
      />
    </div>
  );
}
