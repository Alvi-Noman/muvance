import { Callout, FaqList, Figure, InlineCta, Lead, Section } from '../../components/article';
import { BarList } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        “Ladies sandals” gets searched far more than any single sandal. The page that ranks for it
        is a category page.
      </Lead>
      <Section id="why" n={1} title="Why category pages matter">
        <p>
          Category searches are broad and early in the journey, with lots of volume. A strong
          category page captures that traffic and lets people browse to the right product.
        </p>
        <Figure title="Where search visits land on a typical store (example)">
          <BarList
            items={[
              { label: 'Category pages', value: 46, tone: 'accent' },
              { label: 'Product pages', value: 34, tone: 'ink' },
              { label: 'Home page', value: 12, tone: 'ink' },
              { label: 'Blog and guides', value: 8, tone: 'muted' },
            ]}
            format={(v) => `${v}%`}
          />
        </Figure>
      </Section>
      <Section id="structure" n={2} title="Structure that helps">
        <ul>
          <li>Name categories the way people search: “Men’s Panjabi”, not “Collection 3”.</li>
          <li>Go one level deeper when there is demand: “Cotton Panjabi”, “Eid Panjabi”.</li>
          <li>Use clean URLs like /mens-panjabi.</li>
          <li>Link to categories from the menu and from related products.</li>
        </ul>
      </Section>
      <Section id="text" n={3} title="Add a little useful text">
        <p>
          A short introduction above the products and a few FAQs below give Google context and help
          shoppers. Keep the top short so products are visible quickly on a phone.
        </p>
        <Callout tone="warning">
          Filter pages (colour, size, price) can create thousands of near-duplicate URLs. Make sure
          your platform does not let them all get indexed.
        </Callout>
      </Section>
      <InlineCta
        title="Want your store structure checked?"
        body="Book a free call. We will look at your categories and suggest a cleaner setup."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'How much text should a category page have?',
              a: 'A short intro and a few FAQs is usually enough. Usefulness matters more than length.',
            },
            {
              q: 'Should seasonal categories stay live?',
              a: 'Yes. An “Eid collection” page that stays live builds strength year after year.',
            },
          ]}
        />
      </Section>
    </>
  );
}
