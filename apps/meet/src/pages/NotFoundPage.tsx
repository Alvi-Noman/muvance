import { Link } from 'react-router';
import { Header } from '@/components/Header';
import { buttonStyles } from '@/components/ui';

export function NotFoundPage({
  title = 'Check your meeting code',
  text = 'Make sure you typed the meeting code correctly or used the full link from the invite.',
}: {
  title?: string;
  text?: string;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-20 text-center">
        <h1 className="font-serif text-4xl sm:text-5xl">{title}</h1>
        <p className="mt-3 max-w-md text-neutral-600">{text}</p>
        <Link to="/" className={buttonStyles('primary', 'md') + ' mt-8'}>
          Return to home screen
        </Link>
      </main>
    </div>
  );
}
