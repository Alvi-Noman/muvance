import { useState, type FormEvent, type ReactNode } from 'react';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { bookingDetailsSchema, type BookingDetails } from '@muvance/shared';
import { Button } from '@/components/ui/Button';
import { ApiClientError } from '@/lib/api-client';
import { cn } from '@/lib/cn';

type FieldErrors = Partial<Record<keyof BookingDetails, string>>;

type FieldConfig = {
  name: Exclude<keyof BookingDetails, 'message'>;
  label: string;
  placeholder: string;
  type?: 'text' | 'tel';
  inputMode?: 'text' | 'tel' | 'url';
  /** Fixed text shown inside the end of the field, e.g. a currency. */
  suffix?: string;
  /** Span both columns on wider screens. */
  wide?: boolean;
  autoComplete: string;
};

// Required fields, in display order. "Anything we should know?" is rendered separately below.
const fields: FieldConfig[] = [
  { name: 'name', label: 'Name', placeholder: 'Your full name', autoComplete: 'name' },
  {
    name: 'phone',
    label: 'Phone number',
    placeholder: '+880 1XXX-XXXXXX',
    type: 'tel',
    inputMode: 'tel',
    autoComplete: 'tel',
  },
  {
    name: 'businessName',
    label: 'Business name',
    placeholder: 'Your brand',
    autoComplete: 'organization',
  },
  {
    name: 'website',
    label: 'Website',
    placeholder: 'yourbrand.com',
    inputMode: 'url',
    autoComplete: 'url',
  },
  {
    name: 'monthlySales',
    label: 'Average monthly sales',
    placeholder: 'e.g. 50 lac or 50,00,000',
    suffix: 'Taka',
    autoComplete: 'off',
    wide: true,
  },
];

const inputStyles =
  'w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-white/40 focus:bg-white/10 focus:ring-4 focus:ring-white/5 aria-[invalid=true]:border-red-400/70 aria-[invalid=true]:bg-red-400/5';

type BookingDetailsFormProps = {
  onSubmit: (details: BookingDetails) => void;
  isPending: boolean;
  error: Error | null;
  /** Called when the chosen time was taken by someone else in the meantime. */
  onSlotTaken: () => void;
};

export function BookingDetailsForm({
  onSubmit,
  isPending,
  error,
  onSlotTaken,
}: BookingDetailsFormProps) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const slotTaken = error instanceof ApiClientError && error.status === 409;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values: Record<string, FormDataEntryValue | undefined> = Object.fromEntries(
      new FormData(event.currentTarget),
    );
    // Only the optional message treats empty as "not provided"; required fields keep ''
    // so they fail with their own friendly message rather than a generic type error.
    if (values.message === '') values.message = undefined;

    const result = bookingDetailsSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof BookingDetails;
        fieldErrors[key] ??= issue.message;
      }
      setErrors(fieldErrors);
      // Bring the first problem into view (useful on small screens).
      event.currentTarget.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }

    setErrors({});
    onSubmit(result.data);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Your details</h2>
        <p className="mt-1 text-sm text-neutral-400">
          So we can prepare for the call and reach you on the day.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((field, i) => (
          <motion.div
            key={field.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.04, duration: 0.3 }}
            className={field.wide ? 'sm:col-span-2' : undefined}
          >
            <Field label={field.label} name={field.name} error={errors[field.name]}>
              <div className="relative">
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  inputMode={field.inputMode}
                  autoCapitalize={field.inputMode === 'url' ? 'none' : undefined}
                  spellCheck={field.inputMode === 'url' ? false : undefined}
                  autoComplete={field.autoComplete}
                  placeholder={field.placeholder}
                  aria-invalid={!!errors[field.name]}
                  aria-describedby={
                    [
                      field.suffix && `${field.name}-suffix`,
                      errors[field.name] && `${field.name}-error`,
                    ]
                      .filter(Boolean)
                      .join(' ') || undefined
                  }
                  className={cn(inputStyles, field.suffix && 'pr-16')}
                />
                {field.suffix && (
                  <span
                    id={`${field.name}-suffix`}
                    className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-medium text-neutral-400"
                  >
                    {field.suffix}
                  </span>
                )}
              </div>
            </Field>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <Field label="Anything we should know?" name="message" optional error={errors.message}>
          <textarea
            id="message"
            name="message"
            rows={3}
            placeholder="Your goals, current results, what's not working…"
            className={cn(inputStyles, 'resize-none')}
          />
        </Field>
      </motion.div>

      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200 sm:flex-row sm:items-center sm:justify-between"
        >
          {slotTaken ? error.message : 'Something went wrong. Please try again.'}
          {slotTaken && (
            <button
              type="button"
              onClick={onSlotTaken}
              className="shrink-0 font-medium text-white underline underline-offset-4"
            >
              Pick another time
            </button>
          )}
        </div>
      )}

      <Button type="submit" variant="inverted" size="lg" disabled={isPending} className="w-full">
        {isPending ? (
          <>
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
            Booking…
          </>
        ) : (
          <>
            Book a call
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </>
        )}
      </Button>
      <p className="text-center text-xs text-neutral-500">
        No spam, no obligation. We&apos;ll only use your details to arrange the call.
      </p>
    </form>
  );
}

type FieldProps = {
  label: string;
  name: string;
  optional?: boolean;
  error?: string;
  children: ReactNode;
};

function Field({ label, name, optional, error, children }: FieldProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 flex items-baseline justify-between text-sm font-medium text-neutral-200"
      >
        {label}
        {optional && <span className="text-xs font-normal text-neutral-500">Optional</span>}
      </label>
      {children}
      {error && (
        <p id={`${name}-error`} className="mt-1.5 text-xs text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
