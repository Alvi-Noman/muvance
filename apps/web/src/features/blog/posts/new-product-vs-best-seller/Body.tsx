import {
  Callout,
  FaqList,
  Figure,
  InlineCta,
  KeyTakeaways,
  Lead,
  Prose,
  Section,
} from '../../components/article';
import { Checklist, Versus } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        Sales have stalled. Do you launch something new, or push harder on the product that already
        works? Most owners reach for &quot;new&quot; too early.
      </Lead>
      <Prose>
        <p>
          A new product feels exciting and solves boredom, but it splits budget, stock and
          attention. Often there is a lot more growth left in your best seller, with new angles,
          bundles and audiences.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'First squeeze your best seller: new creative angles, bundles, variants.',
            'Launch new products that your current buyers also want.',
            'Test a new product small, with its own budget and clear success numbers.',
            'Keep at least most of your budget on what already works.',
          ]}
        />
      </div>

      <Section id="decide" n={1} title="Push or launch?">
        <Figure title="Signs pointing each way" example={false}>
          <Versus
            left={{
              title: 'Push the best seller',
              points: [
                'You have only tried a few creative angles',
                'Costs rose recently but margins are healthy',
                'Customers still ask about it every day',
              ],
            }}
            right={{
              title: 'Launch something new',
              points: [
                'Dozens of angles tested; costs keep rising',
                'Buyers ask for related products',
                'Repeat buyers have nothing new to buy',
              ],
            }}
          />
        </Figure>
      </Section>

      <Section id="squeeze" n={2} title="Ways to squeeze more from a winner">
        <ul>
          <li>New angles for different buyers: gift, budget, premium, problem-solver.</li>
          <li>Bundles and multi-packs.</li>
          <li>New colours, sizes or scents of the same product.</li>
          <li>Fresh formats: UGC, demo videos, comparison ads.</li>
        </ul>
      </Section>

      <Section id="launch" n={3} title="If you launch, launch carefully">
        <Checklist
          items={[
            'Existing customers have asked for it',
            'The margin can carry ad costs on its own',
            'It has a separate test budget and a deadline',
            'There is enough stock to scale if it works',
            'Creative is ready before launch day',
          ]}
          verdicts={[
            'Too risky right now.',
            'Possible. Fill the gaps first.',
            'Good candidate. Test it.',
          ]}
        />
        <Callout tone="tip">
          Tell your current customers first. Their reaction is the cheapest market research you will
          ever get.
        </Callout>
      </Section>

      <InlineCta
        title="Not sure whether to push or launch?"
        body="Book a free call. We will look at your products and numbers and tell you where we see the most growth."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'How long should I test a new product?',
              a: 'Long enough for several creative tests, usually two to four weeks, with a clear cost-per-purchase target.',
            },
            {
              q: 'Should new products get their own campaign?',
              a: 'Usually yes while testing, so they are not crowded out by your best seller.',
            },
          ]}
        />
      </Section>
    </>
  );
}
