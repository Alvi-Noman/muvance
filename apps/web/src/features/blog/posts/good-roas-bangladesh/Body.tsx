import {
  Callout,
  CompareTable,
  FaqList,
  Figure,
  InlineCta,
  KeyTakeaways,
  Lead,
  Prose,
  PullQuote,
  Section,
} from '../../components/article';
import { Calculator } from '../../components/viz';
import { taka } from '../../components/format';

function breakEven(v: Record<string, number>) {
  const price = v.price ?? 0;
  const delivered = Math.max(0.01, 1 - (v.failed ?? 0) / 100);
  // Profit per delivered order before ads, spread across all orders placed.
  const costs = (v.cost ?? 0) + (v.delivery ?? 0);
  const failedCost = ((1 - delivered) / delivered) * (v.returnCost ?? 0);
  const profit = price - costs - failedCost;
  const be = profit > 0 ? price / profit : 0;
  return [
    { label: 'Profit per delivered order (before ads)', value: taka(profit) },
    { label: 'Break-even ROAS', value: be ? `${be.toFixed(2)}×` : 'Not profitable', dark: true },
    { label: 'Healthy target (≈ +30%)', value: be ? `${(be * 1.3).toFixed(2)}×` : '–' },
  ];
}

export function Body() {
  return (
    <>
      <Lead>
        &quot;What’s a good ROAS for fashion?&quot; We get asked this a lot. Our honest answer
        annoys people at first: it doesn’t matter what’s good for fashion. It matters what’s good
        for <em>your</em> margins.
      </Lead>
      <Prose>
        <p>
          A 3× ROAS can make one store rich and slowly bankrupt another. It all depends on what’s
          left after you pay for the product, the packaging, the courier, and the parcels that come
          back. Industry averages hide all of that, so we’re not going to give you one. We’ll show
          you how to work out your own number instead, which is far more useful.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'A "good" ROAS is one comfortably above your break-even ROAS.',
            'Break-even ROAS = price ÷ profit per order before ads.',
            'For COD businesses, failed deliveries push your break-even up. Include them.',
            'Category averages hide huge differences in margin, so use your own numbers.',
          ]}
        />
      </div>

      <Section id="calc" n={1} title="Find your break-even ROAS">
        <p>
          Put in one typical order. Be honest about costs, especially returns. This is the number
          your ads have to beat.
        </p>
        <Figure title="Break-even ROAS calculator" example={false}>
          <Calculator
            inputs={[
              { id: 'price', label: 'Order value', value: 1800, prefix: '৳', step: 100 },
              { id: 'cost', label: 'Product + packaging cost', value: 750, prefix: '৳', step: 50 },
              { id: 'delivery', label: 'Delivery cost you pay', value: 80, prefix: '৳', step: 10 },
              { id: 'failed', label: 'Orders that fail delivery', value: 15, suffix: '%' },
              {
                id: 'returnCost',
                label: 'Cost of each failed order',
                value: 150,
                prefix: '৳',
                step: 10,
              },
            ]}
            compute={breakEven}
          />
        </Figure>
        <p>
          With the example numbers, you need roughly a 2× ROAS just to break even. Anything above
          that is profit; anything below means each sale from ads costs you money (unless customers
          come back and buy again).
        </p>
      </Section>

      <Section id="categories" n={2} title="Why category averages mislead">
        <p>
          Two shops in the same category can have completely different economics. These are the
          things that move the number most:
        </p>
        <CompareTable
          columns={['Category', 'What usually helps', 'What usually hurts']}
          rows={[
            ['Fashion', 'Good markup, repeat buyers', 'Size-related returns and refused parcels'],
            ['Cosmetics & skincare', 'High markup, reorders', 'Trust issues; fakes in the market'],
            ['Gadgets & electronics', 'High order value', 'Thin margins, price comparison'],
            ['Home & lifestyle', 'Bundles, gifting', 'Bulky, expensive delivery'],
            ['Food & groceries', 'Frequent repeat orders', 'Low order value, perishables'],
          ]}
        />
        <Callout tone="tip">
          If customers reorder, you can afford a lower ROAS on the first purchase. Work out what a
          customer is worth over six months, not just one order.
        </Callout>
      </Section>

      <PullQuote>
        Don’t ask what ROAS other brands get. Ask what ROAS keeps <em>your</em> lights on.
      </PullQuote>

      <Section id="raise" n={3} title="Ways to lower your break-even">
        <ul>
          <li>
            <strong>Raise order value.</strong> Bundles and &quot;buy 2&quot; offers spread delivery
            and ad cost over more product.
          </li>
          <li>
            <strong>Cut failed deliveries.</strong> Confirmation calls and small advances for risky
            orders directly lower your break-even.
          </li>
          <li>
            <strong>Negotiate courier rates.</strong> Once you have volume, a few taka per parcel
            adds up.
          </li>
          <li>
            <strong>Bring customers back.</strong> SMS, WhatsApp and retargeting are cheaper than
            finding new buyers.
          </li>
        </ul>
      </Section>

      <InlineCta
        title="Want to know your real numbers?"
        body="On a free call we’ll work out your break-even ROAS together and set targets you can actually plan around."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Should I use ROAS from Ads Manager to check this?',
              a: 'Use it as a guide, but check against real revenue too (MER). Ads Manager can count sales that never got delivered.',
            },
            {
              q: 'My ROAS is below break-even. Should I stop ads?',
              a: 'Not straight away. First check whether customers reorder, and whether tracking is counting correctly. Then look at price, bundles and creative.',
            },
            {
              q: 'Does a higher ROAS always mean better?',
              a: 'No. A very high ROAS on a tiny budget can mean you’re under-spending and missing sales. Growth usually means accepting a ROAS closer to your target.',
            },
          ]}
        />
      </Section>
    </>
  );
}
