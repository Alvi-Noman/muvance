import { Link } from 'react-router';
import {
  Callout,
  CompareTable,
  FaqList,
  Figure,
  InlineCta,
  Lead,
  Section,
} from '../../components/article';
import { BarList } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        Most stores change pages on a hunch and never know if it helped. Testing turns hunches into
        knowledge.
      </Lead>
      <Section id="what" n={1} title="What to test first">
        <Figure title="Likely impact of page tests (example ranking)">
          <BarList
            items={[
              { label: 'Offer or price display', value: 9, tone: 'accent' },
              { label: 'Main photo or video', value: 8, tone: 'accent' },
              { label: 'Headline and first lines', value: 7, tone: 'ink' },
              { label: 'Reviews placement', value: 6, tone: 'ink' },
              { label: 'Checkout length', value: 6, tone: 'ink' },
              { label: 'Button colour', value: 1, tone: 'muted' },
            ]}
          />
        </Figure>
      </Section>
      <Section id="how" n={2} title="How to split traffic">
        <CompareTable
          columns={['Method', 'How', 'Best for']}
          rows={[
            [
              'Testing tool or app',
              'Shows each visitor one version at random',
              'Stores with steady traffic',
            ],
            ['Two URLs, two ads', 'Duplicate the ad, change only the link', 'Ad-driven stores'],
            ['Before and after', 'Change for two weeks, compare', 'Low traffic, but less reliable'],
          ]}
        />
      </Section>
      <Section id="decide" n={3} title="Deciding">
        <p>
          Judge on orders (ideally delivered), not clicks. Wait for enough orders on each side and a
          full week. See{' '}
          <Link to="/blog/is-your-ad-test-result-real">is your test result real</Link>.
        </p>
        <Callout tone="tip">
          Test one big idea at a time. Many small changes at once leave you not knowing what worked.
        </Callout>
      </Section>
      <InlineCta
        title="Want a testing plan for your store?"
        body="Book a free call. Website and CRO is one of our service fields."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'How much traffic do I need?',
              a: 'Enough to get dozens of orders per version within a few weeks. Less than that, test bigger changes.',
            },
            {
              q: 'Can tests hurt SEO?',
              a: 'Not if done properly; tools handle this. Avoid showing search engines different content than people.',
            },
          ]}
        />
      </Section>
    </>
  );
}
