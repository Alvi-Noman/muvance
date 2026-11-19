import {
  Callout,
  CompareTable,
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
        Sooner or later every growing store asks: should we hire our own media buyer, use a
        freelancer, or bring in an agency? Each one can work. Each one fails in its own way.
      </Lead>
      <Prose>
        <p>
          The honest answer depends on your stage, your budget and how much else needs fixing. Here
          is how to think it through.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'A freelancer is cheapest to start, but you depend on one person.',
            'In-house gives control, but one person rarely covers creative, tracking and ads.',
            'An agency brings a team and systems, if you pick the right one.',
            'Many brands use an agency first, then build in-house once they scale.',
          ]}
        />
      </div>

      <Section id="compare" n={1} title="The three options side by side">
        <CompareTable
          columns={['', 'Strengths', 'Watch out for']}
          rows={[
            [
              'Freelancer',
              'Low cost, flexible, quick to start',
              'One person, limited creative, can disappear',
            ],
            [
              'In-house buyer',
              'Knows your brand deeply, full control',
              'Hard to hire well, needs creative and tools around them',
            ],
            [
              'Agency',
              'A team: strategy, creative, tracking, ads',
              'You may be one of many clients; quality varies',
            ],
          ]}
        />
      </Section>

      <Section id="stage" n={2} title="What usually fits each stage">
        <Steps
          steps={[
            {
              title: 'Just starting',
              body: 'Learn the basics yourself or use a good freelancer. Keep spend small while you find a product people want.',
            },
            {
              title: 'Product works, growth stalls',
              body: 'This is where an agency often helps most: creative, tracking and testing all at once.',
            },
            {
              title: 'Scaling hard',
              body: 'An agency plus someone in-house who owns the numbers and works closely with them.',
            },
            {
              title: 'Large brand',
              body: 'A full in-house team, sometimes with specialists brought in for specific jobs.',
            },
          ]}
        />
        <Callout tone="local" title="In Bangladesh specifically">
          Good media buyers are in high demand, and many juggle several clients on the side. If you
          hire in-house, be clear about exclusivity and pay well enough to keep them.
        </Callout>
      </Section>

      <Section id="test" n={3} title="Are you ready to hire in-house?">
        <p>Tick what is true for your business today:</p>
        <Checklist
          items={[
            'We can pay a full salary even in a slow month',
            'We have someone to make new creative every week',
            'Our tracking (Pixel + Conversions API) already works',
            'Someone senior can review the buyer’s decisions',
            'We spend enough on ads to keep one person busy',
          ]}
          verdicts={[
            'Not yet. A freelancer or agency is likely a better fit.',
            'Close. Fix the gaps first, or start with an agency.',
            'You are ready to build in-house.',
          ]}
        />
      </Section>

      <InlineCta
        title="Not sure which fits you?"
        body="Book a free call. We will tell you honestly whether you need an agency, a freelancer or your own team right now."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Can I start with an agency and move in-house later?',
              a: 'Yes, and it is common. Make sure your ad account, Pixel and page stay in your name, so moving is easy.',
            },
            {
              q: 'Is a freelancer enough for a growing store?',
              a: 'Sometimes. The usual limit is creative: one person rarely has time to make enough new ads and manage campaigns well.',
            },
            {
              q: 'What should an in-house media buyer own?',
              a: 'Campaigns, testing plan, budget moves and reporting. Creative production and tracking usually need extra help.',
            },
          ]}
        />
      </Section>
    </>
  );
}
