import { Link } from 'react-router';
import { Callout, CompareTable, FaqList, InlineCta, Lead, Section } from '../../components/article';

export function Body() {
  return (
    <>
      <Lead>
        A marketplace is a busy mall where you rent a stall. Your own site is a shop on your own
        street.
      </Lead>
      <Section id="compare" n={1} title="Side by side">
        <CompareTable
          columns={['', 'Marketplace', 'Own website']}
          rows={[
            ['Traffic', 'Built in, shoppers already searching', 'You bring it, usually with ads'],
            ['Fees', 'Commission and other charges', 'Platform, payment and hosting costs'],
            ['Customer data', 'Mostly kept by the marketplace', 'Yours'],
            ['Brand', 'You look like one of many sellers', 'Full control'],
            ['Price pressure', 'High; easy comparison', 'Lower'],
          ]}
        />
      </Section>
      <Section id="when" n={2} title="Which fits when">
        <ul>
          <li>
            <strong>Marketplace first</strong> if you sell commodity items people search for by
            name, or want to test demand cheaply.
          </li>
          <li>
            <strong>Own site first</strong> if you are building a brand, need repeat customers, or
            sell through ads and content.
          </li>
          <li>
            <strong>Both</strong> is common: marketplace for reach, own site for loyal customers and
            better margins.
          </li>
        </ul>
        <Callout tone="tip">
          Put a card in marketplace parcels inviting customers to your own channels (where the
          marketplace rules allow it).
        </Callout>
      </Section>
      <Section id="numbers" n={3} title="Compare on profit, not revenue">
        <p>
          Work out profit per order on each channel after fees, ads, delivery and returns. See{' '}
          <Link to="/blog/unit-economics-online-store">unit economics</Link>. A channel with more
          orders can still make you less money.
        </p>
      </Section>
      <InlineCta
        title="Not sure where to sell?"
        body="Book a free call. We will compare your channels with you."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Can I run Meta ads to my marketplace store?',
              a: 'You can, but tracking is limited and the customer data stays with the marketplace.',
            },
            {
              q: 'Do I need a website if I sell on Facebook?',
              a: (
                <>
                  Not always. See{' '}
                  <Link to="/blog/website-vs-facebook-page-bangladesh">
                    website vs Facebook page
                  </Link>
                  .
                </>
              ),
            },
          ]}
        />
      </Section>
    </>
  );
}
