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
import { Checklist, LineChart } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        Same ads, same budget, and every month each sale costs a little more. It’s not bad luck. It
        is almost always one of six causes, and each one leaves fingerprints.
      </Lead>
      <Prose>
        <p>
          Rising cost per purchase (CPA) is the most common complaint we hear from eCommerce owners.
          The fix depends entirely on the cause, and the wrong fix (usually &quot;change the
          targeting&quot; or &quot;cut the budget&quot;) often makes it worse. Diagnose first.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Check creative fatigue first: rising frequency and falling click rate on the same ads.',
            'Some months are simply more expensive. Compare with the same season, not last month.',
            'Too many edits keep ad sets stuck in learning, which raises costs.',
            'A tracking break looks exactly like rising CPA. Rule it out before changing anything.',
          ]}
        />
      </div>

      <Section id="causes" n={1} title="The six usual suspects">
        <p>
          Each cause leaves a different pattern in your numbers. Several often overlap, so check
          them all.
        </p>
        <CompareTable
          columns={['Cause', 'What you’ll see', 'Where to look']}
          rows={[
            [
              'Creative fatigue',
              'Frequency rising, click rate falling, CPM steady',
              'Ad level: frequency and CTR over time',
            ],
            [
              'Seasonal costs',
              'CPM up across every campaign at once',
              'Account level: CPM vs the same month last year',
            ],
            [
              'Learning resets',
              'Ad sets keep showing "Learning" or "Learning limited"',
              'Delivery column, edit history',
            ],
            [
              'Tracking loss',
              'Store orders steady, Meta purchases falling',
              'Events Manager: errors, missing Purchase events',
            ],
            [
              'Website or offer',
              'Click rate fine, conversion rate falling',
              'Store analytics, recent price or delivery changes',
            ],
            [
              'Audience saturation',
              'Reach flat, frequency rising even with new ads',
              'Audience size, reach and frequency',
            ],
          ]}
        />
      </Section>

      <Section id="fatigue" n={2} title="Cause 1: creative fatigue">
        <p>
          The same people see the same ad again and again. The first time, some of them buy. By the
          sixth time, they scroll past. Delivery has to work harder to find fresh viewers, and costs
          rise.
        </p>
        <Figure
          title="Click rate vs frequency for one ad over 6 weeks"
          caption="As frequency climbs, click rate falls. When the two lines cross like this, the ad needs replacing, not more budget."
        >
          <LineChart
            labels={['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6']}
            series={[
              { name: 'Click rate (%)', values: [2.1, 1.9, 1.6, 1.3, 1.0, 0.8], tone: 'ink' },
              { name: 'Frequency', values: [1.2, 1.5, 1.9, 2.4, 2.9, 3.4], tone: 'warm' },
            ]}
            format={(v) => v.toFixed(1)}
            yMax={4}
          />
        </Figure>
        <Callout tone="tip">
          Fatigue is solved with <strong>new concepts</strong>, not new colours. Plan to launch a
          few new ads every week so there’s always a fresh one ready to take over.
        </Callout>
      </Section>

      <Section id="seasonal" n={3} title="Cause 2: some months are just expensive">
        <p>
          Ads are sold in an auction. When many brands want the same people at the same time, prices
          go up for everyone. In Bangladesh that usually means the weeks before Eid, and the big
          November–December sale season.
        </p>
        <Figure
          title="CPM (cost per 1,000 impressions) across a year"
          caption="The spikes are seasonal, not something wrong with your account."
        >
          <LineChart
            labels={[
              'Jan',
              'Feb',
              'Mar',
              'Apr',
              'May',
              'Jun',
              'Jul',
              'Aug',
              'Sep',
              'Oct',
              'Nov',
              'Dec',
            ]}
            series={[
              {
                name: 'CPM',
                values: [95, 92, 140, 98, 135, 100, 94, 96, 101, 112, 150, 160],
                tone: 'ink',
              },
            ]}
            format={(v) => `৳${Math.round(v)}`}
            yMin={60}
            yMax={180}
            markers={[
              { at: 2, label: 'Eid al-Fitr' },
              { at: 4, label: 'Eid al-Adha' },
              { at: 10, label: 'Sale season' },
            ]}
          />
        </Figure>
        <p>
          Compare against the <strong>same period last year</strong>, and judge peak months on
          revenue and MER rather than CPA alone. Higher costs during Eid are fine if buyers are also
          spending more.
        </p>
      </Section>

      <PullQuote>
        Before you change anything, find out whether your costs went up, or everyone’s did.
      </PullQuote>

      <Section id="others" n={4} title="Causes 3–6: learning, tracking, website, audience">
        <ul>
          <li>
            <strong>Learning resets.</strong> Big budget jumps, new ads, or audience edits can send
            an ad set back into learning. Batch your changes and make them every few days, not every
            few hours.
          </li>
          <li>
            <strong>Tracking loss.</strong> A plugin update or theme change can quietly break the
            Purchase event. If store orders are steady while Meta’s purchases fall, it’s tracking,
            not performance.
          </li>
          <li>
            <strong>Website or offer.</strong> A price rise, out-of-stock sizes, a slower page or a
            new delivery charge all lower conversion rate, which raises CPA even if the ads are
            fine.
          </li>
          <li>
            <strong>Audience saturation.</strong> Narrow interest or local audiences run out of new
            people. Broaden the audience or expand to new regions.
          </li>
        </ul>
      </Section>

      <Section id="diagnose" n={5} title="Run the 5-minute diagnosis">
        <Figure title="Tick everything you can confirm is fine" example={false}>
          <Checklist
            items={[
              'Frequency on top ads is under 3 per week',
              'Click rate hasn’t dropped more than 20%',
              'CPM is similar to the same month last year',
              'Ad sets aren’t stuck in "Learning limited"',
              'Store orders and Meta purchases move together',
              'No price, stock or delivery changes recently',
              'Page speed and checkout work on mobile',
              'At least one new ad launched in the last 2 weeks',
            ]}
            verdicts={[
              'Several warning signs. Start with tracking, then creative.',
              'Some causes ruled out. Focus on the unticked boxes.',
              'Your basics are healthy. Look at offer, pricing and competition.',
            ]}
          />
        </Figure>
      </Section>

      <Section id="fix" n={6} title="What to do, in order">
        <Steps
          steps={[
            {
              title: 'Rule out tracking',
              body: 'Compare Meta purchases with store orders by day. A sudden gap means fix tracking before touching campaigns.',
            },
            {
              title: 'Refresh creative',
              body: 'Launch 3–5 new concepts. Keep the old winner running until a new one beats it.',
            },
            {
              title: 'Stop over-editing',
              body: 'Make changes in batches, then leave ad sets alone for 3–4 days.',
            },
            {
              title: 'Check the funnel',
              body: 'If click rate is fine but sales aren’t, the problem is the website or the offer.',
            },
            {
              title: 'Plan for seasons',
              body: 'Prepare creative and stock before Eid and sale season, and expect higher costs.',
            },
          ]}
        />
      </Section>

      <InlineCta
        title="Costs climbing and you can’t see why?"
        body="On a free call we go through your account and store with you, and show you the cause in plain language."
      />

      <Section id="faq" n={7} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Should I cut my budget when CPA rises?',
              a: 'Not as a first step. Cutting budget can send ad sets back into learning. Diagnose first; if the cause is fatigue, new creative fixes it faster than a budget cut.',
            },
            {
              q: 'Should I duplicate my best ad set to reset it?',
              a: 'Duplicating rarely fixes the root cause and splits your data. Refresh the creative inside the existing ad set instead.',
            },
            {
              q: 'How often should I refresh creative?',
              a: 'It depends on budget and audience size. Higher spend in a smaller market fatigues faster. Watch frequency and click rate rather than following a fixed calendar.',
            },
          ]}
        />
      </Section>
    </>
  );
}
