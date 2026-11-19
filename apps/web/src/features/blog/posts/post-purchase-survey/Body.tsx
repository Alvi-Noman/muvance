import { Link } from 'react-router';
import {
  Callout,
  FaqList,
  Figure,
  InlineCta,
  Lead,
  Prose,
  Section,
} from '../../components/article';
import { BarList } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        “How did you hear about us?” is one of the most valuable questions in marketing. Most stores
        never ask it.
      </Lead>
      <Prose>
        <p>
          Tracking tools show you clicks. They miss the friend who recommended you, the TikTok
          someone watched last week and the billboard on the way to work. Asking customers fills in
          that picture.
        </p>
      </Prose>
      <Section id="questions" n={1} title="The three questions">
        <ol>
          <li>
            <strong>How did you first hear about us?</strong> Multiple choice, with an “other” box.
          </li>
          <li>
            <strong>What made you decide to buy today?</strong> Short free text.
          </li>
          <li>
            <strong>Was anything confusing or almost stopped you?</strong> Short free text.
          </li>
        </ol>
        <Callout tone="tip">
          Keep it optional and short. Three questions, one screen. A longer survey gets fewer and
          less honest answers.
        </Callout>
      </Section>
      <Section id="where" n={2} title="Where to ask">
        <p>
          On the thank-you page after an order is easiest. You can also ask during the confirmation
          call, or in a WhatsApp message after delivery. Calls tend to get more answers, but take
          staff time.
        </p>
      </Section>
      <Section id="read" n={3} title="Reading the results">
        <Figure
          title="“How did you first hear about us?” (example answers)"
          caption="Compare this with what your ad platform claims. Big gaps are worth investigating."
        >
          <BarList
            items={[
              { label: 'Facebook or Instagram', value: 52, tone: 'ink' },
              {
                label: 'Friend or family',
                value: 18,
                note: 'Invisible to tracking',
                tone: 'accent',
              },
              { label: 'TikTok', value: 11, tone: 'ink' },
              { label: 'Google search', value: 9, tone: 'ink' },
              { label: 'YouTube', value: 4, tone: 'muted' },
              { label: 'Other', value: 6, tone: 'muted' },
            ]}
            format={(v) => `${v}%`}
          />
        </Figure>
        <p>
          A big “friend or family” share tells you word of mouth is working, and that a{' '}
          <Link to="/blog/referral-programme-ecommerce">referral programme</Link> could add fuel. A
          channel you spend on that almost nobody names is worth a closer look.
        </p>
      </Section>
      <InlineCta
        title="Want to know where your sales really come from?"
        body="Book a free call. We will help you set up simple attribution you can trust."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Are people’s answers accurate?',
              a: 'Not perfectly. People forget. But the patterns over hundreds of answers are very useful, especially next to your tracking data.',
            },
            {
              q: 'Should I offer a reward for answering?',
              a: 'It is not needed for a three-question survey. Keep it quick instead.',
            },
          ]}
        />
      </Section>
    </>
  );
}
