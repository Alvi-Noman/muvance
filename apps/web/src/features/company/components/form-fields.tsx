import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

const inputStyles =
  'w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-3.5 text-[15px] text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950/40 focus:bg-white focus:ring-4 focus:ring-neutral-950/5 aria-[invalid=true]:border-red-400 aria-[invalid=true]:bg-red-50/50';

type FieldShellProps = {
  id: string;
  label: string;
  hint?: string;
  optional?: boolean;
  error?: string;
  className?: string;
  children: ReactNode;
};

function FieldShell({ id, label, hint, optional, error, className, children }: FieldShellProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="flex items-baseline justify-between gap-3 text-sm font-medium">
        {label}
        {optional && <span className="text-xs font-normal text-neutral-400">Optional</span>}
      </label>
      {hint && <p className="mt-0.5 text-xs text-neutral-500">{hint}</p>}
      <div className="mt-2">{children}</div>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  name: string;
  label: string;
  hint?: string;
  optional?: boolean;
  error?: string;
  /** Fixed text inside the end of the field, e.g. a currency. */
  suffix?: string;
  wrapperClassName?: string;
};

export function TextField({
  label,
  hint,
  optional,
  error,
  suffix,
  wrapperClassName,
  className,
  ...props
}: TextFieldProps) {
  const id = useId();
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      optional={optional}
      error={error}
      className={wrapperClassName}
    >
      <div className="relative">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(inputStyles, suffix && 'pr-16', className)}
          {...props}
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-neutral-400">
            {suffix}
          </span>
        )}
      </div>
    </FieldShell>
  );
}

type TextAreaFieldProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> & {
  name: string;
  label: string;
  hint?: string;
  optional?: boolean;
  error?: string;
  wrapperClassName?: string;
};

export function TextAreaField({
  label,
  hint,
  optional,
  error,
  wrapperClassName,
  className,
  ...props
}: TextAreaFieldProps) {
  const id = useId();
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      optional={optional}
      error={error}
      className={wrapperClassName}
    >
      <textarea
        id={id}
        rows={4}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(inputStyles, 'resize-y', className)}
        {...props}
      />
    </FieldShell>
  );
}

type ChoiceFieldProps = {
  name: string;
  label: string;
  hint?: string;
  error?: string;
  /** Checkboxes (pick any) instead of radio buttons (pick one). */
  multiple?: boolean;
  options: { value: string; label: string }[];
  className?: string;
};

/** Pill-shaped radio buttons or checkboxes, laid out as a wrapping row. */
export function ChoiceField({
  name,
  label,
  hint,
  error,
  multiple,
  options,
  className,
}: ChoiceFieldProps) {
  const id = useId();
  return (
    <fieldset
      className={className}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${id}-error` : undefined}
    >
      <legend className="text-sm font-medium">{label}</legend>
      {hint && <p className="mt-0.5 text-xs text-neutral-500">{hint}</p>}
      <div className="mt-2.5 flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option.value} className="relative cursor-pointer">
            <input
              type={multiple ? 'checkbox' : 'radio'}
              name={name}
              value={option.value}
              className="peer sr-only"
            />
            <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 py-2.5 text-sm text-neutral-700 transition peer-checked:border-neutral-950 peer-checked:bg-neutral-950 peer-checked:text-white peer-focus-visible:ring-4 peer-focus-visible:ring-neutral-950/15 hover:border-black/25 [&>svg]:hidden peer-checked:[&>svg]:block">
              <Check className="size-3.5" strokeWidth={3} aria-hidden />
              {option.label}
            </span>
          </label>
        ))}
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </fieldset>
  );
}
