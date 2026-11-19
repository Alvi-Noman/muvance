import {
  Callout,
  FaqList,
  InlineCta,
  KeyTakeaways,
  Lead,
  Prose,
  PullQuote,
  Section,
  Steps,
} from '../../components/article';
import { Checklist } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        A 30-minute call with an agency can tell you almost everything, if you ask the right
        questions. Here are twelve that separate the serious ones from the rest.
      </Lead>
      <Prose>
        <p>
          Take notes. What matters is not only the answers, but how specific they are. &quot;We will
          optimise your campaigns&quot; is not an answer. &quot;We will test three new hooks a week
          on your best seller&quot; is.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Ask about people, process, pay and proof.',
            'Specific answers beat confident ones.',
            'A good agency will also ask you hard questions.',
            'Write down what they promise, and check it in month one.',
          ]}
        />
      </div>

      <Section id="people" n={1} title="About the people">
        <Steps
          steps={[
            {
              title: 'Who will actually work on my account?',
              body: 'Not the person selling to you, the person doing the work. Ask to meet them.',
            },
            {
              title: 'How many accounts does that person handle?',
              body: 'Too many means your ads get a few minutes a day.',
            },
            {
              title: 'Who makes the creative?',
              body: 'In-house, freelancers, or you? Creative is most of the result on Meta today.',
            },
          ]}
        />
      </Section>

      <Section id="process" n={2} title="About the process">
        <Steps
          steps={[
            {
              title: 'What will you do in the first two weeks?',
              body: 'Look for tracking checks, a testing plan and a launch date.',
            },
            {
              title: 'How do you test new ads?',
              body: 'They should describe a routine, not a feeling.',
            },
            {
              title: 'What do you need from me?',
              body: 'Product details, access, approvals. Clear needs mean a clear process.',
            },
            {
              title: 'How will I see results?',
              body: 'Live dashboard, weekly call, monthly report? Ask to see an example.',
            },
          ]}
        />
      </Section>

      <Section id="pay" n={3} title="About money">
        <Steps
          steps={[
            {
              title: 'How exactly do you charge?',
              body: 'Retainer, % of spend, per task or performance? Ask for the total in a good and a bad month.',
            },
            {
              title: 'Is there a minimum term?',
              body: 'And what happens if you want to stop early?',
            },
            {
              title: 'What is not included?',
              body: 'Creative, tracking setup and landing pages are often extra.',
            },
          ]}
        />
        <Callout tone="tip">
          If you only remember one question, ask: &quot;What happens to your fee if my sales do not
          grow?&quot; The answer tells you who carries the risk.
        </Callout>
      </Section>

      <PullQuote>Specific answers beat confident ones.</PullQuote>

      <Section id="proof" n={4} title="About proof and honesty">
        <Steps
          steps={[
            {
              title: 'Can you walk me through a real campaign you ran?',
              body: 'What did they test, what failed, what did they change? Real experience shows in the detail.',
            },
            {
              title: 'When would you tell me NOT to run ads?',
              body: 'Every honest agency has an answer. "Never" is the wrong one.',
            },
          ]}
        />
      </Section>

      <Section id="score" n={5} title="Score the call">
        <p>After the call, tick what was true:</p>
        <Checklist
          items={[
            'They asked about my margins and delivery',
            'I know who will work on my account',
            'They described a clear testing routine',
            'I understand the full cost, good month and bad',
            'They said what they would not do',
          ]}
          verdicts={[
            'Too vague. Keep looking.',
            'Worth a second conversation.',
            'Strong candidate.',
          ]}
        />
      </Section>

      <InlineCta
        title="Ask us all twelve"
        body="Book a free call and put these questions to us. We would rather you hire the right partner than the wrong one."
      />

      <Section id="faq" n={6} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Should I share my sales numbers on the first call?',
              a: 'Share what you are comfortable with. A rough idea of monthly sales and margins helps a good agency give you useful advice.',
            },
            {
              q: 'How many agencies should I talk to?',
              a: 'Two or three is usually enough to see the difference between serious and generic answers.',
            },
          ]}
        />
      </Section>
    </>
  );
}
