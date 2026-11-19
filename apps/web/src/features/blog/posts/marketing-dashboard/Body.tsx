import { Link } from 'react-router';
import {
  Callout,
  CompareTable,
  FaqList,
  InlineCta,
  Lead,
  Prose,
  Section,
} from '../../components/article';
import { StatTiles, Versus } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        The best dashboard is the one that gets opened every Monday. That usually means it fits on
        one screen.
      </Lead>
      <Prose>
        <p>
          Many brands have numbers spread across Ads Manager, the store admin, the courier portal
          and someone’s notebook. Nobody sees the whole picture, so decisions get made on whichever
          screen is open.
        </p>
      </Prose>
      <Section id="eight" n={1} title="The eight numbers">
        <StatTiles
          items={[
            { value: 'Revenue', label: 'Delivered, this week', dark: true },
            { value: 'Orders', label: 'Delivered, this week' },
            { value: 'Ad spend', label: 'All platforms' },
            { value: 'MER', label: 'Revenue ÷ spend' },
          ]}
        />
        <StatTiles
          items={[
            { value: 'New customers', label: 'And their cost' },
            { value: 'AOV', label: 'Average order value' },
            { value: 'Delivery rate', label: 'Delivered ÷ shipped' },
            { value: 'Margin', label: 'After ads and delivery', dark: true },
          ]}
        />
        <p>
          Each one has a reason. Revenue and orders show size. Spend and MER show efficiency. New
          customers show growth. AOV and delivery rate show where money leaks. Margin tells you if
          any of it is worth it.
        </p>
      </Section>
      <Section id="sources" n={2} title="Where each number comes from">
        <CompareTable
          columns={['Number', 'Source', 'Tip']}
          rows={[
            ['Revenue, orders, AOV', 'Store admin or order sheet', 'Use delivered, not placed'],
            ['Ad spend', 'Each ad platform', 'Add them all up, including boosts'],
            ['New customers', 'Orders grouped by phone', 'First order ever = new'],
            ['Delivery rate', 'Courier portal', 'Weekly is enough'],
            [
              'Margin',
              'Your own calculation',
              <>
                See <Link to="/blog/contribution-margin-ecommerce">contribution margin</Link>
              </>,
            ],
          ]}
        />
      </Section>
      <Section id="tool" n={3} title="Sheet or Looker Studio?">
        <Versus
          left={{
            title: 'Google Sheet',
            points: [
              'Free and quick to start',
              'Easy to add notes',
              'Manual updates each week',
              'Best under a few hundred orders a week',
            ],
          }}
          right={{
            title: 'Looker Studio',
            points: [
              'Free, connects to data sources',
              'Updates itself once set up',
              'Takes time to build well',
              'Best once you have steady volume',
            ],
          }}
        />
        <Callout tone="tip">
          Add a “what changed” notes row. Six months later, “launched new product” next to a spike
          explains more than any chart.
        </Callout>
      </Section>
      <InlineCta
        title="Want a dashboard set up for you?"
        body="Book a free call. Our clients get a one-page view of their numbers every week."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Daily or weekly?',
              a: 'Weekly for decisions. Daily numbers swing too much, especially with delayed deliveries.',
            },
            {
              q: 'Should I add social media numbers?',
              a: 'Only if you act on them. Most belong in a separate content report.',
            },
          ]}
        />
      </Section>
    </>
  );
}
