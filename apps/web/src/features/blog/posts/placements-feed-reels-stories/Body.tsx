import {
  Callout,
  CompareTable,
  FaqList,
  InlineCta,
  KeyTakeaways,
  Lead,
  Prose,
  PullQuote,
  Section,
} from '../../components/article';

export function Body() {
  return (
    <>
      <Lead>
        Feed, Reels, Stories, Marketplace, Messenger: Meta can show your ad in dozens of places.
        Should you choose them yourself, or let Meta decide?
      </Lead>
      <Prose>
        <p>
          For most stores the answer is: let Meta decide (Advantage+ placements), but make your ads
          look good in every shape. Manual placements make sense only for specific reasons.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Automatic placements usually give the lowest cost per purchase.',
            'The real work is making ads that fit each placement’s shape.',
            'Vertical 9:16 video covers Reels and Stories; 4:5 suits feeds.',
            'Exclude a placement only when you have data that it hurts.',
          ]}
        />
      </div>

      <Section id="places" n={1} title="The main placements, and what works in each">
        <CompareTable
          columns={['Placement', 'Shape', 'What works']}
          rows={[
            [
              'Facebook and Instagram feeds',
              '4:5 or 1:1',
              'Clear product, strong first line of text',
            ],
            ['Reels', '9:16 video', 'Native-looking video, hook in the first second, sound on'],
            ['Stories', '9:16', 'Full-screen, big text, a clear tap-to-shop moment'],
            ['Marketplace and right column', 'Small', 'Simple product shots, price visible'],
          ]}
        />
      </Section>

      <Section id="auto" n={2} title="Why automatic usually wins">
        <p>
          Meta moves budget between placements in real time, towards wherever purchases are cheapest
          that hour. Locking yourself into one placement removes that flexibility and usually raises
          costs.
        </p>
        <Callout tone="tip" title="Give every placement a proper ad">
          Upload a vertical version and a feed version of each ad. Otherwise Meta crops one shape
          into the others, and cropped ads look like ads.
        </Callout>
      </Section>

      <PullQuote>Let Meta choose the place. You choose how good the ad looks there.</PullQuote>

      <Section id="manual" n={3} title="When to choose placements yourself">
        <ul>
          <li>Your ad only makes sense in one format (for example, a Reels-style video).</li>
          <li>
            A placement brings clicks but clearly no purchases, over a meaningful amount of spend.
          </li>
          <li>Brand safety: you need to avoid certain apps or placements.</li>
        </ul>
        <p>
          Check the breakdown by placement in Ads Manager before excluding anything, and judge on
          cost per purchase, not per click.
        </p>
      </Section>

      <InlineCta
        title="Ads looking cropped or out of place?"
        body="Book a free call. We will check your creative across placements and show you what to fix."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Should I make separate ads for Reels?',
              a: 'Yes, if you can. Reels rewards video that looks native to Reels: vertical, fast, with sound.',
            },
            {
              q: 'Is Audience Network worth it?',
              a: 'Often it brings cheap clicks but few sales. Check its cost per purchase; exclude it only if the data says so.',
            },
          ]}
        />
      </Section>
    </>
  );
}
