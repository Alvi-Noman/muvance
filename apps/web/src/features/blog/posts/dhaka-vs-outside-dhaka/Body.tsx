import { Link } from 'react-router';
import { FaqList, Figure, InlineCta, Lead, Prose, Section } from '../../components/article';
import { BarList, Versus } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        A lot of brands quietly treat outside-Dhaka orders as a headache. Others find that is where
        most of their growth is hiding.
      </Lead>
      <Prose>
        <p>
          Customers outside Dhaka are not one group, of course. Chattogram is not Rangpur. But a few
          patterns show up again and again in order data, and they are worth planning for.
        </p>
      </Prose>
      <Section id="differences" n={1} title="What usually changes">
        <Versus
          left={{
            title: 'Inside Dhaka',
            points: [
              'Next-day delivery is expected',
              'More willing to pay online',
              'More choice, more comparison',
              'Lower delivery charge',
            ],
          }}
          right={{
            title: 'Outside Dhaka',
            points: [
              'Two to five days is normal',
              'Strong preference for cash on delivery',
              'Fewer local options for many products',
              'Delivery charge matters a lot',
            ],
          }}
        />
      </Section>
      <Section id="numbers" n={2} title="Watch the delivered numbers, not just orders">
        <p>
          The orders from outside Dhaka can look cheap in Ads Manager, then lose money when parcels
          come back. Split your numbers by area.
        </p>
        <Figure title="Delivery success by area (example)">
          <BarList
            items={[
              { label: 'Dhaka city', value: 91, tone: 'ink' },
              { label: 'Other divisional cities', value: 84, tone: 'ink' },
              { label: 'District towns', value: 78, tone: 'accent' },
              { label: 'Upazila and rural', value: 70, tone: 'warm' },
            ]}
            format={(v) => `${v}%`}
          />
        </Figure>
        <p>
          If an area returns a lot, you have options short of excluding it: confirmation calls, a
          small advance for high-value items, or clearer delivery promises. See{' '}
          <Link to="/blog/reduce-fake-cod-orders-bangladesh">fake COD orders</Link>.
        </p>
      </Section>
      <Section id="adjust" n={3} title="What to adjust">
        <ul>
          <li>
            <strong>Be honest about timing.</strong> “Outside Dhaka: 3 to 5 days” builds more trust
            than a vague promise.
          </li>
          <li>
            <strong>Show the full price.</strong> Surprise delivery charges at confirmation cause
            cancellations.
          </li>
          <li>
            <strong>Use trust signals.</strong> A phone number, a real address and reviews from
            customers in other districts help.
          </li>
          <li>
            <strong>Consider the courier.</strong> Some couriers are much stronger in certain
            regions. See{' '}
            <Link to="/blog/choosing-a-courier-service-bangladesh">choosing a courier</Link>.
          </li>
        </ul>
      </Section>
      <InlineCta
        title="Losing money on outside-Dhaka orders?"
        body="Book a free call. We will look at delivery rates by area and find the fix."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Should I target only Dhaka with ads?',
              a: 'Usually not. You lose a large market. Fix the delivery and confirmation side first, then decide based on delivered profit.',
            },
            {
              q: 'Do I need different ads for outside Dhaka?',
              a: 'Often not, but showing delivery times and COD clearly helps everywhere.',
            },
          ]}
        />
      </Section>
    </>
  );
}
