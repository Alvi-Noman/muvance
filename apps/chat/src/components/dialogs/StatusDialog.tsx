import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { ChatMeDto } from '@muvance/shared';
import { api, errorMessage } from '@/lib/api';
import { patchBootstrap, patchPerson, useChat } from '@/lib/data';
import { cn } from '@/lib/utils';
import { EmojiPicker } from '../EmojiPicker';
import { Button, Dialog, useToast } from '../ui';

type Clear = 'never' | '30m' | '1h' | '4h' | 'today' | 'week';

const PRESETS: { emoji: string; text: string; clear: Clear }[] = [
  { emoji: '📅', text: 'In a meeting', clear: '1h' },
  { emoji: '🎯', text: 'Focusing', clear: '4h' },
  { emoji: '🚗', text: 'Commuting', clear: '30m' },
  { emoji: '🤒', text: 'Out sick', clear: 'today' },
  { emoji: '🌴', text: 'On holiday', clear: 'never' },
  { emoji: '🏠', text: 'Working remotely', clear: 'today' },
];

const CLEAR_LABELS: [Clear, string][] = [
  ['never', "Don't clear"],
  ['30m', '30 minutes'],
  ['1h', '1 hour'],
  ['4h', '4 hours'],
  ['today', 'Today'],
  ['week', 'This week'],
];

function clearAt(clear: Clear): string | null {
  const now = new Date();
  switch (clear) {
    case '30m':
      return new Date(now.getTime() + 30 * 60_000).toISOString();
    case '1h':
      return new Date(now.getTime() + 60 * 60_000).toISOString();
    case '4h':
      return new Date(now.getTime() + 4 * 60 * 60_000).toISOString();
    case 'today': {
      const end = new Date(now);
      end.setHours(23, 59, 59, 0);
      return end.toISOString();
    }
    case 'week': {
      const end = new Date(now);
      end.setDate(end.getDate() + ((7 - end.getDay()) % 7));
      end.setHours(23, 59, 59, 0);
      return end.toISOString();
    }
    default:
      return null;
  }
}

/** "What are you up to?": an emoji and a few words that others see next to your name. */
export function StatusDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { me } = useChat();
  const qc = useQueryClient();
  const toast = useToast();
  const [emoji, setEmoji] = useState(me.customStatus?.emoji ?? '💬');
  const [text, setText] = useState(me.customStatus?.text ?? '');
  const [clear, setClear] = useState<Clear>('today');
  const [picker, setPicker] = useState(false);
  const [busy, setBusy] = useState(false);

  const save = async (value: { emoji: string; text: string; clearAt: string | null }) => {
    setBusy(true);
    try {
      const updated = await api.put<ChatMeDto>('/me/status', value);
      patchPerson(qc, updated);
      patchBootstrap(qc, (d) => ({ ...d, me: updated }));
      onClose();
    } catch (error) {
      toast(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Set a status">
      <div className="relative flex h-11 items-center gap-2 rounded-xl border border-line pr-3 focus-within:border-ink">
        <button
          type="button"
          onClick={() => setPicker((p) => !p)}
          className="ml-1 inline-flex size-9 items-center justify-center rounded-lg text-xl hover:bg-black/5"
          aria-label="Choose an emoji"
        >
          {emoji}
        </button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={100}
          autoFocus
          placeholder="What's your status?"
          className="h-full min-w-0 flex-1 bg-transparent text-[15px] outline-none"
        />
        {picker && (
          <EmojiPicker
            onPick={(e) => {
              setEmoji(e);
              setPicker(false);
            }}
            onClose={() => setPicker(false)}
            className="absolute top-12 left-0 z-10"
          />
        )}
      </div>

      <div className="mt-4 space-y-0.5">
        {PRESETS.map((p) => (
          <button
            key={p.text}
            type="button"
            onClick={() => {
              setEmoji(p.emoji);
              setText(p.text);
              setClear(p.clear);
            }}
            className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm hover:bg-black/[0.04]"
          >
            <span className="text-lg">{p.emoji}</span>
            <span className="flex-1 font-medium">{p.text}</span>
            <span className="text-xs text-muted">
              {CLEAR_LABELS.find(([c]) => c === p.clear)![1]}
            </span>
          </button>
        ))}
      </div>

      <p className="mt-4 text-sm font-medium">Clear after</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {CLEAR_LABELS.map(([c, label]) => (
          <button
            key={c}
            type="button"
            onClick={() => setClear(c)}
            className={cn(
              'h-8 rounded-full border px-3 text-sm transition',
              clear === c
                ? 'border-accent bg-accent-soft text-accent'
                : 'border-line hover:bg-black/[0.03]',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-end gap-2">
        {me.customStatus && (
          <Button
            variant="ghost"
            className="mr-auto text-red-600"
            disabled={busy}
            onClick={() => void save({ emoji: '', text: '', clearAt: null })}
          >
            Clear status
          </Button>
        )}
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="accent"
          disabled={busy || !text.trim()}
          onClick={() => void save({ emoji, text: text.trim(), clearAt: clearAt(clear) })}
        >
          Save
        </Button>
      </div>
    </Dialog>
  );
}
