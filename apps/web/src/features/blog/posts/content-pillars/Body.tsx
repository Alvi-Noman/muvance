import { Link } from 'react-router';
import {
  Callout,
  CompareTable,
  FaqList,
  Figure,
  InlineCta,
  Lead,
  Section,
} from '../../components/article';
import { BarList } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        “What should we post today?” is the most common question in small marketing teams. Pillars
        mean you answer it once.
      </Lead>
      <Section id="what" n={1} title="What a pillar is">
        <p>
          A content pillar is a recurring theme that matters to your customers and fits your brand.
          Every post belongs to one. Four pillars, rotated through the week, gives variety without
          chaos.
        </p>
        <Figure title="Example pillars for a home décor brand" example={false}>
          <BarList
            items={[
              { label: 'Room makeovers (inspiration)', value: 30, tone: 'ink' },
              { label: 'How-to and styling tips (help)', value: 30, tone: 'accent' },
              { label: 'Behind the scenes (trust)', value: 20, tone: 'ink' },
              { label: 'Products and offers (sell)', value: 20, tone: 'warm' },
            ]}
            format={(v) => `${v}%`}
          />
        </Figure>
      </Section>
      <Section id="choose" n={2} title="Choosing yours">
        <ol>
          <li>List the questions customers ask before and after buying.</li>
          <li>List what makes your brand different: materials, process, people, values.</li>
          <li>Find three to five themes that cover both.</li>
          <li>Check each one can produce at least ten post ideas. If not, it is too narrow.</li>
        </ol>
        <Callout tone="tip">
          Keep one pillar that is purely helpful, with no product pitch. It earns attention you can
          spend later.
        </Callout>
      </Section>
      <Section id="rhythm" n={3} title="Turning pillars into a rhythm">
        <CompareTable
          columns={['Day', 'Pillar', 'Format']}
          rows={[
            ['Saturday', 'Inspiration', 'Reel'],
            ['Monday', 'Help', 'Carousel'],
            ['Wednesday', 'Behind the scenes', 'Stories'],
            ['Thursday', 'Products', 'Reel or photo'],
          ]}
        />
        <p>
          Pair this with a simple{' '}
          <Link to="/blog/content-calendar-small-team">content calendar</Link> and posting becomes
          routine, not panic.
        </p>
      </Section>
      <InlineCta
        title="Want help setting your content pillars?"
        body="Book a free call. We will look at your brand and suggest a set that fits."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Should ads follow the same pillars?',
              a: 'They can. Some of the best ads start as organic posts that did well.',
            },
            {
              q: 'How often should pillars change?',
              a: 'Rarely. Refresh the ideas inside them, not the pillars themselves.',
            },
          ]}
        />
      </Section>
    </>
  );
}
