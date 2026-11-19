import { Link } from 'react-router';
import { FaqList, InlineCta, Lead, Section, Steps } from '../../components/article';
import { Versus } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        A link from another website is a little vote of confidence. The trick is getting real ones.
      </Lead>
      <Section id="ideas" n={1} title="Ideas that work for small brands">
        <Steps
          steps={[
            {
              title: 'Suppliers and partners',
              body: 'Ask manufacturers, couriers or platforms you use to list you as a client or partner.',
            },
            {
              title: 'Local press',
              body: 'Share a genuine story: a founder journey, a local material, a community project.',
            },
            {
              title: 'Useful resources',
              body: 'A size guide, a care guide or a calculator that others want to link to.',
            },
            {
              title: 'Creators and bloggers',
              body: 'Collaborations often include a link in the description or post.',
            },
            {
              title: 'Events and sponsorships',
              body: 'University events and fairs often list sponsors with links.',
            },
            {
              title: 'Directories that people use',
              body: 'Well-known local business listings, not spammy link farms.',
            },
          ]}
        />
      </Section>
      <Section id="avoid" n={2} title="What to avoid">
        <Versus
          left={{
            title: 'Safe',
            points: [
              'Links you earned with real value',
              'Partner and press mentions',
              'Relevant directories',
              'Creator collaborations (marked as sponsored when paid)',
            ],
          }}
          right={{
            title: 'Risky',
            points: [
              'Buying links in bulk',
              'Link exchanges at scale',
              'Comment spam',
              'Private blog networks',
            ],
          }}
        />
      </Section>
      <Section id="mentions" n={3} title="Mentions count too">
        <p>
          Even unlinked mentions of your brand on trusted sites help AI tools and search engines
          connect your name with your topic. See{' '}
          <Link to="/blog/get-found-in-chatgpt-ai-search">getting found in AI search</Link>.
        </p>
      </Section>
      <InlineCta
        title="Want a link-building plan that is safe?"
        body="Book a free call. We will suggest a few realistic opportunities."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'How many links do I need?',
              a: 'Quality beats quantity. A few relevant, trusted links can matter more than hundreds of weak ones.',
            },
            {
              q: 'Should paid links be marked?',
              a: 'Yes. Google asks for paid links to use rel="sponsored".',
            },
          ]}
        />
      </Section>
    </>
  );
}
