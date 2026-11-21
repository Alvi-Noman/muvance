import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Check,
  Copy,
  Infinity as InfinityIcon,
  Keyboard,
  Link2,
  Lock,
  MonitorUp,
  Plus,
  Users,
  Video,
} from 'lucide-react';
import type { MeetRoomDto } from '@muvance/shared';
import { Header } from '@/components/Header';
import { Button, Dialog, LogoMark, Spinner } from '@/components/ui';
import { api, errorMessage } from '@/lib/api';
import { useMe } from '@/lib/auth';
import { meetingLink, parseMeetingCode, shortLink } from '@/lib/meeting-code';
import { cn } from '@/lib/cn';
import { useCopy } from '@/lib/use-copy';

function useCreateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<MeetRoomDto>('/meet/rooms'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-rooms'] }),
  });
}

export function HomePage() {
  const navigate = useNavigate();
  const { data: me } = useMe();
  const createRoom = useCreateRoom();
  const [menuOpen, setMenuOpen] = useState(false);
  const [laterRoom, setLaterRoom] = useState<MeetRoomDto | null>(null);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [createError, setCreateError] = useState('');
  const { copied, copy } = useCopy();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  const rooms = useQuery({
    queryKey: ['my-rooms'],
    queryFn: () => api.get<MeetRoomDto[]>('/meet/rooms'),
    enabled: !!me,
  });

  const start = async (instant: boolean) => {
    setMenuOpen(false);
    setCreateError('');
    try {
      const room = await createRoom.mutateAsync();
      if (instant) navigate(`/${room.code}`);
      else setLaterRoom(room);
    } catch (error) {
      setCreateError(errorMessage(error));
    }
  };

  const join = (e: FormEvent) => {
    e.preventDefault();
    const parsed = parseMeetingCode(code);
    if (!parsed) {
      setCodeError('Enter a code like abc-defg-hij, or paste the meeting link.');
      return;
    }
    navigate(`/${parsed}`);
  };

  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-4 pt-6 pb-16 sm:px-6 lg:grid-cols-[1.05fr_1fr]">
        <section className="animate-fade-up">
          <h1 className="font-serif text-5xl leading-[1.02] tracking-tight sm:text-6xl">
            Video calls that <em className="text-neutral-500">just work.</em>
          </h1>
          <p className="mt-5 max-w-md text-lg text-neutral-600">
            Meet with clients and the team in your browser. Up to 5 people, share your screen, and
            no time limit.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="relative" ref={menuRef}>
              {me ? (
                <Button
                  size="lg"
                  onClick={() => setMenuOpen((o) => !o)}
                  disabled={createRoom.isPending}
                  className="w-full sm:w-auto"
                >
                  {createRoom.isPending ? (
                    <Spinner className="size-4" />
                  ) : (
                    <Video className="size-5" />
                  )}
                  New meeting
                </Button>
              ) : (
                <Link
                  to="/signin?next=new"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-neutral-950 px-7 py-3.5 text-base font-medium text-white shadow-lg shadow-black/10 transition hover:bg-neutral-800 sm:w-auto"
                >
                  <Video className="size-5" /> New meeting
                </Link>
              )}
              {menuOpen && (
                <div className="animate-fade-up absolute left-0 z-20 mt-2 w-72 rounded-2xl border border-black/5 bg-white p-2 shadow-xl">
                  <MenuItem
                    icon={<Link2 className="size-5" />}
                    label="Create a meeting for later"
                    onClick={() => start(false)}
                  />
                  <MenuItem
                    icon={<Plus className="size-5" />}
                    label="Start an instant meeting"
                    onClick={() => start(true)}
                  />
                </div>
              )}
            </div>

            <form onSubmit={join} className="flex flex-1 gap-2">
              <label className="relative flex-1">
                <span className="sr-only">Meeting code or link</span>
                <Keyboard className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-neutral-500" />
                <input
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setCodeError('');
                  }}
                  placeholder="Enter a code or link"
                  className="h-[52px] w-full rounded-full border border-black/15 bg-white/70 pr-4 pl-12 outline-none transition focus:border-neutral-950 focus:bg-white"
                />
              </label>
              <Button
                type="submit"
                variant="ghost"
                size="lg"
                disabled={!code.trim()}
                className="px-5"
              >
                Join
              </Button>
            </form>
          </div>
          {(codeError || createError) && (
            <p className="mt-3 text-sm text-red-600">{codeError || createError}</p>
          )}
          {!me && me !== undefined && (
            <p className="mt-6 text-sm text-neutral-500">
              Have a link from Muvance? Just open it, or paste it above. Only the Muvance team can
              start new meetings.
            </p>
          )}

          <ul className="mt-10 grid max-w-lg grid-cols-2 gap-x-6 gap-y-3 text-sm text-neutral-700">
            <Feature icon={<Users className="size-4" />}>Up to 5 people</Feature>
            <Feature icon={<InfinityIcon className="size-4" />}>No time limit</Feature>
            <Feature icon={<MonitorUp className="size-4" />}>Screen sharing</Feature>
            <Feature icon={<Lock className="size-4" />}>Guests ask to join</Feature>
          </ul>
        </section>

        <section className="animate-fade-up [animation-delay:120ms]">
          {me && rooms.data && rooms.data.length > 0 ? (
            <RecentRooms rooms={rooms.data} copied={copied} copy={copy} />
          ) : (
            <Illustration />
          )}
        </section>
      </main>

      <Dialog
        open={!!laterRoom}
        onClose={() => setLaterRoom(null)}
        title="Here's your meeting link"
      >
        {laterRoom && (
          <>
            <p className="text-sm text-neutral-600">
              Copy this link and send it to the people you want to meet with. Save it so you can use
              it later too.
            </p>
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-neutral-100 p-2 pl-4">
              <span className="flex-1 truncate text-sm font-medium">
                {shortLink(laterRoom.code)}
              </span>
              <button
                type="button"
                onClick={() => copy(meetingLink(laterRoom.code), 'later')}
                className="rounded-full p-2.5 transition hover:bg-black/5"
                aria-label="Copy meeting link"
              >
                {copied === 'later' ? (
                  <Check className="size-5 text-emerald-600" />
                ) : (
                  <Copy className="size-5" />
                )}
              </button>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setLaterRoom(null)}>
                Done
              </Button>
              <Button onClick={() => navigate(`/${laterRoom.code}`)}>Join now</Button>
            </div>
          </>
        )}
      </Dialog>
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition hover:bg-black/5"
    >
      <span className="text-neutral-600">{icon}</span>
      {label}
    </button>
  );
}

function Feature({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-center gap-2.5">
      <span className="inline-flex size-8 items-center justify-center rounded-full bg-white/80 shadow-sm">
        {icon}
      </span>
      {children}
    </li>
  );
}

function RecentRooms({
  rooms,
  copied,
  copy,
}: {
  rooms: MeetRoomDto[];
  copied: string | null;
  copy: (text: string, key?: string) => void;
}) {
  return (
    <div className="rounded-[2rem] border border-white/60 bg-white/60 p-3 shadow-xl shadow-black/5 backdrop-blur">
      <h2 className="px-3 pt-2 pb-3 font-serif text-2xl">Your meetings</h2>
      <ul className="max-h-[420px] space-y-1 overflow-y-auto">
        {rooms.map((room) => (
          <li
            key={room.code}
            className="group flex items-center gap-3 rounded-2xl px-3 py-3 transition hover:bg-white"
          >
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-white">
              <Video className="size-4" />
            </span>
            <Link to={`/${room.code}`} className="min-w-0 flex-1">
              <p className="truncate font-medium">{room.title || room.code}</p>
              <p className="text-sm text-neutral-500">
                {room.title ? `${room.code} · ` : ''}
                {new Date(room.createdAt).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </Link>
            <button
              type="button"
              onClick={() => copy(meetingLink(room.code), room.code)}
              className="rounded-full p-2.5 text-neutral-600 transition hover:bg-black/5"
              aria-label={`Copy link for ${room.code}`}
            >
              {copied === room.code ? (
                <Check className="size-4 text-emerald-600" />
              ) : (
                <Copy className="size-4" />
              )}
            </button>
            <Link
              to={`/${room.code}`}
              className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Join
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** A calm picture of a call: five tiles, one speaking. */
function Illustration() {
  const tiles = [
    { name: 'You', tone: 'from-amber-200 to-orange-300', speaking: true },
    { name: 'Client', tone: 'from-sky-200 to-indigo-300' },
    { name: 'Team', tone: 'from-emerald-200 to-teal-300' },
    { name: 'Partner', tone: 'from-rose-200 to-pink-300' },
  ];
  return (
    <div className="relative mx-auto max-w-md">
      <div className="rounded-[2rem] bg-neutral-950 p-3 shadow-2xl shadow-black/20">
        <div className="grid grid-cols-2 gap-2">
          {tiles.map((t) => (
            <div
              key={t.name}
              className={cn(
                'relative flex aspect-[4/3] items-center justify-center rounded-2xl bg-gradient-to-br',
                t.tone,
                t.speaking && 'ring-4 ring-white/80',
              )}
            >
              <span className="size-14 rounded-full bg-white/40" />
              <span className="absolute bottom-2 left-3 text-xs font-medium text-neutral-900/80">
                {t.name}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-center gap-2">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="size-9 rounded-full bg-white/10" />
          ))}
          <span className="h-9 w-14 rounded-full bg-red-600" />
        </div>
      </div>
      <div className="absolute -top-5 -right-4 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium shadow-lg">
        <LogoMark className="w-5" /> No time limit
      </div>
    </div>
  );
}
