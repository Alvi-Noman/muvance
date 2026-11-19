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
  PullQuote,
  Section,
} from '../../components/article';
import { Legend, LineChart } from '../../components/viz';
import { taka } from '../../components/format';

export function Body() {
  return (
    <>
      <Lead>
        Spending ৳10,000 a day profitably is one skill. Spending ৳1,00,000 a day profitably is a
        different business. Almost everything has to grow with it, not just the budget.
      </Lead>
      <Prose>
        <p>
          The usual pattern is that costs per purchase rise as spend grows, because you reach
          further beyond your best buyers. Scaling is the work of keeping that rise slower than your
          margin can absorb.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Cost per purchase usually rises with spend. Plan for it.',
            'Creative volume must grow roughly with budget.',
            'Operations (calls, packing, couriers) break before ads do.',
            'Judge scale on total profit in taka, not ROAS.',
          ]}
        />
      </div>

      <Section id="curve" n={1} title="What happens to costs as you scale">
        <Figure title="Daily spend vs cost per purchase">
          <Legend
            items={[
              { name: 'Cost per purchase', tone: 'warm' },
              { name: 'Break-even cost', tone: 'muted' },
            ]}
          />
          <div className="mt-4">
            <LineChart
              labels={['10k', '20k', '35k', '50k', '70k', '1 lakh']}
              series={[
                { name: 'Cost per purchase', values: [380, 400, 430, 470, 520, 590], tone: 'warm' },
                {
                  name: 'Break-even cost',
                  values: [650, 650, 650, 650, 650, 650],
                  tone: 'muted',
                  dashed: true,
                },
              ]}
              format={taka}
            />
          </div>
        </Figure>
        <p>
          In this example, every step up costs a bit more per sale, but all of them stay below
          break-even, so total profit keeps growing. Once the line crosses break-even, more spend
          loses money.
        </p>
      </Section>

      <Section id="what-changes" n={2} title="What has to change at each level">
        <CompareTable
          columns={['Area', 'At ৳10k/day', 'At ৳1 lakh/day']}
          rows={[
            ['Creative', 'A few new ads a week', 'Many new ads a week, several formats'],
            ['Products', 'One hero product', 'Several winners and bundles'],
            ['Audience', 'Broad, one country', 'Broad, plus new angles for new segments'],
            ['Operations', 'Owner packs orders', 'Call centre, warehouse, multiple couriers'],
            ['Cash', 'Paid from last week’s sales', 'Needs planning; stock and ads paid ahead'],
          ]}
        />
        <Callout tone="warning" title="Scaling breaks operations first">
          Ten times the orders means ten times the confirmation calls, packing and returns. If those
          slip, delivered sales fall even while Ads Manager looks great.
        </Callout>
      </Section>

      <PullQuote>
        You do not scale a budget. You scale a business that can carry the budget.
      </PullQuote>

      <Section id="how" n={3} title="How to step up safely">
        <ul>
          <li>Raise budgets gradually on winners, and watch cost per delivered order.</li>
          <li>Add new creative before raising spend, not after costs climb.</li>
          <li>
            Open new campaigns for new angles instead of forcing one campaign to do everything.
          </li>
        </ul>
        <p>
          Our guide on <Link to="/blog/how-to-scale-winning-meta-ads">scaling a winning ad</Link>{' '}
          covers the campaign side in detail.
        </p>
      </Section>

      <InlineCta
        title="Ready to grow, but worried it will break?"
        body="We support scaling with creative, operations and even ad credits. Book a free call to plan your next step."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'How fast can I increase my budget?',
              a: 'Gradually works best: steps every few days on campaigns that are clearly profitable, with new creative ready.',
            },
            {
              q: 'My costs jumped when I doubled spend. Is that normal?',
              a: 'Some rise is normal. A big jump usually means you need more creative or more products, not just more budget.',
            },
          ]}
        />
      </Section>
    </>
  );
}
