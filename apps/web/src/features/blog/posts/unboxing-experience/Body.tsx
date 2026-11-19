import { Link } from 'react-router';
import { Callout, CompareTable, FaqList, InlineCta, Lead, Section } from '../../components/article';

export function Body() {
  return (
    <>
      <Lead>
        A plain polythene bag says “marketplace seller”. A simple branded box with a note says
        “brand”.
      </Lead>
      <Section id="basics" n={1} title="Get the basics right first">
        <ul>
          <li>The product arrives undamaged. Strong packaging beats pretty packaging.</li>
          <li>It is easy to open.</li>
          <li>Size and fit information is inside, for exchanges.</li>
        </ul>
      </Section>
      <Section id="ideas" n={2} title="Affordable touches">
        <CompareTable
          columns={['Idea', 'Cost', 'Effect']}
          rows={[
            ['Branded sticker on a plain box', 'Low', 'Looks intentional'],
            ['Thank-you card with a handwritten line', 'Low', 'Feels personal'],
            ['Care or how-to card', 'Low', 'Fewer complaints, more value'],
            ['QR code to reorder or join the list', 'Low', 'Repeat sales'],
            ['Small sample or gift', 'Medium', 'Cross-sell and delight'],
          ]}
        />
        <Callout tone="tip">
          Ask customers to tag you if they share their unboxing. Those posts are free social proof
          and possible ad content, with permission.
        </Callout>
      </Section>
      <Section id="balance" n={3} title="Keep costs in check">
        <p>
          Add packaging cost to your{' '}
          <Link to="/blog/unit-economics-online-store">unit economics</Link>. A ৳30 upgrade on a
          ৳600 product is significant. Start with the cheapest touches and see whether reviews and
          repeat orders improve.
        </p>
      </Section>
      <InlineCta
        title="Want help designing your packaging?"
        body="Book a free call. Brand strategy and creative are part of what we do."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Is eco-friendly packaging worth it?',
              a: 'For many audiences it builds goodwill. Make sure it still protects the product.',
            },
            {
              q: 'Should I include a discount for the next order?',
              a: 'It can work. A useful card or gift often builds more loyalty.',
            },
          ]}
        />
      </Section>
    </>
  );
}
