import { Callout, FaqList, Figure, InlineCta, Lead, Section } from '../../components/article';
import { BarList } from '../../components/viz';

export function Body() {
  return (
    <>
      <Lead>
        A list of 2,000 customers who opted in is worth more than 50,000 followers you cannot reach.
      </Lead>
      <Section id="where" n={1} title="Where to collect contacts">
        <Figure title="Sign-ups by source in a month (example)">
          <BarList
            items={[
              { label: 'Checkout (opt-in box)', value: 410, tone: 'accent' },
              { label: 'Website pop-up', value: 160, tone: 'ink' },
              { label: 'QR code in the parcel', value: 75, tone: 'ink' },
              { label: 'Guide or quiz download', value: 60, tone: 'ink' },
              { label: 'Live sessions and events', value: 30, tone: 'muted' },
            ]}
          />
        </Figure>
      </Section>
      <Section id="reason" n={2} title="Give a real reason to join">
        <ul>
          <li>Early access to new collections.</li>
          <li>A useful guide: sizing, care, recipes, routines.</li>
          <li>Restock alerts for sold-out items.</li>
          <li>A small first-order offer, if your margins allow.</li>
        </ul>
        <Callout tone="tip">
          Ask for WhatsApp or phone permission at the same time, if you plan to use it. Make each
          choice separate and clear.
        </Callout>
      </Section>
      <Section id="keep" n={3} title="Keep the list healthy">
        <p>
          Remove addresses that bounce, stop emailing people who have not opened anything in a long
          time, and never buy lists. A smaller, engaged list gets better delivery and results.
        </p>
      </Section>
      <InlineCta
        title="Want help growing your own audience?"
        body="Book a free call. We will find the easiest sign-up points on your store."
      />
      <Section id="faq" n={4} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'Are pop-ups annoying?',
              a: 'They can be. Delay them, make them easy to close, and offer something useful.',
            },
            {
              q: 'Phone or email?',
              a: 'Both are useful. Phone is often easier in Bangladesh; email is cheaper to message at scale.',
            },
          ]}
        />
      </Section>
    </>
  );
}
