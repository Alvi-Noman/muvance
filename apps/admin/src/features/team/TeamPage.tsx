import { useState, type FormEvent } from 'react';
import { Check, Copy, KeyRound, Link2, UserPlus, X } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
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
  const [inviting, setInviting] = useState(false);
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
        description="Invite people and control what they can do."
        actions={
          <Button onClick={() => setInviting(true)}>
            <UserPlus className="size-4" aria-hidden />
            Invite teammate
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

      <InviteModal
        open={inviting}
        onClose={() => setInviting(false)}
        actorRole={me.role}
        onCreated={(email, l) => {
          setInviting(false);
          setLink({ title: 'Invite link', email, link: l });
        }}
      />
      <LinkModal value={link} onClose={() => setLink(null)} />
    </>
  );
}

function InviteModal({
  open,
  onClose,
  actorRole,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  actorRole: Role;
  onCreated: (email: string, link: InviteLinkDto) => void;
}) {
  const queryClient = useQueryClient();
  const allowed = roles.filter((r) => canManageRole(actorRole, r));
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('member');
  const invite = useMutation({
    mutationFn: () => api.post<InviteLinkDto>('/team/invites', { email, role }),
    onSuccess: (link) => {
      void queryClient.invalidateQueries({ queryKey: teamKey });
      onCreated(email, link);
      setEmail('');
    },
    onError: () => {},
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    invite.mutate();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Invite a teammate"
      description="You'll get a link to send them. It works once and expires in 7 days."
    >
      <form onSubmit={submit} className="space-y-5">
        <Field label="Email">
          {(p) => (
            <Input
              {...p}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
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
        {invite.isError && (
          <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {errorMessage(invite.error)}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={invite.isPending}>
            Create invite link
          </Button>
        </div>
      </form>
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
