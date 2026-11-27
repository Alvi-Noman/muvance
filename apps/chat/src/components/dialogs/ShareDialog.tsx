import { useMemo, useState } from 'react';
import { FileText, Search } from 'lucide-react';
import { useNavigate } from 'react-router';
import { dmPartner, spaceTitle, useChat } from '@/lib/data';
import { setPendingShare, type SharedItems } from '@/lib/share';
import { SpaceIcon } from '../Sidebar';
import { Avatar, Dialog } from '../ui';

/** "Share to Muvance Chat" from another app: pick the conversation to send it to. */
export function ShareDialog({ items, onClose }: { items: SharedItems; onClose: () => void }) {
  const { me, spaces, people } = useChat();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return spaces.filter((s) => !q || spaceTitle(s, me.id, people).toLowerCase().includes(q));
  }, [spaces, query, me.id, people]);

  const pick = (spaceId: string) => {
    setPendingShare({ ...items, spaceId });
    onClose();
    navigate(`/c/${spaceId}`);
  };

  return (
    <Dialog open onClose={onClose} title="Share to…">
      <div className="mb-3 flex flex-wrap gap-2">
        {items.files.slice(0, 4).map((f, i) => (
          <span
            key={i}
            className="inline-flex max-w-48 items-center gap-1.5 rounded-lg bg-canvas px-2 py-1 text-xs"
          >
            <FileText className="size-3.5 shrink-0 text-accent" />
            <span className="truncate">{f.name}</span>
          </span>
        ))}
        {items.files.length > 4 && (
          <span className="text-xs text-muted">+{items.files.length - 4} more</span>
        )}
        {items.text && !items.files.length && (
          <p className="line-clamp-2 text-sm text-muted">{items.text}</p>
        )}
      </div>
      <div className="flex h-10 items-center gap-2 rounded-xl border border-line px-3 focus-within:border-ink">
        <Search className="size-4 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search conversations"
          className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
      </div>
      <div className="scrollbar-thin -mx-2 mt-3 max-h-[50dvh] overflow-y-auto">
        {list.map((s) => {
          const partner = s.kind === 'dm' ? dmPartner(s, me.id, people) : null;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => pick(s.id)}
              className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-black/[0.03]"
            >
              {partner ? (
                <Avatar person={partner} className="size-9 text-sm" />
              ) : (
                <SpaceIcon name={s.name} className="size-9 text-sm" />
              )}
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {spaceTitle(s, me.id, people)}
              </span>
            </button>
          );
        })}
      </div>
    </Dialog>
  );
}
