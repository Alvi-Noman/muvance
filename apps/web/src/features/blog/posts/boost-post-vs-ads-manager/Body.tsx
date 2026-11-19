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
        The blue &quot;Boost post&quot; button is the easiest way to spend money on Facebook. It is
        also one of the easiest ways to waste it, at least if what you want is sales.
      </Lead>
      <Prose>
        <p>
          Boosting is not useless. It just optimises for the wrong thing for most online stores.
          Here is the difference, and when each one makes sense.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Boosted posts usually optimise for engagement, not purchases.',
            'Ads Manager lets you optimise for purchases, with full control.',
            'Likes and comments do not pay for ads. Orders do.',
            'Boosting can still help for page growth or announcing something.',
          ]}
        />
      </div>

      <Section id="difference" n={1} title="What actually differs">
        <CompareTable
          columns={['', 'Boost post', 'Ads Manager']}
          rows={[
            ['Goal it chases', 'Engagement, reach or messages', 'Any goal, including purchases'],
            ['Who sees it', 'People likely to react', 'People likely to buy (with Purchase goal)'],
            ['Control', 'Very limited', 'Full: budgets, tests, placements'],
            ['Testing', 'One post at a time', 'Several ads compared fairly'],
            ['Reporting', 'Basic', 'Full, including purchases and cost'],
          ]}
        />
      </Section>

      <Section id="why" n={2} title="Why engagement does not equal sales">
        <p>
          When you ask Meta for engagement, it finds people who love to like and comment. Those are
          often not the people who buy. The funnel below shows how a cheap like can still be an
          expensive sale.
        </p>
        <Figure title="Same budget, different goals">
          <Funnel
            stages={[
              { label: 'People reached', value: 40000 },
              { label: 'Liked or commented', value: 1600 },
              { label: 'Visited the store', value: 300 },
              { label: 'Bought', value: 4, note: 'Engagement-focused audiences rarely buy' },
            ]}
            format={(v) => v.toLocaleString('en-US')}
          />
        </Figure>
      </Section>

      <PullQuote>Meta gives you exactly what you ask for. So ask for buyers.</PullQuote>

      <Section id="when" n={3} title="When boosting is fine">
        <ul>
          <li>Announcing a new shop, branch or collection to your followers.</li>
          <li>Getting early comments on a post you will later use as an ad.</li>
          <li>Growing a brand-new page so it does not look empty.</li>
        </ul>
        <Callout tone="tip" title="Best of both">
          Found a post that does well organically? Use it as an ad inside Ads Manager with a Sales
          goal. You keep the likes and comments, and Meta looks for buyers.
        </Callout>
      </Section>

      <InlineCta
        title="Ready to move past boosting?"
        body="Book a free call. We will show you what a proper sales campaign would look like for your store."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Is Ads Manager harder to use?',
              a: 'A little, at first. But a simple setup (one Sales campaign, broad audience, a few ads) is enough to start.',
            },
            {
              q: 'Can I boost a post to get messages?',
              a: 'Yes. Message ads can work well for higher-priced products, as long as someone replies quickly.',
            },
          ]}
        />
      </Section>
    </>
  );
}
