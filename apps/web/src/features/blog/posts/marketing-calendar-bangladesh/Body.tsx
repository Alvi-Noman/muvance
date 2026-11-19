import { Link } from 'react-router';
import {
  Callout,
  CompareTable,
  FaqList,
  InlineCta,
  Lead,
  Section,
  Steps,
} from '../../components/article';

export function Body() {
  return (
    <>
      <Lead>
        The brands that win Eid usually start planning for it while everyone else is still finishing
        the last campaign.
      </Lead>
      <Section id="calendar" n={1} title="The key moments">
        <CompareTable
          columns={['Moment', 'When', 'Often sells well']}
          rows={[
            [
              'Winter and wedding season',
              'December to February',
              'Shawls, jackets, wedding wear, gifts',
            ],
            ['Back to school', 'January', 'Bags, stationery, kids’ items'],
            [
              'Pohela Falgun and Valentine’s',
              'Mid-February',
              'Yellow and red outfits, flowers, gifts',
            ],
            [
              'Ramadan and Eid ul-Fitr',
              'Moves about 11 days earlier each year',
              'Clothing, food, gifts, home',
            ],
            ['Pohela Boishakh', '14 April', 'Red and white wear, traditional items'],
            ['Eid ul-Adha', 'About ten weeks after Eid ul-Fitr', 'Kitchen, home, clothing'],
            ['Durga Puja', 'September or October', 'Saris, festive wear, gifts'],
            ['11.11 and 12.12', 'November and December', 'Deals across categories'],
          ]}
        />
        <Callout tone="warning">
          Some national days, like 21 February, are days of remembrance. Be careful with sales
          messaging around them; a respectful post often fits better than an offer.
        </Callout>
      </Section>
      <Section id="timeline" n={2} title="A planning timeline for big moments">
        <Steps
          steps={[
            { title: '8–10 weeks before', body: 'Decide products, stock, offer. Order inventory.' },
            { title: '6 weeks before', body: 'Plan and shoot creative.' },
            {
              title: '3–4 weeks before',
              body: 'Start ads early, while costs are lower; build warm audiences.',
            },
            {
              title: 'Peak weeks',
              body: 'Push budget on proven ads; staff up call centre and packing.',
            },
            { title: 'After', body: 'Review results, thank customers, plan the next one.' },
          ]}
        />
      </Section>
      <Section id="costs" n={3} title="Expect ad costs to rise">
        <p>
          Competition peaks close to big festivals, and so do CPMs. See{' '}
          <Link to="/blog/cpm-explained-why-ad-costs-change">CPM explained</Link> and{' '}
          <Link to="/blog/meta-ads-eid-seasonal-performance">Eid performance</Link>. Courier delays
          also rise, so promise delivery dates carefully.
        </p>
      </Section>
      <InlineCta
        title="Want your next big season planned early?"
        body="Book a free call. We will build a timeline with you."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Should every brand run something for every moment?',
              a: 'No. Pick the ones that fit your products and do them well.',
            },
            {
              q: 'When does Eid shopping really start?',
              a: 'For clothing, often from the middle of Ramadan or earlier. Watch your own data from last year.',
            },
          ]}
        />
      </Section>
    </>
  );
}
