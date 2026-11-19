import { Link } from 'react-router';
import { CompareTable, FaqList, Figure, InlineCta, Lead, Section } from '../../components/article';
import { Legend, LineChart } from '../../components/viz';
import { taka } from '../../components/format';

export function Body() {
  return (
    <>
      <Lead>
        Some customers are profitable on their first order. Others only pay back after their third.
        Knowing which you have changes how fast you can grow.
      </Lead>
      <Section id="what" n={1} title="What payback means">
        <p>
          Payback period is the time it takes for the profit from a customer to cover their{' '}
          <Link to="/blog/customer-acquisition-cost-explained">acquisition cost</Link>. If you spend
          ৳600 to win a customer who brings ৳350 profit on the first order and ৳300 on the second a
          month later, payback is about a month.
        </p>
        <Figure title="Profit from one customer over time (example)">
          <Legend
            items={[
              { name: 'Cumulative profit', tone: 'accent' },
              { name: 'Acquisition cost', tone: 'muted' },
            ]}
          />
          <LineChart
            labels={['Order 1', '30 days', '60 days', '90 days', '120 days']}
            series={[
              { name: 'Cumulative profit', values: [350, 650, 820, 1050, 1180], tone: 'accent' },
              {
                name: 'Acquisition cost',
                values: [600, 600, 600, 600, 600],
                tone: 'muted',
                dashed: true,
              },
            ]}
            format={taka}
          />
        </Figure>
      </Section>
      <Section id="cash" n={2} title="Why it matters for cash">
        <p>
          A long payback means you fund growth from your own pocket for months. Courier payouts and
          stock purchases make this worse. That is why a brand can look profitable on paper and
          still run out of cash. See{' '}
          <Link to="/blog/cash-flow-and-ad-spend">cash flow and ad spend</Link>.
        </p>
      </Section>
      <Section id="target" n={3} title="A sensible target">
        <CompareTable
          columns={['Payback', 'What it usually means', 'How to grow']}
          rows={[
            ['First order', 'Very healthy, or you are under-investing', 'Push budget harder'],
            ['Within 60 days', 'Healthy for most consumer brands', 'Grow steadily'],
            [
              '60 to 180 days',
              'Works only with strong repeat buyers and enough cash',
              'Grow carefully',
            ],
            ['Over 180 days', 'Risky for a small brand', 'Fix margin or retention first'],
          ]}
        />
      </Section>
      <InlineCta
        title="Want to know your payback period?"
        body="Book a free call. We will work it out from your order history."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'How do I get repeat-purchase data?',
              a: 'Export orders from your store and group by phone number. Even a spreadsheet can do it.',
            },
            {
              q: 'Should payback be faster for cheaper products?',
              a: 'Usually. Low-priced items need repeat buying or bundles to pay back quickly.',
            },
          ]}
        />
      </Section>
    </>
  );
}
