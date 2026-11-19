import { Link } from 'react-router';
import { CompareTable, FaqList, Figure, InlineCta, Lead, Section } from '../../components/article';
import { BarList } from '../../components/viz';
import { taka } from '../../components/format';

export function Body() {
  return (
    <>
      <Lead>
        If one order loses ৳20, a thousand orders lose ৳20,000. Scaling does not fix bad unit
        economics; it multiplies them.
      </Lead>
      <Section id="waterfall" n={1} title="Where the money goes">
        <Figure title="One ৳1,500 order, broken down (example)">
          <BarList
            items={[
              { label: 'Selling price', value: 1500, tone: 'ink' },
              { label: 'Product cost', value: 600, tone: 'muted' },
              { label: 'Delivery and packing', value: 130, tone: 'muted' },
              { label: 'COD and payment fees', value: 20, tone: 'muted' },
              {
                label: 'Returns and failed delivery',
                value: 110,
                note: 'Averaged across all orders',
                tone: 'warm',
              },
              { label: 'Ad cost', value: 380, tone: 'warm' },
              { label: 'Left over', value: 260, note: 'Contribution per order', tone: 'accent' },
            ]}
            format={taka}
          />
        </Figure>
        <p>
          That last bar, the money left over, pays for salaries, rent and your profit. If it is
          small or negative, more sales will not help.
        </p>
      </Section>
      <Section id="levers" n={2} title="The levers">
        <CompareTable
          columns={['Lever', 'How to pull it', 'Watch out for']}
          rows={[
            ['Price', 'Small rise, better positioning', 'Conversion rate'],
            ['Product cost', 'Bigger orders, new supplier', 'Quality'],
            ['Returns', 'Confirmation calls, better photos and size guides', 'Order volume'],
            ['Ad cost', 'Better creative, higher AOV', 'Scale'],
          ]}
        />
      </Section>
      <Section id="next" n={3} title="Going further">
        <p>
          Once one order makes sense, look at customers over time with{' '}
          <Link to="/blog/customer-lifetime-value-ecommerce">lifetime value</Link>, and at the whole
          month with <Link to="/blog/contribution-margin-ecommerce">contribution margin</Link>.
        </p>
      </Section>
      <InlineCta
        title="Want us to check your unit economics?"
        body="Book a free call. Bring your numbers and we will go through them together."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Should I include staff costs per order?',
              a: 'Not in unit economics. Keep fixed costs separate so you can see what changes with volume.',
            },
            {
              q: 'What if the leftover is negative?',
              a: 'Fix price, product cost or returns before spending more on ads.',
            },
          ]}
        />
      </Section>
    </>
  );
}
