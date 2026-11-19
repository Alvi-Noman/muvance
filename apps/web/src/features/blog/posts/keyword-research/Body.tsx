import {
  Callout,
  CompareTable,
  FaqList,
  Figure,
  InlineCta,
  Lead,
  Section,
} from '../../components/article';
import { BarList } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        You call it a “crossbody sling”. Your customers search for “chhoto side bag for girls”.
        Guess which one Google shows them.
      </Lead>
      <Section id="sources" n={1} title="Free places to find keywords">
        <ul>
          <li>
            <strong>Google autocomplete.</strong> Start typing your product and note the
            suggestions.
          </li>
          <li>
            <strong>People also ask</strong> and related searches at the bottom of results.
          </li>
          <li>
            <strong>Search Console.</strong> Once your site is live, it shows the searches you
            already appear for.
          </li>
          <li>
            <strong>Your inbox.</strong> How customers describe products in messages is how they
            search.
          </li>
          <li>
            <strong>Marketplaces.</strong> Search suggestions on Daraz and similar sites show buying
            language.
          </li>
          <li>
            <strong>Google Keyword Planner.</strong> Free with a Google Ads account, gives rough
            volumes.
          </li>
        </ul>
      </Section>
      <Section id="languages" n={2} title="Handling three languages">
        <CompareTable
          columns={['Search style', 'Example', 'Where it fits']}
          rows={[
            ['English', '“men’s leather wallet”', 'Category and product pages'],
            ['Bangla', '“চামড়ার মানিব্যাগ”', 'Pages and guides aimed at Bangla readers'],
            ['Banglish', '“original leather wallet price in bd”', 'Titles, FAQs, product text'],
          ]}
        />
        <Callout tone="local">
          “Price in BD” and “price in Bangladesh” are extremely common add-ons. If you show prices,
          include that phrasing naturally on product and category pages.
        </Callout>
      </Section>
      <Section id="choose" n={3} title="Choosing which to target">
        <Figure
          title="Scoring keywords for a small store (example)"
          caption="High buying intent and low competition first, even if volume is smaller."
        >
          <BarList
            items={[
              {
                label: '“leather wallet price in bd”',
                value: 9,
                note: 'High intent, moderate competition',
                tone: 'accent',
              },
              {
                label: '“best wallet for men”',
                value: 7,
                note: 'Comparison intent, good for a guide',
                tone: 'ink',
              },
              { label: '“wallet”', value: 3, note: 'Huge, vague, very competitive', tone: 'warm' },
              {
                label: '“how to clean leather wallet”',
                value: 5,
                note: 'Low intent, builds trust',
                tone: 'muted',
              },
            ]}
          />
        </Figure>
        <p>
          Group keywords that mean the same thing onto one page. “Leather wallet for men” and “men’s
          leather wallet” do not need separate pages.
        </p>
      </Section>
      <InlineCta
        title="Want a keyword list for your store?"
        body="Book a free call. We will show you the searches worth going after."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Should I make separate Bangla pages?',
              a: 'If a large share of your customers search in Bangla, yes. Make them genuinely useful, not machine translations.',
            },
            {
              q: 'Are paid keyword tools worth it?',
              a: 'Helpful once SEO is a real channel for you. Free sources are enough to start.',
            },
          ]}
        />
      </Section>
    </>
  );
}
