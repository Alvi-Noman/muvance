import { Link } from 'react-router';
import { CompareTable, FaqList, Figure, InlineCta, Lead, Section } from '../../components/article';
import { BarList } from '../../components/viz';
import { taka } from '../../components/format';

export function Body() {
  return (
    <>
      <Lead>
        A creator post with 80,000 views and 4 sales is not rare. Neither is one with 8,000 views
        and 60 sales.
      </Lead>
      <Section id="track" n={1} title="Ways to track">
        <CompareTable
          columns={['Method', 'How', 'Limit']}
          rows={[
            [
              'Unique discount code',
              'One code per creator',
              'Codes get shared beyond the audience',
            ],
            ['Tracked link', 'A link with UTM tags', 'Many people do not click; they search later'],
            ['Sales lift', 'Compare sales before, during and after', 'Other things change too'],
            ['Ask customers', '“How did you hear about us?”', 'Memory is imperfect'],
          ]}
        />
        <p>
          Use two methods together. See{' '}
          <Link to="/blog/utm-parameters-for-meta-ads">UTM parameters</Link>.
        </p>
      </Section>
      <Section id="compare" n={2} title="Comparing creators">
        <Figure title="Cost per delivered order by creator (example)">
          <BarList
            items={[
              { label: 'Micro creator A (12k)', value: 280, tone: 'accent' },
              { label: 'Micro creator B (25k)', value: 340, tone: 'accent' },
              { label: 'Mid creator (150k)', value: 610, tone: 'ink' },
              {
                label: 'Celebrity (1M+)',
                value: 1450,
                note: 'Bigger awareness, harder to measure',
                tone: 'warm',
              },
            ]}
            format={taka}
          />
        </Figure>
      </Section>
      <Section id="content" n={3} title="The hidden value: content">
        <p>
          Creator videos often make strong ads. Agree upfront that you can use the content in ads,
          for how long, and whether the creator’s handle appears. One post can then work for months.
          See <Link to="/blog/ugc-creators-influencers-bangladesh">UGC creators in Bangladesh</Link>
          .
        </p>
      </Section>
      <InlineCta
        title="Want to measure creators properly?"
        body="Book a free call. We will set up tracking before your next collaboration."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Are micro-influencers better?',
              a: 'Often for direct sales, because their audiences trust them more. Big names help with awareness.',
            },
            {
              q: 'Should posts be marked as paid?',
              a: 'Yes. Use the platform’s paid partnership label. It is required and builds trust.',
            },
          ]}
        />
      </Section>
    </>
  );
}
