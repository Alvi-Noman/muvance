import { Link } from 'react-router';
import { CompareTable, FaqList, Figure, InlineCta, Lead, Section } from '../../components/article';
import { BarList } from '../../components/viz';
import { taka } from '../../components/format';

export function Body() {
  return (
    <>
      <Lead>
        Lookalikes used to be the secret weapon. Today they are more like a useful tool in the
        drawer.
      </Lead>
      <Section id="types" n={1} title="The audiences you can build">
        <CompareTable
          columns={['Audience', 'Built from', 'Typical use']}
          rows={[
            ['Website visitors', 'Pixel and Conversions API', 'Retargeting, exclusions'],
            ['Engagers', 'People who interacted on Facebook or Instagram', 'Warm retargeting'],
            [
              'Customer list',
              'Uploaded phone numbers and emails',
              'Exclusions, repeat-purchase ads',
            ],
            ['Lookalike', 'Similar to any of the above', 'Tests against broad'],
          ]}
        />
      </Section>
      <Section id="today" n={2} title="Where they help today">
        <ul>
          <li>
            <strong>Exclusions.</strong> Keep first-order discounts away from existing customers.
          </li>
          <li>
            <strong>Telling Meta who matters.</strong> In Advantage+ campaigns you can mark existing
            customers so Meta reports, and can cap, spend on them.
          </li>
          <li>
            <strong>Retargeting</strong> when you have a specific message for warm people. See{' '}
            <Link to="/blog/meta-retargeting-campaigns-ecommerce">retargeting</Link>.
          </li>
          <li>
            <strong>Testing.</strong> A lookalike of your best customers versus broad is still a
            fair test.
          </li>
        </ul>
      </Section>
      <Section id="broad" n={3} title="Lookalike vs broad: what we often see">
        <Figure
          title="Cost per delivered order, side by side (example)"
          caption="In many accounts, broad and lookalikes end up close. Results vary, so test in your own account."
        >
          <BarList
            items={[
              { label: 'Broad', value: 410, tone: 'accent' },
              { label: 'Lookalike of buyers', value: 430, tone: 'ink' },
              { label: 'Interest stack', value: 520, tone: 'warm' },
            ]}
            format={taka}
          />
        </Figure>
        <p>
          As Meta’s system relies more on the ad itself to find the right people, creative variety
          tends to matter more than audience choice. See{' '}
          <Link to="/blog/broad-targeting-vs-interests">broad vs interests</Link>.
        </p>
      </Section>
      <Section id="quality" n={4} title="Feeding good seed data">
        <p>
          A lookalike is only as good as its source. A list of your best repeat customers usually
          beats “all visitors”. Refresh customer lists monthly.
        </p>
      </Section>
      <InlineCta
        title="Want your audiences set up properly?"
        body="Book a free call. We will check exclusions, lists and tests."
      />
      <Section id="faq" n={5} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'What size should the source audience be?',
              a: 'Meta needs at least 100 people from one country. A few thousand quality customers gives better results.',
            },
            {
              q: '1% or 5% lookalike?',
              a: 'Wider lookalikes often perform similarly today, because Meta expands anyway. Test, don’t assume.',
            },
          ]}
        />
      </Section>
    </>
  );
}
