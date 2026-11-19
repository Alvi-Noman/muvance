import {
  Callout,
  Code,
  CompareTable,
  FaqList,
  InlineCta,
  KeyTakeaways,
  Lead,
  Prose,
  Section,
} from '../../components/article';

export function Body() {
  return (
    <>
      <Lead>
        UTM parameters are small tags on the end of your ad links. They tell your store, your
        analytics and your CRM exactly which campaign and ad each visitor came from.
      </Lead>
      <Prose>
        <p>
          Meta tracks its own results, but your store and analytics tools only see a visit from
          &quot;facebook&quot;. UTMs fill that gap. Set them once at the ad level and they work for
          every ad from then on.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Add UTMs in the ad’s URL parameters field, not by editing the link.',
            'Use Meta’s dynamic values so names fill in automatically.',
            'Keep the naming consistent, in lower case.',
            'UTMs help you compare Meta’s numbers with your own store’s.',
          ]}
        />
      </div>

      <Section id="parts" n={1} title="The five parts">
        <CompareTable
          columns={['Parameter', 'Meaning', 'Example']}
          rows={[
            ['utm_source', 'Where the visit came from', 'facebook'],
            ['utm_medium', 'What kind of traffic', 'paid'],
            ['utm_campaign', 'Which campaign', '{{campaign.name}}'],
            ['utm_content', 'Which ad', '{{ad.name}}'],
            ['utm_term', 'Which ad set (optional)', '{{adset.name}}'],
          ]}
        />
      </Section>

      <Section id="copy" n={2} title="Copy-and-paste setup">
        <p>In each ad, open Destination, then URL parameters, and paste:</p>
        <Code title="URL parameters">{`utm_source=facebook&utm_medium=paid&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&utm_term={{adset.name}}`}</Code>
        <Callout tone="tip" title="Name your ads well">
          With dynamic values, your ad names become your report.
          &quot;Shirt_Hook-heat_Video_v2&quot; is far more useful later than &quot;New ad 7&quot;.
        </Callout>
      </Section>

      <Section id="use" n={3} title="What you can do with them">
        <ul>
          <li>See sales by campaign and ad in your store or analytics, not just in Meta.</li>
          <li>Match orders and booked calls to the ad that brought them.</li>
          <li>Spot ads Meta credits that your store never sees, and the other way round.</li>
        </ul>
      </Section>

      <InlineCta
        title="Not sure your tracking tells the truth?"
        body="Book a free call. We will check your Pixel, Conversions API and UTMs and show you any gaps."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Do UTMs affect ad performance?',
              a: 'No. They only add information to the link. Meta still optimises the same way.',
            },
            {
              q: 'Should I use UTMs on message ads?',
              a: 'There is no landing page to read them, so they matter less. Track those orders in your chat or CRM instead.',
            },
          ]}
        />
      </Section>
    </>
  );
}
