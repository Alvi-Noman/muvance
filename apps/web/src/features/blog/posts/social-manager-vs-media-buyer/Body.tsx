import { Link } from 'react-router';
import { Callout, FaqList, InlineCta, Lead, Section } from '../../components/article';
import { Versus } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        Many brands hire a “social media person” and expect them to run profitable ads. That is
        usually two different jobs.
      </Lead>
      <Section id="roles" n={1} title="What each does">
        <Versus
          left={{
            title: 'Social media manager',
            points: [
              'Plans and posts content',
              'Replies to comments and messages',
              'Builds the community',
              'Measured on engagement and reach',
            ],
          }}
          right={{
            title: 'Media buyer',
            points: [
              'Runs paid campaigns',
              'Tests creative and budgets',
              'Reads data and tracking',
              'Measured on sales and cost per order',
            ],
          }}
        />
      </Section>
      <Section id="first" n={2} title="Which to hire first">
        <p>
          If sales come mostly from ads, a strong media buyer (or agency) matters more. If you sell
          mainly through organic content, live selling or community, a social media manager might
          come first.
        </p>
        <Callout tone="tip">
          Whoever you hire, give them clear numbers to own. Vague goals produce vague results.
        </Callout>
      </Section>
      <Section id="together" n={3} title="Making them work together">
        <p>
          The best setups share learnings both ways: organic posts that do well become ad tests, and
          ad insights shape content. See{' '}
          <Link to="/blog/hire-your-first-marketer">hiring your first marketer</Link>.
        </p>
      </Section>
      <InlineCta
        title="Not sure who you need?"
        body="Book a free call. We will help you decide between hiring, freelancing or an agency."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Can one person do both?',
              a: 'At a small scale, yes. As spend grows, the roles usually split.',
            },
            {
              q: 'Where does design fit?',
              a: 'Both roles need good creative. A designer or creative team often supports both.',
            },
          ]}
        />
      </Section>
    </>
  );
}
