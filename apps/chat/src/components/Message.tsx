import { memo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Bookmark,
  BookmarkMinus,
  Copy,
  Forward,
  MailOpen,
  MessageSquareReply,
  MoreVertical,
  Pencil,
  Pin,
  PinOff,
  Quote,
  SmilePlus,
  Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import type { ChatMessageDto, ChatSpaceDto } from '@muvance/shared';
import { api, errorMessage } from '@/lib/api';
import { patchSpace, personOf, setSaved, upsertMessage, useChat } from '@/lib/data';
import { isEmojiOnly, plainText, QUICK_REACTIONS, renderMessage } from '@/lib/format';
import { toEditable, toStored } from '@/lib/mentions';
import { describeFiles } from '@/lib/notify';
import { cn, longDate, shortDate, timeOf } from '@/lib/utils';
import { EmojiPicker } from './EmojiPicker';
import { ForwardDialog } from './dialogs/ForwardDialog';
import { Attachments, LinkPreview } from './Media';
import { Avatar, Badge, Button, Menu, MenuItem, StatusEmoji, useToast } from './ui';

/** Jumps to a message in the conversation, if it's loaded, and flashes it. */
export function scrollToMessage(id: string) {
  const el = document.getElementById(`m-${id}`);
  if (!el) return false;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.classList.remove('animate-flash');
  void el.offsetWidth;
  el.classList.add('animate-flash');
  return true;
}

const isTouch = () => window.matchMedia('(hover: none)').matches;

interface Action {
  key: string;
  label: string;
  icon: ReactNode;
  run: () => void;
  danger?: boolean;
}

export const MessageItem = memo(function MessageItem({
  message,
  grouped,
  space,
  onOpenThread,
  onQuote,
  inThread,
  highlight,
}: {
  message: ChatMessageDto;
  /** Same author as the message before, shortly before: no name or picture again. */
  grouped: boolean;
  space: ChatSpaceDto;
  onOpenThread?: (id: string) => void;
  /** "Quote in reply": puts the message above the message box. */
  onQuote?: (message: ChatMessageDto) => void;
  inThread?: boolean;
  highlight?: boolean;
}) {
  const { me, people, savedIds } = useChat();
  const qc = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();
  const author = personOf(people, message.authorId);
  const mine = message.authorId === me.id;
  const saved = savedIds.has(message.id);
  const [editing, setEditing] = useState(false);
  const [picker, setPicker] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [forwarding, setForwarding] = useState(false);
  const press = useRef<number | undefined>(undefined);
  const manager =
    me.canManage &&
    space.kind === 'space' &&
    space.members.some((m) => m.userId === me.id && m.role === 'manager');

  const react = async (emoji: string) => {
    setPicker(false);
    setSheet(false);
    try {
      upsertMessage(
        qc,
        await api.put<ChatMessageDto>(`/messages/${message.id}/reactions`, { emoji }),
      );
    } catch (error) {
      toast(errorMessage(error));
    }
  };

  const remove = async () => {
    if (!window.confirm('Delete this message for everyone?')) return;
    try {
      await api.delete(`/messages/${message.id}`);
      upsertMessage(qc, {
        ...message,
        deleted: true,
        text: '',
        attachments: [],
        reactions: [],
        quote: null,
        pinned: null,
        linkPreview: null,
      });
      if (saved) setSaved(qc, message.id, false);
    } catch (error) {
      toast(errorMessage(error));
    }
  };

  const pin = async () => {
    try {
      const updated = await api.put<ChatMessageDto>(`/messages/${message.id}/pin`, {
        pinned: !message.pinned,
      });
      upsertMessage(qc, updated);
      toast(updated.pinned ? 'Pinned for everyone here' : 'Unpinned');
    } catch (error) {
      toast(errorMessage(error));
    }
  };

  const save = async () => {
    setSaved(qc, message.id, !saved);
    try {
      await api.put(`/messages/${message.id}/save`, { saved: !saved });
      toast(saved ? 'Removed from Saved' : 'Saved. Find it under Saved in the sidebar.');
    } catch (error) {
      setSaved(qc, message.id, saved);
      toast(errorMessage(error));
    }
  };

  const markUnread = async () => {
    try {
      const updated = await api.put<ChatSpaceDto>(`/spaces/${space.id}/unread`, {
        messageId: message.id,
      });
      // Leave, so opening it doesn't mark it read again at once.
      navigate('/');
      patchSpace(qc, space.id, () => updated);
      toast('Marked as unread');
    } catch (error) {
      toast(errorMessage(error));
    }
  };

  const actions: Action[] = [];
  if (!message.deleted) {
    if (onQuote) {
      actions.push({
        key: 'quote',
        label: 'Quote in reply',
        icon: <Quote />,
        run: () => onQuote(message),
      });
    }
    if (!inThread && !message.threadId && onOpenThread) {
      actions.push({
        key: 'thread',
        label: 'Reply in thread',
        icon: <MessageSquareReply />,
        run: () => onOpenThread(message.id),
      });
    }
    actions.push({
      key: 'forward',
      label: 'Forward',
      icon: <Forward />,
      run: () => setForwarding(true),
    });
    if (!message.threadId) {
      actions.push({
        key: 'pin',
        label: message.pinned ? 'Unpin' : 'Pin to this conversation',
        icon: message.pinned ? <PinOff /> : <Pin />,
        run: () => void pin(),
      });
    }
    actions.push({
      key: 'save',
      label: saved ? 'Remove from Saved' : 'Save for later',
      icon: saved ? <BookmarkMinus /> : <Bookmark />,
      run: () => void save(),
    });
    if (!mine && !message.threadId && !inThread) {
      actions.push({
        key: 'unread',
        label: 'Mark as unread',
        icon: <MailOpen />,
        run: () => void markUnread(),
      });
    }
    if (message.text) {
      actions.push({
        key: 'copy',
        label: 'Copy text',
        icon: <Copy />,
        run: () =>
          void navigator.clipboard
            .writeText(toEditable(message.text, people))
            .then(() => toast('Copied')),
      });
    }
    if (mine && message.text) {
      actions.push({ key: 'edit', label: 'Edit', icon: <Pencil />, run: () => setEditing(true) });
    }
    if (mine || manager) {
      actions.push({
        key: 'delete',
        label: 'Delete',
        icon: <Trash2 />,
        danger: true,
        run: () => void remove(),
      });
    }
  }

  const mention = (id: string) => {
    const isMe = id === me.id || id === 'all';
    return (
      <span
        className={cn(
          'rounded px-0.5 font-medium',
          isMe ? 'bg-amber-100 text-amber-900' : 'text-accent',
        )}
      >
        @{id === 'all' ? 'all' : personOf(people, id).name}
      </span>
    );
  };

  // Phones: hold a message for its actions.
  const touchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('a, button, audio, video, textarea')) return;
    window.clearTimeout(press.current);
    press.current = window.setTimeout(() => {
      navigator.vibrate?.(15);
      setSheet(true);
    }, 450);
  };
  const touchEnd = () => window.clearTimeout(press.current);

  if (message.deleted) {
    return (
      <div className={cn('flex gap-3 px-4 sm:px-5', grouped ? 'py-0.5' : 'pt-3 pb-0.5')}>
        <span className="w-9 shrink-0" />
        <p className="text-sm text-muted italic">This message was deleted.</p>
      </div>
    );
  }

  const names = new Map([...people].map(([id, p]) => [id, p.name]));

  return (
    <div
      id={`m-${message.id}`}
      className={cn(
        'group relative flex gap-3 px-4 transition-colors hover:bg-black/[0.02] sm:px-5 [@media(hover:none)]:select-none',
        grouped ? 'py-0.5' : 'pt-3 pb-0.5',
        message.pinned && !inThread && 'bg-amber-50/50',
        highlight && 'animate-flash',
      )}
      onTouchStart={touchStart}
      onTouchEnd={touchEnd}
      onTouchMove={touchEnd}
      onContextMenu={(e) => {
        if (isTouch()) {
          e.preventDefault();
          setSheet(true);
        }
      }}
    >
      <div className="w-9 shrink-0">
        {grouped ? (
          <span className="invisible block pt-1 text-right text-[10px] text-muted group-hover:visible">
            {timeOf(message.createdAt)}
          </span>
        ) : (
          <Avatar person={author} className="mt-0.5 size-9 text-sm" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        {!grouped && (
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-sm font-semibold">{author.name}</span>
            <StatusEmoji person={author} />
            {author.kind === 'guest' && (
              <Badge tone="guest">{author.company ? `Guest · ${author.company}` : 'Guest'}</Badge>
            )}
            <time className="text-xs text-muted" title={longDate(message.createdAt)}>
              {timeOf(message.createdAt)}
            </time>
          </div>
        )}

        {(message.pinned || message.forwarded || saved) && (
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted">
            {message.forwarded && (
              <span className="inline-flex items-center gap-1 italic">
                <Forward className="size-3.5" /> Forwarded
              </span>
            )}
            {message.pinned && !inThread && (
              <span className="inline-flex items-center gap-1 text-amber-700">
                <Pin className="size-3.5" /> Pinned by{' '}
                {message.pinned.byId === me.id ? 'you' : personOf(people, message.pinned.byId).name}
              </span>
            )}
            {saved && (
              <span className="inline-flex items-center gap-1 text-accent">
                <Bookmark className="size-3.5 fill-current" /> Saved
              </span>
            )}
          </div>
        )}

        {message.quote && (
          <button
            type="button"
            onClick={() => {
              if (!scrollToMessage(message.quote!.id)) toast('That message is further up.');
            }}
            className="mt-1 mb-0.5 block w-full max-w-md rounded-lg border-l-[3px] border-accent/60 bg-black/[0.035] px-3 py-1.5 text-left transition hover:bg-black/[0.06]"
          >
            <span className="block text-xs font-semibold text-accent">
              {personOf(people, message.quote.authorId).name}
            </span>
            <span className="line-clamp-2 text-sm text-ink/75">
              {plainText(message.quote.text, names) || message.quote.attachment || 'Message'}
            </span>
          </button>
        )}

        {editing ? (
          <EditBox
            message={message}
            onDone={(updated) => {
              if (updated) upsertMessage(qc, updated);
              setEditing(false);
            }}
          />
        ) : (
          message.text && (
            <div
              className={cn(
                'text-[15px] leading-relaxed break-words text-[#1f1f1d] [@media(hover:none)]:select-text',
                isEmojiOnly(message.text) && 'text-4xl leading-tight',
              )}
            >
              {renderMessage(message.text, mention)}
              {message.editedAt && (
                <span className="ml-1 text-xs text-muted" title={longDate(message.editedAt)}>
                  (edited)
                </span>
              )}
            </div>
          )
        )}

        {message.attachments.length > 0 && <Attachments files={message.attachments} mine={mine} />}

        {message.linkPreview && !editing && <LinkPreview preview={message.linkPreview} />}

        {message.reactions.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {message.reactions.map((r) => {
              const reacted = r.userIds.includes(me.id);
              const who = r.userIds.map((id) => (id === me.id ? 'You' : personOf(people, id).name));
              return (
                <button
                  key={r.emoji}
                  type="button"
                  onClick={() => void react(r.emoji)}
                  title={who.join(', ')}
                  className={cn(
                    'inline-flex h-7 items-center gap-1.5 rounded-full border px-2 text-sm transition',
                    reacted
                      ? 'border-accent/40 bg-accent-soft text-accent'
                      : 'border-line bg-white hover:border-neutral-300',
                  )}
                >
                  <span>{r.emoji}</span>
                  <span className="text-xs font-medium">{r.userIds.length}</span>
                </button>
              );
            })}
          </div>
        )}

        {!inThread && !message.threadId && message.replyCount > 0 && (
          <button
            type="button"
            onClick={() => onOpenThread?.(message.id)}
            className="mt-1.5 flex items-center gap-2 rounded-lg py-1 pr-2 text-sm transition hover:bg-black/[0.03]"
          >
            <span className="flex -space-x-1.5">
              {message.replierIds.map((id) => (
                <Avatar
                  key={id}
                  person={personOf(people, id)}
                  className="size-5 text-[9px] ring-2 ring-white"
                />
              ))}
            </span>
            <span className="font-medium text-accent">
              {message.replyCount} {message.replyCount === 1 ? 'reply' : 'replies'}
            </span>
            {message.lastReplyAt && (
              <span className="text-xs text-muted">
                Last reply {shortDate(message.lastReplyAt)}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Actions on hover (always reachable by keyboard). Phones hold the message instead. */}
      {!editing && (
        <div
          className={cn(
            'absolute -top-4 right-4 z-10 hidden items-center gap-0.5 rounded-xl border border-line bg-white p-0.5 shadow-sm group-focus-within:flex group-hover:flex [@media(hover:none)]:!hidden',
            picker && 'flex',
          )}
        >
          {QUICK_REACTIONS.slice(0, 3).map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => void react(e)}
              aria-label={`React with ${e}`}
              className="inline-flex size-8 items-center justify-center rounded-lg text-base transition hover:bg-black/5"
            >
              {e}
            </button>
          ))}
          <div className="relative">
            <ActionButton label="Add a reaction" onClick={() => setPicker((p) => !p)}>
              <SmilePlus />
            </ActionButton>
            {picker && !isTouch() && (
              <EmojiPicker
                onPick={(e) => void react(e)}
                onClose={() => setPicker(false)}
                className="absolute top-9 right-0"
              />
            )}
          </div>
          {onQuote && (
            <ActionButton label="Quote in reply" onClick={() => onQuote(message)}>
              <Quote />
            </ActionButton>
          )}
          {!inThread && !message.threadId && onOpenThread && (
            <ActionButton label="Reply in thread" onClick={() => onOpenThread(message.id)}>
              <MessageSquareReply />
            </ActionButton>
          )}
          <Menu
            trigger={(_o, toggle) => (
              <ActionButton label="More" onClick={toggle}>
                <MoreVertical />
              </ActionButton>
            )}
          >
            {(close) =>
              actions
                .filter((a) => a.key !== 'quote' && a.key !== 'thread')
                .map((a) => (
                  <MenuItem
                    key={a.key}
                    icon={a.icon}
                    danger={a.danger}
                    onClick={() => {
                      close();
                      a.run();
                    }}
                  >
                    {a.label}
                  </MenuItem>
                ))
            }
          </Menu>
        </div>
      )}

      {picker && isTouch() && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          onClick={() => setPicker(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <EmojiPicker onPick={(e) => void react(e)} onClose={() => setPicker(false)} />
          </div>
        </div>
      )}
      {sheet && (
        <ActionSheet
          onClose={() => setSheet(false)}
          onReact={(e) => void react(e)}
          onMoreReactions={() => {
            setSheet(false);
            setPicker(true);
          }}
          actions={actions}
          preview={plainText(message.text, names) || describeFiles(message)}
        />
      )}
      {forwarding && <ForwardDialog message={message} onClose={() => setForwarding(false)} />}
    </div>
  );
});

function ActionSheet({
  onClose,
  onReact,
  onMoreReactions,
  actions,
  preview,
}: {
  onClose: () => void;
  onReact: (emoji: string) => void;
  onMoreReactions: () => void;
  actions: Action[];
  preview: string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      role="dialog"
      aria-modal
      aria-label="Message actions"
    >
      <div className="absolute inset-0 bg-black/35" onClick={onClose} />
      <div className="animate-slide-in relative max-h-[85dvh] w-full overflow-y-auto rounded-t-3xl bg-white pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-2xl">
        <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-black/15" />
        {preview && <p className="line-clamp-2 px-5 pt-3 text-sm text-muted">{preview}</p>}
        <div className="flex items-center justify-between gap-1 px-4 py-3">
          {QUICK_REACTIONS.slice(0, 6).map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => onReact(e)}
              className="inline-flex size-11 items-center justify-center rounded-full bg-canvas text-2xl transition active:scale-90"
              aria-label={`React with ${e}`}
            >
              {e}
            </button>
          ))}
          <button
            type="button"
            onClick={onMoreReactions}
            className="inline-flex size-11 items-center justify-center rounded-full bg-canvas text-muted"
            aria-label="More reactions"
          >
            <SmilePlus className="size-5" />
          </button>
        </div>
        <div className="border-t border-line px-2 pt-1">
          {actions.map((a) => (
            <button
              key={a.key}
              type="button"
              onClick={() => {
                onClose();
                a.run();
              }}
              className={cn(
                'flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left text-[15px] active:bg-black/5 [&_svg]:size-5 [&_svg]:text-muted',
                a.danger && 'text-red-600 [&_svg]:text-red-500',
              )}
            >
              {a.icon}
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex size-8 items-center justify-center rounded-lg text-muted transition hover:bg-black/5 hover:text-ink [&_svg]:size-[18px]"
    >
      {children}
    </button>
  );
}

function EditBox({
  message,
  onDone,
}: {
  message: ChatMessageDto;
  onDone: (updated: ChatMessageDto | null) => void;
}) {
  const { people, spaces } = useChat();
  const toast = useToast();
  const [text, setText] = useState(() => toEditable(message.text, people));
  const [busy, setBusy] = useState(false);
  const space = spaces.find((s) => s.id === message.spaceId);

  const save = async () => {
    const members = (space?.members ?? []).map((m) => personOf(people, m.userId));
    const stored = toStored(text.trim(), members, space?.kind === 'space');
    if (!stored) return;
    if (stored === message.text) return onDone(null);
    setBusy(true);
    try {
      onDone(await api.patch<ChatMessageDto>(`/messages/${message.id}`, { text: stored }));
    } catch (error) {
      toast(errorMessage(error));
      setBusy(false);
    }
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') onDone(null);
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void save();
    }
  };

  return (
    <div className="mt-1 rounded-xl border border-line bg-white p-2 focus-within:border-ink">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKey}
        autoFocus
        rows={Math.min(8, text.split('\n').length + 1)}
        className="w-full resize-none bg-transparent px-1 text-[15px] leading-relaxed outline-none"
      />
      <div className="flex items-center justify-end gap-2">
        <span className="mr-auto text-xs text-muted max-sm:hidden">
          Enter to save · Esc to cancel
        </span>
        <Button variant="ghost" onClick={() => onDone(null)} className="h-8">
          Cancel
        </Button>
        <Button onClick={() => void save()} disabled={busy} className="h-8">
          Save
        </Button>
      </div>
    </div>
  );
}
