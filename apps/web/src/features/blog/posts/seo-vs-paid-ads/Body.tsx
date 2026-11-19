import { Link } from 'react-router';
import { CompareTable, FaqList, Figure, InlineCta, Lead, Section } from '../../components/article';
import { Legend, LineChart } from '../../components/viz';
import { taka } from '../../components/format';

export function Body() {
  return (
    <>
      <Lead>
        Ads are renting attention. SEO is slowly buying land. Most healthy brands do some of both.
      </Lead>
      <Section id="compare" n={1} title="How they compare">
        <CompareTable
          columns={['', 'Paid ads', 'SEO']}
          rows={[
            ['Speed', 'Results in days', 'Results in months'],
            ['Cost model', 'Pay for every visit', 'Pay upfront in time and content'],
            ['When you stop', 'Traffic stops', 'Traffic mostly continues'],
            ['Control', 'High', 'Low, Google decides'],
            ['Best for', 'Launches, testing, scaling fast', 'Steady, lower-cost demand'],
          ]}
        />
      </Section>
      <Section id="cost" n={2} title="Cost per order over time">
        <Figure
          title="Cost per order by channel over a year (example)"
          caption="SEO starts expensive per order and gets cheaper as traffic builds."
        >
          <Legend
            items={[
              { name: 'Paid ads', tone: 'ink' },
              { name: 'SEO (content cost ÷ orders)', tone: 'accent' },
            ]}
          />
          <LineChart
            labels={['Q1', 'Q2', 'Q3', 'Q4']}
            series={[
              { name: 'Paid ads', values: [420, 430, 445, 450], tone: 'ink' },
              {
                name: 'SEO (content cost ÷ orders)',
                values: [1400, 650, 320, 190],
                tone: 'accent',
              },
            ]}
            format={taka}
          />
        </Figure>
      </Section>
      <Section id="split" n={3} title="A sensible split by stage">
        <ul>
          <li>
            <strong>New brand:</strong> mostly ads, to learn what sells. Set up SEO basics.
          </li>
          <li>
            <strong>Growing brand:</strong> ads still lead; publish helpful content and fix product
            and category pages steadily.
          </li>
          <li>
            <strong>Established brand:</strong> SEO and repeat customers carry more; ads for growth
            and launches.
          </li>
        </ul>
      </Section>
      <InlineCta
        title="Not sure how to split your effort?"
        body="Book a free call. We will look at your stage and suggest a balance."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Can ads help SEO?',
              a: 'Not directly. But ads bring brand awareness, and people who know you search for you later.',
            },
            {
              q: 'Should I run Google search ads on my own brand name?',
              a: (
                <>
                  Often worth testing, especially if competitors bid on it. See{' '}
                  <Link to="/blog/google-ads-for-online-stores">Google Ads for online stores</Link>.
                </>
              ),
            },
          ]}
        />
      </Section>
    </>
  );
}
