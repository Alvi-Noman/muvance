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
import { StatTiles, Versus } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        A 20-page report full of charts can still tell you nothing. A good ads report fits on one
        screen and answers three questions: did we make money, why, and what happens next?
      </Lead>
      <Prose>
        <p>
          Whether you work with an agency, a freelancer or your own team, this is what you should
          expect to see each week and each month, and what you can safely ignore.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Lead with business results: sales, delivered orders, profit after ads.',
            'Then show what was tested and what was learned.',
            'End with a clear plan for the next period.',
            'Reach, impressions and likes belong in the appendix, if anywhere.',
          ]}
        />
      </div>

      <Section id="top" n={1} title="The top of the report: business results">
        <p>The first thing you see should be numbers your accountant would recognise.</p>
        <Figure title="A one-glance summary">
          <StatTiles
            items={[
              { value: '৳18.4 lac', label: 'Sales (all channels)' },
              { value: '1,020', label: 'Delivered orders' },
              { value: '৳3.1 lac', label: 'Ad spend' },
              { value: '5.9×', label: 'MER (sales ÷ spend)', dark: true },
            ]}
          />
        </Figure>
        <Callout tone="tip">
          Ask for delivered orders, not just placed orders. In cash-on-delivery markets the gap
          between the two can be the difference between profit and loss.
        </Callout>
      </Section>

      <Section id="middle" n={2} title="The middle: what we tested and learned">
        <CompareTable
          columns={['Test', 'Result', 'Next step']}
          rows={[
            [
              'New hook: price first vs problem first',
              'Problem first won on cost per purchase',
              'Make 3 more problem-first ads',
            ],
            [
              'Bundle offer on best seller',
              'Higher order value, same conversion rate',
              'Make it the default offer',
            ],
            [
              'Reels-only placement test',
              'Cheaper clicks, fewer purchases',
              'Stop; keep automatic placements',
            ],
          ]}
        />
        <p>
          This part shows whether anyone is actually thinking about your account. If it is empty
          month after month, nothing is being tested.
        </p>
      </Section>

      <Section id="fluff" n={3} title="Signal vs fluff">
        <Versus
          left={{
            title: 'Usually fluff',
            points: [
              'Reach and impressions on their own',
              'Page likes and followers',
              'Ads Manager ROAS without real revenue',
              'Screenshots with no explanation',
            ],
          }}
          right={{
            title: 'Real signal',
            points: [
              'Delivered orders and their cost',
              'Sales and MER from your store',
              'What was tested, and what it taught us',
              'A plan with dates and owners',
            ],
          }}
        />
      </Section>

      <Section id="rhythm" n={4} title="How often to report">
        <ul>
          <li>
            <strong>Live:</strong> a dashboard you can check any time.
          </li>
          <li>
            <strong>Weekly:</strong> a short update or call: results, tests, next steps.
          </li>
          <li>
            <strong>Monthly:</strong> the bigger picture, profit, and plans for the next month.
          </li>
        </ul>
      </Section>

      <InlineCta
        title="Reporting you can check any time"
        body="Our clients see live results and get a weekly update in plain words. Book a free call to see how we report."
      />

      <Section id="faq" n={5} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Why do report numbers differ from my store?',
              a: 'Meta counts sales it believes it influenced, using its attribution window. Your store counts every real order. Track both.',
            },
            {
              q: 'What if my agency will not share account access?',
              a: 'That is a red flag. You should always have admin access to your own ad account and Pixel.',
            },
          ]}
        />
      </Section>
    </>
  );
}
