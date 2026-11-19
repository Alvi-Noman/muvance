import {
  Callout,
  CompareTable,
  FaqList,
  InlineCta,
  KeyTakeaways,
  Lead,
  Prose,
  PullQuote,
  Section,
} from '../../components/article';

export function Body() {
  return (
    <>
      <Lead>
        ৳990 or ৳1,000? Show the old price or not? One product or three options? Small pricing
        choices can change how many people buy, and how much they spend.
      </Lead>
      <Prose>
        <p>
          None of these are magic tricks. They work because they make the decision easier or the
          value clearer. Test them on your own store, because what works in one category can fail in
          another.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Prices just under a round number often feel cheaper.',
            'Round prices can feel more premium. Match your brand.',
            'Three options with a clear middle choice raise average order value.',
            'Only show a "was" price if it was genuinely the price.',
          ]}
        />
      </div>

      <Section id="tactics" n={1} title="Pricing ideas worth testing">
        <CompareTable
          columns={['Idea', 'Example', 'Works because']}
          rows={[
            ['Just-below pricing', '৳990 instead of ৳1,000', 'The first digit anchors the feeling'],
            ['Round premium pricing', '৳2,500 for a gift box', 'Feels deliberate and high-end'],
            [
              'Three options',
              'Single, pack of 2, pack of 3',
              'The middle feels like the safe choice',
            ],
            ['Per-day framing', '“Less than ৳10 a day”', 'Makes bigger prices feel small'],
            ['Delivery included', '৳1,450 with free delivery', 'No surprise at checkout'],
          ]}
        />
      </Section>

      <Section id="anchor" n={2} title="Anchors and honest discounts">
        <p>
          Showing a higher original price next to the sale price makes the deal clearer. But only if
          that original price was real. Fake &quot;was&quot; prices are easy for buyers to spot and
          can break consumer rules and platform policies.
        </p>
        <Callout tone="warning" title="Do not train buyers to wait">
          If something is on sale every week, the sale price becomes the real price in buyers’
          minds. Keep discounts for real occasions.
        </Callout>
      </Section>

      <PullQuote>Good pricing does not trick people. It makes the decision easier.</PullQuote>

      <Section id="test" n={3} title="How to test a price">
        <ul>
          <li>Change one thing at a time, for at least a week or two.</li>
          <li>Judge on profit per visitor, not conversion rate alone.</li>
          <li>Watch delivered orders, not just placed ones.</li>
        </ul>
      </Section>

      <InlineCta
        title="Not sure your prices are right?"
        body="Book a free call. We will look at your prices, offers and margins and suggest what to test."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Should I always be the cheapest?',
              a: 'Rarely. Competing only on price shrinks margins and makes ads unaffordable. Compete on trust, quality and service too.',
            },
            {
              q: 'Can I show different prices in ads and on the site?',
              a: 'No. The price in the ad must match what people find on the page, or you lose trust and risk ad rejections.',
            },
          ]}
        />
      </Section>
    </>
  );
}
