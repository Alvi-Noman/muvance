import { Link } from 'react-router';
import { Callout, CompareTable, FaqList, InlineCta, Lead, Section } from '../../components/article';
import { Checklist } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        For a new store, the biggest competitor is not another brand. It is the customer’s fear of
        being cheated.
      </Lead>
      <Section id="signals" n={1} title="Signals that build trust">
        <Checklist
          items={[
            'A real phone number that someone answers',
            'A physical address or clear business details',
            'Real customer reviews with photos',
            'Cash on delivery or a clear refund policy',
            'Real product photos, not only supplier images',
            'A clear exchange and return policy',
            'Active, recent social media',
            'Fast, polite replies to messages',
          ]}
          verdicts={[
            'Strangers will hesitate. Start at the top of the list.',
            'Getting there.',
            'Strong trust foundation.',
          ]}
        />
      </Section>
      <Section id="where" n={2} title="Where to show them">
        <CompareTable
          columns={['Place', 'Show', 'Why']}
          rows={[
            ['Ads', 'Real photos, reviews, COD', 'Trust before the click'],
            ['Product page', 'Reviews, return policy, delivery days', 'Trust at the decision'],
            ['Checkout', 'Phone number, payment options', 'Trust at the commitment'],
            ['Footer', 'Address, policies, social links', 'Trust for the careful shopper'],
          ]}
        />
      </Section>
      <Section id="early" n={3} title="Getting your first reviews">
        <p>
          Ask your first customers personally. Send a short message after delivery and make
          reviewing easy. See{' '}
          <Link to="/blog/collect-and-show-customer-reviews">collecting reviews</Link>.
        </p>
        <Callout tone="warning">
          Never post fake reviews. They are easy to spot, break platform rules and destroy the trust
          you are trying to build.
        </Callout>
      </Section>
      <InlineCta
        title="Want a trust check of your store?"
        body="Book a free call. We will look at it the way a nervous first-time buyer would."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Do trust badges help?',
              a: 'Badges from recognised payment or delivery partners can. Made-up badges do not.',
            },
            {
              q: 'Does a nice design build trust?',
              a: 'It helps. A clean, consistent store looks more established.',
            },
          ]}
        />
      </Section>
    </>
  );
}
