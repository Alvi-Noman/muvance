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
  Steps,
} from '../../components/article';
import { Flow } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        Media buying, running paid ads that sell, is one of the most in-demand digital skills in
        Bangladesh. Every growing online store needs it. Here is what the job really involves and
        how to get good at it.
      </Lead>
      <Prose>
        <p>
          Good media buyers are not just people who know where the buttons are in Ads Manager. They
          understand the business behind the ads: margins, offers, creative and customers.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Learn the business side (margins, ROAS, delivered orders), not just the tools.',
            'Creative judgement is now as important as campaign settings.',
            'Practise with real money, even small amounts, as early as you can.',
            'Keep a record of every test. It becomes your portfolio.',
          ]}
        />
      </div>

      <Section id="path" n={1} title="A realistic learning path">
        <Figure title="From beginner to trusted media buyer" example={false}>
          <Flow
            nodes={[
              { title: 'Foundations', body: 'Ads Manager, Pixel, objectives' },
              { title: 'Numbers', body: 'Break-even ROAS, MER, CPA' },
              { title: 'Creative', body: 'Hooks, testing, briefs' },
              { title: 'Practice', body: 'Small real budgets' },
              { title: 'Scale', body: 'Bigger accounts, more responsibility', highlight: true },
            ]}
          />
        </Figure>
      </Section>

      <Section id="skills" n={2} title="Skills that matter most">
        <Steps
          steps={[
            {
              title: 'Tracking',
              body: 'Setting up and checking Pixel and Conversions API, and knowing when numbers lie.',
            },
            {
              title: 'Structure',
              body: 'Simple campaign setups that let Meta learn. See our Andromeda guide.',
            },
            {
              title: 'Creative testing',
              body: 'Briefing, testing and reading results on hooks and angles.',
            },
            {
              title: 'Business maths',
              body: 'Margins, break-even, contribution margin and cash flow.',
            },
            {
              title: 'Communication',
              body: 'Explaining results honestly to owners, in plain words.',
            },
          ]}
        />
        <Callout tone="local" title="Bangladesh-specific skills">
          Cash on delivery, fake orders, delivered-order tracking, Bangla copy and the Eid calendar.
          Buyers who understand these are worth a lot to local brands.
        </Callout>
      </Section>

      <PullQuote>Clients do not pay for clicks. They pay for profitable sales.</PullQuote>

      <Section id="practice" n={3} title="How to get real practice">
        <ul>
          <li>Run small campaigns for your own product or a friend’s shop.</li>
          <li>Offer to help a local brand with a clear, measured goal.</li>
          <li>Write up every test: what you tried, what happened, what you learned.</li>
          <li>Learn from people who run ads every day, not only from videos.</li>
        </ul>
      </Section>

      <InlineCta
        title="Learn from a team that runs ads daily"
        body="Our training program teaches Meta ads the way we practise them. Register your interest at muvance.com/training."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Do I need a degree to become a media buyer?',
              a: 'No. Results and a record of what you have tested matter far more than certificates.',
            },
            {
              q: 'How long does it take to get good?',
              a: 'The basics take weeks. Real judgement takes months of running campaigns and learning from them.',
            },
          ]}
        />
      </Section>
    </>
  );
}
