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

function totalCost(v: Record<string, number>) {
  const spend = v.spend ?? 0;
  const sales = v.sales ?? 0;
  const retainer = v.retainer ?? 0;
  const pctOfSpend = (spend * (v.pctSpend ?? 0)) / 100;
  const performance = (sales * (v.pctSales ?? 0)) / 100;
  return [
    { label: 'Fixed retainer', value: taka(retainer) },
    { label: '% of ad spend', value: taka(pctOfSpend) },
    { label: '% of sales (if target hit)', value: taka(performance), dark: true },
  ];
}

export function Body() {
  return (
    <>
      <Lead>
        &quot;How much does a Facebook ads agency cost?&quot; is one of the first questions owners
        ask, and one of the hardest to compare, because agencies charge in completely different
        ways.
      </Lead>
      <Prose>
        <p>
          This guide does not list prices. They change, and they vary hugely by what is included.
          Instead it explains the four common pricing models, what each one really costs you, and
          the hidden costs people forget.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'There are four common models: fixed retainer, % of ad spend, per-task, and performance-based.',
            'The agency fee is separate from your ad spend, which goes to Meta.',
            'Compare what is included: creative, tracking and reporting often cost extra.',
            'Work out the cost at your real spend and sales, not on the sales page.',
          ]}
        />
      </div>

      <Section id="models" n={1} title="The four ways agencies charge">
        <CompareTable
          columns={['Model', 'How it works', 'What it rewards']}
          rows={[
            ['Fixed retainer', 'A set fee every month, usually upfront', 'Keeping you as a client'],
            ['% of ad spend', 'A percentage of what you spend on ads', 'Spending more'],
            ['Per task or project', 'A price per campaign, video or setup', 'Doing more tasks'],
            [
              'Performance-based',
              'Nothing until an agreed target is hit, then a share of sales or profit',
              'Growing your sales',
            ],
          ]}
        />
        <Callout tone="tip">
          Many agencies mix models, for example a small retainer plus a bonus. Ask for the total you
          would pay in a good month and in a bad month.
        </Callout>
      </Section>

      <Section id="compare" n={2} title="Compare them with your own numbers">
        <p>
          Put in your expected monthly ad spend and sales, and the rates you have been quoted. The
          calculator shows what each model would cost you that month.
        </p>
        <Figure title="Agency fee by model, for one month">
          <Calculator
            inputs={[
              { id: 'spend', label: 'Monthly ad spend', value: 300000, prefix: '৳', step: 10000 },
              {
                id: 'sales',
                label: 'Monthly sales from ads',
                value: 1200000,
                prefix: '৳',
                step: 50000,
              },
              { id: 'retainer', label: 'Retainer quoted', value: 40000, prefix: '৳', step: 5000 },
              { id: 'pctSpend', label: '% of spend quoted', value: 15, suffix: '%' },
              { id: 'pctSales', label: '% of sales quoted', value: 5, suffix: '%' },
            ]}
            compute={totalCost}
          />
        </Figure>
        <p>
          Now ask the important question for each: what happens in a month where sales fall short?
          With a retainer or a % of spend, you still pay. With a performance model, you do not.
        </p>
      </Section>

      <Section id="hidden" n={3} title="The costs people forget">
        <ul>
          <li>
            <strong>Creative.</strong> Some agencies only manage ads. New videos and designs are
            billed separately, and you need them every week.
          </li>
          <li>
            <strong>Tracking setup.</strong> Pixel and Conversions API work is sometimes a one-off
            fee.
          </li>
          <li>
            <strong>Minimum terms.</strong> A three or six month minimum is a cost if things do not
            work.
          </li>
          <li>
            <strong>Your own time.</strong> An agency that needs constant chasing costs you hours
            every week.
          </li>
        </ul>
      </Section>

      <InlineCta
        title="We only get paid after you hit your target"
        body="No retainer, no setup fee, no advance payment. Book a free call and we will show you how the numbers would work for your store."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Is the ad spend included in the agency fee?',
              a: 'Almost never. Ad spend is paid to Meta. The agency fee is for the work. Always ask for both numbers separately.',
            },
            {
              q: 'Is a cheaper agency a better deal?',
              a: 'Only if it grows your sales. A low fee that wastes ad spend costs far more than a higher fee that makes it profitable.',
            },
            {
              q: 'Why would an agency work on performance only?',
              a: 'Because it shows confidence and keeps both sides aligned. The agency only says yes when it believes the numbers can work.',
            },
          ]}
        />
      </Section>
    </>
  );
}
