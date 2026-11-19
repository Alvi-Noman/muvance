import { Link } from 'react-router';
import {
  Callout,
  CompareTable,
  FaqList,
  InlineCta,
  KeyTakeaways,
  Lead,
  Prose,
  PullQuote,
  Section,
} from '../../components/article';

export function Body() {
  return (
    <>
      <Lead>
        The hook is the first second or two of your ad: the line, image or moment that decides
        whether someone stops scrolling. Get it wrong and nothing else in the ad matters.
      </Lead>
      <Prose>
        <p>
          Below are hook patterns that work again and again for online stores, with examples you can
          adapt, including in Bangla. Treat them as starting points to test, not scripts to copy.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'A hook has one job: earn the next three seconds.',
            'The best hooks speak to a problem, a desire or a surprise.',
            'Test hooks separately: same ad body, different first line or shot.',
            'Measure with hook rate (3-second views ÷ impressions).',
          ]}
        />
      </div>

      <Section id="patterns" n={1} title="Hook patterns that work">
        <CompareTable
          columns={['Pattern', 'Example', 'Why it works']}
          rows={[
            [
              'Call out the person',
              '“Office e jete jete shari pora jhamela?”',
              'They feel spoken to directly',
            ],
            ['Name the problem', '“Your foundation looks grey by 3 pm?”', 'Pain is attention'],
            [
              'Show the result first',
              'A spotless shirt, then the stain remover',
              'Curiosity about how',
            ],
            ['Bold number', '“৳1,200 for something that lasts five years”', 'Specific beats vague'],
            [
              'Myth vs fact',
              '“Mustard oil is not all the same. Here’s why.”',
              'People love being corrected',
            ],
            [
              'Before you buy',
              '“Don’t buy earbuds until you check these 3 things”',
              'Feels like advice, not an ad',
            ],
            [
              'Customer voice',
              '“I ordered this as a joke. I’ve reordered 4 times.”',
              'Social proof in the first line',
            ],
            [
              'Pattern break',
              'An unexpected sound, angle or object',
              'Interrupts autopilot scrolling',
            ],
          ]}
        />
      </Section>

      <PullQuote>Earn the next three seconds. That is the whole job of a hook.</PullQuote>

      <Section id="bangla" n={2} title="Bangla, English or Banglish hooks">
        <p>
          Language is part of the hook. Many Bangladeshi audiences respond best to the way they
          actually talk, which is often a mix. Test the same hook in two or three versions; the
          winner is often not the one you expect. We cover this in more detail in{' '}
          <Link to="/blog/bangla-vs-english-ad-copy">Bangla vs English ad copy</Link>.
        </p>
      </Section>

      <Section id="test" n={3} title="How to test hooks properly">
        <ul>
          <li>Keep everything after the first two seconds identical.</li>
          <li>Change one thing: the first line, the first shot or the on-screen text.</li>
          <li>Compare hook rate first, then cost per purchase once there is enough data.</li>
          <li>Keep a simple list of winning hooks. Patterns repeat.</li>
        </ul>
        <Callout tone="warning" title="Do not overpromise">
          A hook that promises more than the product delivers brings clicks, then refunds and angry
          comments. Strong, but true.
        </Callout>
      </Section>

      <InlineCta
        title="Need fresh hooks every week?"
        body="Our creative team writes and tests new hooks constantly. Book a free call to see how we would approach your product."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'What is a good hook rate?',
              a: 'It varies by format and audience. Compare your ads against each other and keep improving your own average.',
            },
            {
              q: 'Should the hook show the product?',
              a: 'Not always. Sometimes the problem or the result hooks better, with the product appearing a second later.',
            },
          ]}
        />
      </Section>
    </>
  );
}
