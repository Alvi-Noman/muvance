import { createBrowserRouter } from 'react-router';
import { RootLayout } from '@/components/layout/RootLayout';

// Pages are lazy-loaded so each route ships as its own chunk.
export const router = createBrowserRouter([
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
