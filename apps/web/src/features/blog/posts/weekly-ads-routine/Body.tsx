import {
  Callout,
  FaqList,
  InlineCta,
  KeyTakeaways,
  Lead,
  Prose,
  Section,
  Steps,
} from '../../components/article';
import { Checklist } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        Checking Ads Manager ten times a day does not make ads better. A calm weekly routine does.
        Here is one that fits into about an hour.
      </Lead>
      <Prose>
        <p>
          Daily, you only need a two-minute glance for anything broken: spend stuck at zero, a
          rejected ad, a payment problem. Real decisions happen once a week, with enough data to
          make them.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Daily: two minutes, only for emergencies.',
            'Weekly: one hour, for real decisions.',
            'Start with business numbers, then campaigns, then creative.',
            'End every week with a written plan.',
          ]}
        />
      </div>

      <Section id="routine" n={1} title="The one-hour weekly routine">
        <Steps
          steps={[
            {
              title: '10 min: business numbers',
              body: 'Total sales, delivered orders, ad spend, MER and contribution margin for the week vs last week.',
            },
            {
              title: '10 min: campaigns',
              body: 'Which campaigns are above or below target cost per purchase? Any learning resets?',
            },
            {
              title: '15 min: creative',
              body: 'Winners, losers, frequency. Which ads are tiring? What did this week’s tests teach you?',
            },
            {
              title: '10 min: the store',
              body: 'Conversion rate, add-to-cart rate, checkout drop-off, delivery failures.',
            },
            {
              title: '15 min: next week’s plan',
              body: 'New ads to make, budgets to move, tests to run. Write it down.',
            },
          ]}
        />
        <Callout tone="tip" title="Same day, same time">
          Doing it on the same day each week makes trends easy to spot, and stops you reacting to
          one bad day.
        </Callout>
      </Section>

      <Section id="daily" n={2} title="The two-minute daily check">
        <Checklist
          items={[
            'Spend is running (not stuck at zero)',
            'No rejected ads or account warnings',
            'Payment method is working',
            'Orders are coming in on the store',
          ]}
          verdicts={[
            'Something is wrong. Fix it now.',
            'Mostly fine. Check the open item.',
            'All good. Close Ads Manager.',
          ]}
        />
      </Section>

      <Section id="avoid" n={3} title="What not to do">
        <ul>
          <li>Turning ads off after one bad day.</li>
          <li>Making several edits on different days, each resetting learning.</li>
          <li>Judging on Ads Manager numbers alone without checking real sales.</li>
        </ul>
      </Section>

      <InlineCta
        title="Prefer someone else to run the routine?"
        body="We run it for our clients every week, with a plain-words update. Book a free call to see how."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'What if my spend is very small?',
              a: 'Then the weekly routine matters even more: small budgets need more days of data before decisions.',
            },
            {
              q: 'Which day is best for the weekly review?',
              a: 'Any day, as long as it is consistent. Many prefer early in the week, to plan creative for the days ahead.',
            },
          ]}
        />
      </Section>
    </>
  );
}
