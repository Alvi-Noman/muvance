import {
  Callout,
  CompareTable,
  FaqList,
  InlineCta,
  KeyTakeaways,
  Lead,
  Prose,
  Section,
} from '../../components/article';
import { Versus } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        Asking for a small advance by bKash or Nagad can cut fake and refused orders sharply. It can
        also scare away genuine buyers who do not trust you yet. The answer is to ask selectively.
      </Lead>
      <Prose>
        <p>
          Advance payment is a tool, not a policy for everyone. Here is when it helps, when it
          hurts, and how to ask without losing the sale.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Advances reduce refusals but also reduce orders. Weigh both.',
            'Ask for advances on high-value, high-risk or repeat-refusal orders.',
            'A delivery-charge-only advance is a gentle middle ground.',
            'Trust signals make people more willing to pay upfront.',
          ]}
        />
      </div>

      <Section id="tradeoff" n={1} title="The trade-off">
        <Versus
          left={{
            title: 'Full COD for everyone',
            points: [
              'More orders placed',
              'More fake and refused orders',
              'You pay delivery both ways on refusals',
            ],
          }}
          right={{
            title: 'Advance for everyone',
            points: [
              'Fewer refusals',
              'Fewer orders, especially from new customers',
              'Buyers may choose a competitor with full COD',
            ],
          }}
        />
      </Section>

      <Section id="when" n={2} title="When to ask for an advance">
        <CompareTable
          columns={['Situation', 'Ask for', 'Why']}
          rows={[
            ['High-value order', 'Partial advance', 'A refusal costs more'],
            [
              'Area with many refusals',
              'Delivery charge in advance',
              'Covers your loss if refused',
            ],
            ['Customer refused before', 'Advance or full prepayment', 'History predicts behaviour'],
            ['Custom or made-to-order item', 'Partial advance', 'You cannot resell it easily'],
            ['Loyal repeat customer', 'Nothing', 'They have earned your trust'],
          ]}
        />
        <Callout tone="tip" title="Explain it kindly">
          &quot;To confirm, we take only the delivery charge in advance. The rest you pay when the
          parcel arrives.&quot; A clear, polite reason makes most genuine buyers agree.
        </Callout>
      </Section>

      <Section id="trust" n={3} title="Make paying upfront feel safe">
        <ul>
          <li>Real reviews and photos on the page.</li>
          <li>A clear exchange or refund policy.</li>
          <li>A real business name and contact details.</li>
          <li>A small perk for paying online (faster dispatch, a gift).</li>
        </ul>
      </Section>

      <InlineCta
        title="Losing money on refused parcels?"
        body="Book a free call. We will look at your order data and suggest where advances would help most."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Will asking for an advance hurt my Meta ads?',
              a: 'It may lower conversion rate a little. If it raises delivered orders, you are better off overall. Track delivered orders.',
            },
            {
              q: 'What if a customer refuses to pay an advance?',
              a: 'For low-risk orders, accept full COD. For high-risk ones, it is fine to politely decline.',
            },
          ]}
        />
      </Section>
    </>
  );
}
