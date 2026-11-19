import { Callout, FaqList, Figure, InlineCta, Lead, Section } from '../../components/article';
import { BarList, Flow } from '../../components/viz';
import { taka } from '../../components/format';

export function Body() {
  return (
    <>
      <Lead>
        People trust their friends far more than any ad. A referral programme simply makes it easy
        and rewarding to recommend you.
      </Lead>
      <Section id="design" n={1} title="The classic design">
        <Flow
          nodes={[
            { title: 'Customer shares', body: 'A code or link' },
            { title: 'Friend orders', body: 'Gets a welcome reward' },
            { title: 'Order delivered', body: 'Confirms it is real', highlight: true },
            { title: 'Customer rewarded', body: 'Credit or a gift' },
          ]}
        />
        <p>
          Rewarding both people works better than rewarding only one. Nobody likes feeling they are
          selling to friends.
        </p>
      </Section>
      <Section id="reward" n={2} title="Choosing the reward">
        <p>
          The reward should be worth it to the customer and affordable for you. Compare with what a
          new customer costs through ads.
        </p>
        <Figure title="Cost of a new customer by source (example)">
          <BarList
            items={[
              { label: 'Paid ads', value: 520, tone: 'ink' },
              { label: 'Referral (both rewards)', value: 300, tone: 'accent' },
            ]}
            format={taka}
          />
        </Figure>
      </Section>
      <Section id="abuse" n={3} title="Preventing abuse">
        <ul>
          <li>Reward only after the friend’s order is delivered, not just placed.</li>
          <li>One reward per new phone number.</li>
          <li>Watch for many referrals from one person to the same address.</li>
        </ul>
        <Callout tone="tip">
          Ask for referrals at the happiest moment: right after a good delivery or a positive
          review.
        </Callout>
      </Section>
      <InlineCta
        title="Want to grow through word of mouth?"
        body="Book a free call. We will design a referral offer that fits your margins."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Do I need software?',
              a: 'Store apps make it easier, but unique codes and a sheet can work at first.',
            },
            {
              q: 'Cash or store credit?',
              a: 'Store credit costs you less and brings the customer back.',
            },
          ]}
        />
      </Section>
    </>
  );
}
