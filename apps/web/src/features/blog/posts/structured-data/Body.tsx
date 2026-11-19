import {
  Callout,
  Code,
  CompareTable,
  FaqList,
  InlineCta,
  Lead,
  Section,
} from '../../components/article';

export function Body() {
  return (
    <>
      <Lead>
        Structured data is a small block of code that says “this is a product, this is its price,
        this is its rating” in a language search engines read directly.
      </Lead>
      <Section id="types" n={1} title="The types that matter most">
        <CompareTable
          columns={['Type', 'Goes on', 'Can help with']}
          rows={[
            ['Product', 'Product pages', 'Price, stock and stars in search results'],
            ['Organization', 'Home or about page', 'Brand name, logo, contact details'],
            ['BreadcrumbList', 'Most pages', 'Cleaner paths shown in results'],
            ['FAQPage', 'Pages with real FAQs', 'Clear question-and-answer content'],
            ['Article', 'Blog posts', 'Author and date information'],
          ]}
        />
      </Section>
      <Section id="example" n={2} title="What it looks like">
        <p>
          Most platforms and SEO plugins add it for you. Under the hood, it is usually JSON-LD, like
          this simplified product:
        </p>
        <Code title="JSON-LD">
          {
            '{\n  "@context": "https://schema.org",\n  "@type": "Product",\n  "name": "Cotton Panjabi, White",\n  "offers": {\n    "@type": "Offer",\n    "price": "2450",\n    "priceCurrency": "BDT",\n    "availability": "https://schema.org/InStock"\n  }\n}'
          }
        </Code>
      </Section>
      <Section id="check" n={3} title="Checking it works">
        <ul>
          <li>Test a page with Google’s Rich Results Test.</li>
          <li>Watch the Enhancements reports in Search Console for errors.</li>
          <li>
            Make sure the data matches what the page shows. Mismatched prices can cause problems.
          </li>
        </ul>
        <Callout tone="warning">
          Rich results are never guaranteed. Google decides when to show stars or prices. Correct
          markup just makes it possible.
        </Callout>
      </Section>
      <InlineCta
        title="Not sure if your markup is right?"
        body="Book a free call. We will test a few pages with you."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Does structured data improve rankings directly?',
              a: 'Not directly. It helps understanding and can make your result more attractive, which helps clicks.',
            },
            {
              q: 'Can I add review stars from Facebook?',
              a: 'Product review markup should reflect reviews shown on your own page.',
            },
          ]}
        />
      </Section>
    </>
  );
}
