import { Link } from 'react-router';
import { Callout, FaqList, Figure, InlineCta, Lead, Section } from '../../components/article';
import { Legend, LineChart } from '../../components/viz';
import { taka } from '../../components/format';

export function Body() {
  return (
    <>
      <Lead>
        Flip a coin ten times and you might get seven heads. That does not make it a lucky coin.
        Small ad tests work the same way.
      </Lead>
      <Section id="noise" n={1} title="The problem: noise">
        <p>
          With small numbers, random luck creates big differences. Ad A gets 6 orders and Ad B gets
          3. It looks like A is twice as good. It may just be chance.
        </p>
        <Figure
          title="How the same two ads can look over time (example)"
          caption="After two days, A looks far better. After two weeks, B is slightly ahead. Early numbers swing."
        >
          <Legend
            items={[
              { name: 'Ad A cost per order', tone: 'ink' },
              { name: 'Ad B cost per order', tone: 'accent' },
            ]}
          />
          <LineChart
            labels={['Day 1', 'Day 2', 'Day 3', 'Day 5', 'Day 7', 'Day 10', 'Day 14']}
            series={[
              {
                name: 'Ad A cost per order',
                values: [280, 520, 390, 430, 410, 425, 420],
                tone: 'ink',
              },
              {
                name: 'Ad B cost per order',
                values: [610, 350, 480, 440, 400, 395, 390],
                tone: 'accent',
              },
            ]}
            format={taka}
          />
        </Figure>
      </Section>
      <Section id="rules" n={2} title="Simple rules of thumb">
        <ul>
          <li>Wait for at least 30 to 50 conversions per version before calling a close race.</li>
          <li>
            A huge difference (two or three times better) can be trusted sooner than a small one.
          </li>
          <li>Run versions at the same time, not one week after the other.</li>
          <li>Include at least one full week, so weekdays and weekends both count.</li>
        </ul>
        <Callout tone="tip">
          If you cannot get enough conversions, judge on an earlier signal with more data, like
          add-to-cart or hook rate, and confirm later with sales.
        </Callout>
      </Section>
      <Section id="tools" n={3} title="If you want the maths">
        <p>
          Free online A/B test calculators tell you how likely a difference is to be real. Enter
          visitors and conversions for each version. Most marketers aim for at least 90 to 95%
          confidence before making a big change.
        </p>
        <p>
          Meta’s own A/B test tool also reports confidence, and splits audiences so they do not
          overlap. See{' '}
          <Link to="/blog/how-to-test-meta-ad-creatives">how to test ad creatives</Link>.
        </p>
      </Section>
      <InlineCta
        title="Want a testing plan that fits your budget?"
        body="Book a free call. We will set up tests you can actually trust."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'What if I never get enough data?',
              a: 'Test bigger differences: new angles, not new button colours. Big changes show clear results faster.',
            },
            {
              q: 'Is 95% confidence always needed?',
              a: 'No. For cheap, reversible decisions, a lower bar is fine. Save the strict bar for big, costly ones.',
            },
          ]}
        />
      </Section>
    </>
  );
}
