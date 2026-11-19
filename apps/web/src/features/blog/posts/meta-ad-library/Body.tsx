import { Link } from 'react-router';
import { Callout, FaqList, InlineCta, Lead, Section, Steps } from '../../components/article';

export function Body() {
  return (
    <>
      <Lead>Your competitors’ ads are not a secret. They are in a free, searchable library.</Lead>
      <Section id="how" n={1} title="How to search it">
        <Steps
          steps={[
            {
              title: 'Open the Ad Library',
              body: 'Search “Meta Ad Library” or go to facebook.com/ads/library.',
            },
            { title: 'Choose country and ad category', body: 'Bangladesh, All ads.' },
            {
              title: 'Search a brand or keyword',
              body: 'A competitor name, or a product like “panjabi”.',
            },
            { title: 'Filter', body: 'By active status, platform and media type.' },
          ]}
        />
      </Section>
      <Section id="signals" n={2} title="Spotting ads that probably work">
        <ul>
          <li>
            <strong>Long-running ads.</strong> An ad live for months is likely profitable.
          </li>
          <li>
            <strong>Many versions of one idea.</strong> Brands make variations of winners.
          </li>
          <li>
            <strong>Repeated formats.</strong> If a competitor keeps making UGC-style videos, they
            probably work for them.
          </li>
        </ul>
        <Callout tone="warning">
          The library does not show results or spend for most commercial ads. Running time is a
          clue, not proof.
        </Callout>
      </Section>
      <Section id="use" n={3} title="Using it without copying">
        <p>
          Collect angles, hooks and formats into a swipe file. Then ask: what do they all miss?
          Which customer worry do none of them answer? That gap is where your ad stands out. See{' '}
          <Link to="/blog/competitor-analysis-small-brand">competitor analysis</Link>.
        </p>
      </Section>
      <InlineCta
        title="Want a competitor ad review?"
        body="Book a free call. We will look at what is running in your category."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            { q: 'Can competitors see my ads too?', a: 'Yes. Everyone’s active ads are visible.' },
            {
              q: 'Is copying an ad allowed?',
              a: 'Copying someone’s creative or wording can break copyright and platform rules. Learn from it; make your own.',
            },
          ]}
        />
      </Section>
    </>
  );
}
