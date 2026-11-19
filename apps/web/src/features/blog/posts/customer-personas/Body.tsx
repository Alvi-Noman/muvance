import { Link } from 'react-router';
import {
  Callout,
  CompareTable,
  FaqList,
  Figure,
  InlineCta,
  Lead,
  Prose,
  Section,
} from '../../components/article';
import { BarList } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        A persona is only worth making if it changes what you write, shoot or sell. If it sits in a
        slide deck, it was a waste of an afternoon.
      </Lead>
      <Prose>
        <p>
          The usual persona looks like this: “Sadia, 27, lives in Dhaka, likes coffee and travel.”
          It feels specific, but it tells you nothing about why Sadia would buy your product, what
          stops her, or which words make her click.
        </p>
        <p>
          A useful persona is built around a buying situation, not a birthday. Here is the way we do
          it with clients, using data you already have.
        </p>
      </Prose>
      <Section id="sources" n={1} title="Start with what customers already told you">
        <p>
          Before any survey, pull together the places where customers explain themselves in their
          own words:
        </p>
        <ul>
          <li>
            <strong>Inbox and comments.</strong> The questions people ask before buying are their
            worries, written down.
          </li>
          <li>
            <strong>Reviews.</strong> Look past the stars. Read why people say they bought and what
            surprised them.
          </li>
          <li>
            <strong>Order data.</strong> Which products are bought together, which districts order
            most, which sizes or variants sell.
          </li>
          <li>
            <strong>Confirmation calls.</strong> Your call team hears the real reasons for
            cancelling every day.
          </li>
        </ul>
        <p>
          Copy the best lines into one document. Do not tidy the grammar. The rough phrasing is the
          gold, because it is how the next customer thinks too.
        </p>
      </Section>
      <Section id="group" n={2} title="Group people by the reason they buy">
        <p>
          Now sort those notes into piles by motivation. For a skincare brand, you might find three:
          people fixing a specific problem, people who want a routine, and people buying a gift.
          Same product, very different ads.
        </p>
        <Figure
          title="Share of orders by buying reason"
          caption="Tag a few weeks of orders by the reason the customer gave. The biggest pile is your first persona."
        >
          <BarList
            items={[
              {
                label: 'Fixing a problem',
                value: 46,
                note: 'Wants proof it works and how fast',
                tone: 'ink',
              },
              {
                label: 'Building a routine',
                value: 31,
                note: 'Wants guidance and a simple bundle',
                tone: 'accent',
              },
              {
                label: 'Buying a gift',
                value: 15,
                note: 'Wants nice packaging and fast delivery',
                tone: 'warm',
              },
              { label: 'Other', value: 8, tone: 'muted' },
            ]}
            format={(v) => `${v}%`}
          />
        </Figure>
        <Callout tone="tip">
          Two or three personas is plenty. If you have seven, nobody on the team will remember them,
          and none will get their own ads.
        </Callout>
      </Section>
      <Section id="template" n={3} title="A one-page persona that the team will use">
        <p>For each group, fill in these five lines. Keep it to one page.</p>
        <CompareTable
          columns={['Line', 'What to write', 'Example']}
          rows={[
            ['The moment', 'When they start looking', 'A breakout before a wedding'],
            ['The goal', 'What they want to be true', 'Clear skin in time for photos'],
            ['The worry', 'What stops them buying', 'It might not work, or might irritate'],
            ['Their words', 'Phrases from real messages', '“Will it work on oily skin?”'],
            [
              'Proof they need',
              'What would convince them',
              'Before and after, a dermatologist note',
            ],
          ]}
        />
      </Section>
      <Section id="use" n={4} title="Putting personas to work">
        <p>
          Every new ad should have a persona written at the top of the brief. That one habit keeps
          your creative varied, which also matters a lot now that Meta decides who sees what based
          on the ad itself (more in{' '}
          <Link to="/blog/broad-targeting-vs-interests">broad targeting vs interests</Link>).
        </p>
        <ul>
          <li>Write at least one hook per persona each week.</li>
          <li>Use their exact worries as the first line of FAQ answers on the product page.</li>
          <li>Check results by persona: which group’s ads bring the cheapest delivered orders?</li>
        </ul>
      </Section>
      <InlineCta
        title="Want help turning customer data into ads?"
        body="Book a free call. We will look at what your customers already say and show you the angles worth testing."
      />
      <Section id="faq" n={5} title="A few more questions">
        <FaqList
          items={[
            {
              q: 'Do I need age and gender in a persona?',
              a: 'Only if it changes the ad. Often the buying moment matters far more than the demographic.',
            },
            {
              q: 'How often should personas change?',
              a: 'Revisit them every six months, or after a big new product. Buying reasons shift slower than you think.',
            },
          ]}
        />
      </Section>
    </>
  );
}
