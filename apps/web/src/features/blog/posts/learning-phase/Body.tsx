import {
  Callout,
  FaqList,
  Figure,
  InlineCta,
  KeyTakeaways,
  Lead,
  Prose,
  PullQuote,
  Section,
} from '../../components/article';
import { LineChart } from '../../components/viz';
import { taka } from '../../components/format';

export function Body() {
  return (
    <>
      <Lead>
        New campaign, day two: cost per purchase is double what you hoped. Day five: it has settled.
        That swing is the learning phase, and most expensive mistakes happen inside it.
      </Lead>
      <Prose>
        <p>
          When an ad set is new or has been changed a lot, Meta is still working out who to show it
          to. Results are unstable until it has seen enough conversions, roughly fifty in a week by
          Meta’s own guidance.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Every new ad set, and every big edit, starts a learning phase.',
            'Results swing during it. Do not judge too early.',
            'Fewer, bigger ad sets leave learning faster than many small ones.',
            '"Learning limited" means not enough conversions, not a broken campaign.',
          ]}
        />
      </div>

      <Section id="shape" n={1} title="What learning usually looks like">
        <Figure title="Cost per purchase over the first two weeks">
          <LineChart
            labels={[
              'D1',
              'D2',
              'D3',
              'D4',
              'D5',
              'D6',
              'D7',
              'D8',
              'D9',
              'D10',
              'D11',
              'D12',
              'D13',
              'D14',
            ]}
            series={[
              {
                name: 'Cost per purchase',
                values: [980, 1150, 760, 690, 610, 640, 560, 540, 575, 520, 530, 505, 515, 500],
                tone: 'ink',
              },
            ]}
            format={taka}
            markers={[{ at: 6, label: 'Learning ends' }]}
          />
        </Figure>
      </Section>

      <Section id="reset" n={2} title="What restarts learning">
        <ul>
          <li>Big budget jumps (as a rough guide, more than 20–30% at once).</li>
          <li>Changing the audience, optimisation event or bid strategy.</li>
          <li>Adding new ads to an ad set, or pausing for a week or more.</li>
        </ul>
        <Callout tone="tip" title="Batch your changes">
          Make edits once, together, then leave it. Five small edits on five days restart learning
          five times.
        </Callout>
      </Section>

      <PullQuote>Patience in week one is cheaper than panic in week one.</PullQuote>

      <Section id="limited" n={3} title='What to do about "Learning limited"'>
        <p>
          It means the ad set is not getting enough conversions to learn properly. Common fixes:
        </p>
        <ul>
          <li>Combine small ad sets into one, so the conversions add up.</li>
          <li>Raise the budget to a level that can buy a few conversions a day.</li>
          <li>Optimise for an earlier event (like Add to Cart) while volume is low.</li>
          <li>Widen the audience. Broad usually learns faster.</li>
        </ul>
      </Section>

      <InlineCta
        title="Results swinging all over the place?"
        body="Book a free call. We will look at your structure and show you how to give Meta a fair chance to learn."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Should I turn off a campaign that is bad on day two?',
              a: 'Usually not, unless it is far worse than anything you could accept. Give it three to four days unless it is clearly broken.',
            },
            {
              q: 'Do small daily budgets ever leave learning?',
              a: 'Sometimes not, and that is okay. Judge them on results over a week or two, not on the label.',
            },
          ]}
        />
      </Section>
    </>
  );
}
