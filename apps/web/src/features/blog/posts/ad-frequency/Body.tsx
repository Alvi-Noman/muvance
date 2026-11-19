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
  Steps,
} from '../../components/article';
import { Legend, LineChart } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        Frequency is how many times, on average, each person has seen your ad. Too low and nobody
        remembers you. Too high and people start scrolling past, or hiding your ads.
      </Lead>
      <Prose>
        <p>
          There is no magic number. A good frequency depends on how big your audience is, how often
          you change creative, and whether people are seeing the same ad or a varied set. What
          matters is the trend: rising frequency with rising costs is the classic sign of fatigue.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Watch frequency together with cost per purchase and click-through rate.',
            'Small, warm audiences hit high frequency fast.',
            'The fix for fatigue is usually new creative, not a new audience.',
            'Different ads to the same person count as variety, not repetition.',
          ]}
        />
      </div>

      <Section id="signs" n={1} title="What fatigue looks like">
        <Figure title="Frequency rising, results falling">
          <Legend
            items={[
              { name: 'Frequency (7 days)', tone: 'warm' },
              { name: 'Click-through rate %', tone: 'ink' },
            ]}
          />
          <div className="mt-4">
            <LineChart
              labels={['W1', 'W2', 'W3', 'W4', 'W5', 'W6']}
              series={[
                {
                  name: 'Frequency (7 days)',
                  values: [1.4, 1.8, 2.3, 2.9, 3.6, 4.2],
                  tone: 'warm',
                },
                {
                  name: 'Click-through rate %',
                  values: [2.1, 2.0, 1.7, 1.4, 1.1, 0.9],
                  tone: 'ink',
                },
              ]}
              format={(v) => v.toFixed(1)}
              markers={[{ at: 3, label: 'New ads needed' }]}
            />
          </div>
        </Figure>
        <Callout tone="tip">
          Check frequency over the last seven days, not the lifetime of the campaign. Lifetime
          numbers hide recent changes.
        </Callout>
      </Section>

      <Section id="fix" n={2} title="What to do when frequency climbs">
        <Steps
          steps={[
            {
              title: 'Add new creative first',
              body: 'New hooks, new angles, new formats. This is almost always the real fix.',
            },
            {
              title: 'Check the audience size',
              body: 'Narrow audiences tire fastest. Broad audiences give Meta more fresh people.',
            },
            {
              title: 'Look at retargeting',
              body: 'Warm audiences are small. Lower retargeting budgets if frequency is high there.',
            },
            {
              title: 'Only then, rethink budget',
              body: 'More budget into a tired audience raises frequency even faster.',
            },
          ]}
        />
        <p>
          If you are not sure how many new ads you need, our guide on{' '}
          <Link to="/blog/how-many-new-creatives-per-week">creatives per week</Link> helps you work
          out your number.
        </p>
      </Section>

      <InlineCta
        title="Ads tiring faster than you can replace them?"
        body="Our in-house team makes new creative every week. Book a free call and we will show you how it would work for your brand."
      />

      <Section id="faq" n={3} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Is a frequency of 3 too high?',
              a: 'Not on its own. If cost per purchase and click-through rate are steady, it is fine. Act when results start sliding.',
            },
            {
              q: 'Can I set a frequency cap?',
              a: 'Only in some campaign types, like reach campaigns. For sales campaigns, manage it with creative and audience size.',
            },
          ]}
        />
      </Section>
    </>
  );
}
