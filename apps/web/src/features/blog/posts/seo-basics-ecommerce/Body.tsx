import { Link } from 'react-router';
import {
  Callout,
  FaqList,
  Figure,
  InlineCta,
  KeyTakeaways,
  Lead,
  Prose,
  Section,
  Steps,
} from '../../components/article';
import { LineChart } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        SEO feels endless because it is. The trick is doing the handful of things that move the
        needle, and ignoring the rest until later.
      </Lead>
      <Prose>
        <p>
          Most small stores live on paid ads. That works, but every sale costs money. Search traffic
          is slower to build and then keeps coming without a bill each day. Even a modest amount of
          it lowers your average cost per order.
        </p>
      </Prose>
      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Fix the basics first: indexing, speed, titles.',
            'Target what people actually search for, in their words.',
            'Write for questions customers ask before buying.',
            'Expect months, not weeks. Keep at it.',
          ]}
        />
      </div>
      <Section id="order" n={1} title="The order we would do things in">
        <Steps
          steps={[
            {
              title: 'Get indexed',
              body: (
                <>
                  Set up{' '}
                  <Link to="/blog/google-search-console-beginners">Google Search Console</Link>,
                  submit your sitemap, fix errors.
                </>
              ),
            },
            {
              title: 'Fix the basics',
              body: 'Fast mobile pages, unique titles and descriptions, one clear heading per page.',
            },
            {
              title: 'Name things the way people search',
              body: (
                <>
                  Category and product names that match real searches. See{' '}
                  <Link to="/blog/keyword-research-bangla-english">keyword research</Link>.
                </>
              ),
            },
            {
              title: 'Strengthen product and category pages',
              body: 'Useful text, real photos, FAQs, reviews.',
            },
            {
              title: 'Answer questions with content',
              body: 'Guides that help people choose, linked to products.',
            },
            {
              title: 'Earn mentions and links',
              body: 'From suppliers, press, creators and partners.',
            },
          ]}
        />
      </Section>
      <Section id="time" n={2} title="How long it takes">
        <Figure
          title="Organic visits per month after starting SEO (example)"
          caption="Slow at first, then compounding. Many give up around month three, just before it starts working."
        >
          <LineChart
            labels={['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11', 'M12']}
            series={[
              {
                name: 'Organic visits',
                values: [300, 340, 420, 520, 700, 950, 1200, 1500, 1900, 2300, 2700, 3200],
                tone: 'accent',
              },
            ]}
          />
        </Figure>
      </Section>
      <Section id="skip" n={3} title="What can wait">
        <ul>
          <li>Chasing very competitive words like “online shopping”.</li>
          <li>Buying links. It is against Google’s rules and can backfire.</li>
          <li>Perfect scores in speed tools. Fast enough on a real phone is what matters.</li>
          <li>
            Publishing lots of thin articles. A few genuinely useful ones beat many weak ones.
          </li>
        </ul>
        <Callout tone="local">
          Many Bangladeshi shoppers search in English for product types and in Bangla or Banglish
          for questions. Cover both where it makes sense.
        </Callout>
      </Section>
      <InlineCta
        title="Want a realistic SEO plan for your store?"
        body="Book a free call. We will look at where you stand and what to do first."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Is SEO worth it if I sell on Facebook?',
              a: 'Yes, if you have a website. People who search are often closer to buying than people scrolling.',
            },
            {
              q: 'Can I do SEO myself?',
              a: 'The basics, yes. Bigger stores and competitive niches benefit from specialist help.',
            },
          ]}
        />
      </Section>
    </>
  );
}
