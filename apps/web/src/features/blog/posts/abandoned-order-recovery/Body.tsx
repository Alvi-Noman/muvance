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

export function Body() {
  return (
    <>
      <Lead>
        Someone picked a product, typed their phone number into your checkout, and left. That is not
        a lost customer. That is a warm lead with a phone number, and you can call them.
      </Lead>
      <Prose>
        <p>
          In Bangladesh, a quick, friendly call or WhatsApp message often recovers orders that email
          never would. Here is how to do it without being pushy.
        </p>
      </Prose>

      <div className="mt-10">
        <KeyTakeaways
          items={[
            'Save checkout details as they are typed, so you have the phone number.',
            'Contact within an hour or two, while they still remember.',
            'Help first: ask if something went wrong or if they have a question.',
            'Stop after two attempts. Respect people who are not interested.',
          ]}
        />
      </div>

      <Section id="capture" n={1} title="Capture the details first">
        <p>
          Many checkouts only save an order when the final button is pressed. Set yours to save the
          name and phone as soon as they are entered (most store platforms have an app or setting
          for this). Tell people in your privacy policy that you may contact them about their order.
        </p>
      </Section>

      <Section id="sequence" n={2} title="A simple recovery sequence">
        <Steps
          steps={[
            {
              title: 'Within 1–2 hours: a short call',
              body: '"Assalamu alaikum, we saw you were ordering the black shirt. Did something go wrong, or can we help with size?"',
            },
            {
              title: 'If no answer: one WhatsApp message',
              body: 'Product name, photo, price, and a link to finish the order.',
            },
            {
              title: 'Next day: a gentle reminder',
              body: 'Mention delivery time or the exchange policy, the usual doubts.',
            },
            {
              title: 'Then stop',
              body: 'Two or three touches are enough. More feels like pressure.',
            },
          ]}
        />
        <Callout tone="tip" title="Listen to the reasons">
          Write down why people did not finish: delivery charge, size doubts, price, just browsing.
          Those notes tell you what to fix on the page.
        </Callout>
      </Section>

      <Section id="channels" n={3} title="Which channel for what">
        <CompareTable
          columns={['Channel', 'Strength', 'Weakness']}
          rows={[
            ['Phone call', 'Personal, answers doubts live', 'Takes staff time'],
            [
              'WhatsApp',
              'Photo and link, easy to reply',
              'Needs business messaging rules followed',
            ],
            ['SMS', 'Reaches everyone', 'Short, easy to ignore'],
            ['Retargeting ads', 'Automatic', 'Slower, costs ad spend'],
          ]}
        />
      </Section>

      <InlineCta
        title="Want a call centre that does this for you?"
        body="Our operational support includes order confirmation and recovery calls. Book a free call to talk it through."
      />

      <Section id="faq" n={4} title="Things people ask us">
        <FaqList
          items={[
            {
              q: 'Is it okay to call people who did not finish ordering?',
              a: 'Yes, if you are polite, helpful and stop when asked. Many people appreciate the help.',
            },
            {
              q: 'Should I offer a discount to recover the order?',
              a: 'Only as a last resort. Most abandoned orders come back with an answered question, not a discount.',
            },
          ]}
        />
      </Section>
    </>
  );
}
