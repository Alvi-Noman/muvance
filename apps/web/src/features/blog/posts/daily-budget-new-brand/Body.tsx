import {
  Callout,
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
import { Calculator, Flow } from '../../components/viz';
import { taka } from '../../components/format';

function budget(v: Record<string, number>) {
  const price = v.price ?? 0;
  const margin = (v.margin ?? 0) / 100;
  const cpa = v.cpa || 1;
  const breakEven = price * margin;
  return [
    { label: 'Break-even cost per purchase', value: taka(breakEven) },
    { label: 'Daily budget to learn fast (50/week)', value: taka((cpa * 50) / 7), dark: true },
    { label: 'Minimum to start (10/week)', value: taka((cpa * 10) / 7) },
  ];
}

export function Body() {
  return (
    <>
      <Lead>
        &quot;How much should I spend per day?&quot; There’s no magic number, but there is a
        sensible one for your business. You can work it out from your price, your margin and a guess
        at your cost per sale.
      </Lead>
      <Prose>
        <p>
          New brands usually get this wrong in one of two ways. Some spend ৳500 a day and conclude
          &quot;Facebook ads don’t work&quot; after a week, when the campaign never had enough data
          to learn anything. Others go big on day one, before they know which product or ad sells,
          and burn through cash.
        </p>
        <p>The middle path is to start with enough to learn, prove what works, then scale.</p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Your budget needs to buy enough purchases for Meta to learn. Ideally around 50 a week per ad set.',
            'If that’s out of reach, start smaller, but expect a slower, bumpier learning period.',
            'Know your break-even cost per purchase before you spend a taka.',
            'Spend in three phases: test, prove, then scale.',
          ]}
        />
      </div>

      <Section id="calc" n={1} title="Work out your starting budget">
        <p>
          You need three numbers. Your average order price, your margin after product and delivery
          costs, and a guess at cost per purchase. If you’ve no idea, a third to a half of your
          margin is a reasonable first guess.
        </p>
        <Figure title="Starting budget calculator" example={false}>
          <Calculator
            inputs={[
              { id: 'price', label: 'Average order value', value: 1800, prefix: '৳', step: 100 },
              { id: 'margin', label: 'Margin after product + delivery', value: 45, suffix: '%' },
              { id: 'cpa', label: 'Expected cost per purchase', value: 350, prefix: '৳', step: 25 },
            ]}
            compute={budget}
          />
        </Figure>
        <Callout tone="warning">
          If your expected cost per purchase is above break-even, ads will lose money on the first
          order. That can still work if customers reorder, but go in knowing it, and fix price or
          margin if you can.
        </Callout>
      </Section>

      <Section id="phases" n={2} title="Spend in three phases">
        <Figure title="From first taka to scaling" example={false}>
          <Flow
            nodes={[
              {
                title: 'Test (2–3 weeks)',
                body: 'Small budget. Find which product and ad get sales at all.',
              },
              {
                title: 'Prove (2–4 weeks)',
                body: 'Budget for ~50 purchases a week. Confirm a steady cost per purchase.',
                highlight: true,
              },
              { title: 'Scale', body: 'Raise budget in steps while cost stays below your limit.' },
            ]}
          />
        </Figure>
      </Section>

      <PullQuote>
        A small budget isn’t the problem. Spreading a small budget across ten things is.
      </PullQuote>

      <Section id="small" n={3} title="If your budget is small">
        <p>
          Totally fine. You just have to be more focused. Here’s how we’d approach a tight budget:
        </p>
        <Steps
          steps={[
            {
              title: 'One campaign, one ad set',
              body: 'Don’t split. Every purchase should help the same ad set learn.',
            },
            {
              title: 'Your best-selling product',
              body: 'Advertise the one thing most likely to sell, not the whole catalogue.',
            },
            {
              title: '3–5 strong ads',
              body: 'Enough variety for Meta to choose, without spreading thin.',
            },
            { title: 'Leave it alone', body: 'Give it 7 days without changes before judging.' },
            {
              title: 'Track every order',
              body: 'Make sure Purchase is set up properly, ideally with the Conversions API.',
            },
          ]}
        />
        <Callout tone="local">
          For a COD business, remember that your real cost per purchase is higher than Ads Manager
          shows, because some orders never get delivered. Factor your failure rate into your budget.
        </Callout>
      </Section>

      <InlineCta
        title="Not sure how much to start with?"
        body="On a free call we’ll look at your products and margins and suggest a budget that gives your ads a real chance."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Can I start with ৳500 a day?',
              a: 'You can, but you’ll learn slowly. Focus everything on one product and one ad set, and judge results over two to three weeks rather than days.',
            },
            {
              q: 'Should I boost posts instead?',
              a: 'Boosting is simple but gives you less control and weaker optimisation for sales. A proper sales campaign is usually better value.',
            },
            {
              q: 'When should I increase the budget?',
              a: 'Once your cost per purchase has been steady and below your limit for at least a week. Then raise it gradually.',
            },
          ]}
        />
      </Section>
    </>
  );
}
