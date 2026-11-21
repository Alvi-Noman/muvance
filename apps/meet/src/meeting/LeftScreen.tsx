import { Link } from 'react-router';
import { Header } from '@/components/Header';
import { Button, buttonStyles } from '@/components/ui';

export type LeaveReason = 'left' | 'ended' | 'removed' | 'denied' | 'full' | 'error' | 'elsewhere';

const copy: Record<LeaveReason, { title: string; text?: string; rejoin: boolean }> = {
  left: { title: 'You left the meeting', rejoin: true },
  ended: { title: 'The call has ended', text: 'A host ended the call for everyone.', rejoin: true },
  removed: { title: "You've been removed from the meeting", rejoin: false },
  denied: {
    title: "You can't join this call",
    text: 'Someone in the call denied your request to join.',
    rejoin: true,
  },
  full: {
    title: 'This call is full',
    text: 'A meeting can have 5 people at most. Try again when someone leaves.',
    rejoin: true,
  },
  error: {
    title: 'You lost your connection',
    text: 'Check your internet connection, then rejoin.',
    rejoin: true,
  },
  elsewhere: {
    title: 'You joined from another tab',
    text: 'You can only be in this call once from the same link and browser.',
    rejoin: true,
  },
};

export function LeftScreen({ reason, onRejoin }: { reason: LeaveReason; onRejoin: () => void }) {
  const { title, text, rejoin } = copy[reason];
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-20 text-center">
        <h1 className="animate-fade-up font-serif text-4xl sm:text-5xl">{title}</h1>
        {text && <p className="animate-fade-up mt-3 max-w-md text-neutral-600">{text}</p>}
        <div className="animate-fade-up mt-8 flex flex-wrap justify-center gap-3">
          {rejoin && (
            <Button variant="secondary" onClick={onRejoin}>
              {reason === 'denied' ? 'Ask again' : 'Rejoin'}
            </Button>
          )}
          <Link to="/" className={buttonStyles('primary')}>
            Return to home screen
          </Link>
        </div>
      </main>
    </div>
  );
}
