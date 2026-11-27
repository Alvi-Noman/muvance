import { useRef, useState, type FormEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Camera, Copy, Download, Link2, Smartphone, Trash2 } from 'lucide-react';
import type { ChatGuestDto, ChatMeDto } from '@muvance/shared';
import { api, errorMessage } from '@/lib/api';
import { squareAvatar } from '@/lib/avatar-image';
import { accountsUrl } from '@/lib/account';
import { keys, patchBootstrap, patchPerson, useChat } from '@/lib/data';
import {
  ANDROID_APP_URL,
  install,
  isAndroid,
  isInstalled,
  isIos,
  useCanInstall,
} from '@/lib/install';
import { setSoundOn, soundOn } from '@/lib/notify';
import { disablePush, enablePush, usePushState } from '@/lib/push';
import { cn, shortDate } from '@/lib/utils';
import { PasswordInput } from '@/pages/LoginPage';
import {
  Avatar,
  Badge,
  Button,
  Dialog,
  Field,
  IconButton,
  Input,
  Spinner,
  Switch,
  useToast,
} from './ui';

export type SettingsTab = 'profile' | 'notifications' | 'app' | 'guests';
type Tab = SettingsTab;

export function SettingsDialog({
  open,
  onClose,
  initialTab = 'profile',
}: {
  open: boolean;
  onClose: () => void;
  initialTab?: SettingsTab;
}) {
  const { me } = useChat();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [shownFor, setShownFor] = useState(open);
  // Opening again starts on the tab asked for.
  if (open !== shownFor) {
    setShownFor(open);
    if (open) setTab(initialTab);
  }
  const tabs: [Tab, string][] = [
    ['profile', 'Profile'],
    ['notifications', 'Notifications'],
    ['app', 'Get the app'],
    ...(me.canManage ? ([['guests', 'Guests']] as [Tab, string][]) : []),
  ];
  return (
    <Dialog open={open} onClose={onClose} title="Settings" className="sm:max-w-xl">
      <div className="mb-5 flex gap-1 rounded-xl bg-canvas p-1">
        {tabs.map(([t, label]) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 rounded-lg py-1.5 text-sm font-medium transition',
              tab === t ? 'bg-white shadow-sm' : 'text-muted hover:text-ink',
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 'profile' && <ProfileTab />}
      {tab === 'notifications' && <NotificationsTab />}
      {tab === 'app' && <AppTab />}
      {tab === 'guests' && me.canManage && <GuestsTab />}
    </Dialog>
  );
}

function ProfileTab() {
  const { me } = useChat();
  const qc = useQueryClient();
  const toast = useToast();
  const fileInput = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(me.name);
  const [company, setCompany] = useState(me.company ?? '');
  const [busy, setBusy] = useState(false);
  const guest = me.kind === 'guest';

  const setPicture = async (file: File | null) => {
    try {
      const updated = file
        ? await api.put<ChatMeDto>('/me/avatar', { image: await squareAvatar(file) })
        : await api.delete<ChatMeDto>('/me/avatar');
      patchPerson(qc, updated);
    } catch (error) {
      toast(errorMessage(error));
    }
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      patchPerson(qc, await api.put<ChatMeDto>('/me', { name, company }));
      toast('Saved');
    } catch (error) {
      toast(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="group relative rounded-full"
          aria-label="Change your picture"
        >
          <Avatar person={me} className="size-20 text-2xl" />
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition group-hover:opacity-100">
            <Camera className="size-5" />
          </span>
        </button>
        <div className="min-w-0">
          <p className="truncate font-semibold">{me.name}</p>
          <p className="truncate text-sm text-muted">{me.email}</p>
          <div className="mt-2 flex gap-2">
            <Button variant="secondary" className="h-8" onClick={() => fileInput.current?.click()}>
              Change picture
            </Button>
            {me.avatarUrl && (
              <Button variant="ghost" className="h-8" onClick={() => void setPicture(null)}>
                Remove
              </Button>
            )}
          </div>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={(e) => {
            void setPicture(e.target.files?.[0] ?? null);
            e.target.value = '';
          }}
        />
      </div>

      {guest ? (
        <>
          <form onSubmit={save} className="space-y-4">
            <Field label="Your name">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={80}
              />
            </Field>
            <Field label="Company" hint="Shown next to your name.">
              <Input value={company} onChange={(e) => setCompany(e.target.value)} maxLength={80} />
            </Field>
            <div className="flex justify-end">
              <Button type="submit" disabled={busy}>
                {busy ? <Spinner /> : 'Save'}
              </Button>
            </div>
          </form>
          <ChangePassword />
        </>
      ) : (
        <div className="flex items-center justify-between gap-4 rounded-xl bg-canvas p-3.5">
          <p className="text-sm text-muted">
            Your name, picture and password are your Muvance account's: the same in Mail, Meet and
            the Admin CRM.
          </p>
          <a
            href={accountsUrl()}
            className="shrink-0 rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-medium hover:bg-black/[0.03]"
          >
            Manage
          </a>
        </div>
      )}
    </div>
  );
}

function ChangePassword() {
  const toast = useToast();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.put('/me/password', { current, next });
      setCurrent('');
      setNext('');
      toast('Password changed. Other devices were signed out.');
    } catch (error) {
      toast(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit} className="space-y-3 border-t border-line pt-5">
      <p className="text-sm font-semibold">Change password</p>
      <label className="block">
        <span className="text-sm">Current password</span>
        <PasswordInput value={current} onChange={setCurrent} autoComplete="current-password" />
      </label>
      <label className="block">
        <span className="text-sm">New password</span>
        <PasswordInput value={next} onChange={setNext} autoComplete="new-password" />
        <span className="mt-1 block text-xs text-muted">At least 8 characters.</span>
      </label>
      <div className="flex justify-end">
        <Button type="submit" variant="secondary" disabled={busy || !current || next.length < 8}>
          {busy ? <Spinner /> : 'Change password'}
        </Button>
      </div>
    </form>
  );
}

function NotificationsTab() {
  const { pushKey } = useChat();
  const push = usePushState();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [sound, setSound] = useState(soundOn);
  const toggle = async (on: boolean) => {
    setBusy(true);
    try {
      if (on) await enablePush(pushKey);
      else await disablePush();
    } catch (error) {
      toast(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-4 rounded-xl bg-canvas p-3.5">
        <div>
          <p className="text-sm font-medium">Notifications on this device</p>
          <p className="text-xs text-muted">
            {push === 'on'
              ? 'On. New messages reach you here even when Muvance Chat is closed.'
              : push === 'denied'
                ? 'Blocked. Allow notifications for chat.muvance.com in your browser’s site settings, then come back here.'
                : push === 'unsupported'
                  ? isIos() && !isInstalled()
                    ? 'On iPhone, add Muvance Chat to your Home Screen first (see Get the app).'
                    : "This browser can't show notifications."
                  : 'Get a notification for every new message, even when Muvance Chat is closed.'}
          </p>
        </div>
        {(push === 'on' || push === 'off') && (
          <Switch
            checked={push === 'on'}
            onChange={(on) => {
              if (!busy) void toggle(on);
            }}
            label="Notifications on this device"
          />
        )}
        {push === 'denied' && <Badge tone="neutral">Blocked</Badge>}
      </div>
      <DndRow />
      <div className="flex items-start justify-between gap-4 rounded-xl bg-canvas p-3.5">
        <div>
          <p className="text-sm font-medium">Sound</p>
          <p className="text-xs text-muted">A soft chime when a message arrives.</p>
        </div>
        <Switch
          checked={sound}
          onChange={(on) => {
            setSound(on);
            setSoundOn(on);
          }}
          label="Sound"
        />
      </div>
      <p className="px-1 text-xs text-muted">
        Muted conversations stay quiet unless someone @mentions you. Clients also get an email when
        they have messages they haven't read for a while.
      </p>
    </div>
  );
}

/** Pause notifications for a while (they come back by themselves). */
function DndRow() {
  const { me } = useChat();
  const qc = useQueryClient();
  const toast = useToast();
  const until = me.dndUntil ? new Date(me.dndUntil) : null;
  const set = async (minutes: number | 'tomorrow' | null) => {
    let at: Date | null = null;
    if (minutes === 'tomorrow') {
      at = new Date();
      at.setDate(at.getDate() + 1);
      at.setHours(8, 0, 0, 0);
    } else if (minutes) {
      at = new Date();
      at.setMinutes(at.getMinutes() + minutes);
    }
    try {
      const updated = await api.put<ChatMeDto>('/me/dnd', { until: at?.toISOString() ?? null });
      patchPerson(qc, updated);
      patchBootstrap(qc, (d) => ({ ...d, me: updated }));
      toast(at ? 'Notifications paused' : 'Notifications are back on');
    } catch (error) {
      toast(errorMessage(error));
    }
  };
  return (
    <div className="rounded-xl bg-canvas p-3.5">
      <p className="text-sm font-medium">Do not disturb</p>
      <p className="text-xs text-muted">
        {until
          ? `Notifications are paused until ${until.toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' })}. Others see “Do not disturb”.`
          : 'Pause notifications for a while. Others see that you’re not to be disturbed.'}
      </p>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {until ? (
          <Button variant="secondary" className="h-8" onClick={() => void set(null)}>
            Turn notifications back on
          </Button>
        ) : (
          DND_CHOICES.map(([m, label]) => (
            <Button key={label} variant="secondary" className="h-8" onClick={() => void set(m)}>
              {label}
            </Button>
          ))
        )}
      </div>
    </div>
  );
}

const DND_CHOICES: [number | 'tomorrow', string][] = [
  [30, '30 minutes'],
  [60, '1 hour'],
  [240, '4 hours'],
  ['tomorrow', 'Until tomorrow'],
];

/** Muvance Chat as an app: on Android, iPhone and computers. */
function AppTab() {
  const canInstall = useCanInstall();
  const installed = isInstalled();
  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-canvas p-3.5">
        <p className="flex items-center gap-2 text-sm font-medium">
          <Smartphone className="size-4 text-accent" /> Android
        </p>
        <p className="mt-1 text-xs text-muted">
          The Muvance Chat app, with notifications for new messages. Open the download on your phone
          and install it (allow installing from your browser if Android asks).
        </p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          <a
            href={ANDROID_APP_URL}
            className="inline-flex h-8 items-center gap-2 rounded-lg bg-ink px-3 text-sm font-medium text-white hover:bg-black/85"
          >
            <Download className="size-4" /> Download for Android
          </a>
          {isAndroid() && canInstall && (
            <Button variant="secondary" className="h-8" onClick={() => void install()}>
              Or install from Chrome
            </Button>
          )}
        </div>
      </div>
      <div className="rounded-xl bg-canvas p-3.5">
        <p className="text-sm font-medium">iPhone and iPad</p>
        <p className="mt-1 text-xs text-muted">
          Open chat.muvance.com in Safari, tap the Share button, then <b>Add to Home Screen</b>.
          Open Muvance Chat from your Home Screen and turn on notifications in Settings →
          Notifications.
        </p>
      </div>
      <div className="rounded-xl bg-canvas p-3.5">
        <p className="text-sm font-medium">Computer</p>
        <p className="mt-1 text-xs text-muted">
          {installed
            ? 'You’re using the installed app.'
            : 'Install Muvance Chat as an app, with its own window and icon (Chrome and Edge).'}
        </p>
        {!installed && canInstall && !isAndroid() && (
          <Button className="mt-2.5 h-8" onClick={() => void install()}>
            Install app
          </Button>
        )}
        {!installed && !canInstall && !isIos() && (
          <p className="mt-1.5 text-xs text-muted">
            In Chrome or Edge, use the install icon at the right of the address bar.
          </p>
        )}
      </div>
    </div>
  );
}

function GuestsTab() {
  const qc = useQueryClient();
  const toast = useToast();
  const guests = useQuery({
    queryKey: ['guests'],
    queryFn: () => api.get<ChatGuestDto[]>('/guests'),
  });
  const [link, setLink] = useState<{ id: string; url: string; emailed: boolean } | null>(null);

  const newLink = async (g: ChatGuestDto) => {
    try {
      const res = await api.post<{ inviteUrl: string; emailed: boolean }>(`/guests/${g.id}/link`);
      setLink({ id: g.id, url: res.inviteUrl, emailed: res.emailed });
    } catch (error) {
      toast(errorMessage(error));
    }
  };

  const remove = async (g: ChatGuestDto) => {
    if (
      !window.confirm(
        `Remove ${g.name}'s access? They're taken out of every space and signed out. Their old messages stay.`,
      )
    )
      return;
    try {
      await api.delete(`/guests/${g.id}`);
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['guests'] }),
        qc.invalidateQueries({ queryKey: keys.bootstrap }),
      ]);
      toast(`${g.name} no longer has access`);
    } catch (error) {
      toast(errorMessage(error));
    }
  };

  if (guests.isLoading) {
    return (
      <div className="flex justify-center p-6">
        <Spinner className="text-muted" />
      </div>
    );
  }
  if (!guests.data?.length) {
    return (
      <p className="py-6 text-center text-sm text-muted">
        No clients yet. Invite one from a space's members list.
      </p>
    );
  }
  return (
    <div className="-mx-2 space-y-1">
      <p className="px-2 pb-2 text-sm text-muted">
        Clients invited to Muvance Chat. Send a new link if they lost theirs or forgot their
        password.
      </p>
      {guests.data.map((g) => (
        <div key={g.id} className="rounded-xl px-2.5 py-2 hover:bg-black/[0.02]">
          <div className="flex items-center gap-3">
            <Avatar person={g} presence className="size-9 text-sm" />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 truncate text-sm font-medium">
                {g.name}
                {g.status === 'invited' && <Badge>Hasn't joined yet</Badge>}
              </p>
              <p className="truncate text-xs text-muted">
                {[g.company, g.email].filter(Boolean).join(' · ')}
              </p>
              <p className="truncate text-xs text-muted">
                {g.spaceNames.length ? g.spaceNames.join(', ') : 'In no spaces'}
                {g.lastSeenAt && ` · Last seen ${shortDate(g.lastSeenAt)}`}
                {g.invitedByName && ` · Invited by ${g.invitedByName}`}
              </p>
            </div>
            <IconButton label="Send a new sign-in link" onClick={() => void newLink(g)}>
              <Link2 />
            </IconButton>
            <IconButton label="Remove access" onClick={() => void remove(g)}>
              <Trash2 />
            </IconButton>
          </div>
          {link?.id === g.id && (
            <div className="mt-2 ml-12 rounded-lg bg-canvas p-2.5 text-xs">
              <p className="text-muted">
                {link.emailed
                  ? 'Emailed to them. You can also share it another way:'
                  : "The email couldn't be sent. Share this link with them (works for 14 days):"}
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <code className="min-w-0 flex-1 truncate">{link.url}</code>
                <IconButton
                  label="Copy link"
                  onClick={() =>
                    void navigator.clipboard.writeText(link.url).then(() => toast('Link copied'))
                  }
                >
                  <Copy />
                </IconButton>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
