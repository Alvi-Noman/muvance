import {
  Callout,
  FaqList,
  InlineCta,
  KeyTakeaways,
  Lead,
  Prose,
  Section,
  Steps,
} from '../../components/article';
import { Checklist } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        Many Bangladeshi brands source some or all of their products from China. Done well, it gives
        you better margins and products nobody else has. Done badly, it gives you a container of
        stock you cannot sell.
      </Lead>
      <Prose>
        <p>
          This is a practical checklist for the parts that matter most: finding the right supplier,
          checking quality before you pay in full, and planning landed cost honestly.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Order samples from several suppliers before committing.',
            'Calculate landed cost: product, shipping, duties, clearing and local transport.',
            'Inspect quality before final payment, or have someone do it.',
            'Start with a small order, even if the unit price is higher.',
          ]}
        />
      </div>

      <Section id="steps" n={1} title="From idea to stock in hand">
        <Steps
          steps={[
            {
              title: 'Shortlist suppliers',
              body: 'Compare several, check how long they have traded and what other buyers say.',
            },
            {
              title: 'Order samples',
              body: 'From at least two or three suppliers. Test them as a customer would.',
            },
            {
              title: 'Agree specs in writing',
              body: 'Materials, sizes, colours, packaging, labelling and tolerances.',
            },
            {
              title: 'Small first order',
              body: 'Accept a higher unit price to limit risk while you test demand.',
            },
            {
              title: 'Inspect before final payment',
              body: 'Photos, videos or a third-party inspection of the actual production.',
            },
            {
              title: 'Plan shipping and clearing',
              body: 'Air for speed and small volumes, sea for cost and bigger orders.',
            },
          ]}
        />
      </Section>

      <Section id="landed" n={2} title="Know your landed cost">
        <p>
          The factory price is only the start. Add international shipping, import duties and taxes,
          clearing and forwarding fees, local transport and any losses from damaged items. Then
          check that your selling price still leaves room for ads, delivery and returns.
        </p>
        <Callout tone="warning" title="Check import rules first">
          Some products need permits or face high duties in Bangladesh. Check with a clearing agent
          before you order, not when the goods arrive at port.
        </Callout>
      </Section>

      <Section id="check" n={3} title="Before you send the deposit">
        <Checklist
          items={[
            'Samples tested by real users',
            'Specs and packaging agreed in writing',
            'Landed cost calculated, with a margin that works',
            'Inspection planned before final payment',
            'Import rules for this product checked',
          ]}
          verdicts={[
            'Too risky. Slow down.',
            'Close. Close the gaps first.',
            'Ready to place a first order.',
          ]}
        />
      </Section>

      <InlineCta
        title="Want help with sourcing?"
        body="Product sourcing is part of our operational support. Book a free call to talk through what you want to make."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'How do I find reliable suppliers?',
              a: 'Compare several, order samples, start small and build the relationship over a few orders before trusting big ones.',
            },
            {
              q: 'Should I add my own branding?',
              a: 'Yes, once a product proves itself. Branded packaging and labels make you harder to copy and easier to remember.',
            },
          ]}
        />
      </Section>
    </>
  );
}
