import { Link } from 'react-router';
import { CompareTable, FaqList, InlineCta, Lead, Section } from '../../components/article';
import { Versus } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        The right posting frequency is the highest one you can sustain without the quality dropping.
      </Lead>
      <Section id="guide" n={1} title="A starting point">
        <CompareTable
          columns={['Platform', 'Sensible start', 'Notes']}
          rows={[
            ['Instagram', '3–5 posts a week, Stories most days', 'Reels for reach'],
            ['Facebook page', '3–5 a week', 'Reels and questions do best'],
            ['TikTok', '3–7 a week', 'Volume helps more here'],
            ['YouTube', '1–2 long videos a month, Shorts weekly', 'Quality over speed'],
            ['LinkedIn', '2–3 a week from people', 'Founder posts matter most'],
          ]}
        />
      </Section>
      <Section id="signs" n={2} title="Signs to change">
        <Versus
          left={{
            title: 'Too much',
            points: [
              'Engagement per post keeps falling',
              'Team is rushing and quality drops',
              'Followers leave after posts',
            ],
          }}
          right={{
            title: 'Too little',
            points: [
              'Followers forget you exist',
              'Every post has to be perfect',
              'No room to learn what works',
            ],
          }}
        />
      </Section>
      <Section id="consistency" n={3} title="Consistency beats volume">
        <p>
          Three good posts every week for a year beats a burst of daily posts followed by a month of
          silence. Use <Link to="/blog/content-pillars-for-brands">content pillars</Link> and a{' '}
          <Link to="/blog/content-calendar-small-team">simple calendar</Link> to stay steady.
        </p>
      </Section>
      <InlineCta
        title="Want a content rhythm that fits your team?"
        body="Book a free call. We will help you set a realistic plan."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Does posting time matter?',
              a: 'A little. Check when your followers are online in your insights and test.',
            },
            {
              q: 'Should I post the same thing everywhere?',
              a: 'Adapting is better than copying, but reusing core content saves time.',
            },
          ]}
        />
      </Section>
    </>
  );
}
