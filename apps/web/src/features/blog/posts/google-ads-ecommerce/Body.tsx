import {
  Callout,
  CompareTable,
  FaqList,
  InlineCta,
  Lead,
  Section,
  Steps,
} from '../../components/article';
import { Versus } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        Meta finds people who might want your product. Google catches people who are already
        searching for it.
      </Lead>
      <Section id="difference" n={1} title="The key difference">
        <Versus
          left={{
            title: 'Meta',
            points: [
              'Creates demand',
              'Targets people by predicted interest',
              'Creative is everything',
              'Great for discovery and impulse',
            ],
          }}
          right={{
            title: 'Google Search',
            points: [
              'Captures existing demand',
              'Targets what people type',
              'Keywords and landing pages matter most',
              'Great for high-intent searches',
            ],
          }}
        />
      </Section>
      <Section id="types" n={2} title="Campaign types for eCommerce">
        <CompareTable
          columns={['Type', 'What it does', 'Good starting use']}
          rows={[
            [
              'Search',
              'Text ads on search results',
              'Your brand name and high-intent product searches',
            ],
            [
              'Performance Max',
              'One campaign across Google’s channels, run by automation',
              'Once tracking is solid and you have conversion data',
            ],
            ['YouTube (video)', 'Video ads on YouTube', 'Awareness and remarketing'],
            [
              'Shopping',
              'Product ads with image and price',
              'Check if it is available for your country first',
            ],
          ]}
        />
      </Section>
      <Section id="start" n={3} title="Starting without waste">
        <Steps
          steps={[
            {
              title: 'Set up conversion tracking',
              body: 'Purchases, ideally through Google Tag Manager or your platform’s integration.',
            },
            { title: 'Start with Search', body: 'A small set of specific keywords.' },
            {
              title: 'Add negative keywords',
              body: 'Block “free”, “job”, “wholesale” and anything irrelevant.',
            },
            {
              title: 'Check the search terms report weekly',
              body: 'See what people actually typed.',
            },
            { title: 'Expand slowly', body: 'Into more keywords, then Performance Max.' },
          ]}
        />
        <Callout tone="tip">
          Bidding on your own brand name is often cheap and protects you from competitors appearing
          above you.
        </Callout>
      </Section>
      <InlineCta
        title="Want to test Google alongside Meta?"
        body="Book a free call. We will look at search demand for your products."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Is Google better than Meta?',
              a: 'Neither is better. They do different jobs. Many stores use both.',
            },
            {
              q: 'How much should I start with?',
              a: 'Enough to get meaningful clicks on your main keywords. Check keyword costs in Keyword Planner first.',
            },
          ]}
        />
      </Section>
    </>
  );
}
