import { Link } from 'react-router';
import {
  Callout,
  FaqList,
  Figure,
  InlineCta,
  Lead,
  Prose,
  Section,
} from '../../components/article';
import { BarList, Checklist } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        Ask ten marketers for a good conversion rate and you will hear “2 to 3%” from most of them.
        That number is close to useless on its own.
      </Lead>
      <Prose>
        <p>
          Conversion rate is the share of visitors (or sessions) that place an order. It depends
          heavily on who the visitors are, what you sell and how much it costs. Comparing yourself
          with an average from a different country, price point and traffic mix tells you very
          little.
        </p>
      </Prose>
      <Section id="depends" n={1} title="What it depends on">
        <Figure
          title="Conversion rate by traffic source, same store (example)"
          caption="Returning customers and branded searches always convert better. Cold ad traffic converts lower. That is normal."
        >
          <BarList
            items={[
              { label: 'Returning customers', value: 6.5, tone: 'accent' },
              { label: 'Search for your brand', value: 5.2, tone: 'accent' },
              { label: 'Retargeting ads', value: 3.4, tone: 'ink' },
              { label: 'Cold Meta ads', value: 1.3, tone: 'ink' },
              { label: 'Cold TikTok ads', value: 0.8, tone: 'warm' },
            ]}
            format={(v) => `${v}%`}
          />
        </Figure>
        <p>
          Price matters too. A ৳500 accessory and a ৳15,000 appliance should not have the same
          conversion rate.
        </p>
      </Section>
      <Section id="compare" n={2} title="The only comparison that counts">
        <p>
          Compare your conversion rate with your own past, split by source and device. If cold
          mobile traffic converted at 1.6% last quarter and 1.1% now, something changed. That is a
          signal worth chasing.
        </p>
        <Callout tone="tip">
          In GA4, the default is sessions, not visitors. Make sure you compare like with like over
          time.
        </Callout>
      </Section>
      <Section id="problem" n={3} title="Is conversion rate your real problem?">
        <Checklist
          items={[
            'People add to cart, but few check out',
            'Mobile pages take more than 3 seconds to load',
            'Delivery charge only appears at the end',
            'Many messages ask the same question the page could answer',
            'Ads promise something the page does not show',
          ]}
          verdicts={[
            'Probably not the page. Look at the ads and offer.',
            'Some page fixes worth testing.',
            'Yes, fix the page before spending more on ads.',
          ]}
        />
        <p>
          For the fixes themselves, see{' '}
          <Link to="/blog/landing-page-fixes-ad-clicks-no-sales">landing page fixes</Link> and{' '}
          <Link to="/blog/product-page-that-converts-on-mobile">
            product pages that convert on mobile
          </Link>
          .
        </p>
      </Section>
      <InlineCta
        title="Want a conversion review of your store?"
        body="Book a free call. We will look at your store on a phone, the way your customers do."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Does message-based selling have a conversion rate?',
              a: 'Yes: conversations that become confirmed orders. Track it the same way, by source.',
            },
            {
              q: 'Can a conversion rate be too high?',
              a: 'If it is very high, you may be spending too little on reaching new people. Growth usually means slightly lower conversion on colder traffic.',
            },
          ]}
        />
      </Section>
    </>
  );
}
