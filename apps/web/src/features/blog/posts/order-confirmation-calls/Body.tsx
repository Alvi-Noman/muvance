import {
  Callout,
  Code,
  FaqList,
  Figure,
  InlineCta,
  KeyTakeaways,
  Lead,
  Prose,
  PullQuote,
  Section,
} from '../../components/article';
import { Funnel } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        A one-minute call before you ship can save the cost of a refused parcel, catch a wrong size,
        fix a bad address and filter out fake orders. It is one of the highest-return habits a COD
        store can have.
      </Lead>
      <Prose>
        <p>
          The call should feel like service, not suspicion. Here is a simple script, what to listen
          for, and what to do with each answer.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Call every COD order before dispatch, ideally within a few hours.',
            'Confirm product, size, price with delivery, address and a good time.',
            'Listen for hesitation: it predicts refusals.',
            'Log the outcome of every call.',
          ]}
        />
      </div>

      <Section id="why" n={1} title="Where confirmation calls help">
        <Figure title="Orders from placed to delivered">
          <Funnel
            stages={[
              { label: 'Orders placed', value: 1000 },
              {
                label: 'Reached and confirmed',
                value: 860,
                note: 'Fake and duplicate orders filtered out',
              },
              { label: 'Shipped', value: 850 },
              { label: 'Delivered', value: 780, note: 'Fewer refusals at the door' },
            ]}
            format={(v) => v.toLocaleString('en-US')}
          />
        </Figure>
      </Section>

      <Section id="script" n={2} title="A simple script">
        <Code title="confirmation-call.txt">{`1. Greeting
   "Assalamu alaikum, I'm calling from [Brand] about your order."

2. Confirm the order
   "You ordered the [product], size [M], colour [black]. Is that right?"

3. Confirm the total
   "The total is ৳1,450 including delivery, paid in cash on delivery."

4. Confirm the address and time
   "We'll deliver to [area, address]. Is there a landmark?
    Will you be available in the next 2–3 days?"

5. Close warmly
   "Thank you! The courier will call before arriving."`}</Code>
        <Callout tone="tip" title="Mention the total out loud">
          Many refusals happen because the buyer forgot about the delivery charge. Saying the full
          amount on the call prevents the surprise at the door.
        </Callout>
      </Section>

      <PullQuote>Make it feel like service, not suspicion.</PullQuote>

      <Section id="listen" n={3} title="What to listen for">
        <ul>
          <li>
            <strong>Hesitation or &quot;I didn’t order this&quot;:</strong> cancel politely.
          </li>
          <li>
            <strong>Size or colour doubts:</strong> help them choose now, not after delivery.
          </li>
          <li>
            <strong>Vague address:</strong> get a landmark and a second number.
          </li>
          <li>
            <strong>Unreachable after two tries:</strong> send a message and hold the order.
          </li>
        </ul>
      </Section>

      <InlineCta
        title="Want a call centre without hiring one?"
        body="Order confirmation calls are part of our operational support. Book a free call to talk it through."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Can I confirm by SMS instead of calling?',
              a: 'It helps, but calls catch more problems, especially size doubts and hesitation. Many stores do both.',
            },
            {
              q: 'How fast should we call?',
              a: 'Within a few hours of the order, while the buyer still remembers and is still interested.',
            },
          ]}
        />
      </Section>
    </>
  );
}
