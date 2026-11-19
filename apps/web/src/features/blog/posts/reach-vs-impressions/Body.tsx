import { Link } from 'react-router';
import { FaqList, Figure, InlineCta, Lead, Section } from '../../components/article';
import { Legend, LineChart, StatTiles } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        100,000 impressions sounds like 100,000 people. It might be 25,000 people who saw your ad
        four times each.
      </Lead>
      <Section id="difference" n={1} title="The difference">
        <StatTiles
          items={[
            { value: 'Reach', label: 'Unique people who saw the ad' },
            { value: 'Impressions', label: 'Total times it was shown' },
            { value: 'Frequency', label: 'Impressions ÷ reach', dark: true },
          ]}
        />
      </Section>
      <Section id="read" n={2} title="Reading them together">
        <p>
          If impressions climb but reach stays flat, you are showing ads to the same people again
          and again. That can be fine for a small retargeting audience. For prospecting, it usually
          means the ad is tiring or the audience is too small.
        </p>
        <Figure
          title="Reach and impressions over four weeks (example)"
          caption="Reach is levelling off while impressions keep rising. Time for fresh creative or a broader audience."
        >
          <Legend
            items={[
              { name: 'Impressions', tone: 'ink' },
              { name: 'Reach', tone: 'accent' },
            ]}
          />
          <LineChart
            labels={['Week 1', 'Week 2', 'Week 3', 'Week 4']}
            series={[
              { name: 'Impressions', values: [60, 115, 170, 220], tone: 'ink' },
              { name: 'Reach', values: [40, 62, 75, 82], tone: 'accent' },
            ]}
            format={(v) => `${v}k`}
          />
        </Figure>
      </Section>
      <Section id="when" n={3} title="When each matters">
        <ul>
          <li>
            <strong>Reach</strong> matters for launches and brand awareness: how many new people
            heard of you.
          </li>
          <li>
            <strong>Impressions and frequency</strong> matter for spotting fatigue. See{' '}
            <Link to="/blog/ad-frequency-how-many-times">ad frequency</Link>.
          </li>
          <li>
            <strong>Neither</strong> decides if the ad is profitable. That is still cost per
            delivered order.
          </li>
        </ul>
      </Section>
      <InlineCta
        title="Not sure if your ads are tiring?"
        body="Book a free call and we will check reach, frequency and results with you."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Is reach exact?',
              a: 'It is an estimate based on Meta’s models, but good enough for decisions.',
            },
            {
              q: 'Is high frequency always bad?',
              a: 'No. On retargeting, a frequency of several is normal. Watch whether results fall as it rises.',
            },
          ]}
        />
      </Section>
    </>
  );
}
