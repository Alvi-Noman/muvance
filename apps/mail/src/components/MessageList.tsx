import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Archive,
  Inbox,
  Mail,
  MailOpen,
  Menu,
  Paperclip,
  RefreshCw,
  Search,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import type { WebmailMessageSummary } from '@muvance/shared';
import { errorMessage } from '@/lib/api';
import { useFolders, useMessageActions, useMessages, useRefresh } from '@/lib/queries';
import { cn, displayName, shortDate } from '@/lib/utils';
import { useMail } from '@/pages/MailApp';
import { Avatar, IconButton, Spinner } from './ui';

export function MessageList() {
  const { folder, query, setQuery, selected, select, setSidebarOpen, setVisibleUids, toast } =
    useMail();
  const folders = useFolders();
  const current = folders.data?.find((f) => f.path === folder);
  const [search, setSearch] = useState(query);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const list = useMessages(folder, query);
  const refresh = useRefresh();
  const { flags, move, remove } = useMessageActions(folder);
  const bottom = useRef<HTMLDivElement>(null);

  const messages = useMemo(() => list.data?.pages.flatMap((p) => p.messages) ?? [], [list.data]);
  const total = list.data?.pages[0]?.total ?? 0;

  useEffect(() => setVisibleUids(messages.map((m) => m.uid)), [messages, setVisibleUids]);

  // Load older messages when the end of the list scrolls into view.
  useEffect(() => {
    const el = bottom.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting && list.hasNextPage && !list.isFetchingNextPage) {
        void list.fetchNextPage();
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [list]);

  // j / k move through the list.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea, [contenteditable="true"]') || e.metaKey || e.ctrlKey) {
        return;
      }
      if (e.key !== 'j' && e.key !== 'k') return;
      e.preventDefault();
      const uids = messages.map((m) => m.uid);
      const i = selected == null ? -1 : uids.indexOf(selected);
      const next = e.key === 'j' ? uids[i + 1] : uids[Math.max(0, i - 1)];
      if (next != null) select(next);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [messages, selected, select]);

  const role = current?.role;
  const title =
    role === 'junk' ? 'Spam' : (current?.name ?? (folder === 'INBOX' ? 'Inbox' : folder));
  const checkedUids = [...checked];
  const allChecked = messages.length > 0 && checked.size === messages.length;

  const bulk = async (run: () => Promise<unknown>, done: string) => {
    try {
      await run();
      setChecked(new Set());
      toast(done);
    } catch (error) {
      toast(errorMessage(error));
    }
  };

  return (
    <>
      <header className="border-b border-line px-3 pt-3 pb-2.5 sm:px-4">
        <div className="flex items-center gap-1.5">
          <IconButton label="Folders" className="md:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu />
          </IconButton>
          <h1 className="flex-1 truncate text-[17px] font-semibold tracking-tight">
            {query ? `Results for “${query}”` : title}
          </h1>
          <span className="text-xs text-muted tabular-nums">
            {total > 0 && `${total.toLocaleString()} ${total === 1 ? 'message' : 'messages'}`}
          </span>
          <IconButton label="Refresh" onClick={refresh} disabled={list.isFetching}>
            <RefreshCw
              className={cn(list.isFetching && !list.isFetchingNextPage && 'animate-spin')}
            />
          </IconButton>
        </div>
        <form
          className="mt-2.5"
          onSubmit={(e) => {
            e.preventDefault();
            setQuery(search.trim());
          }}
        >
          <label className="flex h-9 items-center gap-2 rounded-lg bg-canvas px-3 transition focus-within:bg-white focus-within:ring-1 focus-within:ring-line">
            <Search className="size-4 text-muted" />
            <input
              id="mail-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${title.toLowerCase()}`}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
            />
            {(search || query) && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setQuery('');
                }}
                className="text-muted hover:text-ink"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            )}
          </label>
        </form>
      </header>

      {checked.size > 0 && (
        <div className="flex items-center gap-1 border-b border-line bg-accent-soft/60 px-3 py-1.5 sm:px-4">
          <input
            type="checkbox"
            checked={allChecked}
            onChange={() =>
              setChecked(allChecked ? new Set() : new Set(messages.map((m) => m.uid)))
            }
            className="mr-2 size-4 accent-ink"
            aria-label="Select all"
          />
          <span className="flex-1 text-sm font-medium">{checked.size} selected</span>
          {role !== 'archive' && (
            <IconButton
              label="Archive"
              onClick={() =>
                bulk(() => move.mutateAsync({ uids: checkedUids, to: 'archive' }), 'Archived')
              }
            >
              <Archive />
            </IconButton>
          )}
          <IconButton
            label="Mark as read"
            onClick={() =>
              bulk(() => flags.mutateAsync({ uids: checkedUids, seen: true }), 'Marked as read')
            }
          >
            <MailOpen />
          </IconButton>
          <IconButton
            label="Mark as unread"
            onClick={() =>
              bulk(() => flags.mutateAsync({ uids: checkedUids, seen: false }), 'Marked as unread')
            }
          >
            <Mail />
          </IconButton>
          <IconButton
            label="Delete"
            onClick={() => bulk(() => remove.mutateAsync(checkedUids), 'Deleted')}
          >
            <Trash2 />
          </IconButton>
        </div>
      )}

      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">
        {list.isLoading ? (
          <ListSkeleton />
        ) : list.isError ? (
          <Empty
            title="Couldn't load your mail"
            text={errorMessage(list.error)}
            action={
              <button type="button" onClick={refresh} className="text-sm font-medium text-accent">
                Try again
              </button>
            }
          />
        ) : messages.length === 0 ? (
          <Empty
            title={
              query
                ? 'No messages found'
                : role === 'inbox'
                  ? "You're all caught up"
                  : 'Nothing here'
            }
            text={
              query ? 'Try other words, or search a different folder.' : 'New mail shows up here.'
            }
          />
        ) : (
          <ul>
            {messages.map((m) => (
              <Row
                key={m.uid}
                message={m}
                active={m.uid === selected}
                checked={checked.has(m.uid)}
                showRecipient={role === 'sent' || role === 'drafts'}
                onCheck={(on) =>
                  setChecked((set) => {
                    const next = new Set(set);
                    if (on) next.add(m.uid);
                    else next.delete(m.uid);
                    return next;
                  })
                }
                onOpen={() => select(m.uid)}
                onArchive={
                  role === 'archive'
                    ? undefined
                    : () =>
                        move.mutate(
                          { uids: [m.uid], to: 'archive' },
                          { onSuccess: () => toast('Archived') },
                        )
                }
                onDelete={() => remove.mutate([m.uid], { onSuccess: () => toast('Deleted') })}
                onToggleRead={() => flags.mutate({ uids: [m.uid], seen: !m.seen })}
                onToggleStar={() => flags.mutate({ uids: [m.uid], flagged: !m.flagged })}
              />
            ))}
          </ul>
        )}
        <div ref={bottom} className="flex h-12 items-center justify-center">
          {list.isFetchingNextPage && <Spinner className="text-muted" />}
        </div>
      </div>
    </>
  );
}

function Row({
  message: m,
  active,
  checked,
  showRecipient,
  onCheck,
  onOpen,
  onArchive,
  onDelete,
  onToggleRead,
  onToggleStar,
}: {
  message: WebmailMessageSummary;
  active: boolean;
  checked: boolean;
  showRecipient: boolean;
  onCheck: (on: boolean) => void;
  onOpen: () => void;
  onArchive?: () => void;
  onDelete: () => void;
  onToggleRead: () => void;
  onToggleStar: () => void;
}) {
  const who = showRecipient
    ? m.to.map((t) => displayName(t)).join(', ') || '(no recipient)'
    : displayName(m.from);
  const seed = (showRecipient ? m.to[0]?.address : m.from?.address) ?? who;
  return (
    <li
      className={cn(
        'group relative flex cursor-pointer gap-3 border-b border-line/70 px-3 py-3 transition sm:px-4',
        active ? 'bg-accent-soft' : checked ? 'bg-accent-soft/50' : 'hover:bg-[#fafaf9]',
      )}
      onClick={onOpen}
    >
      {!m.seen && (
        <span className="absolute top-1/2 left-1 size-1.5 -translate-y-1/2 rounded-full bg-accent" />
      )}
      <div className="relative mt-0.5 size-9 shrink-0" onClick={(e) => e.stopPropagation()}>
        <Avatar
          name={who}
          seed={seed}
          className={cn('size-9 transition', checked ? 'opacity-0' : 'group-hover:opacity-0')}
        />
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheck(e.target.checked)}
          aria-label="Select"
          className={cn(
            'absolute inset-0 m-auto size-4 accent-ink transition',
            checked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
          )}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span
            className={cn(
              'flex-1 truncate text-sm',
              m.seen ? 'text-[#3f3f3c]' : 'font-semibold text-ink',
            )}
          >
            {who}
          </span>
          <span
            className={cn(
              'shrink-0 text-xs tabular-nums group-hover:invisible',
              m.seen ? 'text-muted' : 'font-medium text-ink',
            )}
          >
            {shortDate(m.date)}
          </span>
        </div>
        <p
          className={cn(
            'truncate text-[13.5px]',
            m.seen ? 'text-[#3f3f3c]' : 'font-medium text-ink',
          )}
        >
          {m.subject || '(no subject)'}
        </p>
        <div className="flex items-center gap-1.5">
          <p className="flex-1 truncate text-[13px] text-muted">{m.snippet || ' '}</p>
          {m.hasAttachments && <Paperclip className="size-3.5 shrink-0 text-muted" />}
          {m.flagged && <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />}
        </div>
      </div>
      {/* Quick actions on hover (desktop) */}
      <div
        className="absolute top-2 right-2 hidden items-center gap-0.5 rounded-lg border border-line bg-white p-0.5 shadow-sm group-hover:flex"
        onClick={(e) => e.stopPropagation()}
      >
        {onArchive && (
          <IconButton label="Archive" onClick={onArchive} className="size-7">
            <Archive />
          </IconButton>
        )}
        <IconButton
          label={m.seen ? 'Mark as unread' : 'Mark as read'}
          onClick={onToggleRead}
          className="size-7"
        >
          {m.seen ? <Mail /> : <MailOpen />}
        </IconButton>
        <IconButton label={m.flagged ? 'Unstar' : 'Star'} onClick={onToggleStar} className="size-7">
          <Star className={cn(m.flagged && 'fill-amber-400 text-amber-400')} />
        </IconButton>
        <IconButton label="Delete" onClick={onDelete} className="size-7">
          <Trash2 />
        </IconButton>
      </div>
    </li>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="flex gap-3 border-b border-line/70 px-4 py-3.5">
          <div className="size-9 animate-pulse rounded-full bg-black/[0.05]" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 animate-pulse rounded bg-black/[0.06]" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-black/[0.05]" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-black/[0.04]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Empty({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center px-8 py-20 text-center">
      <span className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-canvas text-muted">
        <Inbox className="size-5" />
      </span>
      <p className="font-medium">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-muted">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
