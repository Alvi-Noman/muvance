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
  Steps,
} from '../../components/article';
import { Calculator, LineChart } from '../../components/viz';

function ratios(v: Record<string, number>) {
  const spend = v.spend || 1;
  return [
    { label: 'ROAS (what Meta claims)', value: `${((v.metaRevenue ?? 0) / spend).toFixed(1)}×` },
    {
      label: 'MER (what the business got)',
      value: `${((v.revenue ?? 0) / spend).toFixed(1)}×`,
      dark: true,
    },
    {
      label: 'Break-even MER at your margin',
      value: v.margin ? `${(100 / v.margin).toFixed(1)}×` : '–',
    },
  ];
}

export function Body() {
  return (
    <>
      <Lead>
        ROAS tells you what Meta thinks your ads earned. MER tells you what your business actually
        earned for every taka you spent. When they disagree, believe MER.
      </Lead>
      <Prose>
        <p>
          <strong>ROAS</strong> (return on ad spend) is the revenue Ads Manager credits to your ads,
          divided by what you spent. <strong>MER</strong> (marketing efficiency ratio) is your{' '}
          <em>total</em> revenue divided by your <em>total</em> ad spend, across every channel.
        </p>
        <p>
          ROAS is useful for comparing one ad against another. MER is useful for deciding how much
          to spend overall. The trouble starts when people use ROAS for both jobs.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'ROAS = revenue Meta credits to ads ÷ Meta spend. Great for comparing ads.',
            'MER = all revenue ÷ all ad spend. Great for deciding budgets, and much harder to fool.',
            'Your break-even MER is roughly 1 ÷ your margin. Above it, ads are paying for themselves.',
            'Watch both: ROAS for what to run, MER for how much to spend.',
          ]}
        />
      </div>

      <Section id="calc" n={1} title="Work out both for your store">
        <p>
          Grab last month’s numbers. Total revenue from your store, the revenue Ads Manager reports,
          total ad spend (Meta plus anything else), and your rough margin after product and delivery
          costs.
        </p>
        <Figure title="ROAS vs MER calculator" example={false}>
          <Calculator
            inputs={[
              {
                id: 'revenue',
                label: 'Total store revenue',
                value: 2400000,
                prefix: '৳',
                step: 50000,
              },
              {
                id: 'metaRevenue',
                label: 'Revenue Meta reports',
                value: 1900000,
                prefix: '৳',
                step: 50000,
              },
              { id: 'spend', label: 'Total ad spend', value: 450000, prefix: '৳', step: 10000 },
              { id: 'margin', label: 'Margin after product + delivery', value: 40, suffix: '%' },
            ]}
            compute={ratios}
          />
        </Figure>
        <Callout tone="tip">
          If your MER is above break-even, your ads are covering their cost overall, even if some
          individual ads look weak in Ads Manager.
        </Callout>
      </Section>

      <Section id="why" n={2} title="Why ROAS can mislead you">
        <CompareTable
          columns={['', 'ROAS', 'MER']}
          rows={[
            ['Who measures it', 'Meta, about itself', 'Your bank account, basically'],
            ['Affected by attribution settings', 'Yes, a lot', 'No'],
            ['Counts modelled or view-through sales', 'Yes', 'No, only real revenue'],
            [
              'Shows the effect on other channels',
              'No',
              'Yes: ads that boost search or WhatsApp sales show up',
            ],
            [
              'Good for',
              'Comparing ads, ad sets and campaigns',
              'Setting total budget, judging scaling',
            ],
          ]}
        />
      </Section>

      <Section id="scaling" n={3} title="The classic scaling trap">
        <p>
          When you increase spend, Ads Manager ROAS almost always dips. Owners see that and pull
          back. But sometimes total revenue is climbing faster than spend, because the extra ads are
          also driving people to search for you, message you, or come back later.
        </p>
        <Figure
          title="ROAS falling while MER holds up during scaling"
          caption="Meta’s reported return dips as spend grows, but the business as a whole is still growing profitably."
        >
          <LineChart
            labels={['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5']}
            series={[
              { name: 'ROAS in Ads Manager', values: [4.6, 4.2, 3.8, 3.5, 3.3], tone: 'warm' },
              { name: 'MER', values: [5.1, 5.0, 4.9, 4.9, 4.8], tone: 'ink' },
            ]}
            format={(v) => `${v.toFixed(1)}×`}
            yMin={2}
            yMax={6}
          />
        </Figure>
        <p>
          The opposite can happen too. ROAS looks brilliant, but MER is flat, which usually means
          Meta is taking credit for sales that would have happened anyway.
        </p>
      </Section>

      <Section id="routine" n={4} title="A simple weekly routine">
        <Steps
          steps={[
            {
              title: 'Every week, log three numbers',
              body: 'Total revenue, total ad spend, and MER. A spreadsheet is fine.',
            },
            {
              title: 'Compare to break-even',
              body: '1 ÷ margin. If MER is comfortably above it, you have room to spend more.',
            },
            {
              title: 'Use ROAS inside Ads Manager',
              body: 'To decide which ads and campaigns get the budget.',
            },
            {
              title: 'Change budget based on MER',
              body: 'If you raise spend and MER holds, keep going. If MER drops towards break-even, slow down.',
            },
          ]}
        />
      </Section>

      <InlineCta
        title="Want a clear view of what your ads really earn?"
        body="We report on MER and real revenue, not just Ads Manager. Book a free call to see your numbers properly."
      />

      <Section id="faq" n={5} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'What’s a good MER?',
              a: 'Anything comfortably above your break-even (1 ÷ margin). A business with a 40% margin breaks even at 2.5×, so 4× would be healthy.',
            },
            {
              q: 'Does MER work if I run lots of channels?',
              a: 'Yes, that’s the point. It includes everything. If you want more detail, track new-customer revenue separately too.',
            },
            {
              q: 'Should I stop looking at ROAS?',
              a: 'No. You still need it to decide which ads to run. Just don’t use it alone to decide how much to spend.',
            },
          ]}
        />
      </Section>
    </>
  );
}
