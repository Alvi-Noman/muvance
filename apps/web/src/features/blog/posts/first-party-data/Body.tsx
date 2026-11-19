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

export function Body() {
  return (
    <>
      <Lead>
        If your Facebook page disappeared tomorrow, could you still reach your customers? For many
        brands, the honest answer is no.
      </Lead>
      <Prose>
        <p>
          “First-party data” just means information customers gave you directly: their name, phone,
          email, what they bought and when. It is yours, and you can use it with their permission
          across every channel.
        </p>
      </Prose>
      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Collect phone and, where possible, email with every order.',
            'Keep it in one place, not scattered across inboxes.',
            'Use it for repeat sales, better ad audiences and smarter decisions.',
            'Be clear about how you use it, and make it easy to opt out.',
          ]}
        />
      </div>
      <Section id="what" n={1} title="What to collect">
        <ul>
          <li>Name, phone and delivery area (you have this from every order).</li>
          <li>Email, if customers are willing. Make it optional.</li>
          <li>Products bought, order dates and order values.</li>
          <li>
            How they heard about you (see{' '}
            <Link to="/blog/post-purchase-survey-questions">post-purchase surveys</Link>).
          </li>
          <li>Permission to send offers.</li>
        </ul>
      </Section>
      <Section id="store" n={2} title="Keep it in one place">
        <p>
          A store platform like Shopify or WooCommerce already keeps orders. Orders taken in
          Messenger or by phone often never make it into the same list. Fix that first: one customer
          list, every order.
        </p>
        <Callout tone="tip">
          Even a well-kept Google Sheet beats five scattered inboxes. A proper{' '}
          <Link to="/blog/crm-for-small-online-brands">CRM</Link> can come later.
        </Callout>
      </Section>
      <Section id="use" n={3} title="Five ways to use it">
        <Steps
          steps={[
            {
              title: 'Repeat-purchase messages',
              body: 'Remind customers when they are likely to need more.',
            },
            {
              title: 'Custom audiences',
              body: 'Upload buyers to Meta to exclude them from first-order offers or find similar people.',
            },
            {
              title: 'Better conversion data',
              body: 'Sending hashed phone and email with Conversions API helps Meta match sales to ads.',
            },
            {
              title: 'Know your best customers',
              body: 'Who orders most often? Where are they? What did they buy first?',
            },
            { title: 'Win-back', body: 'Reach people who have not ordered in a while.' },
          ]}
        />
      </Section>
      <Section id="respect" n={4} title="Use it with respect">
        <p>
          Only message people who agreed to hear from you, do not overdo it, and always offer a
          simple way to stop. Customers forgive a lot, but not spam.
        </p>
      </Section>
      <InlineCta
        title="Want to turn your customer list into repeat sales?"
        body="Book a free call. We will show you what your list could be doing."
      />
      <Section id="faq" n={5} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Is it legal to upload customer phone numbers to Meta?',
              a: 'Meta hashes the data before matching. You should still tell customers in your privacy policy how you use their information.',
            },
            {
              q: 'How big does my list need to be?',
              a: 'For ads, a few hundred buyers is a start. For repeat-purchase messages, any size works.',
            },
          ]}
        />
      </Section>
    </>
  );
}
