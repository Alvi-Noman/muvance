import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { useCall } from '../call-context';

export function PanelShell({ title, children }: { title: string; children: ReactNode }) {
  const { setPanel } = useCall();
  return (
    <>
      <div className="flex items-center justify-between px-6 pt-5 pb-3">
        <h2 className="text-lg font-medium">{title}</h2>
        <button
          type="button"
          onClick={() => setPanel(null)}
          aria-label="Close"
          className="-mr-2 rounded-full p-2 transition hover:bg-black/5"
        >
          <X className="size-5" />
        </button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </>
  );
}
