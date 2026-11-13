import {
  Callout,
  Code,
  CompareTable,
  FaqList,
  Figure,
  InlineCta,
  KeyTakeaways,
  Lead,
  Prose,
  Section,
  Steps,
} from '../../components/article';
import { Calculator, LineChart } from '../../components/viz';
import { pct } from '../../components/format';

function videoRates(v: Record<string, number>) {
  const imp = v.impressions ?? 0;
  const plays = v.plays ?? 0;
  const thru = v.thruplays ?? 0;
  return [
    { label: 'Hook rate', value: imp ? pct((plays / imp) * 100) : '–', dark: true },
    { label: 'Hold rate', value: plays ? pct((thru / plays) * 100) : '–' },
  ];
}

export function Body() {
  return (
    <>
      <Lead>
        Most video ads lose the viewer before the product even appears. Two simple numbers tell you
        exactly where, and what to fix.
      </Lead>
      <Prose>
        <p>
          Ads Manager will happily tell you cost per purchase, but that number blends everything
          together: the video, the offer, the price and the website. When an ad underperforms, you
          need to know <strong>which part</strong> failed. For video, start with hook rate and hold
          rate.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Hook rate = 3-second video plays ÷ impressions. It measures your first 3 seconds.',
            'Hold rate = ThruPlays ÷ 3-second plays. It measures whether the rest of the video keeps people.',
            'As a rough guide, a hook rate above 25–30% is strong for most products.',
            'Fix the weakest stage first: hook, then hold, then the offer and the landing page.',
          ]}
        />
      </div>

      <Section id="definitions" n={1} title="What hook rate and hold rate measure">
        <p>
          <strong>Hook rate</strong> is the share of people who saw your ad and watched at least
          three seconds. It tells you if the opening stops the scroll.
        </p>
        <p>
          <strong>Hold rate</strong> is the share of those people who kept watching to a ThruPlay
          (15 seconds, or the whole video if it’s shorter). It tells you if the story keeps them.
        </p>
        <Figure title="Try it with your own numbers" example={false}>
          <Calculator
            inputs={[
              { id: 'impressions', label: 'Impressions', value: 20000, step: 1000 },
              { id: 'plays', label: '3-second video plays', value: 5600, step: 100 },
              { id: 'thruplays', label: 'ThruPlays', value: 1400, step: 100 },
            ]}
            compute={videoRates}
          />
        </Figure>
      </Section>

      <Section id="setup" n={2} title="Add them to Ads Manager in two minutes">
        <p>
          Neither metric is a default column, but you can create both as{' '}
          <strong>custom metrics</strong> and save them in a column preset.
        </p>
        <Steps
          steps={[
            { title: 'Open Columns → Customise columns', body: 'In Ads Manager, at the ad level.' },
            {
              title: 'Click "Create custom metric"',
              body: 'Name it "Hook rate" and set the format to percentage.',
            },
            {
              title: 'Enter the formula',
              body: 'Video plays at 3 seconds ÷ Impressions. Repeat for "Hold rate" with ThruPlays ÷ 3-second video plays.',
            },
            {
              title: 'Save as a preset',
              body: 'Call it "Creative" so the whole team checks the same numbers.',
            },
          ]}
        />
        <Code title="Custom metric formulas">{`Hook rate = Video plays at 3 seconds / Impressions
Hold rate = ThruPlays / Video plays at 3 seconds`}</Code>
      </Section>

      <Section id="curve" n={3} title="Read the retention curve, not just the totals">
        <p>
          In Ads Manager’s video breakdowns you can see how many people are still watching at each
          point. Comparing two videos side by side shows exactly where one loses people.
        </p>
        <Figure
          title="Share of viewers still watching, by second"
          caption="Video B’s opening is stronger (more people make it past 3 seconds), but both lose viewers around second 8, where the product demo starts. That’s the part to re-edit."
        >
          <LineChart
            labels={['0s', '1s', '2s', '3s', '5s', '8s', '10s', '12s', '15s']}
            series={[
              { name: 'Video A', values: [100, 62, 38, 22, 18, 11, 9, 8, 7], tone: 'warm' },
              { name: 'Video B', values: [100, 74, 52, 34, 29, 17, 14, 12, 11], tone: 'ink' },
            ]}
            format={(v) => `${Math.round(v)}%`}
            yMax={100}
            markers={[{ at: 5, label: 'Demo starts' }]}
          />
        </Figure>
      </Section>

      <Section id="benchmarks" n={4} title="What counts as good?">
        <p>
          Benchmarks vary by product, format and audience, so treat these as starting points and
          compare against your own account average.
        </p>
        <CompareTable
          columns={['', 'Hook rate', 'Hold rate']}
          rows={[
            ['Weak', 'Below 20%', 'Below 15%'],
            ['Average', '20–30%', '15–25%'],
            ['Strong', 'Above 30%', 'Above 25%'],
          ]}
        />
        <Callout tone="warning">
          A high hook rate with zero sales isn’t a win. Shock openings and clickbait can stop the
          scroll while attracting people who will never buy. Always read hook rate together with
          click rate and cost per purchase.
        </Callout>
      </Section>

      <Section id="diagnose" n={5} title="Diagnose your ad in one look">
        <CompareTable
          columns={['What you see', 'What it means', 'What to change']}
          rows={[
            [
              'Low hook, any hold',
              'The opening doesn’t stop the scroll',
              'New first 3 seconds: start with the result, a bold claim, or a face talking to camera',
            ],
            [
              'High hook, low hold',
              'People are curious, then bored',
              'Cut the slow middle, show the product sooner, add captions',
            ],
            [
              'Good hook and hold, low clicks',
              'They enjoy it but aren’t persuaded',
              'Clearer offer, price, proof and a direct call to action',
            ],
            [
              'Good clicks, few sales',
              'The ad works; the website doesn’t',
              'Fix the landing page: speed, price clarity, delivery info',
            ],
          ]}
        />
      </Section>

      <Section id="hooks" n={6} title="Eight hook styles worth testing">
        <ul>
          <li>
            <strong>The result first:</strong> show the after before the before.
          </li>
          <li>
            <strong>The callout:</strong> &quot;If you run an online clothing shop, watch
            this.&quot;
          </li>
          <li>
            <strong>The objection:</strong> &quot;I thought it was too expensive too.&quot;
          </li>
          <li>
            <strong>The unboxing:</strong> hands opening the parcel, sound on.
          </li>
          <li>
            <strong>The comparison:</strong> yours next to the cheap alternative.
          </li>
          <li>
            <strong>The question:</strong> one specific question your buyer asks themselves.
          </li>
          <li>
            <strong>The review:</strong> a real customer message on screen.
          </li>
          <li>
            <strong>The pattern break:</strong> unexpected movement or setting in frame one.
          </li>
        </ul>
        <Callout tone="local">
          Many people in Bangladesh watch with sound off on mobile data. Burned-in{' '}
          <strong>Bangla captions</strong> and a clear first frame usually lift hook rate
          noticeably.
        </Callout>
      </Section>

      <InlineCta
        title="Videos that stop the scroll, and sell."
        body="We script, edit and test hooks every week for our clients. Book a free call and we’ll review your current ads."
      />

      <Section id="faq" n={7} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Does hook rate matter for static image ads?',
              a: 'No, it only applies to video. For static ads, look at click rate and the cost per click instead.',
            },
            {
              q: 'Why is my hook rate different on Reels and Feed?',
              a: 'Placements behave differently. Reels viewers expect full-screen vertical video and decide faster. Break results down by placement before judging an ad.',
            },
            {
              q: 'Is a longer video worse for hold rate?',
              a: 'Usually the percentage drops as videos get longer, but long videos can still sell well. Judge on cost per purchase, and use hold rate to find the weak section.',
            },
          ]}
        />
      </Section>
    </>
  );
}
