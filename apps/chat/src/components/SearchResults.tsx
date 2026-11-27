import { useDeferredValue } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, SearchX } from 'lucide-react';
import { useNavigate } from 'react-router';
import type { ChatSearchResultDto } from '@muvance/shared';
import { api, errorMessage } from '@/lib/api';
import { personOf, spaceTitle, useChat } from '@/lib/data';
import { plainText } from '@/lib/format';
import { shortDate } from '@/lib/utils';
import { Avatar, Spinner } from './ui';

function Highlight({ text, query }: { text: string; query: string }) {
  const i = text.toLowerCase().indexOf(query.toLowerCase());
  if (i < 0) return <>{text}</>;
  const start = Math.max(0, i - 60);
  return (
    <>
      {start > 0 && '…'}
      {text.slice(start, i)}
      <mark className="rounded bg-amber-100 px-0.5 text-ink">
        {text.slice(i, i + query.length)}
      </mark>
      {text.slice(i + query.length, i + query.length + 160)}
    </>
  );
}

export function SearchResults({ query, onOpen }: { query: string; onOpen: () => void }) {
  const { me, spaces, people } = useChat();
  const navigate = useNavigate();
  const q = useDeferredValue(query);
  const results = useQuery({
    queryKey: ['search', q],
    queryFn: () => api.get<ChatSearchResultDto>(`/search?q=${encodeURIComponent(q)}`),
    staleTime: 10_000,
  });
  const names = new Map([...people].map(([id, p]) => [id, p.name]));

  return (
    <div className="scrollbar-thin flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl p-4 sm:p-6">
        <h2 className="text-lg font-semibold">Results for “{q}”</h2>
        {results.isLoading ? (
          <div className="flex justify-center p-10">
            <Spinner className="size-5 text-muted" />
          </div>
        ) : results.error ? (
          <p className="mt-4 text-sm text-red-600">{errorMessage(results.error)}</p>
        ) : !results.data?.messages.length ? (
          <div className="flex flex-col items-center p-12 text-center text-muted">
            <SearchX className="size-8" />
            <p className="mt-3 text-sm">No messages or files match.</p>
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {results.data.messages.map((m) => {
              const space = spaces.find((s) => s.id === m.spaceId);
              const author = personOf(people, m.authorId);
              const text = plainText(m.text, names);
              const file = m.attachments.find((a) =>
                a.name.toLowerCase().includes(q.toLowerCase()),
              );
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onOpen();
                      navigate(`/c/${m.spaceId}${m.threadId ? `?thread=${m.threadId}` : ''}`);
                    }}
                    className="flex w-full gap-3 rounded-2xl border border-line p-3.5 text-left transition hover:border-neutral-300 hover:bg-canvas"
                  >
                    <Avatar person={author} className="size-9 text-sm" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline gap-2">
                        <span className="truncate text-sm font-semibold">{author.name}</span>
                        <span className="truncate text-xs text-muted">
                          {space ? spaceTitle(space, me.id, people) : ''}
                          {m.threadId && ' · in a thread'}
                        </span>
                        <span className="ml-auto shrink-0 text-xs text-muted">
                          {shortDate(m.createdAt)}
                        </span>
                      </span>
                      {text && (
                        <span className="mt-0.5 block text-sm text-[#3a3a38]">
                          <Highlight text={text} query={q} />
                        </span>
                      )}
                      {file && (
                        <span className="mt-1 flex items-center gap-1.5 text-sm text-accent">
                          <FileText className="size-4" /> {file.name}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
