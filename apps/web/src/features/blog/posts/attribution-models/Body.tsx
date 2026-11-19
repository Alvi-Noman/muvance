import { Link } from 'react-router';
import {
  CompareTable,
  FaqList,
  Figure,
  InlineCta,
  Lead,
  Prose,
  Section,
  Steps,
} from '../../components/article';
import { BarList } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        Meta says it drove 120 sales. Google says 80. Your store had 150 in total. Somebody is
        double-counting, and it is probably everyone.
      </Lead>
      <Prose>
        <p>
          A customer sees a Reels ad, searches your name on Google two days later, then clicks a
          WhatsApp link from a friend and orders. Which channel made the sale? Attribution is the
          set of rules that decides, and each tool uses its own.
        </p>
      </Prose>
      <Section id="models" n={1} title="The common models">
        <CompareTable
          columns={['Model', 'Gives credit to', 'Tends to favour']}
          rows={[
            ['Last click', 'The final click before buying', 'Search and retargeting'],
            ['First click', 'The first touch', 'Discovery channels'],
            ['Platform reported', 'Itself, including views', 'Whichever platform you ask'],
            [
              'Data-driven (GA4)',
              'Shares credit using patterns in your data',
              'Channels with many touches',
            ],
          ]}
        />
      </Section>
      <Section id="why-differ" n={2} title="Why the numbers never match">
        <Figure
          title="Sales claimed vs actual store sales (example)"
          caption="Each platform counts sales it touched, so the same order is claimed several times."
        >
          <BarList
            items={[
              { label: 'Meta reports', value: 120, tone: 'ink' },
              { label: 'Google Ads reports', value: 80, tone: 'ink' },
              { label: 'TikTok reports', value: 35, tone: 'ink' },
              { label: 'Total claimed', value: 235, tone: 'warm' },
              { label: 'Actual store orders', value: 150, tone: 'accent' },
            ]}
          />
        </Figure>
      </Section>
      <Section id="practical" n={3} title="A practical approach">
        <Steps
          steps={[
            {
              title: 'Trust total store sales first',
              body: 'That is the only number nobody can double-count.',
            },
            {
              title: 'Watch blended MER',
              body: (
                <>
                  Total revenue ÷ total marketing spend. See{' '}
                  <Link to="/blog/mer-vs-roas">MER vs ROAS</Link>.
                </>
              ),
            },
            {
              title: 'Use platforms to compare inside themselves',
              body: 'Which ad or campaign is better, not how much the channel is worth.',
            },
            {
              title: 'Ask customers',
              body: (
                <>
                  A <Link to="/blog/post-purchase-survey-questions">post-purchase survey</Link>{' '}
                  fills gaps.
                </>
              ),
            },
            {
              title: 'Test when it matters',
              body: (
                <>
                  Pause a channel in some areas and see what happens. See{' '}
                  <Link to="/blog/are-your-ads-causing-sales-incrementality">incrementality</Link>.
                </>
              ),
            },
          ]}
        />
      </Section>
      <InlineCta
        title="Confused by numbers that don’t add up?"
        body="Book a free call. We will help you build one view of the truth."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Which attribution model is best?',
              a: 'None is right. Use one consistently for comparisons, and check it against total sales.',
            },
            {
              q: 'Should I turn off view-through attribution?',
              a: (
                <>
                  It depends on the product. Compare results with and without it. See{' '}
                  <Link to="/blog/meta-attribution-settings-explained">attribution settings</Link>.
                </>
              ),
            },
          ]}
        />
      </Section>
    </>
  );
}
