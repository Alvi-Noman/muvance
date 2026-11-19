import {
  Callout,
  FaqList,
  Figure,
  InlineCta,
  KeyTakeaways,
  Lead,
  Prose,
  Section,
  Steps,
} from '../../components/article';
import { Calculator, Checklist } from '../../components/viz';
import { taka } from '../../components/format';

function check(v: Record<string, number>) {
  const price = v.price ?? 0;
  const profit = price - (v.cost ?? 0) - (v.delivery ?? 0);
  const roas = profit > 0 ? price / profit : 0;
  return [
    { label: 'Profit per order before ads', value: taka(profit) },
    { label: 'Break-even ROAS', value: roas ? `${roas.toFixed(2)}×` : 'Not viable', dark: true },
    {
      label: 'Verdict',
      value: roas && roas <= 2.5 ? 'Room for ads' : roas ? 'Tight for ads' : 'Rethink price',
    },
  ];
}

export function Body() {
  return (
    <>
      <Lead>
        There is no secret list of winning products. There is a way of judging products that makes
        winners much more likely, and losers cheaper to find out about.
      </Lead>
      <Prose>
        <p>
          A winning product for online selling usually solves a clear problem or desire, is easy to
          show in a short video, and leaves enough margin to pay for ads, delivery and returns.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Look for products that show their value in a few seconds of video.',
            'Margin matters more than trendiness.',
            'Test demand cheaply before buying lots of stock.',
            'The best products are often improvements on what already sells.',
          ]}
        />
      </div>

      <Section id="criteria" n={1} title="What winners usually have">
        <Checklist
          items={[
            'Solves a clear problem or desire',
            'Easy to demonstrate on video',
            'Hard to find in local shops',
            'Can sell at three times its landed cost or more',
            'Light and hard to break (easy to deliver)',
            'People might buy it again or buy a second one',
          ]}
          verdicts={['Weak candidate.', 'Possible. Test small.', 'Strong candidate.']}
        />
      </Section>

      <Section id="margin" n={2} title="Check the numbers first">
        <Figure title="Does this product leave room for ads?">
          <Calculator
            inputs={[
              { id: 'price', label: 'Selling price', value: 1290, prefix: '৳', step: 10 },
              { id: 'cost', label: 'Landed product cost', value: 380, prefix: '৳', step: 10 },
              { id: 'delivery', label: 'Delivery and packing', value: 120, prefix: '৳', step: 10 },
            ]}
            compute={check}
          />
        </Figure>
        <Callout tone="tip">
          The lower your break-even ROAS, the more room you have to test ads and still make money.
        </Callout>
      </Section>

      <Section id="test" n={3} title="Test demand before buying big">
        <Steps
          steps={[
            {
              title: 'Get a few samples',
              body: 'Use them for photos and videos, and to check quality yourself.',
            },
            {
              title: 'Make three to five ads',
              body: 'Different angles, so a weak ad does not kill a good product.',
            },
            {
              title: 'Run a small test',
              body: 'A short test budget, judged on clicks, add-to-carts and early orders.',
            },
            { title: 'Then order stock', body: 'Only once real buyers have shown up.' },
          ]}
        />
      </Section>

      <InlineCta
        title="Found a product you believe in?"
        body="We help brands test, launch and grow products, and we sometimes invest in the best ones. Book a free call."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Should I sell what is trending on TikTok?',
              a: 'Trends move fast and attract many sellers. Better to find a product with lasting demand, or a trend you can brand and improve.',
            },
            {
              q: 'How many products should a new store sell?',
              a: 'Few. One to three hero products, done well, usually beat a catalogue of fifty.',
            },
          ]}
        />
      </Section>
    </>
  );
}
