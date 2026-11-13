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
  Steps,
} from '../../components/article';
import { Calculator, LineChart } from '../../components/viz';
import { taka } from '../../components/format';

function budgetPlan(v: Record<string, number>) {
  const start = v.start ?? 0;
  const step = (v.step ?? 0) / 100;
  const days = v.every ? Math.max(1, v.every) : 3;
  const steps = Math.floor(30 / days);
  const end = start * Math.pow(1 + step, steps);
  return [
    { label: 'Increases in 30 days', value: String(steps) },
    { label: 'Daily budget after 30 days', value: taka(end), dark: true },
  ];
}

export function Body() {
  return (
    <>
      <Lead>
        You finally found a winning ad. You double the budget overnight, and by Thursday it’s losing
        money. Here’s how to scale without breaking what works.
      </Lead>
      <Prose>
        <p>
          Scaling isn’t just spending more. Every time you raise the budget, Meta has to find more
          buyers, and the next buyer is usually a little more expensive than the last. Good scaling
          manages that trade-off: grow spend as fast as possible{' '}
          <strong>while costs stay profitable</strong>.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Vertical scaling raises budget on what works; horizontal scaling adds new creative, audiences or markets.',
            'Raise budgets in steady steps (often 10–20% every 2–3 days) rather than big jumps.',
            'Large edits can send an ad set back into learning and raise costs for days.',
            'New creative is the fuel of scaling. Budget alone hits a ceiling fast.',
          ]}
        />
      </div>

      <Section id="types" n={1} title="Two ways to scale">
        <CompareTable
          columns={['', 'Vertical scaling', 'Horizontal scaling']}
          rows={[
            [
              'What you do',
              'Raise the budget of a winning campaign',
              'Add new ads, audiences, products or countries',
            ],
            ['Speed', 'Fast', 'Slower, needs new assets'],
            ['Risk', 'Costs rise as you reach less likely buyers', 'New things may not work'],
            [
              'Ceiling',
              'Hits limits within one audience and creative set',
              'Much higher over time',
            ],
            ['Best for', 'Pushing a proven winner', 'Long-term growth'],
          ]}
        />
        <p>
          The best accounts do both at once: raise budgets steadily on what works, and keep adding
          new concepts so there’s always something fresh to scale next.
        </p>
      </Section>

      <Section id="speed" n={2} title="Why doubling overnight usually backfires">
        <p>
          A big jump forces delivery to find many more buyers immediately, often by reaching further
          into people less likely to buy. It can also count as a significant edit and restart the{' '}
          <strong>learning phase</strong>, during which results swing.
        </p>
        <Figure
          title="Cost per purchase while scaling to 3× budget"
          caption="Same campaign, two approaches. Gradual increases keep costs near target; one big jump spikes them, and they take days to settle."
        >
          <LineChart
            labels={['Day 1', 'Day 3', 'Day 5', 'Day 7', 'Day 9', 'Day 11', 'Day 13', 'Day 15']}
            series={[
              {
                name: 'One big jump',
                values: [500, 820, 760, 690, 640, 610, 600, 590],
                tone: 'warm',
              },
              {
                name: 'Steady 20% steps',
                values: [500, 520, 530, 545, 550, 560, 565, 570],
                tone: 'ink',
              },
            ]}
            format={(v) => `৳${Math.round(v)}`}
            yMin={300}
            yMax={900}
          />
        </Figure>
      </Section>

      <Section id="plan" n={3} title="Plan your budget increases">
        <p>
          See how quickly steady steps add up. Small increases compound faster than most people
          expect.
        </p>
        <Figure title="Budget planner" example={false}>
          <Calculator
            inputs={[
              { id: 'start', label: 'Starting daily budget', value: 3000, prefix: '৳', step: 500 },
              { id: 'step', label: 'Increase each time', value: 20, suffix: '%', step: 5 },
              { id: 'every', label: 'Every how many days', value: 3 },
            ]}
            compute={budgetPlan}
          />
        </Figure>
        <Callout tone="tip">
          Using <strong>Advantage campaign budget</strong> (budget set at campaign level) lets Meta
          move money to the best ad sets automatically, which usually makes scaling smoother.
        </Callout>
      </Section>

      <PullQuote>
        Budget is the accelerator. Creative is the fuel. Press one without the other and you stall.
      </PullQuote>

      <Section id="guardrails" n={4} title="Guardrails while you scale">
        <ul>
          <li>
            <strong>Watch marginal cost, not average cost.</strong> If you add ৳10,000 a day, how
            many extra sales did that money bring? The average can look fine while new spend is
            unprofitable.
          </li>
          <li>
            <strong>Track MER daily.</strong> Total revenue ÷ total ad spend. If spend rises and MER
            holds, scaling is working.
          </li>
          <li>
            <strong>Consider cost caps for big pushes.</strong> A cost-per-result goal tells Meta
            not to buy sales above your limit. It may spend less, but it protects profit.
          </li>
          <li>
            <strong>Check stock and operations.</strong> Scaling into stockouts or delivery delays
            wastes the budget and hurts reviews.
          </li>
        </ul>
      </Section>

      <Section id="playbook" n={5} title="A scaling playbook">
        <Steps
          steps={[
            {
              title: 'Confirm the winner',
              body: 'At least a week of stable results at your target cost, out of the learning phase.',
            },
            {
              title: 'Check tracking and stock',
              body: 'Make sure purchases are counted correctly and you can fulfil double the orders.',
            },
            {
              title: 'Raise budget in steps',
              body: 'Around 15–20% every 2–3 days. Pause the increases if cost per purchase rises above your limit.',
            },
            {
              title: 'Feed new creative weekly',
              body: 'Iterations of the winner plus fresh concepts, added to the same ad set.',
            },
            {
              title: 'Expand horizontally',
              body: 'Once vertical growth slows, add new products, offers, regions or a second campaign for a new audience type.',
            },
            {
              title: 'Review weekly on MER',
              body: 'Decide the next week’s budget on total business results, not on Ads Manager alone.',
            },
          ]}
        />
      </Section>

      <InlineCta
        title="Found a winner and not sure how far to push it?"
        body="We build scaling plans around your margin and stock, and only get paid when you hit your sales target."
      />

      <Section id="faq" n={6} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Does duplicating a winning ad set help scaling?',
              a: 'It can work for a short boost, but duplicates compete with each other and split data. Increasing budget and adding creative to the original is usually cleaner.',
            },
            {
              q: 'How long should I wait between budget increases?',
              a: 'Many buyers wait 2–3 days so delivery can adjust and you can read the results. Waiting longer is fine; increasing several times a day isn’t.',
            },
            {
              q: 'Should I scale on weekends?',
              a: 'It depends on your buyers. Check your sales by day of week; some brands sell most on Friday and Saturday, others mid-week.',
            },
          ]}
        />
      </Section>
    </>
  );
}
