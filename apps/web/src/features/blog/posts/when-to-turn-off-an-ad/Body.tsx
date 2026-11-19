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

function killRule(v: Record<string, number>) {
  const target = v.target ?? 0;
  const multiple = v.multiple ?? 2;
  return [
    {
      label: 'Turn off if spend passes this with no purchase',
      value: taka(target * multiple),
      dark: true,
    },
    { label: 'Review if cost per purchase stays above', value: taka(target * 1.3) },
  ];
}

export function Body() {
  return (
    <>
      <Lead>
        Turn ads off too early and you kill winners before they warm up. Too late and you pour money
        into losers. Simple rules, set before you launch, take the emotion out of it.
      </Lead>
      <Prose>
        <p>
          The rules below are starting points. Adjust them to your price, margin and how quickly
          your customers usually buy.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Decide the rules before launch, not while staring at a bad day.',
            'No purchase after spending roughly two to three times your target cost: turn it off.',
            'Early signals (hook rate, click-through) can kill obvious losers sooner.',
            'Pause, do not delete. You may want to learn from it later.',
          ]}
        />
      </div>

      <Section id="rule" n={1} title="A simple spend rule">
        <Figure title="Your turn-off threshold">
          <Calculator
            inputs={[
              {
                id: 'target',
                label: 'Target cost per purchase',
                value: 450,
                prefix: '৳',
                step: 25,
              },
              { id: 'multiple', label: 'Spend multiple before deciding', value: 2.5, step: 0.5 },
            ]}
            compute={killRule}
          />
        </Figure>
        <Callout tone="tip">
          Higher-priced products often need a higher multiple, because people take longer to buy.
        </Callout>
      </Section>

      <Section id="signals" n={2} title="Earlier signals worth watching">
        <CompareTable
          columns={['Signal', 'Looks bad when', 'What it usually means']}
          rows={[
            ['Hook rate', 'Far below your other ads', 'The first seconds do not stop people'],
            [
              'Click-through rate',
              'Very low after decent spend',
              'The ad does not create interest',
            ],
            [
              'Add to cart, no purchases',
              'Many carts, no orders',
              'Price, delivery or checkout problem',
            ],
            [
              'Cost per purchase',
              'Far above target for days',
              'Wrong audience match or weak offer',
            ],
          ]}
        />
      </Section>

      <Section id="not" n={3} title="When not to turn an ad off">
        <ul>
          <li>It has been live for less than a day or two.</li>
          <li>One bad day after a run of good ones.</li>
          <li>Meta’s reported numbers are delayed (recent days often fill in later).</li>
        </ul>
      </Section>

      <InlineCta
        title="Want clear rules for your account?"
        body="Book a free call. We will look at your numbers and set turn-off rules that fit your margins."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Should I turn off the ad or the whole ad set?',
              a: 'Turn off the losing ad. Only stop the ad set if all its ads are losing.',
            },
            {
              q: 'Can a turned-off ad come back?',
              a: 'Sometimes it does well again later with a new audience or season. Pausing keeps that option open.',
            },
          ]}
        />
      </Section>
    </>
  );
}
