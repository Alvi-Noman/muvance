import { Link } from 'react-router';
import {
  Callout,
  CompareTable,
  FaqList,
  Figure,
  InlineCta,
  Lead,
  Section,
} from '../../components/article';
import { BarList } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        A WhatsApp message from a brand you like feels personal. Ten from a brand you barely
        remember gets your number blocked.
      </Lead>
      <Section id="options" n={1} title="Your options">
        <CompareTable
          columns={['Option', 'Good for', 'Limits']}
          rows={[
            [
              'WhatsApp Business app',
              'Small shops, chats, catalogue',
              'Broadcasts reach only people who saved your number',
            ],
            [
              'WhatsApp Business Platform (API)',
              'Larger volumes, automation',
              'Approved templates, paid per conversation, needs a provider',
            ],
            [
              'Click-to-WhatsApp ads',
              'Starting new chats from ads',
              <>
                Ad costs; see{' '}
                <Link to="/blog/click-to-whatsapp-vs-website-ads">
                  click-to-WhatsApp vs website
                </Link>
              </>,
            ],
          ]}
        />
      </Section>
      <Section id="use" n={2} title="What to send">
        <ul>
          <li>New arrivals to customers who bought something similar.</li>
          <li>Restock alerts people asked for.</li>
          <li>Reorder reminders for consumables.</li>
          <li>Order and delivery updates.</li>
          <li>Occasional members-first offers.</li>
        </ul>
        <Callout tone="tip">
          Ask customers to save your number at the order confirmation call. It makes broadcasts
          reach them.
        </Callout>
      </Section>
      <Section id="safe" n={3} title="Keeping your number safe">
        <Callout tone="warning">
          If many people block or report your number, WhatsApp can limit or ban it. Only message
          people who want to hear from you, and make opting out easy.
        </Callout>
        <Figure title="Effect of messaging frequency on block rate (example)">
          <BarList
            items={[
              { label: '2 per month', value: 0.4, tone: 'accent' },
              { label: '1 per week', value: 0.9, tone: 'ink' },
              { label: '3+ per week', value: 3.1, tone: 'warm' },
            ]}
            format={(v) => `${v}%`}
          />
        </Figure>
      </Section>
      <InlineCta
        title="Want WhatsApp working for repeat sales?"
        body="Book a free call. We will help you set it up safely."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Can I add customers to a WhatsApp group instead?',
              a: 'Only with their permission. Many people dislike being added without asking.',
            },
            {
              q: 'Is the API expensive?',
              a: 'You pay per conversation through a provider. For larger volumes it is often worth it for automation.',
            },
          ]}
        />
      </Section>
    </>
  );
}
