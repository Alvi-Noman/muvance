import {
  Callout,
  CompareTable,
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
        On Meta, the picture or video does most of the work. But the words around it still decide
        whether someone clicks, and whether the right people click. Here is a simple way to write
        them.
      </Lead>
      <Prose>
        <p>
          A Meta ad has three bits of text: the primary text above the creative, the headline below
          it, and the call-to-action button. Each one has a different job.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Primary text: hook, benefit, proof, offer, in that order.',
            'Headline: the single strongest reason to buy, in a few words.',
            'Button: match it to the action (Shop now, Order now, Send message).',
            'Write how your customers talk, not how brochures talk.',
          ]}
        />
      </div>

      <Section id="formula" n={1} title="The formula for primary text">
        <Steps
          steps={[
            {
              title: 'Hook (first line)',
              body: 'Only the first line or two show before "See more". Make them count.',
            },
            { title: 'Benefit', body: 'What changes for the buyer. Not features: results.' },
            { title: 'Proof', body: 'A review, a number, a guarantee, how many people bought.' },
            {
              title: 'Offer and next step',
              body: 'Price, delivery, how to order. Remove the last doubt.',
            },
          ]}
        />
      </Section>

      <Section id="example" n={2} title="One product, written well and badly">
        <CompareTable
          columns={['Part', 'Weak', 'Stronger']}
          rows={[
            [
              'Hook',
              'Premium quality cotton shirts available',
              'Shirt still crisp after a full day in Dhaka heat?',
            ],
            [
              'Benefit',
              'Best fabric, best stitching',
              'Breathes in humid weather, no ironing in the morning',
            ],
            [
              'Proof',
              'Customers love it',
              'A real customer’s words, e.g. “Bought 2, came back for 3 more”',
            ],
            [
              'Offer',
              'Order now!!!',
              '৳1,450 · Free delivery inside Dhaka · Exchange within 7 days',
            ],
          ]}
        />
        <Callout tone="tip">
          Use real customer quotes only, with their permission. Made-up reviews destroy trust when
          people notice, and they usually do.
        </Callout>
      </Section>

      <Section id="headline" n={3} title="Headlines and buttons">
        <ul>
          <li>Headline: one clear benefit or the offer (&quot;Free delivery in Dhaka&quot;).</li>
          <li>Keep it short. It is often cut off on small screens.</li>
          <li>
            Button: &quot;Shop now&quot; for websites, &quot;Send message&quot; for chat sales.
          </li>
        </ul>
      </Section>

      <InlineCta
        title="Copy that sounds like your customers"
        body="We write ads in Bangla, English and Banglish, tested every week. Book a free call to talk about your brand."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Long or short primary text?',
              a: 'Both can work. Short for simple, cheap products. Longer for products that need explaining. Test it.',
            },
            {
              q: 'Should I use emojis?',
              a: 'A few can help break up text. Too many look like spam. Match your brand.',
            },
          ]}
        />
      </Section>
    </>
  );
}
