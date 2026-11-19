import { Link } from 'react-router';
import { CompareTable, FaqList, InlineCta, Lead, Section, Steps } from '../../components/article';

export function Body() {
  return (
    <>
      <Lead>
        AI will not run your marketing. It can give a two-person team the output of four, if you use
        it for the right jobs.
      </Lead>
      <Section id="good" n={1} title="Where AI helps most">
        <CompareTable
          columns={['Job', 'How AI helps', 'Keep a human for']}
          rows={[
            [
              'Research',
              'Summarising reviews, comments and competitor pages',
              'Deciding what matters',
            ],
            ['Copy drafts', 'Twenty hook ideas in a minute', 'Choosing, editing, voice'],
            ['Translation', 'First drafts in Bangla or English', 'Natural phrasing, local slang'],
            ['Images', 'Backgrounds, variations, mock-ups', 'Accuracy of the actual product'],
            ['Video', 'Captions, cuts, clip ideas', 'Story and taste'],
            ['Reporting', 'Summaries of weekly numbers', 'Checking the numbers are right'],
          ]}
        />
      </Section>
      <Section id="careful" n={2} title="Where to be careful">
        <ul>
          <li>AI can state wrong facts confidently. Check every claim, price and policy.</li>
          <li>
            Images must show the real product. Misleading pictures cause returns and complaints.
          </li>
          <li>
            Generic copy sounds like everyone else. Feed it your customers’ words and your voice.
          </li>
          <li>Do not paste private customer data into tools that do not protect it.</li>
        </ul>
        <p>
          Can AI-made ads beat human ones? See{' '}
          <Link to="/blog/can-ai-ad-creatives-beat-human">AI vs human creatives</Link>.
        </p>
      </Section>
      <Section id="workflow" n={3} title="A simple workflow">
        <Steps
          steps={[
            {
              title: 'Give context',
              body: 'Product, customer, voice examples, real customer quotes.',
            },
            { title: 'Ask for many options', body: 'Quantity first.' },
            {
              title: 'Pick and edit',
              body: 'A person chooses the best and makes them sound right.',
            },
            { title: 'Test', body: 'Let real results decide.' },
          ]}
        />
      </Section>
      <InlineCta
        title="Want to use AI without losing quality?"
        body="Book a free call. We will show you how our team uses it."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Will AI replace marketers?',
              a: 'It replaces some tasks. Judgement, taste and knowing your customer still matter most.',
            },
            {
              q: 'Should I tell customers content is AI-made?',
              a: 'Be honest where it matters, especially for images of products and people.',
            },
          ]}
        />
      </Section>
    </>
  );
}
