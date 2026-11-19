import { Link } from 'react-router';
import { Callout, CompareTable, FaqList, InlineCta, Lead, Section } from '../../components/article';

export function Body() {
  return (
    <>
      <Lead>
        Long marketing plans get written once and never opened. A single page gets taped to the wall
        and used.
      </Lead>
      <Section id="template" n={1} title="The template">
        <CompareTable
          columns={['Box', 'Question', 'Example']}
          rows={[
            [
              'Goal',
              'What must be true in 90 days?',
              '1,200 delivered orders a month at 20% margin',
            ],
            [
              'Customer',
              'Who exactly are we selling to?',
              'Working women 25–40 in cities buying everyday modest wear',
            ],
            [
              'Offer',
              'Why buy from us, now?',
              'Breathable fabrics, easy exchange, new drop every two weeks',
            ],
            [
              'Channels',
              'Where do we reach them?',
              'Meta ads, Instagram Reels, WhatsApp for repeat',
            ],
            ['Budget', 'How much and where?', '৳4 lakh ads, ৳60k creative, ৳20k tools'],
            [
              'Numbers',
              'What do we check weekly?',
              'Delivered orders, MER, new customers, repeat rate',
            ],
            ['Tests', 'What will we try?', 'Founder videos, bundle offer, TikTok test'],
          ]}
        />
      </Section>
      <Section id="goals" n={2} title="Setting a goal you can steer by">
        <p>
          A good goal has a number, a date and a quality guardrail. “Grow sales” is a wish. “1,200
          delivered orders a month by March, with margin above 20%” is something you can check every
          Monday.
        </p>
        <Callout tone="tip">
          Work backwards to the budget with a{' '}
          <Link to="/blog/simple-sales-forecast-for-ad-budget">simple forecast</Link>.
        </Callout>
      </Section>
      <Section id="review" n={3} title="The review rhythm">
        <ul>
          <li>
            <strong>Weekly (30 minutes):</strong> numbers against plan, what to change.
          </li>
          <li>
            <strong>Monthly (1 hour):</strong> tests that worked, budget shifts.
          </li>
          <li>
            <strong>At 90 days:</strong> what we learned, next plan.
          </li>
        </ul>
      </Section>
      <InlineCta
        title="Want to build your 90-day plan together?"
        body="Book a free call. We will fill in this page with you."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            { q: 'Why 90 days?', a: 'Long enough to see results, short enough to adapt.' },
            {
              q: 'Should I plan a whole year?',
              a: 'Rough themes for the year are useful. Detail only the next quarter.',
            },
          ]}
        />
      </Section>
    </>
  );
}
