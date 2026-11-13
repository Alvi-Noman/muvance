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
  Steps,
} from '../../components/article';
import { Checklist, LineChart } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        Your ads haven’t suddenly broken. It’s the calendar. Some weeks every brand in Bangladesh is
        fighting for the same buyers, and some weeks nobody is buying at all.
      </Lead>
      <Prose>
        <p>
          Meta ads are sold in an auction. When lots of advertisers want the same people at the same
          time, prices go up. When buyers are distracted or broke, conversion rates go down. Both
          happen on a fairly predictable yearly rhythm here, and once you know it, you can plan for
          it instead of panicking.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Costs usually rise in the weeks before both Eids and in the November–December sale season.',
            'Higher costs are fine if buyers are also spending more. Judge peak weeks on revenue and MER.',
            'Courier holidays around Eid create a hard order cut-off. Plan your ads around it.',
            'Prepare creative and stock weeks before the season, not during it.',
          ]}
        />
      </div>

      <Section id="year" n={1} title="What a typical year can look like">
        <Figure
          title="Ad costs and conversion rate across a year"
          caption="Illustrative. Eid dates move about 11 days earlier each year, so check the calendar for the year you’re planning."
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
                name: 'Cost per 1,000 views (index)',
                values: [95, 92, 140, 105, 135, 100, 94, 96, 101, 112, 150, 160],
                tone: 'warm',
              },
              {
                name: 'Conversion rate (index)',
                values: [100, 98, 150, 110, 125, 85, 90, 92, 96, 108, 135, 140],
                tone: 'ink',
              },
            ]}
            format={(v) => String(Math.round(v))}
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
          Notice that the cost line and the conversion line usually rise together. Ads get more
          expensive, but people are also more ready to buy. Where it hurts is when cost rises and
          conversion doesn’t, like right after Eid al-Adha, when many families have just spent a
          lot.
        </p>
      </Section>

      <Section id="calendar" n={2} title="The moments that matter">
        <CompareTable
          columns={['Moment', 'What usually happens', 'What to do']}
          rows={[
            [
              'Ramadan → Eid al-Fitr',
              'Huge demand for fashion, gifts and food; costs climb',
              'Launch early; push hard in the first half of Ramadan',
            ],
            [
              'Courier cut-off before Eid',
              'Orders after the cut-off arrive late, or not at all',
              'Show a clear "order by" date; reduce spend after it',
            ],
            [
              'Eid al-Adha',
              'Demand dips for many categories as spending goes elsewhere',
              'Lower budgets; focus on categories that fit the season',
            ],
            [
              'Pohela Boishakh',
              'Strong for fashion and traditional items',
              'Plan themed collections and creative',
            ],
            [
              'Durga Puja',
              'Spending rises among relevant audiences',
              'Seasonal creative where it fits your products',
            ],
            [
              'Nov–Dec sale season',
              'Discount fatigue and high costs',
              'Stand out with bundles, not just bigger discounts',
            ],
          ]}
        />
        <Callout tone="local">
          Couriers in Bangladesh usually pause or slow down around Eid. An ad that takes orders
          after the cut-off can create angry customers and refused parcels later.
        </Callout>
      </Section>

      <Section id="plan" n={3} title="A simple season playbook">
        <Steps
          steps={[
            {
              title: '6 weeks before',
              body: 'Plan the offer and order stock. Brief creators and photographers.',
            },
            {
              title: '4 weeks before',
              body: 'Test new creative at normal costs, so you know your winners before prices rise.',
            },
            {
              title: '2–3 weeks before',
              body: 'Raise budgets on proven ads. Retarget visitors and past buyers.',
            },
            {
              title: 'Peak week',
              body: 'Watch MER daily. Don’t panic at higher CPMs if revenue is up.',
            },
            {
              title: 'After the cut-off',
              body: 'Pull back spend, or switch to post-Eid delivery messaging.',
            },
          ]}
        />
      </Section>

      <Section id="check" n={4} title="Pre-Eid checklist">
        <Figure title="Ready for the season?" example={false}>
          <Checklist
            items={[
              'Stock ordered for expected demand',
              'Courier cut-off date confirmed',
              '"Order by" date in ads and on the site',
              'New creative tested 3–4 weeks ahead',
              'Retargeting audiences ready',
              'Extra staff for confirmation calls',
            ]}
            verdicts={[
              'You’ll be scrambling. Start with stock and the courier date.',
              'Decent prep. Finish the rest this week.',
              'You’re ready for the rush.',
            ]}
          />
        </Figure>
      </Section>

      <InlineCta
        title="Want a plan for your next big season?"
        body="We plan creative, budgets and timing around the Bangladeshi calendar. Book a free call."
      />

      <Section id="faq" n={5} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Should I stop ads during expensive weeks?',
              a: 'Usually no. If buyers are spending more too, those can be your best weeks. Only pull back if MER drops below break-even.',
            },
            {
              q: 'Why are results bad right after Eid?',
              a: 'People have just spent a lot, and many are travelling. Lower budgets for a week or two and test again.',
            },
            {
              q: 'How early should I start Eid ads?',
              a: 'Test early, at normal prices, then scale once buying intent rises, typically from the start of Ramadan for Eid al-Fitr.',
            },
          ]}
        />
      </Section>
    </>
  );
}
