import {
  Callout,
  CompareTable,
  FaqList,
  Figure,
  InlineCta,
  KeyTakeaways,
  Lead,
  Prose,
  PullQuote,
  Section,
} from '../../components/article';
import { BarList } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        Change one setting and your &quot;sales&quot; in Ads Manager can jump or drop overnight,
        without a single extra order arriving. That setting is attribution.
      </Lead>
      <Prose>
        <p>
          Attribution decides which sales Meta gives your ads credit for. It answers a simple
          question: if someone saw or clicked an ad and later bought, how long ago can that ad
          interaction be and still count? Pick a generous window and you’ll see more sales. Pick a
          strict one and you’ll see fewer. Neither changes what actually happened in your store.
        </p>
        <p>
          The confusing part is that this setting does two jobs at once: it changes your{' '}
          <strong>reporting</strong>, and on most campaigns it also shapes what Meta{' '}
          <strong>optimises for</strong>.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'The default (7-day click and 1-day view) is the most generous common setting.',
            'Shorter or click-only windows report fewer sales, but they’re closer to what your store sees.',
            'The setting can affect optimisation too, not just reporting. Change it carefully.',
            "Use 'Compare attribution settings' to see the difference without changing anything.",
          ]}
        />
      </div>

      <Section id="options" n={1} title="The settings you’ll see">
        <CompareTable
          columns={['Setting', 'What counts', 'Good for']}
          rows={[
            [
              '7-day click, 1-day view',
              'Purchases within 7 days of a click, or 1 day of seeing the ad',
              'Meta’s default; most complete picture of influence',
            ],
            [
              '7-day click',
              'Purchases within 7 days of a click only',
              'Fairer comparison with store and analytics data',
            ],
            [
              '1-day click',
              'Purchases within 24 hours of a click',
              'Impulse products; strictest view',
            ],
            [
              'Engaged-view (video)',
              'Purchases after watching a video ad for a while, without clicking',
              'Video-heavy accounts; often included in the default',
            ],
            [
              'Incremental attribution',
              'Sales Meta estimates would not have happened without the ad',
              'Newer option; worth testing if it’s available to you',
            ],
          ]}
        />
        <Callout tone="tip">
          Meta adds and renames these options fairly often, so your list may look a bit different.
          The logic underneath stays the same.
        </Callout>
      </Section>

      <Section id="effect" n={2} title="Same week, three different answers">
        <p>
          Here’s what one week of the same campaign might look like under each setting. The orders
          in the store don’t change. Only the credit does.
        </p>
        <Figure title="Purchases reported for the same week">
          <BarList
            items={[
              {
                label: '7d click + 1d view',
                value: 142,
                tone: 'ink',
                note: 'Includes people who only saw the ad and bought within a day.',
              },
              {
                label: '7-day click',
                value: 121,
                tone: 'ink',
                note: 'Drops view-only buyers. Usually the closest to your store and UTM data.',
              },
              {
                label: '1-day click',
                value: 94,
                tone: 'warm',
                note: 'Only quick buyers. Undercounts considered purchases like furniture or gadgets.',
              },
              {
                label: 'Store orders (all sources)',
                value: 97,
                tone: 'muted',
                note: 'Everything that came in, from ads, search, WhatsApp and repeat customers.',
              },
            ]}
          />
        </Figure>
      </Section>

      <PullQuote>
        Attribution doesn’t change how many sales you made. It changes how many your ads get credit
        for.
      </PullQuote>

      <Section id="choose" n={3} title="Which one should you use?">
        <p>Our general take:</p>
        <ul>
          <li>
            <strong>For running campaigns:</strong> keep the default unless you have a reason to
            change it. It gives delivery the most signal to learn from.
          </li>
          <li>
            <strong>For judging results:</strong> look at 7-day click alongside the default, using
            the comparison columns. If an ad only looks good because of view-through sales, be a bit
            sceptical.
          </li>
          <li>
            <strong>For impulse, low-price products:</strong> 1-day click can be a useful sense
            check, because most real buyers decide fast.
          </li>
          <li>
            <strong>For expensive products:</strong> people take days to decide, so short windows
            will make good ads look bad.
          </li>
        </ul>
        <Callout tone="warning">
          Changing the attribution setting on a live campaign can affect delivery. If you want to
          try a different setting, test it on a new campaign rather than flipping your main one.
        </Callout>
      </Section>

      <Section id="truth" n={4} title="So which number is true?">
        <p>
          None of them, completely. Ads Manager will always be Meta’s view of its own impact. That’s
          why we pair it with business-level numbers: total revenue, total spend, and the ratio
          between them (MER). We’ve got a separate post on that, and on why Ads Manager and your
          store never quite agree.
        </p>
      </Section>

      <InlineCta
        title="Confused by what your numbers really mean?"
        body="On a free call we’ll walk through your attribution settings and show you which numbers to trust for which decisions."
      />

      <Section id="faq" n={5} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Why did my results drop when I changed the setting?',
              a: 'Because you’re counting fewer sales as ad-driven, not because fewer sales happened. Compare store orders before and after to be sure.',
            },
            {
              q: 'Is view-through attribution a scam?',
              a: 'No. Seeing an ad does influence some people. But it’s the part that’s hardest to prove, so give it less weight when deciding budgets.',
            },
            {
              q: 'Does Google Analytics use the same windows?',
              a: 'No. Analytics usually credits the last click before purchase, which tends to undercount social ads. Expect them to disagree.',
            },
          ]}
        />
      </Section>
    </>
  );
}
