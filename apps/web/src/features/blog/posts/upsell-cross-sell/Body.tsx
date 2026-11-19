import { Link } from 'react-router';
import { Callout, FaqList, Figure, InlineCta, Lead, Section } from '../../components/article';
import { BarList, Versus } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        A good suggestion is service. “That shirt goes well with these trousers” is what a good shop
        assistant says.
      </Lead>
      <Section id="types" n={1} title="Upsell vs cross-sell">
        <Versus
          left={{
            title: 'Upsell',
            points: [
              'A better or bigger version',
              '“The 100 ml lasts twice as long for ৳300 more”',
              'Raises value of the same item',
            ],
          }}
          right={{
            title: 'Cross-sell',
            points: ['A related item', '“Add the matching belt”', 'Adds a second item'],
          }}
        />
      </Section>
      <Section id="where" n={2} title="Where to suggest">
        <Figure title="Take rate of add-on offers by placement (example)">
          <BarList
            items={[
              { label: 'Confirmation call', value: 14, tone: 'accent' },
              { label: 'Cart page', value: 9, tone: 'ink' },
              { label: 'Product page (“goes with”)', value: 6, tone: 'ink' },
              { label: 'Thank-you page', value: 4, tone: 'muted' },
            ]}
            format={(v) => `${v}%`}
          />
        </Figure>
        <Callout tone="local">
          The confirmation call is often the best moment in Bangladesh: a friendly suggestion, same
          delivery, no extra charge.
        </Callout>
      </Section>
      <Section id="rules" n={3} title="Rules that keep it helpful">
        <ul>
          <li>Suggest something genuinely related.</li>
          <li>Keep the add-on price well below the main item.</li>
          <li>One suggestion, not five.</li>
          <li>Make it easy to say no.</li>
        </ul>
        <p>
          Track the effect on{' '}
          <Link to="/blog/increase-average-order-value">average order value</Link> and on
          cancellations.
        </p>
      </Section>
      <InlineCta
        title="Want help planning add-on offers?"
        body="Book a free call. We will look at your products and suggest pairings."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Do apps for upsells slow my site?',
              a: 'Some do. Test page speed before and after installing.',
            },
            {
              q: 'Should add-ons be discounted?',
              a: 'A small discount helps, but relevance matters more.',
            },
          ]}
        />
      </Section>
    </>
  );
}
