import { useMemo, useState, type FormEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Search, Users } from 'lucide-react';
import { useNavigate } from 'react-router';
import type { ChatBrowseSpaceDto, ChatPersonDto, ChatSpaceDto } from '@muvance/shared';
import { api, errorMessage } from '@/lib/api';
import { keys, useChat } from '@/lib/data';
import { cn } from '@/lib/utils';
import { SpaceIcon } from '../Sidebar';
import { Avatar, Badge, Button, Dialog, Field, Input, Spinner, Switch, useToast } from '../ui';

/** People you could add or message: the team, and (for the team) guests. */
export function usePeopleDirectory(enabled: boolean) {
  return useQuery({
    queryKey: ['people'],
    queryFn: () => api.get<ChatPersonDto[]>('/people'),
    enabled,
    staleTime: 30_000,
  });
}

function matches(p: ChatPersonDto, q: string) {
  const s = q.trim().toLowerCase();
  return !s || p.name.toLowerCase().includes(s) || p.email.toLowerCase().includes(s);
}

export function PersonRow({
  person,
  right,
  onClick,
  selected,
}: {
  person: ChatPersonDto;
  right?: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
}) {
  const inner = (
    <>
      <Avatar person={person} presence className="size-9 text-sm" />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{person.name}</span>
          {person.kind === 'guest' && <Badge tone="guest">Guest</Badge>}
          {person.status === 'invited' && <Badge>Invited</Badge>}
        </span>
        <span className="block truncate text-xs text-muted">
          {[person.company, person.email].filter(Boolean).join(' · ')}
        </span>
      </span>
      {selected !== undefined && (
        <span
          className={cn(
            'inline-flex size-5 items-center justify-center rounded-md border',
            selected ? 'border-accent bg-accent text-white' : 'border-neutral-300',
          )}
        >
          {selected && <Check className="size-3.5" />}
        </span>
      )}
      {right}
    </>
  );
  return onClick ? (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition hover:bg-black/[0.04]"
    >
      {inner}
    </button>
  ) : (
    <div className="flex items-center gap-3 rounded-xl px-2.5 py-2">{inner}</div>
  );
}

export function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex h-10 items-center gap-2 rounded-xl border border-line px-3 focus-within:border-ink">
      <Search className="size-4 text-muted" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus
        className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none"
      />
    </div>
  );
}

export function StartChatDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { me, people } = useChat();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const toast = useToast();
  const [q, setQ] = useState('');
  const directory = usePeopleDirectory(open && me.canManage);
  // Guests can message the people in their spaces (the app already knows them).
  const list = (me.canManage ? (directory.data ?? []) : [...people.values()])
    .filter((p) => p.id !== me.id && p.status !== 'removed' && matches(p, q))
    .sort((a, b) =>
      a.kind === b.kind ? a.name.localeCompare(b.name) : a.kind === 'team' ? -1 : 1,
    );

  const start = async (person: ChatPersonDto) => {
    try {
      const space = await api.post<ChatSpaceDto>('/dms', { userId: person.id });
      await qc.invalidateQueries({ queryKey: keys.bootstrap });
      onClose();
      setQ('');
      navigate(`/c/${space.id}`);
    } catch (error) {
      toast(errorMessage(error));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Message someone">
      <SearchBox value={q} onChange={setQ} placeholder="Search by name or email" />
      <div className="scrollbar-thin -mx-2 mt-3 max-h-[55dvh] overflow-y-auto">
        {me.canManage && directory.isLoading ? (
          <div className="flex justify-center p-6">
            <Spinner className="text-muted" />
          </div>
        ) : list.length ? (
          list.map((p) => <PersonRow key={p.id} person={p} onClick={() => void start(p)} />)
        ) : (
          <p className="px-3 py-6 text-center text-sm text-muted">No one found.</p>
        )}
      </div>
    </Dialog>
  );
}

/** Choose several people (teammates and existing guests). */
export function PeoplePicker({
  selected,
  onChange,
  exclude,
}: {
  selected: string[];
  onChange: (ids: string[]) => void;
  exclude: Set<string>;
}) {
  const [q, setQ] = useState('');
  const directory = usePeopleDirectory(true);
  const list = useMemo(
    () =>
      (directory.data ?? [])
        .filter((p) => !exclude.has(p.id) && matches(p, q))
        .sort((a, b) =>
          a.kind === b.kind ? a.name.localeCompare(b.name) : a.kind === 'team' ? -1 : 1,
        ),
    [directory.data, exclude, q],
  );
  const toggle = (id: string) =>
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  return (
    <div>
      <SearchBox value={q} onChange={setQ} placeholder="Search people" />
      <div className="scrollbar-thin -mx-2 mt-2 max-h-64 overflow-y-auto">
        {directory.isLoading ? (
          <div className="flex justify-center p-6">
            <Spinner className="text-muted" />
          </div>
        ) : list.length ? (
          list.map((p) => (
            <PersonRow
              key={p.id}
              person={p}
              selected={selected.includes(p.id)}
              onClick={() => toggle(p.id)}
            />
          ))
        ) : (
          <p className="px-3 py-4 text-center text-sm text-muted">No one else to add.</p>
        )}
      </div>
    </div>
  );
}

export function NewSpaceDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { me } = useChat();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const toast = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [discoverable, setDiscoverable] = useState(true);
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const exclude = useMemo(() => new Set([me.id]), [me.id]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const space = await api.post<ChatSpaceDto>('/spaces', {
        name,
        description,
        discoverable,
        memberIds,
      });
      await qc.invalidateQueries({ queryKey: keys.bootstrap });
      onClose();
      setName('');
      setDescription('');
      setMemberIds([]);
      navigate(`/c/${space.id}`);
    } catch (error) {
      toast(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Create a space">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Name">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={80}
            autoFocus
            placeholder="e.g. Brand Co — Meta ads"
          />
        </Field>
        <Field label="Description" hint="Optional. What this space is for.">
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
              Anyone at Muvance can find and join it in Browse spaces. Guests never can.
            </p>
          </div>
          <Switch checked={discoverable} onChange={setDiscoverable} label="The team can find it" />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">
            Add people{' '}
            <span className="font-normal text-muted">(you can invite clients after)</span>
          </p>
          <PeoplePicker selected={memberIds} onChange={setMemberIds} exclude={exclude} />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy || !name.trim()}>
            {busy ? <Spinner /> : 'Create'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

export function BrowseSpacesDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const toast = useToast();
  const [q, setQ] = useState('');
  const list = useQuery({
    queryKey: ['browse'],
    queryFn: () => api.get<ChatBrowseSpaceDto[]>('/spaces/browse'),
    enabled: open,
  });
  const shown = (list.data ?? []).filter((s) =>
    s.name.toLowerCase().includes(q.trim().toLowerCase()),
  );

  const join = async (id: string) => {
    try {
      await api.post(`/spaces/${id}/join`);
      await qc.invalidateQueries({ queryKey: keys.bootstrap });
      void qc.invalidateQueries({ queryKey: ['browse'] });
      onClose();
      navigate(`/c/${id}`);
    } catch (error) {
      toast(errorMessage(error));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Browse spaces">
      <SearchBox value={q} onChange={setQ} placeholder="Search spaces" />
      <div className="scrollbar-thin -mx-2 mt-3 max-h-[55dvh] overflow-y-auto">
        {list.isLoading ? (
          <div className="flex justify-center p-6">
            <Spinner className="text-muted" />
          </div>
        ) : shown.length ? (
          shown.map((s) => (
            <div key={s.id} className="flex items-center gap-3 rounded-xl px-2.5 py-2">
              <SpaceIcon name={s.name} className="size-9 text-sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{s.name}</p>
                <p className="flex items-center gap-1 truncate text-xs text-muted">
                  <Users className="size-3" /> {s.memberCount}
                  {s.description && ` · ${s.description}`}
                </p>
              </div>
              <Button variant="secondary" className="h-8" onClick={() => void join(s.id)}>
                Join
              </Button>
            </div>
          ))
        ) : (
          <p className="px-3 py-6 text-center text-sm text-muted">
            {list.data?.length ? 'No spaces match.' : "You're in every space the team can find."}
          </p>
        )}
      </div>
    </Dialog>
  );
}
