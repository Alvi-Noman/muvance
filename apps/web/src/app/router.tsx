import { createBrowserRouter } from 'react-router';
import { RootLayout } from '@/components/layout/RootLayout';
import { BookingTargetContext } from '@/lib/booking-target';

// Pages are lazy-loaded so each route ships as its own chunk.
export const router = createBrowserRouter([
  // Ad landing page: not linked from the site, no menu, hidden from search engines.
  {
    path: '/growth',
    // Every "Book a call" here scrolls to the calendar at the bottom of the page (#book).
    element: (
      <BookingTargetContext value="book">
        <RootLayout minimal />
      </BookingTargetContext>
    ),
    children: [
      {
        index: true,
        lazy: () => import('@/pages/GrowthPage').then((m) => ({ Component: m.GrowthPage })),
      },
    ],
  },
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        lazy: () => import('@/pages/HomePage').then((m) => ({ Component: m.HomePage })),
      },
      {
        path: 'book',
        lazy: () => import('@/pages/BookPage').then((m) => ({ Component: m.BookPage })),
      },
      {
        path: 'blog',
        lazy: () => import('@/pages/BlogPage').then((m) => ({ Component: m.BlogPage })),
      },
      {
        path: 'blog/:slug',
        lazy: () => import('@/pages/BlogPostPage').then((m) => ({ Component: m.BlogPostPage })),
      },
      {
        path: 'thank-you',
        lazy: () => import('@/pages/ThankYouPage').then((m) => ({ Component: m.ThankYouPage })),
      },
      {
        path: '*',
        lazy: () => import('@/pages/NotFoundPage').then((m) => ({ Component: m.NotFoundPage })),
      },
    ],
  },
]);
