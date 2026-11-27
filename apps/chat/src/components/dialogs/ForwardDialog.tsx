import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Check, Search } from 'lucide-react';
import type { ChatMessageDto } from '@muvance/shared';
import { api, errorMessage } from '@/lib/api';
import { dmPartner, hasGuests, keys, spaceTitle, upsertMessage, useChat } from '@/lib/data';
import { cn } from '@/lib/utils';
import { SpaceIcon } from '../Sidebar';
import { Avatar, Button, Dialog, useToast } from '../ui';

const MAX = 10;

/** Pick up to ten conversations to send a copy of a message to. */
export function ForwardDialog({
  message,
  onClose,
}: {
  message: ChatMessageDto;
  onClose: () => void;
}) {
  const { me, spaces, people } = useChat();
  const qc = useQueryClient();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return spaces.filter((s) => !q || spaceTitle(s, me.id, people).toLowerCase().includes(q));
  }, [spaces, query, me.id, people]);

  const toggle = (id: string) =>
    setPicked((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : p.length >= MAX ? p : [...p, id],
    );

  const send = async () => {
    setBusy(true);
    try {
      const res = await api.post<{ messages: ChatMessageDto[] }>(
        `/messages/${message.id}/forward`,
        { spaceIds: picked },
      );
      for (const m of res.messages) upsertMessage(qc, m);
      void qc.invalidateQueries({ queryKey: keys.bootstrap });
      toast(picked.length === 1 ? 'Forwarded' : `Forwarded to ${picked.length} conversations`);
      onClose();
    } catch (error) {
      toast(errorMessage(error));
      setBusy(false);
    }
  };

  // Guests could see what's forwarded to a space they're in.
  const toGuests = picked.some((id) => {
    const s = spaces.find((x) => x.id === id);
    return s && hasGuests(s, people);
  });

  return (
    <Dialog open onClose={onClose} title="Forward message">
      <div className="flex h-10 items-center gap-2 rounded-xl border border-line px-3 focus-within:border-ink">
        <Search className="size-4 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          placeholder="Search conversations"
          className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
      </div>
      <div className="scrollbar-thin -mx-2 mt-3 max-h-[46dvh] overflow-y-auto">
        {list.map((s) => {
          const on = picked.includes(s.id);
          const partner = s.kind === 'dm' ? dmPartner(s, me.id, people) : null;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => toggle(s.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition',
                on ? 'bg-accent-soft' : 'hover:bg-black/[0.03]',
              )}
            >
              {partner ? (
                <Avatar person={partner} className="size-9 text-sm" />
              ) : (
                <SpaceIcon name={s.name} className="size-9 text-sm" />
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  {spaceTitle(s, me.id, people)}
                </span>
                <span className="block text-xs text-muted">
                  {partner
                    ? partner.kind === 'guest'
                      ? 'Guest'
                      : 'Direct message'
                    : `${s.members.length} members${hasGuests(s, people) ? ' · includes guests' : ''}`}
                </span>
              </span>
              <span
                className={cn(
                  'inline-flex size-5 items-center justify-center rounded-full border',
                  on ? 'border-accent bg-accent text-white' : 'border-neutral-300',
                )}
              >
                {on && <Check className="size-3.5" />}
              </span>
            </button>
          );
        })}
        {!list.length && (
          <p className="p-4 text-center text-sm text-muted">No conversations found.</p>
        )}
      </div>
      {toGuests && (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Guests (clients) will see this in the conversations you picked.
        </p>
      )}
      <div className="mt-4 flex items-center justify-end gap-2">
        <span className="mr-auto text-xs text-muted">
          {picked.length ? `${picked.length} selected` : `Pick up to ${MAX}`}
        </span>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="accent" onClick={() => void send()} disabled={!picked.length || busy}>
          Forward
        </Button>
      </div>
    </Dialog>
  );
}
