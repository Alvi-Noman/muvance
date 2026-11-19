import { Link } from 'react-router';
import { Callout, FaqList, Figure, InlineCta, Lead, Section } from '../../components/article';
import { LineChart } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        In the first 90 days, your job is not to scale. It is to learn what sells, to whom, and why.
      </Lead>
      <Section id="month1" n={1} title="Month one: foundations">
        <ul>
          <li>Set up the store, Pixel and Conversions API, and a simple order sheet.</li>
          <li>Get real product photos and a few short videos.</li>
          <li>
            Sell to friends, family and their networks. Collect honest feedback and first reviews.
          </li>
          <li>Set up WhatsApp and Messenger replies.</li>
        </ul>
      </Section>
      <Section id="month2" n={2} title="Month two: test">
        <ul>
          <li>Run small ad tests with several angles.</li>
          <li>Track delivered orders, not just placed ones.</li>
          <li>Fix the product page based on messages and drop-offs.</li>
          <li>
            Talk to customers. See{' '}
            <Link to="/blog/how-to-interview-customers">customer interviews</Link>.
          </li>
        </ul>
        <Figure title="Typical first-90-day pattern (example)">
          <LineChart
            labels={['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12']}
            series={[
              {
                name: 'Weekly orders',
                values: [12, 15, 10, 18, 25, 30, 28, 40, 52, 60, 72, 85],
                tone: 'accent',
              },
            ]}
            markers={[
              { at: 4, label: 'Ad tests start' },
              { at: 8, label: 'Scale winner' },
            ]}
          />
        </Figure>
      </Section>
      <Section id="month3" n={3} title="Month three: double down">
        <ul>
          <li>
            Put more budget behind the winning angle, slowly. See{' '}
            <Link to="/blog/how-to-scale-winning-meta-ads">scaling winning ads</Link>.
          </li>
          <li>Add a repeat-purchase message for first customers.</li>
          <li>Start a simple content rhythm.</li>
          <li>
            Write your <Link to="/blog/one-page-marketing-plan">one-page plan</Link> for the next 90
            days.
          </li>
        </ul>
        <Callout tone="tip">
          Keep your fixed costs low until you know your unit economics. Cash runs out faster than
          people expect.
        </Callout>
      </Section>
      <InlineCta
        title="Starting a new brand?"
        body="Book a free call. We will help you plan the first 90 days. If the product is strong, we may even invest."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'How much should I budget for ads at the start?',
              a: (
                <>
                  Enough to test several angles meaningfully, without risking money you need for
                  stock. See{' '}
                  <Link to="/blog/how-much-to-spend-on-meta-ads-per-day">daily ad budget</Link>.
                </>
              ),
            },
            {
              q: 'Should I hire an agency from day one?',
              a: 'It can save expensive mistakes, but make sure the product and basics are ready first.',
            },
          ]}
        />
      </Section>
    </>
  );
}
