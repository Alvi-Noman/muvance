import { Link } from 'react-router';
import { Callout, FaqList, Figure, InlineCta, Lead, Section } from '../../components/article';
import { LineChart } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        Facebook videos fade in a day. A useful YouTube video can bring viewers for years.
      </Lead>
      <Section id="why" n={1} title="Why YouTube is different">
        <p>
          People search YouTube for answers: “how to use”, “review”, “vs”. A video that answers a
          buying question keeps getting found, and Google often shows YouTube videos in search
          results too.
        </p>
      </Section>
      <Section id="ideas" n={2} title="Video ideas that sell">
        <ul>
          <li>Honest product reviews and comparisons.</li>
          <li>How to use, set up or care for the product.</li>
          <li>“Which one should I buy?” guides.</li>
          <li>Behind the scenes of how it is made.</li>
          <li>Shorts cut from long videos for reach.</li>
        </ul>
        <Callout tone="tip">
          Put the main search phrase in the title and first line of the description, and add
          chapters to longer videos.
        </Callout>
      </Section>
      <Section id="pace" n={3} title="A realistic pace">
        <Figure
          title="Views on one how-to video over a year (example)"
          caption="Unlike a feed post, a search-driven video often grows over time."
        >
          <LineChart
            labels={['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11', 'M12']}
            series={[
              {
                name: 'Monthly views',
                values: [900, 600, 700, 820, 900, 1000, 1050, 1100, 1180, 1200, 1260, 1300],
                tone: 'accent',
              },
            ]}
          />
        </Figure>
        <p>One or two long videos a month, plus Shorts, is enough to start.</p>
      </Section>
      <InlineCta
        title="Want a video plan that lasts?"
        body="Book a free call. We will help you pick the first topics."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Do I need fancy equipment?',
              a: (
                <>
                  No. Clear audio and good light matter most. See{' '}
                  <Link to="/blog/video-marketing-small-budget">video marketing on a budget</Link>.
                </>
              ),
            },
            {
              q: 'Should I run YouTube ads?',
              a: 'They can work for awareness and remarketing. Start with organic to learn what people watch.',
            },
          ]}
        />
      </Section>
    </>
  );
}
