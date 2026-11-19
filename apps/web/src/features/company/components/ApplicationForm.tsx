import { useState, type FormEvent, type ReactNode } from 'react';
import { ArrowRight, CircleCheck, LoaderCircle } from 'lucide-react';
import type { ApplicationType } from '@muvance/shared';
import { Button } from '@/components/ui/Button';
import { apiClient, ApiClientError } from '@/lib/api-client';
import { newEventId, trackApplication } from '@/lib/meta-pixel';
import { markRecording, recordingIds } from '@/lib/session-recorder';

export type FieldErrors = Record<string, string | undefined>;

/** The parts of a zod schema the form uses (the shared application schemas). */
type Schema = {
  safeParse: (
    value: unknown,
  ) =>
    | { success: true; data: unknown }
    | { success: false; error: { issues: { path: PropertyKey[]; message: string }[] } };
};

type ApplicationFormProps = {
  type: ApplicationType;
  schema: Schema;
  /** Fields that can have several values (checkbox groups). */
  multiValueFields?: string[];
  submitLabel: string;
  /** Shown in place of the form once it's sent. */
  success: { title: string; body: ReactNode };
  children: (errors: FieldErrors) => ReactNode;
};

/**
 * The invest and training forms: checks the answers in the browser (same rules as the API),
 * sends them with the visitor's recording ids, and reports the Pixel copy of SubmitApplication.
 */
export function ApplicationForm({
  type,
  schema,
  multiValueFields = [],
  submitLabel,
  success,
  children,
}: ApplicationFormProps) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const [failure, setFailure] = useState<string>();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const values: Record<string, unknown> = { type };
    for (const key of new Set(data.keys())) {
      values[key] = multiValueFields.includes(key) ? data.getAll(key) : data.get(key);
    }
    for (const key of multiValueFields) values[key] ??= [];

    const result = schema.safeParse(values);
    if (!result.success) {
      const next: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0]);
        next[key] ??= issue.message;
      }
      setErrors(next);
      // Bring the first problem into view (useful on small screens).
      requestAnimationFrame(() =>
        form.querySelector<HTMLElement>('[aria-invalid="true"]')?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        }),
      );
      return;
    }

    setErrors({});
    setStatus('sending');
    try {
      const eventId = newEventId();
      const ids = await recordingIds();
      await apiClient.post('/applications', {
        ...(result.data as object),
        ...ids,
        eventId,
      });
      trackApplication(eventId, type);
      markRecording('application', { type });
      setStatus('sent');
      form.closest('section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
      setFailure(
        error instanceof ApiClientError && error.status === 429
          ? error.message
          : "We couldn't send that. Check your connection and try again.",
      );
      setStatus('failed');
    }
  }

  if (status === 'sent') {
    return (
      <div className="flex flex-col items-center px-4 py-16 text-center" role="status">
        <span className="grid size-14 place-items-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
          <CircleCheck className="size-7" aria-hidden />
        </span>
        <h3 className="mt-6 font-serif text-4xl">{success.title}</h3>
        <div className="mt-3 max-w-md text-neutral-600">{success.body}</div>
      </div>
    );
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} noValidate className="space-y-6">
      {children(errors)}

      {status === 'failed' && (
        <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {failure}
        </p>
      )}

      <div className="flex flex-col items-start gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-neutral-500">
          We only use these details to get back to you. We never share them.
        </p>
        <Button
          type="submit"
          size="lg"
          disabled={status === 'sending'}
          className="w-full sm:w-auto"
        >
          {status === 'sending' ? (
            <>
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
              Sending…
            </>
          ) : (
            <>
              {submitLabel}
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
