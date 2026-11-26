import { useParticipants } from '@livekit/components-react';
import { screenOwnerOf } from '@muvance/shared';

/** Everyone in the call, without screens presented from the Android app (those aren't people). */
export function usePeople() {
  return useParticipants().filter((p) => !screenOwnerOf(p.metadata));
}
