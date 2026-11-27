import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Bookmark, BookmarkMinus } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import type { ChatMessageDto } from '@muvance/shared';
import { api, errorMessage } from '@/lib/api';
import { keys, personOf, setSaved, spaceTitle, useChat } from '@/lib/data';
import { plainText } from '@/lib/format';
import { describeFiles } from '@/lib/notify';
import { shortDate } from '@/lib/utils';
import { scrollToMessage } from './Message';
import { Avatar, IconButton, Spinner, useToast } from './ui';

/** Messages you saved for later, newest first. */
export function SavedView() {
  const { me, spaces, people } = useChat();
  const qc = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery({
    queryKey: keys.saved,
    queryFn: () => api.get<{ messages: ChatMessageDto[] }>('/saved'),
    staleTime: 10_000,
  });
  const names = new Map([...people].map(([id, p]) => [id, p.name]));

  const open = (m: ChatMessageDto) => {
    navigate(m.threadId ? `/c/${m.spaceId}?thread=${m.threadId}` : `/c/${m.spaceId}`);
    // Once the conversation has drawn, jump to the message if it's loaded.
    window.setTimeout(() => scrollToMessage(m.id), 600);
  };

  const unsave = async (m: ChatMessageDto) => {
    setSaved(qc, m.id, false);
    qc.setQueryData<{ messages: ChatMessageDto[] }>(keys.saved, (d) =>
      d ? { messages: d.messages.filter((x) => x.id !== m.id) } : d,
    );
    try {
      await api.put(`/messages/${m.id}/save`, { saved: false });
    } catch (e) {
      setSaved(qc, m.id, true);
      toast(errorMessage(e));
    }
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-line px-3 sm:px-5">
        <Link
          to="/"
          className="-ml-1 inline-flex size-9 items-center justify-center rounded-full text-muted hover:bg-black/5 md:hidden"
          aria-label="Back"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <span className="inline-flex size-9 items-center justify-center rounded-xl bg-accent-soft text-accent">
          <Bookmark className="size-5" />
        </span>
        <div>
          <p className="font-semibold">Saved</p>
          <p className="text-xs text-muted">Only you see what you save.</p>
        </div>
      </header>
      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center p-10">
            <Spinner className="size-5 text-muted" />
          </div>
        ) : error ? (
          <p className="p-6 text-center text-sm text-red-600">{errorMessage(error)}</p>
        ) : !data?.messages.length ? (
          <div className="flex flex-col items-center p-12 text-center">
            <Bookmark className="size-8 text-muted" />
            <p className="mt-3 font-medium">Nothing saved yet</p>
            <p className="mt-1 max-w-xs text-sm text-muted">
              Save a message from its menu (or hold it on your phone) to find it here later.
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl divide-y divide-line">
            {data.messages.map((m) => {
              const author = personOf(people, m.authorId);
              const space = spaces.find((s) => s.id === m.spaceId);
              return (
                <div key={m.id} className="group flex items-start gap-3 px-4 py-3 sm:px-6">
                  <button
                    type="button"
                    onClick={() => open(m)}
                    className="flex min-w-0 flex-1 items-start gap-3 text-left"
                  >
                    <Avatar person={author} className="size-9 text-sm" />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline gap-x-2">
                        <span className="text-sm font-semibold">{author.name}</span>
                        {space && (
                          <span className="text-xs text-muted">
                            in {spaceTitle(space, me.id, people)}
                          </span>
                        )}
                        <span className="text-xs text-muted">{shortDate(m.createdAt)}</span>
                      </span>
                      <span className="mt-0.5 line-clamp-3 block text-sm text-ink/85">
                        {plainText(m.text, names) || describeFiles(m)}
                      </span>
                    </span>
                  </button>
                  <IconButton label="Remove from Saved" onClick={() => void unsave(m)}>
                    <BookmarkMinus />
                  </IconButton>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
