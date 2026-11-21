import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import type { MeetJoinResultDto, MeetParticipantRole, MeetRoomInfoDto } from '@muvance/shared';
import { Spinner } from '@/components/ui';
import { api, ApiClientError, errorMessage } from '@/lib/api';
import { useMe } from '@/lib/auth';
import { parseMeetingCode } from '@/lib/meeting-code';
import { joinRequestStore, loadPrefs, savePrefs, type MeetPrefs } from '@/lib/prefs';
import { Call } from '@/meeting/Call';
import { LeftScreen, type LeaveReason } from '@/meeting/LeftScreen';
import { Lobby } from '@/meeting/Lobby';
import { NotFoundPage } from './NotFoundPage';

type Phase =
  | { name: 'lobby' }
  | { name: 'asking'; requestId: string }
  | { name: 'call'; token: string; role: MeetParticipantRole; identity: string }
  | { name: 'left'; reason: LeaveReason };

/** One meeting link: lobby -> (asking to join) -> the call -> "you left". */
export function MeetingPage() {
  const params = useParams();
  const code = parseMeetingCode(params.code ?? '');
  const { data: me, isLoading: meLoading } = useMe();
  const [phase, setPhase] = useState<Phase>({ name: 'lobby' });
  const [prefs, setPrefs] = useState<MeetPrefs>(loadPrefs);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  const updatePrefs = useCallback((patch: Partial<MeetPrefs>) => setPrefs(savePrefs(patch)), []);

  const info = useQuery({
    queryKey: ['room', code],
    queryFn: () => api.get<MeetRoomInfoDto>(`/meet/rooms/${code}`),
    enabled: !!code && phase.name !== 'call',
    refetchInterval: phase.name === 'call' ? false : 5000,
    retry: (count, err) => !(err instanceof ApiClientError && err.status === 404) && count < 2,
  });

  const handleResult = useCallback(
    (result: MeetJoinResultDto) => {
      if (!code) return;
      if (result.status === 'admitted') {
        setPhase({
          name: 'call',
          token: result.token,
          role: result.role,
          identity: result.identity,
        });
      } else if (result.status === 'pending') {
        joinRequestStore.set(code, result.requestId);
        setPhase({ name: 'asking', requestId: result.requestId });
      } else {
        joinRequestStore.clear(code);
        setPhase({ name: 'left', reason: 'denied' });
      }
    },
    [code],
  );

  // While asking, check every couple of seconds whether someone has let us in.
  useEffect(() => {
    if (phase.name !== 'asking' || !code) return;
    let stopped = false;
    const check = async () => {
      try {
        const result = await api.get<MeetJoinResultDto>(
          `/meet/rooms/${code}/requests/${phase.requestId}`,
        );
        if (!stopped && result.status !== 'pending') handleResult(result);
      } catch (err) {
        if (stopped) return;
        if (err instanceof ApiClientError && (err.status === 404 || err.status === 409)) {
          joinRequestStore.clear(code);
          setError(err.message);
          setPhase({ name: 'lobby' });
        }
        // Other errors (a network blip): keep waiting and try again.
      }
    };
    const id = setInterval(check, 2000);
    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, [phase, code, handleResult]);

  if (!code) return <NotFoundPage />;
  if (info.error instanceof ApiClientError && info.error.status === 404) {
    return <NotFoundPage />;
  }

  const join = async (name: string) => {
    setError('');
    setJoining(true);
    if (!me) updatePrefs({ name });
    try {
      // A guest who was already let in (or is still waiting) carries on after a refresh.
      const stored = me ? null : joinRequestStore.get(code);
      if (stored) {
        try {
          const result = await api.get<MeetJoinResultDto>(`/meet/rooms/${code}/requests/${stored}`);
          if (result.status !== 'denied') return handleResult(result);
        } catch {
          // Expired: ask again below.
        }
        joinRequestStore.clear(code);
      }
      handleResult(await api.post<MeetJoinResultDto>(`/meet/rooms/${code}/join`, { name }));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setJoining(false);
    }
  };

  const cancelAsking = () => {
    if (phase.name === 'asking') {
      void api.delete(`/meet/rooms/${code}/requests/${phase.requestId}`).catch(() => {});
    }
    joinRequestStore.clear(code);
    setPhase({ name: 'lobby' });
  };

  if (phase.name === 'call') {
    return (
      <Call
        code={code}
        token={phase.token}
        role={phase.role}
        identity={phase.identity}
        prefs={prefs}
        updatePrefs={updatePrefs}
        onLeft={(reason) => {
          if (reason !== 'left') joinRequestStore.clear(code);
          setPhase({ name: 'left', reason });
        }}
      />
    );
  }

  if (phase.name === 'left') {
    return (
      <LeftScreen
        reason={phase.reason}
        onRejoin={() => {
          setError('');
          setPhase({ name: 'lobby' });
        }}
      />
    );
  }

  if (meLoading || (info.isLoading && !info.data)) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="size-8 text-neutral-400" />
      </div>
    );
  }

  return (
    <Lobby
      info={info.data}
      me={me ?? null}
      prefs={prefs}
      updatePrefs={updatePrefs}
      asking={phase.name === 'asking'}
      joining={joining}
      error={error || (info.error ? errorMessage(info.error) : '')}
      onJoin={join}
      onCancel={cancelAsking}
    />
  );
}
