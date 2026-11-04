import { useState, type FormEvent } from 'react';
import { createLeadSchema } from '@muvance/shared';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select, Textarea } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { useAssignable, useCreateLead } from './leads-api';

const empty = { name: '', phone: '', businessName: '', website: '', monthlySales: '', message: '' };

/**
 * "Add lead" for people who didn't book on the website (calls, referrals, events).
 * They start at "Discovery booked"; you then schedule the discovery call from their page.
 */
export function LeadFormModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const create = useCreateLead();
  const assignable = useAssignable();
  const [values, setValues] = useState(empty);
  const [assigneeId, setAssigneeId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: keyof typeof empty) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const parsed = createLeadSchema.safeParse({ ...values, assigneeId: assigneeId || null });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] ??= issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    create.mutate(parsed.data, {
      onSuccess: (lead) => {
        toast.success('Lead added. Schedule their discovery call next.');
        setValues(empty);
        onClose();
        navigate(`/leads/${lead.id}`);
      },
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add a lead"
      description="For people who didn't book on the website. You'll schedule their discovery call next."
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" error={errors.name}>
            {(p) => <Input {...p} value={values.name} onChange={set('name')} />}
          </Field>
          <Field label="Phone" error={errors.phone}>
            {(p) => (
              <Input
                {...p}
                type="tel"
                placeholder="+880 1XXX-XXXXXX"
                value={values.phone}
                onChange={set('phone')}
              />
            )}
          </Field>
          <Field label="Business name">
            {(p) => <Input {...p} value={values.businessName} onChange={set('businessName')} />}
          </Field>
          <Field label="Website" error={errors.website}>
            {(p) => (
              <Input
                {...p}
                inputMode="url"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="yourbrand.com"
                value={values.website}
                onChange={set('website')}
              />
            )}
          </Field>
          <Field label="Average monthly sales">
            {(p) => (
              <div className="relative">
                <Input
                  {...p}
                  placeholder="e.g. 50 lac or 50,00,000"
                  aria-describedby="monthly-sales-suffix"
                  className="pr-14"
                  value={values.monthlySales}
                  onChange={set('monthlySales')}
                />
                <span
                  id="monthly-sales-suffix"
                  className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-sm text-neutral-500"
                >
                  Taka
                </span>
              </div>
            )}
          </Field>
          <Field label="Owner">
            {(p) => (
              <Select {...p} value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
                <option value="">Unassigned</option>
                {assignable.data?.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>
        <Field label="Notes">
          {(p) => <Textarea {...p} rows={3} value={values.message} onChange={set('message')} />}
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={create.isPending}>
            Add lead
          </Button>
        </div>
      </form>
    </Modal>
  );
}
