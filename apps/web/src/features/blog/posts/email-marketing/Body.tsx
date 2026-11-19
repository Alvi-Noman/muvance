import { Link } from 'react-router';
import { FaqList, Figure, InlineCta, Lead, Prose, Section, Steps } from '../../components/article';
import { BarList } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        In many markets, email drives a big share of online store revenue. In Bangladesh, most
        stores never send a single one.
      </Lead>
      <Prose>
        <p>
          It is true that many Bangladeshi shoppers check WhatsApp more than email. But a growing
          share of buyers, especially working professionals, use email daily. And an email costs
          almost nothing to send.
        </p>
      </Prose>
      <Section id="first" n={1} title="The first emails to set up">
        <Steps
          steps={[
            {
              title: 'Order confirmation',
              body: 'Clear details, delivery time, a contact number.',
            },
            { title: 'Shipping update', body: 'Courier name and tracking link.' },
            { title: 'Delivered, how was it?', body: 'A few days later, ask for a review.' },
            {
              title: 'Welcome series',
              body: 'For new subscribers: the story, best sellers, a first-order reason.',
            },
            { title: 'Reorder reminder', body: 'When a consumable product is likely running out.' },
          ]}
        />
        <p>
          These run automatically once set up. Campaign emails (new arrivals, sales) come after.
        </p>
      </Section>
      <Section id="expect" n={2} title="What to expect">
        <Figure
          title="Revenue share by channel after a year of email (example)"
          caption="A modest share, but at almost no cost per order."
        >
          <BarList
            items={[
              { label: 'Paid ads', value: 62, tone: 'ink' },
              { label: 'Organic and direct', value: 22, tone: 'ink' },
              { label: 'Email', value: 9, tone: 'accent' },
              { label: 'SMS and WhatsApp', value: 7, tone: 'accent' },
            ]}
            format={(v) => `${v}%`}
          />
        </Figure>
      </Section>
      <Section id="tools" n={3} title="Tools and basics">
        <ul>
          <li>
            Use your store platform’s email tool or a service like Mailchimp, Klaviyo or Brevo.
          </li>
          <li>
            Send from your own domain, and set up SPF, DKIM and DMARC so emails reach inboxes.
          </li>
          <li>Only email people who agreed to it, and include an unsubscribe link.</li>
          <li>Write like a person, keep it short, make it work on a phone.</li>
        </ul>
        <p>
          Next: <Link to="/blog/build-email-list-from-zero">build your list</Link>.
        </p>
      </Section>
      <InlineCta
        title="Want your first email flows set up?"
        body="Book a free call. We will look at what fits your customers."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Do Bangladeshi customers open emails?',
              a: 'Fewer than in some markets, but enough to matter, especially for higher-priced and professional audiences. Test it.',
            },
            {
              q: 'How often should I email?',
              a: 'Automated emails as triggered, plus one or two campaigns a month to start.',
            },
          ]}
        />
      </Section>
    </>
  );
}
