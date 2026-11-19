import { Callout, CompareTable, FaqList, InlineCta, Lead, Section } from '../../components/article';

export function Body() {
  return (
    <>
      <Lead>
        On LinkedIn, people follow people. Your company page matters less than what you and your
        team share.
      </Lead>
      <Section id="who" n={1} title="Who it is for">
        <p>
          LinkedIn suits businesses selling to other businesses: agencies, software, wholesale,
          manufacturing, logistics, consulting. It is also useful for hiring and for founders
          building credibility with investors and partners.
        </p>
      </Section>
      <Section id="post" n={2} title="What to post">
        <CompareTable
          columns={['Post type', 'Example', 'Why it works']}
          rows={[
            ['Lessons learned', '“What we learned from 50 client projects”', 'Useful and credible'],
            ['Behind the scenes', 'How a project was delivered', 'Shows how you work'],
            ['Opinions', 'A clear view on an industry trend', 'Starts conversations'],
            ['Results, with permission', 'A client case with real numbers', 'Proof'],
          ]}
        />
        <Callout tone="tip">
          Write in short lines with white space. Many people read LinkedIn on a phone.
        </Callout>
      </Section>
      <Section id="plan" n={3} title="A simple plan">
        <ul>
          <li>Founder posts two to three times a week.</li>
          <li>Two or three team members post once a week.</li>
          <li>Company page reshares the best posts and shares jobs and news.</li>
          <li>Comment thoughtfully on posts by potential clients and partners.</li>
        </ul>
      </Section>
      <InlineCta
        title="Selling to businesses?"
        body="Book a free call. We will talk through your B2B marketing options."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Are LinkedIn ads worth it?',
              a: 'They are usually more expensive per click, so they suit higher-value B2B offers.',
            },
            {
              q: 'Should I post in Bangla?',
              a: 'Mostly English on LinkedIn in Bangladesh, but test what your audience engages with.',
            },
          ]}
        />
      </Section>
    </>
  );
}
