import { Link } from 'react-router';
import { Callout, FaqList, InlineCta, Lead, Section } from '../../components/article';
import { Checklist } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        TikTok can put a brand-new account in front of thousands of people with one video. It can
        also eat hours with nothing to show for it.
      </Lead>
      <Section id="fit" n={1} title="Is your brand a fit?">
        <Checklist
          items={[
            'Your customers are mostly under 35',
            'Your product is visual or easy to demonstrate',
            'You can make 3+ short videos a week',
            'Someone on the team is comfortable on camera',
            'Your price point suits impulse or quick decisions',
          ]}
          verdicts={[
            'Maybe later. Focus on Meta first.',
            'Worth a 60-day test.',
            'Strong fit. Start now.',
          ]}
        />
      </Section>
      <Section id="content" n={2} title="What works for brands">
        <ul>
          <li>Showing the product being used, not posed.</li>
          <li>Trends adapted to your product, not copied blindly.</li>
          <li>Packing orders, behind the scenes, funny customer moments.</li>
          <li>Honest answers to common questions.</li>
        </ul>
        <Callout tone="tip">
          TikTok rewards native-feeling video. Content that looks like an ad often gets scrolled
          past quickly.
        </Callout>
      </Section>
      <Section id="sales" n={3} title="Does it bring sales?">
        <p>
          Many TikTok viewers do not click straight through; they search for you later or message
          you on Facebook. Ask customers where they heard of you. See{' '}
          <Link to="/blog/post-purchase-survey-questions">post-purchase surveys</Link>.
        </p>
        <p>
          For paid options, see{' '}
          <Link to="/blog/tiktok-ads-vs-meta-ads">TikTok ads vs Meta ads</Link>.
        </p>
      </Section>
      <InlineCta
        title="Thinking about TikTok?"
        body="Book a free call. We will tell you honestly whether it fits your brand."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'How long before results show?',
              a: 'Give it 60 days of consistent posting before judging.',
            },
            {
              q: 'Can I reuse Reels on TikTok?',
              a: 'Yes, ideally without watermarks from the other app.',
            },
          ]}
        />
      </Section>
    </>
  );
}
