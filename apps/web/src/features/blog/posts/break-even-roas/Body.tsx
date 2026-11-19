import { Link } from 'react-router';
import {
  Callout,
  FaqList,
  Figure,
  InlineCta,
  Lead,
  Prose,
  Section,
} from '../../components/article';
import { Calculator } from '../../components/viz';
import { taka } from '../../components/format';

function calc1(v: Record<string, number>) {
  const price = v.price ?? 0;
  const delivered = 1 - (v.returned ?? 0) / 100;
  // Revenue from a delivered order, minus product and delivery; failed orders still cost delivery.
  const profitPerOrder = delivered * (price - (v.cost ?? 0)) - (v.delivery ?? 0);
  const revenuePerOrder = price * delivered;
  if (profitPerOrder <= 0)
    return [{ label: 'Break-even ROAS', value: 'Not possible at this price', dark: true }];
  return [
    { label: 'Profit per order before ads', value: taka(profitPerOrder) },
    {
      label: 'Break-even ROAS',
      value: (revenuePerOrder / profitPerOrder).toFixed(2) + 'x',
      dark: true,
    },
  ];
}

export function Body() {
  return (
    <>
      <Lead>
        A 3x ROAS sounds great until you learn your break-even is 3.4x. Then every sale is a small
        loss.
      </Lead>
      <Prose>
        <p>
          Break-even ROAS is the return on ad spend at which a sale exactly pays for itself after
          product costs, delivery and payment fees. Above it you make money; below it you lose. It
          is specific to your business, which is why borrowed benchmarks mislead.
        </p>
      </Prose>
      <Section id="calc" n={1} title="Calculate yours">
        <Figure title="Your break-even ROAS">
          <Calculator
            inputs={[
              { id: 'price', label: 'Average selling price', value: 1500, prefix: '৳', step: 50 },
              { id: 'cost', label: 'Product cost', value: 600, prefix: '৳', step: 25 },
              {
                id: 'delivery',
                label: 'Delivery, packing and COD fee',
                value: 150,
                prefix: '৳',
                step: 10,
              },
              {
                id: 'returned',
                label: 'Share of orders not delivered',
                value: 15,
                suffix: '%',
                step: 1,
              },
            ]}
            compute={calc1}
          />
        </Figure>
        <Callout tone="tip">
          Compare this with ROAS measured on delivered sales, not Meta’s reported purchases. See{' '}
          <Link to="/blog/mer-vs-roas">MER vs ROAS</Link>.
        </Callout>
      </Section>
      <Section id="target" n={2} title="From break-even to target">
        <p>
          Break-even is the floor, not the goal. Your target ROAS should leave room for the profit
          you want, plus fixed costs like rent and salaries. Many brands set the target 20 to 40%
          above break-even for new-customer campaigns, and accept a lower one if repeat purchases
          are strong.
        </p>
      </Section>
      <Section id="lower" n={3} title="Ways to lower your break-even">
        <ul>
          <li>
            Raise <Link to="/blog/increase-average-order-value">average order value</Link> with
            bundles.
          </li>
          <li>Cut failed deliveries with confirmation calls.</li>
          <li>Negotiate product or courier costs as volume grows.</li>
          <li>Test a small price rise. It often changes break-even more than anything else.</li>
        </ul>
      </Section>
      <InlineCta
        title="Want us to calculate your real targets?"
        body="Book a free call. We will work out break-even and target ROAS with your numbers."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Does break-even ROAS change by product?',
              a: 'Yes. Each product has its own margin. Use a blended number for the account and product-level ones for decisions.',
            },
            {
              q: 'Should I include fixed costs?',
              a: 'Not in break-even per order. Cover them in your target, or check monthly contribution margin.',
            },
          ]}
        />
      </Section>
    </>
  );
}
