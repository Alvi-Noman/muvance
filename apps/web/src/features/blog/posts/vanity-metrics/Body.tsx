import { Link } from 'react-router';
import { FaqList, InlineCta, Lead, PullQuote, Section } from '../../components/article';
import { Versus } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>Fifty thousand followers and a business that loses money is a very common story.</Lead>
      <Section id="sort" n={1} title="Sorting your numbers">
        <Versus
          left={{
            title: 'Feels good',
            points: [
              'Page likes and followers',
              'Reach and impressions',
              'Post likes',
              'Video views',
              'Website visits',
            ],
          }}
          right={{
            title: 'Pays the bills',
            points: [
              'Delivered orders and revenue',
              'Contribution margin',
              'Cost per new customer',
              'Repeat purchase rate',
              'Cash in the bank',
            ],
          }}
        />
      </Section>
      <Section id="not-useless" n={2} title="They are not useless">
        <p>
          Vanity metrics are fine as early signals. A hook rate tells you the ad stops thumbs.
          Engagement can hint that a message resonates. The problem is treating them as results.
        </p>
        <PullQuote>
          Use soft metrics to make better ads. Use hard metrics to decide what to spend.
        </PullQuote>
      </Section>
      <Section id="report" n={3} title="What to put in a monthly report">
        <ol>
          <li>Revenue and delivered orders</li>
          <li>Total marketing spend and MER</li>
          <li>New customers and their cost</li>
          <li>Contribution margin</li>
          <li>What we tested, what we learned, what is next</li>
        </ol>
        <p>
          Anything else is supporting detail. If an agency’s report leads with reach, ask why. See{' '}
          <Link to="/blog/what-a-good-ads-report-shows">what a good ads report shows</Link>.
        </p>
      </Section>
      <InlineCta
        title="Want reports that focus on money?"
        body="Book a free call. We will show you the one-page report we send clients."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Do followers matter at all?',
              a: 'They help a little with trust and organic reach. They are not a goal in themselves.',
            },
            {
              q: 'Should I buy followers to look established?',
              a: 'No. Fake followers hurt engagement, confuse your data and can damage trust if noticed.',
            },
          ]}
        />
      </Section>
    </>
  );
}
