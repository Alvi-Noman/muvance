import {
  Callout,
  CompareTable,
  FaqList,
  Figure,
  InlineCta,
  Lead,
  Section,
} from '../../components/article';
import { Legend, LineChart } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        TikTok is not a cheaper Meta. It is a different place, with different habits, that needs
        different ads.
      </Lead>
      <Section id="compare" n={1} title="How they compare">
        <CompareTable
          columns={['', 'Meta (Facebook + Instagram)', 'TikTok']}
          rows={[
            ['Audience', 'Very broad, all ages', 'Younger on average'],
            ['Creative', 'Many formats work', 'Native, vertical video only'],
            [
              'Buying behaviour',
              'Click-to-buy and messages both strong',
              'More discovery, later purchase',
            ],
            ['Tracking', 'Mature Pixel and Conversions API', 'Pixel and Events API, improving'],
            ['Creative fatigue', 'Moderate', 'Fast; needs a lot of fresh video'],
          ]}
        />
      </Section>
      <Section id="when" n={2} title="When to add TikTok">
        <ul>
          <li>Meta is profitable and you want new reach.</li>
          <li>Your product suits younger buyers.</li>
          <li>You can supply new videos every week.</li>
          <li>
            You can afford a test budget for a month without needing it to pay back immediately.
          </li>
        </ul>
        <Callout tone="warning">
          Do not move all budget off Meta to “try TikTok”. Add a test budget and judge it on total
          store sales.
        </Callout>
      </Section>
      <Section id="judge" n={3} title="How to judge the test">
        <Figure
          title="Store sales during a TikTok test (example)"
          caption="TikTok claimed fewer sales than the lift in total orders. Discovery often shows up elsewhere."
        >
          <Legend
            items={[
              { name: 'Store orders', tone: 'accent' },
              { name: 'Orders TikTok claims', tone: 'ink' },
            ]}
          />
          <LineChart
            labels={['W1', 'W2', 'W3', 'W4', 'W5', 'W6']}
            series={[
              { name: 'Store orders', values: [300, 305, 330, 345, 350, 362], tone: 'accent' },
              {
                name: 'Orders TikTok claims',
                values: [0, 8, 14, 18, 20, 22],
                tone: 'ink',
                dashed: true,
              },
            ]}
            markers={[{ at: 1, label: 'TikTok on' }]}
          />
        </Figure>
      </Section>
      <InlineCta
        title="Want to test TikTok properly?"
        body="Book a free call. We will plan a test with a clear way to judge it."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Is TikTok cheaper?',
              a: 'CPMs can be lower, but cost per order is what counts, and that varies a lot.',
            },
            {
              q: 'Do I need different creatives?',
              a: 'Usually yes. Polished Meta ads often underperform on TikTok.',
            },
          ]}
        />
      </Section>
    </>
  );
}
