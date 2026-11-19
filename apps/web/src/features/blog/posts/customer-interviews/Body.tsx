import { Callout, FaqList, InlineCta, Lead, Section } from '../../components/article';

export function Body() {
  return (
    <>
      <Lead>
        Five honest conversations with customers can change your next month of ads. It costs nothing
        but a little courage to pick up the phone.
      </Lead>
      <Section id="who" n={1} title="Who to call">
        <p>
          Pick people who bought in the last two to four weeks, while they still remember why. Mix
          first-time buyers and repeat buyers, and if you can, a couple of people who cancelled.
        </p>
        <p>
          Send a short message first: “We’re trying to improve. Could we call you for 10 minutes?
          We’ll send a small thank-you voucher.” Most brands find enough people say yes.
        </p>
      </Section>
      <Section id="questions" n={2} title="The 10 questions">
        <ol>
          <li>What made you start looking for something like this?</li>
          <li>What were you using before?</li>
          <li>Where did you first see us?</li>
          <li>What almost stopped you from ordering?</li>
          <li>What did you compare us with?</li>
          <li>What made you finally decide?</li>
          <li>How was delivery and unboxing?</li>
          <li>What do you use it for now?</li>
          <li>If we disappeared, what would you use instead?</li>
          <li>Who else do you know who would like this?</li>
        </ol>
        <Callout tone="tip">
          Ask about the past, not the future. “Would you buy a blue one?” gets polite yeses. “When
          did you last buy something like this?” gets the truth.
        </Callout>
      </Section>
      <Section id="listen" n={3} title="How to listen">
        <ul>
          <li>Talk less than a third of the time.</li>
          <li>When they say something interesting, ask “Tell me more about that.”</li>
          <li>Do not defend the product. You are there to learn, not to sell.</li>
          <li>Write down exact phrases, not summaries.</li>
        </ul>
      </Section>
      <Section id="after" n={4} title="Turning calls into action">
        <p>
          After five calls, patterns appear. Write the top three findings on one page: the trigger
          that starts the search, the main worry, and the deciding factor. Each one becomes a test:
          a new hook, a new product page section, a new offer.
        </p>
      </Section>
      <InlineCta
        title="Would you like us to run these calls?"
        body="Our team does customer calls as part of brand strategy. Book a free call to talk it through."
      />
      <Section id="faq" n={5} title="Questions people ask">
        <FaqList
          items={[
            {
              q: 'How many interviews do I need?',
              a: 'Five to eight usually shows the main patterns. After that you hear the same things again.',
            },
            { q: 'Should I record them?', a: 'Only with permission. Notes are usually enough.' },
          ]}
        />
      </Section>
    </>
  );
}
