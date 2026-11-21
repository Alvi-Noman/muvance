import { Button, Dialog } from '@/components/ui';
import { useCall } from './call-context';

/** The red "Recording" sign everyone in the call sees, in the top left corner. */
export function RecordingBadge() {
  const { recording } = useCall();
  if (!recording.active) return null;
  return (
    <div
      className="absolute top-4 left-4 z-20 flex items-center gap-2 rounded-full bg-black/60 py-1.5 pr-3.5 pl-3 text-sm font-medium backdrop-blur"
      role="status"
      title={recording.startedByName ? `Started by ${recording.startedByName}` : undefined}
    >
      <span className="relative flex size-2.5">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-500 opacity-75" />
        <span className="relative inline-flex size-2.5 rounded-full bg-red-500" />
      </span>
      Recording
    </div>
  );
}

/** Hosts confirm before recording, and are reminded to tell the others. */
export function RecordingConfirm() {
  const { recording, confirmRecordingOpen, setConfirmRecordingOpen } = useCall();
  return (
    <Dialog
      open={confirmRecordingOpen}
      onClose={() => setConfirmRecordingOpen(false)}
      title="Record this call?"
      dark
    >
      <p className="text-sm text-white/80">
        Everyone in the call will see that it's being recorded. It's good practice to ask them
        first.
      </p>
      <p className="mt-3 text-sm text-white/60">
        The video (with the shared screen when someone presents) is saved on Muvance's server. Your
        team can watch or download it under <strong>Call recordings</strong> in the admin.
      </p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="dark" onClick={() => setConfirmRecordingOpen(false)}>
          Cancel
        </Button>
        <Button
          variant="danger"
          disabled={recording.starting}
          onClick={() => {
            recording.start();
            setConfirmRecordingOpen(false);
          }}
        >
          Start recording
        </Button>
      </div>
    </Dialog>
  );
}
