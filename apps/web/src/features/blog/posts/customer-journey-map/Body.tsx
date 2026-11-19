import { CompareTable, FaqList, Figure, InlineCta, Lead, Section } from '../../components/article';
import { Flow, Funnel } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        Most brands obsess over one step, usually the ad. The customer, meanwhile, goes through
        eight.
      </Lead>
      <Section id="stages" n={1} title="The stages">
        <p>
          A typical path for an online store looks like this. Yours might add a Messenger chat or a
          phone call in the middle.
        </p>
        <Flow
          nodes={[
            { title: 'See', body: 'Ad, post, friend' },
            { title: 'Consider', body: 'Page, reviews, chat' },
            { title: 'Order', body: 'Checkout' },
            { title: 'Confirm', body: 'Call or SMS' },
            { title: 'Receive', body: 'Delivery, unboxing', highlight: true },
            { title: 'Return', body: 'Second order' },
          ]}
        />
      </Section>
      <Section id="drop" n={2} title="Where people drop off">
        <p>
          Put real numbers on each step for one month. The biggest drop is usually the best place to
          start, because a small fix there moves everything after it.
        </p>
        <Figure title="One month, 10,000 visitors (example)">
          <Funnel
            stages={[
              { label: 'Visited product page', value: 10000 },
              { label: 'Added to cart', value: 900, note: '9%' },
              { label: 'Placed order', value: 380, note: '42% of carts' },
              { label: 'Confirmed', value: 320, note: '84%' },
              { label: 'Delivered', value: 275, note: '86%' },
              { label: 'Ordered again within 90 days', value: 55, note: '20%' },
            ]}
          />
        </Figure>
      </Section>
      <Section id="feel" n={3} title="Add what the customer feels">
        <p>
          Next to each step, write what the customer is thinking. “Is this shop real?” at the page.
          “Why is delivery extra?” at checkout. “When is it coming?” after ordering. These feelings
          are your to-do list.
        </p>
        <CompareTable
          columns={['Step', 'Customer thinks', 'Fix to try']}
          rows={[
            ['Product page', '“Will it look like this?”', 'Real customer photos'],
            ['Checkout', '“So many fields”', 'Shorter form, phone first'],
            ['Waiting', '“Has it shipped?”', 'SMS with tracking'],
            ['Unboxing', '“Nice!”', 'A note and a reason to come back'],
          ]}
        />
      </Section>
      <InlineCta
        title="Want a second pair of eyes on your journey?"
        body="Book a free call. We will map it with you and point out the cheapest fix."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'How detailed should the map be?',
              a: 'One page. If it needs a wall, it will not get used.',
            },
            {
              q: 'Who should be involved?',
              a: 'Whoever runs ads, the website, the call team and delivery. Each sees a different part.',
            },
          ]}
        />
      </Section>
    </>
  );
}
