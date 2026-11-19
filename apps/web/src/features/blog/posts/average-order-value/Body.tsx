import { Link } from 'react-router';
import {
  Callout,
  FaqList,
  Figure,
  InlineCta,
  Lead,
  Prose,
  Section,
  Steps,
} from '../../components/article';
import { BarList } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        Getting a customer to buy is the expensive part. Getting them to add one more thing is often
        cheap.
      </Lead>
      <Prose>
        <p>
          Average order value (AOV) is simply revenue divided by number of orders. If it costs you
          ৳400 to get an order and your AOV is ৳1,200, a third of the order goes to ads. Raise AOV
          to ৳1,600 and it drops to a quarter, with the same ad results.
        </p>
      </Prose>
      <Section id="ways" n={1} title="Seven ways that work">
        <Steps
          steps={[
            {
              title: 'Bundles',
              body: 'Group items that are used together, priced a little below buying separately.',
            },
            {
              title: 'Free delivery threshold',
              body: (
                <>
                  Set it a bit above your current AOV. See{' '}
                  <Link to="/blog/free-delivery-threshold">free delivery threshold</Link>.
                </>
              ),
            },
            {
              title: 'Add-ons at checkout',
              body: 'Small, cheap, related items: socks with shoes, a case with a phone accessory.',
            },
            {
              title: 'Buy more, save more',
              body: '“Buy 2 get 10% off, buy 3 get 15%” for consumables and basics.',
            },
            {
              title: 'Better default choices',
              body: 'Show the larger size or pack first, if it is better value.',
            },
            { title: 'Gift options', body: 'Gift wrap or a card, especially around festivals.' },
            {
              title: 'Ask on the confirmation call',
              body: '“Would you like to add the matching one? Same delivery.”',
            },
          ]}
        />
        <Callout tone="local">
          The confirmation call is a uniquely strong upsell moment in Bangladesh. A friendly, short
          suggestion often adds an item with no extra delivery cost for you.
        </Callout>
      </Section>
      <Section id="effect" n={2} title="Why it matters so much">
        <Figure
          title="Share of order value spent on ads, same cost per order (example)"
          caption="Assumes ৳400 ad cost per order in every case."
        >
          <BarList
            items={[
              { label: 'AOV ৳1,000', value: 40, tone: 'warm' },
              { label: 'AOV ৳1,300', value: 31, tone: 'ink' },
              { label: 'AOV ৳1,600', value: 25, tone: 'accent' },
              { label: 'AOV ৳2,000', value: 20, tone: 'accent' },
            ]}
            format={(v) => `${v}%`}
          />
        </Figure>
      </Section>
      <Section id="careful" n={3} title="Watch for the trade-off">
        <p>
          A higher AOV is only good if conversion rate does not fall too much, and if returns do not
          rise. A bundle that is hard to understand can lower sales. Track AOV, conversion rate and
          delivery rate together for two weeks after any change.
        </p>
      </Section>
      <InlineCta
        title="Want help designing bundles and offers?"
        body="Book a free call. We will look at your products and margins and suggest a few to test."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Should AOV go up every month?',
              a: 'Not necessarily. Seasonal products, new launches and sales events all move it. Look at the trend over a quarter.',
            },
            {
              q: 'Is median order value better?',
              a: 'It can be, if a few big orders skew the average. It is worth checking both.',
            },
          ]}
        />
      </Section>
    </>
  );
}
