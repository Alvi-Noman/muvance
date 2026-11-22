import { useRef, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Camera, Check, Copy, KeyRound, Mail, Pencil, Plus, Trash2, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import type { MailAccountDto, MailAccountsDto } from '@muvance/shared';
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

/** A strong password people can still read out: three word-ish chunks and digits. */
function generatePassword() {
  const alphabet = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(15));
  const chars = Array.from(bytes, (b) => alphabet[b % alphabet.length]);
  return [chars.slice(0, 5), chars.slice(5, 10), chars.slice(10)].map((c) => c.join('')).join('-');
}

/** "Nadia Karim" -> "nadia" (the first name), as a starting suggestion for the address. */
function suggestLocalPart(name: string) {
  return (name.trim().split(/\s+/)[0] ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9._-]/g, '');
}

function parseAliases(text: string) {
  return text
    .split(/[\s,]+/)
    .map((a) => a.replace(/@.*$/, '').trim().toLowerCase())
    .filter(Boolean);
}

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text).catch(() => window.prompt('Copy this:', text));
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  };
  return { copied, copy };
}

type Dialog =
  | { kind: 'create' }
  | { kind: 'edit'; account: MailAccountDto }
  | { kind: 'password'; account: MailAccountDto }
  | { kind: 'created'; address: string; password: string };

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
            with their email address and password.
          </>
        }
        actions={
          <Button onClick={() => setDialog({ kind: 'create' })}>
            <Plus className="size-4" aria-hidden /> New mailbox
          </Button>
        }
      />

      <Card>
        {isPending ? (
          <PageLoader />
        ) : !accounts.length ? (
          <EmptyState
            icon={<Mail className="size-5" />}
            title="No mailboxes yet"
            description="Create one for each teammate. The first one also receives postmaster@, abuse@ and dmarc@ mail."
            action={
              <Button onClick={() => setDialog({ kind: 'create' })}>
                <Plus className="size-4" aria-hidden /> New mailbox
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-black/[0.05]">
            {accounts.map((account) => (
              <AccountRow
                key={account.id}
                account={account}
                onEdit={() => setDialog({ kind: 'edit', account })}
                onPassword={() => setDialog({ kind: 'password', account })}
              />
            ))}
          </ul>
        )}
      </Card>

      {data && <ClientSettings settings={data.clientSettings} />}

      <CreateDialog
        open={dialog?.kind === 'create'}
        domain={data?.domain ?? 'muvance.com'}
        onClose={() => setDialog(null)}
        onCreated={(address, password) => setDialog({ kind: 'created', address, password })}
      />
      {dialog?.kind === 'edit' && (
        <EditDialog
          // The latest version, so a new picture shows straight away.
          account={accounts.find((a) => a.id === dialog.account.id) ?? dialog.account}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.kind === 'password' && (
        <PasswordDialog
          account={dialog.account}
          onClose={() => setDialog(null)}
          onDone={(password) =>
            setDialog({ kind: 'created', address: dialog.account.address, password })
          }
        />
      )}
      {dialog?.kind === 'created' && data && (
        <SignInDetails
          address={dialog.address}
          password={dialog.password}
          webmailUrl={data.webmailUrl}
          onClose={() => setDialog(null)}
        />
      )}
    </>
  );
}

function AccountRow({
  account,
  onEdit,
  onPassword,
}: {
  account: MailAccountDto;
  onEdit: () => void;
  onPassword: () => void;
}) {
  const queryClient = useQueryClient();
  const remove = useMutation({
    mutationFn: () => api.delete(`/mail-accounts/${account.id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
      toast.success(`${account.address} deleted`);
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return (
    <li className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 px-5 py-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <AccountPicture account={account} className="size-10" />
        <div className="min-w-0">
          <p className="font-medium text-neutral-900">{account.name}</p>
          <p className="truncate text-sm text-neutral-600">{account.address}</p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {account.aliases.map((alias) => (
              <Badge key={alias} className="bg-sky-50 text-sky-700">
                {alias}
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
        <Button size="sm" variant="secondary" onClick={onPassword}>
          <KeyRound className="size-3.5" aria-hidden /> Reset password
        </Button>
        <Button size="sm" variant="ghost" onClick={onEdit} aria-label={`Edit ${account.address}`}>
          <Pencil className="size-3.5" aria-hidden />
        </Button>
        <Button
          size="sm"
          variant="danger-ghost"
          aria-label={`Delete ${account.address}`}
          disabled={remove.isPending}
          onClick={() => {
            if (
              window.confirm(
                `Delete ${account.address}? It stops receiving mail and nobody can sign in to it.`,
              )
            ) {
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

function PasswordInput({
  value,
  onChange,
  fieldProps,
}: {
  value: string;
  onChange: (v: string) => void;
  fieldProps: Record<string, unknown>;
}) {
  return (
    <div className="flex gap-2">
      <Input
        {...fieldProps}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="new-password"
        className="font-mono"
      />
      <Button
        type="button"
        variant="secondary"
        onClick={() => onChange(generatePassword())}
        title="Make a strong password"
      >
        <Wand2 className="size-4" aria-hidden /> Generate
      </Button>
    </div>
  );
}

function CreateDialog({
  open,
  domain,
  onClose,
  onCreated,
}: {
  open: boolean;
  domain: string;
  onClose: () => void;
  onCreated: (address: string, password: string) => void;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [localPart, setLocalPart] = useState('');
  const [touchedLocal, setTouchedLocal] = useState(false);
  const [password, setPassword] = useState(generatePassword);
  const [aliases, setAliases] = useState('');
  const [quotaGb, setQuotaGb] = useState('10');

  const reset = () => {
    setName('');
    setLocalPart('');
    setTouchedLocal(false);
    setPassword(generatePassword());
    setAliases('');
    setQuotaGb('10');
  };

  const create = useMutation({
    mutationFn: () =>
      api.post<MailAccountDto>('/mail-accounts', {
        name,
        localPart,
        password,
        quotaGb: Number(quotaGb),
        aliases: parseAliases(aliases),
      }),
    onSuccess: (account) => {
      void queryClient.invalidateQueries({ queryKey });
      onCreated(account.address, password);
      reset();
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    create.mutate();
  };

  return (
    <Modal open={open} onClose={onClose} title="New mailbox">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Their name">
          {(p) => (
            <Input
              {...p}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!touchedLocal) setLocalPart(suggestLocalPart(e.target.value));
              }}
              placeholder="Nadia Karim"
              required
            />
          )}
        </Field>
        <Field label="Email address">
          {(p) => (
            <div className="flex items-center gap-2">
              <Input
                {...p}
                value={localPart}
                onChange={(e) => {
                  setTouchedLocal(true);
                  setLocalPart(e.target.value.toLowerCase());
                }}
                placeholder="nadia"
                required
              />
              <span className="shrink-0 text-sm text-neutral-600">@{domain}</span>
            </div>
          )}
        </Field>
        <Field
          label="Starting password"
          hint="At least 10 characters. They choose their own when they first sign in."
        >
          {(p) => <PasswordInput value={password} onChange={setPassword} fieldProps={p} />}
        </Field>
        <Field
          label="Other addresses (optional)"
          hint={`Also deliver to this inbox, e.g. "sales, hello" for sales@ and hello@.`}
        >
          {(p) => (
            <Input
              {...p}
              value={aliases}
              onChange={(e) => setAliases(e.target.value)}
              placeholder="sales, hello"
            />
          )}
        </Field>
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
          <Button type="submit" disabled={create.isPending}>
            Create mailbox
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function EditDialog({ account, onClose }: { account: MailAccountDto; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(account.name);
  const [aliases, setAliases] = useState(account.aliases.map((a) => a.split('@')[0]).join(', '));
  const [quotaGb, setQuotaGb] = useState(String(account.quotaGb));

  const save = useMutation({
    mutationFn: () =>
      api.patch<MailAccountDto>(`/mail-accounts/${account.id}`, {
        name,
        quotaGb: Number(quotaGb),
        aliases: parseAliases(aliases),
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
        <Field label="Other addresses" hint="Comma-separated, e.g. sales, hello">
          {(p) => <Input {...p} value={aliases} onChange={(e) => setAliases(e.target.value)} />}
        </Field>
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

function PasswordDialog({
  account,
  onClose,
  onDone,
}: {
  account: MailAccountDto;
  onClose: () => void;
  onDone: (password: string) => void;
}) {
  const [password, setPassword] = useState(generatePassword);
  const save = useMutation({
    mutationFn: () => api.post(`/mail-accounts/${account.id}/password`, { password }),
    onSuccess: () => onDone(password),
    onError: (error) => toast.error(errorMessage(error)),
  });
  return (
    <Modal
      open
      onClose={onClose}
      title="Reset password"
      description={`A new password for ${account.address}. Phones and mail apps will ask for it again.`}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
        className="space-y-4"
      >
        <Field label="New password">
          {(p) => <PasswordInput value={password} onChange={setPassword} fieldProps={p} />}
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={save.isPending}>
            Set password
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/** Shown once after creating a mailbox or resetting its password, ready to send to the person. */
function SignInDetails({
  address,
  password,
  webmailUrl,
  onClose,
}: {
  address: string;
  password: string;
  webmailUrl: string;
  onClose: () => void;
}) {
  const { copied, copy } = useCopy();
  const message = `Your Muvance email is ready.\n\nSign in at: ${webmailUrl}\nEmail: ${address}\nPassword: ${password}\n\nWhen you first sign in, you'll choose your own password.`;
  return (
    <Modal
      open
      onClose={onClose}
      title="Sign-in details"
      description="Send these to the person privately. They'll choose their own password when they first sign in, so this one only works once."
    >
      <div className="space-y-2 rounded-xl border border-hud/20 bg-void/40 p-4 font-mono text-sm">
        <p>
          <span className="text-neutral-500">Webmail:</span> {webmailUrl}
        </p>
        <p>
          <span className="text-neutral-500">Email:</span> {address}
        </p>
        <p>
          <span className="text-neutral-500">Password:</span> {password}
        </p>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={() => copy(message, 'all')}>
          {copied === 'all' ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied === 'all' ? 'Copied' : 'Copy message'}
        </Button>
        <Button onClick={onClose}>Done</Button>
      </div>
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
