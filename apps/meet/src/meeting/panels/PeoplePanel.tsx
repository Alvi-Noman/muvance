import { useState } from 'react';
import { useIsMuted, useParticipantAttribute } from '@livekit/components-react';
import { Track, type Participant } from 'livekit-client';
import { Check, Hand, Link2, Mic, MicOff, UserMinus } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MEET_MAX_PARTICIPANTS, type MeetRoomDto, type MeetRoomInfoDto } from '@muvance/shared';
import { Avatar } from '@/components/ui';
import { api, errorMessage } from '@/lib/api';
import { cn } from '@/lib/cn';
import { meetingLink } from '@/lib/meeting-code';
import { useCopy } from '@/lib/use-copy';
import { roleOf, useCall } from '../call-context';
import { WaitingList } from '../JoinRequests';
import { usePeople } from '../use-people';
import { PanelShell } from './PanelShell';

export function PeoplePanel() {
  const { code, isHost, toast, signal } = useCall();
  const participants = usePeople();
  const { copied, copy } = useCopy();
  const [mutingAll, setMutingAll] = useState(false);

  // Raised hands, in the order they went up.
  const hands = participants
    .map((p) => ({ p, at: Number(p.attributes.hand || 0) }))
    .filter((h) => h.at > 0)
    .sort((a, b) => a.at - b.at);

  const sorted = [...participants].sort((a, b) => {
    if (a.isLocal !== b.isLocal) return a.isLocal ? -1 : 1;
    return (a.joinedAt?.getTime() ?? 0) - (b.joinedAt?.getTime() ?? 0);
  });

  const muteAll = async () => {
    setMutingAll(true);
    try {
      const targets = participants.filter((p) => !p.isLocal && p.isMicrophoneEnabled);
      await Promise.all(
        targets.map((p) =>
          api.post(`/meet/rooms/${code}/participants/${p.identity}/mute`, { source: 'microphone' }),
        ),
      );
      toast(targets.length ? 'Everyone else is muted' : 'Everyone is already muted');
    } catch (error) {
      toast(errorMessage(error));
    } finally {
      setMutingAll(false);
    }
  };

  return (
    <PanelShell title="People">
      <div className="px-6">
        <button
          type="button"
          onClick={() => copy(meetingLink(code), 'add')}
          className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-5 py-2.5 text-sm font-medium text-sky-900 transition hover:bg-sky-200"
        >
          {copied === 'add' ? <Check className="size-4" /> : <Link2 className="size-4" />}
          {copied === 'add' ? 'Link copied' : 'Add people: copy link'}
        </button>
      </div>

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto px-3 pb-6">
        {isHost && <HostControls />}
        {isHost && <WaitingList />}

        {hands.length > 0 && (
          <section className="mb-4">
            <div className="flex items-center justify-between px-3 py-2">
              <h3 className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                Raised hands
              </h3>
              {isHost && (
                <button
                  type="button"
                  onClick={() => signal({ type: 'lower-hand', identity: null })}
                  className="text-sm font-medium text-sky-700 hover:underline"
                >
                  Lower all
                </button>
              )}
            </div>
            {hands.map(({ p }, i) => (
              <div key={p.identity} className="flex items-center gap-3 rounded-xl px-3 py-2">
                <span className="w-4 text-sm text-neutral-500">{i + 1}</span>
                <Hand className="size-4 text-amber-600" />
                <span className="flex-1 truncate text-sm">
                  {p.isLocal ? 'You' : p.name || p.identity}
                </span>
                {isHost && !p.isLocal && (
                  <button
                    type="button"
                    onClick={() => signal({ type: 'lower-hand', identity: p.identity })}
                    className="text-sm text-sky-700 hover:underline"
                  >
                    Lower
                  </button>
                )}
              </div>
            ))}
          </section>
        )}

        <div className="flex items-center justify-between px-3 py-2">
          <h3 className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
            In the call · {participants.length}/{MEET_MAX_PARTICIPANTS}
          </h3>
          {isHost && participants.length > 1 && (
            <button
              type="button"
              onClick={muteAll}
              disabled={mutingAll}
              className="text-sm font-medium text-sky-700 hover:underline disabled:opacity-50"
            >
              Mute all
            </button>
          )}
        </div>
        <ul>
          {sorted.map((p) => (
            <PersonRow key={p.identity} participant={p} />
          ))}
        </ul>
      </div>
    </PanelShell>
  );
}

function PersonRow({ participant }: { participant: Participant }) {
  const { code, isHost, toast } = useCall();
  const muted = useIsMuted({ participant, source: Track.Source.Microphone });
  const hand = useParticipantAttribute('hand', { participant });
  const host = roleOf(participant.metadata) === 'host';
  const name = participant.name || participant.identity;

  const act = async (action: 'mute' | 'remove') => {
    try {
      if (action === 'mute') {
        await api.post(`/meet/rooms/${code}/participants/${participant.identity}/mute`, {
          source: 'microphone',
        });
      } else {
        await api.delete(`/meet/rooms/${code}/participants/${participant.identity}`);
        toast(`${name} was removed from the call`);
      }
    } catch (error) {
      toast(errorMessage(error));
    }
  };

  return (
    <li className="group flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-black/[0.03]">
      <Avatar name={name} seed={participant.identity} className="size-9 text-sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {name}
          {participant.isLocal && <span className="font-normal text-neutral-500"> (You)</span>}
        </p>
        <p className="text-xs text-neutral-500">{host ? 'Muvance team' : 'Guest'}</p>
      </div>
      {hand && <Hand className="size-4 text-amber-600" />}
      {isHost && !participant.isLocal && !muted ? (
        <button
          type="button"
          onClick={() => act('mute')}
          title={`Mute ${name}`}
          aria-label={`Mute ${name}`}
          className="rounded-full p-2 text-neutral-600 hover:bg-black/5"
        >
          <Mic className="size-4" />
        </button>
      ) : (
        <span className={cn('p-2', muted ? 'text-neutral-400' : 'text-neutral-600')}>
          {muted ? <MicOff className="size-4" /> : <Mic className="size-4" />}
        </span>
      )}
      {isHost && !participant.isLocal && !host && (
        <button
          type="button"
          onClick={() => act('remove')}
          title={`Remove ${name}`}
          aria-label={`Remove ${name}`}
          className="rounded-full p-2 text-neutral-600 opacity-0 transition group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 focus:opacity-100"
        >
          <UserMinus className="size-4" />
        </button>
      )}
    </li>
  );
}

/** Host settings: whether guests must ask to join. */
function HostControls() {
  const { code, toast } = useCall();
  const queryClient = useQueryClient();
  const info = useQuery({
    queryKey: ['room', code],
    queryFn: () => api.get<MeetRoomInfoDto>(`/meet/rooms/${code}`),
  });
  const update = useMutation({
    mutationFn: (quickAccess: boolean) =>
      api.patch<MeetRoomDto>(`/meet/rooms/${code}`, { quickAccess }),
    onSuccess: (room) => {
      queryClient.setQueryData<MeetRoomInfoDto>(['room', code], (old) =>
        old ? { ...old, quickAccess: room.quickAccess } : old,
      );
      toast(
        room.quickAccess
          ? 'Anyone with the link can now join without asking'
          : 'Guests now have to ask to join',
      );
    },
    onError: (error) => toast(errorMessage(error)),
  });
  const quickAccess = info.data?.quickAccess ?? false;

  return (
    <label className="mb-3 flex cursor-pointer items-start gap-3 rounded-2xl bg-neutral-100 p-4">
      <span className="flex-1">
        <span className="block text-sm font-medium">Quick access</span>
        <span className="mt-0.5 block text-xs text-neutral-600">
          Let anyone with the link join without asking.
        </span>
      </span>
      <input
        type="checkbox"
        className="peer sr-only"
        checked={quickAccess}
        disabled={update.isPending || !info.data}
        onChange={(e) => update.mutate(e.target.checked)}
      />
      <span
        aria-hidden
        className={cn(
          'relative mt-0.5 inline-block h-6 w-11 shrink-0 rounded-full transition peer-focus-visible:ring-2 peer-focus-visible:ring-sky-500',
          quickAccess ? 'bg-neutral-950' : 'bg-neutral-300',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition',
            quickAccess && 'translate-x-5',
          )}
        />
      </span>
    </label>
  );
}
