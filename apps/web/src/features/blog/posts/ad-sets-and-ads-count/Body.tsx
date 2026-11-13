import {
  Callout,
  FaqList,
  Figure,
  InlineCta,
  KeyTakeaways,
  Lead,
  Prose,
  Section,
  Steps,
} from '../../components/article';
import { BarList, Calculator } from '../../components/viz';

function structure(v: Record<string, number>) {
  const daily = v.daily ?? 0;
  const cpa = v.cpa || 1;
  const weekly = (daily * 7) / cpa;
  const adSets = Math.max(1, Math.floor(weekly / 50));
  return [
    { label: 'Purchases a week', value: String(Math.round(weekly)) },
    { label: 'Ad sets your budget supports', value: String(adSets), dark: true },
    { label: 'Ads per ad set', value: weekly < 25 ? '3–6' : '6–12' },
  ];
}

export function Body() {
  return (
    <>
      <Lead>
        Too many ad sets and none of them learn. Too few ads and you run out of creative. The right
        numbers come from your budget, not from a template.
      </Lead>
      <Prose>
        <p>
          There’s no magic number of ad sets or ads. But there’s a simple piece of maths that tells
          you the maximum your budget can support, and it’s the most useful structure rule in Meta
          ads.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Each ad set needs about 50 optimisation events a week to leave the learning phase.',
            'So: weekly purchases ÷ 50 = the most ad sets your budget can properly support.',
            'Most stores need 1–3 ad sets per campaign, not 10.',
            'Inside each ad set, run several genuinely different ads; spend will concentrate on a few.',
          ]}
        />
      </div>

      <Section id="maths" n={1} title="The 50-a-week rule">
        <p>
          Meta says an ad set generally needs around{' '}
          <strong>50 optimisation events in 7 days</strong> to exit learning. Until then, delivery
          is still experimenting and results are less stable. Divide your expected weekly purchases
          by 50 and you get the number of ad sets that can each reach that.
        </p>
        <Figure title="Work out your structure" example={false}>
          <Calculator
            inputs={[
              {
                id: 'daily',
                label: 'Daily budget for this campaign',
                value: 15000,
                prefix: '৳',
                step: 1000,
              },
              { id: 'cpa', label: 'Typical cost per purchase', value: 500, prefix: '৳', step: 50 },
            ]}
            compute={structure}
          />
        </Figure>
        <Callout tone="tip">
          If your budget supports less than one ad set at 50 a week, you can optimise for an earlier
          event (like Add to cart) for a while, or accept a slower learning phase. Don’t split
          further.
        </Callout>
      </Section>

      <Section id="ads" n={2} title="How many ads per ad set?">
        <p>
          Meta caps the number of ads per ad set, but the useful range is much lower. More ads give
          delivery more options, especially when they’re truly different. But spend will always
          concentrate on a few winners.
        </p>
        <Figure
          title="How spend typically spreads across 8 ads in one ad set"
          caption="A couple of ads take most of the budget. That’s normal. The others are still useful as challengers."
        >
          <BarList
            items={[
              { label: 'Ad 1', value: 46, tone: 'accent', note: 'The current favourite.' },
              { label: 'Ad 2', value: 22, note: 'A strong second.' },
              { label: 'Ad 3', value: 12, note: 'Gets a steady share.' },
              { label: 'Ad 4', value: 8, note: 'Still being tested.' },
              {
                label: 'Ads 5–8',
                value: 12,
                tone: 'muted',
                note: 'Small spend each. Replace them if they stay low for two weeks.',
              },
            ]}
            format={(v) => `${v}%`}
            max={50}
          />
        </Figure>
      </Section>

      <Section id="rules" n={3} title="Practical rules">
        <Steps
          steps={[
            {
              title: 'Start with one ad set per campaign',
              body: 'Add a second only when you have a real reason (a different audience type or country) and enough budget.',
            },
            {
              title: 'Run 6–12 distinct ads',
              body: 'Different formats and angles. Five near-copies count as roughly one ad.',
            },
            {
              title: 'Replace, don’t pile up',
              body: 'Switch off ads that get almost no spend for two weeks, and add fresh concepts instead.',
            },
            {
              title: 'Batch your changes',
              body: 'Adding or removing many ads at once is better than daily tinkering, which can disrupt learning.',
            },
          ]}
        />
      </Section>

      <InlineCta
        title="Does your structure fit your budget?"
        body="On a free call we check your account structure against your real numbers and simplify it where it’s holding you back."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Why not one ad per ad set, so each gets budget?',
              a: 'Then you’re back to many ad sets splitting data. It’s better to let several ads compete inside one ad set and use a separate test campaign if you need equal spend.',
            },
            {
              q: 'My ad set says "Learning limited". What should I do?',
              a: 'It means it’s not getting enough events. Combine ad sets, raise the budget, or optimise for an event that happens more often.',
            },
            {
              q: 'Does this apply to Advantage+ campaigns?',
              a: 'The same principle applies: keep data concentrated and creative varied. Advantage+ already simplifies the structure for you.',
            },
          ]}
        />
      </Section>
    </>
  );
}
