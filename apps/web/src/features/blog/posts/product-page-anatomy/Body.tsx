import { Link } from 'react-router';
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
        Your ad’s job is to get the click. Your product page’s job is everything after: answering
        every doubt fast enough that the buyer orders before they get distracted.
      </Lead>
      <Prose>
        <p>
          On a phone, people decide in seconds. Here is the order a high-converting mobile product
          page usually follows, from top to bottom. If you already have a page that gets clicks but
          not sales, also read{' '}
          <Link to="/blog/landing-page-fixes-ad-clicks-no-sales">10 landing page fixes</Link>.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'The first screen should show the product, price and order button.',
            'Answer doubts in the order buyers have them.',
            'Proof (reviews, real photos) belongs high up, not at the bottom.',
            'Make ordering possible in under a minute.',
          ]}
        />
      </div>

      <Section id="order" n={1} title="Top to bottom, in order">
        <Steps
          steps={[
            {
              title: 'Photos you can swipe',
              body: 'Main shot first, then detail, scale and in use. Video if you have it.',
            },
            {
              title: 'Name, price and a one-line benefit',
              body: 'No hunting for the price. Show any saving clearly.',
            },
            {
              title: 'Options and the order button',
              body: 'Size, colour, quantity, then a big, sticky button.',
            },
            {
              title: 'Delivery and payment',
              body: 'How long, how much, cash on delivery available, exchange policy.',
            },
            { title: 'Proof', body: 'Star rating, real reviews with photos, how many sold.' },
            { title: 'Details', body: 'Material, size chart, care, what is in the box.' },
            { title: 'Questions', body: 'A short FAQ with the doubts your chat team hears most.' },
          ]}
        />
        <Callout tone="local" title="For Bangladeshi shoppers">
          Delivery time, delivery charge and &quot;cash on delivery available&quot; are among the
          first things people look for. Put them right under the button.
        </Callout>
      </Section>

      <Section id="check" n={2} title="Check your own page">
        <Checklist
          items={[
            'Price and order button visible without scrolling',
            'Delivery time and charge shown near the button',
            'At least one real review with a photo',
            'A size chart or dimensions with real measurements',
            'The page loads in a few seconds on mobile data',
            'Ordering takes under a minute',
          ]}
          verdicts={[
            'Your page is losing sales the ads paid for.',
            'Decent. Fix the gaps next.',
            'A strong page. Now test offers.',
          ]}
        />
      </Section>

      <InlineCta
        title="Want us to review your product page?"
        body="Book a free call. We will look at your page on a phone, like your customers do, and show you what to change."
      />

      <Section id="faq" n={3} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Should I send ads to the product page or a landing page?',
              a: 'A well-built product page is often enough. A dedicated landing page helps when one product needs more explaining.',
            },
            {
              q: 'How long should a product page be?',
              a: 'Long enough to answer every common doubt, with the essentials on the first screen.',
            },
          ]}
        />
      </Section>
    </>
  );
}
