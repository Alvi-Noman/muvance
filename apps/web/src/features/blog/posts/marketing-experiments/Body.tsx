import { Link } from 'react-router';
import { CompareTable, FaqList, Figure, InlineCta, Lead, Section } from '../../components/article';
import { BarList } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        If you cannot say what result would make you stop, it is not an experiment. It is a hope.
      </Lead>
      <Section id="template" n={1} title="The experiment card">
        <CompareTable
          columns={['Field', 'Question', 'Example']}
          rows={[
            [
              'Hypothesis',
              'What do we believe?',
              'Showing price in the ad will lower cost per delivered order',
            ],
            ['Change', 'What exactly changes?', 'Same video, price added to first frame'],
            ['Metric', 'How will we judge?', 'Cost per delivered order'],
            ['Duration', 'How long?', 'Two weeks or 50 orders each'],
            ['Decision', 'What will we do with each result?', 'If 10% better, roll out to all ads'],
          ]}
        />
      </Section>
      <Section id="pick" n={2} title="Picking what to test">
        <p>
          Score ideas on impact, confidence and ease. Test the big, cheap ideas first. Button
          colours can wait; new angles, offers and prices cannot.
        </p>
        <Figure title="Ideas scored (example)">
          <BarList
            items={[
              { label: 'New offer: bundle of two', value: 8.5, tone: 'accent' },
              { label: 'Founder video ad', value: 7.8, tone: 'accent' },
              { label: 'Shorter checkout', value: 7, tone: 'ink' },
              { label: 'New logo colour', value: 2.5, tone: 'muted' },
            ]}
          />
        </Figure>
      </Section>
      <Section id="log" n={3} title="Keep a log">
        <p>
          Write down every experiment and result, including failures. After a year, the log is one
          of the most valuable things your marketing team owns. See{' '}
          <Link to="/blog/is-your-ad-test-result-real">is your test result real</Link>.
        </p>
      </Section>
      <InlineCta
        title="Want a testing plan for the next quarter?"
        body="Book a free call. We will help you list and rank ideas."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'How many tests at once?',
              a: 'As many as your traffic supports without overlapping. For small brands, one or two at a time.',
            },
            {
              q: 'What if the result is unclear?',
              a: 'That is a result too: the change does not matter much. Move on.',
            },
          ]}
        />
      </Section>
    </>
  );
}
