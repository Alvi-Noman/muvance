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
import { BarList, Flow } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        Many ads fail not because they are bad, but because they talk to the wrong stage. They pitch
        a price to someone who does not yet know they have a problem.
      </Lead>
      <Prose>
        <p>
          The idea comes from the copywriter Eugene Schwartz, and it is still one of the most
          practical tools for writing ads. People sit somewhere on a ladder, from completely unaware
          to ready to buy. Your message should meet them where they are.
        </p>
      </Prose>
      <Section id="ladder" n={1} title="The ladder">
        <Flow
          nodes={[
            { title: 'Unaware', body: 'Doesn’t know there is a problem' },
            { title: 'Problem aware', body: 'Feels the pain, no solution yet' },
            { title: 'Solution aware', body: 'Knows solutions exist' },
            { title: 'Product aware', body: 'Knows you, not convinced' },
            { title: 'Most aware', body: 'Just needs a reason to buy now', highlight: true },
          ]}
        />
      </Section>
      <Section id="messages" n={2} title="What to say at each stage">
        <CompareTable
          columns={['Stage', 'Lead with', 'Example (a back-pain chair cushion)']}
          rows={[
            [
              'Unaware',
              'A story or a surprising fact',
              '“Why your back hurts more on Friday than Monday”',
            ],
            [
              'Problem aware',
              'The pain, in their words',
              '“Sitting 9 hours and your lower back is done by 4 pm?”',
            ],
            [
              'Solution aware',
              'Why your way is better',
              '“Memory foam that keeps its shape, unlike cheap cushions”',
            ],
            [
              'Product aware',
              'Proof and answers to doubts',
              'Reviews, 7-day return, delivery time',
            ],
            ['Most aware', 'The offer', '“Free delivery this week only”'],
          ]}
        />
        <Callout tone="tip">
          Most small brands only make “most aware” ads: price, discount, order now. Those work on
          warm audiences and stop working as you try to reach new people.
        </Callout>
      </Section>
      <Section id="mix" n={3} title="A healthy mix">
        <p>
          You do not need separate campaigns for each stage. With broad targeting, Meta will find
          the people each ad suits. What you need is ads for several stages running side by side.
        </p>
        <Figure title="An example mix of live ads">
          <BarList
            items={[
              { label: 'Problem aware', value: 35, tone: 'ink' },
              { label: 'Solution aware', value: 25, tone: 'ink' },
              { label: 'Product aware', value: 25, tone: 'accent' },
              { label: 'Most aware', value: 15, tone: 'warm' },
            ]}
            format={(v) => `${v}%`}
          />
        </Figure>
        <p>
          If the cheapest results all come from “most aware” ads, that often means you are mostly
          reaching people who already knew you. Fine for now, but growth needs the earlier stages
          too.
        </p>
      </Section>
      <InlineCta
        title="Not sure which stage your ads talk to?"
        body="Book a free call and we will sort your current ads onto the ladder with you."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Is this the same as a funnel?',
              a: 'Close. A funnel describes steps in time; awareness describes what the person knows. They line up, but awareness is more useful for writing.',
            },
            {
              q: 'Which stage should a new brand start with?',
              a: 'Usually problem aware. It reaches people who feel the pain, without needing them to know your name.',
            },
          ]}
        />
      </Section>
    </>
  );
}
