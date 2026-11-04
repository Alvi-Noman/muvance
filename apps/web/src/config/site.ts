export const siteConfig = {
  name: 'Muvance',
  tagline: 'Meta ads that grow your business, not just your spend.',
  /** Every "Book a call" button goes to the booking page. */
  bookingHref: '/book',
  // Section links include "/" so they also work from other pages, like /book.
  nav: [
    { label: 'Promise', href: '/#promise' },
    { label: 'Services', href: '/#services' },
    { label: 'Process', href: '/#process' },
    { label: 'FAQ', href: '/#faq' },
  ],
} as const;
