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
import { Checklist, Versus } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        At first, packing orders in a spare room is fine. Then one good sales week arrives, parcels
        go out late, stock counts are wrong, and the founder spends every evening taping boxes.
      </Lead>
      <Prose>
        <p>
          Outsourcing warehousing and packing (often called fulfilment) frees your time and makes
          growth smoother. But it costs money and needs a good partner. Here is how to decide.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Outsource when packing takes more of your time than growing the business.',
            'Compare the full cost: rent, staff, mistakes and your own hours.',
            'Good fulfilment means accurate stock, fast dispatch and careful packing.',
            'Start with part of your products, then move the rest.',
          ]}
        />
      </div>

      <Section id="compare" n={1} title="In-house vs outsourced">
        <Versus
          left={{
            title: 'Doing it yourself',
            points: [
              'Full control over packing',
              'Slows down as orders grow',
              'Your time goes to tape and boxes',
              'Stock mistakes are common',
            ],
          }}
          right={{
            title: 'Outsourced fulfilment',
            points: [
              'Scales with busy seasons',
              'Same-day dispatch becomes possible',
              'Clear stock counts',
              'You focus on products and growth',
            ],
          }}
        />
      </Section>

      <Section id="ready" n={2} title="Are you ready to outsource?">
        <Checklist
          items={[
            'Orders regularly go out late in busy weeks',
            'Someone senior spends hours a day packing',
            'Stock counts are often wrong',
            'You are running out of space',
            'You plan to scale ads in the next few months',
          ]}
          verdicts={[
            'Keep doing it yourself for now.',
            'Start planning; it is coming.',
            'Time to outsource.',
          ]}
        />
      </Section>

      <Section id="how" n={3} title="Moving over smoothly">
        <Steps
          steps={[
            {
              title: 'Count everything',
              body: 'Start with an accurate stock count so the numbers are right from day one.',
            },
            {
              title: 'Write packing standards',
              body: 'Box sizes, inserts, how fragile items are wrapped, what goes in the parcel.',
            },
            {
              title: 'Move part first',
              body: 'Start with best sellers, check accuracy for a few weeks, then move the rest.',
            },
            {
              title: 'Track mistakes',
              body: 'Wrong items, damage and late dispatch. Review them weekly with your partner.',
            },
          ]}
        />
        <Callout tone="tip" title="Packaging is marketing">
          Unboxing is the first physical moment with your brand. A thank-you card and neat packing
          cost little and earn reorders and reviews.
        </Callout>
      </Section>

      <InlineCta
        title="Want warehousing handled for you?"
        body="Warehousing and dispatch are part of our operational support. Book a free call to talk it through."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Is outsourcing more expensive?',
              a: 'Per parcel, often yes. Counting your time, mistakes and late deliveries, it is often cheaper once you have steady volume.',
            },
            {
              q: 'Can I still do custom packaging?',
              a: 'Usually, yes. Agree it upfront and include it in the packing standards.',
            },
          ]}
        />
      </Section>
    </>
  );
}
