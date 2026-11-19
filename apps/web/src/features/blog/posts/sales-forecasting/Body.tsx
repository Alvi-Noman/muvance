import { Callout, FaqList, Figure, InlineCta, Lead, Section } from '../../components/article';
import { Calculator } from '../../components/viz';
import { taka } from '../../components/format';

function calc1(v: Record<string, number>) {
  const delivered = (v.goal ?? 0) / Math.max(1, v.aov ?? 1);
  const placed = delivered / Math.max(0.01, (v.delivery ?? 100) / 100);
  return [
    { label: 'Delivered orders needed', value: Math.ceil(delivered).toLocaleString('en-IN') },
    { label: 'Orders to place', value: Math.ceil(placed).toLocaleString('en-IN') },
    { label: 'Ad budget needed', value: taka(placed * (v.cpo ?? 0)), dark: true },
  ];
}

export function Body() {
  return (
    <>
      <Lead>
        “We want to double sales” is a wish. “We need 900 delivered orders at ৳450 each” is a plan.
      </Lead>
      <Section id="backwards" n={1} title="Work backwards from the goal">
        <Figure title="From sales goal to ad budget">
          <Calculator
            inputs={[
              {
                id: 'goal',
                label: 'Revenue goal this month',
                value: 1500000,
                prefix: '৳',
                step: 50000,
              },
              { id: 'aov', label: 'Average order value', value: 1400, prefix: '৳', step: 50 },
              { id: 'delivery', label: 'Delivery rate', value: 85, suffix: '%', step: 1 },
              { id: 'cpo', label: 'Ad cost per placed order', value: 380, prefix: '৳', step: 10 },
            ]}
            compute={calc1}
          />
        </Figure>
      </Section>
      <Section id="assumptions" n={2} title="Check the assumptions">
        <p>
          The forecast is only as good as its inputs. The weakest one is usually cost per order,
          because it tends to rise as you spend more. Plan for that.
        </p>
        <ul>
          <li>Use the last 30 to 60 days, not your best week.</li>
          <li>Add 10 to 25% to cost per order if you plan to spend much more than before.</li>
          <li>Adjust for season: festival months behave differently.</li>
          <li>Check stock: can you actually ship this many orders?</li>
        </ul>
      </Section>
      <Section id="track" n={3} title="Track against the plan weekly">
        <p>
          Break the monthly goal into weeks and compare each Monday. If you are behind after week
          two, you still have time to adjust: new creative, a stronger offer, or a lower target.
        </p>
        <Callout tone="warning">
          Do not chase a missed goal by doubling budget in the last week. Cost per order often jumps
          and you end the month with a loss.
        </Callout>
      </Section>
      <InlineCta
        title="Want a growth plan with real numbers?"
        body="Book a free call. We will build a forecast with you before spending a taka."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'What if my cost per order is unknown?',
              a: 'Run a small test for two weeks first. Then forecast.',
            },
            {
              q: 'Should organic sales be in the forecast?',
              a: 'Yes, as a separate line. It helps you see what ads really need to deliver.',
            },
          ]}
        />
      </Section>
    </>
  );
}
