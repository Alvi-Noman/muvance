import { Link } from 'react-router';
import {
  Callout,
  FaqList,
  Figure,
  InlineCta,
  KeyTakeaways,
  Lead,
  Prose,
  Section,
} from '../../components/article';
import { Calculator } from '../../components/viz';
import { taka } from '../../components/format';

function ltv(v: Record<string, number>) {
  const aov = v.aov ?? 0;
  const margin = (v.margin ?? 0) / 100;
  const orders = v.orders ?? 1;
  const value = aov * margin * orders;
  return [
    { label: 'Profit from one order', value: taka(aov * margin) },
    { label: 'Profit over 12 months', value: taka(value), dark: true },
    { label: 'Max cost to win a customer (⅓ rule)', value: taka(value / 3) },
  ];
}

export function Body() {
  return (
    <>
      <Lead>
        If a customer buys from you four times a year, the first order does not have to be
        profitable. Knowing that number changes how much you can afford to spend on ads.
      </Lead>
      <Prose>
        <p>
          Customer lifetime value (LTV) is what a customer is worth to you over a period, usually
          six or twelve months. For brands with reorders, like skincare, food or basics, it is often
          the difference between &quot;ads do not work&quot; and &quot;ads work very well&quot;.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Use profit, not revenue, when you calculate LTV.',
            'Measure over a fixed window (6 or 12 months), from real data.',
            'A common rule: spend up to about a third of LTV to win a customer.',
            'Raise LTV with reorders, bundles and great service.',
          ]}
        />
      </div>

      <Section id="calc" n={1} title="Work out your LTV">
        <Figure title="12-month customer value">
          <Calculator
            inputs={[
              { id: 'aov', label: 'Average order value', value: 1400, prefix: '৳', step: 50 },
              {
                id: 'margin',
                label: 'Profit margin per order (before ads)',
                value: 35,
                suffix: '%',
              },
              { id: 'orders', label: 'Orders per customer in 12 months', value: 2.6, step: 0.1 },
            ]}
            compute={ltv}
          />
        </Figure>
        <Callout tone="tip" title="Use your own order history">
          Take customers who first bought a year ago and count how many orders they placed since.
          That number beats any guess.
        </Callout>
      </Section>

      <Section id="use" n={2} title="What it changes">
        <ul>
          <li>You can accept a higher cost per first purchase, because reorders pay it back.</li>
          <li>Retargeting past buyers becomes a priority, not an afterthought.</li>
          <li>Products that bring loyal customers deserve more ad budget, even at a lower ROAS.</li>
        </ul>
        <Callout tone="warning" title="Only if you have the cash">
          Paying back ad costs over months needs cash in the meantime. Plan for it, or grow more
          slowly. See <Link to="/blog/cash-flow-and-ad-spend">cash flow and ad spend</Link>.
        </Callout>
      </Section>

      <Section id="raise" n={3} title="How to raise LTV">
        <ul>
          <li>Remind customers before they run out.</li>
          <li>Offer bundles and refills that make the next order easy.</li>
          <li>Deliver on time and handle problems well. Service is the cheapest retention.</li>
        </ul>
      </Section>

      <InlineCta
        title="Want to know what your customers are worth?"
        body="Book a free call. We will look at your reorders and show you how much you can afford to spend to win a customer."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'My product is a one-time purchase. Does LTV matter?',
              a: 'Less, but referrals and related products still add value. For one-time products, the first order must be profitable.',
            },
            {
              q: 'How often should I recalculate LTV?',
              a: 'Every few months, or after big changes in products, prices or audience.',
            },
          ]}
        />
      </Section>
    </>
  );
}
