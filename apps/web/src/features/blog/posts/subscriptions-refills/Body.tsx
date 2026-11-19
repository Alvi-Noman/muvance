import { Link } from 'react-router';
import { Callout, FaqList, Figure, InlineCta, Lead, Section } from '../../components/article';
import { BarList } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        If you know a 50 ml serum lasts about six weeks, you know when the next order should come.
      </Lead>
      <Section id="reminder" n={1} title="Start with reminders">
        <p>
          Before building subscriptions, send a friendly reminder a few days before the product
          likely runs out, with a one-tap way to reorder. It is simple and works for COD customers
          too.
        </p>
        <Figure title="Reorders with and without a reminder (example)">
          <BarList
            items={[
              { label: 'No reminder', value: 18, tone: 'muted' },
              { label: 'Reminder by SMS', value: 26, tone: 'ink' },
              { label: 'Reminder by WhatsApp', value: 31, tone: 'accent' },
            ]}
            format={(v) => `${v}%`}
          />
        </Figure>
      </Section>
      <Section id="subscriptions" n={2} title="When to offer a subscription">
        <ul>
          <li>The product is used regularly: coffee, supplements, baby items, pet food.</li>
          <li>Customers already reorder on a pattern.</li>
          <li>You can deliver reliably on schedule.</li>
          <li>You have a way to take payment or confirm COD each cycle.</li>
        </ul>
        <Callout tone="tip">
          Let people skip, pause and change dates easily. Subscriptions that are hard to manage get
          cancelled.
        </Callout>
      </Section>
      <Section id="value" n={3} title="Why it matters">
        <p>
          Predictable orders make stock planning easier and lower the ad money you need per taka of
          revenue. See{' '}
          <Link to="/blog/customer-lifetime-value-ecommerce">customer lifetime value</Link>.
        </p>
      </Section>
      <InlineCta
        title="Selling something people run out of?"
        body="Book a free call. We will help you set up reorder reminders."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Should subscribers get a discount?',
              a: 'A small one or free delivery is common. Convenience is often the bigger draw.',
            },
            {
              q: 'Can I do subscriptions with COD?',
              a: 'Yes, with a confirmation message before each delivery.',
            },
          ]}
        />
      </Section>
    </>
  );
}
