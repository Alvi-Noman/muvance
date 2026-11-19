import { Link } from 'react-router';
import { CompareTable, FaqList, InlineCta, Lead, Section } from '../../components/article';
import { Checklist } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        The best content in the world will not rank if Google cannot reach it, or if the page takes
        eight seconds to load on a phone.
      </Lead>
      <Section id="checklist" n={1} title="The checklist">
        <Checklist
          items={[
            'Site is on HTTPS',
            'Sitemap submitted in Search Console',
            'Important pages are indexed (check the Pages report)',
            'Pages load quickly on a mid-range phone',
            'No large layout jumps while loading',
            'Each page has a unique title and description',
            'Old URLs redirect to new ones (301)',
            'No important broken links',
            'robots.txt is not blocking key pages',
          ]}
          verdicts={[
            'Fix these before anything else.',
            'Mostly there. Close the gaps.',
            'Solid foundation.',
          ]}
        />
      </Section>
      <Section id="speed" n={2} title="Speed: what usually helps">
        <CompareTable
          columns={['Problem', 'Typical cause', 'Fix']}
          rows={[
            ['Slow first load', 'Huge images', 'Compress, use modern formats, right sizes'],
            ['Slow everywhere', 'Too many apps or plugins', 'Remove what you do not use'],
            [
              'Jumping layout',
              'Images without set sizes, late banners',
              'Reserve space for images and banners',
            ],
            ['Slow on 4G', 'Heavy scripts, chat widgets', 'Load them later or remove'],
          ]}
        />
        <p>
          More on this in{' '}
          <Link to="/blog/product-page-speed-mobile">product page speed on mobile</Link>.
        </p>
      </Section>
      <Section id="duplicates" n={3} title="Duplicates and redirects">
        <p>
          The same product reachable at several URLs splits its strength. Most platforms add a
          “canonical” tag to point Google at the main one; check it is there. When you change a URL,
          always redirect the old one, or you lose its rankings and any links pointing to it.
        </p>
      </Section>
      <InlineCta
        title="Want a technical check of your site?"
        body="Book a free call. We will run a quick audit and explain it in plain words."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Do I need a developer for this?',
              a: 'Many fixes are settings in Shopify or WordPress. Speed and redirects sometimes need help.',
            },
            {
              q: 'How often should I check?',
              a: 'Glance at Search Console monthly, and after any big site change.',
            },
          ]}
        />
      </Section>
    </>
  );
}
