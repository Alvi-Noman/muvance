import { useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  ExternalLink,
  Image as ImageIcon,
  Link2,
  Paperclip,
  Pin,
  Play,
  X,
} from 'lucide-react';
import type {
  ChatAttachmentDto,
  ChatMessagePage,
  ChatSharedKind,
  ChatSpaceDto,
} from '@muvance/shared';
import { api, errorMessage, fileUrl } from '@/lib/api';
import { keys, personOf, usePins, useChat } from '@/lib/data';
import { plainText } from '@/lib/format';
import { duration, isImage, isVideo } from '@/lib/media';
import { describeFiles } from '@/lib/notify';
import { cn, shortDate } from '@/lib/utils';
import { FileCard, Lightbox } from './Media';
import { scrollToMessage } from './Message';
import { Avatar, IconButton, Spinner, useToast } from './ui';

export type PanelTab = ChatSharedKind | 'pins';

const TABS: { id: PanelTab; label: string; icon: React.ReactNode }[] = [
  { id: 'media', label: 'Media', icon: <ImageIcon /> },
  { id: 'files', label: 'Files', icon: <Paperclip /> },
  { id: 'links', label: 'Links', icon: <Link2 /> },
  { id: 'pins', label: 'Pinned', icon: <Pin /> },
];

function useShared(spaceId: string, kind: ChatSharedKind) {
  return useInfiniteQuery({
    queryKey: keys.shared(spaceId, kind),
    queryFn: ({ pageParam }) =>
      api.get<ChatMessagePage>(
        `/spaces/${spaceId}/shared?kind=${kind}${pageParam ? `&before=${pageParam}` : ''}`,
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => (last.hasMore ? (last.messages.at(-1)?.id ?? null) : null),
    staleTime: 15_000,
  });
}

/** Everything shared in a conversation, and its pinned messages. */
export function SharedPanel({
  space,
  tab,
  onTab,
  onClose,
}: {
  space: ChatSpaceDto;
  tab: PanelTab;
  onTab: (tab: PanelTab) => void;
  onClose: () => void;
}) {
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
        <p className="font-semibold">Shared in this conversation</p>
        <IconButton label="Close" onClick={onClose} className="ml-auto max-lg:hidden">
          <X />
        </IconButton>
      </header>
      <nav className="flex shrink-0 gap-1 border-b border-line px-3 py-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onTab(t.id)}
            className={cn(
              'inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full text-sm font-medium transition [&_svg]:size-4',
              tab === t.id ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-black/[0.04]',
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </nav>
      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">
        {tab === 'pins' ? (
          <Pins space={space} onClose={onClose} />
        ) : (
          <SharedList key={tab} space={space} kind={tab} />
        )}
      </div>
    </aside>
  );
}

function SharedList({ space, kind }: { space: ChatSpaceDto; kind: ChatSharedKind }) {
  const query = useShared(space.id, kind);
  const messages = useMemo(() => query.data?.pages.flatMap((p) => p.messages) ?? [], [query.data]);
  const [viewing, setViewing] = useState<number | null>(null);

  if (query.isLoading) {
    return (
      <div className="flex justify-center p-10">
        <Spinner className="size-5 text-muted" />
      </div>
    );
  }
  if (query.error) {
    return <p className="p-6 text-center text-sm text-red-600">{errorMessage(query.error)}</p>;
  }
  if (!messages.length) {
    return (
      <p className="p-10 text-center text-sm text-muted">
        {kind === 'media'
          ? 'Photos and videos shared here will appear here.'
          : kind === 'files'
            ? 'Files shared here will appear here.'
            : 'Links shared here will appear here.'}
      </p>
    );
  }

  const more = query.hasNextPage && (
    <div className="flex justify-center p-3">
      <button
        type="button"
        onClick={() => void query.fetchNextPage()}
        disabled={query.isFetchingNextPage}
        className="text-sm font-medium text-accent hover:underline"
      >
        {query.isFetchingNextPage ? 'Loading…' : 'Show more'}
      </button>
    </div>
  );

  if (kind === 'media') {
    const items: ChatAttachmentDto[] = messages.flatMap((m) =>
      m.attachments.filter((a) => isImage(a) || isVideo(a)),
    );
    return (
      <>
        <div className="grid grid-cols-3 gap-0.5 p-0.5">
          {items.map((f, i) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setViewing(i)}
              className="relative aspect-square overflow-hidden bg-neutral-200"
              aria-label={f.name}
            >
              {isVideo(f) ? (
                <>
                  <video
                    src={`${fileUrl(f.id)}#t=0.1`}
                    preload="metadata"
                    muted
                    className="size-full object-cover"
                  />
                  <span className="absolute bottom-1 left-1 inline-flex items-center gap-1 rounded bg-black/60 px-1 text-[10px] font-medium text-white">
                    <Play className="size-2.5 fill-current" />
                    {f.durationMs ? duration(f.durationMs) : ''}
                  </span>
                </>
              ) : (
                <img
                  src={fileUrl(f.id)}
                  alt=""
                  loading="lazy"
                  className="size-full object-cover transition hover:opacity-90"
                />
              )}
            </button>
          ))}
        </div>
        {more}
        {viewing !== null && (
          <Lightbox items={items} start={viewing} onClose={() => setViewing(null)} />
        )}
      </>
    );
  }

  if (kind === 'files') {
    return (
      <div className="space-y-2 p-3">
        {messages.flatMap((m) =>
          m.attachments
            .filter((a) => !isImage(a) && !isVideo(a) && !a.voice)
            .map((a) => (
              <div key={a.id}>
                <FileCard file={a} />
                <Sender message={m} />
              </div>
            )),
        )}
        {more}
      </div>
    );
  }

  return (
    <div className="divide-y divide-line">
      {messages.flatMap((m) =>
        linksIn(m.text).map((url) => {
          const preview = m.linkPreview?.url === url ? m.linkPreview : null;
          return (
            <a
              key={`${m.id}-${url}`}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 p-3 transition hover:bg-black/[0.02]"
            >
              {preview?.image ? (
                <img
                  src={preview.image}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="size-12 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <Link2 className="size-5" />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="line-clamp-1 text-sm font-medium">
                  {preview?.title ?? new URL(url).hostname}
                </span>
                <span className="line-clamp-1 text-xs break-all text-accent">{url}</span>
                <Sender message={m} />
              </span>
              <ExternalLink className="mt-1 size-4 shrink-0 text-muted" />
            </a>
          );
        }),
      )}
      {more}
    </div>
  );
}

function linksIn(text: string) {
  const found = new Set<string>();
  for (const [url] of text.matchAll(/\bhttps?:\/\/[^\s<>"']+/gi)) {
    const clean = url.replace(/[).,!?;:'"\]]+$/, '');
    try {
      new URL(clean);
      found.add(clean);
    } catch {
      // Not a link after all.
    }
  }
  return [...found];
}

function Sender({ message }: { message: { authorId: string; createdAt: string } }) {
  const { people } = useChat();
  return (
    <span className="mt-1 block text-[11px] text-muted">
      {personOf(people, message.authorId).name} · {shortDate(message.createdAt)}
    </span>
  );
}

function Pins({ space, onClose }: { space: ChatSpaceDto; onClose: () => void }) {
  const { people } = useChat();
  const toast = useToast();
  const { data, isLoading, error } = usePins(space.id);
  const names = new Map([...people].map(([id, p]) => [id, p.name]));
  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <Spinner className="size-5 text-muted" />
      </div>
    );
  }
  if (error) return <p className="p-6 text-center text-sm text-red-600">{errorMessage(error)}</p>;
  if (!data?.messages.length) {
    return (
      <div className="p-10 text-center text-sm text-muted">
        <Pin className="mx-auto mb-2 size-6" />
        Nothing pinned yet. Pin important messages (from a message's menu) to keep them here for
        everyone.
      </div>
    );
  }
  return (
    <div className="divide-y divide-line">
      {data.messages.map((m) => {
        const author = personOf(people, m.authorId);
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => {
              if (window.matchMedia('(max-width: 1023px)').matches) onClose();
              requestAnimationFrame(() => {
                if (!scrollToMessage(m.id)) toast('Scroll up to load older messages to see it.');
              });
            }}
            className="flex w-full items-start gap-3 p-3 text-left transition hover:bg-black/[0.02]"
          >
            <Avatar person={author} className="size-8 text-xs" />
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline gap-2">
                <span className="truncate text-sm font-semibold">{author.name}</span>
                <span className="text-xs text-muted">{shortDate(m.createdAt)}</span>
              </span>
              <span className="line-clamp-3 text-sm text-ink/80">
                {plainText(m.text, names) || describeFiles(m)}
              </span>
              {m.pinned && (
                <span className="mt-1 block text-[11px] text-amber-700">
                  Pinned by {personOf(people, m.pinned.byId).name}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
