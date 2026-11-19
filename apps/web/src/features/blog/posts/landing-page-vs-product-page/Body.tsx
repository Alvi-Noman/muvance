import { Link } from 'react-router';
import { FaqList, Figure, InlineCta, Lead, Section } from '../../components/article';
import { BarList, Versus } from '../../components/viz';
import { taka } from '../../components/format';

export function Body() {
  return (
    <>
      <Lead>
        A product page sells one product to someone who already wants it. A landing page persuades
        someone who is not sure yet.
      </Lead>
      <Section id="compare" n={1} title="The difference">
        <Versus
          left={{
            title: 'Product page',
            points: [
              'Standard store page',
              'Quick to set up',
              'Good for known products and warm traffic',
              'Shoppers can browse other items',
            ],
          }}
          right={{
            title: 'Landing page',
            points: [
              'Built for one offer or campaign',
              'Tells a fuller story: problem, proof, offer',
              'Good for new or complex products and cold traffic',
              'Fewer distractions',
            ],
          }}
        />
      </Section>
      <Section id="when" n={2} title="When a landing page helps">
        <ul>
          <li>The product needs explaining (a new type of gadget, a health product).</li>
          <li>The price is higher than people expect.</li>
          <li>You run a bundle or campaign offer that is not on a normal page.</li>
          <li>Ads tell a story the product page does not continue.</li>
        </ul>
      </Section>
      <Section id="test" n={3} title="Testing it fairly">
        <Figure title="Cost per delivered order, same ads, different destination (example)">
          <BarList
            items={[
              { label: 'Product page', value: 460, tone: 'ink' },
              { label: 'Landing page', value: 390, tone: 'accent' },
            ]}
            format={taka}
          />
        </Figure>
        <p>
          Use the same ads and split traffic by sending duplicated ads to each URL, or use an A/B
          test. Judge on delivered orders, not clicks. See{' '}
          <Link to="/blog/ab-testing-landing-pages">A/B testing landing pages</Link>.
        </p>
      </Section>
      <InlineCta
        title="Want a landing page built for your ads?"
        body="Book a free call. Website and CRO is one of our service fields."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Is a landing page expensive to build?',
              a: 'Many store platforms and page builders make it straightforward. The writing takes the most effort.',
            },
            {
              q: 'Should every ad have its own page?',
              a: 'No. Start with one landing page for your main product or offer.',
            },
          ]}
        />
      </Section>
    </>
  );
}
