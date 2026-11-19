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
        path: 'services',
        lazy: () => import('@/pages/ServicesPage').then((m) => ({ Component: m.ServicesPage })),
      },
      {
        path: 'services/:slug',
        lazy: () => import('@/pages/IndustryPage').then((m) => ({ Component: m.IndustryPage })),
      },
      {
        path: 'how-we-work',
        lazy: () => import('@/pages/HowWeWorkPage').then((m) => ({ Component: m.HowWeWorkPage })),
      },
      {
        path: 'about',
        lazy: () => import('@/pages/AboutPage').then((m) => ({ Component: m.AboutPage })),
      },
      {
        path: 'get-funded',
        lazy: () => import('@/pages/InvestPage').then((m) => ({ Component: m.InvestPage })),
      },
      {
        path: 'training',
        lazy: () => import('@/pages/TrainingPage').then((m) => ({ Component: m.TrainingPage })),
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
