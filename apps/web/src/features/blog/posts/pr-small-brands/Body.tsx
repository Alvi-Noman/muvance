import { Link } from 'react-router';
import { Callout, FaqList, InlineCta, Lead, Section, Steps } from '../../components/article';

export function Body() {
  return (
    <>
      <Lead>
        “New online shop opens” is not a story. “Two sisters revive a dying weaving craft through
        Instagram” might be.
      </Lead>
      <Section id="angle" n={1} title="Finding a story worth telling">
        <ul>
          <li>A founder story with a real struggle.</li>
          <li>A local craft, material or community you support.</li>
          <li>Data only you have: “What 10,000 orders tell us about how Dhaka shops”.</li>
          <li>A trend you are part of, explained simply.</li>
          <li>A milestone with meaning, not just a number.</li>
        </ul>
      </Section>
      <Section id="pitch" n={2} title="Pitching simply">
        <Steps
          steps={[
            {
              title: 'Find the right person',
              body: 'A reporter who covers business, lifestyle or startups.',
            },
            {
              title: 'Write a short email',
              body: 'Three to five sentences: the story, why now, why their readers care.',
            },
            { title: 'Offer what they need', body: 'Good photos, a quote, a phone number.' },
            { title: 'Follow up once', body: 'Then move on politely.' },
          ]}
        />
        <Callout tone="tip">
          Local business pages, startup newsletters and podcasts are easier to reach than big
          newspapers, and often read by exactly the right people.
        </Callout>
      </Section>
      <Section id="use" n={3} title="Using coverage">
        <p>
          Add “As featured in” to your site, share it on social, and use quotes in ads. Coverage
          with a link also helps SEO. See{' '}
          <Link to="/blog/earn-backlinks-small-brand">earning backlinks</Link>.
        </p>
      </Section>
      <InlineCta
        title="Have a story worth telling?"
        body="Book a free call. Brand strategy is part of what we do."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Should I pay for articles?',
              a: 'Paid placements should be labelled as sponsored. Earned coverage carries more trust.',
            },
            {
              q: 'Do press releases still work?',
              a: 'Rarely on their own. A personal pitch to the right person works better.',
            },
          ]}
        />
      </Section>
    </>
  );
}
