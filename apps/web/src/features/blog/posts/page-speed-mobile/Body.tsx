import {
  Callout,
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
import { BarList, Calculator, Checklist } from '../../components/viz';

function loadTime(v: Record<string, number>) {
  const mb = v.mb ?? 0;
  const mbps = v.mbps || 1;
  const seconds = (mb * 8) / mbps;
  return [
    { label: 'Time just to download the page', value: `${seconds.toFixed(1)}s`, dark: true },
    { label: 'Verdict', value: seconds <= 2.5 ? 'Good' : seconds <= 4 ? 'Needs work' : 'Too slow' },
  ];
}

export function Body() {
  return (
    <>
      <Lead>
        You can pay for a click, and lose the visitor before your page even appears. On mobile data
        that happens a lot more often than most store owners realise.
      </Lead>
      <Prose>
        <p>
          Your office Wi-Fi isn’t what your customers use. Most people clicking your ads are on a
          phone, often a mid-range Android, often on mobile data, sometimes on a crowded network. A
          page that loads in a second for you can take five or six seconds for them. By then, a good
          chunk have tapped back to Facebook.
        </p>
        <p>
          We touched on speed in our ten landing page fixes. This post goes deeper: how fast is fast
          enough, how to measure it, and what usually slows stores down.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            "Aim for the main content to appear within about 2.5 seconds on a phone (Google’s 'good' LCP).",
            'Page weight is the usual culprit: big images, too many apps and scripts.',
            'Test on mobile settings, not your laptop. PageSpeed Insights is free.',
            'Images are the cheapest, biggest win. Compress them before anything else.',
          ]}
        />
      </div>

      <Section id="targets" n={1} title="How fast is fast enough?">
        <p>
          Google measures real visitors’ experience with three numbers called Core Web Vitals. These
          are Google’s published thresholds for a &quot;good&quot; experience:
        </p>
        <CompareTable
          columns={['Metric', 'What it means', 'Good']}
          rows={[
            [
              'LCP (Largest Contentful Paint)',
              'How long until the main content (usually the product photo) appears',
              '2.5 seconds or less',
            ],
            [
              'INP (Interaction to Next Paint)',
              'How quickly the page responds when you tap something',
              '200 ms or less',
            ],
            [
              'CLS (Cumulative Layout Shift)',
              'How much the page jumps around while loading',
              '0.1 or less',
            ],
          ]}
        />
      </Section>

      <Section id="calc" n={2} title="Quick reality check">
        <p>
          A rough sense check: how long would your page take just to download on a typical mobile
          connection? (Real load times are longer, because the browser also has to process
          everything.)
        </p>
        <Figure title="Download time calculator" example={false}>
          <Calculator
            inputs={[
              { id: 'mb', label: 'Page size (MB)', value: 4, step: 0.5 },
              { id: 'mbps', label: 'Connection speed (Mbps)', value: 8, step: 1 },
            ]}
            compute={loadTime}
          />
        </Figure>
        <Callout tone="tip">
          Find your page size in PageSpeed Insights, or in Chrome’s developer tools under the
          Network tab (the total transferred at the bottom).
        </Callout>
      </Section>

      <Section id="weight" n={3} title="What usually makes a product page heavy">
        <Figure
          title="Where the weight goes on a typical slow product page"
          caption="Illustrative. Images are almost always the biggest slice, and the easiest to fix."
        >
          <BarList
            items={[
              {
                label: 'Product images',
                value: 2.4,
                tone: 'warm',
                note: 'Full-size photos straight from the camera or designer. Often 1–3 MB each.',
              },
              {
                label: 'Apps and plugins',
                value: 0.9,
                note: 'Reviews, chat, pop-ups and trackers, each adding its own scripts.',
              },
              {
                label: 'Theme code',
                value: 0.5,
                note: 'Styles and scripts the theme loads on every page, used or not.',
              },
              { label: 'Fonts', value: 0.3, note: 'Several weights of several fonts add up.' },
              { label: 'Video', value: 0.6, note: 'Autoplaying video in the first screen.' },
            ]}
            format={(v) => `${v.toFixed(1)} MB`}
          />
        </Figure>
      </Section>

      <Section id="fixes" n={4} title="Fixes, in order of impact">
        <Steps
          steps={[
            {
              title: 'Compress and resize images',
              body: 'Use WebP, sized for phones. Most product photos can be under 200 KB without visible loss.',
            },
            {
              title: 'Lazy-load below-the-fold images',
              body: 'Only load images when the visitor scrolls to them. Keep the first photo loading straight away.',
            },
            {
              title: 'Remove apps you do not use',
              body: 'Every plugin adds scripts. If it does not earn money, remove it.',
            },
            { title: 'Limit fonts', body: 'One or two font families, few weights.' },
            {
              title: 'Avoid pop-ups on load',
              body: 'They delay interaction and annoy visitors who just arrived from an ad.',
            },
            {
              title: 'Re-test on mobile',
              body: 'Run PageSpeed Insights again after each change to see what moved.',
            },
          ]}
        />
      </Section>

      <Section id="check" n={5} title="Speed checklist">
        <Figure title="Tick what’s true on your product pages" example={false}>
          <Checklist
            items={[
              'Tested on mobile in PageSpeed Insights',
              'LCP under 2.5 seconds',
              'Product images under ~200 KB',
              'No unused apps or plugins',
              'No pop-up on first load',
              'Page does not jump while loading',
            ]}
            verdicts={[
              'Speed is probably costing you sales. Start with images.',
              'Better than most. Keep going.',
              'Fast. Your ad clicks have a fair chance.',
            ]}
          />
        </Figure>
      </Section>

      <InlineCta
        title="Paying for clicks that never see your page?"
        body="We check landing page speed for every client before scaling ads. Book a free call and we’ll test yours."
      />

      <Section id="faq" n={6} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'My PageSpeed score is low but the site feels fast to me. Who is right?',
              a: 'Probably the test. You’re likely on fast Wi-Fi and a good phone. Your buyers often aren’t.',
            },
            {
              q: 'Do I need a new website to be fast?',
              a: 'Usually not. Image compression and removing unused apps fix most of the problem on existing sites.',
            },
            {
              q: 'Does speed affect my ad costs?',
              a: 'Indirectly. Faster pages convert more of the clicks you pay for, which lowers your cost per purchase.',
            },
          ]}
        />
      </Section>
    </>
  );
}
