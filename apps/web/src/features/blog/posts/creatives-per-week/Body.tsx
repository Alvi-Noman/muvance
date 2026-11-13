import {
  Callout,
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

function creativeNeed(v: Record<string, number>) {
  const monthly = v.monthly ?? 0;
  const life = v.life || 1;
  const hit = (v.hit ?? 0) / 100 || 0.01;
  const winnersPerMonth = monthly / life;
  const perWeek = winnersPerMonth / hit / 4.3;
  return [
    { label: 'Winners you burn through a month', value: winnersPerMonth.toFixed(1) },
    {
      label: 'New ads to launch each week',
      value: String(Math.max(1, Math.ceil(perWeek))),
      dark: true,
    },
  ];
}

export function Body() {
  return (
    <>
      <Lead>
        &quot;How many new ads do we need?&quot; is probably the question we get asked most. The
        honest answer is: it depends on how much you spend. But you can work it out in about a
        minute.
      </Lead>
      <Prose>
        <p>
          Every ad wears out eventually. People see it a few times, stop noticing it, and your costs
          creep up. The bigger your budget, the faster that happens, because you’re showing the same
          ad to more people, more often. So the right number of new creatives isn’t a fixed rule. It
          scales with spend.
        </p>
        <p>
          There’s also a catch most people forget: <strong>most new ads don’t win</strong>. If only
          one in five becomes a solid performer, you need to make five to replace one tired winner.
          That’s the bit that catches brands out.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Ads fatigue faster when you spend more. Your creative pipeline has to grow with your budget.',
            'Only a fraction of new ads become winners, so you need several tries to replace each one.',
            'Plan the number from your spend, how long a winner lasts, and your hit rate.',
            'Small brands can get away with 2–3 new ads a week. Bigger spenders often need far more.',
          ]}
        />
      </div>

      <Section id="calc" n={1} title="Work out your number">
        <p>
          Three inputs. Your monthly spend, roughly how much an ad spends before it gets tired, and
          what share of your new ads turn into winners. If you don’t know the last two, start with
          the defaults and adjust as you learn.
        </p>
        <Figure title="Creative volume calculator" example={false}>
          <Calculator
            inputs={[
              { id: 'monthly', label: 'Monthly ad spend', value: 600000, prefix: '৳', step: 50000 },
              {
                id: 'life',
                label: 'Spend a winner lasts before fatigue',
                value: 80000,
                prefix: '৳',
                step: 10000,
              },
              { id: 'hit', label: 'New ads that become winners', value: 20, suffix: '%', step: 5 },
            ]}
            compute={creativeNeed}
          />
        </Figure>
        <p>
          Say you spend {taka(600000)} a month and a good ad lasts for around {taka(80000)} of
          spend. You’re using up about seven winners a month. If one in five new ads wins, that’s
          roughly 35 new ads a month, or eight or nine a week. Most brands are making two.
        </p>
      </Section>

      <Section id="fatigue" n={2} title="What fatigue actually looks like">
        <p>
          You don’t need to guess when an ad is tired. The numbers tell you. Frequency goes up,
          click rate drifts down, and cost per purchase starts climbing a few days later.
        </p>
        <Figure
          title="One ad’s cost per purchase over its life"
          caption="A strong start, a good stretch, then a steady climb. The time to have its replacement ready is before week 4, not after."
        >
          <LineChart
            labels={['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6', 'Wk 7']}
            series={[
              {
                name: 'Cost per purchase',
                values: [520, 450, 440, 470, 560, 650, 760],
                tone: 'ink',
              },
            ]}
            format={(v) => `৳${Math.round(v)}`}
            yMin={300}
            yMax={850}
            markers={[{ at: 3, label: 'Start replacing' }]}
          />
        </Figure>
      </Section>

      <PullQuote>
        If you only start making a new ad once the old one is dead, you’re already two weeks late.
      </PullQuote>

      <Section id="cheap" n={3} title="Making more ads without blowing the budget">
        <p>
          Nobody needs a studio shoot every week. Most of the volume can come from cheaper sources,
          as long as the ideas are genuinely different.
        </p>
        <Steps
          steps={[
            {
              title: 'One shoot, many ads',
              body: 'Film 20–30 short clips in one session: unboxing, close-ups, someone using it, reactions. You’ll cut weeks of ads from it.',
            },
            {
              title: 'New hooks on old winners',
              body: "Swap the first three seconds of a proven video. It’s the cheapest way to get a 'new' ad that still works.",
            },
            {
              title: 'Customer content',
              body: 'Ask happy buyers for a short video or photo. With permission, it often beats anything polished.',
            },
            {
              title: 'Statics from reviews',
              body: 'A real review on a clean background is a quick ad that builds trust.',
            },
            {
              title: 'Batch the work',
              body: 'Plan, shoot and edit once a week or fortnight, not one ad at a time.',
            },
          ]}
        />
        <Callout tone="tip">
          Keep a simple log of every ad: the idea, the hook, the format and how it did. After a
          couple of months, you’ll see your own patterns, and your hit rate goes up.
        </Callout>
      </Section>

      <InlineCta
        title="Can’t keep up with creative?"
        body="We plan, shoot and test new ads every week for our clients, so there’s always a fresh one ready. Book a free call."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'I’m only spending a little. Do I still need new ads every week?',
              a: 'Not necessarily. Small budgets fatigue slowly. Two or three new ads a week, or even every two weeks, can be enough. Watch frequency and click rate rather than following a calendar.',
            },
            {
              q: 'Do variations count as new ads?',
              a: 'They help, but they’re not the same as a new idea. Mix both: iterations on winners, plus at least one new concept every week.',
            },
            {
              q: 'Should I switch off an ad the moment it slows down?',
              a: 'No. Keep it running while the replacement proves itself. Turning off a winner before you’ve got the next one can make costs jump.',
            },
          ]}
        />
      </Section>
    </>
  );
}
