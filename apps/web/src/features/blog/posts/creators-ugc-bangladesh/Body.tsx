import {
  Callout,
  CompareTable,
  FaqList,
  InlineCta,
  KeyTakeaways,
  Lead,
  Prose,
  Section,
  Steps,
} from '../../components/article';
import { Checklist } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        UGC (user-generated content) ads look like a real customer talking about your product. They
        often outperform polished studio ads. The trick is getting good ones, reliably, without
        chaos.
      </Lead>
      <Prose>
        <p>
          In Bangladesh you can work with micro-creators, customers who love your product, or
          influencers with big followings. They are different deals with different strengths.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'For ads, you usually want content, not reach. Small creators are fine.',
            'Brief clearly: the hook ideas, the key points and what to avoid.',
            'Agree usage rights in writing, including running it as a paid ad.',
            'Get several hooks and versions from each shoot.',
          ]}
        />
      </div>

      <Section id="types" n={1} title="Creators, customers and influencers">
        <CompareTable
          columns={['Who', 'Best for', 'Watch out for']}
          rows={[
            [
              'UGC creators',
              'Natural-looking ads made to order',
              'Quality varies; check past work',
            ],
            [
              'Happy customers',
              'The most believable content',
              'Inconsistent quality; ask nicely, reward them',
            ],
            [
              'Influencers',
              'Reach and credibility with their audience',
              'Higher cost; their content may not suit ads',
            ],
          ]}
        />
      </Section>

      <Section id="brief" n={2} title="How to brief a creator">
        <Steps
          steps={[
            {
              title: 'Who the product is for',
              body: 'One sentence about the buyer and their problem.',
            },
            { title: 'Three hook ideas', body: 'Ask them to film all three, so you can test.' },
            {
              title: 'Key points to mention',
              body: 'Two or three at most: the benefit, a proof point, the offer.',
            },
            {
              title: 'Must-avoid list',
              body: 'Health claims, competitor names, prices that may change.',
            },
            {
              title: 'Technical basics',
              body: 'Vertical, good light, clear sound, a few seconds of the product on its own.',
            },
          ]}
        />
        <Callout tone="tip">
          Ask for raw clips as well as the edited video. Your editor can cut new versions from them
          for months.
        </Callout>
      </Section>

      <Section id="rights" n={3} title="Before you pay: the agreement checklist">
        <Checklist
          items={[
            'Fee and what it includes (number of videos, hooks, revisions)',
            'Right to use it as a paid ad, and for how long',
            'Right to edit and cut it into new versions',
            'Delivery date and format',
            'Whether you can run it from their profile (partnership ads)',
          ]}
          verdicts={[
            'Too loose. Write it down before filming.',
            'Close. Add the missing points.',
            'Clear agreement. Good to go.',
          ]}
        />
      </Section>

      <InlineCta
        title="Want UGC without the chasing?"
        body="Our creative team plans, briefs and edits creator content for ads. Book a free call to talk through your product."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Do I need a famous influencer?',
              a: 'For ads, usually not. A believable person explaining the product clearly often beats a big name.',
            },
            {
              q: 'What are partnership ads?',
              a: 'Ads that run from the creator’s profile with your brand, with their permission. They can feel more trustworthy than ads from your page.',
            },
          ]}
        />
      </Section>
    </>
  );
}
