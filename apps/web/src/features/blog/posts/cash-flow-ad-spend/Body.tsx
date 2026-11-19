import {
  Callout,
  FaqList,
  Figure,
  InlineCta,
  KeyTakeaways,
  Lead,
  Prose,
  PullQuote,
  Section,
} from '../../components/article';
import { Legend, LineChart } from '../../components/viz';
import { taka } from '../../components/format';

export function Body() {
  return (
    <>
      <Lead>
        Plenty of profitable stores run out of money while growing. Ads are paid today, stock is
        paid upfront, and cash-on-delivery money arrives days or weeks later.
      </Lead>
      <Prose>
        <p>
          The faster you grow, the bigger that gap gets. Understanding it, and planning for it, is
          what lets you keep scaling a winning campaign instead of pausing it for lack of cash.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Ad spend leaves today; COD money comes back later.',
            'Fast growth needs more cash, even when it is profitable.',
            'Know your cash cycle: days from ad spend to money in the bank.',
            'Shorten it with faster courier payouts, advances and online payments.',
          ]}
        />
      </div>

      <Section id="gap" n={1} title="The cash gap, drawn">
        <Figure title="Cash out vs cash in while scaling">
          <Legend
            items={[
              { name: 'Money spent (ads + stock)', tone: 'warm' },
              { name: 'Money received', tone: 'accent' },
            ]}
          />
          <div className="mt-4">
            <LineChart
              labels={['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8']}
              series={[
                {
                  name: 'Money spent (ads + stock)',
                  values: [200, 260, 330, 400, 460, 520, 560, 600],
                  tone: 'warm',
                },
                {
                  name: 'Money received',
                  values: [150, 190, 260, 340, 430, 510, 590, 660],
                  tone: 'accent',
                },
              ]}
              format={(v) => taka(v * 1000)}
            />
          </div>
        </Figure>
        <p>
          In the early weeks, money goes out faster than it comes in, even though every sale is
          profitable. The business only catches up later.
        </p>
      </Section>

      <Section id="cycle" n={2} title="Work out your cash cycle">
        <ul>
          <li>Days between paying for stock and selling it.</li>
          <li>Days between the order and delivery.</li>
          <li>Days between delivery and the courier paying you.</li>
        </ul>
        <p>Add them up. That is how long each taka of growth is tied up before it comes back.</p>
      </Section>

      <PullQuote>Profitable is not the same as having cash. Growth needs both.</PullQuote>

      <Section id="shorten" n={3} title="How to shorten the gap">
        <ul>
          <li>Ask couriers about faster or more frequent payouts.</li>
          <li>Encourage online payment with a small perk.</li>
          <li>Take advances on high-value orders.</li>
          <li>Buy stock in smaller, more frequent batches when you can.</li>
        </ul>
        <Callout tone="tip" title="Ad credits">
          Some partners can front part of your ad spend so a winning campaign does not have to stop.
          At Muvance this is part of our operational support.
        </Callout>
      </Section>

      <InlineCta
        title="Growth held back by cash?"
        body="Book a free call. We will look at your cash cycle and options like ad credits or investment."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Should I pause ads when cash is tight?',
              a: 'Pause the least profitable campaigns first. Keep the best ones running, because restarting later costs money too.',
            },
            {
              q: 'Is borrowing to fund ads a good idea?',
              a: 'Only for campaigns with a proven, profitable track record, and only with a clear plan to repay.',
            },
          ]}
        />
      </Section>
    </>
  );
}
