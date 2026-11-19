import { Link } from 'react-router';
import { Callout, CompareTable, FaqList, InlineCta, Lead, Section } from '../../components/article';
import { Checklist } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        A loyalty programme cannot make people love a product they do not like. It can give people
        who already like you a reason to come back sooner.
      </Lead>
      <Section id="when" n={1} title="When it is worth it">
        <Checklist
          items={[
            'Customers can buy from you several times a year',
            'Many customers have already bought twice',
            'You have margin to reward without losing money',
            'You can track customers by phone or account',
          ]}
          verdicts={[
            'Not yet. Focus on product and delivery.',
            'Try a simple version.',
            'A programme could pay off.',
          ]}
        />
      </Section>
      <Section id="types" n={2} title="Simple versions that work">
        <CompareTable
          columns={['Type', 'How it works', 'Best for']}
          rows={[
            ['Stamp card', 'Every 5th order gets a gift', 'Food, cosmetics, refills'],
            ['Points', 'Earn on spend, redeem later', 'Stores with many products'],
            ['VIP tier', 'Top customers get early access and perks', 'Fashion, limited drops'],
            ['Surprise and delight', 'Unannounced gifts for loyal buyers', 'Any small brand'],
          ]}
        />
        <Callout tone="tip">
          Non-discount perks (early access, free gift wrap, a handwritten note) build loyalty
          without training people to wait for sales.
        </Callout>
      </Section>
      <Section id="measure" n={3} title="How to know it works">
        <p>
          Compare the <Link to="/blog/repeat-purchase-rate-ecommerce">repeat purchase rate</Link>{' '}
          and time between orders for members and similar non-members, before and after launch.
        </p>
      </Section>
      <InlineCta
        title="Thinking about a loyalty programme?"
        body="Book a free call. We will check whether your numbers support one."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Do I need an app?',
              a: 'No. A store plugin or even a tracked spreadsheet works at first.',
            },
            {
              q: 'Should points expire?',
              a: 'A generous expiry encourages use without feeling unfair.',
            },
          ]}
        />
      </Section>
    </>
  );
}
