import { Link } from 'react-router';
import { FaqList, Figure, InlineCta, Lead, Section } from '../../components/article';
import { BarList, Flow } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        Most marketing ends at the order. For the customer, that is when the anxious part begins.
      </Lead>
      <Section id="timeline" n={1} title="The post-purchase timeline">
        <Flow
          nodes={[
            { title: 'Order placed', body: 'Instant confirmation' },
            { title: 'Confirmed', body: 'Call or message' },
            { title: 'Shipped', body: 'Tracking link' },
            { title: 'Delivered', body: 'Great unboxing', highlight: true },
            { title: 'Day 3–7', body: 'How is it? Review ask' },
            { title: 'Later', body: 'Reorder or new arrival' },
          ]}
        />
      </Section>
      <Section id="anxiety" n={2} title="Reduce the anxiety">
        <p>
          Cash-on-delivery customers worry less about payment, but still wonder whether the order is
          real and when it will arrive. Clear updates lower cancellations and “where is my order”
          messages.
        </p>
        <Figure title="Effect of shipping updates (example)">
          <BarList
            items={[
              { label: 'Without updates: delivery rate', value: 80, tone: 'warm' },
              { label: 'With SMS updates: delivery rate', value: 86, tone: 'accent' },
            ]}
            format={(v) => `${v}%`}
          />
        </Figure>
      </Section>
      <Section id="follow-up" n={3} title="The follow-up">
        <ul>
          <li>Ask how it went, a few days after delivery.</li>
          <li>
            Make reviews easy: one link, one tap. See{' '}
            <Link to="/blog/collect-and-show-customer-reviews">collecting reviews</Link>.
          </li>
          <li>Offer help with using or caring for the product.</li>
          <li>Suggest what to try next, based on what they bought.</li>
        </ul>
        <p>
          For the box itself, see{' '}
          <Link to="/blog/unboxing-experience-packaging">unboxing and packaging</Link>.
        </p>
      </Section>
      <InlineCta
        title="Want a smoother after-order experience?"
        body="Book a free call. Operations support is one of our service fields."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Is this marketing or operations?',
              a: 'Both. It is where they meet, and it drives repeat sales.',
            },
            {
              q: 'How much does it cost?',
              a: 'Mostly SMS fees and some staff time. Usually far cheaper than finding new customers.',
            },
          ]}
        />
      </Section>
    </>
  );
}
