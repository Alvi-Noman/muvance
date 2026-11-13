export const siteConfig = {
  name: 'Muvance',
  /** Canonical public address, used for canonical links and structured data. */
  url: 'https://muvance.com',
  tagline: 'Meta ads that grow your business, not just your spend.',
  /** Every "Book a call" button goes to the booking page. */
  bookingHref: '/book',
  /** Meta Pixel (public: it's visible in every page's network requests anyway). */
  metaPixelId: '1416578116747201',
  // Section links include "/" so they also work from other pages, like /book.
  nav: [
    { label: 'Promise', href: '/#promise' },
    { label: 'Services', href: '/#services' },
    { label: 'Process', href: '/#process' },
    { label: 'FAQ', href: '/#faq' },
    { label: 'Blog', href: '/blog' },
  ],
} as const;
