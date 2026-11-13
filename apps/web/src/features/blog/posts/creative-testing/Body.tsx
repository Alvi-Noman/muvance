import {
  Clapperboard,
  FlaskConical,
  Lightbulb,
  LineChart as LineIcon,
  PenLine,
  Rocket,
} from 'lucide-react';
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
import { BarList, Calculator, Flow, Funnel } from '../../components/viz';
import { taka } from '../../components/format';

function testBudget(v: Record<string, number>) {
  const perAd = (v.cpa ?? 0) * (v.multiple ?? 0);
  const total = perAd * (v.ads ?? 0);
  return [
    { label: 'Budget per ad', value: taka(perAd) },
    { label: 'Total test budget', value: taka(total), dark: true },
  ];
}

export function Body() {
  return (
    <>
      <Lead>
        Creative is now the biggest lever in Meta ads. But most brands don’t test creative: they
        just post new ads and hope.
      </Lead>
      <Prose>
        <p>
          A real creative test answers a specific question (&quot;do customers respond more to price
          or to quality?&quot;) and produces a decision: kill it, improve it, or scale it. Run that
          loop every week and your account keeps getting better. Skip it and every winning ad is
          luck.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Test concepts (big ideas) first, then iterations (small changes) on the winners.',
            'Every test starts with a written hypothesis.',
            'Spend roughly 2–3× your target cost per purchase on an ad before judging it.',
            'Read metrics in order: hook, hold, click, conversion, cost per purchase.',
          ]}
        />
      </div>

      <Section id="loop" n={1} title="The creative testing loop">
        <p>Strong accounts run the same simple loop, every week, without skipping steps.</p>
        <Figure title="One testing cycle" example={false}>
          <Flow
            nodes={[
              {
                title: 'Idea',
                body: 'From reviews, comments, competitors',
                icon: <Lightbulb className="size-5" />,
              },
              {
                title: 'Hypothesis',
                body: 'What you expect, and why',
                icon: <PenLine className="size-5" />,
              },
              {
                title: 'Produce',
                body: '3–5 versions of the concept',
                icon: <Clapperboard className="size-5" />,
              },
              {
                title: 'Test',
                body: 'Enough budget for a fair read',
                icon: <FlaskConical className="size-5" />,
                highlight: true,
              },
              {
                title: 'Read',
                body: 'Metrics in the right order',
                icon: <LineIcon className="size-5" />,
              },
              {
                title: 'Decide',
                body: 'Kill, iterate or scale',
                icon: <Rocket className="size-5" />,
              },
            ]}
          />
        </Figure>
      </Section>

      <Section id="concepts" n={2} title="Test concepts first, iterations second">
        <p>
          A <strong>concept</strong> is a different reason to buy, told in a different way. An{' '}
          <strong>iteration</strong> is the same concept with a new hook, length or thumbnail. New
          concepts find new buyers; iterations squeeze more out of a winner. Start with concepts.
        </p>
        <CompareTable
          columns={['', 'Concept test', 'Iteration test']}
          rows={[
            ['Question', 'Which reason to buy works?', 'How do we make the winner work harder?'],
            [
              'Example',
              'Price angle vs quality angle vs gift angle',
              'Same quality video, three different opening lines',
            ],
            ['Upside', 'Large: can unlock new audiences', 'Smaller but reliable gains'],
            ['When', 'Always running, every week', 'Once a concept has proven itself'],
          ]}
        />
      </Section>

      <Section id="hypothesis" n={3} title="Write the hypothesis before you make the ad">
        <p>One sentence is enough. It forces you to learn something even when the ad loses.</p>
        <Callout tone="tip" title="Hypothesis template">
          <strong>We believe</strong> showing the product being used at a wedding{' '}
          <strong>will</strong> lower cost per purchase <strong>because</strong> customer reviews
          mention weddings more than any other occasion.
        </Callout>
        <p>
          The best sources of ideas are free: your <strong>product reviews</strong>, comments on
          your ads, questions customers ask on WhatsApp, and the ads competitors keep running for
          months (find them in the Meta Ad Library).
        </p>
      </Section>

      <Section id="budget" n={4} title="How much to spend before you judge an ad">
        <p>
          The most common mistake is switching an ad off after a day and a few hundred taka. A
          practical rule of thumb: let each ad spend{' '}
          <strong>2–3× your target cost per purchase</strong> before deciding, unless its early
          signals (hook rate, click rate) are clearly terrible.
        </p>
        <Figure title="Work out your test budget" example={false}>
          <Calculator
            inputs={[
              { id: 'cpa', label: 'Target cost per purchase', value: 600, prefix: '৳', step: 50 },
              {
                id: 'multiple',
                label: 'Spend multiple before judging',
                value: 2.5,
                suffix: '×',
                step: 0.5,
              },
              { id: 'ads', label: 'Ads in this test', value: 4 },
            ]}
            compute={testBudget}
          />
        </Figure>
      </Section>

      <PullQuote>
        A losing ad with a clear hypothesis teaches you more than a winning ad you can’t explain.
      </PullQuote>

      <Section id="read" n={5} title="Read the metrics in the right order">
        <p>
          Each metric tells you where an ad is breaking. Read them top to bottom; fix the first one
          that’s weak.
        </p>
        <Figure
          title="Where 10,000 impressions go"
          caption="Each stage is a different problem: the hook, the story, the offer, or the landing page."
        >
          <Funnel
            stages={[
              { label: 'Impressions', value: 10000, note: 'People the ad was shown to' },
              { label: 'Watched 3 seconds', value: 2800, note: 'Hook rate 28%: the opening works' },
              {
                label: 'Clicked',
                value: 150,
                note: 'Click rate 1.5%: the story and offer persuade',
              },
              {
                label: 'Purchased',
                value: 4,
                note: 'Conversion rate 2.7%: the landing page closes',
              },
            ]}
            format={(v) => v.toLocaleString('en-IN')}
          />
        </Figure>
      </Section>

      <Section id="results" n={6} title="How to read a test result">
        <p>
          Here’s an example: four concepts, same budget each. Tap each row for what we would do
          next.
        </p>
        <Figure title="Cost per purchase by concept">
          <BarList
            items={[
              {
                label: 'Gift angle',
                value: 420,
                tone: 'accent',
                note: 'Clear winner. Scale it, and start iterating on the hook.',
              },
              {
                label: 'Quality close-up',
                value: 610,
                note: 'Near target. Try a stronger opening before deciding.',
              },
              {
                label: 'Price comparison',
                value: 890,
                tone: 'warm',
                note: 'Good click rate but poor conversion: the landing page doesn’t match the promise.',
              },
              {
                label: 'Founder story',
                value: 1240,
                tone: 'warm',
                note: 'Weak hook rate. Kill it, or re-test with a punchier first 3 seconds.',
              },
            ]}
            format={taka}
          />
        </Figure>
      </Section>

      <Section id="cadence" n={7} title="A weekly testing routine">
        <Steps
          steps={[
            {
              title: 'Monday: review',
              body: 'Read last week’s tests. Log each result and what you learned in one shared sheet.',
            },
            {
              title: 'Tuesday: brief',
              body: 'Write 2–3 new concepts and 2–3 iterations of current winners.',
            },
            {
              title: 'Wednesday–Thursday: produce',
              body: 'Shoot or design. Phone-filmed content is fine; clarity beats polish.',
            },
            {
              title: 'Friday: launch',
              body: 'Add new ads to the testing campaign or the main ad set.',
            },
            {
              title: 'Every day: protect the budget',
              body: 'Only switch off ads that are clearly failing early. Otherwise wait for the full test budget.',
            },
          ]}
        />
      </Section>

      <InlineCta
        title="Want a creative testing engine without hiring a team?"
        body="We plan, produce and test new concepts every week for our clients. Book a free call to see how it would work for your brand."
      />

      <Section id="faq" n={8} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Should I test in a separate campaign?',
              a: 'Above a moderate budget, a small testing campaign gives cleaner reads. With a small budget, adding new ads straight into your main ad set is simpler and lets delivery pick winners.',
            },
            {
              q: 'How many new ads should I launch each week?',
              a: 'It depends on budget. A useful starting point is 3–6 new ads a week, with at least one genuinely new concept.',
            },
            {
              q: 'Meta only spends on one ad in my ad set. Is the test broken?',
              a: 'Not necessarily. Delivery concentrates spend on what it predicts will win. If you need an even read, use a separate test campaign with one concept per ad set.',
            },
            {
              q: 'Do AI-made creatives work?',
              a: 'They can, especially for static ads and variations. Real people using the product still tend to build more trust, so test both.',
            },
          ]}
        />
      </Section>
    </>
  );
}
