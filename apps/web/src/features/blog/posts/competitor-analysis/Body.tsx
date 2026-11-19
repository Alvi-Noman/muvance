import { Link } from 'react-router';
import { CompareTable, FaqList, InlineCta, Lead, Section } from '../../components/article';

export function Body() {
  return (
    <>
      <Lead>
        Copying a competitor makes you the second-best version of them. Studying them shows you
        where they leave a gap.
      </Lead>
      <Section id="who" n={1} title="Who to watch">
        <ul>
          <li>Two or three direct competitors selling similar products at similar prices.</li>
          <li>One bigger brand customers compare you with.</li>
          <li>One brand in another country doing what you want to do well.</li>
        </ul>
      </Section>
      <Section id="what" n={2} title="What to look at">
        <CompareTable
          columns={['Area', 'Where to look', 'What to note']}
          rows={[
            ['Ads', 'Meta Ad Library', 'Angles, formats, how long ads have run'],
            ['Prices and offers', 'Their site and pages', 'Price range, delivery charge, bundles'],
            [
              'Reviews and comments',
              'Their posts and pages',
              'What customers love and complain about',
            ],
            ['Product pages', 'Their store', 'Photos, sizing, trust signals'],
            ['Search', 'Google results', 'Which searches they rank for'],
          ]}
        />
        <p>
          More on ads in{' '}
          <Link to="/blog/meta-ad-library-competitor-research">the Meta Ad Library guide</Link>.
        </p>
      </Section>
      <Section id="gap" n={3} title="Finding your gap">
        <p>
          Their complaints are your opportunity. If customers keep saying “sizes run small” or
          “delivery took forever”, make that your strength and say so clearly. See{' '}
          <Link to="/blog/position-a-small-brand-against-bigger-competitors">
            positioning a small brand
          </Link>
          .
        </p>
      </Section>
      <InlineCta
        title="Want a competitor review?"
        body="Book a free call. We will look at your market with you."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'How often should I check competitors?',
              a: 'A quick look monthly, a deeper one each quarter.',
            },
            {
              q: 'Should I match their prices?',
              a: 'Not automatically. Compete on value and service where you can.',
            },
          ]}
        />
      </Section>
    </>
  );
}
