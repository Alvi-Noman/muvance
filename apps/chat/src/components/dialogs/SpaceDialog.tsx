import { useMemo, useState, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Copy, Mail, MoreVertical, ShieldCheck, Trash2, UserMinus, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router';
import type { ChatInviteResultDto, ChatSpaceDto } from '@muvance/shared';
import { api, errorMessage } from '@/lib/api';
import { keys, personOf, spaceTitle, useChat } from '@/lib/data';
import { cn } from '@/lib/utils';
import {
  Badge,
  Button,
  Dialog,
  Field,
  IconButton,
  Input,
  Menu,
  MenuItem,
  Spinner,
  Switch,
  useToast,
} from '../ui';
import { PeoplePicker, PersonRow } from './NewDialogs';

type Tab = 'members' | 'settings';

export function SpaceDialog({
  space,
  tab,
  onTab,
  onClose,
}: {
  space: ChatSpaceDto;
  tab: Tab | null;
  onTab: (tab: Tab) => void;
  onClose: () => void;
}) {
  const { me, people } = useChat();
  return (
    <Dialog open={tab !== null} onClose={onClose} title={spaceTitle(space, me.id, people)}>
      {space.kind === 'space' && (
        <div className="mb-5 flex gap-1 rounded-xl bg-canvas p-1">
          {(['members', 'settings'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onTab(t)}
              className={cn(
                'flex-1 rounded-lg py-1.5 text-sm font-medium transition',
                tab === t ? 'bg-white shadow-sm' : 'text-muted hover:text-ink',
              )}
            >
              {t === 'members' ? `Members (${space.members.length})` : 'Settings'}
            </button>
          ))}
        </div>
      )}
      {tab === 'settings' && space.kind === 'space' ? (
        <SettingsTab space={space} onClose={onClose} />
      ) : (
        <MembersTab space={space} />
      )}
    </Dialog>
  );
}

function MembersTab({ space }: { space: ChatSpaceDto }) {
  const { me, people } = useChat();
  const qc = useQueryClient();
  const toast = useToast();
  const [adding, setAdding] = useState<'team' | 'guest' | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const memberIds = useMemo(() => new Set(space.members.map((m) => m.userId)), [space.members]);
  const amManager =
    me.canManage && space.members.some((m) => m.userId === me.id && m.role === 'manager');
  const canAdd = me.canManage && space.kind === 'space';

  const refresh = () => qc.invalidateQueries({ queryKey: keys.bootstrap });

  const add = async () => {
    setBusy(true);
    try {
      await api.post(`/spaces/${space.id}/members`, { userIds: selected });
      await refresh();
      setSelected([]);
      setAdding(null);
      toast('Added');
    } catch (error) {
      toast(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (userId: string) => {
    const person = personOf(people, userId);
    if (!window.confirm(`Remove ${person.name} from “${space.name}”?`)) return;
    try {
      await api.delete(`/spaces/${space.id}/members/${userId}`);
      await refresh();
    } catch (error) {
      toast(errorMessage(error));
    }
  };

  const setRole = async (userId: string, role: 'manager' | 'member') => {
    try {
      await api.patch(`/spaces/${space.id}/members/${userId}`, { role });
      await refresh();
    } catch (error) {
      toast(errorMessage(error));
    }
  };

  const sorted = [...space.members].sort((a, b) => {
    const pa = personOf(people, a.userId);
    const pb = personOf(people, b.userId);
    if (pa.kind !== pb.kind) return pa.kind === 'team' ? -1 : 1;
    return pa.name.localeCompare(pb.name);
  });

  return (
    <div>
      {canAdd && (
        <div className="mb-4 flex gap-2">
          <Button
            variant={adding === 'team' ? 'primary' : 'secondary'}
            onClick={() => setAdding(adding === 'team' ? null : 'team')}
            className="flex-1"
          >
            <UserPlus /> Add people
          </Button>
          <Button
            variant={adding === 'guest' ? 'primary' : 'secondary'}
            onClick={() => setAdding(adding === 'guest' ? null : 'guest')}
            className="flex-1"
          >
            <Mail /> Invite a client
          </Button>
        </div>
      )}

      {adding === 'team' && (
        <div className="mb-5 rounded-2xl border border-line p-3">
          <PeoplePicker selected={selected} onChange={setSelected} exclude={memberIds} />
          <div className="mt-3 flex justify-end">
            <Button onClick={() => void add()} disabled={busy || !selected.length}>
              {busy ? <Spinner /> : `Add${selected.length ? ` ${selected.length}` : ''}`}
            </Button>
          </div>
        </div>
      )}

      {adding === 'guest' && <InviteGuest space={space} onDone={() => void refresh()} />}

      <div className="-mx-2">
        {sorted.map((m) => {
          const person = personOf(people, m.userId);
          const isMe = m.userId === me.id;
          return (
            <PersonRow
              key={m.userId}
              person={isMe ? { ...person, name: `${person.name} (you)` } : person}
              right={
                <span className="flex items-center gap-1">
                  {m.role === 'manager' && space.kind === 'space' && (
                    <Badge tone="accent">Manager</Badge>
                  )}
                  {amManager && !isMe && space.kind === 'space' && (
                    <Menu
                      trigger={(_o, toggle) => (
                        <IconButton label={`Options for ${person.name}`} onClick={toggle}>
                          <MoreVertical />
                        </IconButton>
                      )}
                    >
                      {(close) => (
                        <>
                          {person.kind === 'team' && (
                            <MenuItem
                              icon={<ShieldCheck />}
                              onClick={() => {
                                close();
                                void setRole(m.userId, m.role === 'manager' ? 'member' : 'manager');
                              }}
                            >
                              {m.role === 'manager' ? 'Remove as manager' : 'Make a manager'}
                            </MenuItem>
                          )}
                          <MenuItem
                            icon={<UserMinus />}
                            danger
                            onClick={() => {
                              close();
                              void remove(m.userId);
                            }}
                          >
                            Remove from space
                          </MenuItem>
                        </>
                      )}
                    </Menu>
                  )}
                </span>
              }
            />
          );
        })}
      </div>
    </div>
  );
}

function InviteGuest({ space, onDone }: { space: ChatSpaceDto; onDone: () => void }) {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ChatInviteResultDto | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api.post<ChatInviteResultDto>(`/spaces/${space.id}/guests`, {
        email,
        name,
      });
      setResult(res);
      setEmail('');
      setName('');
      onDone();
    } catch (error) {
      toast(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mb-5 rounded-2xl border border-line p-4">
      <form onSubmit={submit} className="space-y-3">
        <p className="text-sm text-muted">
          They get an email from your address with a link to join: no password or account needed.
          Clients only see the spaces they're added to.
        </p>
        <Field label="Client's email">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            placeholder="name@company.com"
          />
        </Field>
        <Field label="Their name (optional)">
          <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
        </Field>
        <div className="flex justify-end">
          <Button type="submit" disabled={busy || !email}>
            {busy ? <Spinner /> : 'Invite'}
          </Button>
        </div>
      </form>
      {result && (
        <div
          className={cn(
            'mt-3 rounded-xl p-3 text-sm',
            result.emailed ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-900',
          )}
        >
          <p>
            {result.emailed
              ? result.inviteUrl
                ? `Invite sent to ${result.person.email}.`
                : `${result.person.name} was added and told by email.`
              : result.inviteUrl
                ? `${result.person.name} was added, but the email couldn't be sent. Send them this link another way (it works for 14 days):`
                : `${result.person.name} was added.`}
          </p>
          {result.inviteUrl && (
            <div className="mt-2 flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-lg bg-white/70 px-2 py-1 text-xs">
                {result.inviteUrl}
              </code>
              <Button
                variant="secondary"
                className="h-8"
                onClick={() =>
                  void navigator.clipboard
                    .writeText(result.inviteUrl!)
                    .then(() => toast('Link copied'))
                }
              >
                <Copy /> Copy
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SettingsTab({ space, onClose }: { space: ChatSpaceDto; onClose: () => void }) {
  const { me } = useChat();
  const qc = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState(space.name);
  const [description, setDescription] = useState(space.description);
  const [discoverable, setDiscoverable] = useState(space.discoverable);
  const [busy, setBusy] = useState(false);
  const amManager =
    me.canManage && space.members.some((m) => m.userId === me.id && m.role === 'manager');

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.patch(`/spaces/${space.id}`, { name, description, discoverable });
      await qc.invalidateQueries({ queryKey: keys.bootstrap });
      toast('Saved');
    } catch (error) {
      toast(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (
      !window.confirm(
        `Delete “${space.name}” for everyone? All its messages and files are deleted too. This can't be undone.`,
      )
    )
      return;
    try {
      await api.delete(`/spaces/${space.id}`);
      onClose();
      navigate('/');
    } catch (error) {
      toast(errorMessage(error));
    }
  };

  const leave = async () => {
    if (!window.confirm(`Leave “${space.name}”?`)) return;
    try {
      await api.post(`/spaces/${space.id}/leave`);
      onClose();
      navigate('/');
    } catch (error) {
      toast(errorMessage(error));
    }
  };

  if (!amManager) {
    return (
      <div className="space-y-4">
        {space.description ? (
          <p className="text-sm">{space.description}</p>
        ) : (
          <p className="text-sm text-muted">No description.</p>
        )}
        <p className="text-xs text-muted">Only the space's managers can change its settings.</p>
        <Button variant="secondary" onClick={() => void leave()}>
          Leave space
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <Field label="Name">
        <Input value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} />
      </Field>
      <Field label="Description">
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={300}
        />
      </Field>
      <div className="flex items-start justify-between gap-4 rounded-xl bg-canvas p-3.5">
        <div>
          <p className="text-sm font-medium">The team can find it</p>
          <p className="text-xs text-muted">
            Anyone at Muvance can find and join it. Guests never can.
          </p>
        </div>
        <Switch checked={discoverable} onChange={setDiscoverable} label="The team can find it" />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={busy || !name.trim()}>
          {busy ? <Spinner /> : 'Save'}
        </Button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4">
        <Button variant="secondary" onClick={() => void leave()}>
          Leave space
        </Button>
        <Button
          variant="ghost"
          className="text-red-600 hover:bg-red-50"
          onClick={() => void remove()}
        >
          <Trash2 /> Delete space
        </Button>
      </div>
    </form>
  );
}
