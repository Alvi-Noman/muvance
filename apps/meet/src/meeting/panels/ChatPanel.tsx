import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useChat } from '@livekit/components-react';
import { SendHorizontal } from 'lucide-react';
import { PanelShell } from './PanelShell';

/** Turns web addresses in a message into links. */
function linkify(text: string): ReactNode[] {
  const parts = text.split(/(https?:\/\/[^\s]+|www\.[^\s]+)/g);
  return parts.map((part, i) =>
    /^(https?:\/\/|www\.)/.test(part) ? (
      <a
        key={i}
        href={part.startsWith('www.') ? `https://${part}` : part}
        target="_blank"
        rel="noopener noreferrer"
        className="break-all text-sky-700 underline"
      >
        {part}
      </a>
    ) : (
      part
    ),
  );
}

export function ChatPanel() {
  const { chatMessages, send, isSending } = useChat();
  const [text, setText] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [chatMessages.length]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const message = text.trim();
    if (!message) return;
    setText('');
    try {
      await send(message);
    } catch {
      setText(message);
    }
  };

  return (
    <PanelShell title="In-call messages">
      <p className="mx-6 rounded-xl bg-neutral-100 px-4 py-3 text-xs text-neutral-600">
        Only people in the call can see messages, and they're deleted when the call ends.
      </p>
      <div ref={listRef} className="mt-3 min-h-0 flex-1 space-y-4 overflow-y-auto px-6 pb-4">
        {chatMessages.length === 0 && (
          <p className="pt-8 text-center text-sm text-neutral-500">No messages yet.</p>
        )}
        {chatMessages.map((m, i) => {
          const prev = chatMessages[i - 1];
          const sameSender =
            prev &&
            prev.from?.identity === m.from?.identity &&
            m.timestamp - prev.timestamp < 60_000;
          return (
            <div key={m.id} className={sameSender ? '-mt-3' : ''}>
              {!sameSender && (
                <p className="mb-1 text-sm">
                  <span className="font-medium">
                    {m.from?.isLocal ? 'You' : m.from?.name || 'Someone'}
                  </span>{' '}
                  <span className="text-xs text-neutral-500">
                    {new Date(m.timestamp).toLocaleTimeString([], {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                </p>
              )}
              <p className="text-sm break-words whitespace-pre-wrap text-neutral-800">
                {linkify(m.message)}
              </p>
            </div>
          );
        })}
      </div>
      <form
        onSubmit={submit}
        className="m-4 flex items-center gap-2 rounded-full bg-neutral-100 p-1.5 pl-5"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Send a message"
          maxLength={2000}
          autoFocus
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
        <button
          type="submit"
          disabled={!text.trim() || isSending}
          aria-label="Send message"
          className="inline-flex size-10 items-center justify-center rounded-full text-sky-700 transition hover:bg-sky-100 disabled:text-neutral-400 disabled:hover:bg-transparent"
        >
          <SendHorizontal className="size-5" />
        </button>
      </form>
    </PanelShell>
  );
}
