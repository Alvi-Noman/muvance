import {
  Callout,
  CompareTable,
  FaqList,
  InlineCta,
  Lead,
  Section,
  Steps,
} from '../../components/article';

export function Body() {
  return (
    <>
      <Lead>
        Search Console is Google telling you, for free, how it sees your site. Surprisingly few
        store owners ever open it.
      </Lead>
      <Section id="setup" n={1} title="Setting it up">
        <Steps
          steps={[
            {
              title: 'Add your site',
              body: 'At search.google.com/search-console. A domain property covers every version of your site.',
            },
            {
              title: 'Verify',
              body: 'Usually a DNS record at your domain provider, or a tag through your platform.',
            },
            { title: 'Submit your sitemap', body: 'Often at /sitemap.xml.' },
            { title: 'Wait a few days', body: 'Data starts filling in.' },
          ]}
        />
      </Section>
      <Section id="reports" n={2} title="The four reports that matter">
        <CompareTable
          columns={['Report', 'Shows', 'Look for']}
          rows={[
            [
              'Performance',
              'Searches, clicks, impressions, position',
              'Queries with many impressions but few clicks',
            ],
            [
              'Pages (indexing)',
              'Which pages are in Google',
              'Important pages marked “not indexed”',
            ],
            ['Core Web Vitals', 'Real-user speed data', 'Pages flagged as poor on mobile'],
            ['Enhancements', 'Structured data status', 'Errors on products or FAQs'],
          ]}
        />
      </Section>
      <Section id="quick-win" n={3} title="A quick win to try">
        <p>
          In Performance, filter for pages with an average position between 5 and 15. These are
          close to the top. Improving their titles, adding useful text and linking to them from
          other pages can move them up.
        </p>
        <Callout tone="tip">
          Compare the last three months with the previous three. Seasonal products can mislead if
          you compare with last month.
        </Callout>
      </Section>
      <InlineCta
        title="Want help reading your Search Console?"
        body="Book a free call. We will find the pages closest to page one."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Is Search Console the same as Google Analytics?',
              a: 'No. Search Console shows search performance before the click. Analytics shows what people do after.',
            },
            {
              q: 'Why do some pages say “Crawled, currently not indexed”?',
              a: 'Google saw them but chose not to include them yet, often because they look thin or similar to other pages.',
            },
          ]}
        />
      </Section>
    </>
  );
}
