import { Link } from 'react-router';
import { Callout, Code, FaqList, InlineCta, Lead, Section } from '../../components/article';
import { Versus } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        Almost everyone reads an SMS. Almost everyone also deletes promotional ones without
        thinking. The difference is relevance.
      </Lead>
      <Section id="types" n={1} title="Two kinds of SMS">
        <Versus
          left={{
            title: 'Transactional',
            points: [
              'Order confirmation',
              'Shipped with tracking',
              'Out for delivery',
              'Highly read and welcomed',
            ],
          }}
          right={{
            title: 'Promotional',
            points: [
              'New arrivals',
              'Sales and offers',
              'Reminders',
              'Useful if relevant and rare',
            ],
          }}
        />
        <Callout tone="local">
          In Bangladesh, bulk SMS goes through licensed providers, and branded sender names
          (masking) need approval. Check current rules with your provider before campaigns.
        </Callout>
      </Section>
      <Section id="write" n={2} title="Writing an SMS that works">
        <ul>
          <li>Start with your brand name.</li>
          <li>One message, one point.</li>
          <li>A short link or clear next step.</li>
          <li>
            Keep it within one SMS length where possible; Bangla text uses more characters per
            message.
          </li>
          <li>Send at sensible hours, not late at night.</li>
        </ul>
        <Code title="Example">
          {
            'BrandName: Your order #1042 is out for delivery today. Rider will call before arriving. Help: 01XXXXXXXXX'
          }
        </Code>
      </Section>
      <Section id="frequency" n={3} title="How often">
        <p>
          For promotions, a few times a month at most, and only to customers who bought or opted in.
          Segment: someone who bought a baby product does not need a men’s shirt offer.
        </p>
      </Section>
      <InlineCta
        title="Want your customer messages set up properly?"
        body="Book a free call. We will look at your order messages and campaigns."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'SMS or WhatsApp?',
              a: (
                <>
                  SMS for important transactional updates, since it reaches everyone. WhatsApp for
                  richer conversations. See{' '}
                  <Link to="/blog/whatsapp-marketing-broadcasts">WhatsApp broadcasts</Link>.
                </>
              ),
            },
            {
              q: 'Do links in SMS work?',
              a: 'Yes, but use a recognisable domain. Strange short links look like scams.',
            },
          ]}
        />
      </Section>
    </>
  );
}
