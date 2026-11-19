import { Link } from 'react-router';
import {
  CompareTable,
  FaqList,
  InlineCta,
  Lead,
  PullQuote,
  Section,
} from '../../components/article';

export function Body() {
  return (
    <>
      <Lead>
        If your last ten posts all look different, people cannot remember you, however good each one
        is.
      </Lead>
      <Section id="minimum" n={1} title="The minimum kit">
        <CompareTable
          columns={['Element', 'Keep it to', 'Tip']}
          rows={[
            ['Logo', 'One main version, one small icon version', 'Must be readable at phone size'],
            [
              'Colours',
              'One or two main colours, one or two neutrals',
              'Use them consistently, not every colour at once',
            ],
            ['Fonts', 'One for headings, one for text', 'Include a Bangla font that matches'],
            [
              'Photo style',
              'A few rules: light, background, mood',
              'Write them down with examples',
            ],
            ['Templates', 'Posts, Stories, ads', 'Speeds up work and keeps consistency'],
          ]}
        />
      </Section>
      <Section id="consistency" n={2} title="Consistency is the whole point">
        <p>
          Recognition comes from repetition. The same colours, the same type of photos, the same
          tone, again and again. It feels boring to you long before it feels familiar to customers.
        </p>
        <PullQuote>
          You will get tired of your brand long before your customers even notice it.
        </PullQuote>
      </Section>
      <Section id="ads" n={3} title="In ads">
        <p>
          Brand your ads lightly: your logo or name early, your colours, your style. Do not let
          branding crowd out the hook. See{' '}
          <Link to="/blog/brand-awareness-vs-sales-campaigns">brand awareness vs sales</Link>.
        </p>
      </Section>
      <InlineCta
        title="Want your brand to look consistent?"
        body="Book a free call. Brand strategy and creative production are two of our service fields."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'How much should a logo cost?',
              a: 'It varies a lot. A simple, clear logo matters more than an expensive one.',
            },
            { q: 'Should I rebrand?', a: 'Only with a clear reason. Rebrands reset recognition.' },
          ]}
        />
      </Section>
    </>
  );
}
