import {
  Callout,
  FaqList,
  Figure,
  InlineCta,
  Lead,
  Section,
  Steps,
} from '../../components/article';
import { Funnel } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        A good live session feels like a friendly shop with a crowd. A bad one is an hour of “price
        inbox” comments.
      </Lead>
      <Section id="plan" n={1} title="Plan the session">
        <Steps
          steps={[
            { title: 'Pick a theme', body: '“New Eid arrivals”, “Under ৳1,000”, “Winter shawls”.' },
            {
              title: 'Line up products',
              body: '10 to 20 items, in order, with codes and prices ready.',
            },
            { title: 'Announce it', body: 'Post and Story a day before and an hour before.' },
            {
              title: 'Set up',
              body: 'Phone on a stand, good light, stable internet, a helper to manage comments.',
            },
          ]}
        />
      </Section>
      <Section id="orders" n={2} title="Taking orders without chaos">
        <ul>
          <li>Give each product a short code: “Comment S12 + size”.</li>
          <li>Show the price clearly on screen. Saying “inbox for price” loses impulse buyers.</li>
          <li>A helper writes orders into a sheet as they come in.</li>
          <li>Send an order confirmation message right after the live.</li>
        </ul>
        <Callout tone="local">
          Live orders often have a higher cancel rate. A quick confirmation call or message within a
          few hours makes a big difference to delivery rate.
        </Callout>
      </Section>
      <Section id="measure" n={3} title="Measure delivered sales">
        <Figure title="From live viewers to delivered orders (example)">
          <Funnel
            stages={[
              { label: 'Peak viewers', value: 600 },
              { label: 'Comments with an order code', value: 95 },
              { label: 'Confirmed after follow-up', value: 70 },
              { label: 'Delivered', value: 58 },
            ]}
          />
        </Figure>
        <p>
          Repeat what works: the time slot, the host, the theme. Many shops find a regular weekly
          live builds a loyal audience.
        </p>
      </Section>
      <InlineCta
        title="Want to make lives part of your sales plan?"
        body="Book a free call. We will help you plan and promote them."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'How long should a live be?',
              a: '30 to 60 minutes is common. Long enough for people to join, short enough to keep energy.',
            },
            {
              q: 'Can I promote a live with ads?',
              a: 'Yes. Promoting it before and during can bring more viewers.',
            },
          ]}
        />
      </Section>
    </>
  );
}
