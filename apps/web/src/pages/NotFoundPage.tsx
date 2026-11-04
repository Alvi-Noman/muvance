import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <section className="space-y-4 px-4 py-24 text-center">
      <h1 className="font-serif text-7xl">404</h1>
      <p className="text-neutral-500">This page doesn't exist.</p>
      <Link to="/" className="font-medium text-neutral-950 underline-offset-4 hover:underline">
        Go home
      </Link>
    </section>
  );
}
