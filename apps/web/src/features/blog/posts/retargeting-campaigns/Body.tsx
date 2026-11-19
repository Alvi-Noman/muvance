import { Link } from 'react-router';
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
} from '../../components/article';
import { Funnel } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        Most people who visit your store will not buy on the first visit. Retargeting is how you
        bring the interested ones back, without paying to find them all over again.
      </Lead>
      <Prose>
        <p>
          It works best when you match the message to how close someone came to buying. A person who
          watched three seconds of a video needs something very different from someone who left a
          full cart.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Group warm people by how close they came to buying.',
            'Show each group a different message: proof, answers, or a nudge.',
            'Keep retargeting budgets small. The audience is small.',
            'Broad campaigns already retarget a lot on their own. Check for overlap.',
          ]}
        />
      </div>

      <Section id="who" n={1} title="Who to retarget">
        <Figure title="Warm audiences shrink as intent grows">
          <Funnel
            stages={[
              { label: 'Watched a video (50%+)', value: 25000 },
              { label: 'Visited the store', value: 6000 },
              { label: 'Viewed a product', value: 3200 },
              { label: 'Added to cart', value: 450 },
              { label: 'Started checkout', value: 180, note: 'Smallest group, highest intent' },
            ]}
            format={(v) => v.toLocaleString('en-US')}
          />
        </Figure>
      </Section>

      <Section id="what" n={2} title="What to show each group">
        <CompareTable
          columns={['Group', 'What they need', 'Ad idea']}
          rows={[
            ['Video viewers', 'A reason to visit', 'Your best product, with a clear offer'],
            ['Store visitors', 'Proof', 'Customer reviews and unboxing videos'],
            ['Product viewers', 'Answers to doubts', 'Size, delivery and return details'],
            [
              'Cart and checkout',
              'A small nudge',
              'Free delivery or a reminder that stock is limited',
            ],
          ]}
        />
        <Callout tone="warning" title="Do not discount for everyone">
          If every abandoned cart gets a discount, customers learn to abandon carts. Use reminders
          and proof first. Save discounts for the last step, if at all.
        </Callout>
      </Section>

      <PullQuote>Retargeting is a conversation, not the same ad shown ten times.</PullQuote>

      <Section id="budget" n={3} title="How much to spend">
        <p>
          Warm audiences are small, so they fill up fast. A common split is most of your budget on
          finding new buyers, and a small share on retargeting. If frequency climbs above a few
          times a week, the audience is tired: change the ads or lower the budget.
        </p>
        <p>
          Also remember that broad Sales campaigns already show ads to warm people. Before adding a
          separate retargeting campaign, check whether it actually brings extra sales. Our guide to{' '}
          <Link to="/blog/ad-frequency-how-many-times">ad frequency</Link> helps.
        </p>
      </Section>

      <InlineCta
        title="Bring back the people who nearly bought"
        body="Book a free call. We will look at your warm audiences and show you where sales are slipping away."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'How long should my retargeting window be?',
              a: 'Match it to how long people take to decide. A few days for cheap impulse products, a few weeks for expensive ones.',
            },
            {
              q: 'Should I retarget people who already bought?',
              a: 'Yes, with different products, refills or bundles. Repeat buyers are often your cheapest sales.',
            },
          ]}
        />
      </Section>
    </>
  );
}
