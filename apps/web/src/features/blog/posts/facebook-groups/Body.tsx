import { Callout, FaqList, InlineCta, Lead, Section, Steps } from '../../components/article';
import { Versus } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        Pages broadcast. Groups talk. Customers often trust each other more than they trust you.
      </Lead>
      <Section id="when" n={1} title="When a group makes sense">
        <Versus
          left={{
            title: 'Good fit',
            points: [
              'Products people use and discuss (skincare, baby, fitness, cooking)',
              'Customers who share results or tips',
              'Someone can moderate daily',
            ],
          }}
          right={{
            title: 'Poor fit',
            points: ['One-time purchases', 'Products nobody discusses', 'No time to moderate'],
          }}
        />
      </Section>
      <Section id="run" n={2} title="Running it well">
        <Steps
          steps={[
            {
              title: 'Give it a purpose bigger than your product',
              body: '“Oily skin help Bangladesh”, not “Brand X fans”.',
            },
            { title: 'Set simple rules', body: 'No spam, be kind, no selling by members.' },
            {
              title: 'Start conversations',
              body: 'Weekly questions, show-and-tell threads, expert sessions.',
            },
            { title: 'Reply to everything early on', body: 'Activity attracts activity.' },
            {
              title: 'Sell lightly',
              body: 'Members-first launches and occasional offers, not daily ads.',
            },
          ]}
        />
      </Section>
      <Section id="value" n={3} title="How it helps the business">
        <p>
          A good group is a constant source of feedback, content ideas, testimonials and repeat
          buyers. It also gives you a way to reach people that is less dependent on page reach.
        </p>
        <Callout tone="warning">
          Joining other people’s groups to post ads is usually against group rules and annoys
          members. Join to help, not to spam.
        </Callout>
      </Section>
      <InlineCta
        title="Thinking about starting a community?"
        body="Book a free call. We will help you decide if it fits."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'How big should a group be?',
              a: 'Engagement matters more than size. A few hundred active members can be very valuable.',
            },
            { q: 'Can I post content from the group in ads?', a: 'Only with members’ permission.' },
          ]}
        />
      </Section>
    </>
  );
}
