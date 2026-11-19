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
  Steps,
} from '../../components/article';
import { BarList } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        Some of the sales your ads take credit for would have happened anyway: loyal customers,
        people who searched for you, friends of friends. Incrementality asks the honest question:
        how many sales did the ads actually cause?
      </Lead>
      <Prose>
        <p>
          You do not need a data science team to get a useful answer. A simple, careful test tells
          you a lot, especially about retargeting, which often looks better than it is.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Attributed sales and caused sales are not the same.',
            'Retargeting and brand-name audiences are the usual over-claimers.',
            'A simple on/off or holdout test gives a rough but honest answer.',
            'Meta also offers conversion lift studies for larger advertisers.',
          ]}
        />
      </div>

      <Section id="gap" n={1} title="The gap between credit and cause">
        <Figure title="Sales credited vs sales caused, by campaign">
          <BarList
            items={[
              { label: 'Prospecting: credited', value: 300, tone: 'ink' },
              {
                label: 'Prospecting: caused',
                value: 240,
                tone: 'accent',
                note: 'Most of it is real',
              },
              { label: 'Retargeting: credited', value: 180, tone: 'ink' },
              {
                label: 'Retargeting: caused',
                value: 60,
                tone: 'warm',
                note: 'Many would have bought anyway',
              },
            ]}
            format={(v) => `${v} sales`}
          />
        </Figure>
      </Section>

      <Section id="test" n={2} title="A simple test you can run">
        <Steps
          steps={[
            {
              title: 'Pick one thing to test',
              body: 'For example, your retargeting campaign. Keep everything else steady.',
            },
            {
              title: 'Write down a baseline',
              body: 'Total store sales per day for the last two to four weeks, not Meta’s numbers.',
            },
            {
              title: 'Turn it off for one to two weeks',
              body: 'Avoid big sale days, Eid or other events that would skew it.',
            },
            {
              title: 'Compare total sales',
              body: 'If total sales barely move, that campaign was mostly taking credit.',
            },
          ]}
        />
        <Callout tone="warning" title="Keep it rough, keep it honest">
          This is not a lab experiment. Weather, news and payday all move sales. Look for big
          differences, not small ones, and repeat if unsure.
        </Callout>
      </Section>

      <PullQuote>
        Do not ask what your ads got credit for. Ask what would vanish without them.
      </PullQuote>

      <Section id="lift" n={3} title="Meta’s own lift studies">
        <p>
          Meta can split audiences into people who see your ads and a holdout group who do not, then
          compare purchases. These studies need enough volume to be meaningful, so they suit larger
          spenders. Ask your Meta representative or agency whether you qualify.
        </p>
      </Section>

      <InlineCta
        title="Want to know which ads really sell?"
        body="Book a free call. We will look at your campaigns and plan a simple test to find out."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Should I stop retargeting altogether?',
              a: 'Not without testing. Some retargeting is genuinely incremental. Test it, then size it to what it really adds.',
            },
            {
              q: 'Is MER a good way to check incrementality?',
              a: 'It is a good everyday check. If spend goes up and total sales do not, your extra spend is not incremental.',
            },
          ]}
        />
      </Section>
    </>
  );
}
