import { Link } from 'react-router';
import {
  CompareTable,
  FaqList,
  InlineCta,
  Lead,
  Prose,
  PullQuote,
  Section,
} from '../../components/article';

export function Body() {
  return (
    <>
      <Lead>
        Nobody wakes up wanting a power bank. They want their phone to last through a long day so
        they do not miss a call from a customer.
      </Lead>
      <Prose>
        <p>
          Jobs-to-be-done is a way of thinking popularised by Harvard professor Clayton Christensen.
          The idea: customers “hire” a product to get a job done. When you understand the job, you
          understand who your real competitors are and what to say.
        </p>
      </Prose>
      <Section id="job" n={1} title="Finding the job">
        <p>
          Ask recent customers one question: “What was going on in your life when you decided to buy
          this?” The answers sound like small stories, and that is the point.
        </p>
        <CompareTable
          columns={['Product', 'What we assumed', 'The real job']}
          rows={[
            [
              'Kids’ water bottle',
              'Parents want a cute bottle',
              'Stop losing bottles at school every month',
            ],
            ['Panjabi', 'Wants a nice outfit', 'Look put-together at Eid photos with family'],
            ['Office bag', 'Wants a stylish bag', 'Carry a laptop on a CNG without worrying'],
          ]}
        />
      </Section>
      <Section id="competitors" n={2} title="Your real competitors are not who you think">
        <p>
          Once you know the job, you see that you compete with anything else that does it. A
          meal-prep service competes with other services, but also with ordering from Foodpanda,
          cooking on Sunday and skipping lunch.
        </p>
        <PullQuote>
          If you only compare yourself to similar products, you miss why people choose the
          alternative.
        </PullQuote>
      </Section>
      <Section id="use" n={3} title="Using the job in your marketing">
        <ul>
          <li>
            <strong>Ads:</strong> open with the situation, not the product. “Lost another school
            bottle?” beats “New kids’ bottle, 500 ml.”
          </li>
          <li>
            <strong>Product page:</strong> show the product doing the job, in a real setting.
          </li>
          <li>
            <strong>Offers:</strong> bundle around the job. Two bottles and a name sticker solves
            “stop losing it” better than a discount.
          </li>
        </ul>
        <p>
          You can pair this with{' '}
          <Link to="/blog/customer-personas-from-real-data">customer personas</Link>: the persona is
          who, the job is why.
        </p>
      </Section>
      <InlineCta
        title="Curious what job your product is hired for?"
        body="Book a free call. We often find a sharper angle in the first half hour."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Is this only for new products?',
              a: 'No. It is often most useful for products that have been selling for a while but have stopped growing.',
            },
            {
              q: 'Can a product have more than one job?',
              a: 'Yes, and each job usually deserves its own ads.',
            },
          ]}
        />
      </Section>
    </>
  );
}
