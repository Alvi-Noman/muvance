import { Link } from 'react-router';
import {
  Callout,
  FaqList,
  Figure,
  InlineCta,
  Lead,
  Section,
  Steps,
} from '../../components/article';
import { BarList } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        The reason most content calendars die is not laziness. It is that they were built for a team
        of ten.
      </Lead>
      <Section id="template" n={1} title="The template">
        <p>
          A shared sheet with these columns is enough: date, pillar, format, idea, caption draft,
          status, link once posted. Nothing more.
        </p>
        <Callout tone="tip">
          Keep a separate “ideas” tab. Whenever someone has one, it goes there. Planning day becomes
          picking, not inventing.
        </Callout>
      </Section>
      <Section id="routine" n={2} title="The monthly routine">
        <Steps
          steps={[
            {
              title: 'Plan (2 hours)',
              body: 'Fill the next month from the ideas tab, mark key dates and launches.',
            },
            {
              title: 'Shoot (1 day)',
              body: 'Batch photos and videos for the month in one or two sessions.',
            },
            { title: 'Edit and write (2 days)', body: 'Captions, edits, thumbnails.' },
            { title: 'Schedule', body: 'Use Meta Business Suite or your tool of choice.' },
            {
              title: 'Review (1 hour)',
              body: 'What worked last month? Move ideas like it to the top.',
            },
          ]}
        />
      </Section>
      <Section id="flex" n={3} title="Leave room">
        <p>
          Plan about 70 to 80% of posts. Keep the rest open for trends, customer moments and quick
          reactions. A calendar that cannot bend breaks.
        </p>
        <Figure title="Planned vs flexible posts in a month (example)">
          <BarList
            items={[
              { label: 'Planned', value: 16, tone: 'ink' },
              { label: 'Flexible (trends, reactions)', value: 5, tone: 'accent' },
            ]}
          />
        </Figure>
        <Callout tone="local">
          Mark Bangladeshi dates early: Pohela Falgun, Valentine’s, Ramadan and Eid, Pohela
          Boishakh, Durga Puja, 11.11, winter and wedding season. See{' '}
          <Link to="/blog/marketing-calendar-bangladesh">the marketing calendar</Link>.
        </Callout>
      </Section>
      <InlineCta
        title="Want a content system set up for you?"
        body="Book a free call. We will show you how we plan content for clients."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Which tool should I use?',
              a: 'A sheet, Notion or Trello all work. The habit matters more than the tool.',
            },
            {
              q: 'How far ahead should I plan?',
              a: 'One month in detail, three months in rough themes.',
            },
          ]}
        />
      </Section>
    </>
  );
}
