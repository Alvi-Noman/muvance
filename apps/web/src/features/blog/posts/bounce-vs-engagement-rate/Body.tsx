import { Callout, FaqList, Figure, InlineCta, Lead, Section } from '../../components/article';
import { BarList, StatTiles } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        A visitor who reads your whole product page and leaves to think it over used to count as a
        “bounce”. GA4 fixed that.
      </Lead>
      <Section id="definitions" n={1} title="The definitions">
        <p>
          In GA4, a session counts as <strong>engaged</strong> if it lasts longer than 10 seconds,
          includes a conversion event, or has at least two page or screen views.{' '}
          <strong>Bounce rate</strong> is now simply the share of sessions that were not engaged.
        </p>
        <StatTiles
          items={[
            { value: 'Engaged', label: '10s+, or 2+ pages, or a conversion' },
            { value: 'Bounced', label: 'Everything else', dark: true },
          ]}
        />
      </Section>
      <Section id="read" n={2} title="Reading it for ad traffic">
        <p>
          Paid social traffic often has a lower engagement rate than search or returning visitors.
          People were scrolling, not searching. Compare ads with ads, not ads with Google.
        </p>
        <Figure title="Engagement rate by source (example)">
          <BarList
            items={[
              { label: 'Returning visitors', value: 78, tone: 'accent' },
              { label: 'Google organic', value: 66, tone: 'ink' },
              { label: 'Meta ads', value: 48, tone: 'ink' },
              { label: 'TikTok ads', value: 34, tone: 'warm' },
            ]}
            format={(v) => `${v}%`}
          />
        </Figure>
      </Section>
      <Section id="fix" n={3} title="Where to look first">
        <ul>
          <li>
            Landing pages with lots of ad traffic and very low engagement: check load speed on
            mobile first.
          </li>
          <li>A sudden drop: a broken page, a changed ad, or a new audience.</li>
          <li>Big gaps between ads: the ad may promise something the page does not show.</li>
        </ul>
        <Callout tone="tip">
          Engagement is a clue, not a goal. A page with lower engagement and more orders is still
          the better page.
        </Callout>
      </Section>
      <InlineCta
        title="Want a hand reading your GA4?"
        body="Book a free call. We will walk through your traffic and what it says."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Can I change the 10-second rule?',
              a: 'Yes, in GA4 you can raise it up to 60 seconds in the data stream settings.',
            },
            {
              q: 'Why does GA4 not match Ads Manager clicks?',
              a: 'Clicks are not sessions. Slow pages, closed tabs and blocked tracking all cause gaps.',
            },
          ]}
        />
      </Section>
    </>
  );
}
