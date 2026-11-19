import { Link } from 'react-router';
import { FaqList, Figure, InlineCta, Lead, Section, Steps } from '../../components/article';
import { BarList, Versus } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        A bot that answers “price?” in two seconds wins sales. A bot that traps someone in menus
        loses them.
      </Lead>
      <Section id="automate" n={1} title="What to automate">
        <Versus
          left={{
            title: 'Good for a bot',
            points: [
              'Price and availability',
              'Delivery time and charges',
              'Payment options',
              'Order status',
              'Opening hours',
            ],
          }}
          right={{
            title: 'Keep human',
            points: [
              'Complaints',
              'Size and fit advice',
              'Custom orders',
              'Anything emotional',
              'Upset customers',
            ],
          }}
        />
      </Section>
      <Section id="setup" n={2} title="A simple setup">
        <Steps
          steps={[
            { title: 'Instant greeting', body: 'With 3–4 buttons for the most common questions.' },
            { title: 'Saved answers', body: 'Short, clear, with a link to the product.' },
            { title: 'A “talk to a person” option', body: 'Always visible.' },
            { title: 'Hand-off rules', body: 'Bot passes the chat to staff with the context.' },
          ]}
        />
        <p>
          Meta Business Suite has built-in automated replies. Third-party tools add more, and
          AI-based replies are improving; check their answers carefully.
        </p>
      </Section>
      <Section id="measure" n={3} title="Is it helping?">
        <Figure title="Enquiry-to-order rate before and after automation (example)">
          <BarList
            items={[
              { label: 'Before (slow replies at night)', value: 12, tone: 'muted' },
              { label: 'After (instant answers, staff follow-up)', value: 17, tone: 'accent' },
            ]}
            format={(v) => `${v}%`}
          />
        </Figure>
        <p>
          Watch for complaints about the bot, and read a sample of conversations weekly. See{' '}
          <Link to="/blog/customer-service-as-marketing">customer service as marketing</Link>.
        </p>
      </Section>
      <InlineCta
        title="Want your inbox automated sensibly?"
        body="Book a free call. Call centre support is part of our operations services."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Will customers mind talking to a bot?',
              a: 'Not for simple questions answered quickly. They mind when they cannot reach a person.',
            },
            {
              q: 'Can a bot take orders?',
              a: 'It can collect details. Many brands still confirm by phone to reduce fake orders.',
            },
          ]}
        />
      </Section>
    </>
  );
}
