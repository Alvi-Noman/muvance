import { Link } from 'react-router';
import {
  Callout,
  FaqList,
  Figure,
  InlineCta,
  KeyTakeaways,
  Lead,
  Prose,
  PullQuote,
  Section,
} from '../../components/article';
import { Funnel, Versus } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        Every extra field in your checkout loses a few buyers. For a cash-on-delivery store, the
        checkout also decides how many orders turn out to be real. You need it short and solid.
      </Lead>
      <Prose>
        <p>
          The goal is simple: make it easy for genuine buyers to order in under a minute, while
          collecting enough to deliver and to confirm the order.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Ask only for name, phone, address and area. Skip email and account creation.',
            'Show the full price including delivery before the final button.',
            'One page beats several steps on mobile.',
            'Confirm by call or message before you ship.',
          ]}
        />
      </div>

      <Section id="leaks" n={1} title="Where checkouts leak">
        <Figure title="Visitors lost at each step of a long checkout">
          <Funnel
            stages={[
              { label: 'Clicked "Order now"', value: 1000 },
              { label: 'Saw the form', value: 860 },
              { label: 'Filled the form', value: 520, note: 'Long forms lose people here' },
              { label: 'Saw delivery charge', value: 410, note: 'Surprise costs lose more' },
              { label: 'Placed the order', value: 360 },
            ]}
            format={(v) => v.toLocaleString('en-US')}
          />
        </Figure>
      </Section>

      <Section id="design" n={2} title="Long checkout vs short checkout">
        <Versus
          left={{
            title: 'Leaky checkout',
            points: [
              'Account required before ordering',
              'Email, postcode and two address lines',
              'Delivery charge revealed at the end',
              'Three separate pages',
            ],
          }}
          right={{
            title: 'Tight checkout',
            points: [
              'Order as a guest',
              'Name, phone, full address, area dropdown',
              'Total with delivery shown upfront',
              'One page, one big button',
            ],
          }}
        />
        <Callout tone="local" title="Phone number is everything">
          It is how the courier finds the customer and how you confirm the order. Validate it (11
          digits starting with 01) and show the format as a hint.
        </Callout>
      </Section>

      <PullQuote>Easy for real buyers, a little harder for fake ones.</PullQuote>

      <Section id="real" n={3} title="Keeping orders real">
        <ul>
          <li>Confirm each order by call or message before it ships.</li>
          <li>
            For high-value or repeat-refusal orders, ask for a small advance by mobile banking.
          </li>
          <li>Flag duplicate orders from the same phone number.</li>
        </ul>
        <p>
          We go deeper in{' '}
          <Link to="/blog/reduce-fake-cod-orders-bangladesh">reducing fake COD orders</Link> and{' '}
          <Link to="/blog/order-confirmation-call-script">the confirmation call script</Link>.
        </p>
      </Section>

      <InlineCta
        title="Checkout losing buyers?"
        body="Book a free call. We will order from your store like a customer and show you where people drop off."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Should I offer online payment as well as COD?',
              a: 'Yes. Offer both. Some buyers prefer to pay online, and those orders rarely fail.',
            },
            {
              q: 'Does asking for an advance reduce orders?',
              a: 'Somewhat. Use it selectively: for expensive items, risky areas or customers who refused before.',
            },
          ]}
        />
      </Section>
    </>
  );
}
