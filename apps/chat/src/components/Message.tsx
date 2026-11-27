import { memo, useState, type KeyboardEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Copy,
  Download,
  FileText,
  MessageSquareReply,
  MoreVertical,
  Pencil,
  SmilePlus,
  Trash2,
  X,
} from 'lucide-react';
import type { ChatAttachmentDto, ChatMessageDto, ChatSpaceDto } from '@muvance/shared';
import { api, errorMessage, fileUrl } from '@/lib/api';
import { personOf, upsertMessage, useChat } from '@/lib/data';
import { isEmojiOnly, QUICK_REACTIONS, renderMessage } from '@/lib/format';
import { toEditable, toStored } from '@/lib/mentions';
import { cn, fileSize, longDate, shortDate, timeOf } from '@/lib/utils';
import { EmojiPicker } from './EmojiPicker';
import { Avatar, Badge, Button, Menu, MenuItem, useToast } from './ui';

export const MessageItem = memo(function MessageItem({
  message,
  grouped,
  space,
  onOpenThread,
  inThread,
  highlight,
}: {
  message: ChatMessageDto;
  /** Same author as the message before, shortly before: no name or picture again. */
  grouped: boolean;
  space: ChatSpaceDto;
  onOpenThread?: (id: string) => void;
  inThread?: boolean;
  highlight?: boolean;
}) {
  const { me, people } = useChat();
  const qc = useQueryClient();
  const toast = useToast();
  const author = personOf(people, message.authorId);
  const mine = message.authorId === me.id;
  const [editing, setEditing] = useState(false);
  const [picker, setPicker] = useState(false);
  const manager =
    me.canManage &&
    space.kind === 'space' &&
    space.members.some((m) => m.userId === me.id && m.role === 'manager');

  const react = async (emoji: string) => {
    setPicker(false);
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
      upsertMessage(qc, { ...message, deleted: true, text: '', attachments: [], reactions: [] });
    } catch (error) {
      toast(errorMessage(error));
    }
  };

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

  if (message.deleted) {
    return (
      <div className={cn('flex gap-3 px-4 sm:px-5', grouped ? 'py-0.5' : 'pt-3 pb-0.5')}>
        <span className="w-9 shrink-0" />
        <p className="text-sm text-muted italic">This message was deleted.</p>
      </div>
    );
  }

  return (
    <div
      id={`m-${message.id}`}
      className={cn(
        'group relative flex gap-3 px-4 transition-colors hover:bg-black/[0.02] sm:px-5',
        grouped ? 'py-0.5' : 'pt-3 pb-0.5',
        highlight && 'animate-flash',
      )}
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
            {author.kind === 'guest' && (
              <Badge tone="guest">{author.company ? `Guest · ${author.company}` : 'Guest'}</Badge>
            )}
            <time className="text-xs text-muted" title={longDate(message.createdAt)}>
              {timeOf(message.createdAt)}
            </time>
          </div>
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
                'text-[15px] leading-relaxed break-words text-[#1f1f1d]',
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

        {message.attachments.length > 0 && <Attachments files={message.attachments} />}

        {message.reactions.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {message.reactions.map((r) => {
              const reacted = r.userIds.includes(me.id);
              const names = r.userIds.map((id) =>
                id === me.id ? 'You' : personOf(people, id).name,
              );
              return (
                <button
                  key={r.emoji}
                  type="button"
                  onClick={() => void react(r.emoji)}
                  title={names.join(', ')}
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

      {/* Actions on hover (always reachable by keyboard) */}
      {!editing && (
        <div className="absolute -top-4 right-4 z-10 hidden items-center gap-0.5 rounded-xl border border-line bg-white p-0.5 shadow-sm group-focus-within:flex group-hover:flex [@media(hover:none)]:group-active:flex">
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
            {picker && (
              <EmojiPicker
                onPick={(e) => void react(e)}
                onClose={() => setPicker(false)}
                className="absolute top-9 right-0"
              />
            )}
          </div>
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
            {(close) => (
              <>
                {message.text && (
                  <MenuItem
                    icon={<Copy />}
                    onClick={() => {
                      close();
                      void navigator.clipboard
                        .writeText(toEditable(message.text, people))
                        .then(() => toast('Copied'));
                    }}
                  >
                    Copy text
                  </MenuItem>
                )}
                {mine && message.text && (
                  <MenuItem
                    icon={<Pencil />}
                    onClick={() => {
                      close();
                      setEditing(true);
                    }}
                  >
                    Edit
                  </MenuItem>
                )}
                {(mine || manager) && (
                  <MenuItem
                    icon={<Trash2 />}
                    danger
                    onClick={() => {
                      close();
                      void remove();
                    }}
                  >
                    Delete
                  </MenuItem>
                )}
              </>
            )}
          </Menu>
        </div>
      )}
    </div>
  );
});

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
        <span className="mr-auto text-xs text-muted">Enter to save · Esc to cancel</span>
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

const isImage = (f: ChatAttachmentDto) =>
  ['image/png', 'image/jpeg', 'image/gif', 'image/webp'].includes(f.contentType);

export function Attachments({ files }: { files: ChatAttachmentDto[] }) {
  const [open, setOpen] = useState<ChatAttachmentDto | null>(null);
  const images = files.filter(isImage);
  const others = files.filter((f) => !isImage(f));
  return (
    <div className="mt-1.5 space-y-1.5">
      {images.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {images.map((f) => {
            const ratio = f.width && f.height ? f.width / f.height : 4 / 3;
            const h = Math.min(260, images.length > 1 ? 180 : 260);
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setOpen(f)}
                className="overflow-hidden rounded-xl border border-line bg-canvas"
                style={{ height: h, width: Math.min(420, Math.max(120, h * ratio)) }}
              >
                <img
                  src={fileUrl(f.id)}
                  alt={f.name}
                  loading="lazy"
                  className="size-full object-cover transition hover:opacity-95"
                />
              </button>
            );
          })}
        </div>
      )}
      {others.map((f) => (
        <a
          key={f.id}
          href={fileUrl(f.id, !f.contentType.startsWith('application/pdf'))}
          target="_blank"
          rel="noopener noreferrer"
          className="flex max-w-sm items-center gap-3 rounded-xl border border-line bg-white p-3 transition hover:border-neutral-300 hover:bg-canvas"
        >
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <FileText className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{f.name}</span>
            <span className="block text-xs text-muted">{fileSize(f.size)}</span>
          </span>
          <Download className="size-4 shrink-0 text-muted" />
        </a>
      ))}
      {open && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/90"
          onClick={() => setOpen(null)}
          role="dialog"
          aria-label={open.name}
        >
          <div
            className="flex items-center gap-3 p-3 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="min-w-0 flex-1 truncate text-sm">{open.name}</p>
            <a
              href={fileUrl(open.id, true)}
              className="inline-flex size-9 items-center justify-center rounded-lg hover:bg-white/10"
              aria-label="Download"
            >
              <Download className="size-5" />
            </a>
            <button
              type="button"
              onClick={() => setOpen(null)}
              className="inline-flex size-9 items-center justify-center rounded-lg hover:bg-white/10"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="flex min-h-0 flex-1 items-center justify-center p-4">
            <img
              src={fileUrl(open.id)}
              alt={open.name}
              className="max-h-full max-w-full rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
