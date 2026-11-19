import {
  Callout,
  CompareTable,
  FaqList,
  Figure,
  InlineCta,
  KeyTakeaways,
  Lead,
  Prose,
  PullQuote,
  Section,
} from '../../components/article';
import { Calculator } from '../../components/viz';
import { taka } from '../../components/format';

function compare(v: Record<string, number>) {
  const price = v.price ?? 0;
  const cost = v.cost ?? 0;
  const discountProfit = price * (1 - (v.discount ?? 0) / 100) - cost;
  // Bundle of two: second unit at the bundle discount, delivery paid once.
  const bundlePrice = price * 2 * (1 - (v.bundle ?? 0) / 100);
  const bundleProfit = bundlePrice - cost * 2 + (v.delivery ?? 0);
  return [
    { label: 'Profit per order with % discount', value: taka(discountProfit) },
    { label: 'Profit per order with 2-pack', value: taka(bundleProfit), dark: true },
  ];
}

export function Body() {
  return (
    <>
      <Lead>
        A good offer can double your conversion rate. A careless one can double your sales and halve
        your profit. The difference is in how the offer is built.
      </Lead>
      <Prose>
        <p>
          Straight discounts are the easiest offer and often the most expensive. Here are the
          alternatives that tend to protect margin, and a calculator to compare them.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Bundles raise order value, so ad and delivery costs are spread wider.',
            'Free delivery above a threshold often beats a discount.',
            'Gifts with purchase cost less than they look worth.',
            'Always calculate profit per order, not just sales.',
          ]}
        />
      </div>

      <Section id="types" n={1} title="Offer types compared">
        <CompareTable
          columns={['Offer', 'Good for', 'Risk']}
          rows={[
            ['% discount', 'Clearing stock, big sale days', 'Trains customers to wait for sales'],
            [
              'Bundle (buy 2 or 3)',
              'Raising order value',
              'Needs products people want more than one of',
            ],
            [
              'Free delivery threshold',
              'Nudging bigger baskets',
              'Threshold set too high or too low',
            ],
            ['Gift with purchase', 'Adding perceived value cheaply', 'A gift nobody wants'],
            ['Guarantee or exchange', 'Removing doubt', 'Needs real operations behind it'],
          ]}
        />
      </Section>

      <Section id="calc" n={2} title="Discount or bundle? Do the maths">
        <p>
          Put in your own numbers. The bundle line assumes the customer buys two units and you pay
          delivery once instead of twice.
        </p>
        <Figure title="Profit per order: discount vs 2-pack">
          <Calculator
            inputs={[
              { id: 'price', label: 'Normal price', value: 1200, prefix: '৳', step: 50 },
              { id: 'cost', label: 'Product cost', value: 500, prefix: '৳', step: 50 },
              { id: 'discount', label: 'Discount offered', value: 20, suffix: '%' },
              { id: 'bundle', label: 'Discount on 2-pack', value: 15, suffix: '%' },
              { id: 'delivery', label: 'Delivery cost saved', value: 80, prefix: '৳', step: 10 },
            ]}
            compute={compare}
          />
        </Figure>
        <Callout tone="tip">
          If the bundle wins, make it the default choice on the product page, with the single unit
          as the option.
        </Callout>
      </Section>

      <PullQuote>The best offer is the one that makes buying easier, not cheaper.</PullQuote>

      <Section id="rules" n={3} title="Rules that keep offers healthy">
        <ul>
          <li>Run big discounts only on real occasions (Eid, 11.11, clearance).</li>
          <li>Never discount your best seller just because sales dipped for a week.</li>
          <li>Test offers like ads: one change at a time, judged on profit.</li>
        </ul>
      </Section>

      <InlineCta
        title="Want help building offers that protect margin?"
        body="Book a free call. We will look at your products and prices and suggest offers worth testing."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Do discounts make Meta ads cheaper?',
              a: 'They can raise conversion rate, which lowers cost per purchase. Whether that is worth it depends on the margin you give away.',
            },
            {
              q: 'How do I set a free delivery threshold?',
              a: 'A common start is a little above your current average order value, so many customers add one more item to reach it.',
            },
          ]}
        />
      </Section>
    </>
  );
}
