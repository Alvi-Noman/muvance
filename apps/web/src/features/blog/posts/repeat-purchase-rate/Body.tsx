import { Link } from 'react-router';
import {
  Callout,
  FaqList,
  Figure,
  InlineCta,
  KeyTakeaways,
  Lead,
  Section,
} from '../../components/article';
import { BarList } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>New customers make the headlines. Returning customers pay the bills.</Lead>
      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Measure the share of customers who order again within 90 and 180 days.',
            'The product, the delivery experience and follow-up all drive it.',
            'Small lifts compound: they lower the ad cost you need for every taka of revenue.',
          ]}
        />
      </div>
      <Section id="measure" n={1} title="How to measure it">
        <p>
          Take all customers who made their first order in a given month. Count how many ordered
          again within 90 days. Divide. Do the same for 180 days. Group customers by phone number,
          since many people order without an account.
        </p>
        <Callout tone="tip">
          Do not mix in customers who joined last week. They have not had time to come back yet.
          Cohorts by month keep it fair. See{' '}
          <Link to="/blog/cohort-analysis-for-beginners">cohort analysis</Link>.
        </Callout>
      </Section>
      <Section id="drivers" n={2} title="What drives it">
        <Figure
          title="Repeat rate by first experience (example)"
          caption="Customers whose first order had a problem rarely come back, even when the problem was fixed."
        >
          <BarList
            items={[
              { label: 'Delivered on time, liked it', value: 28, tone: 'accent' },
              { label: 'Delivered late', value: 14, tone: 'ink' },
              { label: 'Wrong size, exchanged', value: 11, tone: 'warm' },
              { label: 'Damaged item', value: 5, tone: 'warm' },
            ]}
            format={(v) => `${v}%`}
          />
        </Figure>
        <p>
          Some products are naturally repeat (skincare, food, baby items). Others are not
          (furniture, a winter jacket). Compare yourself with your own category.
        </p>
      </Section>
      <Section id="lift" n={3} title="Lifting it without discounts">
        <ul>
          <li>Get the first delivery right. It matters more than any message after it.</li>
          <li>Send a reminder when the product is likely to run out.</li>
          <li>Include something in the box: a card, a care guide, a reason to come back.</li>
          <li>Launch new products to existing customers first.</li>
          <li>Ask for a review, and act on what people say.</li>
        </ul>
        <p>
          For the messages themselves, see{' '}
          <Link to="/blog/win-back-campaigns-lapsed-customers">win-back campaigns</Link> and{' '}
          <Link to="/blog/email-marketing-for-online-stores">
            email marketing for online stores
          </Link>
          .
        </p>
      </Section>
      <InlineCta
        title="Want more customers to come back?"
        body="Book a free call. We will look at your repeat rate and the easiest ways to lift it."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Is repeat purchase rate the same as retention?',
              a: 'Close. Retention is a broader idea; repeat purchase rate is the simplest way for a store to measure it.',
            },
            {
              q: 'What is a good repeat rate?',
              a: 'It depends on the product. Track your own trend by month of first purchase.',
            },
          ]}
        />
      </Section>
    </>
  );
}
