import { useState, type FormEvent } from 'react';
import type { LostReason } from '@muvance/shared';
import { Button } from '@/components/ui/Button';
import { Field, Textarea } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/cn';
import { lostReasonOptions } from './stages';

type LostReasonModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: LostReason, note: string) => void;
  loading?: boolean;
  /** Pre-selected reason, e.g. "Said no to the offer" from the proposal step. */
  defaultReason?: LostReason;
  count?: number;
  title?: string;
  description?: string;
  confirmLabel?: string;
};

/** Asks why a lead was lost. Lost is final (no follow-ups), so the reason is what you learn from. */
export function LostReasonModal({
  open,
  onClose,
  onConfirm,
  loading,
  defaultReason,
  count = 1,
  title,
  description,
  confirmLabel,
}: LostReasonModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title ?? (count > 1 ? `Mark ${count} leads as lost?` : 'Mark as lost?')}
      description={
        description ??
        'Lost is final. The reason shows up on your dashboard, so you can see where you lose people.'
      }
    >
      {/* Keyed so the form resets each time it opens. */}
      {open && (
        <LostReasonForm
          key={defaultReason ?? 'none'}
          {...{ onClose, onConfirm, loading, defaultReason, confirmLabel }}
        />
      )}
    </Modal>
  );
}

function LostReasonForm({
  onClose,
  onConfirm,
  loading,
  defaultReason,
  confirmLabel = 'Mark as lost',
}: Pick<
  LostReasonModalProps,
  'onClose' | 'onConfirm' | 'loading' | 'defaultReason' | 'confirmLabel'
>) {
  const [reason, setReason] = useState<LostReason | null>(defaultReason ?? null);
  const [note, setNote] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (reason) onConfirm(reason, note);
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-neutral-800">Reason</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {lostReasonOptions.map((o) => (
            <label
              key={o.value}
              className={cn(
                'flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition-colors',
                reason === o.value
                  ? 'border-neutral-950 bg-neutral-50 font-medium'
                  : 'border-black/10 hover:border-black/25',
              )}
            >
              <input
                type="radio"
                name="lostReason"
                value={o.value}
                checked={reason === o.value}
                onChange={() => setReason(o.value)}
                className="size-4 accent-neutral-950"
              />
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>
      <Field label="Note" hint="Optional, e.g. what they said.">
        {(p) => <Textarea {...p} rows={2} value={note} onChange={(e) => setNote(e.target.value)} />}
      </Field>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="danger" disabled={!reason} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </form>
  );
}
