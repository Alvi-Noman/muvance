import {
  Callout,
  FaqList,
  Figure,
  InlineCta,
  KeyTakeaways,
  Lead,
  Prose,
  Section,
} from '../../components/article';
import { BarList, Calculator } from '../../components/viz';
import { taka } from '../../components/format';

function threshold(v: Record<string, number>) {
  const aov = v.aov ?? 0;
  const suggested = Math.round((aov * (1 + (v.lift ?? 0) / 100)) / 50) * 50;
  const extraMargin = (suggested - aov) * ((v.margin ?? 0) / 100);
  const net = extraMargin - (v.delivery ?? 0);
  return [
    { label: 'Suggested threshold', value: taka(suggested), dark: true },
    { label: 'Extra margin if they reach it', value: taka(extraMargin) },
    { label: 'After paying their delivery', value: taka(net) },
  ];
}

export function Body() {
  return (
    <>
      <Lead>
        &quot;Free delivery over ৳1,500&quot; is one of the oldest tricks in eCommerce, because it
        works. People will add an extra item to avoid paying ৳60–120 for delivery.
      </Lead>
      <Prose>
        <p>
          The trick is setting the number in the right place. Too low and you give away delivery on
          orders that would have happened anyway. Too high and nobody bothers.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Start a little above your current average order value.',
            'The extra margin from the added item must cover the delivery you pay.',
            'Show progress in the cart: "Add ৳250 more for free delivery".',
            'Suggest cheap add-ons that get people over the line.',
          ]}
        />
      </div>

      <Section id="calc" n={1} title="Find your threshold">
        <Figure title="Free delivery threshold calculator">
          <Calculator
            inputs={[
              { id: 'aov', label: 'Average order value today', value: 1200, prefix: '৳', step: 50 },
              { id: 'lift', label: 'Set threshold above it by', value: 25, suffix: '%' },
              { id: 'margin', label: 'Gross margin on products', value: 45, suffix: '%' },
              {
                id: 'delivery',
                label: 'Delivery cost you would absorb',
                value: 100,
                prefix: '৳',
                step: 10,
              },
            ]}
            compute={threshold}
          />
        </Figure>
        <Callout tone="warning">
          If the last line is negative, the threshold is too low for your margins. Raise it, or
          offer reduced delivery instead of free.
        </Callout>
      </Section>

      <Section id="where" n={2} title="Inside Dhaka vs outside">
        <p>
          Delivery outside Dhaka usually costs more. Many stores set one threshold for inside Dhaka
          and a higher one (or a flat discount) outside. Keep it simple enough to explain in one
          line on the product page.
        </p>
        <Figure title="Typical shape of a delivery offer">
          <BarList
            items={[
              { label: 'Inside Dhaka: free over', value: 1500, tone: 'accent' },
              { label: 'Outside Dhaka: free over', value: 2500, tone: 'ink' },
            ]}
            format={taka}
            hint="Set your own numbers from your margins."
          />
        </Figure>
      </Section>

      <Section id="nudges" n={3} title="Nudges that help">
        <ul>
          <li>A progress bar in the cart showing how close they are.</li>
          <li>&quot;Add one of these&quot; suggestions priced to bridge the gap.</li>
          <li>The threshold mentioned in ads and near the order button.</li>
        </ul>
      </Section>

      <InlineCta
        title="Want to raise your order value?"
        body="Book a free call. We will look at your prices and products and suggest offers worth testing."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Should I just make delivery free on everything?',
              a: 'Only if your margins can carry it on every order. Usually a threshold makes more sense.',
            },
            {
              q: 'How do I know if it worked?',
              a: 'Compare average order value and profit per order for a few weeks before and after.',
            },
          ]}
        />
      </Section>
    </>
  );
}
