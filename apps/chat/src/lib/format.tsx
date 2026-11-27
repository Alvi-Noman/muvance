import type { ReactNode } from 'react';

/**
 * Message formatting, like Google Chat: *bold*, _italic_, ~strikethrough~, `code`, ```code
 * blocks```, links, and @mentions (stored as <@id>). Rendered as React elements, never HTML.
 */

const INLINE =
  /(`[^`\n]+`)|(<@(?:[a-f\d]{24}|all)>)|(https?:\/\/[^\s<]+[^\s<.,:;"')\]!?])|(?<![\p{L}\p{N}*])\*(?!\s)([^*\n]+?)(?<!\s)\*(?![\p{L}\p{N}*])|(?<![\p{L}\p{N}_])_(?!\s)([^_\n]+?)(?<!\s)_(?![\p{L}\p{N}_])|(?<![\p{L}\p{N}~])~(?!\s)([^~\n]+?)(?<!\s)~(?![\p{L}\p{N}~])/gu;

export interface MentionRenderer {
  (id: string): ReactNode;
}

function inline(text: string, mention: MentionRenderer, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(INLINE)) {
    const at = m.index;
    if (at > last) out.push(text.slice(last, at));
    const k = `${key}-${i++}`;
    const [whole, code, tag, url, bold, italic, strike] = m;
    if (code) {
      out.push(
        <code key={k} className="rounded bg-black/[0.06] px-1 py-0.5 font-mono text-[0.88em]">
          {code.slice(1, -1)}
        </code>,
      );
    } else if (tag) {
      out.push(<span key={k}>{mention(tag.slice(2, -1))}</span>);
    } else if (url) {
      out.push(
        <a
          key={k}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all text-accent underline decoration-accent/30 underline-offset-2 hover:decoration-accent"
        >
          {url}
        </a>,
      );
    } else if (bold) {
      out.push(
        <strong key={k} className="font-semibold">
          {inline(bold, mention, k)}
        </strong>,
      );
    } else if (italic) {
      out.push(<em key={k}>{inline(italic, mention, k)}</em>);
    } else if (strike) {
      out.push(<s key={k}>{inline(strike, mention, k)}</s>);
    } else {
      out.push(whole);
    }
    last = at + whole.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function renderMessage(text: string, mention: MentionRenderer): ReactNode {
  const parts = text.split(/```(?:[a-z]*\n)?([\s\S]*?)```/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <pre
        key={i}
        className="scrollbar-thin my-1 overflow-x-auto rounded-lg border border-line bg-canvas px-3 py-2 font-mono text-[13px] leading-relaxed whitespace-pre"
      >
        {part.replace(/\n$/, '')}
      </pre>
    ) : (
      <span key={i} className="whitespace-pre-wrap">
        {inline(part, mention, String(i))}
      </span>
    ),
  );
}

/** Just a few emoji and nothing else: shown large. */
export function isEmojiOnly(text: string) {
  const t = text.trim();
  if (!t || t.length > 24) return false;
  return (
    /^(?:\p{Extended_Pictographic}|\p{Emoji_Component}|‍|️|\s)+$/u.test(t) && !/^[\d#*\s]+$/.test(t)
  );
}

/** Text without formatting, for previews and notifications. */
export function plainText(text: string, names: Map<string, string>) {
  return (
    text
      .replace(/<@all>/g, '@all')
      .replace(/<@([a-f\d]{24})>/g, (_m, id: string) => `@${names.get(id) ?? 'someone'}`)
      .replace(/```(?:[a-z]*\n)?/g, '')
      // *bold*, _italic_, ~strike~ and `code` read as plain words in previews.
      .replace(/(^|[\s(])([*_~`])(\S(?:[^\n]*?\S)?)\2(?=$|[\s.,!?:;)])/g, '$1$3')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

export const QUICK_REACTIONS = ['👍', '❤️', '😂', '🎉', '🙏', '👀', '✅', '🔥'];

export const EMOJI_GROUPS: { name: string; emoji: string[] }[] = [
  {
    name: 'Smileys',
    emoji: [
      '😀',
      '😃',
      '😄',
      '😁',
      '😆',
      '😅',
      '🤣',
      '😂',
      '🙂',
      '😉',
      '😊',
      '😇',
      '🥰',
      '😍',
      '🤩',
      '😘',
      '😋',
      '😛',
      '😜',
      '🤪',
      '🤗',
      '🤭',
      '🤫',
      '🤔',
      '🤐',
      '🤨',
      '😐',
      '😑',
      '😶',
      '😏',
      '😒',
      '🙄',
      '😬',
      '😌',
      '😔',
      '😪',
      '😴',
      '😷',
      '🤒',
      '🤯',
      '🥳',
      '😎',
      '🤓',
      '🧐',
      '😕',
      '😟',
      '🙁',
      '😮',
      '😲',
      '😳',
      '🥺',
      '😢',
      '😭',
      '😱',
      '😤',
      '😡',
      '🤬',
      '😈',
      '💀',
      '🤡',
    ],
  },
  {
    name: 'Gestures',
    emoji: [
      '👍',
      '👎',
      '👌',
      '✌️',
      '🤞',
      '🤟',
      '🤙',
      '👈',
      '👉',
      '👆',
      '👇',
      '☝️',
      '✋',
      '👋',
      '👏',
      '🙌',
      '👐',
      '🤝',
      '🙏',
      '💪',
      '✍️',
      '🫡',
      '🫶',
      '👀',
      '🧠',
    ],
  },
  {
    name: 'Symbols',
    emoji: [
      '❤️',
      '🧡',
      '💛',
      '💚',
      '💙',
      '💜',
      '🖤',
      '🤍',
      '💔',
      '💯',
      '✅',
      '☑️',
      '✔️',
      '❌',
      '⚠️',
      '❗',
      '❓',
      '💡',
      '🔥',
      '✨',
      '⭐',
      '🌟',
      '⚡',
      '💥',
      '🎯',
      '📌',
      '📍',
      '🔔',
      '⏰',
      '⏳',
    ],
  },
  {
    name: 'Work',
    emoji: [
      '🎉',
      '🎊',
      '🏆',
      '🥇',
      '🚀',
      '📈',
      '📉',
      '📊',
      '💰',
      '💵',
      '💳',
      '🧾',
      '📦',
      '🛒',
      '🏷️',
      '📣',
      '📢',
      '📝',
      '📄',
      '📎',
      '🗂️',
      '📅',
      '🗓️',
      '💼',
      '💻',
      '📱',
      '📷',
      '🎥',
      '🎬',
      '☕',
    ],
  },
];
