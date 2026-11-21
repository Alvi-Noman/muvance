import { Check, Copy } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import type { MeetRoomInfoDto } from '@muvance/shared';
import { useCopy } from '@/lib/use-copy';
import { meetingLink, shortLink } from '@/lib/meeting-code';
import { useCall } from '../call-context';
import { PanelShell } from './PanelShell';

export function InfoPanel() {
  const { code } = useCall();
  const { copied, copy } = useCopy();
  const title = useQueryClient().getQueryData<MeetRoomInfoDto>(['room', code])?.title;

  const joiningInfo = [
    title ? `${title}` : 'Muvance meeting',
    `Video call link: ${meetingLink(code)}`,
    `Meeting code: ${code}`,
  ].join('\n');

  return (
    <PanelShell title="Meeting details">
      <div className="px-6">
        {title && <p className="mb-4 font-serif text-2xl">{title}</p>}
        <p className="text-sm font-medium">Joining info</p>
        <p className="mt-1 text-sm break-all text-neutral-600">{shortLink(code)}</p>
        <button
          type="button"
          onClick={() => copy(joiningInfo, 'info')}
          className="mt-3 -ml-3 inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-sky-700 transition hover:bg-sky-50"
        >
          {copied === 'info' ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied === 'info' ? 'Copied' : 'Copy joining info'}
        </button>
        <button
          type="button"
          onClick={() => copy(meetingLink(code), 'link')}
          className="mt-1 -ml-3 flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-sky-700 transition hover:bg-sky-50"
        >
          {copied === 'link' ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied === 'link' ? 'Copied' : 'Copy link only'}
        </button>

        <div className="mt-8 rounded-2xl bg-neutral-100 p-4 text-sm text-neutral-600">
          Up to 5 people can be in this call, for as long as you like. The link keeps working, so
          you can use it again next time.
        </div>
      </div>
    </PanelShell>
  );
}
