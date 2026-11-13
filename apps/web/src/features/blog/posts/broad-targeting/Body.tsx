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
import { Checklist, LineChart } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        &quot;Go broad&quot; is the most repeated advice in Meta ads. It’s also the most
        misunderstood. Here’s when it works, when it doesn’t, and how to test it on your account.
      </Lead>
      <Prose>
        <p>
          A few years ago, finding the right interest was a media buyer’s main skill. Today, Meta’s
          delivery system usually knows more about who will buy than any interest list. Broad
          targeting simply means <strong>getting out of its way</strong>: set the country and the
          basics, and let the algorithm find buyers using your creative and conversion data.
        </p>
        <p>
          But broad isn’t magic. It depends on two things you control: the signal you send back
          (tracking) and the signal you send out (creative).
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Broad usually wins once your pixel has steady purchase data and your creative is varied.',
            'Broad often looks worse in week one, then improves as delivery learns.',
            'Interests and lookalikes still help new accounts, niche products and small budgets.',
            'Test it properly with Meta’s A/B test tool, not by eyeballing two campaigns.',
          ]}
        />
      </div>

      <Section id="what" n={1} title="What 'broad' actually means today">
        <p>
          Broad targeting means no interests, no lookalikes, and as few restrictions as possible:
          usually just location, and an age floor if your product needs one. With{' '}
          <strong>Advantage+ audience</strong>, you can still add suggestions (an interest or a
          customer list), but Meta treats them as hints and will go beyond them when it finds better
          buyers.
        </p>
        <CompareTable
          columns={['', 'Detailed targeting', 'Broad / Advantage+ audience']}
          rows={[
            [
              'Who you tell Meta to reach',
              'People matching chosen interests',
              'Everyone in the location and age range',
            ],
            ['Who decides', 'You, upfront', 'The delivery system, using live results'],
            ['Audience size', 'Often small, can saturate', 'Very large, rarely saturates'],
            ['What does the work', 'Your interest research', 'Your creative and conversion data'],
          ]}
        />
      </Section>

      <Section id="why" n={2} title="Why broad usually wins over time">
        <p>
          Interests are crude. &quot;Interested in fashion&quot; includes students who like a page
          and buyers who order every week. Meta’s delivery system, by contrast, learns from who{' '}
          <strong>actually</strong> clicks and buys from <em>your</em> ads. Given room to explore,
          it tends to find cheaper buyers than a hand-picked list.
        </p>
        <Figure
          title="Typical cost per purchase over the first 6 weeks"
          caption="Broad often starts more expensive while it explores, then settles lower. Interest audiences start well, then get more expensive as they saturate."
        >
          <LineChart
            labels={['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6']}
            series={[
              { name: 'Interest audience', values: [520, 540, 580, 610, 650, 690], tone: 'warm' },
              { name: 'Broad', values: [640, 580, 520, 480, 460, 450], tone: 'ink' },
            ]}
            format={(v) => `৳${Math.round(v)}`}
            yMin={300}
            yMax={750}
          />
        </Figure>
        <Callout tone="warning">
          This is why many buyers wrongly conclude &quot;broad doesn’t work&quot;: they judge it
          after three days. Give a broad test at least <strong>7–14 days</strong> and enough budget
          to exit the learning phase.
        </Callout>
      </Section>

      <Section id="when-not" n={3} title="When interests and lookalikes still make sense">
        <ul>
          <li>
            <strong>Brand-new pixel or account.</strong> With no purchase history, a few relevant
            interests give delivery a head start.
          </li>
          <li>
            <strong>Very niche products.</strong> Dental equipment or B2B software for a small
            profession may need a nudge in the right direction.
          </li>
          <li>
            <strong>Very small budgets.</strong> If you can only afford a few purchases a week,
            delivery has little to learn from. A tighter audience can help early on.
          </li>
          <li>
            <strong>Local or language-specific offers.</strong> A Dhaka-only service should be
            limited by location, not interest.
          </li>
        </ul>
      </Section>

      <Section id="ready" n={4} title="Is your account ready for broad?">
        <Figure title="Broad-readiness check" example={false}>
          <Checklist
            items={[
              'Pixel and Conversions API both send Purchase',
              'Purchases are deduplicated with an event ID',
              'At least 50 purchases a month from ads',
              'At least 6 different creative concepts live',
              'Ads clearly show who the product is for',
              'Daily budget can support a 2-week test',
            ]}
            verdicts={[
              'Fix tracking and creative first. Broad will struggle without them.',
              'You can test broad, but expect a slower start.',
              'Your account is ready. Broad is very likely to win.',
            ]}
          />
        </Figure>
        <Callout tone="tip">
          With broad targeting, <strong>your ad does the targeting</strong>. If you sell to new
          mothers, the first two seconds should make that obvious: show a mother, say &quot;new
          mums&quot;, use their language.
        </Callout>
      </Section>

      <Section id="test" n={5} title="How to test broad properly">
        <Steps
          steps={[
            {
              title: 'Use the A/B test tool',
              body: 'Meta’s A/B test splits people so the two versions don’t compete in the same auction. Comparing two normal campaigns isn’t a fair test.',
            },
            {
              title: 'Change only the audience',
              body: 'Same creative, same budget, same optimisation event. Otherwise you’re testing two things at once.',
            },
            {
              title: 'Run 7–14 days',
              body: 'Long enough to get through learning and cover weekday and weekend behaviour.',
            },
            {
              title: 'Judge on cost per purchase and MER',
              body: 'Not on CPM or CTR. Broad often has cheaper reach but a lower click rate, and still wins on sales.',
            },
            {
              title: 'Exclude recent buyers if needed',
              body: 'If you only want new customers, exclude your customer list, or use the new-customer settings in Advantage+.',
            },
          ]}
        />
      </Section>

      <InlineCta
        title="Not sure your account is ready for broad?"
        body="We check your tracking, creative mix and data volume on a free call, and tell you exactly which targeting will work for you."
      />

      <Section id="faq" n={6} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Should I still use lookalike audiences?',
              a: 'They can work as Advantage+ audience suggestions, especially from a list of high-value customers. Treat them as a starting hint rather than a hard boundary.',
            },
            {
              q: 'My broad campaign spends on the wrong people. Why?',
              a: 'Usually the creative is too generic, so delivery has nothing to go on. Make the ad speak clearly to the buyer, and check that purchase tracking is firing correctly.',
            },
            {
              q: 'Do I need to set an age range?',
              a: 'Only when the product truly requires it, or when you’re sure an age group never buys. Otherwise let delivery decide; it will rarely waste much on the wrong age.',
            },
            {
              q: 'Does broad work in a small country or city?',
              a: 'Yes, but the audience is smaller, so creative fatigue arrives sooner. Plan to refresh ads more often.',
            },
          ]}
        />
      </Section>

      <InlineCta
        title={<>Let the algorithm find your buyers.</>}
        body="We set up tracking and creative so broad targeting can do its job, and we only get paid when you hit your sales target."
      />
    </>
  );
}
