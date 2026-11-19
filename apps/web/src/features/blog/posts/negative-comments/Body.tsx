import { Link } from 'react-router';
import {
  Callout,
  CompareTable,
  FaqList,
  InlineCta,
  Lead,
  Section,
  Steps,
} from '../../components/article';

export function Body() {
  return (
    <>
      <Lead>The comment itself rarely hurts much. The reply often does.</Lead>
      <Section id="types" n={1} title="Know what you are dealing with">
        <CompareTable
          columns={['Type', 'Example', 'What to do']}
          rows={[
            [
              'Genuine complaint',
              '“My order came damaged”',
              'Apologise publicly, solve privately, follow up',
            ],
            ['Question disguised as doubt', '“Is this even original?”', 'Answer calmly with proof'],
            ['Troll or spam', 'Insults, links, unrelated abuse', 'Hide or delete, do not engage'],
            [
              'Competitor or fake claim',
              'Coordinated false comments',
              'Hide, keep screenshots, report',
            ],
          ]}
        />
      </Section>
      <Section id="reply" n={2} title="A reply that works">
        <Steps
          steps={[
            {
              title: 'Acknowledge',
              body: '“Sorry to hear this, that’s not the experience we want.”',
            },
            { title: 'Move it private', body: '“We’ve sent you a message to sort it out.”' },
            { title: 'Fix it', body: 'Exchange, refund or explanation, quickly.' },
            {
              title: 'Close the loop publicly',
              body: '“Glad we could fix this. Thank you for your patience.”',
            },
          ]}
        />
        <Callout tone="tip">
          Reply within a few hours where possible. Speed calms people down more than perfect
          wording.
        </Callout>
      </Section>
      <Section id="never" n={3} title="What never to do">
        <ul>
          <li>Argue in public.</li>
          <li>Delete genuine complaints. People notice, and screenshots spread.</li>
          <li>Blame the courier or customer in front of everyone.</li>
          <li>Reply with a copy-paste that ignores what they said.</li>
        </ul>
        <p>
          Handled well, a public complaint can build trust. See{' '}
          <Link to="/blog/customer-service-as-marketing">customer service as marketing</Link>.
        </p>
      </Section>
      <InlineCta
        title="Need help managing comments on your ads?"
        body="Book a free call. We can include comment moderation in your plan."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Should I hide negative comments on ads?',
              a: 'Hide spam and abuse. Reply to genuine complaints; hiding them can make things worse.',
            },
            {
              q: 'What about a viral complaint?',
              a: 'Respond quickly, honestly and in one place. Do not post many defensive replies.',
            },
          ]}
        />
      </Section>
    </>
  );
}
