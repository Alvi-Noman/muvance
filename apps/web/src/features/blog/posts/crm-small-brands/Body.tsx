import { Link } from 'react-router';
import { CompareTable, FaqList, InlineCta, Lead, Section } from '../../components/article';
import { Checklist } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        If customer information lives in five Messenger inboxes and two notebooks, you do not know
        your customers. You remember some of them.
      </Lead>
      <Section id="need" n={1} title="Signs you need one">
        <Checklist
          items={[
            'Orders come from several channels (site, Messenger, WhatsApp, phone)',
            'You cannot quickly see a customer’s past orders',
            'Follow-ups depend on someone remembering',
            'More than one person handles customers',
            'You want to message customers by what they bought',
          ]}
          verdicts={[
            'A good spreadsheet is fine for now.',
            'Start looking at simple tools.',
            'A CRM will pay for itself.',
          ]}
        />
      </Section>
      <Section id="features" n={2} title="Features that matter">
        <CompareTable
          columns={['Feature', 'Why', 'Nice to have or must']}
          rows={[
            [
              'One profile per customer (by phone)',
              'See every order and chat in one place',
              'Must',
            ],
            ['Order and delivery status', 'Know what happened', 'Must'],
            ['Tags and segments', 'Message the right people', 'Must'],
            ['Messaging integration', 'WhatsApp, SMS, email from one place', 'Nice to have'],
            ['Automations', 'Reminders and follow-ups', 'Nice to have'],
          ]}
        />
      </Section>
      <Section id="move" n={3} title="Moving over">
        <p>
          Clean your data first: one phone number format, merged duplicates. Import past orders,
          then make every new order go into the CRM. The first month is the hardest. See{' '}
          <Link to="/blog/first-party-data-small-brands">first-party data</Link>.
        </p>
      </Section>
      <InlineCta
        title="Want help choosing or setting up a CRM?"
        body="Book a free call. We will look at how you take orders today."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Is my store platform already a CRM?',
              a: 'Partly. Shopify and WooCommerce keep customer records, but miss Messenger and phone orders unless you add them.',
            },
            {
              q: 'How much does a CRM cost?',
              a: 'From free tiers to monthly fees per user. Start small.',
            },
          ]}
        />
      </Section>
    </>
  );
}
