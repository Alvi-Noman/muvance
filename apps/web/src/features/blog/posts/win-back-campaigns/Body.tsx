import {
  Callout,
  FaqList,
  Figure,
  InlineCta,
  Lead,
  Section,
  Steps,
} from '../../components/article';
import { LineChart } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        Some customers do not leave because they were unhappy. They just forgot about you.
      </Lead>
      <Section id="when" n={1} title="When a customer counts as lapsed">
        <p>
          It depends on how often people normally buy. Look at your typical time between first and
          second order. Customers who pass two or three times that gap without ordering are lapsing.
        </p>
        <Figure
          title="Chance of a customer ordering again, by days since last order (example)"
          caption="The longer the gap, the harder it gets. Reach out before the curve flattens."
        >
          <LineChart
            labels={['30', '60', '90', '120', '180', '270', '365']}
            series={[
              { name: 'Chance of ordering again', values: [42, 30, 22, 16, 10, 6, 4], tone: 'ink' },
            ]}
            format={(v) => `${v}%`}
          />
        </Figure>
      </Section>
      <Section id="sequence" n={2} title="A simple sequence">
        <Steps
          steps={[
            {
              title: 'A friendly reminder',
              body: '“It’s been a while. Here’s what’s new.” No discount.',
            },
            {
              title: 'Something useful',
              body: 'A new product related to what they bought, or a restock.',
            },
            { title: 'A small reason to return', body: 'A limited offer or free delivery.' },
            { title: 'Ask why', body: '“Did something go wrong?” Learn and fix.' },
          ]}
        />
      </Section>
      <Section id="channels" n={3} title="Channels to use">
        <p>
          WhatsApp, SMS, email and custom-audience ads all work. Use what the customer opted into.
          Exclude anyone with an unresolved complaint, and fix that first.
        </p>
        <Callout tone="tip">
          Keep the biggest offer for the last message. Many customers return at the first friendly
          nudge.
        </Callout>
      </Section>
      <InlineCta
        title="Want to wake up your past customers?"
        body="Book a free call. We will look at your list and plan a win-back."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Won’t this train people to wait for discounts?',
              a: 'Not if the first messages carry no offer and the offer is limited.',
            },
            {
              q: 'How often to run it?',
              a: 'Set it up to run automatically as customers pass the lapse point.',
            },
          ]}
        />
      </Section>
    </>
  );
}
