import {
  Callout,
  CompareTable,
  FaqList,
  InlineCta,
  KeyTakeaways,
  Lead,
  Prose,
  Section,
} from '../../components/article';
import { Checklist } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        Your courier is part of your product. A late, rude or careless delivery turns a happy buyer
        into a refused parcel and a bad review, no matter how good your ads were.
      </Lead>
      <Prose>
        <p>
          Bangladesh has several established courier services for eCommerce, and their strengths
          differ by area, speed and payout terms. Rates change often, so instead of listing them,
          here is what to compare and what to ask.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Compare delivery success rate, not just price per parcel.',
            'Payout speed matters for cash flow as much as rates.',
            'Coverage outside Dhaka varies a lot between couriers.',
            'Many growing stores use two couriers: one main, one backup.',
          ]}
        />
      </div>

      <Section id="compare" n={1} title="What to compare">
        <CompareTable
          columns={['Factor', 'Why it matters', 'Ask them']}
          rows={[
            [
              'Delivery success rate',
              'Failed deliveries cost twice',
              'What share of COD parcels get delivered in my area?',
            ],
            ['Speed', 'Slow delivery raises refusals', 'Typical days inside and outside Dhaka?'],
            ['COD payout', 'Cash flow', 'How often do you pay out, and how fast?'],
            [
              'Return handling',
              'Lost returns are lost stock',
              'How are returns tracked and how long do they take?',
            ],
            ['Integration', 'Saves hours every day', 'Does it connect to my store platform?'],
            ['Support', 'Problems need fast answers', 'Who do I call when a parcel is stuck?'],
          ]}
        />
      </Section>

      <Section id="test" n={2} title="Run a small trial">
        <p>
          Send a few weeks of parcels with a new courier to a mix of areas, and track the results
          yourself: delivered, refused, late, damaged. Your own numbers beat any sales pitch.
        </p>
        <Callout tone="tip" title="Split by area">
          One courier may be best in Dhaka and another outside it. Choosing by area can lift your
          overall delivery rate.
        </Callout>
      </Section>

      <Section id="check" n={3} title="Before you sign">
        <Checklist
          items={[
            'I know their delivery success rate in my main areas',
            'Payout schedule is in writing',
            'Return process is clear',
            'It connects to my store or order system',
            'I have a named support contact',
          ]}
          verdicts={[
            'Too many unknowns. Ask more.',
            'Promising. Clarify the rest.',
            'Ready for a trial.',
          ]}
        />
      </Section>

      <InlineCta
        title="Deliveries holding back your growth?"
        body="Our operational support covers warehousing, dispatch and courier management. Book a free call to talk it through."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Is the cheapest courier the best choice?',
              a: 'Rarely on its own. A few taka saved per parcel is nothing next to a lower delivery success rate.',
            },
            {
              q: 'Should I offer same-day delivery in Dhaka?',
              a: 'It can raise conversion and lower refusals, if the extra cost fits your margins. Test it.',
            },
          ]}
        />
      </Section>
    </>
  );
}
