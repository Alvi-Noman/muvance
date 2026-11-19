import { Link } from 'react-router';
import { Callout, FaqList, InlineCta, Lead, Section, Steps } from '../../components/article';

export function Body() {
  return (
    <>
      <Lead>
        Plenty of customers find a brand online and buy in person. Plenty see it in a shop and order
        online later. Most brands never connect the two.
      </Lead>
      <Section id="ideas" n={1} title="Ways to connect them">
        <Steps
          steps={[
            {
              title: 'Collect contacts in store',
              body: 'Phone number at checkout for receipts and updates.',
            },
            {
              title: 'QR codes everywhere',
              body: 'On tags, bags and counters, leading to your page or WhatsApp.',
            },
            {
              title: 'Promote the shop in ads',
              body: 'For people nearby: address, hours, what is in stock.',
            },
            {
              title: 'Order online, pick up in store',
              body: 'Saves delivery cost and builds trust.',
            },
            { title: 'Same prices and offers', body: 'Or clear reasons when they differ.' },
          ]}
        />
      </Section>
      <Section id="measure" n={2} title="Measuring the effect">
        <p>
          Ask in-store customers how they heard of you, and track walk-ins around campaigns. A{' '}
          <Link to="/blog/google-business-profile-local-seo">Google Business Profile</Link> shows
          direction requests and calls.
        </p>
        <Callout tone="tip">
          Meta lets you upload offline sales to match against ad viewers. Worth exploring once
          in-store sales are recorded with phone numbers.
        </Callout>
      </Section>
      <InlineCta
        title="Have a shop and an online store?"
        body="Book a free call. We will help connect them."
      />
      <Section id="faq" n={3} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Will online sales hurt my shop?',
              a: 'Usually they help each other. People like being able to see and touch, then reorder online.',
            },
            {
              q: 'Should I open a shop?',
              a: 'Only if online demand is strong in one area and the numbers work. It is a big fixed cost.',
            },
          ]}
        />
      </Section>
    </>
  );
}
