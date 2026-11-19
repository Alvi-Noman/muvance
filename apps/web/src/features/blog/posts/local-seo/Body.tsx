import {
  Callout,
  FaqList,
  Figure,
  InlineCta,
  Lead,
  Section,
  Steps,
} from '../../components/article';
import { BarList } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        When someone hears your brand name and searches it, the box on the right side of Google is
        often the first thing they see. Make sure it is yours.
      </Lead>
      <Section id="who" n={1} title="Who should have one">
        <p>
          Google Business Profile is meant for businesses that meet customers in person, at a
          location or in a service area. If you have a showroom, a pickup point or an office
          customers can visit, you qualify. Purely online stores without any customer-facing address
          may not.
        </p>
      </Section>
      <Section id="setup" n={2} title="Setting it up well">
        <Steps
          steps={[
            {
              title: 'Claim and verify',
              body: 'At business.google.com. Verification can take some days.',
            },
            {
              title: 'Pick the right category',
              body: 'The most specific one that fits, like “Clothing store”.',
            },
            { title: 'Fill in everything', body: 'Hours, phone, website, description, products.' },
            { title: 'Add real photos', body: 'Storefront, inside, products, team.' },
            { title: 'Ask for reviews', body: 'Send happy customers a direct review link.' },
            { title: 'Post updates', body: 'New arrivals and offers, every week or two.' },
          ]}
        />
        <Callout tone="tip">
          Reply to every review, good or bad, briefly and politely. Future customers read the
          replies.
        </Callout>
      </Section>
      <Section id="measure" n={3} title="What to watch">
        <Figure title="Monthly actions from a profile (example)">
          <BarList
            items={[
              { label: 'Website visits', value: 320, tone: 'ink' },
              { label: 'Direction requests', value: 140, tone: 'accent' },
              { label: 'Calls', value: 95, tone: 'accent' },
            ]}
          />
        </Figure>
      </Section>
      <InlineCta
        title="Want help with your Google presence?"
        body="Book a free call. We will check how you show up when people search your name."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            { q: 'Is it free?', a: 'Yes.' },
            {
              q: 'Can I list a home address?',
              a: 'You can hide the address and show a service area instead, if you serve customers at their location.',
            },
          ]}
        />
      </Section>
    </>
  );
}
