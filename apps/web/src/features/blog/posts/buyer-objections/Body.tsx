import {
  Callout,
  CompareTable,
  FaqList,
  InlineCta,
  KeyTakeaways,
  Lead,
  Section,
} from '../../components/article';
import { Flow } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        Every visitor who leaves without buying had a reason. Usually it is one of the same six
        doubts.
      </Lead>
      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Find your biggest doubt from messages, calls and reviews.',
            'Answer it where it appears: in the ad, near the price or at checkout.',
            'Proof beats promises. Show, don’t just say.',
          ]}
        />
      </div>
      <Section id="six" n={1} title="The six doubts">
        <CompareTable
          columns={['Doubt', 'What they think', 'What answers it']}
          rows={[
            [
              'Price',
              '“Is it worth this much?”',
              'Compare with alternatives, show what is included, cost per use',
            ],
            ['Trust', '“Is this shop real?”', 'Reviews with photos, address, phone number, COD'],
            ['Fit', '“Will it suit me?”', 'Size guide, model sizes, easy exchange'],
            ['Quality', '“Will it look like the photo?”', 'Real photos, unboxing video, close-ups'],
            ['Timing', '“Will it arrive in time?”', 'Clear delivery days by area'],
            ['Later', '“I’ll think about it”', 'A real reason to act now, reminder ads'],
          ]}
        />
      </Section>
      <Section id="where" n={2} title="Answer it at the right moment">
        <p>
          A doubt should be answered close to where it pops up. Trust doubts appear the moment
          someone lands on an unknown store. Fit doubts appear when choosing a size. Price doubts
          appear at the price.
        </p>
        <Flow
          nodes={[
            { title: 'Ad', body: 'Quality and trust' },
            { title: 'Product page', body: 'Fit, price, quality' },
            { title: 'Checkout', body: 'Delivery, payment, returns', highlight: true },
            { title: 'After order', body: 'Confirmation call' },
          ]}
        />
      </Section>
      <Section id="test" n={3} title="Test the answers">
        <p>
          Pick the biggest doubt and test one answer for two weeks. For example, add a “Will it fit
          me?” block with real customer heights and sizes. Watch the add-to-cart rate and
          size-related exchanges.
        </p>
        <Callout tone="warning">
          Fake urgency (“only 2 left” that never changes) answers the “later” doubt once, then
          destroys trust. Use real reasons: a real end date, a restock, a season.
        </Callout>
      </Section>
      <InlineCta
        title="Want to know what doubt is costing you sales?"
        body="Book a free call. We will look at your page and messages with fresh eyes."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'How do I know which doubt matters most?',
              a: 'Count the questions in your inbox and the reasons on cancellation calls. The biggest pile wins.',
            },
            {
              q: 'Should I lower my price to beat the price doubt?',
              a: 'Try explaining value first. A price cut is easy to make and hard to undo.',
            },
          ]}
        />
      </Section>
    </>
  );
}
