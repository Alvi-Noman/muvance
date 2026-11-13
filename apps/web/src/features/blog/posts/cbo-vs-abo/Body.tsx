import { Wallet } from 'lucide-react';
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
  Steps,
} from '../../components/article';
import { BarList, Flow } from '../../components/viz';
import { taka } from '../../components/format';

export function Body() {
  return (
    <>
      <Lead>
        Should you set the budget on the campaign and let Meta share it out, or on each ad set
        yourself? The answer depends on whether you’re testing or scaling.
      </Lead>
      <Prose>
        <p>
          <strong>CBO</strong> (campaign budget optimisation, now called{' '}
          <strong>Advantage campaign budget</strong>) puts one budget on the campaign. Meta moves
          money between ad sets towards the best results. <strong>ABO</strong> (ad set budget
          optimisation) gives each ad set its own fixed budget. Both are useful. They just do
          different jobs.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'CBO: one budget, Meta decides where it goes. Best for scaling proven ads.',
            'ABO: fixed budget per ad set. Best for controlled tests.',
            'Under CBO, uneven spend is normal. It’s Meta backing what it predicts will win.',
            'Use ad set spend limits in CBO when one ad set must get a minimum or maximum.',
          ]}
        />
      </div>

      <Section id="how" n={1} title="How the money moves">
        <Figure title="CBO: one pot, shared out by predicted results" example={false}>
          <Flow
            nodes={[
              {
                title: 'Campaign budget',
                body: '৳20,000 a day',
                icon: <Wallet className="size-5" />,
                highlight: true,
              },
              { title: 'Ad set A', body: 'Predicted best: gets most of it' },
              { title: 'Ad set B', body: 'Some spend' },
              { title: 'Ad set C', body: 'Little spend unless it improves' },
            ]}
          />
        </Figure>
        <Figure
          title="How ৳20,000 a day might be split"
          caption="Under ABO, each ad set gets its fixed share no matter how it performs. Under CBO, money follows results."
        >
          <BarList
            items={[
              {
                label: 'CBO: ad set A',
                value: 12500,
                tone: 'ink',
                note: 'Strongest predicted results, so it gets most of the budget.',
              },
              {
                label: 'CBO: ad set B',
                value: 5500,
                tone: 'ink',
                note: 'Decent results: a steady share.',
              },
              {
                label: 'CBO: ad set C',
                value: 2000,
                tone: 'ink',
                note: 'Weaker results: Meta holds back.',
              },
              {
                label: 'ABO: each ad set',
                value: 6667,
                tone: 'warm',
                note: 'Equal split, whatever the results. Good for fair tests, wasteful for scaling.',
              },
            ]}
            format={taka}
          />
        </Figure>
      </Section>

      <Section id="compare" n={2} title="Side by side">
        <CompareTable
          columns={['', 'CBO (Advantage campaign budget)', 'ABO (ad set budgets)']}
          rows={[
            ['Budget set on', 'The campaign', 'Each ad set'],
            ['Who decides the split', 'Meta, in real time', 'You'],
            ['Best for', 'Scaling what works', 'Testing new audiences or concepts'],
            ['Risk', 'A new ad set may get almost no spend', 'Money keeps going to weak ad sets'],
            ['Management time', 'Low', 'Higher: you move budgets by hand'],
          ]}
        />
      </Section>

      <PullQuote>
        Test with ABO so every idea gets a fair chance. Scale with CBO so the money follows the
        winners.
      </PullQuote>

      <Section id="setup" n={3} title="A simple setup that uses both">
        <Steps
          steps={[
            {
              title: 'Testing campaign: ABO',
              body: 'One ad set per concept or audience, each with the same small budget, so results are comparable.',
            },
            {
              title: 'Scaling campaign: CBO',
              body: 'Move proven winners here. Give it most of your budget.',
            },
            {
              title: 'Use spend limits sparingly',
              body: 'In CBO, set a minimum on an ad set only when it must get spend (for example a new product launch).',
            },
            {
              title: 'Review weekly',
              body: 'Promote winners from testing to scaling, and switch off losers in both.',
            },
          ]}
        />
        <Callout tone="tip">
          If one ad set gets no spend under CBO, don’t panic. It usually means Meta predicts it will
          perform worse. If you need to know for sure, test it separately with ABO.
        </Callout>
      </Section>

      <InlineCta
        title="Want a testing and scaling setup built for you?"
        body="We set up both campaigns, run the tests and move the winners. Book a free call to see how it would work."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Can I switch an existing campaign from ABO to CBO?',
              a: 'Meta allows some switching, but it can restart learning. It’s often cleaner to build a new CBO campaign with your winners.',
            },
            {
              q: 'How many ad sets should a CBO campaign have?',
              a: 'Fewer than most people think. Two to four ad sets is plenty for most budgets; more just splits the data.',
            },
            {
              q: 'Is ABO outdated?',
              a: 'No. It’s still the best tool for fair, controlled tests. It’s just not the best way to scale.',
            },
          ]}
        />
      </Section>
    </>
  );
}
