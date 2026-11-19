import { Link } from 'react-router';
import {
  Callout,
  CompareTable,
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

function calc1(v: Record<string, number>) {
  const customers = Math.max(1, v.customers ?? 1);
  const adsOnly = (v.spend ?? 0) / customers;
  const full = ((v.spend ?? 0) + (v.other ?? 0)) / customers;
  return [
    { label: 'CAC, ads only', value: taka(adsOnly) },
    { label: 'Real CAC', value: taka(full), dark: true },
  ];
}

export function Body() {
  return (
    <>
      <Lead>
        If you think your customers cost ৳300 each and they actually cost ৳520, every decision you
        make about budget and price is built on sand.
      </Lead>
      <Prose>
        <p>
          Customer acquisition cost, or CAC, is what you spend to win one new customer. Simple idea,
          but two shortcuts make most people’s numbers look better than reality: counting orders
          instead of new customers, and counting ad spend alone.
        </p>
      </Prose>
      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Divide total marketing cost by new customers, not by all orders.',
            'Use delivered orders, not placed orders.',
            'Include agency fees, creative and tools, not just ad spend.',
            'Compare CAC with what a customer is worth over time.',
          ]}
        />
      </div>
      <Section id="formula" n={1} title="The honest formula">
        <p>
          CAC = (ad spend + creative costs + agency or staff costs + tools) ÷ new customers whose
          orders were delivered.
        </p>
        <Figure title="Work out your real CAC">
          <Calculator
            inputs={[
              {
                id: 'spend',
                label: 'Ad spend this month',
                value: 300000,
                prefix: '৳',
                step: 10000,
              },
              {
                id: 'other',
                label: 'Creative, fees and tools',
                value: 80000,
                prefix: '৳',
                step: 5000,
              },
              { id: 'customers', label: 'New customers delivered', value: 650, step: 10 },
            ]}
            compute={calc1}
          />
        </Figure>
      </Section>
      <Section id="mistakes" n={2} title="Three common mistakes">
        <CompareTable
          columns={['Mistake', 'Why it misleads', 'Fix']}
          rows={[
            [
              'Using Ads Manager cost per purchase',
              'It counts repeat buyers and placed orders, with Meta’s attribution',
              'Use store data for new, delivered customers',
            ],
            [
              'Ignoring returns and cancellations',
              'A cancelled order still cost you the ad',
              'Divide by delivered customers',
            ],
            [
              'Leaving out people and tools',
              'Your designer and agency are part of the cost',
              'Add them, at least monthly',
            ],
          ]}
        />
      </Section>
      <Section id="healthy" n={3} title="What is a good CAC?">
        <p>
          There is no universal number. It depends on what a customer brings you. A useful check:
          your first-order profit (before marketing) should cover most of CAC, and repeat orders
          should turn the customer clearly profitable. See{' '}
          <Link to="/blog/customer-lifetime-value-ecommerce">customer lifetime value</Link>.
        </p>
        <Callout tone="tip">
          Track CAC monthly and by channel. A rising CAC is normal as you scale. A rising CAC with
          flat sales is a warning.
        </Callout>
      </Section>
      <InlineCta
        title="Not sure what your customers really cost?"
        body="Book a free call. We will work out your true CAC with you from store data."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Is CAC the same as cost per acquisition (CPA)?',
              a: 'People use them loosely. In ad platforms, CPA usually means cost per conversion event, which includes repeat buyers. CAC should mean new customers.',
            },
            {
              q: 'Should organic customers be counted?',
              a: 'Blended CAC includes everyone, which is useful for the business. Paid CAC counts only customers from ads. Track both.',
            },
          ]}
        />
      </Section>
    </>
  );
}
