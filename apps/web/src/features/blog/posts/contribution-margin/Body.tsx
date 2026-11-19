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

function margin(v: Record<string, number>) {
  const sales = v.sales ?? 0;
  const cogs = (sales * (v.cogs ?? 0)) / 100;
  const fulfil = (v.orders ?? 0) * (v.perOrder ?? 0);
  const ads = v.ads ?? 0;
  const cm = sales - cogs - fulfil - ads;
  return [
    { label: 'Before ads (contribution margin 1)', value: taka(sales - cogs - fulfil) },
    { label: 'After ads (contribution margin 2)', value: taka(cm), dark: true },
    { label: 'As % of sales', value: sales ? `${((cm / sales) * 100).toFixed(1)}%` : '–' },
  ];
}

export function Body() {
  return (
    <>
      <Lead>
        Revenue is vanity. ROAS is a hint. Contribution margin is the number that tells you whether
        your ads are actually making you money.
      </Lead>
      <Prose>
        <p>
          Contribution margin is what is left from sales after paying for the product, getting it to
          the customer, and the ads that sold it. It is what &quot;contributes&quot; to rent,
          salaries and profit.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Contribution margin = sales − product cost − fulfilment − ad spend.',
            'Track it monthly, ideally weekly.',
            'A rising ROAS with a falling contribution margin is a warning.',
            'Growth decisions should be based on it, not on revenue.',
          ]}
        />
      </div>

      <Section id="calc" n={1} title="Calculate yours">
        <Figure title="Monthly contribution margin">
          <Calculator
            inputs={[
              { id: 'sales', label: 'Delivered sales', value: 2000000, prefix: '৳', step: 50000 },
              { id: 'cogs', label: 'Product cost as % of sales', value: 40, suffix: '%' },
              { id: 'orders', label: 'Delivered orders', value: 1400, step: 50 },
              {
                id: 'perOrder',
                label: 'Packing + delivery + COD fee per order',
                value: 120,
                prefix: '৳',
                step: 10,
              },
              { id: 'ads', label: 'Ad spend', value: 450000, prefix: '৳', step: 10000 },
            ]}
            compute={margin}
          />
        </Figure>
        <Callout tone="local" title="Do not forget failed deliveries">
          Use delivered sales, and include what returned parcels cost you in fulfilment. In COD
          markets this is often where the profit leaks.
        </Callout>
      </Section>

      <Section id="use" n={2} title="How to use it">
        <ul>
          <li>
            <strong>Scaling decisions:</strong> if more ad spend raises contribution margin in taka,
            keep going, even if ROAS falls a little.
          </li>
          <li>
            <strong>Product decisions:</strong> some best sellers by revenue barely contribute.
            Calculate it per product.
          </li>
          <li>
            <strong>Offer decisions:</strong> discounts and free delivery come straight out of it.
          </li>
        </ul>
      </Section>

      <Section id="vs" n={3} title="Contribution margin vs ROAS">
        <p>
          ROAS only knows ad spend and revenue. Contribution margin also knows what the product and
          delivery cost. Two months with the same ROAS can have very different margins if product
          mix or returns changed. That is why we pair it with{' '}
          <Link to="/blog/mer-vs-roas">MER</Link> and a{' '}
          <Link to="/blog/what-is-a-good-roas-bangladesh">break-even ROAS</Link>.
        </p>
      </Section>

      <InlineCta
        title="Want ads judged on profit, not revenue?"
        body="That is how we work: our fee depends on your results. Book a free call to see your numbers together."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'What is a good contribution margin?',
              a: 'It depends on your fixed costs. It needs to cover rent, salaries and other overheads, with something left over.',
            },
            {
              q: 'Should I include staff costs?',
              a: 'Not in contribution margin. Those are fixed costs. Keep them separate so you can see what each sale contributes.',
            },
          ]}
        />
      </Section>
    </>
  );
}
