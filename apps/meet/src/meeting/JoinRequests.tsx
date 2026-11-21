import { useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserPlus } from 'lucide-react';
import type { MeetJoinRequestDto } from '@muvance/shared';
import { Avatar } from '@/components/ui';
import { api, errorMessage } from '@/lib/api';
import { sounds } from '@/lib/sounds';
import { useCall } from './call-context';

/** People waiting to be let in. Hosts' pages check every few seconds. */
function useJoinRequests() {
  const { code, toast } = useCall();
  const queryClient = useQueryClient();
  const requests = useQuery({
    queryKey: ['join-requests', code],
    queryFn: () => api.get<MeetJoinRequestDto[]>(`/meet/rooms/${code}/requests`),
    refetchInterval: 3000,
    refetchIntervalInBackground: true,
  });
  const decide = useMutation({
    mutationFn: ({ id, admit }: { id: string; admit: boolean }) =>
      api.post(`/meet/rooms/${code}/requests/${id}/decision`, { admit }),
    onMutate: ({ id }) => {
      queryClient.setQueryData<MeetJoinRequestDto[]>(['join-requests', code], (list) =>
        list?.filter((r) => r.id !== id),
      );
    },
    onError: (error) => toast(errorMessage(error)),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['join-requests', code] }),
  });
  return { list: requests.data ?? [], decide };
}

/** The pop-up in the corner: "Nadia wants to join this call". */
export function JoinRequests() {
  const { panel, setPanel } = useCall();
  const { list, decide } = useJoinRequests();
  const seen = useRef(new Set<string>());

  // Knock when someone new starts waiting.
  useEffect(() => {
    const fresh = list.filter((r) => !seen.current.has(r.id));
    fresh.forEach((r) => seen.current.add(r.id));
    if (fresh.length) sounds.knock();
  }, [list]);

  // The People panel shows the full list itself.
  if (!list.length || panel === 'people') return null;
  const first = list[0]!;

  return (
    <div className="animate-fade-up fixed bottom-24 left-3 z-40 w-[min(22rem,calc(100vw-1.5rem))] rounded-3xl bg-white p-5 text-neutral-950 shadow-2xl sm:left-5">
      <div className="flex items-start gap-3">
        <span className="animate-knock inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-800">
          <UserPlus className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          {list.length === 1 ? (
            <>
              <p className="font-medium">Someone wants to join this call</p>
              <p className="mt-1 flex items-center gap-2 text-sm text-neutral-700">
                <Avatar name={first.name} className="size-6 text-[10px]" />
                <span className="truncate">{first.name}</span>
              </p>
            </>
          ) : (
            <>
              <p className="font-medium">{list.length} people want to join this call</p>
              <p className="mt-1 truncate text-sm text-neutral-700">
                {list.map((r) => r.name).join(', ')}
              </p>
            </>
          )}
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-1">
        {list.length === 1 ? (
          <>
            <button
              type="button"
              onClick={() => decide.mutate({ id: first.id, admit: false })}
              className="rounded-full px-4 py-2 text-sm font-medium text-sky-800 hover:bg-sky-50"
            >
              Deny entry
            </button>
            <button
              type="button"
              onClick={() => decide.mutate({ id: first.id, admit: true })}
              className="rounded-full px-4 py-2 text-sm font-medium text-sky-800 hover:bg-sky-50"
            >
              Admit
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setPanel('people')}
              className="rounded-full px-4 py-2 text-sm font-medium text-sky-800 hover:bg-sky-50"
            >
              View all
            </button>
            <button
              type="button"
              onClick={() => list.forEach((r) => decide.mutate({ id: r.id, admit: true }))}
              className="rounded-full px-4 py-2 text-sm font-medium text-sky-800 hover:bg-sky-50"
            >
              Admit all
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/** The waiting list inside the People panel. */
export function WaitingList() {
  const { list, decide } = useJoinRequests();
  if (!list.length) return null;
  return (
    <section className="mb-4">
      <div className="flex items-center justify-between px-3 py-2">
        <h3 className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
          Waiting to join · {list.length}
        </h3>
        {list.length > 1 && (
          <button
            type="button"
            onClick={() => list.forEach((r) => decide.mutate({ id: r.id, admit: true }))}
            className="text-sm font-medium text-sky-700 hover:underline"
          >
            Admit all
          </button>
        )}
      </div>
      {list.map((r) => (
        <div key={r.id} className="flex items-center gap-3 rounded-xl px-3 py-2">
          <Avatar name={r.name} className="size-9 text-sm" />
          <span className="min-w-0 flex-1 truncate text-sm font-medium">{r.name}</span>
          <button
            type="button"
            onClick={() => decide.mutate({ id: r.id, admit: false })}
            className="rounded-full px-3 py-1.5 text-sm text-neutral-600 hover:bg-black/5"
          >
            Deny
          </button>
          <button
            type="button"
            onClick={() => decide.mutate({ id: r.id, admit: true })}
            className="rounded-full bg-neutral-950 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Admit
          </button>
        </div>
      ))}
    </section>
  );
}
