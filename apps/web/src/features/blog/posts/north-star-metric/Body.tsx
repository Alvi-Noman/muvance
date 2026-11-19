import { Callout, CompareTable, FaqList, InlineCta, Lead, Section } from '../../components/article';

export function Body() {
  return (
    <>
      <Lead>
        When everyone in a team is chasing a different number, the business tends to go nowhere in
        particular.
      </Lead>
      <Section id="what" n={1} title="What a north star metric is">
        <p>
          It is the one number that best captures whether customers are getting value and the
          business is healthy. Other metrics still matter, but they feed into this one.
        </p>
        <p>
          A good north star is easy to understand, moves when you do good work, and ties to money.
        </p>
      </Section>
      <Section id="examples" n={2} title="Examples by business type">
        <CompareTable
          columns={['Business', 'North star idea', 'Why']}
          rows={[
            [
              'Fashion brand',
              'Delivered orders per month from returning customers',
              'Repeat buying shows real love for the product',
            ],
            [
              'Skincare',
              'Customers on their second or later order',
              'Results show over time; repeat is the proof',
            ],
            [
              'Electronics store',
              'Delivered revenue at target margin',
              'Repeat is rarer; profitable volume is key',
            ],
            ['Food delivery brand', 'Weekly active ordering customers', 'Habit is the business'],
          ]}
        />
      </Section>
      <Section id="avoid" n={3} title="What to avoid">
        <ul>
          <li>A number that can grow while the business shrinks, like followers.</li>
          <li>Something only one team can affect.</li>
          <li>Changing it every month.</li>
        </ul>
        <Callout tone="tip">
          Pair the north star with two or three guardrails, like margin and delivery rate, so nobody
          grows it the wrong way.
        </Callout>
      </Section>
      <InlineCta
        title="Want help choosing your north star?"
        body="Book a free call. We will talk it through with your numbers."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Is revenue a good north star?',
              a: 'It is a fair start for many small brands. Delivered revenue at a healthy margin is better.',
            },
            {
              q: 'How often should we review it?',
              a: 'Weekly as a number, quarterly as a choice.',
            },
          ]}
        />
      </Section>
    </>
  );
}
