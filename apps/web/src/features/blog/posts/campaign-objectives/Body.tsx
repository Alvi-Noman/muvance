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
import { BarList } from '../../components/viz';
import { taka } from '../../components/format';

export function Body() {
  return (
    <>
      <Lead>
        Choosing the campaign objective is the most important click in Ads Manager. It decides who
        Meta shows your ads to. Pick the wrong one and even great ads will reach the wrong people.
      </Lead>
      <Prose>
        <p>
          Meta now groups objectives into six: Awareness, Traffic, Engagement, Leads, App promotion
          and Sales. For an online store, the choice is usually simpler than it looks.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Want purchases? Use Sales with the Purchase event.',
            'Traffic finds clickers. Engagement finds likers. Neither finds buyers reliably.',
            'Cheap clicks can mean expensive sales.',
            'Use Awareness or Engagement only for a clear, separate reason.',
          ]}
        />
      </div>

      <Section id="which" n={1} title="Which objective for which goal">
        <CompareTable
          columns={['Objective', 'Use it for', 'Avoid it when']}
          rows={[
            ['Sales', 'Website or catalogue purchases', 'Your Pixel does not track purchases yet'],
            ['Leads', 'Forms, calls, bookings', 'You want direct online orders'],
            ['Engagement', 'Messages, video views, post reactions', 'You judge success by sales'],
            ['Traffic', 'Sending people to content', 'You want buyers, not visitors'],
            ['Awareness', 'Reach for a launch or brand', 'You need sales this month'],
          ]}
        />
      </Section>

      <Section id="cheap-clicks" n={2} title="The trap of cheap clicks">
        <p>
          Traffic campaigns often show a lower cost per click. It feels like a win, until you look
          at what those clicks cost per sale.
        </p>
        <Figure title="Cost per purchase by objective, same ads">
          <BarList
            items={[
              {
                label: 'Sales objective',
                value: 420,
                tone: 'accent',
                note: 'Fewer, better clicks',
              },
              {
                label: 'Traffic objective',
                value: 980,
                tone: 'warm',
                note: 'Cheap clicks, few buyers',
              },
              {
                label: 'Engagement objective',
                value: 1650,
                tone: 'muted',
                note: 'Likes, not orders',
              },
            ]}
            format={taka}
          />
        </Figure>
        <Callout tone="tip">
          Judge every campaign on the result you actually need. For a store that is cost per
          purchase or, better, cost per delivered order.
        </Callout>
      </Section>

      <Section id="no-purchase" n={3} title="What if you cannot track purchases yet?">
        <p>
          If your orders come by message or phone, use a Messages campaign (under Engagement or
          Sales, depending on setup) and track orders by hand, or move to a simple website with a
          Purchase event. Optimising for &quot;add to cart&quot; can be a stepping stone while
          volume is low.
        </p>
      </Section>

      <InlineCta
        title="Not sure your setup is chasing the right goal?"
        body="Book a free call. We will look at your campaigns and tell you what Meta is really optimising for."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Should I run an awareness campaign first, then sales?',
              a: 'Usually not for small stores. Sales campaigns already show ads to new people. Add awareness later if you want to build the brand.',
            },
            {
              q: 'Why is my Sales campaign more expensive per click?',
              a: 'Because Meta is choosing people likely to buy, who are more valuable. Judge it on cost per purchase, not per click.',
            },
          ]}
        />
      </Section>
    </>
  );
}
