import { Link } from 'react-router';
import { Callout, CompareTable, FaqList, InlineCta, Lead, Section } from '../../components/article';
import { Checklist } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        Most product pages have a photo, a price and a two-word description copied from the
        supplier. Google has very little to work with.
      </Lead>
      <Section id="checklist" n={1} title="The product page checklist">
        <Checklist
          items={[
            'A title that includes what it is and a key detail (material, size, use)',
            'A meta description that reads like a mini ad',
            'Your own description, not the supplier’s copy',
            'Several real photos with descriptive file names and alt text',
            'Price, stock and delivery information on the page',
            'Customer reviews visible on the page',
            'A short FAQ answering real questions',
            'Product structured data (price, availability, reviews)',
          ]}
          verdicts={[
            'Google is guessing. Start with titles and descriptions.',
            'Good base. Fill the gaps.',
            'Strong. Now work on links and content.',
          ]}
        />
      </Section>
      <Section id="titles" n={2} title="Writing titles people click">
        <CompareTable
          columns={['Weak', 'Better', 'Why']}
          rows={[
            [
              'Bag-002',
              'Waterproof Laptop Backpack 15.6" with USB Port',
              'Says what it is and why it matters',
            ],
            [
              'Kurti Blue',
              'Blue Cotton Kurti with Hand Block Print',
              'Material and style people search for',
            ],
            [
              'Serum 30ml',
              'Niacinamide 10% Serum for Oily Skin, 30 ml',
              'Ingredient and skin type',
            ],
          ]}
        />
      </Section>
      <Section id="unique" n={3} title="Why copied descriptions hurt">
        <p>
          If ten stores use the same supplier text, Google has little reason to rank yours. Write
          two or three paragraphs in your own words: who it is for, how it feels or performs, how to
          use it, what it comes with. That same text also helps people buy. See{' '}
          <Link to="/blog/write-product-descriptions-that-sell">
            product descriptions that sell
          </Link>
          .
        </p>
        <Callout tone="tip">
          Out-of-stock products with good rankings: keep the page live with a “back soon” note and
          links to similar items, instead of deleting it.
        </Callout>
      </Section>
      <InlineCta
        title="Want your product pages reviewed?"
        body="Book a free call. We will check a few pages and show you quick wins."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Do I need a description for every variant?',
              a: 'No. Variants like colour usually share one page.',
            },
            {
              q: 'Does adding reviews help SEO?',
              a: 'Indirectly, yes: fresh, useful text and better click rates when stars show in results.',
            },
          ]}
        />
      </Section>
    </>
  );
}
