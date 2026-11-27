import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AtSign, Camera, Mail, Pencil, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import {
  suggestAddressName,
  type MailAccountDto,
  type MailAccountsDto,
  type MailAddressDto,
} from '@muvance/shared';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field, Input } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { Avatar, Badge, EmptyState, PageHeader, PageLoader } from '@/components/ui/misc';
import { api, errorMessage } from '@/lib/api-client';
import { squareAvatar } from '@/lib/avatar-image';
import { cn } from '@/lib/cn';
import { formatRelative } from '@/lib/format';

const queryKey = ['mail-accounts'] as const;

type Dialog =
  { kind: 'edit'; account: MailAccountDto } | { kind: 'address'; address: MailAddressDto | null };

/** Team mailboxes at @muvance.com. People sign in at mail.muvance.com. */
export function EmailAccountsPage() {
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const { data, isPending } = useQuery({
    queryKey,
    queryFn: () => api.get<MailAccountsDto>('/mail-accounts'),
  });
  const accounts = data?.accounts ?? [];

  return (
    <>
      <PageHeader
        title="Email"
        description={
          <>
            Team mailboxes at @{data?.domain ?? 'muvance.com'}. Each person signs in at{' '}
            <a
              href={data?.webmailUrl ?? 'https://mail.muvance.com'}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-hud hover:underline"
            >
              {data?.webmailUrl.replace('https://', '') ?? 'mail.muvance.com'}
            </a>{' '}
            with their Muvance account. Mailboxes come with Muvance accounts: switch Mail on for
            someone on the People page.
          </>
        }
        actions={
          <Link to="/team">
            <Button>
              <Plus className="size-4" aria-hidden /> Add person
            </Button>
          </Link>
        }
      />

      <Card>
        {isPending ? (
          <PageLoader />
        ) : !accounts.length ? (
          <EmptyState
            icon={<Mail className="size-5" />}
            title="No mailboxes yet"
            description="Switch Mail on for someone on the People page. The first mailbox also receives postmaster@, abuse@ and dmarc@ mail."
            action={
              <Link to="/team">
                <Button>
                  <Plus className="size-4" aria-hidden /> Add person
                </Button>
              </Link>
            }
          />
        ) : (
          <ul className="divide-y divide-black/[0.05]">
            {accounts.map((account) => (
              <AccountRow
                key={account.id}
                account={account}
                onEdit={() => setDialog({ kind: 'edit', account })}
              />
            ))}
          </ul>
        )}
      </Card>

      <section className="mt-8">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-medium text-neutral-900">Shared addresses</h2>
            <p className="text-sm text-neutral-500">
              Addresses like hr@ or accounts@. Their mail goes to the people you choose, who can
              also send as them under the address's own name.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => setDialog({ kind: 'address', address: null })}
            disabled={!accounts.length}
          >
            <Plus className="size-4" aria-hidden /> New address
          </Button>
        </div>
        <Card>
          {!data?.addresses.length ? (
            <EmptyState
              icon={<AtSign className="size-5" />}
              title="No shared addresses yet"
              description={
                accounts.length
                  ? 'Add hr@, accounts@, hello@ and so on, and choose who handles each.'
                  : 'Create a mailbox first, then give people shared addresses.'
              }
            />
          ) : (
            <ul className="divide-y divide-black/[0.05]">
              {data.addresses.map((address) => (
                <AddressRow
                  key={address.id}
                  address={address}
                  onEdit={() => setDialog({ kind: 'address', address })}
                />
              ))}
            </ul>
          )}
        </Card>
      </section>

      {data && <ClientSettings settings={data.clientSettings} />}

      {dialog?.kind === 'edit' && (
        <EditDialog
          // The latest version, so a new picture shows straight away.
          account={accounts.find((a) => a.id === dialog.account.id) ?? dialog.account}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.kind === 'address' && data && (
        <AddressDialog
          address={dialog.address}
          accounts={accounts}
          domain={data.domain}
          onClose={() => setDialog(null)}
        />
      )}
    </>
  );
}

/** A mailbox. Its password is the person's Muvance account password (People page). */
function AccountRow({ account, onEdit }: { account: MailAccountDto; onEdit: () => void }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 px-5 py-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <AccountPicture account={account} className="size-10" />
        <div className="min-w-0">
          <p className="font-medium text-neutral-900">{account.name}</p>
          <p className="truncate text-sm text-neutral-600">
            {account.address}
            <span className="text-neutral-400"> · sends as “{account.senderName}”</span>
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {account.addresses.map((address) => (
              <Badge key={address} className="bg-sky-50 text-sky-700">
                {address}
              </Badge>
            ))}
            <span className="text-xs text-neutral-500">
              {account.quotaGb} GB · added {formatRelative(account.createdAt)} by{' '}
              {account.createdByName}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <Button size="sm" variant="ghost" onClick={onEdit} aria-label={`Edit ${account.address}`}>
          <Pencil className="size-3.5" aria-hidden />
        </Button>
      </div>
    </li>
  );
}

function EditDialog({ account, onClose }: { account: MailAccountDto; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(account.name);
  const [senderName, setSenderName] = useState(account.senderName);
  const [quotaGb, setQuotaGb] = useState(String(account.quotaGb));

  const save = useMutation({
    mutationFn: () =>
      api.patch<MailAccountDto>(`/mail-accounts/${account.id}`, {
        name,
        senderName: senderName.trim(),
        quotaGb: Number(quotaGb),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
      toast.success('Saved');
      onClose();
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return (
    <Modal open onClose={onClose} title={account.address}>
      <div className="mb-5 flex items-center gap-4">
        <AccountPicture account={account} className="size-16" />
        <div>
          <p className="text-sm font-medium text-neutral-900">Profile picture</p>
          <p className="text-xs text-neutral-500">
            Shown next to their mail. They can change it too, in Muvance Mail's settings.
          </p>
          <PictureButtons account={account} />
        </div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
        className="space-y-4"
      >
        <Field label="Their name">
          {(p) => <Input {...p} value={name} onChange={(e) => setName(e.target.value)} required />}
        </Field>
        <Field
          label="Name on their emails"
          hint="Default for their own address. They can adjust it in Muvance Mail's settings."
        >
          {(p) => (
            <Input {...p} value={senderName} onChange={(e) => setSenderName(e.target.value)} />
          )}
        </Field>
        {account.addresses.length > 0 && (
          <p className="text-sm text-neutral-600">
            Also receives and sends as: {account.addresses.join(', ')}. Change these under Shared
            addresses.
          </p>
        )}
        <Field label="Storage (GB)">
          {(p) => (
            <Input
              {...p}
              type="number"
              min={1}
              max={100}
              value={quotaGb}
              onChange={(e) => setQuotaGb(e.target.value)}
              className="w-28"
            />
          )}
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={save.isPending}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function ClientSettings({ settings }: { settings: MailAccountsDto['clientSettings'] }) {
  return (
    <Card className="mt-6 p-5">
      <h2 className="font-medium text-neutral-900">Phone and computer mail apps</h2>
      <p className="mt-1 text-sm text-neutral-600">
        Gmail, iPhone Mail and Outlook work too. Add an account, choose "Other" or "IMAP", and
        enter:
      </p>
      <dl className="mt-3 grid gap-x-8 gap-y-1 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-neutral-500">Incoming (IMAP)</dt>
          <dd className="font-mono">
            {settings.imapHost}, port {settings.imapPort}, SSL/TLS
          </dd>
        </div>
        <div>
          <dt className="text-neutral-500">Outgoing (SMTP)</dt>
          <dd className="font-mono">
            {settings.smtpHost}, port {settings.smtpPort}, SSL/TLS
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-neutral-500">Username and password</dt>
          <dd>Their full email address and their password, for both.</dd>
        </div>
      </dl>
    </Card>
  );
}

/** Uploads or removes a mailbox's picture, refreshing the list. */
function usePictureActions(account: MailAccountDto) {
  const queryClient = useQueryClient();
  const upload = useMutation({
    mutationFn: async (file: File) =>
      api.put<MailAccountDto>(`/mail-accounts/${account.id}/avatar`, {
        image: await squareAvatar(file),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
      toast.success('Picture updated');
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
  const remove = useMutation({
    mutationFn: () => api.delete(`/mail-accounts/${account.id}/avatar`),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey }),
    onError: (error) => toast.error(errorMessage(error)),
  });
  return { upload, remove, busy: upload.isPending || remove.isPending };
}

/** The person's picture (or initials). Clicking it picks a new picture. */
function AccountPicture({ account, className }: { account: MailAccountDto; className?: string }) {
  const { upload, busy } = usePictureActions(account);
  const input = useRef<HTMLInputElement>(null);
  return (
    <button
      type="button"
      onClick={() => input.current?.click()}
      className={cn('group relative shrink-0 overflow-hidden rounded-full', className)}
      aria-label={`Change ${account.name}'s picture`}
      title="Change picture"
      disabled={busy}
    >
      {account.avatarUrl ? (
        <img src={account.avatarUrl} alt="" className="size-full object-cover" />
      ) : (
        <Avatar name={account.name} className="size-full" />
      )}
      <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-white opacity-0 transition group-hover:opacity-100">
        <Camera className="size-4" />
      </span>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload.mutate(file);
          e.target.value = '';
        }}
      />
    </button>
  );
}

function PictureButtons({ account }: { account: MailAccountDto }) {
  const { upload, remove, busy } = usePictureActions(account);
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className="mt-2 flex gap-2">
      <Button size="sm" variant="secondary" onClick={() => input.current?.click()} disabled={busy}>
        <Camera className="size-3.5" aria-hidden /> {account.avatarUrl ? 'Change' : 'Upload'}
      </Button>
      {account.avatarUrl && (
        <Button size="sm" variant="ghost" onClick={() => remove.mutate()} disabled={busy}>
          Remove
        </Button>
      )}
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload.mutate(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}

function AddressRow({ address, onEdit }: { address: MailAddressDto; onEdit: () => void }) {
  const queryClient = useQueryClient();
  const remove = useMutation({
    mutationFn: () => api.delete(`/mail-addresses/${address.id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
      toast.success(`${address.address} deleted`);
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
  return (
    <li className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 px-5 py-4">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-neutral-900">{address.address}</p>
        <p className="text-sm text-neutral-600">
          Sends as “{address.displayName}” ·{' '}
          {address.owners.length ? (
            <>goes to {address.owners.map((o) => o.name).join(', ')}</>
          ) : (
            <span className="text-red-600">nobody receives it (mail to it bounces)</span>
          )}
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        <Button size="sm" variant="ghost" onClick={onEdit} aria-label={`Edit ${address.address}`}>
          <Pencil className="size-3.5" aria-hidden />
        </Button>
        <Button
          size="sm"
          variant="danger-ghost"
          aria-label={`Delete ${address.address}`}
          disabled={remove.isPending}
          onClick={() => {
            if (window.confirm(`Delete ${address.address}? Mail sent to it will bounce.`)) {
              remove.mutate();
            }
          }}
        >
          <Trash2 className="size-3.5" aria-hidden />
        </Button>
      </div>
    </li>
  );
}

/** Create a shared address, or change its name and who receives it. */
function AddressDialog({
  address,
  accounts,
  domain,
  onClose,
}: {
  address: MailAddressDto | null;
  accounts: MailAccountDto[];
  domain: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [localPart, setLocalPart] = useState(address?.localPart ?? '');
  const [displayName, setDisplayName] = useState(address?.displayName ?? '');
  const [touchedName, setTouchedName] = useState(!!address);
  const [owners, setOwners] = useState<Set<string>>(
    new Set(address?.owners.map((o) => o.id) ?? []),
  );

  const save = useMutation({
    mutationFn: () =>
      address
        ? api.patch(`/mail-addresses/${address.id}`, { displayName, ownerIds: [...owners] })
        : api.post('/mail-addresses', { localPart, displayName, ownerIds: [...owners] }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
      toast.success(address ? 'Saved' : `${localPart}@${domain} created`);
      onClose();
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return (
    <Modal open onClose={onClose} title={address ? address.address : 'New shared address'}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
        className="space-y-4"
      >
        {!address && (
          <Field label="Address">
            {(p) => (
              <div className="flex items-center gap-2">
                <Input
                  {...p}
                  value={localPart}
                  onChange={(e) => {
                    const value = e.target.value.toLowerCase().replace(/@.*$/, '');
                    setLocalPart(value);
                    if (!touchedName) setDisplayName(value ? suggestAddressName(value) : '');
                  }}
                  placeholder="hr"
                  autoFocus
                  required
                />
                <span className="shrink-0 text-sm text-neutral-600">@{domain}</span>
              </div>
            )}
          </Field>
        )}
        <Field label="Name on its emails" hint="What recipients see, for example Muvance HR.">
          {(p) => (
            <Input
              {...p}
              value={displayName}
              onChange={(e) => {
                setTouchedName(true);
                setDisplayName(e.target.value);
              }}
              placeholder="Muvance HR"
              required
            />
          )}
        </Field>
        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-neutral-800">
            Who receives it and can send as it
          </legend>
          <div className="max-h-60 space-y-1 overflow-y-auto rounded-xl border border-hud/20 p-2">
            {accounts.map((account) => (
              <label
                key={account.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-black/[0.03]"
              >
                <input
                  type="checkbox"
                  checked={owners.has(account.id)}
                  onChange={(e) =>
                    setOwners((set) => {
                      const next = new Set(set);
                      if (e.target.checked) next.add(account.id);
                      else next.delete(account.id);
                      return next;
                    })
                  }
                  className="size-4"
                />
                <span className="text-sm">
                  {account.name} <span className="text-neutral-500">{account.address}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={save.isPending || owners.size === 0}>
            {address ? 'Save' : 'Create address'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
