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
    { label: 'Services', href: '/services' },
    { label: 'How we work', href: '/how-we-work' },
    { label: 'Get funded', href: '/get-funded' },
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
  ],
  /** Footer columns: every public page, so nothing is more than a click away. */
  footerNav: {
    Company: [
      { label: 'About', href: '/about' },
      { label: 'How we work', href: '/how-we-work' },
      { label: 'Get funded', href: '/get-funded' },
      { label: 'Training', href: '/training' },
      { label: 'Blog', href: '/blog' },
    ],
    Services: [
      { label: 'All services', href: '/services' },
      { label: 'Brand strategy', href: '/services#brand-strategy' },
      { label: 'Creative production', href: '/services#creative-production' },
      { label: 'Website & CRO', href: '/services#website-cro' },
      { label: 'Online advertising', href: '/services#online-advertising' },
      { label: 'Operational support', href: '/services#operational-support' },
    ],
  },
} as const;
