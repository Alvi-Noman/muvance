import { useState, type FormEvent } from 'react';
import { Check, Copy, Eye, EyeOff, KeyRound, Link2, RefreshCw, UserPlus, X } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createUserSchema,
  roleDescriptions,
  roleLabels,
  roles,
  type InviteLinkDto,
  type Role,
  type TeamDto,
  type UserDto,
} from '@muvance/shared';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { Field, Input, Select } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { Avatar, Badge, PageHeader, PageLoader } from '@/components/ui/misc';
import { useCurrentUser } from '@/features/auth/auth';
import { api, errorMessage } from '@/lib/api-client';
import { cn } from '@/lib/cn';
import { formatDate, formatRelative } from '@/lib/format';

const teamKey = ['team'] as const;

/** Owners manage everyone; admins manage members and viewers (mirrors the API rule). */
const canManageRole = (actor: Role, role: Role) =>
  actor === 'owner' || (actor === 'admin' && (role === 'member' || role === 'viewer'));

function useTeam() {
  return useQuery({ queryKey: teamKey, queryFn: () => api.get<TeamDto>('/team') });
}

function useTeamMutation<T, R>(fn: (input: T) => Promise<R>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: teamKey }),
  });
}

export function TeamPage() {
  const me = useCurrentUser();
  const { data, isPending } = useTeam();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState<Credentials | null>(null);
  const [link, setLink] = useState<{ title: string; email: string; link: InviteLinkDto } | null>(
    null,
  );

  const updateUser = useTeamMutation(
    ({ id, ...body }: { id: string; role?: Role; status?: 'active' | 'disabled' }) =>
      api.patch<UserDto>(`/team/${id}`, body),
  );
  const resetLink = useTeamMutation((id: string) =>
    api.post<InviteLinkDto>(`/team/${id}/reset-link`),
  );
  const revoke = useTeamMutation((id: string) => api.delete(`/team/invites/${id}`));

  if (isPending || !data) return <PageLoader />;

  return (
    <>
      <PageHeader
        title="Team"
        description="Add people and control what they can do."
        actions={
          <Button onClick={() => setAdding(true)}>
            <UserPlus className="size-4" aria-hidden />
            Add person
          </Button>
        }
      />

      <Card>
        <CardHeader
          title="Members"
          description={`${data.users.length} ${data.users.length === 1 ? 'person' : 'people'}`}
        />
        <ul className="divide-y divide-black/[0.05]">
          {data.users.map((user) => {
            const isMe = user.id === me.id;
            const manageable = !isMe && canManageRole(me.role, user.role);
            return (
              <li
                key={user.id}
                className={cn(
                  'flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center',
                  user.status === 'disabled' && 'opacity-60',
                )}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar name={user.name} className="size-9" />
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {user.name} {isMe && <span className="text-neutral-400">(you)</span>}
                    </p>
                    <p className="truncate text-sm text-neutral-500">
                      {[user.username && `@${user.username}`, user.email]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-neutral-500 sm:w-36">
                  {user.lastLoginAt
                    ? `Active ${formatRelative(user.lastLoginAt)}`
                    : 'Never signed in'}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {user.status === 'disabled' && (
                    <Badge className="bg-red-50 text-red-700">Disabled</Badge>
                  )}
                  {user.mustChangePassword && user.status === 'active' && (
                    <Badge className="bg-amber-50 text-amber-700">Starting password</Badge>
                  )}
                  {manageable ? (
                    <Select
                      aria-label={`Role for ${user.name}`}
                      className="w-32"
                      value={user.role}
                      onChange={(e) =>
                        updateUser.mutate(
                          { id: user.id, role: e.target.value as Role },
                          {
                            onSuccess: () =>
                              toast.success(
                                `${user.name} is now ${roleLabels[e.target.value as Role]}`,
                              ),
                          },
                        )
                      }
                    >
                      {roles
                        .filter((r) => canManageRole(me.role, r))
                        .map((r) => (
                          <option key={r} value={r}>
                            {roleLabels[r]}
                          </option>
                        ))}
                    </Select>
                  ) : (
                    <Badge className="bg-neutral-100 text-neutral-700">
                      {roleLabels[user.role]}
                    </Badge>
                  )}
                  {(manageable || isMe) && user.status === 'active' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      title="Create a password reset link"
                      onClick={() =>
                        resetLink.mutate(user.id, {
                          onSuccess: (l) =>
                            setLink({
                              title: 'Password reset link',
                              email: user.email ?? user.name,
                              link: l,
                            }),
                        })
                      }
                    >
                      <KeyRound className="size-3.5" aria-hidden />
                      Reset link
                    </Button>
                  )}
                  {manageable && (
                    <Button
                      size="sm"
                      variant={user.status === 'active' ? 'danger-ghost' : 'secondary'}
                      onClick={() => {
                        const status = user.status === 'active' ? 'disabled' : 'active';
                        if (
                          status === 'disabled' &&
                          !confirm(`Disable ${user.name}? They'll be signed out right away.`)
                        )
                          return;
                        updateUser.mutate(
                          { id: user.id, status },
                          {
                            onSuccess: () =>
                              toast.success(
                                status === 'active' ? 'Access restored' : 'Access disabled',
                              ),
                          },
                        );
                      }}
                    >
                      {user.status === 'active' ? 'Disable' : 'Enable'}
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      {data.invites.length > 0 && (
        <Card className="mt-6">
          <CardHeader title="Pending invites" description="Links expire after 7 days." />
          <ul className="divide-y divide-black/[0.05]">
            {data.invites.map((invite) => (
              <li key={invite.id} className="flex items-center gap-3 px-5 py-3.5">
                <span className="grid size-9 place-items-center rounded-full bg-neutral-100 text-neutral-500">
                  <Link2 className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{invite.email}</p>
                  <p className="text-xs text-neutral-500">
                    {roleLabels[invite.role]} · expires {formatDate(invite.expiresAt)}
                  </p>
                </div>
                {canManageRole(me.role, invite.role) && (
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Revoke invite for ${invite.email}`}
                    onClick={() =>
                      revoke.mutate(invite.id, { onSuccess: () => toast.success('Invite revoked') })
                    }
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <AddPersonModal
        open={adding}
        onClose={() => setAdding(false)}
        actorRole={me.role}
        onCreated={(credentials) => {
          setAdding(false);
          setAdded(credentials);
        }}
      />
      <CredentialsModal value={added} onClose={() => setAdded(null)} />
      <LinkModal value={link} onClose={() => setLink(null)} />
    </>
  );
}

type Credentials = { username: string; email: string; password: string; role: Role };

/** Easy to read out or type: no characters that look alike. */
function generatePassword() {
  const alphabet = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const values = crypto.getRandomValues(new Uint32Array(14));
  return Array.from(values, (v) => alphabet[v % alphabet.length]).join('');
}

const emptyPerson = { username: '', email: '', password: '' };

function AddPersonModal({
  open,
  onClose,
  actorRole,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  actorRole: Role;
  onCreated: (credentials: Credentials) => void;
}) {
  const queryClient = useQueryClient();
  const allowed = roles.filter((r) => canManageRole(actorRole, r));
  const [values, setValues] = useState(emptyPerson);
  const [role, setRole] = useState<Role>('member');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const setField = (key: keyof typeof emptyPerson, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors(({ [key]: _fixed, ...rest }) => rest);
  };
  const set = (key: keyof typeof emptyPerson) => (e: { target: { value: string } }) =>
    setField(key, e.target.value);

  // Nothing typed, especially the password, stays in the form after closing it.
  const reset = () => {
    setValues(emptyPerson);
    setRole('member');
    setShowPassword(false);
    setErrors({});
    add.reset();
  };
  const close = () => {
    reset();
    onClose();
  };

  const add = useMutation({
    mutationFn: (input: Credentials) => api.post<UserDto>('/team', input),
    onSuccess: (_user, input) => {
      void queryClient.invalidateQueries({ queryKey: teamKey });
      onCreated(input);
      reset();
    },
    onError: () => {},
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const parsed = createUserSchema.safeParse({ ...values, role });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] ??= issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    add.mutate(parsed.data);
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Add a person"
      description="They can sign in with their username or email, then must create their own password."
    >
      <form onSubmit={submit} noValidate className="space-y-5">
        <Field label="Username" error={errors.username}>
          {(p) => (
            <Input
              {...p}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              value={values.username}
              onChange={set('username')}
            />
          )}
        </Field>
        <Field label="Email" error={errors.email}>
          {(p) => (
            <Input
              {...p}
              type="email"
              autoComplete="off"
              value={values.email}
              onChange={set('email')}
            />
          )}
        </Field>
        <Field label="Starting password" hint="At least 10 characters." error={errors.password}>
          {(p) => (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  {...p}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  spellCheck={false}
                  className="pr-10"
                  value={values.password}
                  onChange={set('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 grid w-10 place-items-center text-neutral-400 hover:text-neutral-950"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <Button
                variant="secondary"
                onClick={() => {
                  setField('password', generatePassword());
                  setShowPassword(true);
                }}
              >
                <RefreshCw className="size-4" aria-hidden />
                Generate
              </Button>
            </div>
          )}
        </Field>
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-neutral-800">Role</legend>
          <div className="space-y-2">
            {allowed.map((r) => (
              <label
                key={r}
                className={cn(
                  'flex cursor-pointer gap-3 rounded-xl border p-3 transition-colors',
                  role === r
                    ? 'border-neutral-950 bg-neutral-50'
                    : 'border-black/10 hover:border-black/25',
                )}
              >
                <input
                  type="radio"
                  name="role"
                  value={r}
                  checked={role === r}
                  onChange={() => setRole(r)}
                  className="mt-0.5 size-4 accent-neutral-950"
                />
                <span>
                  <span className="block text-sm font-medium">{roleLabels[r]}</span>
                  <span className="block text-sm text-neutral-500">{roleDescriptions[r]}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        {add.isError && (
          <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {errorMessage(add.error)}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" loading={add.isPending}>
            Add person
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/** Shown once, straight after adding someone: the password can't be read back later. */
function CredentialsModal({ value, onClose }: { value: Credentials | null; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const signIn = `${window.location.origin}/login`;
  const rows = value
    ? [
        ['Sign in at', signIn],
        ['Username', value.username],
        ['Email', value.email],
        ['Starting password', value.password],
        ['Role', roleLabels[value.role]],
      ]
    : [];
  const copy = async () => {
    await navigator.clipboard.writeText(rows.map(([k, v]) => `${k}: ${v}`).join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      open={!!value}
      onClose={onClose}
      title={value ? `${value.username} is added` : ''}
      description="Send them these details privately. They'll create their own password when they sign in."
    >
      {value && (
        <div className="space-y-4">
          <dl className="divide-y divide-black/[0.06] rounded-xl border border-black/10 text-sm">
            {rows.map(([label, text]) => (
              <div key={label} className="flex justify-between gap-4 px-3.5 py-2.5">
                <dt className="shrink-0 text-neutral-500">{label}</dt>
                <dd className="min-w-0 text-right font-medium break-all">{text}</dd>
              </div>
            ))}
          </dl>
          <p className="text-xs text-neutral-500">
            For security, this password is only shown now. If it gets lost, create a reset link for
            them on this page.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={copy}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? 'Copied' : 'Copy all'}
            </Button>
            <Button onClick={onClose}>Done</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function LinkModal({
  value,
  onClose,
}: {
  value: { title: string; email: string; link: InviteLinkDto } | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (!value) return;
    await navigator.clipboard.writeText(value.link.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      open={!!value}
      onClose={onClose}
      title={value?.title ?? ''}
      description={
        value
          ? `Send this to ${value.email}. It works once and expires ${formatRelative(value.link.expiresAt)}.`
          : undefined
      }
    >
      {value && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              readOnly
              value={value.link.url}
              aria-label="Link"
              onFocus={(e) => e.target.select()}
              className="font-mono text-xs"
            />
            <Button variant="secondary" onClick={copy} aria-label="Copy link">
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <p className="text-xs text-neutral-500">
            For security, this link is only shown now. Create a new one if it gets lost.
          </p>
          <div className="flex justify-end">
            <Button onClick={onClose}>Done</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
