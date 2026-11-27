import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Bell,
  BellOff,
  Globe,
  Images,
  Info,
  LogOut,
  MoreVertical,
  Pin,
  Upload,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import type { ChatMessageDto, ChatPersonDto, ChatSpaceDto } from '@muvance/shared';
import { api, errorMessage } from '@/lib/api';
import {
  dmPartner,
  flattenPages,
  hasGuests,
  patchSpace,
  personOf,
  spaceTitle,
  useChat,
  useMessages,
  usePins,
  useThread,
} from '@/lib/data';
import { plainText } from '@/lib/format';
import { describeFiles } from '@/lib/notify';
import { isWatching, useTyping, view } from '@/lib/live';
import { cn, dayLabel, firstName, sameDay } from '@/lib/utils';
import { Composer, type ComposerHandle } from './Composer';
import { MessageItem, scrollToMessage } from './Message';
import { SharedPanel, type PanelTab } from './SharedPanel';
import { SpaceIcon } from './Sidebar';
import { SpaceDialog } from './dialogs/SpaceDialog';
import { Avatar, Badge, IconButton, Menu, MenuItem, Spinner, useToast } from './ui';

const GROUP_MS = 5 * 60_000;

/** Whether a message continues the one before it (same person, a few minutes apart). */
function continues(prev: ChatMessageDto | undefined, m: ChatMessageDto) {
  return Boolean(
    prev &&
    !prev.deleted &&
    prev.authorId === m.authorId &&
    sameDay(prev.createdAt, m.createdAt) &&
    new Date(m.createdAt).getTime() - new Date(prev.createdAt).getTime() < GROUP_MS &&
    prev.replyCount === 0 &&
    prev.reactions.length === 0,
  );
}

function useMarkRead(space: ChatSpaceDto | undefined) {
  const qc = useQueryClient();
  const timer = useRef<number | undefined>(undefined);
  const id = space?.id;
  const needed = Boolean(space && space.unread > 0);
  const mark = useCallback(() => {
    if (!id) return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      if (!isWatching(id)) return;
      patchSpace(qc, id, (s) => ({ ...s, unread: 0, mentioned: false }));
      void api.put(`/spaces/${id}/read`).catch(() => {});
    }, 400);
  }, [id, qc]);

  useEffect(() => {
    mark();
    const onFocus = () => mark();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
      window.clearTimeout(timer.current);
    };
  }, [mark]);
  // Something new arrived while it's open.
  useEffect(() => {
    if (needed) mark();
  }, [needed, mark, space?.lastMessageAt]);
}

export function Conversation({ spaceId }: { spaceId: string }) {
  const { me, spaces, people } = useChat();
  const space = spaces.find((s) => s.id === spaceId);
  const [params, setParams] = useSearchParams();
  const threadId = params.get('thread');
  const composer = useRef<ComposerHandle>(null);
  const [dragging, setDragging] = useState(false);
  const [dialog, setDialog] = useState<'members' | 'settings' | null>(null);
  const [panel, setPanel] = useState<PanelTab | null>(null);
  const [quote, setQuote] = useState<ChatMessageDto | null>(null);
  const onQuote = useCallback((m: ChatMessageDto) => setQuote(m), []);

  useEffect(() => {
    view.spaceId = spaceId;
    return () => {
      view.spaceId = null;
    };
  }, [spaceId]);
  useEffect(() => {
    view.threadId = threadId;
  }, [threadId]);
  useMarkRead(space);

  const members = useMemo(
    () => (space?.members ?? []).map((m) => personOf(people, m.userId)),
    [space?.members, people],
  );

  if (!space) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <p className="font-medium">This conversation isn't available</p>
        <p className="mt-1 text-sm text-muted">It may have been deleted, or you were removed.</p>
        <Link to="/" className="mt-4 text-sm font-medium text-accent hover:underline">
          Back to your chats
        </Link>
      </div>
    );
  }

  const openThread = (id: string | null) => {
    if (id) setPanel(null);
    setParams(id ? { thread: id } : {}, { replace: Boolean(threadId) });
  };
  const side = threadId ? 'thread' : panel ? 'panel' : null;

  return (
    <div
      className="relative flex min-w-0 flex-1"
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes('Files')) {
          e.preventDefault();
          setDragging(true);
        }
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        composer.current?.addFiles([...e.dataTransfer.files]);
      }}
    >
      <section className={cn('flex min-w-0 flex-1 flex-col', side && 'max-lg:hidden')}>
        <Header
          space={space}
          onOpen={setDialog}
          panelOpen={Boolean(panel)}
          onPanel={() => {
            if (threadId) openThread(null);
            setPanel((p) => (p ? null : 'media'));
          }}
        />
        <PinnedBar space={space} onOpen={() => setPanel('pins')} />
        <MessageList
          space={space}
          onOpenThread={openThread}
          onQuote={onQuote}
          highlightThread={threadId}
        />
        <div className="shrink-0 px-3 pb-3 sm:px-5 sm:pb-4">
          <TypingLine spaceId={space.id} threadId={null} />
          <Composer
            ref={composer}
            key={space.id}
            spaceId={space.id}
            threadId={null}
            members={members}
            allowAll={space.kind === 'space'}
            quote={quote}
            onClearQuote={() => setQuote(null)}
            autoFocus={!window.matchMedia('(hover: none)').matches}
            placeholder={
              space.kind === 'dm'
                ? `Message ${dmPartner(space, me.id, people).name}`
                : `Message ${space.name}`
            }
          />
        </div>
      </section>

      {threadId && (
        <ThreadPanel
          key={threadId}
          space={space}
          rootId={threadId}
          members={members}
          onClose={() => openThread(null)}
        />
      )}
      {!threadId && panel && (
        <SharedPanel space={space} tab={panel} onTab={setPanel} onClose={() => setPanel(null)} />
      )}

      {dragging && (
        <div className="pointer-events-none absolute inset-2 z-30 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-accent bg-accent-soft/90 text-accent">
          <Upload className="size-8" />
          <p className="mt-2 font-medium">Drop files to share them</p>
        </div>
      )}

      <SpaceDialog space={space} tab={dialog} onTab={setDialog} onClose={() => setDialog(null)} />
    </div>
  );
}

/** The latest pinned message, at the top of the conversation (like Google Chat and WhatsApp). */
function PinnedBar({ space, onOpen }: { space: ChatSpaceDto; onOpen: () => void }) {
  const { people } = useChat();
  const { data } = usePins(space.id);
  const pins = data?.messages ?? [];
  const [index, setIndex] = useState(0);
  if (!pins.length) return null;
  const shown = pins[Math.min(index, pins.length - 1)]!;
  const names = new Map([...people].map(([id, p]) => [id, p.name]));
  return (
    <div className="flex h-12 shrink-0 items-center gap-3 border-b border-line bg-amber-50/60 px-4 sm:px-5">
      <Pin className="size-4 shrink-0 text-amber-700" />
      <button
        type="button"
        onClick={() => {
          scrollToMessage(shown.id);
          setIndex((i) => (i + 1) % pins.length);
        }}
        className="min-w-0 flex-1 text-left"
        title="Show this message"
      >
        <span className="block text-[11px] font-semibold text-amber-800">
          {pins.length > 1 ? `Pinned message ${index + 1} of ${pins.length}` : 'Pinned message'}
        </span>
        <span className="block truncate text-sm">
          <span className="font-medium">{personOf(people, shown.authorId).name}:</span>{' '}
          {plainText(shown.text, names) || describeFiles(shown)}
        </span>
      </button>
      <button
        type="button"
        onClick={onOpen}
        className="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100"
      >
        View all
      </button>
    </div>
  );
}

function Header({
  space,
  onOpen,
  panelOpen,
  onPanel,
}: {
  space: ChatSpaceDto;
  onOpen: (tab: 'members' | 'settings') => void;
  panelOpen: boolean;
  onPanel: () => void;
}) {
  const { me, people } = useChat();
  const qc = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();
  const partner = space.kind === 'dm' ? dmPartner(space, me.id, people) : null;
  const guests = hasGuests(space, people);
  const isManager =
    me.canManage && space.members.some((m) => m.userId === me.id && m.role === 'manager');

  const mute = async () => {
    const muted = !space.muted;
    patchSpace(qc, space.id, (s) => ({ ...s, muted }));
    try {
      await api.put(`/spaces/${space.id}/mute`, { muted });
      toast(muted ? 'Notifications are off for this conversation' : 'Notifications are on');
    } catch (error) {
      patchSpace(qc, space.id, (s) => ({ ...s, muted: !muted }));
      toast(errorMessage(error));
    }
  };

  const leave = async () => {
    if (!window.confirm(`Leave “${space.name}”?`)) return;
    try {
      await api.post(`/spaces/${space.id}/leave`);
      navigate('/');
    } catch (error) {
      toast(errorMessage(error));
    }
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-line px-3 sm:px-5">
      <Link
        to="/"
        className="-ml-1 inline-flex size-9 items-center justify-center rounded-full text-muted hover:bg-black/5 md:hidden"
        aria-label="Back"
      >
        <ArrowLeft className="size-5" />
      </Link>
      <button
        type="button"
        onClick={() => onOpen('members')}
        className="flex min-w-0 items-center gap-3 rounded-xl py-1 pr-2 text-left transition hover:bg-black/[0.03]"
      >
        {partner ? (
          <Avatar person={partner} presence className="size-9 text-sm" />
        ) : (
          <SpaceIcon name={space.name} className="size-9 text-sm" />
        )}
        <span className="min-w-0">
          <span className="flex items-center gap-2">
            <span className="truncate font-semibold">{spaceTitle(space, me.id, people)}</span>
            {partner?.kind === 'guest' && <Badge tone="guest">Guest</Badge>}
            {!partner && guests && (
              <span title="Clients (guests) are in this space">
                <Badge tone="guest">
                  <Globe className="mr-1 size-3" /> Guests
                </Badge>
              </span>
            )}
          </span>
          <span className="block truncate text-xs text-muted">
            {partner
              ? partner.customStatus
                ? `${partner.customStatus.emoji} ${partner.customStatus.text}`.trim()
                : partner.online && partner.dnd
                  ? 'Do not disturb'
                  : partner.online
                    ? 'Active now'
                    : partner.kind === 'guest'
                      ? [partner.company, partner.email].filter(Boolean).join(' · ')
                      : partner.email
              : `${space.members.length} ${space.members.length === 1 ? 'member' : 'members'}${space.description ? ` · ${space.description}` : ''}`}
          </span>
        </span>
      </button>
      <div className="ml-auto flex items-center gap-0.5">
        <IconButton label="Shared media, files and pins" onClick={onPanel} active={panelOpen}>
          <Images />
        </IconButton>
        {space.kind === 'space' && (
          <>
            {me.canManage && (
              <IconButton
                label="Add people"
                onClick={() => onOpen('members')}
                className="max-sm:hidden"
              >
                <UserPlus />
              </IconButton>
            )}
            <IconButton label="Members" onClick={() => onOpen('members')}>
              <Users />
            </IconButton>
          </>
        )}
        <IconButton
          label={space.muted ? 'Turn notifications on' : 'Mute notifications'}
          onClick={() => void mute()}
          active={space.muted}
        >
          {space.muted ? <BellOff /> : <Bell />}
        </IconButton>
        {space.kind === 'space' && (
          <Menu
            trigger={(_o, toggle) => (
              <IconButton label="More" onClick={toggle}>
                <MoreVertical />
              </IconButton>
            )}
          >
            {(close) => (
              <>
                <MenuItem
                  icon={<Info />}
                  onClick={() => {
                    close();
                    onOpen('settings');
                  }}
                >
                  {isManager ? 'Space settings' : 'About this space'}
                </MenuItem>
                <MenuItem
                  icon={<LogOut />}
                  danger
                  onClick={() => {
                    close();
                    void leave();
                  }}
                >
                  Leave space
                </MenuItem>
              </>
            )}
          </Menu>
        )}
      </div>
    </header>
  );
}

function TypingLine({ spaceId, threadId }: { spaceId: string; threadId: string | null }) {
  const { people } = useChat();
  const ids = useTyping(spaceId, threadId);
  const names = ids.map((id) => firstName(personOf(people, id).name));
  return (
    <p className="h-5 truncate px-2 text-xs text-muted" aria-live="polite">
      {names.length === 1
        ? `${names[0]} is typing…`
        : names.length === 2
          ? `${names[0]} and ${names[1]} are typing…`
          : names.length > 2
            ? 'Several people are typing…'
            : ''}
    </p>
  );
}

function MessageList({
  space,
  onOpenThread,
  onQuote,
  highlightThread,
}: {
  space: ChatSpaceDto;
  onOpenThread: (id: string) => void;
  onQuote: (m: ChatMessageDto) => void;
  highlightThread: string | null;
}) {
  const { me, people } = useChat();
  const query = useMessages(space.id);
  const messages = useMemo(() => flattenPages(query.data), [query.data]);
  const scroller = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const fromBottom = useRef(0);
  const firstId = useRef<string | null>(null);
  const lastId = useRef<string | null>(null);
  const placed = useRef(false);
  // Where "New" goes: what you'd read when you opened it.
  const [readAt] = useState(
    () => space.members.find((m) => m.userId === me.id)?.lastReadAt ?? null,
  );

  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;
  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    fromBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (el.scrollTop < 300 && hasNextPage && !isFetchingNextPage) void fetchNextPage();
  };

  const firstNew = useMemo(() => {
    if (!readAt) return null;
    return (
      messages.find((m) => m.authorId !== me.id && !m.deleted && m.createdAt > readAt)?.id ?? null
    );
  }, [messages, readAt, me.id]);

  // Keep the view steady: at the bottom for new messages, in place when older ones load.
  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el || !messages.length) return;
    const first = messages[0]!.id;
    const last = messages.at(-1)!;
    if (!placed.current) {
      placed.current = true;
      const divider = firstNew ? el.querySelector('[data-new-divider]') : null;
      if (divider instanceof HTMLElement) el.scrollTop = Math.max(0, divider.offsetTop - 80);
      else el.scrollTop = el.scrollHeight;
    } else if (first !== firstId.current && last.id === lastId.current) {
      el.scrollTop = el.scrollHeight - el.clientHeight - fromBottom.current;
    } else if (last.id !== lastId.current) {
      if (fromBottom.current < 160 || last.authorId === me.id) el.scrollTop = el.scrollHeight;
    }
    firstId.current = first;
    lastId.current = last.id;
    fromBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight;
  }, [messages, firstNew, me.id]);

  // Pictures loading change the height: stay at the bottom if that's where we were.
  useEffect(() => {
    const el = scroller.current;
    const inner = content.current;
    if (!el || !inner) return;
    const observer = new ResizeObserver(() => {
      if (fromBottom.current < 160) el.scrollTop = el.scrollHeight;
    });
    observer.observe(inner);
    return () => observer.disconnect();
  }, []);

  // Direct messages: "Seen" under your last message once they've read it.
  const partnerRead =
    space.kind === 'dm'
      ? (space.members.find((m) => m.userId !== me.id)?.lastReadAt ?? null)
      : null;
  const lastMine = [...messages].reverse().find((m) => m.authorId === me.id && !m.deleted);
  const seen = Boolean(partnerRead && lastMine && partnerRead >= lastMine.createdAt);

  return (
    <div
      ref={scroller}
      onScroll={onScroll}
      className="scrollbar-thin min-h-0 flex-1 overflow-y-auto"
    >
      <div ref={content} className="flex min-h-full flex-col justify-end pt-4 pb-2">
        {query.isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Spinner className="size-5 text-muted" />
          </div>
        ) : query.error ? (
          <p className="p-6 text-center text-sm text-red-600">{errorMessage(query.error)}</p>
        ) : (
          <>
            {isFetchingNextPage && (
              <div className="flex justify-center py-3">
                <Spinner className="size-4 text-muted" />
              </div>
            )}
            {!hasNextPage && <ConversationStart space={space} people={people} meId={me.id} />}
            {messages.map((m, i) => {
              const prev = messages[i - 1];
              const newDay = !prev || !sameDay(prev.createdAt, m.createdAt);
              return (
                <div key={m.id}>
                  {newDay && (
                    <div className="flex justify-center py-2">
                      <span className="rounded-full border border-line bg-white px-3 py-0.5 text-xs font-medium text-muted shadow-sm">
                        {dayLabel(m.createdAt)}
                      </span>
                    </div>
                  )}
                  {m.id === firstNew && (
                    <div data-new-divider className="flex items-center gap-3 px-5 py-1">
                      <span className="h-px flex-1 bg-red-300" />
                      <span className="text-xs font-semibold text-red-600">New</span>
                    </div>
                  )}
                  <MessageItem
                    message={m}
                    grouped={!newDay && m.id !== firstNew && continues(prev, m)}
                    space={space}
                    onOpenThread={onOpenThread}
                    onQuote={onQuote}
                    highlight={m.id === highlightThread}
                  />
                  {seen && m.id === lastMine?.id && (
                    <p className="px-5 text-right text-[11px] text-muted">Seen</p>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

function ConversationStart({
  space,
  people,
  meId,
}: {
  space: ChatSpaceDto;
  people: Map<string, ChatPersonDto>;
  meId: string;
}) {
  const partner = space.kind === 'dm' ? dmPartner(space, meId, people) : null;
  return (
    <div className="px-5 pt-6 pb-4">
      {partner ? (
        <Avatar person={partner} className="size-16 text-xl" />
      ) : (
        <SpaceIcon name={space.name} className="size-16 text-xl" />
      )}
      <h2 className="mt-3 text-xl font-semibold tracking-tight">
        {partner ? partner.name : space.name}
      </h2>
      <p className="mt-1 text-sm text-muted">
        {partner
          ? `This is the start of your conversation with ${partner.name}.`
          : `This is the start of “${space.name}”.${space.description ? ` ${space.description}` : ''}`}
      </p>
      {hasGuests(space, people) && (
        <p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
          <Globe className="size-4" /> Guests (clients) can see the messages and files here.
        </p>
      )}
    </div>
  );
}

function ThreadPanel({
  space,
  rootId,
  members,
  onClose,
}: {
  space: ChatSpaceDto;
  rootId: string;
  members: ChatPersonDto[];
  onClose: () => void;
}) {
  const { data, isLoading, error } = useThread(rootId);
  const scroller = useRef<HTMLDivElement>(null);
  const [quote, setQuote] = useState<ChatMessageDto | null>(null);
  const count = data?.replies.length ?? 0;

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [count]);

  return (
    <aside className="flex w-full min-w-0 flex-col border-line lg:w-[400px] lg:shrink-0 lg:border-l">
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-line px-4">
        <button
          type="button"
          onClick={onClose}
          className="-ml-1 inline-flex size-9 items-center justify-center rounded-full text-muted hover:bg-black/5 lg:hidden"
          aria-label="Back"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="min-w-0">
          <p className="font-semibold">Thread</p>
          <p className="truncate text-xs text-muted">
            {space.kind === 'space' ? space.name : 'Direct message'}
          </p>
        </div>
        <IconButton label="Close thread" onClick={onClose} className="ml-auto max-lg:hidden">
          <X />
        </IconButton>
      </header>
      <div ref={scroller} className="scrollbar-thin min-h-0 flex-1 overflow-y-auto pb-2">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Spinner className="size-5 text-muted" />
          </div>
        ) : error || !data ? (
          <p className="p-6 text-center text-sm text-red-600">{errorMessage(error)}</p>
        ) : (
          <>
            <MessageItem message={data.root} grouped={false} space={space} inThread />
            <div className="flex items-center gap-3 px-5 py-2">
              <span className="text-xs font-medium text-muted">
                {count ? `${count} ${count === 1 ? 'reply' : 'replies'}` : 'No replies yet'}
              </span>
              <span className="h-px flex-1 bg-line" />
            </div>
            {data.replies.map((m, i) => (
              <MessageItem
                key={m.id}
                message={m}
                grouped={continues(data.replies[i - 1], m)}
                space={space}
                onQuote={setQuote}
                inThread
              />
            ))}
          </>
        )}
      </div>
      {data && !data.root.deleted && (
        <div className="shrink-0 px-3 pb-3">
          <TypingLine spaceId={space.id} threadId={rootId} />
          <Composer
            spaceId={space.id}
            threadId={rootId}
            members={members}
            allowAll={false}
            quote={quote}
            onClearQuote={() => setQuote(null)}
            autoFocus
            placeholder="Reply in thread"
          />
        </div>
      )}
    </aside>
  );
}
