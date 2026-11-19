import { Link } from 'react-router';
import { FaqList, Figure, InlineCta, Lead, Section, Steps } from '../../components/article';
import { Checklist, LineChart } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        Most launches are one post and a hope. A good launch starts weeks before anyone can buy.
      </Lead>
      <Section id="plan" n={1} title="The four weeks">
        <Steps
          steps={[
            {
              title: 'Week −3: tease',
              body: 'Behind the scenes, the problem it solves, “something new is coming”.',
            },
            {
              title: 'Week −2: collect interest',
              body: 'Waitlist via WhatsApp or a form. Show details.',
            },
            {
              title: 'Week −1: warm up',
              body: 'Founder video, early reviews from testers, launch date.',
            },
            {
              title: 'Launch week',
              body: 'Existing customers and waitlist first, then ads to new people.',
            },
          ]}
        />
      </Section>
      <Section id="curve" n={2} title="What a launch often looks like">
        <Figure
          title="Daily orders around a launch (example)"
          caption="A spike from warm customers, a dip, then steady growth as ads find new buyers."
        >
          <LineChart
            labels={['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D10', 'D14', 'D21']}
            series={[
              { name: 'Orders', values: [65, 40, 28, 25, 22, 24, 26, 30, 34, 38], tone: 'accent' },
            ]}
            markers={[{ at: 0, label: 'Launch' }]}
          />
        </Figure>
        <p>
          The dip after day one is normal. Do not panic and slash prices. See{' '}
          <Link to="/blog/launch-new-product-or-push-best-seller">new product vs best seller</Link>.
        </p>
      </Section>
      <Section id="ready" n={3} title="Before you launch">
        <Checklist
          items={[
            'Enough stock for a good first week',
            'Product page with real photos and FAQ',
            'Call team briefed on the new product',
            'Creative for at least three angles',
            'Tracking tested',
          ]}
          verdicts={['Not ready. Delay a week.', 'Close. Fix the gaps.', 'Ready to launch.']}
        />
      </Section>
      <InlineCta
        title="Launching something soon?"
        body="Book a free call. We will help you plan it."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Should I discount at launch?',
              a: 'An early-bird reward for the waitlist works. A deep discount sets a low price expectation.',
            },
            {
              q: 'How long should the waitlist run?',
              a: 'Two to three weeks keeps interest without people forgetting.',
            },
          ]}
        />
      </Section>
    </>
  );
}
