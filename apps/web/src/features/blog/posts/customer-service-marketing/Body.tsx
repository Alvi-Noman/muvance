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
        A customer whose problem was solved quickly can end up more loyal than one who never had a
        problem.
      </Lead>
      <Section id="speed" n={1} title="Speed matters most">
        <Figure
          title="Orders from message enquiries by reply time (example)"
          caption="Share of enquiries that became orders."
        >
          <BarList
            items={[
              { label: 'Under 5 minutes', value: 34, tone: 'accent' },
              { label: '5–30 minutes', value: 24, tone: 'ink' },
              { label: '1–3 hours', value: 14, tone: 'ink' },
              { label: 'Next day', value: 6, tone: 'warm' },
            ]}
            format={(v) => `${v}%`}
          />
        </Figure>
        <Callout tone="local">
          Many Bangladeshi shoppers ask before buying. Slow replies on Messenger and WhatsApp
          quietly cost a lot of sales.
        </Callout>
      </Section>
      <Section id="setup" n={2} title="A setup a small team can run">
        <Steps
          steps={[
            {
              title: 'Saved replies',
              body: 'For the top ten questions: price, delivery, size, payment.',
            },
            { title: 'Clear hours', body: 'Show when you reply, and an auto-reply outside them.' },
            {
              title: 'One inbox',
              body: 'Meta Business Suite brings Facebook and Instagram messages together.',
            },
            {
              title: 'A simple policy',
              body: 'Exchange and return rules written down, so everyone answers the same.',
            },
          ]}
        />
      </Section>
      <Section id="turn" n={3} title="Turning problems into fans">
        <p>
          When something goes wrong: apologise, fix it fast, and add a small gesture. Then ask, once
          it is solved, if they would share their experience. See{' '}
          <Link to="/blog/handle-negative-comments">handling negative comments</Link>.
        </p>
      </Section>
      <InlineCta
        title="Want help with support and call centre setup?"
        body="Book a free call. Call centre support is part of our operations services."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Should I use a chatbot?',
              a: (
                <>
                  For simple, common questions, yes. Always offer a path to a person. See{' '}
                  <Link to="/blog/messenger-chatbot-automation">Messenger chatbots</Link>.
                </>
              ),
            },
            {
              q: 'How do I measure support?',
              a: 'Reply time, resolution time and how many enquiries turn into orders.',
            },
          ]}
        />
      </Section>
    </>
  );
}
