import {
  Callout,
  CompareTable,
  FaqList,
  Figure,
  InlineCta,
  KeyTakeaways,
  Lead,
  Prose,
  PullQuote,
  Section,
} from '../../components/article';
import { Calculator, Checklist, Versus } from '../../components/viz';
import { taka } from '../../components/format';

function compareCosts(v: Record<string, number>) {
  const retainer = v.retainer ?? 0;
  const commission = ((v.commission ?? 0) / 100) * (v.extra ?? 0);
  return [
    { label: 'Retainer agency costs', value: taka(retainer) },
    { label: 'Performance agency costs', value: taka(commission), dark: true },
    {
      label: 'If sales don’t grow',
      value: `${taka(retainer)} vs ৳0`,
    },
  ];
}

export function Body() {
  return (
    <>
      <Lead>
        Most agencies charge a fixed fee every month, whether your sales grow or not. Performance
        agencies only earn when you do. Which one is better depends on your business.
      </Lead>
      <Prose>
        <p>
          Choosing how to pay an agency isn’t just a price question. It decides what the agency is
          motivated to do every day. This guide compares the two models fairly, including when a
          retainer is the better deal.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Retainer: a fixed monthly fee. Predictable cost, but you pay even when results are poor.',
            'Performance-based: the agency earns a share of results, so its income depends on yours.',
            'If results are very strong, performance pricing can cost more in absolute terms, but only because you earned more.',
            'Whatever the model, insist on clear targets, transparent reporting and access to your own ad account.',
          ]}
        />
      </div>

      <Section id="models" n={1} title="How each model works">
        <CompareTable
          columns={['', 'Monthly retainer', 'Performance-based']}
          rows={[
            [
              'What you pay',
              'A fixed fee every month',
              'A share of sales or profit above an agreed target',
            ],
            ['When you pay', 'Upfront, usually monthly', 'After results are delivered'],
            ['If results are poor', 'You still pay the full fee', 'You pay little or nothing'],
            ['If results are great', 'Same fee', 'The agency earns more, because you earned more'],
            ['Agency’s main incentive', 'Keep the client happy month to month', 'Grow your sales'],
          ]}
        />
      </Section>

      <Section id="calculator" n={2} title="Compare the cost for your business">
        <p>
          Enter a retainer quote and a performance offer, and the extra sales you expect. The last
          tile shows the scenario owners often forget: a month when sales don’t grow.
        </p>
        <Figure title="Retainer vs performance calculator" example={false}>
          <Calculator
            inputs={[
              {
                id: 'retainer',
                label: 'Monthly retainer quote',
                value: 60000,
                prefix: '৳',
                step: 5000,
              },
              {
                id: 'commission',
                label: 'Performance commission',
                value: 8,
                suffix: '%',
                step: 0.5,
              },
              {
                id: 'extra',
                label: 'Extra sales per month',
                value: 500000,
                prefix: '৳',
                step: 50000,
              },
            ]}
            compute={compareCosts}
          />
        </Figure>
      </Section>

      <Section id="pros-cons" n={3} title="The honest pros and cons">
        <Figure title="Where each model is stronger" example={false}>
          <Versus
            left={{
              title: 'Retainer weaknesses',
              points: [
                'You pay the same for a bad month as a great one',
                'Less pressure on the agency to improve quickly',
                'Hard to tell if the fee is earning its keep',
                'Often paid in advance, before any work is proven',
              ],
            }}
            right={{
              title: 'Performance strengths',
              points: [
                'The agency only earns when you grow',
                'Lower risk when trying a new agency',
                'Targets are agreed and written down upfront',
                'Both sides want the same outcome',
              ],
            }}
          />
        </Figure>
        <p>To be fair to retainers, they can be the better choice when:</p>
        <ul>
          <li>
            You need work that doesn’t lead directly to sales, such as brand awareness or content.
          </li>
          <li>
            Your results depend heavily on things outside the agency’s control, like stock or
            pricing.
          </li>
          <li>You expect very large growth and prefer a capped, predictable cost.</li>
        </ul>
      </Section>

      <PullQuote>
        The question isn’t &quot;what does it cost?&quot; It’s &quot;what does the agency get paid
        for?&quot;
      </PullQuote>

      <Section id="watch" n={4} title="What to watch for in a performance deal">
        <ul>
          <li>
            <strong>How results are measured.</strong> Agree on one source of truth (usually your
            store’s delivered orders), not Ads Manager alone.
          </li>
          <li>
            <strong>The starting point.</strong> Commission should be on growth above your current
            sales, not on sales you would have made anyway.
          </li>
          <li>
            <strong>Who pays for ads.</strong> Ad spend is normally paid by you, directly to Meta,
            from your own ad account.
          </li>
          <li>
            <strong>Minimum terms.</strong> A short trial period is reasonable; long lock-ins are a
            warning sign.
          </li>
        </ul>
        <Callout tone="tip">
          Whatever model you choose, the ad account, Pixel and data should belong to{' '}
          <strong>you</strong>. If you part ways, you keep everything.
        </Callout>
      </Section>

      <Section id="questions" n={5} title="Questions to ask any agency">
        <Figure title="Tick the ones an agency answered clearly" example={false}>
          <Checklist
            items={[
              'What exactly will you be paid for?',
              'What sales target are you committing to?',
              'Whose ad account and Pixel will we use?',
              'How will results be measured and reported?',
              'What happens if targets aren’t met?',
              'Can I see results for similar businesses?',
              'Who will actually manage my account?',
              'How much notice to end the contract?',
            ]}
            verdicts={[
              'Too many open questions. Get answers in writing before signing.',
              'Getting there. Push for clarity on the rest.',
              'This agency is being transparent with you. That’s a good sign.',
            ]}
          />
        </Figure>
      </Section>

      <InlineCta
        title={
          <>
            Hit your sales target first. <em>Then we get paid.</em>
          </>
        }
        body="Muvance works on performance: no retainers and no advance fees. Book a free call to see what target we would commit to for your brand."
      />

      <Section id="faq" n={6} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Why would an agency agree to performance pricing?',
              a: 'Because it’s confident it can grow your sales, and because it can earn more from a successful client than from a fixed fee. It also makes it much easier to win clients who have been let down before.',
            },
            {
              q: 'Is performance pricing more expensive?',
              a: 'Only when results are strong, and then it’s paid from the extra sales. In months without growth, it’s usually cheaper than a retainer.',
            },
            {
              q: 'Can I switch from a retainer agency?',
              a: 'Yes. Make sure you own your ad account and Pixel first, so your data and history move with you.',
            },
          ]}
        />
      </Section>
    </>
  );
}
